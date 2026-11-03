import type { Metadata } from 'next';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description: 'Answers to common questions about Pegbox privacy, browser compatibility, limits, and how our on-device tools work.',
};

export default function FaqPage() {
  const faqs = [
    {
      q: 'Are my files really never uploaded to any server?',
      a: 'Yes, 100%. User files never leave your computer or phone. Everything—decoding, neural denoising, silence calculation, video cutting, and re-encoding—happens in your browser via WebAssembly. You can inspect DevTools Network tab during any full job: zero request bytes contain your file.',
    },
    {
      q: 'Why is Pegbox free? What is the catch?',
      a: 'There is no catch. Because file processing happens on your device rather than our servers, we have zero compute or cloud storage costs. The website is hosted as static files on Vercel free tier. There are no paid subscriptions, no tracking cookies, and no credit card gates.',
    },
    {
      q: 'What browsers and devices are supported?',
      a: 'Pegbox runs on all modern browsers supporting WebAssembly and Web Workers: Google Chrome, Apple Safari (iOS 15+ & macOS), Microsoft Edge, and Mozilla Firefox.',
    },
    {
      q: 'What are the file size limits?',
      a: 'For audio files, desktop browsers easily handle up to 500 MB (up to 2 hours of recording). For video, files up to 1 GB are supported in Voice Cleaner and up to 500 MB in Silence Cutter. On mobile phones, memory limits are capped at 150 MB.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. After the first time you load a tool and its WebAssembly engine is cached by your browser, you can process files even if your internet connection is completely offline.',
    },
    {
      q: 'Can I chain multiple tools together?',
      a: 'Yes! For example, after running Voice Cleaner (Hush), click "Continue with Silence Cutter" to immediately jump-cut the pauses without re-downloading or re-dropping your file. The file is handed off in memory.',
    },
  ];

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary/10 text-primary text-xs font-semibold font-mono">
          Help & Support
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-5xl text-ink tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted">
          Everything you need to know about Pegbox tools, privacy, and technology.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group border border-line rounded-control p-5 bg-surface open:bg-bg transition-colors"
          >
            <summary className="font-heading font-semibold text-base text-ink cursor-pointer list-none flex items-center justify-between">
              <span>{faq.q}</span>
              <ChevronDown className="w-4 h-4 text-muted group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-3 text-sm text-muted leading-relaxed pt-2 border-t border-line/60">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

