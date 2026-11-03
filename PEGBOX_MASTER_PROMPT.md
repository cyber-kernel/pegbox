# PEGBOX — MASTER BUILD PROMPT (v3)

> Give this file to your coding agent. It is shipped inside `pegbox-starter-kit.zip`.
> Build what is described here. Ask a question only if you are truly blocked. Otherwise choose sensibly, write the choice in `DECISIONS.md`, and keep going.
> Ideas that are not in this document go into `SUGGESTIONS.md`, not into the code.

---

## 0. HOW TO USE THE KIT (read first)

The founder keeps `pegbox-starter-kit.zip` in the project root folder. Do this once:

```bash
unzip pegbox-starter-kit.zip -d .kit      # creates ./.kit/pegbox-kit/...
echo ".kit/" >> .gitignore                # the kit is reference material, not app code
```

Rules for the kit:
1. `.kit/` is **read-only reference**. Never import from it at runtime and never edit it. Copy what you need into the app.
2. Copy `brand/*` into `apps/web/public/brand` and `brand/tokens.css` into the global styles. Do not redraw the logo.
3. Copy `contracts/tool-contract.ts` into `packages/tool-kit/src/types.ts` (it already runs and has one tested helper, `clampOptions`).
4. Use `templates/tool-template/` as the source for the `pnpm new-tool` scaffold command you will build (section 8).
5. `reference/engines-node/` holds the two working tools (Hush, Cut) as **Node + ffmpeg programs**. They define the exact behaviour (filter chains, thresholds, maths). **Port them to the browser; do not rewrite them from imagination.** Read `reference/PORTING_NOTES.md` before Phase 3.
6. Copy `reference/engines-node/voice-cleaner/models/bd.rnnn` to `apps/web/public/models/bd.rnnn`.
7. Use `reference/fixtures/make-fixtures.mjs` for tests and for the admin self-test. Its header lists measured expected numbers your port must match within ±0.3 s.

---

## 1. YOUR ROLE AND HARD RULES

You are a senior full-stack engineer building **Pegbox**, a free website that will grow from 2 to 50–100+ small file tools. The founder is a solo developer in India with **no budget**. Everything must be free to run, simple to maintain, and safe.

Hard rules:
1. **Browser-first.** Every tool processes files **on the user's device** (Web Worker + WebAssembly). Files are never uploaded to our servers. This is the core promise, the reason hosting stays free, and the reason there is nothing to store or delete.
2. **No database, no accounts, no payments, no credits in v1.** Everything is free. Do not build login, billing, ledgers, or user storage. (Section 14 explains the hooks to leave for later.)
3. **Adding a tool must never require editing the app shell.** One folder + one manifest = a new page, a card on the home page, a search entry, a sitemap entry, an OG image, and an admin self-test row. If you find yourself editing a shared file to add a tool, the design is wrong; fix the design.
4. **Light theme only.** White background. No dark mode, no theme toggle.
5. **Free and open source only.** No paid services, no API keys needed to run the site. If an optional free-tier service is used (analytics), the site must work with it switched off.
6. **Do not claim what you did not measure.** Performance, file-size limits and browser support must come from real benchmarks you run in Phase 0 and record in `docs/BENCHMARKS.md`.
7. Ship in phases (section 12). After each phase run its checklist and report pass/fail. Do not start the next phase until the current one passes.
8. TypeScript strict, small files, clear names. Comments only where the reason is not obvious. README with setup in under 10 minutes.
9. Do not hard-code anything about Hush or Cut in shared code. They are tool #1 and #2 and must go through the same registry as tool #3.

---

## 2. PRODUCT

**Name:** **Pegbox** — a pegboard of small tools. Every tool is a peg; adding a tool = hanging another peg on the board.
**Hero line:** "Pick a tool. Drop a file. Done."
**Trust line (shown everywhere it fits):** "Runs in your browser · Your files never leave your device · Free"
**One line:** Pegbox is a growing collection of simple file tools for creators and everyday users. Open a tool, drop a file, download the result.

**Tools at launch**

