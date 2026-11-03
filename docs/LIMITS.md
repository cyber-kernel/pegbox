# Pegbox Device Limits & File Size Budgets

Based on real memory ceilings of WebAssembly in modern browsers (standard 2 GB WebAssembly heap limit, iOS Safari ~1 GB tab limit).

## Limits by Tool & Device Class

### Hush (Voice Cleaner)
- **Input Types**: Video (`.mp4`, `.mov`, `.mkv`, `.webm`, etc.) and Audio (`.mp3`, `.wav`, `.m4a`, etc.)
- **Desktop (Chrome / Edge / Firefox / Safari)**:
  - Audio: Max **500 MB** / Up to **2 hours**
  - Video: Max **1 GB** / Up to **1 hour** (video stream is copied without re-encoding, so memory is dominated by extracted 48kHz mono audio)
- **Mobile (iOS Safari, Android Chrome)**:
  - Audio: Max **150 MB** / Up to **45 minutes**
  - Video: Max **300 MB** / Up to **20 minutes**

### Cut (Silence Cutter)
- **Desktop**:
  - Audio: Max **500 MB** / Up to **2 hours**
  - Video: Max **500 MB** / Up to **30 minutes** (video re-encode requires significant frames in flight)
- **Mobile**:
  - Audio: Max **150 MB** / Up to **45 minutes**
  - Video: Max **150 MB** / Up to **10 minutes**

## Memory Reclamation Strategy
1. **Worker Lifecycle**: The Web Worker and its Emscripten instance are completely terminated upon job completion or cancellation (`worker.terminate()`).
2. **Intermediate Cleanup**: In-memory virtual FS files (`raw.wav`, `clean.wav`, `graph.txt`) are unlinked immediately after use.
3. **Blob URL Revocation**: Object URLs created for previewing before/after are revoked when a new file is loaded or when "Clear everything" is triggered.

