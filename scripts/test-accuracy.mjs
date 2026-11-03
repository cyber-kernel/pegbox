import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { makeTalkingWav } from '../.kit/pegbox-kit/reference/fixtures/make-fixtures.mjs';

globalThis.self = globalThis;
globalThis.location = { href: 'http://localhost/' };

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

async function testThreshold(noiseLevel) {
  const coreJsPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js');
  const wasmPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');

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
    core.exec(...args);
    return [...logs];
  }

  const wavBytes = makeTalkingWav({ seconds: 12, rate: 48000, noise: noiseLevel });
  core.FS.writeFile('/test.wav', wavBytes);

  // 1. autoThreshold
  const vLogs = execArgs('-hide_banner', '-nostdin', '-y', '-i', '/test.wav',
    '-af', 'highpass=f=100,volumedetect', '-f', 'null', '-'
  );
  const meanM = vLogs.join('\n').match(/mean_volume:\s*(-?[\d.]+) dB/);
  const mean = meanM ? parseFloat(meanM[1]) : -23;
  const autoThr = Math.max(-50, Math.min(-28, Math.round(mean - 12)));
  console.log(`Noise ${noiseLevel}: mean_volume = ${mean} dB -> auto threshold = ${autoThr} dB`);

  // 2. detect silences
  const sLogs = execArgs('-hide_banner', '-nostdin', '-y', '-i', '/test.wav',
    '-af', `highpass=f=100,lowpass=f=7000,silencedetect=noise=${autoThr}dB:d=0.5`,
    '-f', 'null', '-'
  );
  const silences = [];
  let sStart = null;
  for (const line of sLogs) {
    const sm = line.match(/silence_start:\s*(-?[\d.]+)/);
    const em = line.match(/silence_end:\s*([\d.]+)/);
    if (sm) sStart = Math.max(0, parseFloat(sm[1]));
    if (em && sStart !== null) {
      silences.push([sStart, parseFloat(em[1])]);
      sStart = null;
    }
  }
  if (sStart !== null) silences.push([sStart, 12.0]);
  console.log(`Detected ${silences.length} silences:`, silences);

  const keep = keepSegments(silences, 12.0, 0.15);
  const kept = keep.reduce((acc, [a, b]) => acc + (b - a), 0);
  const removed = 12.0 - kept;
  console.log(`Kept ${kept.toFixed(2)}s, Removed ${removed.toFixed(2)}s`);
  return { autoThr, removed, cuts: silences.length };
}

async function main() {
  console.log('--- Test 1: noise = 0.005 (Target: removed 2.85s, 3 cuts) ---');
  const r1 = await testThreshold(0.005);
  console.log(`Result: removed ${r1.removed.toFixed(2)}s, cuts ${r1.cuts}. Difference from 2.85s: ${(Math.abs(r1.removed - 2.85)).toFixed(2)}s`);

  console.log('\n--- Test 2: noise = 0.02 (Target: removed 1.35s, 3 cuts) ---');
  const r2 = await testThreshold(0.02);
  console.log(`Result: removed ${r2.removed.toFixed(2)}s, cuts ${r2.cuts}. Difference from 1.35s: ${(Math.abs(r2.removed - 1.35)).toFixed(2)}s`);
}

main().catch(console.error);