| Tool | Short name | id (URL) | Category | What it does |
|---|---|---|---|---|
| Voice Cleaner | **Hush** | `voice-cleaner` | audio | Removes background noise, keeps the voice natural, makes it louder and even |
| Silence Cutter | **Cut** | `silence-cutter` | audio | Removes pauses and dead air (automatic jump-cuts) |

(They came from the earlier "Hushcut" idea; Hush and Cut live on as tool names.) Both accept video (mp4, mov, mkv, avi, webm, m4v, flv, wmv, mpg, mpeg, 3gp, ts, mts) and audio (mp3, wav, m4a, aac, flac, ogg, opus, wma).

**Planned later (examples only, do not build):** auto captions, image background remover, vocal/music splitter, shorts clipper, compressors, PDF tools, text and developer utilities. Categories must therefore be generic (section 3.3).

**Audience:** YouTubers, reel creators, podcasters, course creators, students, anyone with a file and a small job. English UI first; keep strings in message files so Hindi can be added later (`next-intl`).

---

## 3. INFORMATION ARCHITECTURE (built for 100 tools)

### 3.1 URLs
```
/                      home: hero, search, category chips, tool grid, how it works, trust, FAQ
/tools                 all tools (same grid + filters), URL-synced filters (?c=audio&q=noise)
/tools/[id]            one tool page = SEO text + the working tool (shared workspace)
/c/[category]          category landing page (SEO)
/about /faq /privacy /terms /contact /licenses
/admin                 founder-only health page (section 9)
/sitemap.xml /robots.txt /manifest.webmanifest
```
All public pages are statically generated (`generateStaticParams` from the registry). No server code is needed for the product itself.

### 3.2 Categories (extendable list in one file `packages/tool-kit/src/categories.ts`)
`audio`, `video`, `image`, `text` (docs/PDF/text), `dev` (developer), `util` (everything else). A new category = one entry (id, label, icon, color tokens, SEO blurb). Category color tokens already exist in `brand/tokens.css`.

### 3.3 Repo layout
```
apps/web/                 Next.js app (App Router, TypeScript)
  src/app/...             routes above
  src/components/         ui/ (shadcn), shell/, workspace/, brand/
  src/lib/                registry (generated), search, analytics, policy
packages/tool-kit/        types.ts (the contract), categories.ts, validation (Zod), helpers
packages/media/           ffmpeg.wasm host + probe + wav/blob helpers (shared by media tools)
tools/                    ONE FOLDER PER TOOL  (each a pnpm workspace package)
  voice-cleaner/          manifest.ts  engine.ts  index.ts  selftest.ts  seo.md  tests/
  silence-cutter/
scripts/                  gen-registry.mjs, new-tool.mjs, check-tools.mjs, build-brand.mjs
docs/                     ADD_A_TOOL.md, BENCHMARKS.md, LIMITS.md, SCALING.md, LICENSES.md, ADMIN.md
.kit/                     (unzipped starter kit, git-ignored)
```
Use pnpm workspaces. Node 20 LTS or newer. Check current stable versions when installing; do not assume.

### 3.4 The registry (the heart of scalability)
- `scripts/gen-registry.mjs` runs on `predev` and `prebuild`. It scans `tools/*/index.ts`, validates every manifest with Zod, and writes `apps/web/src/lib/registry.generated.ts` containing: manifests (plain data, tiny) and a map `id -> () => import('tools/<id>')` (code-split, nothing heavy loads on the home page).
- The build **fails** with a clear message if: an id is duplicated or not kebab-case, `status:'live'` without `selftest.ts`, an unknown category or Lucide icon, missing FAQ, `limits` empty, or a `next` id that does not exist.
- Everything that lists tools (home grid, `/tools`, category pages, search, sitemap, related tools, OG images, JSON-LD, admin) reads the registry. Nothing is listed by hand anywhere.
- Hidden tools (`status:'hidden'`) are built but not listed or indexed; reachable by URL for testing.

