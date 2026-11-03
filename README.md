# Pegbox 📦

> **Pick a tool. Drop a file. Done.**  
> *Runs in your browser · Your files never leave your device · 100% Free*

Pegbox is a growing pegboard of fast, browser-native file tools for creators, podcasters, and everyday users. All file operations execute 100% locally on your machine using **WebAssembly** and **Web Workers**. Files are never uploaded to any server.

---

## ⚡ Key Highlights
- **100% Private**: Zero cloud uploads, zero tracking cookies, zero user data stored anywhere.
- **Forever Free Hosting**: Built as a pure client-side SSG Next.js app hostable on Vercel's free/hobby tier.
- **Studio Audio & Video Tools**:
  - **Voice Cleaner (Hush)**: Neural speech denoising (`rnnoise`), spectral FFT smoothing, downward expander, presence EQ, studio compressor, and EBU R128 two-pass loudnorm.
  - **Silence Cutter (Cut)**: Auto jump-cutting of pauses and dead air with configurable dialogue breathing room padding.
- **Scalable Architecture**: Built to grow from 2 to 100+ tools with **zero shell edits**—adding a tool is just one folder.

---

## 🚀 Quick Start (Under 5 Minutes)

### Prerequisites
- Node.js 20 LTS or newer (Node 22+ recommended)
- pnpm 10+ (`npm install -g pnpm`)

### Setup & Run
```bash
# 1. Clone repository & install dependencies
pnpm install

# 2. Start local development server
pnpm dev

# 3. Open http://localhost:3000 in your browser
```

### Build & Validate
```bash
# Run unit tests
pnpm test

# Verify all tool manifests & quality gates
pnpm check-tools

# Production build & static generation
pnpm build
```

---

## 🛠 Adding a New Tool (Tool #3 … #100)

Adding a tool never requires editing the application shell or navigation:

```bash
pnpm new-tool audio-trimmer --category audio --name "Audio Trimmer"
```

This scaffolds:
1. `tools/<id>/manifest.ts`: Metadata, inputs, limits, presets, and FAQ.
2. `tools/<id>/engine.ts`: Pure worker processing function `run(ctx)`.
3. `tools/<id>/selftest.ts`: Synthetic test fixture and validator.
4. `tools/<id>/seo.md`: SEO guide for `/tools/<id>`.

The tool automatically appears on the home page, `/tools`, category landing page, search bar (`/`), sitemap, and `/admin` console. See [docs/ADD_A_TOOL.md](docs/ADD_A_TOOL.md) for full instructions.

---

## 🌐 Deploying to Vercel (Free)

Pegbox is hosting-agnostic and 100% compatible with the Vercel Hobby tier:
1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Framework Preset: **Next.js**.
4. Root Directory: `./` (or `apps/web` with root build command).
5. Environment Variables:
   - `ADMIN_USER=admin`
   - `ADMIN_PASSWORD=your_secure_password`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
6. Click **Deploy**.

---

## 📂 Project Structure
```
apps/web/                 Next.js 15 app (App Router, Tailwind CSS, Lucide)
  src/app/                Pages: /, /tools, /tools/[id], /c/[category], /admin, /about, /faq, /privacy, /terms, /licenses
  src/components/         ToolWorkspace, DropZone, ResultView, Header, Footer
  src/lib/                Generated registry, store, search
packages/tool-kit/        Manifest contract, types, categories, Zod validation
packages/media/           FFmpeg WebAssembly host, worker, probe, synthetic fixtures
tools/                    One self-contained directory per tool
  voice-cleaner/          Hush (Noise cleaner)
  silence-cutter/         Cut (Silence jump-cutter)
scripts/                  gen-registry.mjs, check-tools.mjs, new-tool.mjs, build-brand.mjs
docs/                     BENCHMARKS.md, LIMITS.md, SCALING.md, LICENSES.md, ADMIN.md, ACCEPTANCE.md
```

---

## 📄 Documentation
- [docs/ADD_A_TOOL.md](docs/ADD_A_TOOL.md) — How to add tool #3 to #100 in under 30 minutes
- [docs/BENCHMARKS.md](docs/BENCHMARKS.md) — Capability gate & real measured performance benchmarks
- [docs/LIMITS.md](docs/LIMITS.md) — File size and device limits
- [docs/SCALING.md](docs/SCALING.md) — Architectural scaling to 100+ tools
- [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) — Verification records for acceptance tests A1 to A10
- [docs/LICENSES.md](docs/LICENSES.md) — Open source licenses & neural model credits
- [docs/ADMIN.md](docs/ADMIN.md) — Founder administration, diagnostics, and kill-switch guide

---

## ⚖️ License
MIT License. Open-source components and models retain their respective licenses (see [docs/LICENSES.md](docs/LICENSES.md)).

