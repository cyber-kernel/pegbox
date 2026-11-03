import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.self = globalThis;
globalThis.location = { href: 'http://localhost/' };

async function inspectCoreMethods() {
  const coreJsPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js');
  const wasmPath = path.resolve('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');

  const coreModule = await import(pathToFileURL(coreJsPath).href);
  const createFFmpegCore = coreModule.default;

  const wasmBinary = fs.readFileSync(wasmPath);

  let logs = [];
  const core = await createFFmpegCore({
    wasmBinary,
    print: (msg) => { logs.push(msg); },
    printErr: (msg) => { logs.push(msg); },
  });

  console.log('Available core keys:', Object.keys(core).filter(k => !k.startsWith('_')));
  
  logs = [];
  try {
    if (typeof core.callMain === 'function') {
      core.callMain(['-filters']);
    } else if (typeof core.exec === 'function') {
      core.exec('-filters');
    }
  } catch (e) {
    console.log('Call finished with:', e.name, e.message);
  }
  console.log('Logs count:', logs.length);
  if (logs.length > 0) {
    console.log('Sample log:', logs.slice(0, 5));
    console.log('Matching arnndn:', logs.filter(l => l.includes('arnndn')));
  }
}

inspectCoreMethods().catch(console.error);

