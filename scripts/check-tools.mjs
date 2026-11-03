import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ToolManifestSchema } from '../packages/tool-kit/src/validation.ts';

const ROOT = path.resolve();
const TOOLS_DIR = path.join(ROOT, 'tools');

async function main() {
  console.log('--- Pegbox Tool Quality & Safety Gate Check ---\n');

  if (!fs.existsSync(TOOLS_DIR)) {
    console.log('No tools directory found.');
    return;
  }

  const entries = fs.readdirSync(TOOLS_DIR, { withFileTypes: true });
  const toolDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (toolDirs.length === 0) {
    console.log('No tools found in tools/');
    return;
  }

  let failures = 0;
  const manifestMap = new Map();

  for (const dirName of toolDirs) {
    console.log(`Checking [${dirName}]...`);
    const toolDir = path.join(TOOLS_DIR, dirName);

    // 1. Check required files
    const manifestPath = path.join(toolDir, 'manifest.ts');
    const indexPath = path.join(toolDir, 'index.ts');
    const enginePath = path.join(toolDir, 'engine.ts');
    const selftestPath = path.join(toolDir, 'selftest.ts');
    const seoPath = path.join(toolDir, 'seo.md');

    if (!fs.existsSync(manifestPath)) {
      console.error(`  ❌ Missing manifest.ts`);
      failures++;
      continue;
    }
    if (!fs.existsSync(indexPath)) {
      console.error(`  ❌ Missing index.ts`);
      failures++;
    }
    if (!fs.existsSync(enginePath)) {
      console.error(`  ❌ Missing engine.ts`);
      failures++;
    }

    // 2. Validate manifest schema
    try {
      const mod = await import(pathToFileURL(manifestPath).href);
      const m = mod.manifest;
      const parseResult = ToolManifestSchema.safeParse(m);

      if (!parseResult.success) {
        console.error(`  ❌ Manifest validation failed:`, parseResult.error.format());
        failures++;
        continue;
      }

      if (m.id !== dirName) {
        console.error(`  ❌ id mismatch: folder is "${dirName}", manifest.id is "${m.id}"`);
        failures++;
      }

      manifestMap.set(m.id, m);

      // Check live tool strict requirements
      if (m.status === 'live') {
        if (!fs.existsSync(selftestPath)) {
          console.error(`  ❌ Live tool must have selftest.ts`);
          failures++;
        }
        if (!fs.existsSync(seoPath) || fs.readFileSync(seoPath, 'utf-8').trim().length < 50) {
          console.error(`  ❌ Live tool must have comprehensive seo.md (>50 characters)`);
          failures++;
        }
        if (!m.faq || m.faq.length === 0) {
          console.error(`  ❌ Live tool must have at least one FAQ item`);
          failures++;
        }
        if (!m.limits || m.limits.length === 0) {
          console.error(`  ❌ Live tool must declare honest limits`);
          failures++;
        }
      }

      console.log(`  ✓ Manifest valid (${m.name}, status: ${m.status}, category: ${m.category})`);
    } catch (e) {
      console.error(`  ❌ Error importing manifest:`, e.message);
      failures++;
    }
  }

  // 3. Verify next links
  for (const [id, m] of manifestMap) {
    if (m.next) {
      for (const nextId of m.next) {
        if (!manifestMap.has(nextId)) {
          console.warn(`  ⚠️ Tool "${id}" specifies next="${nextId}" which is not in the registry yet.`);
        }
      }
    }
  }

  console.log(`\n--- Verification Summary ---`);
  if (failures > 0) {
    console.error(`FAILED: ${failures} issue(s) detected. Fix them before shipping!`);
    process.exit(1);
  } else {
    console.log(`PASSED: All ${manifestMap.size} tool(s) meet Pegbox quality and integrity standards.\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

