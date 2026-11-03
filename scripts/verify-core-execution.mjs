import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.self = globalThis;
globalThis.location = { href: 'http://localhost/' };

async function testCoreExecution() {
  const coreJsPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js');
  const wasmPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');

  const coreModule = await import(pathToFileURL(coreJsPath).href);
  const createFFmpegCore = coreModule.default;

  const wasmBinary = fs.readFileSync(wasmPath);

  let logs = '';
  const core = await createFFmpegCore({
    wasmBinary,
    print: (msg) => { logs += msg + '\n'; },
    printErr: (msg) => { logs += msg + '\n'; },
  });

  console.log('Core instantiated successfully!');

  // Run -filters
  logs = '';
  try {
    core.exec('-filters');
  } catch (e) {
  }
  const filtersOutput = logs;

  // Run -encoders
  logs = '';
  try {
    core.exec('-encoders');
  } catch (e) {
  }
  const encodersOutput = logs;

  const requiredFilters = [
    'arnndn', 'afftdn', 'agate', 'acompressor', 'equalizer',
    'loudnorm', 'alimiter', 'silencedetect', 'volumedetect',
    'aselect', 'select', 'highpass', 'lowpass', 'volume', 'aresample'
  ];

  const requiredEncoders = [
    'aac', 'libmp3lame', 'pcm_s16le', 'libx264'
  ];

  console.log('\n--- VERIFIED IN EXECUTED FFMPEG -FILTERS ---');
  let allFiltersPass = true;
  for (const f of requiredFilters) {
    const present = new RegExp(`\\s${f}\\s`).test(filtersOutput);
    if (!present) allFiltersPass = false;
    console.log(`Filter [${f}]: ${present ? 'PASSED' : 'FAILED'}`);
  }

  console.log('\n--- VERIFIED IN EXECUTED FFMPEG -ENCODERS ---');
  let allEncodersPass = true;
  for (const e of requiredEncoders) {
    const present = new RegExp(`\\s${e}\\s`).test(encodersOutput);
    if (!present) allEncodersPass = false;
    console.log(`Encoder [${e}]: ${present ? 'PASSED' : 'FAILED'}`);
  }

  if (allFiltersPass && allEncodersPass) {
    console.log('\n>>> CAPABILITY GATE PASSED: Plan A confirmed! All required filters and encoders are present and executable in @ffmpeg/core 0.12.10. <<<');
  } else {
    console.log('\n>>> Filters sample output:');
    console.log(filtersOutput.split('\n').filter(l => requiredFilters.some(f => l.includes(f))).join('\n'));
    console.log('\n>>> Encoders sample output:');
    console.log(encodersOutput.split('\n').filter(l => requiredEncoders.some(e => l.includes(e))).join('\n'));
  }
}

testCoreExecution().catch(console.error);
