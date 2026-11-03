import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.self = globalThis;
globalThis.location = { href: 'http://localhost/' };

async function testWithLogger() {
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

  // Test exec
  try {
    core.exec('-filters');
  } catch (e) {
    console.log('Exec error:', e.message);
  }

  console.log('Logs captured count:', logs.length);
  if (logs.length > 0) {
    console.log('First 5 logs:', logs.slice(0, 5));
    const allText = logs.join('\n');
    const required = [
      'arnndn', 'afftdn', 'agate', 'acompressor', 'equalizer',
      'loudnorm', 'alimiter', 'silencedetect', 'volumedetect',
      'aselect', 'select', 'highpass', 'lowpass', 'volume', 'aresample'
    ];
    for (const r of required) {
      console.log(`Filter [${r}]: ${allText.includes(r) ? 'FOUND' : 'NOT FOUND'}`);
    }
  }
}

testWithLogger().catch(console.error);

