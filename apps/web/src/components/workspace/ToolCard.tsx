import Link from 'next/link';
import type { ToolManifest } from '@pegbox/tool-kit';
import { CATEGORIES } from '@pegbox/tool-kit';
import { isPopularTool, isNewTool } from '@/lib/featured';
import {
  Volume2,
  Video,
  Image as ImageIcon,
  FileText,
  Code2,
  Wrench,
  Scissors,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface ToolCardProps {
  manifest: ToolManifest;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Volume2,
  Video,
  Image: ImageIcon,
  FileText,
  Code2,
  Wrench,
  Scissors,
  Sparkles,
};

export function ToolCard({ manifest }: ToolCardProps) {
  const categoryMeta = CATEGORIES[manifest.category];
  const IconComponent = ICON_MAP[manifest.icon] || Wrench;
  const isPopular = isPopularTool(manifest.id);
  const isNew = isNewTool(manifest.addedOn);

  return (
    <Link
      href={`/tools/${manifest.id}`}
      className="group relative flex flex-col justify-between p-5 rounded-card bg-bg border border-line hover:border-primary/40 shadow-card hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3.5">
          {/* Category Icon Tile */}
          <div
            className="w-11 h-11 rounded-control flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: `var(${categoryMeta?.tokens.tintVar || '--cat-util-tint'})`,
              color: `var(${categoryMeta?.tokens.fillVar || '--cat-util-fill'})`,
            }}
          >
            <IconComponent className="w-5 h-5 stroke-[1.8]" />
          </div>

          {/* Badges: New / Popular / Beta */}
          <div className="flex items-center gap-1.5">
            {isNew && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-text bg-primary/10 rounded-pill font-mono">
                New
              </span>
            )}
            {isPopular && !isNew && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cat-video-text bg-cat-video-tint rounded-pill font-mono">
                Popular
              </span>
            )}
            {manifest.status === 'beta' && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted bg-surface-2 rounded-pill font-mono">
                Beta
              </span>
            )}
            <ArrowUpRight className="w-4 h-4 text-muted/40 group-hover:text-primary transition-colors ml-0.5" />
          </div>
        </div>

        <h3 className="font-heading font-bold text-base text-ink group-hover:text-primary transition-colors leading-tight mb-1">
          {manifest.name}
        </h3>

        <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
          {manifest.tagline}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs">
        <span
          className="font-medium text-[11px]"
          style={{ color: `var(${categoryMeta?.tokens.textVar || '--ink'})` }}
        >
          {categoryMeta?.label || manifest.category}
        </span>
        <span className="text-muted text-[11px] font-mono">
          {manifest.input.extensions.slice(0, 3).map(e => '.' + e).join(' ')}
          {manifest.input.extensions.length > 3 ? ' +' : ''}
        </span>
      </div>
    </Link>
  );
}

