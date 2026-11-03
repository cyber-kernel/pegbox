import fs from 'node:fs';
import path from 'node:path';

const wasmPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');
console.log('Reading:', wasmPath);
const buf = fs.readFileSync(wasmPath);

const requiredFilters = [
  'arnndn', 'afftdn', 'agate', 'acompressor', 'equalizer',
  'loudnorm', 'alimiter', 'silencedetect', 'volumedetect',
  'aselect', 'select', 'highpass', 'lowpass', 'volume', 'aresample'
];

const requiredEncoders = [
  'aac', 'libmp3lame', 'pcm_s16le', 'libx264'
];

console.log('\n--- WASM STRING CHECKS FOR FILTERS ---');
for (const f of requiredFilters) {
  // Check exact string or null terminated string
  const str = Buffer.from(f, 'ascii');
  const idx = buf.indexOf(str);
  console.log(`Filter [${f}]: ${idx !== -1 ? 'PRESENT (offset ' + idx + ')' : 'NOT FOUND'}`);
}

console.log('\n--- WASM STRING CHECKS FOR ENCODERS ---');
for (const e of requiredEncoders) {
  const str = Buffer.from(e, 'ascii');
  const idx = buf.indexOf(str);
  console.log(`Encoder [${e}]: ${idx !== -1 ? 'PRESENT (offset ' + idx + ')' : 'NOT FOUND'}`);
}

