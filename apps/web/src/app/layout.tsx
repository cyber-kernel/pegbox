import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/shell/Header';
import { Footer } from '@/components/shell/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pegbox.vercel.app'),
  title: {
    default: 'Pegbox — Browser-Native File Tools. Pick a tool. Drop a file. Done.',
    template: '%s | Pegbox',
  },
  description:
    'Pegbox is a growing collection of simple file tools for creators and everyday users. Clean noise, cut silence, convert files entirely in your browser with 100% privacy.',
  keywords: [
    'audio cleaner',
    'silence cutter',
    'remove background noise',
    'browser file tools',
    'pegbox',
    'jump cut video',
    'private file converter',
  ],
  icons: {
    icon: [
      { url: '/brand/pegbox-favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/png/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/png/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/brand/png/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Pegbox — Free, Private Browser File Tools',
    description: 'Runs in your browser · Your files never leave your device · 100% Free',
    siteName: 'Pegbox',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Sora:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-bg text-ink font-body antialiased selection:bg-primary/20 selection:text-primary">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
