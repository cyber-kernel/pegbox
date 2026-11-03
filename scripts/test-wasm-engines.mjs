import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { makeTalkingWav } from '../.kit/pegbox-kit/reference/fixtures/make-fixtures.mjs';

globalThis.self = globalThis;
globalThis.location = { href: 'http://localhost/' };

// Cut helper from reference
function keepSegments(silences, duration, padding) {
  const cuts = [];
  for (const [s, e] of silences) {
    const a = s === 0 ? 0 : s + padding;
    const b = e >= duration - 0.05 ? duration : e - padding;
    if (b - a > 0.05) cuts.push([a, b]);
  }
  const keep = [];
  let cursor = 0;
  for (const [a, b] of cuts) {
    if (a - cursor > 0.05) keep.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (duration - cursor > 0.05) keep.push([cursor, duration]);
  return keep;
}

async function runBenchmark() {
  console.log('--- Phase 0: Testing Hush & Cut pipelines on synthetic audio in WASM ---');
  const coreJsPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js');
  const wasmPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');
  const modelPath = path.resolve('.kit/pegbox-kit/reference/engines-node/voice-cleaner/models/bd.rnnn');

  const coreModule = await import(pathToFileURL(coreJsPath).href);
  const createFFmpegCore = coreModule.default;
  const wasmBinary = fs.readFileSync(wasmPath);

  let logs = [];
  const core = await createFFmpegCore({ wasmBinary });
  core.setLogger((logObj) => {
    const msg = typeof logObj === 'object' ? logObj.message : String(logObj);
    logs.push(msg);
  });

  function execArgs(...args) {
    logs = [];
    const ret = core.exec(...args);
    return { ret, logs: [...logs] };
  }

  // 1. Prepare model in wasm FS
  core.FS.mkdir('/models');
  const modelData = fs.readFileSync(modelPath);
  core.FS.writeFile('/models/bd.rnnn', modelData);
  console.log('Written bd.rnnn to wasm FS /models/bd.rnnn');

  // 2. Generate fixture
  const wavBytes = makeTalkingWav({ seconds: 12, rate: 48000, noise: 0.02 });
  core.FS.writeFile('/input.wav', wavBytes);
  console.log('Generated and loaded 12s test WAV with noise 0.02');

  // 3. Test Hush Pipeline
  console.log('\n--- Testing Hush (Voice Cleaner) in WASM ---');
  const t0Hush = performance.now();

  // Pass 1: measure loudnorm
  const p1Args = ['-hide_banner', '-nostdin', '-y', '-i', '/input.wav',
    '-af', 'highpass=f=85,lowpass=f=14000,arnndn=m=/models/bd.rnnn:mix=1.0,afftdn=nr=12:nf=-45,agate=threshold=0.00398:ratio=2.0:attack=15:release=350:range=0.08:knee=4,equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=20:release=250:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json',
    '-f', 'null', '-'
  ];
  const p1Res = execArgs(...p1Args);
  const allP1Logs = p1Res.logs.join('\n');
  const jm = allP1Logs.match(/\{[^{}]*"input_i"[^{}]*\}/);
  let loudnormParams = 'loudnorm=I=-14:TP=-1.5:LRA=11';
  if (jm) {
    try {
      const m = JSON.parse(jm[0]);
      loudnormParams = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_LRA=${m.input_lra}:measured_TP=${m.input_tp}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
      console.log('Loudnorm pass 1 measured:', m.input_i, 'LUFS');
    } catch (e) {
      console.log('Failed to parse loudnorm JSON:', e);
    }
  }

  // Pass 2: generate clean.wav
  const p2Args = ['-hide_banner', '-nostdin', '-y', '-i', '/input.wav',
    '-af', `highpass=f=85,lowpass=f=14000,arnndn=m=/models/bd.rnnn:mix=1.0,afftdn=nr=12:nf=-45,agate=threshold=0.00398:ratio=2.0:attack=15:release=350:range=0.08:knee=4,equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1:g=2,${loudnormParams},alimiter=limit=0.89:level=false,aresample=48000`,
    '-ar', '48000', '-c:a', 'pcm_s16le', '/clean.wav'
  ];
  execArgs(...p2Args);
  const hushDurationMs = performance.now() - t0Hush;
  const cleanStat = core.FS.stat('/clean.wav');
  console.log(`Hush completed in ${(hushDurationMs / 1000).toFixed(2)}s. Clean wav size: ${cleanStat.size} bytes`);

  // 4. Test Cut Pipeline
  console.log('\n--- Testing Cut (Silence Cutter) in WASM ---');
  const t0Cut = performance.now();
  // silencedetect pass
  const detectArgs = ['-hide_banner', '-nostdin', '-y', '-i', '/input.wav',
    '-af', 'highpass=f=100,lowpass=f=7000,silencedetect=noise=-35dB:d=0.5',
    '-f', 'null', '-'
  ];
  const detectRes = execArgs(...detectArgs);
  const silences = [];
  let sStart = null;
  for (const line of detectRes.logs) {
    const sm = line.match(/silence_start:\s*(-?[\d.]+)/);
    const em = line.match(/silence_end:\s*([\d.]+)/);
    if (sm) sStart = Math.max(0, parseFloat(sm[1]));
    if (em && sStart !== null) {
      silences.push([sStart, parseFloat(em[1])]);
      sStart = null;
    }
  }
  if (sStart !== null) silences.push([sStart, 12.0]);
  console.log('Silences detected:', silences);

  const keep = keepSegments(silences, 12.0, 0.15);
  console.log('Segments to keep:', keep);
  const keptDuration = keep.reduce((acc, [a, b]) => acc + (b - a), 0);
  const removedDuration = 12.0 - keptDuration;
  console.log(`Original: 12.0s -> New: ${keptDuration.toFixed(2)}s (removed ${removedDuration.toFixed(2)}s)`);

  const expr = keep.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
  const aexpr = `aselect='${expr}',asetpts=N/SR/TB`;
  core.FS.writeFile('/graph.txt', `[0:a:0]${aexpr}[a]`);

  execArgs('-hide_banner', '-nostdin', '-y', '-i', '/input.wav',
    '-filter_complex_script', '/graph.txt', '-map', '[a]',
    '-c:a', 'pcm_s16le', '/cut.wav'
  );
  const cutDurationMs = performance.now() - t0Cut;
  const cutStat = core.FS.stat('/cut.wav');
  console.log(`Cut completed in ${(cutDurationMs / 1000).toFixed(2)}s. Cut wav size: ${cutStat.size} bytes`);

  // Target comparison from make-fixtures.mjs:
  // noise 0.02 -> removed 1.35 s, 3 cuts (12.00 s -> 10.65 s) within +-0.3 s
  const diff = Math.abs(removedDuration - 1.35);
  console.log(`\nRemoved duration: ${removedDuration.toFixed(2)}s (Expected ~1.35s). Difference: ${diff.toFixed(2)}s`);
  if (diff <= 0.3) {
    console.log('>>> ACCURACY TEST PASSED! Result within ±0.3s tolerance of Node reference engine. <<<');
  } else {
    console.log('>>> ACCURACY TEST WARNING: Difference exceeds 0.3s <<<');
  }

  return {
    hushDurationMs,
    cutDurationMs,
    removedDuration,
    cleanSize: cleanStat.size,
    cutSize: cutStat.size,
  };
}

runBenchmark().catch(console.error);

