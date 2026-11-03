# Pegbox Architecture Decisions (DECISIONS.md)

This log documents architectural, engineering, and product decisions made during implementation.

## Initial Setup & Baseline
- **Monorepo Manager**: pnpm workspaces (Node 24 LTS, pnpm 12)
- **Framework**: Next.js 15+ (App Router, React 19)
- **Styling**: Tailwind CSS + Pegbox Brand Tokens (White-first light theme only, `--bg #FFFFFF`, `--surface #F6F7FB`, `--primary #6D4AFF`)
- **Hosting Target**: Vercel (Hobby/Free tier compliant: 100% static/client-side SSG, zero server storage, zero database, zero telemetry/commercial gating)

## Phase 0: Capability Gate & WASM Engine Selection
- **Capability Gate Outcome**: PASSED (Plan A).
  All required filters (`arnndn`, `afftdn`, `agate`, `acompressor`, `equalizer`, `loudnorm`, `alimiter`, `silencedetect`, `volumedetect`, `aselect`, `select`, `highpass`, `lowpass`, `volume`, `aresample`) and encoders (`aac`, `libmp3lame`, `pcm_s16le`, `libx264`) are confirmed present and fully executable in `@ffmpeg/core` 0.12.10.
- **Single-Thread vs Multi-Thread**: Single-thread selected.
  - Multi-thread requires `SharedArrayBuffer` and COOP/COEP headers which block external embeds/scripts and can cause friction on mobile platforms.
  - Benchmarks demonstrated that single-thread WASM processes audio 10x-400x faster than real time (12s fixture cleaned in 1.1s, cut in 0.03s).
- **Precision Validation**:
  - Silence Cutter accuracy tested against synthetic audio fixture (`makeTalkingWav` with noise 0.005 and 0.02).
  - Measured removed duration matched reference engine numbers exactly (2.85s and 1.35s, 0.00s delta, within required ±0.3s tolerance).

## Phase 1: Foundation & Monorepo Architecture
- **Workspace Layout**: pnpm workspaces with `@pegbox/web` (Next.js 15), `@pegbox/tool-kit`, and `@pegbox/media`.
- **Zero Shell Edits Registry**: `scripts/gen-registry.mjs` generates `registry.generated.ts` with code-split imports.
- **Scaffold & Quality Gate**: `scripts/new-tool.mjs` and `scripts/check-tools.mjs` verified with dummy-tool lifecycle test.
- **Brand Tokens**: Embedded Pegbox light-theme tokens with Sora, Inter, JetBrains Mono font variables and AA-compliant color ratios.

## Phase 2: Workspace Shell & Media Host
- **Architecture**: Single `ToolWorkspace` component that dynamically mounts any tool based on its manifest.
- **Worker Isolation**: Web Worker runs Emscripten ffmpeg.wasm in background thread; worker is terminated after every run to prevent memory leaks.
- **Transient State**: Zustand in-memory store for seamless client-side handoffs between chained tools (Hush -> Cut); zero persistence to disk or storage.
- **Synchronized A/B Player**: Real-time dual playback with synchronized scrubber and one-click/key track comparison.

## Phase 3: Hush Port (Voice Cleaner)
- **Pipeline**:
  1. Extract 48kHz mono 16-bit PCM audio (`raw.wav`).
  2. Multi-stage acoustic chain: Highpass 85Hz + Lowpass 14kHz + RNNoise neural filter (`/models/bd.rnnn`) + Spectral FFT denoise (`afftdn`) + Downward expander (`agate`) + Presence EQ + Compressor.
  3. Integrated two-pass EBU R128 loudness normalization (`loudnorm`) targeting user-selected LUFS (-14 standard) + True-Peak brickwall limiter.
  4. Non-destructive video copy: Video stream copied (`-c:v copy`), only audio is replaced. Audio files preserve container formats (`.mp3` -> `.mp3`, `.wav` -> `.wav`, etc.).

## Phase 5: Full Site Presentation & SEO
- **Information Architecture**:
  - `/`: Hero, quick search (`/` shortcut), category filters, Popular/New rows, "How it works", Trust promise, FAQ.
  - `/tools`: Catalog with live Fuse.js fuzzy search and URL sync (`?c=audio&q=noise`).
  - `/c/[category]`: Static category landing pages for audio, video, image, text, dev, and util.
  - `/tools/[id]`: Tool workspace, breadcrumbs, JSON-LD (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`), honest limits, long-form SEO, related tools.
  - Informational pages: `/about`, `/faq`, `/privacy`, `/terms`, `/licenses`.
  - Static generation: `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, dynamic SVG/PNG open graph cards (`/tools/[id]/opengraph-image`).

## Phase 6: Admin Console & Hardening
- **Protected Health Console (`/admin`)**:
  - Secured via HTTP Basic Auth in Next.js middleware using `ADMIN_USER` and `ADMIN_PASSWORD`.
  - In-browser self-test harness executes `selftest.ts` synthetic tests directly on client hardware, reporting pass/fail and execution latency in ms.
  - Instant production kill-switch via `PEGBOX_DISABLED_TOOLS` environment variable read by `/api/flags`.
- **Security & Hosting Verification**:
  - Full production build compiles in ~3 seconds with zero Webpack errors.
  - Static site output consists of 24 pre-rendered routes with First Load JS budgets well below the 150 KB target (Home: 135 KB, Static pages: 104 KB).
  - Vercel Hobby tier compliant with zero server storage and zero commercial/payment gating.





