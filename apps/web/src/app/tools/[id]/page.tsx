import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { MANIFESTS, getManifest, getAllManifests } from '@/lib/registry.generated';
import { CATEGORIES } from '@pegbox/tool-kit';
import { ToolWorkspace } from '@/components/workspace/ToolWorkspace';
import { ToolCard } from '@/components/workspace/ToolCard';
import {
  ShieldCheck,
  Cpu,
  ArrowLeft,
  ChevronDown,
  Info,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface ToolPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MANIFESTS.map((m) => ({
    id: m.id,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const m = getManifest(id);
  if (!m) return { title: 'Tool Not Found' };

  return {
    title: `${m.name} — ${m.tagline}`,
    description: m.description,
    keywords: m.keywords,
    openGraph: {
      title: `${m.name} | Pegbox`,
      description: m.description,
      type: 'website',
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const manifest = getManifest(id);
  if (!manifest) notFound();

  const categoryMeta = CATEGORIES[manifest.category];

  // Read seo.md if it exists
  let seoContent = '';
  try {
    const seoPath = path.resolve(process.cwd(), '../../tools', id, 'seo.md');
    if (fs.existsSync(seoPath)) {
      seoContent = fs.readFileSync(seoPath, 'utf-8');
    }
  } catch (_) {}

  // Related tools: same category + next tools, excluding current tool
  const allTools = getAllManifests();
  const relatedTools = allTools
    .filter(
      (t) =>
        t.id !== manifest.id &&
        (t.category === manifest.category || manifest.next?.includes(t.id))
    )
    .slice(0, 3);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: manifest.name,
        operatingSystem: 'Any',
        applicationCategory: manifest.category === 'audio' || manifest.category === 'video' ? 'MultimediaApplication' : 'UtilityApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: manifest.description,
      },
      {
        '@type': 'FAQPage',
        mainEntity: manifest.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: process.env.NEXT_PUBLIC_SITE_URL || 'https://pegbox.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tools',
            item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pegbox.vercel.app'}/tools`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: manifest.name,
            item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pegbox.vercel.app'}/tools/${manifest.id}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full flex flex-col items-center">
        {/* Tool Header */}
        <section className="w-full py-10 sm:py-14 px-4 sm:px-6 bg-gradient-to-b from-surface/80 via-bg to-bg border-b border-line">
          <div className="max-w-[1200px] mx-auto space-y-4">
            {/* Breadcrumb back */}
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to tools
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/c/${manifest.category}`}
                className="px-2.5 py-0.5 rounded-pill text-[11px] font-semibold uppercase tracking-wider font-mono hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: `var(${categoryMeta?.tokens.tintVar || '--cat-util-tint'})`,
                  color: `var(${categoryMeta?.tokens.textVar || '--cat-util-text'})`,
                }}
              >
                {categoryMeta?.label || manifest.category}
              </Link>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-success-bg text-success-text text-[11px] font-medium border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3" />
                100% Client-Side
              </span>
            </div>

            <h1
              className="font-heading font-bold text-3xl sm:text-5xl text-ink tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              {manifest.name}
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
              {manifest.tagline}
            </p>
          </div>
        </section>

        {/* Interactive Tool Workspace */}
        <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <ToolWorkspace manifest={manifest} />
        </section>

        {/* Honest Limits & Disclosures */}
        {manifest.limits && manifest.limits.length > 0 && (
          <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-line space-y-3">
              <div className="flex items-center gap-2 text-ink font-heading font-semibold text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span>Honest Limits & Expectations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted leading-relaxed list-disc list-inside">
                {manifest.limits.map((limit, idx) => (
                  <li key={idx}>{limit}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Long-form SEO Content */}
        {seoContent && (
          <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-10 border-t border-line">
            <div className="prose prose-slate max-w-3xl mx-auto text-sm leading-relaxed text-muted space-y-4">
              {seoContent.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('# ')) {
                  return null; // Skip main heading (already rendered in hero)
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2
                      key={i}
                      className="font-heading font-bold text-xl text-ink pt-4 first:pt-0"
                    >
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={i} className="font-heading font-semibold text-base text-ink pt-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n').map((l) => l.replace(/^- /, ''));
                  return (
                    <ul key={i} className="list-disc list-inside space-y-1 pl-2">
                      {items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{paragraph}</p>;
              })}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {manifest.faq && manifest.faq.length > 0 && (
          <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 border-t border-line">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-bold text-2xl text-ink">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {manifest.faq.map((item, i) => (
                  <details
                    key={i}
                    className="group border border-line rounded-control p-4 bg-surface open:bg-bg transition-colors"
                  >
                    <summary className="font-heading font-semibold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                      <span>{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-muted group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-3 text-xs text-muted leading-relaxed pt-2 border-t border-line/60">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-14 border-t border-line">
            <h2 className="font-heading font-bold text-xl text-ink mb-6">
              Related Tools on the Pegboard
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedTools.map((t) => (
                <ToolCard key={t.id} manifest={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

