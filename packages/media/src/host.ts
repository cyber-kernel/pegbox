export interface MediaStep {
  args: string[];
  stageLabel: string;
  extractJson?: boolean;
  extractSilence?: boolean;
  extractMeanVolume?: boolean;
  outputFileName?: string;
  outputMime?: string;
}

export interface RunMediaOptions {
  files: { name: string; file: File }[];
  steps: MediaStep[];
  needModel?: boolean;
  totalDuration?: number;
  onProgress: (label: string, percent: number) => void;
  signal: AbortSignal;
  log?: (msg: string) => void;
}

export interface MediaResult {
  outputs: { name: string; blob: Blob; mime: string }[];
  diagnostics?: Record<string, unknown>;
}

export function isMediaSupported(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined') return { supported: true };
  if (typeof WebAssembly === 'undefined') {
    return { supported: false, reason: 'WebAssembly is not supported in this browser.' };
  }
  if (typeof Worker === 'undefined') {
    return { supported: false, reason: 'Web Workers are not supported in this browser.' };
  }
  return { supported: true };
}

export async function executeMediaJob(opts: RunMediaOptions): Promise<MediaResult> {
  const { supported, reason } = isMediaSupported();
  if (!supported) {
    throw new Error(reason || 'Browser does not meet hardware execution requirements.');
  }

  if (opts.signal.aborted) {
    throw new DOMException('Operation was aborted', 'AbortError');
  }

  opts.onProgress('Preparing file data', 5);

  // Read files into Uint8Array
  const fileBuffers = await Promise.all(
    opts.files.map(async (f) => ({
      name: f.name,
      data: new Uint8Array(await f.file.arrayBuffer()),
    }))
  );

  return new Promise((resolve, reject) => {
    let worker: Worker | null = null;

    const cleanup = () => {
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    try {
      worker = new Worker('/ffmpeg/worker.js', { type: 'module' });
    } catch (err) {
      reject(new Error(`Failed to initialize Web Worker: ${err instanceof Error ? err.message : String(err)}`));
      return;
    }

    const abortHandler = () => {
      if (worker) {
        worker.postMessage({ type: 'abort' });
        cleanup();
      }
      reject(new DOMException('Cancelled by user', 'AbortError'));
    };

    opts.signal.addEventListener('abort', abortHandler, { once: true });

    worker.onmessage = (e) => {
      const msg = e.data;
      if (!msg) return;

      if (msg.type === 'progress') {
        opts.onProgress(msg.label, msg.percent);
      } else if (msg.type === 'log') {
        opts.log?.(msg.message);
      } else if (msg.type === 'success') {
        opts.signal.removeEventListener('abort', abortHandler);
        cleanup();

        const outputs = (msg.outputs || []).map((o: { name: string; data: Uint8Array; mime: string }) => {
          const blob = new Blob([o.data.buffer as ArrayBuffer], { type: o.mime });
          return {
            name: o.name,
            blob,
            mime: o.mime,
          };
        });

        resolve({
          outputs,
          diagnostics: msg.diagnostics,
        });
      } else if (msg.type === 'error') {
        opts.signal.removeEventListener('abort', abortHandler);
        cleanup();
        reject(new Error(msg.error || 'Media processing failed in worker'));
      }
    };

    worker.onerror = (err) => {
      opts.signal.removeEventListener('abort', abortHandler);
      cleanup();
      reject(new Error(`Worker error: ${err.message}`));
    };

    // Send payload
    worker.postMessage({
      type: 'run',
      files: fileBuffers,
      steps: opts.steps,
      needModel: opts.needModel,
      totalDuration: opts.totalDuration,
    });
  });
}
