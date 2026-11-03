import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open Source Licenses & Notices',
  description: 'Open source credits, licenses, and source code references for Pegbox tools.',
};

export default function LicensesPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-10 text-sm text-muted leading-relaxed">
      <div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-ink tracking-tight mb-2">
          Open Source Licenses
        </h1>
        <p className="text-sm text-muted">
          Pegbox is built on the shoulders of the open-source community. Here are the notices and links
          to the open projects and models that make our browser-native tools possible.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-5 rounded-control bg-surface border border-line space-y-2">
          <h2 className="font-heading font-bold text-base text-ink">
            ffmpeg.wasm & @ffmpeg/core
          </h2>
          <p className="text-xs">
            Compiled WebAssembly build of FFmpeg with libx264, libmp3lame, and audio filters.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
            <span>License: GPL v3 / LGPL v2.1</span>
            <a
              href="https://github.com/ffmpegwasm/ffmpeg.wasm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-sans font-medium"
            >
              Source Code & Build Instructions →
            </a>
          </div>
        </div>

        <div className="p-5 rounded-control bg-surface border border-line space-y-2">
          <h2 className="font-heading font-bold text-base text-ink">
            RNNoise Model (bd.rnnn)
          </h2>
          <p className="text-xs">
            Recurrent neural network weights for speech denoising and vocal formant isolation.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
            <span>Model: GregorR / rnnoise-models</span>
            <a
              href="https://github.com/GregorR/rnnoise-models"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-sans font-medium"
            >
              Model Repository →
            </a>
          </div>
        </div>

        <div className="p-5 rounded-control bg-surface border border-line space-y-2">
          <h2 className="font-heading font-bold text-base text-ink">
            Next.js & React
          </h2>
          <p className="text-xs">
            Web application framework and UI library.
          </p>
          <div className="text-xs font-mono pt-1">
            <span>License: MIT (Vercel, Inc. & Meta Platforms, Inc.)</span>
          </div>
        </div>

        <div className="p-5 rounded-control bg-surface border border-line space-y-2">
          <h2 className="font-heading font-bold text-base text-ink">
            Lucide Icons
          </h2>
          <p className="text-xs">
            Clean, beautiful vector iconography.
          </p>
          <div className="text-xs font-mono pt-1">
            <span>License: ISC License</span>
          </div>
        </div>
      </div>
    </div>
  );
}

