'use client';

import { FileAudio, FileVideo, FileText, File, X, Clock, HardDrive } from 'lucide-react';
import { formatSeconds } from '@pegbox/media';

interface FileInspectorProps {
  file: File;
  duration?: number;
  hasAudio?: boolean;
  hasVideo?: boolean;
  onClear: () => void;
  disabled?: boolean;
}

export function FileInspector({
  file,
  duration,
  hasAudio,
  hasVideo,
  onClear,
  disabled = false,
}: FileInspectorProps) {
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  const isVideo = hasVideo || ['MP4', 'MOV', 'MKV', 'WEBM'].includes(ext);
  const isAudio = !isVideo && (hasAudio || ['MP3', 'WAV', 'M4A', 'AAC', 'OGG'].includes(ext));

  return (
    <div className="w-full bg-surface border border-line rounded-control p-4 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-control bg-bg border border-line flex items-center justify-center shrink-0 text-primary shadow-xs">
          {isVideo ? (
            <FileVideo className="w-5 h-5 text-cat-video-text" strokeWidth={1.75} />
          ) : isAudio ? (
            <FileAudio className="w-5 h-5 text-cat-audio-text" strokeWidth={1.75} />
          ) : (
            <FileText className="w-5 h-5 text-primary" strokeWidth={1.75} />
          )}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-ink truncate max-w-sm sm:max-w-md" title={file.name}>
            {file.name}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted font-mono">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-muted/70" />
              {sizeMB} MB
            </span>
            {duration !== undefined && duration > 0 && (
              <>
                <span className="text-line-strong">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted/70" />
                  {formatSeconds(duration)}
                </span>
              </>
            )}
            <span className="text-line-strong">•</span>
            <span className="px-1.5 py-0.2 bg-surface-2 rounded text-[10px] font-medium text-ink">
              {ext}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="p-2 text-muted hover:text-danger-text hover:bg-danger-bg rounded-control transition-colors"
        aria-label="Remove and change file"
        title="Change file"
      >
        <X className="w-5 h-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

