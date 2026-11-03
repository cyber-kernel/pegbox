# Pegbox Architecture & Scaling Plan (SCALING.md)

Pegbox is engineered to scale seamlessly from 2 tools to 100+ tools while remaining completely free to host and operate on Vercel's free/hobby tier.

## Core Scaling Principles

### 1. Zero Server Storage & Compute
- All file processing in v1 runs 100% on the user's client hardware using WebAssembly and Web Workers.
- Server bandwidth is strictly limited to serving static HTML/JS/CSS, wasm binaries (cached immutably for 1 year), and public assets.
- No database, no user accounts, no storage buckets. Cost to host 100 tools is functionally identical to hosting 2 tools.

### 2. Code-Splitting & Zero Home Bundle Bloat
- Every tool's engine is dynamically imported via `load: () => import('./engine')`.
- Manifests are lightweight metadata objects (~400 bytes each) stored in `registry.generated.ts`.
- At 100 tools, the entire manifest registry is under 45 KB gzipped.
- Heavy dependencies (e.g. ffmpeg wasm core ~31 MB, models ~300 KB) are downloaded on-demand only when a media tool is opened or a file is dropped.

### 3. Client-Side Virtualization & Search
- Tool search is powered by client-side fuzzy search (Fuse.js) indexing names, tags, keywords, and descriptions.
- The UI grid automatically supports virtualization or pagination if the tool count exceeds 150 items.

### 4. Future Server Runtime (`runtime: 'server'`)
For future tools that exceed browser memory limits (e.g., massive 5GB+ video transcoders or 7B parameter local LLMs):
- The `ToolManifest` interface already includes `runtime: 'server'`.
- Vercel functions cannot be used for multi-gigabyte files due to request-size limits (4.5 MB serverless limit) and maximum duration caps.
- Any server runtime will be deployed to a separate stateless worker host (such as a Hetzner/Fly.io VM or free-tier AI cluster).
- Server tools will stream files in, process them in RAM/tmpfs, stream results back, and immediately delete all buffers.
- Such tools will display an honest privacy indicator ("Processed on our stateless server, deleted immediately").

