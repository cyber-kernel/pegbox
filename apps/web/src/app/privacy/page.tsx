import type { Metadata } from 'next';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Pegbox privacy policy: 100% on-device processing. We never collect, see, or transmit your files.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-10 text-sm text-muted leading-relaxed">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-success-bg text-success-text text-xs font-semibold font-mono border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero-Knowledge Privacy
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-5xl text-ink tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-base text-muted">
          Last updated: November 3, 2026.
        </p>
      </div>

      <div className="p-6 rounded-card bg-surface border border-line space-y-3">
        <h2 className="font-heading font-bold text-lg text-ink">The Short Version</h2>
        <p>
          Pegbox does not collect, transmit, or store your files. All media processing happens directly
          inside your web browser using WebAssembly and Web Workers. When you close the browser tab, all
          in-memory temporary data is immediately wiped.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-xl text-ink">1. Information We Do Not Collect</h2>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>We do NOT collect, upload, or store your files, audio, video, or documents.</li>
          <li>We do NOT collect file names, file metadata, or GPS locations.</li>
          <li>We do NOT require user accounts, emails, passwords, or payment cards.</li>
          <li>We do NOT use advertising trackers, cross-site trackers, or marketing cookies.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-xl text-ink">2. How Files Are Processed</h2>
        <p>
          When you drag and drop a file into Pegbox, your browser loads an isolated Web Worker containing
          the compiled WebAssembly binary (such as our single-threaded FFmpeg engine). The file data is
          read directly into memory on your local machine and processed on your CPU.
        </p>
        <p>
          You can verify this at any time by opening your browser's Developer Tools (F12), switching to
          the <strong>Network</strong> tab, and monitoring traffic while processing a file: zero requests
          carry your file bytes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-xl text-ink">3. Analytics & Telemetry</h2>
        <p>
          If privacy-friendly analytics is enabled, we only record high-level anonymous usage counts
          (e.g., that a tool was opened or that a run completed). We never transmit file sizes, names, or
          content.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold text-xl text-ink">4. Contact</h2>
        <p>
          Questions about this privacy policy? Contact us at{' '}
          <a
            href="mailto:support@pegbox.example"
            className="text-primary hover:underline font-medium"
          >
            support@pegbox.example
          </a>.
        </p>
      </section>
    </div>
  );
}

