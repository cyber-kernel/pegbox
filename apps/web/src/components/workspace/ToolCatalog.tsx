'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ToolManifest } from '@pegbox/tool-kit';
import { CATEGORY_LIST } from '@pegbox/tool-kit';
import { ToolCard } from './ToolCard';
import Fuse from 'fuse.js';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface ToolCatalogProps {
  manifests: ToolManifest[];
  initialCategory?: string;
  initialQuery?: string;
  showCategoryFilter?: boolean;
  syncUrl?: boolean;
}

export function ToolCatalog({
  manifests,
  initialCategory = 'all',
  initialQuery = '',
  showCategoryFilter = true,
  syncUrl = false,
}: ToolCatalogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fuse.js client-side search index
  const fuse = useMemo(() => {
    return new Fuse(manifests, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'shortName', weight: 0.3 },
        { name: 'tagline', weight: 0.2 },
        { name: 'keywords', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [manifests]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state to URL if requested
  useEffect(() => {
    if (!syncUrl || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');

    if (selectedCategory && selectedCategory !== 'all') {
      url.searchParams.set('c', selectedCategory);
    } else {
      url.searchParams.delete('c');
    }

    window.history.replaceState({}, '', url.toString());
  }, [query, selectedCategory, syncUrl]);

  // Filter tools
  const filteredTools = useMemo(() => {
    let list = manifests;

    // Apply text search
    if (query.trim()) {
      const results = fuse.search(query.trim());
      list = results.map((r) => r.item);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category === selectedCategory);
    }

    return list;
  }, [fuse, manifests, query, selectedCategory]);

  return (
    <div className="w-full space-y-6">
      {/* Controls Bar: Search + Category Chips */}
      <div className="flex flex-col gap-4">
        {/* Search input */}
        <div className="relative w-full max-w-xl mx-auto sm:mx-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all tools… (press / to focus)"
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-surface border border-line hover:border-line-strong/60 focus:border-primary rounded-control text-ink placeholder:text-muted transition-colors focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink rounded"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        {showCategoryFilter && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-pill transition-colors shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-surface hover:bg-surface-2 text-muted hover:text-ink border border-line'
              }`}
            >
              All Tools ({manifests.length})
            </button>
            {CATEGORY_LIST.map((cat) => {
              const count = manifests.filter((m) => m.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-pill transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface hover:bg-surface-2 text-muted hover:text-ink border border-line'
                  }`}
                >
                  {cat.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTools.map((m) => (
            <ToolCard key={m.id} manifest={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-card bg-surface border border-line max-w-md mx-auto space-y-3">
          <p className="text-sm font-semibold text-ink">No tools match your search</p>
          <p className="text-xs text-muted">
            Try different keywords or view all categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-control transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

