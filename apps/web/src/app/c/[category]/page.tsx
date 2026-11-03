import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, CATEGORY_LIST } from '@pegbox/tool-kit';
import { getManifestsByCategory } from '@/lib/registry.generated';
import { ToolCard } from '@/components/workspace/ToolCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return CATEGORY_LIST.map((c) => ({
    category: c.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!meta) return { title: 'Category Not Found' };

  return {
    title: `${meta.label} Tools`,
    description: meta.seoBlurb,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!meta) notFound();

  const tools = getManifestsByCategory(category);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 w-full space-y-10">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to all tools
      </Link>

      <div className="space-y-3 max-w-2xl">
        <div
          className="inline-block px-3 py-1 rounded-pill text-xs font-semibold uppercase tracking-wider font-mono"
          style={{
            backgroundColor: `var(${meta.tokens.tintVar})`,
            color: `var(${meta.tokens.textVar})`,
          }}
        >
          {meta.label}
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-ink tracking-tight">
          {meta.label} Tools
        </h1>
        <p className="text-sm text-muted leading-relaxed">{meta.seoBlurb}</p>
      </div>

      {tools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((m) => (
            <ToolCard key={m.id} manifest={m} />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-card bg-surface border border-line text-center max-w-md">
          <p className="text-sm text-muted">More tools coming soon to {meta.label}.</p>
        </div>
      )}
    </div>
  );
}

