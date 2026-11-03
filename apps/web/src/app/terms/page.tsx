import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for using Pegbox file utilities.',
};

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-8 text-sm text-muted leading-relaxed">
      <div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-ink tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-muted font-mono">Last updated: November 3, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Pegbox, you agree to be bound by these Terms of Service. If you do not
          agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink">2. License & Local Processing</h2>
        <p>
          Pegbox provides client-side WebAssembly utilities for personal, educational, and commercial
          file editing on your own devices. You retain 100% intellectual property ownership of all files
          processed using Pegbox.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink">3. Disclaimer of Warranty</h2>
        <p>
          The materials and tools on Pegbox are provided on an 'as is' basis without warranties of any
          kind, either express or implied. Pegbox does not guarantee that file transformations will be
          error-free, that files will not be altered unexpectedly, or that results will meet specific
          audio/visual production expectations. Always retain original copies of your files.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink">4. Limitation of Liability</h2>
        <p>
          In no event shall Pegbox or its contributors be liable for any damages (including, without
          limitation, damages for loss of data or profit) arising out of the use or inability to use the
          materials or tools on Pegbox.
        </p>
      </section>
    </div>
  );
}

