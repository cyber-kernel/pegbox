import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('Testing ffmpeg.wasm Capability Gate...');
  const ffmpeg = new FFmpeg();

  let logOutput = '';
  ffmpeg.on('log', ({ message }) => {
    logOutput += message + '\n';
  });

  // Resolve core path
  const corePkgPath = path.resolve('node_modules/@ffmpeg/core/dist/esm');
  console.log('Core path:', corePkgPath);

  const coreJs = fs.readFileSync(path.join(corePkgPath, 'ffmpeg-core.js'), 'utf-8');
  const coreWasm = fs.readFileSync(path.join(corePkgPath, 'ffmpeg-core.wasm'));

  const coreURL = 'data:text/javascript;base64,' + Buffer.from(coreJs).toString('base64');
  const wasmURL = 'data:application/wasm;base64,' + coreWasm.toString('base64');

  await ffmpeg.load({
    coreURL,
    wasmURL,
  });

  console.log('ffmpeg loaded successfully!');

  // Check filters
  logOutput = '';
  await ffmpeg.exec(['-filters']);
  const filtersOutput = logOutput;

  // Check encoders
  logOutput = '';
  await ffmpeg.exec(['-encoders']);
  const encodersOutput = logOutput;

  const requiredFilters = [
    'arnndn', 'afftdn', 'agate', 'acompressor', 'equalizer',
    'loudnorm', 'alimiter', 'silencedetect', 'volumedetect',
    'aselect', 'select', 'highpass', 'lowpass', 'volume', 'aresample'
  ];

  const requiredEncoders = [
    'aac', 'libmp3lame', 'pcm_s16le', 'libx264'
  ];

  console.log('\n--- FILTER CHECKS ---');
  const filterResults = {};
  for (const f of requiredFilters) {
    // Check word boundary or filter listing pattern
    const regex = new RegExp(`\\b${f}\\b`);
    const found = regex.test(filtersOutput);
    filterResults[f] = found;
    console.log(`Filter [${f}]: ${found ? 'PASS' : 'MISSING'}`);
  }

  console.log('\n--- ENCODER CHECKS ---');
  const encoderResults = {};
  for (const e of requiredEncoders) {
    const regex = new RegExp(`\\b${e}\\b`);
    const found = regex.test(encodersOutput);
    encoderResults[e] = found;
    console.log(`Encoder [${e}]: ${found ? 'PASS' : 'MISSING'}`);
  }

  return { filterResults, encoderResults, filtersOutput, encodersOutput };
}

main().catch(err => {
  console.error('Capability gate error:', err);
  process.exit(1);
});

