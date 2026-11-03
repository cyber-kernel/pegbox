# Voice Cleaner Online — Free, Private AI Audio & Video Denoising

## Clean Background Noise from Audio & Video Files in Your Browser
Pegbox Voice Cleaner (also known as **Hush**) is a high-performance audio restoration tool built for creators, podcasters, educators, and vloggers. It eliminates background air conditioning hum, PC fan noise, street traffic, and microphone hiss directly on your own device.

---

## Why Pegbox Voice Cleaner is Different

### 1. 100% Client-Side Privacy
Unlike traditional audio tools that upload your raw video footage or confidential voice tracks to cloud servers, Pegbox processes your files right inside your browser with WebAssembly. **Your media never leaves your device.**

### 2. Multi-Stage Studio Signal Chain
Hush is not just a blunt filter. It executes an engineered multi-stage studio chain:
- **Highpass / Lowpass Filters**: Cuts subsonic rumbles below 85 Hz and ultrasonic noise above 14,000 Hz.
- **Deep Neural Denoising**: Uses recurrent neural network weights to isolate natural vocal formants.
- **Spectral FFT Cleaning**: Subtly smooths high-frequency hiss without introducing water/phase distortion.
- **Soft Downward Expander**: Intelligently attenuates background noise between natural pauses in dialogue.
- **Presence EQ**: Cleans lower mid-frequency boxiness and brings voice clarity to the forefront.
- **Studio Compressor & True-Peak Limiter**: Evens out voice dynamics and enforces broadcast-standard loudness (e.g. -14 LUFS).

### 3. Preserves Video Quality 1:1
When you drop an MP4, MOV, MKV, or WEBM video file, the video stream is copied without re-encoding. You get back the exact same crystal-clear pixels, with brand new, noise-free audio.

---

## Which Preset Should You Choose?
- **Natural**: Best for recordings made in quiet rooms that have subtle mic hiss. Vocal timbre is 100% natural.
- **Balanced (Default)**: Best for most creators. Removes active fan noise and room hum while preserving crisp dialogue.
- **Strong**: Designed for demanding situations: noisy outdoor recordings, cafe chatter, or aggressive air conditioning.

---

## Honest Limitations
- **Room Reverb / Echo**: Hush removes continuous background noise, but acoustic wall reflections bounce at the exact same frequencies as your voice. Reducing noise can sometimes make room echo slightly more apparent.
- **Extreme Distortion**: If speech was recorded with severe clipping or inaudible whispering beneath roaring music, physical audio information cannot be synthesized.

