'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Search, ShieldCheck, Menu, X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/tools', label: 'All Tools' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-bg/95 backdrop-blur-md border-b border-line transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Logo size="md" />

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-control transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-muted hover:text-ink hover:bg-surface-2'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Trust indicator + Search */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-success-text bg-success-bg rounded-pill border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Files never leave device</span>
          </div>

          <Link
            href="/tools"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted bg-surface hover:bg-surface-2 border border-line rounded-control transition-colors"
            aria-label="Search tools"
          >
            <Search className="w-3.5 h-3.5 text-muted" />
            <span className="hidden sm:inline">Search tools</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-bg border border-line rounded text-muted shadow-sm">
              /
            </kbd>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-ink hover:bg-surface-2 rounded-control"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-bg px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-success-text bg-success-bg rounded-control border border-emerald-200/60 mb-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side · Private & Free</span>
          </div>
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-ink hover:bg-surface-2 rounded-control"
            >
              {item.label}
            </Link>
          ))}
          <Link
            key="/c/audio"
            href="/c/audio"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-muted hover:bg-surface-2 rounded-control"
          >
            Audio Tools
          </Link>
          <Link
            key="/c/video"
            href="/c/video"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-muted hover:bg-surface-2 rounded-control"
          >
            Video Tools
          </Link>
        </div>
      )}
    </header>
  );
}

