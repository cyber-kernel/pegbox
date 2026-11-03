# Pegbox Suggestions (SUGGESTIONS.md)

Ideas and future improvements that are not part of the v1 build prompt:

- **WebCodecs Acceleration**: For video silence cutting, use `VideoDecoder` / `VideoEncoder` + `mp4box.js` for 10x faster export than wasm x264 re-encoding where supported.
- **Hindi Localization**: Hook up `next-intl` with dictionary files for full Hindi language support.
- **Offline PWA**: Register ServiceWorker caching for ffmpeg wasm core & static tool bundles to support full offline usage.
- **Audio Worklet Visualization**: Live real-time audio waveform visualizer during playback.

