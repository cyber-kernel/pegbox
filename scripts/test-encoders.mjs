import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.self = globalThis;
globalThis.location = { href: 'http://localhost/' };

async function testEncoders() {
  const coreJsPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js');
  const wasmPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');

  const coreModule = await import(pathToFileURL(coreJsPath).href);
  const createFFmpegCore = coreModule.default;

  const wasmBinary = fs.readFileSync(wasmPath);

  let logs = [];
  const core = await createFFmpegCore({
    wasmBinary,
  });

  core.setLogger((msg) => {
    logs.push(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
  });

  try {
    core.exec('-encoders');
  } catch (e) {}

  const allText = logs.join('\n');
  const requiredEncoders = ['aac', 'libmp3lame', 'pcm_s16le', 'libx264'];
  console.log('\n--- ENCODER VERIFICATION ---');
  for (const e of requiredEncoders) {
    console.log(`Encoder [${e}]: ${allText.includes(e) ? 'FOUND' : 'NOT FOUND'}`);
  }
}

testEncoders().catch(console.error);

