import createFFmpegCore from './ffmpeg-core.js';

let core = null;
let currentJobAborted = false;

async function getCore() {
  if (core) return core;

  self.postMessage({ type: 'progress', label: 'Initializing media engine', percent: 5 });

  core = await createFFmpegCore({
    locateFile: (filename) => `/ffmpeg/${filename}`,
  });

  return core;
}

self.onmessage = async (e) => {
  const msg = e.data;

  if (msg.type === 'abort') {
    currentJobAborted = true;
    return;
  }

  if (msg.type === 'run') {
    currentJobAborted = false;
    const { files, steps, needModel, totalDuration } = msg;

    try {
      const ffmpeg = await getCore();

      // Setup directories if not present
      try { ffmpeg.FS.mkdir('/work'); } catch (_) {}
      try { ffmpeg.FS.mkdir('/models'); } catch (_) {}

      // Load RNNoise model if requested and not yet cached
      if (needModel) {
        let hasModel = false;
        try {
          hasModel = ffmpeg.FS.stat('/models/bd.rnnn').size > 0;
        } catch (_) {}

        if (!hasModel) {
          self.postMessage({ type: 'progress', label: 'Downloading voice model', percent: 10 });
          const res = await fetch('/models/bd.rnnn');
          if (!res.ok) throw new Error('Failed to load voice model bd.rnnn');
          const modelBuf = await res.arrayBuffer();
          ffmpeg.FS.writeFile('/models/bd.rnnn', new Uint8Array(modelBuf));
        }
      }

      // Write input files
      for (const f of files) {
        ffmpeg.FS.writeFile('/work/' + f.name, f.data);
      }

      let collectedLogs = [];
      let lastProgress = -1;

      ffmpeg.setLogger((logObj) => {
        const line = typeof logObj === 'object' ? logObj.message : String(logObj);
        collectedLogs.push(line);

        // Parse time=HH:MM:SS.ss for progress
        if (totalDuration && totalDuration > 0) {
          const tm = line.match(/time=(\d+):(\d+):(\d+\.?\d*)/);
          if (tm) {
            const curSec = (+tm[1]) * 3600 + (+tm[2]) * 60 + parseFloat(tm[3]);
            const pct = Math.min(99, Math.max(1, Math.floor((curSec / totalDuration) * 100)));
            if (pct !== lastProgress) {
              lastProgress = pct;
              self.postMessage({ type: 'progress', label: currentStage, percent: pct });
            }
          }
        }
      });

      let currentStage = 'Processing';
      let extractedData = {};

      for (let i = 0; i < steps.length; i++) {
        if (currentJobAborted) {
          throw new DOMException('Cancelled by user', 'AbortError');
        }

        const step = steps[i];
        currentStage = step.stageLabel;
        const stepBasePct = Math.floor((i / steps.length) * 90);
        self.postMessage({ type: 'progress', label: currentStage, percent: Math.max(stepBasePct, 15) });

        collectedLogs = [];
        const code = ffmpeg.exec(...step.args);

        const logsStr = collectedLogs.join('\n');

        if (step.extractJson) {
          const jm = logsStr.match(/\{[^{}]*"input_i"[^{}]*\}/);
          if (jm) {
            try {
              extractedData.loudnorm = JSON.parse(jm[0]);
            } catch (_) {}
          }
        }

        if (step.extractSilence) {
          const silences = [];
          let sStart = null;
          for (const line of collectedLogs) {
            const sm = line.match(/silence_start:\s*(-?[\d.]+)/);
            const em = line.match(/silence_end:\s*([\d.]+)/);
            if (sm) sStart = Math.max(0, parseFloat(sm[1]));
            if (em && sStart !== null) {
              silences.push([sStart, parseFloat(em[1])]);
              sStart = null;
            }
          }
          if (sStart !== null && totalDuration) {
            silences.push([sStart, totalDuration]);
          }
          extractedData.silences = silences;
        }

        if (step.extractMeanVolume) {
          const vm = logsStr.match(/mean_volume:\s*(-?[\d.]+) dB/);
          if (vm) {
            extractedData.meanVolume = parseFloat(vm[1]);
          }
        }
      }

      self.postMessage({ type: 'progress', label: 'Preparing output', percent: 95 });

      // Read output files
      const outputs = [];
      for (const step of steps) {
        if (step.outputFileName) {
          try {
            const data = ffmpeg.FS.readFile('/work/' + step.outputFileName);
            outputs.push({
              name: step.outputFileName,
              data: new Uint8Array(data),
              mime: step.outputMime || 'application/octet-stream',
            });
            // Clean up output file from virtual FS
            ffmpeg.FS.unlink('/work/' + step.outputFileName);
          } catch (e) {
            console.error('Failed to read output:', step.outputFileName, e);
          }
        }
      }

      // Clean up input files
      for (const f of files) {
        try { ffmpeg.FS.unlink('/work/' + f.name); } catch (_) {}
      }

      self.postMessage({
        type: 'success',
        outputs,
        diagnostics: extractedData,
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: err.message || String(err),
      });
    }
  }
};

