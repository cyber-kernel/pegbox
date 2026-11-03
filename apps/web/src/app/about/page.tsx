import type { Metadata } from 'next';
import { ShieldCheck, Cpu, Heart, Layers, Lock, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Pegbox — Browser-Native Architecture & Privacy',
  description: 'How Pegbox works: 100% client-side file tools running on WebAssembly and Web Workers. Why it is free, safe, and private forever.',
};

export default function AboutPage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-14 space-y-12">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary/10 text-primary text-xs font-semibold font-mono">
          Architecture & Philosophy
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-5xl text-ink tracking-tight">
          About Pegbox
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Pegbox is an open collection of small file utilities designed to do one thing exceptionally
          well: process files right inside your browser without uploading your media to any server.
        </p>
      </div>

      <div className="space-y-8 text-sm text-muted leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-2xl text-ink">The "Pegboard" Concept</h2>
          <p>
            In a craftsman's workshop, a pegboard holds dedicated, reliable hand tools within arm's
            reach. When you need to trim a board or drive a nail, you don't rent a warehouse—you reach
            for a peg.
          </p>
          <p>
            Pegbox applies that exact principle to everyday creator utilities. Each tool is an
            isolated peg designed for a specific task: clean noise, jump-cut silence, convert video, or
            format text.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-card bg-surface border border-line">
          <div className="flex items-center gap-2 text-ink font-heading font-bold text-lg">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>Why Hosting Stays Free & Safe</span>
          </div>
          <p>
            Traditional SaaS web services burn thousands of dollars every month storing user uploads,
            running massive GPU rendering clusters, and hiring teams to clean up abandoned data.
          </p>
          <p>
            Pegbox completely upends this cost structure. By leveraging modern <strong>WebAssembly (WASM)</strong> and <strong>Web Workers</strong>, heavy computing occurs on the processor already sitting on your desk or in your pocket. Because our servers never ingest your video or audio files:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-ink/80 font-medium">
            <li>Hosting expenses stay practically zero (static edge hosting).</li>
            <li>We have no user files to store, secure, leak, or delete.</li>
            <li>No user accounts, subscriptions, or credit card forms are needed.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-2xl text-ink">How The Engine Works</h2>
          <p>
            When you launch an audio or video tool on Pegbox:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <strong>Lazy-Loading</strong>: The WebAssembly core is downloaded on-demand and cached in your browser. Subsequent visits run instantly even if your internet disconnects.
            </li>
            <li>
              <strong>Worker Isolation</strong>: Computation executes inside an isolated background Web Worker thread, keeping your UI fluid at 60 FPS.
            </li>
            <li>
              <strong>Memory Reclamation</strong>: As soon as your download is ready, intermediate buffers are cleared, and the worker process is terminated to return system RAM to your OS.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

