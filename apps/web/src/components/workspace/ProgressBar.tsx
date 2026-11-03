'use client';

import { useEffect, useState } from 'react';
import { Loader2, XCircle, AlertTriangle } from 'lucide-react';

interface ProgressBarProps {
  label: string;
  percent: number;
  onCancel: () => void;
}

export function ProgressBar({ label, percent, onCancel }: ProgressBarProps) {
  const [showBackgroundWarning, setShowBackgroundWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowBackgroundWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full bg-surface border border-line rounded-card p-6 sm:p-8 space-y-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          <div>
            <h4 className="font-heading font-semibold text-ink text-base">
              {label || 'Working on it…'}
            </h4>
            <p className="text-xs text-muted">Processing completely on your device</p>
          </div>
        </div>

        <span className="font-mono font-bold text-lg text-primary">
          {safePercent}%
        </span>
      </div>

      {/* Progress Track & Shimmer */}
      <div className="w-full bg-surface-2 rounded-full h-3 overflow-hidden relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${safePercent}%` }}
        >
          {/* Subtle animated shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {showBackgroundWarning && (
        <div className="flex items-center gap-2 p-3 bg-warning-bg border border-amber-300/60 rounded-control text-warning-text text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Keep this tab active! Mobile browsers pause background workers.</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted">
          Memory is cleaned up automatically
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger-text hover:bg-danger-bg border border-danger-text/20 rounded-control transition-colors cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

