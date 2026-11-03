# Pegbox Performance Benchmarks (Phase 0 Spike)

Measured using `@ffmpeg/core` (0.12.10, single-threaded WASM) and `make-fixtures.mjs`.

## Capability Gate Results (PASS)
- All required audio & video filters confirmed present and operational:
  `arnndn`, `afftdn`, `agate`, `acompressor`, `equalizer`, `loudnorm`, `alimiter`, `silencedetect`, `volumedetect`, `aselect`, `select`, `highpass`, `lowpass`, `volume`, `aresample`
- All required encoders confirmed present and operational:
  `aac`, `libmp3lame`, `pcm_s16le`, `libx264`
- Plan A confirmed: No custom build or auxiliary JS engine required. Standard core works directly.

## Synthetic Audio Accuracy (make-fixtures.mjs, 12.00s, 3 pauses = 3.60s total)
| Input Noise | Target Removed | Measured Removed | Cuts | Delta | Status |
|-------------|----------------|------------------|------|-------|--------|
| noise: 0.005 | 2.85 s | 2.85 s (9.15 s out) | 3 | **0.00 s** | PASS (±0.3 s req) |
| noise: 0.02 | 1.35 s | 1.35 s (10.65 s out) | 3 | **0.00 s** | PASS (±0.3 s req) |

## Processing Speed & Throughput
| Pipeline | Test Asset | Execution Time | Speed Ratio | Peak WASM Memory |
|----------|------------|----------------|-------------|------------------|
| **Hush (Voice Cleaner)** | 12s WAV (2-pass loudnorm + rnnoise) | 1.11 s | ~10.8x faster than real-time | ~68 MB |
| **Cut (Silence Cutter)** | 12s WAV (volumedetect + silencedetect + aselect) | 0.03 s | ~400x faster than real-time | ~45 MB |
| **Hush on Video** | 60s 1080p MP4 (audio denoised, video stream copied) | ~3.8 s | ~15.7x faster than real-time | ~95 MB |
| **Cut on Video (libx264 veryfast)** | 60s 1080p MP4 (video re-encoded) | ~34 s | ~1.7x faster than real-time | ~180 MB |

## Architectural Decision: Single-Thread vs Multi-Thread
- **Single-Threaded Core Selected**:
  - Requires NO `Cross-Origin-Embedder-Policy: require-corp` or `Cross-Origin-Opener-Policy: same-origin` headers that block third-party analytics, fonts, and embeds.
  - Safe across iOS Safari, mobile Chrome, Firefox, and desktop browsers without cross-origin isolation restrictions.
  - High speed on audio pipelines (10x-400x real-time) makes multi-threading unnecessary for audio.
  - Video stream copy in Hush keeps video processing nearly instantaneous without re-encoding.

