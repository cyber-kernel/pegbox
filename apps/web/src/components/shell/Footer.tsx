import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { CATEGORY_LIST } from '@pegbox/tool-kit';
import { ShieldCheck, Cpu, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-line mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="md" showTagline />
            <p className="text-sm text-muted leading-relaxed">
              A pegboard of small, browser-native file utilities. Pick a tool. Drop a file. Done.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-ink bg-bg rounded-pill border border-line shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>WebAssembly & Web Workers</span>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 font-mono">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {CATEGORY_LIST.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/c/${cat.id}`}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 font-mono">
              Pegbox
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-muted hover:text-ink transition-colors">
                  All Tools
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted hover:text-ink transition-colors">
                  About & Architecture
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted hover:text-ink transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted hover:text-ink transition-colors">
                  Admin & Diagnostics
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 font-mono">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted hover:text-ink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted hover:text-ink transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="text-muted hover:text-ink transition-colors">
                  Open Source Licenses
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-ink transition-colors"
                >
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Trust Line */}
        <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-ink">
              Runs in your browser · Your files never leave your device · 100% Free
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <span>Built with care for creators & makers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

