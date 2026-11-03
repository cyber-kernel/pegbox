'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { RunResult, ToolManifest } from '@pegbox/tool-kit';
import { useWorkspaceStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  Download,
  RotateCcw,
  ArrowRight,
  Trash2,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react';

interface ResultViewProps {
  originalFile: File;
  result: RunResult;
  manifest: ToolManifest;
  onReset: () => void;
}

export function ResultView({ originalFile, result, manifest, onReset }: ResultViewProps) {
  const router = useRouter();
  const { setHandedOffFile, trackObjectUrl, revokeAllObjectUrls } = useWorkspaceStore();

  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [cleanUrl, setCleanUrl] = useState<string>('');

  const [activeTrack, setActiveTrack] = useState<'original' | 'processed'>('processed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoOriginalRef = useRef<HTMLVideoElement | null>(null);
  const videoCleanRef = useRef<HTMLVideoElement | null>(null);
  const audioOriginalRef = useRef<HTMLAudioElement | null>(null);
  const audioCleanRef = useRef<HTMLAudioElement | null>(null);

  const primaryOutput = result.outputs[0];
  const isVideo = originalFile.type.startsWith('video') || primaryOutput?.mime?.startsWith('video');
  const isMedia = isVideo || originalFile.type.startsWith('audio') || primaryOutput?.mime?.startsWith('audio');

  const getOriginalEl = useCallback((): HTMLMediaElement | null => {
    return isVideo ? videoOriginalRef.current : audioOriginalRef.current;
  }, [isVideo]);

  const getCleanEl = useCallback((): HTMLMediaElement | null => {
    return isVideo ? videoCleanRef.current : audioCleanRef.current;
  }, [isVideo]);

  // Setup Object URLs
  useEffect(() => {
    if (originalFile) {
      const orig = trackObjectUrl(URL.createObjectURL(originalFile));
      setOriginalUrl(orig);
    }
    if (primaryOutput?.blob) {
      const clean = trackObjectUrl(URL.createObjectURL(primaryOutput.blob));
      setCleanUrl(clean);
    }
  }, [originalFile, primaryOutput, trackObjectUrl]);

  // Synchronized Playback
  const togglePlay = useCallback(() => {
    const orig = getOriginalEl();
    const clean = getCleanEl();
    if (!orig || !clean) return;

    if (isPlaying) {
      orig.pause();
      clean.pause();
      setIsPlaying(false);
    } else {
      const t = activeTrack === 'processed' ? clean.currentTime : orig.currentTime;
      orig.currentTime = t;
      clean.currentTime = t;

      if (activeTrack === 'processed') {
        clean.muted = false;
        orig.muted = true;
      } else {
        orig.muted = false;
        clean.muted = true;
      }

      orig.play().catch(() => {});
      clean.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [activeTrack, getCleanEl, getOriginalEl, isPlaying]);

  // Handle A/B Switch
  const switchTrack = useCallback((track: 'original' | 'processed') => {
    setActiveTrack(track);
    const orig = getOriginalEl();
    const clean = getCleanEl();
    if (!orig || !clean) return;

    if (track === 'processed') {
      clean.currentTime = orig.currentTime;
      clean.muted = false;
      orig.muted = true;
    } else {
      orig.currentTime = clean.currentTime;
      orig.muted = false;
      clean.muted = true;
    }
  }, [getCleanEl, getOriginalEl]);

  // Time update sync
  const handleTimeUpdate = () => {
    const activeEl = activeTrack === 'processed' ? getCleanEl() : getOriginalEl();
    if (activeEl) {
      setCurrentTime(activeEl.currentTime);
      if (activeEl.duration && !isNaN(activeEl.duration)) {
        setDuration(activeEl.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    const orig = getOriginalEl();
    const clean = getCleanEl();
    if (orig) orig.currentTime = targetTime;
    if (clean) clean.currentTime = targetTime;
  };

  const downloadOutput = () => {
    if (!primaryOutput) return;
    const a = document.createElement('a');
    a.href = cleanUrl;
    a.download = primaryOutput.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNextTool = (nextId: string) => {
    if (!primaryOutput) return;
    const nextFile = new File([primaryOutput.blob], primaryOutput.name, {
      type: primaryOutput.mime,
    });
    setHandedOffFile(nextFile, manifest.id);
    router.push(`/tools/${nextId}`);
  };

  const handleClearEverything = () => {
    revokeAllObjectUrls();
    onReset();
  };

  return (
    <div className="w-full bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header with Success and Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-success-bg text-success-text border border-emerald-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-heading font-semibold text-lg text-ink">Ready to download</h3>
            <p className="text-xs text-muted">Processed with 100% on-device privacy</p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadOutput}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-control shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download {primaryOutput?.name}
        </button>
      </div>

      {/* Stats Chips */}
      {result.stats && result.stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          {result.stats.map((stat, i) => (
            <div
              key={i}
              className="px-3 py-1.5 rounded-pill bg-bg border border-line flex items-center gap-2 text-xs"
            >
              <span className="text-muted font-medium">{stat.label}:</span>
              <span className="font-mono font-semibold text-ink">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Synced A/B Player (if audio or video) */}
      {isMedia && (
        <div className="w-full bg-bg border border-line rounded-control p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted font-mono">
              Before & After Comparison
            </span>
            <div className="inline-flex p-1 bg-surface-2 rounded-control border border-line">
              <button
                type="button"
                onClick={() => switchTrack('original')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  activeTrack === 'original'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Original (A)
              </button>
              <button
                type="button"
                onClick={() => switchTrack('processed')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  activeTrack === 'processed'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Cleaned / Cut (B)
              </button>
            </div>
          </div>

          {/* Hidden Media Elements */}
          {isVideo ? (
            <div className="relative aspect-video max-h-[360px] bg-black rounded-control overflow-hidden mx-auto flex items-center justify-center">
              <video
                ref={videoOriginalRef}
                src={originalUrl}
                playsInline
                className={`w-full h-full object-contain ${activeTrack === 'original' ? 'block' : 'hidden'}`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
              <video
                ref={videoCleanRef}
                src={cleanUrl}
                playsInline
                className={`w-full h-full object-contain ${activeTrack === 'processed' ? 'block' : 'hidden'}`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono backdrop-blur-xs">
                {activeTrack === 'processed' ? 'B: Processed' : 'A: Original'}
              </span>
            </div>
          ) : (
            <>
              <audio
                ref={audioOriginalRef}
                src={originalUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
              <audio
                ref={audioCleanRef}
                src={cleanUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            </>
          )}

          {/* Common Scrubber & Transport Controls */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-primary h-2 bg-surface-2 rounded-lg cursor-pointer"
              />

              <span className="text-xs font-mono text-muted shrink-0 min-w-[70px] text-right">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60) < 10 ? '0' : '') + Math.floor(currentTime % 60)} /{' '}
                {Math.floor(duration / 60)}:{(Math.floor(duration % 60) < 10 ? '0' : '') + Math.floor(duration % 60)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chained Action Buttons (manifest.next) */}
      {manifest.next && manifest.next.length > 0 && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-control flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono block">
              Suggested Next Step
            </span>
            <p className="text-xs text-muted">Pass this result directly to another tool in memory</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {manifest.next.map((nextId) => (
              <button
                key={nextId}
                type="button"
                onClick={() => handleNextTool(nextId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-bg hover:bg-white text-primary border border-primary/30 rounded-control shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue with {nextId.replace('-', ' ')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Footers: Process another / Clear everything */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-line text-xs">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-muted hover:text-ink hover:bg-surface-2 rounded-control transition-colors cursor-pointer font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Process another file
        </button>

        <button
          type="button"
          onClick={handleClearEverything}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-muted hover:text-danger-text hover:bg-danger-bg rounded-control transition-colors cursor-pointer font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear everything & free memory
        </button>
      </div>
    </div>
  );
}
