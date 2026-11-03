'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ToolManifest } from '@pegbox/tool-kit';
import { UploadCloud, AlertCircle, FileWarning } from 'lucide-react';

interface DropZoneProps {
  manifest: ToolManifest;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ manifest, onFileSelect, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { input } = manifest;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  // Apply mobile cap if on phone (e.g., max 150MB or manifest maxMB)
  const effectiveMaxMB = isMobile ? Math.min(input.maxMB, 150) : input.maxMB;

  const validateAndSelect = useCallback(
    (file: File) => {
      setErrorMsg(null);

      // Check size
      const fileMB = file.size / (1024 * 1024);
      if (fileMB > effectiveMaxMB) {
        setErrorMsg(
          `This file is ${(fileMB).toFixed(1)} MB, which exceeds the ${effectiveMaxMB} MB limit for this tool${
            isMobile ? ' on mobile' : ''
          }. Please choose a smaller file.`
        );
        return;
      }

      // Check extension
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (input.extensions.length > 0 && !input.extensions.includes(ext)) {
        setErrorMsg(
          `".${ext}" is not supported by ${manifest.name}. Allowed formats: ${input.extensions.map(e => '.' + e).join(', ')}`
        );
        return;
      }

      onFileSelect(file);
    },
    [effectiveMaxMB, input.extensions, isMobile, manifest.name, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSelect(e.dataTransfer.files[0]);
      }
    },
    [disabled, validateAndSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        validateAndSelect(e.clipboardData.files[0]);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, validateAndSelect]);

  const acceptString = input.extensions.map((e) => `.${e}`).join(',');

  return (
    <div className="w-full flex flex-col items-center">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Drop file for ${manifest.name} or click to browse`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full relative group cursor-pointer transition-all duration-200 rounded-card p-8 sm:p-12 border-2 text-center flex flex-col items-center justify-center min-h-[240px] select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-surface border-line'
            : isDragOver
            ? 'border-primary bg-primary/5 shadow-hover scale-[1.01]'
            : 'border-dashed border-line-strong/60 hover:border-primary bg-surface hover:bg-surface-2/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndSelect(e.target.files[0]);
            }
          }}
          disabled={disabled}
        />

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 ${
            isDragOver ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
          }`}
        >
          <UploadCloud className="w-7 h-7" strokeWidth={1.75} />
        </div>

        <h3 className="font-heading font-semibold text-lg sm:text-xl text-ink mb-1.5">
          Drop your file here, or <span className="text-primary underline decoration-primary/40 underline-offset-4">choose one</span>
        </h3>

        <p className="text-sm text-muted max-w-md mb-3 leading-relaxed">
          {input.extensions.map((e) => e.toUpperCase()).join(' · ')} up to {effectiveMaxMB} MB
        </p>

        <div className="flex items-center gap-1.5 text-xs font-medium text-muted bg-bg/80 px-3 py-1 rounded-pill border border-line">
          <span>Processed 100% locally on your device</span>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="w-full mt-4 p-4 rounded-control bg-danger-bg border border-danger-text/20 text-danger-text flex items-start gap-3 text-sm animate-in fade-in duration-150"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Could not accept this file</p>
            <p className="text-xs leading-relaxed text-danger-text/90">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}

