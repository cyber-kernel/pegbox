'use client';

import { useState } from 'react';
import type { OptionField } from '@pegbox/tool-kit';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface AdvancedOptionsProps {
  options: OptionField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
}

export function AdvancedOptions({
  options,
  values,
  onChange,
  disabled = false,
}: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!options || options.length === 0) return null;

  return (
    <div className="w-full border border-line rounded-control bg-surface overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-muted font-mono text-xs uppercase tracking-wider font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          Advanced Options
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-line space-y-4 bg-bg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {options.map((opt) => {
              const val = values[opt.key] !== undefined ? values[opt.key] : opt.default;

              if (opt.type === 'slider') {
                return (
                  <div key={opt.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor={opt.key} className="font-medium text-ink">
                        {opt.label}
                      </label>
                      <span className="font-mono text-muted">
                        {String(val)} {opt.unit || ''}
                      </span>
                    </div>
                    <input
                      id={opt.key}
                      type="range"
                      min={opt.min}
                      max={opt.max}
                      step={opt.step || 1}
                      value={Number(val)}
                      disabled={disabled}
                      onChange={(e) => onChange(opt.key, parseFloat(e.target.value))}
                      className="w-full accent-primary h-2 bg-surface-2 rounded-lg cursor-pointer"
                    />
                    {opt.help && <p className="text-[11px] text-muted">{opt.help}</p>}
                  </div>
                );
              }

              if (opt.type === 'toggle') {
                return (
                  <div key={opt.key} className="flex items-center justify-between py-1">
                    <div>
                      <label htmlFor={opt.key} className="text-xs font-medium text-ink block cursor-pointer">
                        {opt.label}
                      </label>
                      {opt.help && <p className="text-[11px] text-muted mt-0.5">{opt.help}</p>}
                    </div>
                    <button
                      id={opt.key}
                      type="button"
                      role="switch"
                      aria-checked={Boolean(val)}
                      disabled={disabled}
                      onClick={() => onChange(opt.key, !val)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        val ? 'bg-primary' : 'bg-surface-2'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          val ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              }

              if (opt.type === 'select') {
                return (
                  <div key={opt.key} className="space-y-1.5">
                    <label htmlFor={opt.key} className="text-xs font-medium text-ink block">
                      {opt.label}
                    </label>
                    <select
                      id={opt.key}
                      value={String(val)}
                      disabled={disabled}
                      onChange={(e) => onChange(opt.key, e.target.value)}
                      className="w-full text-xs bg-surface border border-line-strong/40 rounded-control px-3 py-2 text-ink focus:border-primary focus:outline-none"
                    >
                      {opt.choices.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {opt.help && <p className="text-[11px] text-muted">{opt.help}</p>}
                  </div>
                );
              }

              if (opt.type === 'text') {
                return (
                  <div key={opt.key} className="space-y-1.5">
                    <label htmlFor={opt.key} className="text-xs font-medium text-ink block">
                      {opt.label}
                    </label>
                    <input
                      id={opt.key}
                      type="text"
                      maxLength={opt.maxLength || 200}
                      value={String(val)}
                      disabled={disabled}
                      onChange={(e) => onChange(opt.key, e.target.value)}
                      className="w-full text-xs bg-surface border border-line-strong/40 rounded-control px-3 py-2 text-ink focus:border-primary focus:outline-none"
                    />
                    {opt.help && <p className="text-[11px] text-muted">{opt.help}</p>}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

