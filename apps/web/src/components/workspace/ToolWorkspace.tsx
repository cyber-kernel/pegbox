'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ToolManifest, RunResult } from '@pegbox/tool-kit';
import { clampOptions } from '@pegbox/tool-kit';
import { probeMedia, isMediaSupported } from '@pegbox/media';
import { useWorkspaceStore } from '@/lib/store';
import { loadTool } from '@/lib/registry.generated';
import { DropZone } from './DropZone';
import { FileInspector } from './FileInspector';
import { PresetSelector } from './PresetSelector';
import { AdvancedOptions } from './AdvancedOptions';
import { ProgressBar } from './ProgressBar';
import { ResultView } from './ResultView';
import { AlertCircle, Ban, Play, RefreshCw, Cpu } from 'lucide-react';

interface ToolWorkspaceProps {
  manifest: ToolManifest;
}

export function ToolWorkspace({ manifest }: ToolWorkspaceProps) {
  const { handedOffFile, clearHandedOffFile, revokeAllObjectUrls } = useWorkspaceStore();

  const [file, setFile] = useState<File | null>(null);
  const [mediaInfo, setMediaInfo] = useState<{ duration?: number; hasAudio?: boolean; hasVideo?: boolean }>({});
  const [selectedPreset, setSelectedPreset] = useState<string>(
    manifest.presets.find((p) => p.default)?.id || manifest.presets[0]?.id || 'default'
  );
  const [options, setOptions] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    for (const opt of manifest.options) {
      defaults[opt.key] = opt.default;
    }
    return defaults;
  });

  const [status, setStatus] = useState<'idle' | 'ready' | 'running' | 'done' | 'error'>('idle');
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDisabledByFlag, setIsDisabledByFlag] = useState(false);
  const [browserSupportError, setBrowserSupportError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Check Kill-switch flags
  useEffect(() => {
    fetch('/api/flags')
      .then((res) => res.json())
      .then((data) => {
        if (data.disabledTools && Array.isArray(data.disabledTools)) {
          if (data.disabledTools.includes(manifest.id)) {
            setIsDisabledByFlag(true);
          }
        }
      })
      .catch(() => {});
  }, [manifest.id]);

  // 2. Check Browser Hardware Support
  useEffect(() => {
    const check = isMediaSupported();
    if (!check.supported) {
      setBrowserSupportError(check.reason || 'This browser does not support local client-side processing.');
    }
  }, []);

  // 3. In-memory chained hand-off check
  useEffect(() => {
    if (handedOffFile && !file) {
      const incoming = handedOffFile.file;
      clearHandedOffFile();
      handleFileSelected(incoming);
    }
  }, [handedOffFile, clearHandedOffFile, file]);

  // 4. Inactivity Timer (30 minutes auto-clear)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      handleReset();
    }, 30 * 60 * 1000);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    resetInactivityTimer();
    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  // 5. beforeunload guard during active processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'running') {
        e.preventDefault();
        e.returnValue = 'A file is currently being processed. If you leave, this job will be cancelled.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('ready');
    setErrorMessage(null);
    setResult(null);

    // Fast client-side probing
    if (selectedFile.type.startsWith('audio') || selectedFile.type.startsWith('video') || manifest.category === 'audio' || manifest.category === 'video') {
      try {
        const probed = await probeMedia(selectedFile);
        setMediaInfo(probed);
      } catch (_) {
        setMediaInfo({});
      }
    }
  };

  const handleOptionChange = (key: string, value: unknown) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleStart = async () => {
    if (!file) return;

    setStatus('running');
    setProgressLabel('Starting engine…');
    setProgressPercent(2);
    setErrorMessage(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // 1. Dynamically load tool chunk
      const toolMod = await loadTool(manifest.id);
      if (!toolMod) {
        throw new Error(`Tool "${manifest.id}" could not be dynamically loaded.`);
      }

      const engine = await toolMod.load();
      if (!engine || typeof engine.run !== 'function') {
        throw new Error(`Tool "${manifest.id}" engine does not export a run() function.`);
      }

      // 2. Clamp options before execution
      const validatedOptions = clampOptions(manifest, options);

      // 3. Execute engine
      const res = await engine.run({
        files: [file],
        preset: selectedPreset,
        options: validatedOptions,
        onProgress: (label, percent) => {
          setProgressLabel(label);
          setProgressPercent(percent);
        },
        signal: abortController.signal,
        log: () => {},
      });

      setResult(res);
      setStatus('done');
    } catch (err: any) {
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        setStatus('ready');
        setProgressLabel('Cancelled');
      } else {
        setStatus('error');
        setErrorMessage(
          err.message || 'Processing encountered an error. Nothing was uploaded or saved.'
        );
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleReset = () => {
    handleCancel();
    setFile(null);
    setMediaInfo({});
    setResult(null);
    setStatus('idle');
    setErrorMessage(null);
    revokeAllObjectUrls();
  };

  // Render disabled state if kill-switch flag is active
  if (isDisabledByFlag) {
    return (
      <div className="w-full bg-surface border border-line rounded-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-warning-bg text-warning-text flex items-center justify-center mx-auto">
          <Ban className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Tool Temporarily Paused</h3>
        <p className="text-sm text-muted leading-relaxed">
          {manifest.name} is temporarily undergoing maintenance in production. Please check back shortly.
        </p>
      </div>
    );
  }

  // Render browser unsupported error
  if (browserSupportError) {
    return (
      <div className="w-full bg-surface border border-line rounded-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-danger-bg text-danger-text flex items-center justify-center mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Browser Not Supported</h3>
        <p className="text-sm text-muted leading-relaxed">
          {browserSupportError} To run {manifest.name} locally, please use the latest version of Chrome, Edge, Firefox, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {status === 'idle' && (
        <DropZone manifest={manifest} onFileSelect={handleFileSelected} />
      )}

      {status === 'ready' && file && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <FileInspector
            file={file}
            duration={mediaInfo.duration}
            hasAudio={mediaInfo.hasAudio}
            hasVideo={mediaInfo.hasVideo}
            onClear={handleReset}
          />

          <PresetSelector
            presets={manifest.presets}
            selectedId={selectedPreset}
            onSelect={setSelectedPreset}
          />

          <AdvancedOptions
            options={manifest.options}
            values={options}
            onChange={handleOptionChange}
          />

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 px-6 rounded-control bg-primary hover:bg-primary-hover text-white font-heading font-semibold text-base shadow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Start {manifest.shortName || manifest.name}
            </button>
          </div>
        </div>
      )}

      {status === 'running' && (
        <ProgressBar
          label={progressLabel}
          percent={progressPercent}
          onCancel={handleCancel}
        />
      )}

      {status === 'done' && file && result && (
        <ResultView
          originalFile={file}
          result={result}
          manifest={manifest}
          onReset={handleReset}
        />
      )}

      {status === 'error' && (
        <div className="w-full bg-danger-bg/50 border border-danger-text/20 rounded-card p-6 sm:p-8 space-y-4 text-center">
          <div className="w-10 h-10 rounded-full bg-danger-bg text-danger-text flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-semibold text-lg text-ink">That file didn't work</h3>
            <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
              {errorMessage || 'Processing was interrupted. Nothing was uploaded or saved.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-ink border border-line rounded-control text-xs font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try another file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

