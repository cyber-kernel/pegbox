import type { Metadata } from 'next';
import { getAllManifests } from '@/lib/registry.generated';
import { ToolCatalog } from '@/components/workspace/ToolCatalog';

export const metadata: Metadata = {
  title: 'All Tools',
  description: 'Explore the complete directory of free, private, browser-native file tools on Pegbox.',
};

export default function ToolsPage() {
  const manifests = getAllManifests();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-ink tracking-tight mb-2">
          All Tools
        </h1>
        <p className="text-sm text-muted">
          Browse our full collection of browser-native utilities. Fast, free, and 100% private.
        </p>
      </div>

      <ToolCatalog manifests={manifests} syncUrl={true} />
    </div>
  );
}

