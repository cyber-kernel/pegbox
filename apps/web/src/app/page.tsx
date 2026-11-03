import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllManifests } from '@/lib/registry.generated';
import { ToolCatalog } from '@/components/workspace/ToolCatalog';
import { POPULAR_TOOL_IDS } from '@/lib/featured';
import { ToolCard } from '@/components/workspace/ToolCard';
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pegbox — Free, Browser-Native File Tools. Pick a tool. Drop a file. Done.',
  description:
    'Free online audio and video tools that process directly on your device. Clean noise, cut silence, and edit creator media with 100% privacy and zero uploads.',
};

export default function HomePage() {
  const allManifests = getAllManifests();
  const popularTools = allManifests.filter((m) => POPULAR_TOOL_IDS.includes(m.id));

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-surface/60 via-bg to-bg border-b border-line">
        <div className="max-w-[1200px] mx-auto text-center space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Runs 100% in your browser · Zero server uploads</span>
          </div>

          {/* Hero Heading */}
          <h1
            className="font-heading font-bold text-4xl sm:text-6xl text-ink tracking-tight max-w-3xl mx-auto leading-[1.1]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Pick a tool. Drop a file.{' '}
            <span className="text-primary underline decoration-primary/30 underline-offset-8">
              Done.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Pegbox is a growing pegboard of fast, browser-native file tools. Clean background noise,
            jump-cut silences, and edit media directly on your device.
          </p>

          {/* Quick Stat Chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Instant Local Processing
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              100% Client-Side Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              WebAssembly & Workers
            </span>
          </div>
        </div>
      </section>

      {/* 2. POPULAR LAUNCH TOOLS */}
      {popularTools.length > 0 && (
        <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 border-b border-line">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="font-heading font-bold text-xl text-ink">Popular Tools</h2>
            </div>
            <Link
              href="/tools"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all tools <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} manifest={tool} />
            ))}
          </div>
        </section>
      )}

      {/* 3. FULL CATALOG SECTION */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-ink">Browse The Pegboard</h2>
            <p className="text-xs text-muted mt-0.5">Filter by category or search by task</p>
          </div>
        </div>

        <ToolCatalog manifests={allManifests} />
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="w-full bg-surface border-y border-line py-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink">
              How Pegbox Works
            </h2>
            <p className="text-sm text-muted">
              Built on modern browser standards for speed, security, and unlimited free usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-card bg-bg border border-line shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-control bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="font-heading font-semibold text-lg text-ink">1. Pick a Peg</h3>
              <p className="text-xs text-muted leading-relaxed">
                Choose the exact file utility you need from our growing board of tools. Every tool is
                self-contained and code-split.
              </p>
            </div>

            <div className="p-6 rounded-card bg-bg border border-line shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-control bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="font-heading font-semibold text-lg text-ink">2. Drop Your File</h3>
              <p className="text-xs text-muted leading-relaxed">
                Drag and drop your audio or video file. WebAssembly compiles and executes the algorithms
                directly on your device processor.
              </p>
            </div>

            <div className="p-6 rounded-card bg-bg border border-line shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-control bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="font-heading font-semibold text-lg text-ink">3. Download & Done</h3>
              <p className="text-xs text-muted leading-relaxed">
                Compare your result with the synchronized A/B player, download your clean media, or chain
                to the next tool in memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRIVACY PROMISE */}
      <section className="w-full py-16 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto rounded-card bg-gradient-to-br from-primary/5 via-surface to-bg border border-primary/20 p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink">
            Our Zero-Upload Privacy Promise
          </h2>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Pegbox was built on a simple premise: your creative work belongs to you. Because tools run
            via client-side Web Workers, we never see, store, or transmit your media.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary bg-bg border border-primary/30 rounded-control shadow-xs hover:bg-white transition-colors"
            >
              Learn about our architecture <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

