import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const id = args[0];

if (!id || id.startsWith('-')) {
  console.error('Usage: pnpm new-tool <id> [--category audio|video|image|text|dev|util] [--name "Tool Name"]');
  process.exit(1);
}

// Parse flags
let category = 'util';
let customName = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--category' && args[i + 1]) {
    category = args[i + 1];
    i++;
  } else if (args[i] === '--name' && args[i + 1]) {
    customName = args[i + 1];
    i++;
  }
}

// Validate id is kebab-case
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error(`Error: Tool id "${id}" must be kebab-case (e.g. audio-trimmer, voice-cleaner)`);
  process.exit(1);
}

const ROOT = path.resolve();
const TOOL_DIR = path.join(ROOT, 'tools', id);
const TEMPLATE_DIR = path.join(ROOT, '.kit/pegbox-kit/templates/tool-template');

if (fs.existsSync(TOOL_DIR)) {
  console.error(`Error: Tool directory already exists at ${TOOL_DIR}`);
  process.exit(1);
}

fs.mkdirSync(TOOL_DIR, { recursive: true });
fs.mkdirSync(path.join(TOOL_DIR, 'tests'), { recursive: true });

// Title case tool name from id
const toTitleCase = (s) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const toolName = customName || toTitleCase(id);
const today = new Date().toISOString().slice(0, 10);

// 1. package.json for workspace
const pkgJson = {
  name: `@pegbox/tool-${id}`,
  version: '1.0.0',
  private: true,
  type: 'module',
  main: './index.ts',
  dependencies: {
    '@pegbox/tool-kit': 'workspace:*',
  },
};
fs.writeFileSync(path.join(TOOL_DIR, 'package.json'), JSON.stringify(pkgJson, null, 2));

// 2. manifest.ts
const manifestContent = `import type { ToolManifest } from '@pegbox/tool-kit';

export const manifest: ToolManifest = {
  id: '${id}',
  name: '${toolName}',
  shortName: '${toolName.split(' ')[0]}',
  tagline: 'Simple, fast, browser-native ${toolName.toLowerCase()}.',
  description: '${toolName} processes your files entirely on your device with complete privacy.',
  category: '${category}' as const,
  icon: 'Wrench',
  keywords: ['${id.replace('-', ' ')}', 'online', 'free', 'private'],
  status: 'beta',
  runtime: 'browser',
  input: { kind: 'any', extensions: ['txt'], maxMB: 50 },
  options: [],
  presets: [{ id: 'default', name: 'Default', description: 'Standard settings.', default: true }],
  limits: ['Processes files up to 50 MB directly in your browser.'],
  faq: [
    {
      q: 'Are my files uploaded to any server?',
      a: 'No. Everything is processed directly inside your browser. Your files never leave your device.',
    },
  ],
  next: [],
  addedOn: '${today}',
};
`;
fs.writeFileSync(path.join(TOOL_DIR, 'manifest.ts'), manifestContent);

// 3. index.ts
const indexContent = `import type { ToolModule } from '@pegbox/tool-kit';
import { manifest } from './manifest.js';

const tool: ToolModule = {
  manifest,
  load: () => import('./engine.js'),
};
export default tool;
`;
fs.writeFileSync(path.join(TOOL_DIR, 'index.ts'), indexContent);

// 4. engine.ts
const engineContent = `import type { RunContext, RunResult } from '@pegbox/tool-kit';

export async function run(ctx: RunContext): Promise<RunResult> {
  const [file] = ctx.files;
  ctx.onProgress('Processing file', 10);

  if (ctx.signal.aborted) {
    throw new DOMException('Cancelled by user', 'AbortError');
  }

  const arrayBuf = await file.arrayBuffer();
  ctx.onProgress('Finalizing', 80);

  const outputBlob = new Blob([arrayBuf], { type: file.type || 'application/octet-stream' });
  ctx.onProgress('Done', 100);

  return {
    outputs: [{ name: file.name, blob: outputBlob, mime: outputBlob.type }],
    stats: [{ label: 'Size', value: \`\${(file.size / 1024).toFixed(1)} KB\` }],
  };
}
`;
fs.writeFileSync(path.join(TOOL_DIR, 'engine.ts'), engineContent);

// 5. selftest.ts
const selftestContent = `export async function makeFixture(): Promise<File[]> {
  return [new File(['Pegbox selftest content'], 'fixture.txt', { type: 'text/plain' })];
}

export function check(result: { outputs: { blob: Blob }[] }): string | null {
  return result.outputs.length === 1 ? null : 'Expected exactly one output';
}
`;
fs.writeFileSync(path.join(TOOL_DIR, 'selftest.ts'), selftestContent);

// 6. seo.md
const seoContent = `# ${toolName} Online (Free & Private)

## What is ${toolName}?
${toolName} is a fast, free, browser-native utility for everyday creators and editors. It operates directly inside your web browser using WebAssembly and Web Workers.

## Why use Pegbox?
- **100% Private**: Your files are never sent to external servers or cloud storage.
- **Fast & Responsive**: Harnesses your local hardware.
- **No Sign-up**: Zero account creation, subscriptions, or credit cards required.

## Limits & Recommendations
For optimal performance, keep files under the recommended device size.
`;
fs.writeFileSync(path.join(TOOL_DIR, 'seo.md'), seoContent);

// 7. tests/index.test.ts
const testContent = `import { describe, it, expect } from 'vitest';
import { manifest } from '../manifest.js';
import { makeFixture, check } from '../selftest.js';
import { run } from '../engine.js';

describe('Tool ${id}', () => {
  it('has valid manifest id', () => {
    expect(manifest.id).toBe('${id}');
  });

  it('runs selftest successfully', async () => {
    const files = await makeFixture();
    const result = await run({
      files,
      preset: 'default',
      options: {},
      onProgress: () => {},
      signal: new AbortController().signal,
      log: () => {},
    });
    expect(check(result)).toBeNull();
  });
});
`;
fs.writeFileSync(path.join(TOOL_DIR, 'tests', 'index.test.ts'), testContent);

console.log(`Created new tool scaffold at tools/${id}`);

// Re-generate registry
try {
  execSync('node scripts/gen-registry.mjs', { stdio: 'inherit' });
} catch (e) {
  console.warn('Note: gen-registry will run on next build.');
}

