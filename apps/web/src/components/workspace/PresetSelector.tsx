'use client';

import type { Preset } from '@pegbox/tool-kit';
import { Check } from 'lucide-react';

interface PresetSelectorProps {
  presets: Preset[];
  selectedId: string;
  onSelect: (presetId: string) => void;
  disabled?: boolean;
}

export function PresetSelector({
  presets,
  selectedId,
  onSelect,
  disabled = false,
}: PresetSelectorProps) {
  if (!presets || presets.length <= 1) return null;

  return (
    <div className="w-full space-y-2.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted font-mono block">
        Mode / Preset
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              className={`p-3.5 rounded-control text-left border-2 transition-all duration-150 flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-line hover:border-line-strong/60 bg-surface hover:bg-surface-2/70'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-ink'}`}>
                  {p.name}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {p.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