### 3.5 Scaling the browsing experience (this matters at 50–100 tools)
- Home shows: search box (press `/` to focus), category chips, **Popular** and **New** rows (New = `addedOn` within 30 days), then the full grid. Cards are compact; the grid is virtualized only if it ever exceeds ~150 items.
- Client-side fuzzy search (fuse.js or cmdk palette `Ctrl/Cmd+K`) over name, tagline, keywords. Works offline from the generated registry.
- "Popular" is a static `popularRank` list in `apps/web/src/lib/featured.ts` edited by hand (no analytics dependency).
- Every tool page shows 3–4 related tools (same category + the manifest's `next`).

---

## 4. THE TOOL CONTRACT AND RUNTIME

Copy `contracts/tool-contract.ts`. Summary: a tool exports `{ manifest, load }`. `manifest` is plain data (id, names, category, Lucide icon, keywords, `runtime`, `input` rules, `options` schema, `presets`, `limits`, `faq`, `next`, `status`, `addedOn`). `load()` dynamically imports `engine.ts`, which exports `run(ctx) => { outputs, stats }`.

Rules every engine follows:
- Pure function of `(files, preset, options)`. No network calls. No global state. No file names in logs.
- Options are validated and clamped with `clampOptions()` **before** `run` (never trust the UI).
- `ctx.signal` is honoured: Cancel stops work and frees memory.
- Progress is reported as `(label, percent)` many times (label is a plain-words stage like "Removing noise").
- Engines return Blobs; the shell owns download, preview, cleanup.

### 4.1 Auto-generated UI from the manifest
One shared `ToolWorkspace` component renders any tool from its manifest: drop zone → preset cards → "Advanced" accordion built from `options` (slider / toggle / select / text) → run → progress → result → download. A new tool needs **no UI code** unless it needs a custom result view; allow an optional `ResultView` export in the tool folder for that case.

### 4.2 Runtime: browser (the only runtime built in v1)
- Heavy work runs in a **Web Worker**; the main thread stays responsive.
- **ffmpeg.wasm host** in `packages/media`: one lazily loaded instance, **single-threaded core by default**. Self-host the core files in `public/ffmpeg/` (no third-party CDN), served with long immutable cache headers. Load the core only when a tool that declares `needsFfmpeg` is opened or its file is dropped; show "Getting ready… (one-time download, about NN MB)" with real progress.
- **Do not enable the multi-threaded core in v1.** It needs `SharedArrayBuffer`, which requires cross-origin-isolation headers (COEP/COOP) that break third-party embeds and scripts. If Phase 0 shows single-thread is too slow, enable it **only on `/tools/*` routes** with headers scoped to those routes, keep all third-party scripts off those routes, and record the decision.
- Memory is the real limit. The standard wasm build has roughly a 2 GB ceiling and phones have much less. Mount the input `File` instead of copying it where the API allows (see `PORTING_NOTES.md`), delete intermediate files as soon as possible, and **terminate the worker after every job** so memory is returned. Per-tool `maxMB` and a lower mobile cap come from Phase 0 benchmarks, shown **before** processing, and enforced in code.
- Support check at start: if WebAssembly, Workers or required APIs are missing, show a friendly "This browser can't run this tool. Try the latest Chrome, Edge, Firefox or Safari." message instead of failing midway.
- Leaving the page while a job runs triggers a `beforeunload` warning. Closing the tab ends the job and frees everything (nothing is stored anywhere).

### 4.3 Runtime: server (NOT built now; the contract only reserves it)
Some future tools (large AI models) may not fit in a browser. `runtime:'server'` is reserved in the manifest. Do not build it. Write `docs/SCALING.md` explaining the plan: a separate stateless worker host (self-hosted VM or a free-tier AI host; verify current free terms at that time), files streamed in, processed, streamed out and deleted immediately, never stored; Vercel functions must not be used for large files because of their request-size and duration limits. Any such tool must show a different, honest badge ("Processed on our server, deleted right after") instead of "Runs in your browser".

---

## 5. THE TWO LAUNCH TOOLS (ports of the reference engines)

Read `.kit/pegbox-kit/reference/PORTING_NOTES.md` and the Node source. Port to `tools/voice-cleaner` and `tools/silence-cutter`.

**Hush — Voice Cleaner** (`voice-cleaner`): presets `natural`, `balanced` (default), `strong`; options `lufs` (slider −20…−9, default −14, "Loudness"), `gain` (0…10 dB, "Extra boost"), `mono` (toggle, "Mono output"). Pipeline: mono 48 kHz extract → highpass/lowpass → RNNoise (`arnndn`, model `/models/bd.rnnn`) → FFT denoise → soft gate → EQ → compressor → two-pass loudnorm → limiter → mux. Video stream is copied unchanged (no quality loss). Fallback modes retained; the mode used goes into `diagnostics`, never to the user.
Honest limits (FAQ + tool page): it reduces background noise; it cannot remove room echo and may make it more noticeable; never say "100%".

**Cut — Silence Cutter** (`silence-cutter`): presets `gentle` (≥1.0 s, pad 0.25), `balanced` (≥0.5 s, pad 0.15), `aggressive` (≥0.3 s, pad 0.08); options `threshold` (auto toggle + slider −60…−20 dB, "Silence sensitivity"), `min-silence` (0.2…2 s), `padding` (0…0.5 s, "Breathing room around speech"). Result stats: "12:40 → 9:05, saved 3:35". If nothing is found, return the original and say so plainly. Known weakness to disclose: auto-sensitivity is weaker on noisy recordings; suggest running Hush first.

**Chaining:** manifest `next` drives a "Next: Cut the silence" button on the result screen. The result File is handed to the next tool **in memory** (client-side navigation + an in-memory store). If the page is reloaded the hand-off is gone and the user is asked to drop the file again. Nothing is persisted.

**Phase 0 gate:** before building UI, prove the wasm core has the filters and encoders listed in `PORTING_NOTES.md` ("Capability gate"). If `arnndn` is missing use Plan B or C there. Do not continue to Phase 1 until the gate result and the Plan are written in `DECISIONS.md`.

---

## 6. BRAND SYSTEM (light theme, follow exactly)

### 6.1 Identity
- **Concept:** a pegboard grid. Each colored square is a tool; the dashed slot with a plus is "the next tool". The mark itself tells the story of a growing collection.
- **Files (in the kit):** `brand/pegbox-icon.svg` (app icon), `brand/pegbox-logo.svg` (icon + wordmark), `brand/pegbox-favicon.svg`, `brand/png/*` (favicon.ico, favicon 16/32/48, apple-touch-icon 180, icon-192, icon-512).
- **Wordmark:** "Peg" in `--ink`, "box" in `--primary`; font Sora Bold, letter-spacing −2%. In the app render the wordmark as **live text** with `next/font` Sora (the SVG logo falls back to a system font when Sora is not installed). Clear space = one grid square. Minimum icon size 24 px.
- Still to do in Phase 5 (script `scripts/build-brand.mjs`, uses `sharp`): OG image 1200×630 (white background, big logo, hero line), a maskable 512 icon, and re-render the full logo PNG with Sora loaded. View every output before shipping.
- **Naming status:** domain and trademark availability are NOT verified (see section 15).

### 6.2 Colors — `brand/tokens.css` is the source of truth
White-first. `--bg #FFFFFF`, `--surface #F6F7FB`, `--ink #0F1222`, `--muted #5B6078`, `--primary #6D4AFF`, `--line #E4E6F0` (decorative borders), `--line-strong #7A8099` (input borders, 3.9:1).
Each category has `fill` (icons, tiles), `text` (labels) and `tint` (tile background). **Rule: bright category/brand fills are never used for text on white** (coral, green, amber, sky measure only 2.2–2.8:1). Use the `-text` tokens. Measured: ink 18.6:1, muted 6.2:1, primary 5.15:1, white-on-primary 5.15:1. Re-check any new color pair; AA is required.

### 6.3 Typography
Headings **Sora** 600/700; UI/body **Inter** 400/500/600; numbers, timers and sizes **JetBrains Mono**. Scale 12/14/16/18/24/32/48/64. Hero 56–64 px desktop, 36 px mobile. Line height 1.1 headings, 1.6 body. Self-host through `next/font`.

### 6.4 Look and feel
- Clean, bright, calm, "friendly workshop". Lots of white, soft shadows (`--shadow-card`), thin `--line` borders, tinted tool tiles. No gradients behind text, no glow effects.
- Radius: cards 20, controls 12, chips 999. 8-px spacing grid. Max width 1200. Mobile-first; everything works at 360 px.
- Buttons: primary = `--primary` fill, white text, darker on hover; secondary = white with `--line-strong` border; ghost = text. Icons: Lucide, 1.75 stroke.
- Tool cards: tinted tile in the category tint, icon in the category fill, name, one-line tagline, small category chip, "New"/"Beta" badge. Whole card clickable.
- Motion (Framer Motion, light; respect `prefers-reduced-motion`): hero shows the pegboard grid filling in tile by tile and the dashed slot pulsing once; drag-over glow on the drop zone (primary-colored 2 px dashed border); progress bar = primary fill with subtle shimmer.
- Accessibility: AA contrast, 3-px visible focus ring (`--focus`), keyboard-usable upload, labeled controls, players with captions controllable, errors announced via `aria-live`.

### 6.5 Voice and copy
Short, friendly, plain sentences; no hype, no jargon. Examples: "Drop a file here, or choose one." · "Your file stays on your device." · "Working on it… 63%" · error: "That file didn't work. Nothing was uploaded or saved. Try another file, or tell us what happened."

---

## 7. USER FLOW (public visitor, no account)

1. **Arrive** (Google or a link) on `/tools/voice-cleaner` or `/`. Page loads fast: no ffmpeg, no tool code yet; only text, images, the drop zone shell.
2. **Choose** a tool (search, category chip, card) or already be on one.
3. **Drop a file** (drag, click, or paste). Instantly, on the main thread: check extension/MIME/size against the manifest `input` rule and the device cap. Reject with a plain reason and the allowed types.
4. **Get ready** (first time only): download the engine (ffmpeg.wasm core, model) with a progress bar and the size; cached by the browser afterwards. Show a short "why the first time is slower" line.
5. **Inspect** the file locally (duration, has audio, type). Show name, size, duration, a small waveform if audio exists. If no audio or corrupt: explain, nothing else happens.
6. **Choose settings:** preset cards with one-line plain explanations; "Advanced" accordion generated from options. Show an honest estimate ("About 2–4 minutes on a typical laptop") taken from benchmarks; hide it if no benchmark exists.
7. **Run.** Button "Clean my voice" / "Cut the silence" / generic "Start". Progress bar + stage label + Cancel. A warning appears if the tab goes to background on mobile ("Keep this tab open"). `beforeunload` guard.
8. **Result:** before/after player (synced position, one-key A/B toggle, volume matched) for audio/video outputs; stat chips (e.g. "Saved 3m 35s"); **Download** (named `<original>_clean.mp4` etc.); "Next: …" buttons from `next`; "Process another file".
9. **Clear:** Download does not clear. A visible "Clear everything" button revokes object URLs, deletes worker FS, terminates the worker, empties the in-memory store. This also runs automatically on leaving the page, on "Process another file", and after 30 minutes of inactivity. Nothing is ever written to localStorage, IndexedDB, cookies or a server. (Allowed: tiny non-identifying UI preferences such as "last preset", stored in `localStorage`, never file info.)
10. **Failure paths:** unsupported browser, out-of-memory (caught: "This file is too big for this device. Try a shorter file or a desktop browser."), user cancel, engine error (friendly message, offer retry with the safer mode where the engine has one), network loss during the first engine download (retry button; after that the tool works offline).

## 8. ADDING TOOL #3 … #100 (what the founder or agent does)

1. `pnpm new-tool <id> --category audio` → copies `templates/tool-template` into `tools/<id>`, fills id/name placeholders, creates `tests/`, and registers nothing by hand (the registry is generated).
2. Fill `manifest.ts` (names, tagline, keywords, input rule, options, presets, honest `limits`, FAQ, `next`).
3. Write `engine.ts`. Media tools use `ctx.ffmpeg`; others use their own open-source library (lazy-loaded inside `engine.ts` so it only downloads on that tool's page).
4. Write `selftest.ts` (synthetic fixture + pass/fail check) and a unit test. Add `seo.md` (the long-form text for the tool page: what it does, how to use it, who it is for, limits).
5. `pnpm check-tools` (also in CI): validates every manifest, runs every unit test, checks that each `live` tool has FAQ, limits, selftest and SEO text, checks bundle size budgets (below).
6. Open the dev server: the tool appears on home, `/tools`, its category page, search, sitemap, with its own OG image. Set `status:'live'`, push, Vercel deploys.
Write this as `docs/ADD_A_TOOL.md` with a copy-paste example. The scaffold + checks must make it **impossible to ship a half-finished tool**.

**Performance budgets (enforced by `check-tools`):** home page JS ≤ 150 KB gzip; a tool's own chunk ≤ 150 KB gzip excluding lazily-loaded engines/models (those are listed in the manifest with sizes and shown to the user before download); LCP < 2.5 s on a mid phone profile; no tool code in the home bundle.

---

## 9. ADMIN FLOW (the admin is the founder; no database, so admin = Git + a health page)

**Day-to-day admin actions and where they happen**
| Need | How |
|---|---|
| Add / edit a tool | Git: add `tools/<id>`, push. Vercel deploys a preview URL; merge to main for production |
| Hide a tool instantly | Set `status:'hidden'` and push (about a minute), or use the kill switch below |
| **Kill switch** (a tool is broken in production) | Env var `PEGBOX_DISABLED_TOOLS=voice-cleaner,silence-cutter`, exposed through `GET /api/flags` (edge-cached ≤ 60 s). The shell checks it on tool pages and shows "This tool is paused for fixing" and refuses to load the engine. Changing the env var and redeploying is acceptable if you cannot make it live without redeploy; record which in `ADMIN.md` |
| Announcements | `apps/web/src/lib/announcement.ts` (string or null) shown as a thin banner |
| Featured / popular | `apps/web/src/lib/featured.ts` |
| Feedback | `mailto:` plus a "Report a problem" link to a public GitHub issue form with a template (tool id, browser, what happened). Never collect files |
| Usage numbers | Privacy-friendly analytics dashboard (see 11) |

**`/admin` (protected, no accounts):** Basic-auth in middleware using `ADMIN_USER` / `ADMIN_PASSWORD` env vars, `noindex`. It shows:
1. **Registry table:** every tool, status, category, runtime, engine sizes, `addedOn`, link, kill-switch state.
2. **Self-test runner:** a button that runs each tool's `selftest.ts` **in the admin's own browser** (fixtures are generated locally with `make-fixtures.mjs`; no files exist elsewhere), and reports pass/fail, duration, peak memory estimate and engine diagnostics. Use it after every deploy. Results can be copied as text into a GitHub issue.
3. **Environment check:** which headers are active (COEP/COOP), ffmpeg core version, WebAssembly features detected.
Optional: run the same self-tests in CI with Playwright against the preview URL on every pull request.

---

## 10. TECH STACK (all free / open source)

Next.js (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui (Radix) + Lucide + Framer Motion · Zod · Zustand (in-memory state) · fuse.js or cmdk · `@ffmpeg/ffmpeg` + `@ffmpeg/util` (verify the installed version's API; the mount API is in 0.12.x) · `sharp` (brand script) · Vitest · Playwright · ESLint/Prettier · GitHub Actions CI (lint, typecheck, unit tests, `check-tools`, Playwright smoke on preview).
Keep the app **hosting-agnostic**: no Vercel-only storage/KV/edge-config APIs, so the site can move to another host later (section 14). Middleware (admin auth) and `/api/flags` are the only server code.

---

## 11. PRIVACY, SECURITY, SEO, ANALYTICS

**Privacy promise (and how to prove it):** user files are processed locally. Acceptance test A8 proves it by inspecting network traffic during a full job: zero requests carry file bytes. The privacy page says exactly what is true: engine files are downloaded; files are not uploaded; no file contents or names are collected; analytics counts events only.
**Security:** strict CSP (self + the analytics host only; `worker-src 'self' blob:`; `wasm-unsafe-eval` only if required and documented), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, no inline user HTML, no third-party scripts on tool pages. Validate files by extension **and** by probing content; handle malformed files without crashing the tab. Admin auth uses constant-time comparison. Secrets only in env vars; commit `.env.example`.
**Analytics (optional, off if the env var is missing):** a privacy-friendly option with a free tier (Cloudflare Web Analytics, Umami, or Plausible self-host; verify current terms). Events: `tool_opened`, `file_chosen` (size bucket only), `run_started`, `run_succeeded` (duration bucket), `run_failed` (error code), `download_clicked`. **Never** send file names, paths or contents. No cookies banner needed if no cookies are used; confirm.
**SEO:** server-rendered pages, per-page `metadata`, canonical URLs, `sitemap.xml` generated from the registry, `robots.txt`, JSON-LD (`SoftwareApplication` per tool, `FAQPage`, `BreadcrumbList`), per-tool OG image via `next/og` using the tool's name and category color, internal links between related tools and categories. Tool pages target the phrases in each tool's `keywords` and `seo.md` (e.g. "remove background noise from video online", "remove silence from audio online"). Write real, useful text; no keyword stuffing.
**Legal pages (drafts):** `/privacy`, `/terms`, `/contact`, `/licenses`. List open-source licenses and links to the source of ffmpeg.wasm and the model (see section 15). `LEGAL_TODO.md`: a professional must review these.

---

## 12. BUILD ORDER AND ACCEPTANCE (post results of each phase)

**Phase 0 — Spike (no UI):** load ffmpeg.wasm in a Worker; run the capability gate; run Hush and Cut sequences on `make-fixtures.mjs` output and on one real 5-minute video; record speed, peak memory, failures on desktop Chrome, Firefox, Safari and a real phone. Write `docs/BENCHMARKS.md` and `docs/LIMITS.md` (max MB/minutes per tool per device class). Decide single- vs multi-thread. **Exit:** gate passed or Plan B/C chosen; numbers written.
**Phase 1 — Foundation:** monorepo, tokens, fonts, base layout, header/footer, brand assets, tool-kit package, categories, `gen-registry`, `check-tools`, `new-tool`, CI. **Exit:** a dummy tool created with `pnpm new-tool` appears everywhere with zero shell edits, then is deleted.
**Phase 2 — Workspace shell:** `ToolWorkspace` (drop zone, presets, advanced form from schema, progress, result, A/B player, clear-everything), media host in Worker, support checks, cancel, memory-error handling. Test with the dummy tool and a trivial media tool.
**Phase 3 — Hush port:** matches the Node reference on fixtures; real-voice test A3.
**Phase 4 — Cut port:** matches fixture numbers within ±0.3 s; test A4; chaining Hush → Cut in memory.
**Phase 5 — Site:** home, tools, category pages, tool pages with SEO text, FAQ, about, legal drafts, sitemap, OG images, analytics (optional), brand script outputs.
**Phase 6 — Admin and hardening:** `/admin`, kill switch, self-test runner, CSP/headers, offline behaviour after first load, accessibility pass, Lighthouse, load of 5 sequential large files (memory returns to baseline), docs (`ADD_A_TOOL.md`, `ADMIN.md`, `SCALING.md`, `ACCEPTANCE.md`).

**Acceptance tests (record in `ACCEPTANCE.md`):**
- **A1** 20 s video, 5 min video, and the largest allowed file finish and play correctly (desktop). Record time and peak memory.
- **A2** mp3 and wav in → mp3 and wav out for both tools; mp4 in → mp4 out.
- **A3 voice quality (most important):** at least 3 real recordings (quiet room, fan/AC, street/crowd). Listen to `natural`, `balanced`, `strong`; write which is best and whether the voice sounds echoey, robotic or clipped. If `balanced` shows artifacts, tune the PRESETS knobs (`mix`, `afftdn nr`, gate `range`/`release`), re-test and record final values.
- **A4** Cut on a real talking video: no clipped first syllables (raise padding if so), no clicks at joins (if clicks, add a 10–15 ms audio fade at cut points). Compare with fixture numbers.
- **A5** Cancel mid-job frees memory; closing the tab mid-job leaves nothing behind; a corrupt file and a no-audio file give friendly messages; an oversize file is refused **before** work starts.
- **A6** Phone (360 px, a mid-range Android and an iPhone if available): upload → run → download works within the documented mobile limit; the "keep this tab open" notice appears.
- **A7** Lighthouse on home and one tool page: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- **A8 privacy proof:** during a full job, devtools/Playwright network log shows no request containing file bytes; no writes to IndexedDB/localStorage with file data.
- **A9 scalability proof:** generate 100 fake tools with a script in a throwaway branch: build passes, home still fast, search works, sitemap lists all; then discard.
- **A10** Adding a real third tool (a trivial one, e.g. "Audio Trimmer") following only `docs/ADD_A_TOOL.md` takes under 30 minutes and edits zero shared files.

**Definition of done:** a new visitor lands on a tool page, drops a real video, gets a cleaner result with the A/B player, downloads it on a phone, and never creates an account or uploads a byte; and a developer adds tool #3 in under 30 minutes without touching the shell.

---

## 13. ENVIRONMENT VARIABLES (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=https://pegbox.example
ADMIN_USER=
ADMIN_PASSWORD=
PEGBOX_DISABLED_TOOLS=            # comma-separated tool ids, empty = none
NEXT_PUBLIC_ANALYTICS_ID=         # optional; analytics is off when empty
NEXT_PUBLIC_CONTACT_EMAIL=
```
No other secrets exist in v1.

---

## 14. HOSTING (Vercel free for now) AND THE MONEY RULE

- Deploy the static/SSG Next.js app to Vercel. Free preview URL per branch; production on the founder's domain when ready. The ffmpeg core and model are static files under `public/`; confirm the deploy accepts their size and note it in `DECISIONS.md`.
- **Important rule (verified in Vercel's current docs):** the Hobby plan is restricted to **non-commercial personal use**. Ads, donation buttons, paid features or affiliate links make the project commercial and require a paid plan (or another host). So: **v1 has no ads, no payments, no donation links.** Check Vercel's fair-use page again before launch.
- Money later (do not build now): keep `apps/web/src/lib/policy.ts` as the single place for limits and feature flags, keep the app host-agnostic, and write in `SCALING.md` the migration options (move to a host whose free tier allows commercial use, or upgrade) and the monetization ideas that fit a free tool (non-intrusive ads, "support us" link, a paid tier for server-heavy tools). Accounts/credits are only reconsidered when the first `runtime:'server'` tool exists.

---

## 15. OPEN ITEMS FOR THE FOUNDER (not for the agent to decide)

1. **Name check — not done.** "Pegbox" has NOT been verified for domain or trademark. Search results cannot prove availability. Before committing, check `pegbox.com/.in/.app/.io`, social handles, the IP India trademark search, and a general web search. Fallbacks to test: **Toolbloom, Kitnest, Workpeg, Benchlet**. (Names containing "tool" or "yard"/"kit" are crowded: Toolyard, Online Tool Yard, Toolr, Toolixy and CreatorKit Studio already exist.) If the name changes, only `brand/` text, the wordmark and `NEXT_PUBLIC_SITE_URL` change.
2. **Licenses — to confirm** (`docs/LICENSES.md`): (a) the RNNoise model `bd.rnnn` comes from the public `GregorR/rnnoise-models` repo, whose README says the models are not subject to copyright; the training data sources are separate, so confirm if you plan to monetize; (b) the standard ffmpeg.wasm core is built with GPL components (e.g. libx264). Sending it to browsers is distribution, so publish the license notices and a link to the corresponding source on `/licenses`, or choose an LGPL-only build; ask a professional if unsure.
3. **Hosting vs money** (section 14).
4. **Real-voice test A3** needs your own recordings; synthetic tests prove the plumbing, not the sound quality.
5. Hindi UI later; names and copy are ready for `next-intl`.

---

## 16. FINAL INSTRUCTION TO THE AGENT

Start with section 0 (unzip the kit), then Phase 0. At the end of each phase post: what you built, how to run it, acceptance results (pass/fail with notes), and decisions made in `DECISIONS.md`. Do not skip phases. Do not add accounts, payments, or a database. Do not edit the shell to add a tool.
