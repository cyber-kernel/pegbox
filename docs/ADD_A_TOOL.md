# Adding a Tool to Pegbox (Tool #3 … #100)

Pegbox is architected so adding a tool **never requires editing the application shell**.
One folder + one manifest = a new page, a card on the home page, a search entry, a category entry, a sitemap entry, an OG image, and an admin self-test row.

---

## 1. Scaffold the Tool

Run the generator script:

```bash
pnpm new-tool <id> --category <audio|video|image|text|dev|util> --name "Tool Name"
```

Example:
```bash
pnpm new-tool audio-trimmer --category audio --name "Audio Trimmer"
```

This creates `tools/<id>/`:
- `manifest.ts`: Metadata, inputs, options, presets, limits, FAQ.
- `index.ts`: Module entry point with code-split dynamic `load()`.
- `engine.ts`: Core processing function `run(ctx)`.
- `selftest.ts`: Synthetic fixture generator and verification function.
- `seo.md`: Long-form SEO guide for `/tools/<id>`.
- `tests/index.test.ts`: Vitest unit tests.

---

## 2. Define the Manifest (`tools/<id>/manifest.ts`)

Every tool exports a typed manifest adhering to `@pegbox/tool-kit`:

```ts
import type { ToolManifest } from '@pegbox/tool-kit';

export const manifest: ToolManifest = {
  id: 'audio-trimmer',
  name: 'Audio Trimmer',
  shortName: 'Trim',
  tagline: 'Cut and trim audio files with precision in your browser.',
  description: 'Trim MP3, WAV, and audio tracks directly on your device with zero uploads.',
  category: 'audio',
  icon: 'Scissors',
  keywords: ['trim audio', 'cut mp3', 'audio cutter online free'],
  status: 'beta', // change to 'live' when selftest and tests pass
  runtime: 'browser',
  input: {
    kind: 'audio',
    extensions: ['mp3', 'wav', 'm4a', 'aac', 'ogg'],
    maxMB: 500,
  },
  options: [
    { type: 'slider', key: 'start', label: 'Start Time (s)', min: 0, max: 3600, default: 0 },
    { type: 'slider', key: 'duration', label: 'Duration (s)', min: 1, max: 3600, default: 30 },
  ],
  presets: [
    { id: 'standard', name: 'Standard', description: 'Trim to selected time range', default: true },
  ],
  limits: [
    'Supports audio files up to 500 MB on desktop and 150 MB on mobile.',
  ],
  faq: [
    {
      q: 'Will my audio be uploaded?',
      a: 'No. The entire trimming operation is executed locally on your device.',
    },
  ],
  next: ['voice-cleaner'],
  addedOn: '2026-11-03',
};
```

---

## 3. Implement the Engine (`tools/<id>/engine.ts`)

Engines are pure functions `(files, preset, options)`:
- No network requests.
- No global state.
- Honor `ctx.signal` for instant abort & memory reclamation.
- Call `ctx.onProgress(label, percent)` to keep the UI interactive.

```ts
import type { RunContext, RunResult } from '@pegbox/tool-kit';

export async function run(ctx: RunContext): Promise<RunResult> {
  const [file] = ctx.files;
  ctx.onProgress('Reading audio', 10);

  if (ctx.signal.aborted) throw new DOMException('Cancelled', 'AbortError');

  // Media tools can access ctx.ffmpeg (lazily provided by packages/media)
  // Non-media tools can import pure JS/WASM packages directly.

  ctx.onProgress('Done', 100);
  return {
    outputs: [{ name: file.name, blob: new Blob([await file.arrayBuffer()]), mime: file.type }],
    stats: [{ label: 'Status', value: 'Complete' }],
  };
}
```

---

## 4. Quality Gate & Self-Test (`selftest.ts` & `tests/`)

Before marking `status: 'live'`:
1. Provide a fixture generator in `selftest.ts`.
2. Run `pnpm check-tools`. It verifies:
   - Manifest passes Zod schema validation.
   - Live tools include `selftest.ts`, `seo.md`, `limits`, and `faq`.
   - Tool IDs are kebab-case and unique.
3. Run `pnpm test`.

---

## 5. Preview & Deploy

Run the dev server:
```bash
pnpm dev
```

The tool automatically appears on:
- The Home page grid & category filters
- `/tools` and `/c/<category>`
- Search index (`/` shortcut)
- Dynamic route `/tools/<id>`
- Admin health dashboard at `/admin`
- `sitemap.xml`

