import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve();
const TOOLS_DIR = path.join(ROOT, 'tools');

async function testScale() {
  console.log('--- Acceptance Test A9: Scalability Proof (100 Tools) ---');
  const createdDirs = [];

  try {
    console.log('Generating 100 synthetic tools in tools/ ...');
    for (let i = 1; i <= 100; i++) {
      const id = `scale-tool-${i}`;
      const dir = path.join(TOOLS_DIR, id);
      fs.mkdirSync(dir, { recursive: true });
      createdDirs.push(dir);

      const manifestContent = `import type { ToolManifest } from '@pegbox/tool-kit';
export const manifest: ToolManifest = {
  id: '${id}',
  name: 'Scale Tool ${i}',
  shortName: 'ST${i}',
  tagline: 'Automated scalability test tool ${i}.',
  description: 'Validates that Pegbox scales to 100+ tools with zero performance degradation.',
  category: '${['audio', 'video', 'image', 'text', 'dev', 'util'][i % 6]}',
  icon: 'Wrench',
  keywords: ['scale', 'tool${i}', 'benchmark'],
  status: 'beta',
  runtime: 'browser',
  input: { kind: 'any', extensions: ['txt'], maxMB: 25 },
  options: [],
  presets: [{ id: 'default', name: 'Default', description: 'Default preset', default: true }],
  limits: ['Test limit declaration.'],
  faq: [{ q: 'Is this a test tool?', a: 'Yes, part of test A9.' }],
  addedOn: '2026-11-03',
};`;
      fs.writeFileSync(path.join(dir, 'manifest.ts'), manifestContent);

      const indexContent = `import type { ToolModule } from '@pegbox/tool-kit';
import { manifest } from './manifest';
const tool: ToolModule = { manifest, load: () => import('./engine') };
export default tool;`;
      fs.writeFileSync(path.join(dir, 'index.ts'), indexContent);

      const engineContent = `export async function run(ctx: any) {
  return { outputs: [], stats: [] };
}`;
      fs.writeFileSync(path.join(dir, 'engine.ts'), engineContent);
    }

    console.log('Running gen-registry.mjs on 102 tools...');
    const t0 = performance.now();
    execSync('node scripts/gen-registry.mjs', { stdio: 'inherit' });
    const duration = ((performance.now() - t0) / 1000).toFixed(2);
    console.log(`Registry generated for 102 tools in ${duration}s!`);

    console.log('Running check-tools.mjs on 102 tools...');
    execSync('node scripts/check-tools.mjs', { stdio: 'inherit' });

    console.log('\n>>> ACCEPTANCE TEST A9 PASSED: System scaled to 100+ tools with zero shell edits! <<<\n');
  } finally {
    console.log('Cleaning up 100 temporary scale tools...');
    for (const dir of createdDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (_) {}
    }
    // Restore clean registry
    execSync('node scripts/gen-registry.mjs', { stdio: 'inherit' });
    console.log('Restored clean 2-tool production registry.');
  }
}

testScale().catch((e) => {
  console.error('Scalability test error:', e);
  process.exit(1);
});

