import type { RunContext, RunResult } from '@pegbox/tool-kit';
import { executeMediaJob, isAudioFile, getAudioOutputSpecs, probeMedia, formatSeconds } from '@pegbox/media';

interface PresetConfig {
  minSilence: number;
  padding: number;
}

const PRESETS: Record<string, PresetConfig> = {
  gentle: { minSilence: 1.0, padding: 0.25 },
  balanced: { minSilence: 0.5, padding: 0.15 },
  aggressive: { minSilence: 0.3, padding: 0.08 },
};

export function keepSegments(silences: [number, number][], duration: number, padding: number): [number, number][] {
  const cuts: [number, number][] = [];
  for (const [s, e] of silences) {
    const a = s === 0 ? 0 : s + padding;
    const b = e >= duration - 0.05 ? duration : e - padding;
    if (b - a > 0.05) cuts.push([a, b]);
  }
  const keep: [number, number][] = [];
  let cursor = 0;
  for (const [a, b] of cuts) {
    if (a - cursor > 0.05) keep.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (duration - cursor > 0.05) keep.push([cursor, duration]);
  return keep;
}

export async function run(ctx: RunContext): Promise<RunResult> {
  const [file] = ctx.files;
  if (!file) throw new Error('No file provided to Silence Cutter.');

  const presetName = ctx.preset || 'balanced';
  const p = PRESETS[presetName] || PRESETS.balanced;

  const minSilence = Number(ctx.options['min-silence'] ?? p.minSilence);
  const padding = Number(ctx.options.padding ?? p.padding);
  const userThreshold = ctx.options.threshold !== undefined ? Number(ctx.options.threshold) : -35;

  const audioOnly = isAudioFile(file.name);
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  // Probe duration
  let duration = 12;
  try {
    const probe = await probeMedia(file);
    if (probe.duration > 0) duration = probe.duration;
  } catch (_) {}

  ctx.onProgress('Detecting pauses & audio levels', 10);

  // Phase A: Detection
  const detectSteps = [
    {
      args: [
        '-hide_banner', '-nostdin', '-y',
        '-i', `/work/${file.name}`,
        '-vn',
        '-map', '0:a:0',
        '-af', 'highpass=f=100,volumedetect',
        '-f', 'null', '-',
      ],
      stageLabel: 'Analyzing volume baseline',
      extractMeanVolume: true,
    },
    {
      args: [
        '-hide_banner', '-nostdin', '-y',
        '-i', `/work/${file.name}`,
        '-vn',
        '-map', '0:a:0',
        '-af', `highpass=f=100,lowpass=f=7000,silencedetect=noise=${userThreshold}dB:d=${minSilence}`,
        '-f', 'null', '-',
      ],
      stageLabel: 'Scanning for silent gaps',
      extractSilence: true,
    },
  ];

  const detectRes = await executeMediaJob({
    files: [{ name: file.name, file }],
    steps: detectSteps,
    totalDuration: duration,
    onProgress: ctx.onProgress,
    signal: ctx.signal,
    log: ctx.log,
  });

  const silences = (detectRes.diagnostics?.silences as [number, number][]) || [];
  const keep = keepSegments(silences, duration, padding);

  if (keep.length === 0) {
    throw new Error('The entire file was detected as silence at this sensitivity threshold. Try lowering sensitivity to -45 dB.');
  }

  const keptDuration = keep.reduce((t, [a, b]) => t + (b - a), 0);
  const removedDuration = duration - keptDuration;

  // Check if nothing to remove (< 0.2s)
  if (removedDuration < 0.2 || silences.length === 0) {
    return {
      outputs: [
        {
          name: file.name,
          blob: new Blob([await file.arrayBuffer()], { type: file.type }),
          mime: file.type,
        },
      ],
      stats: [
        { label: 'Original', value: formatSeconds(duration) },
        { label: 'Removed', value: '0s' },
        { label: 'Notice', value: 'No silence found' },
      ],
      diagnostics: { silences: [], removed: 0 },
    };
  }

  // Phase B: Assemble Cut
  ctx.onProgress('Generating jump-cuts', 45);

  const expr = keep.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
  const aexpr = `aselect='${expr}',asetpts=N/SR/TB`;

  let outputFileName = '';
  let outputMime = '';
  let cutArgs: string[] = [];

  if (audioOnly) {
    const specs = getAudioOutputSpecs(file.name);
    outputFileName = `${baseName}_cut.${specs.ext}`;
    outputMime = specs.mime;
    cutArgs = [
      '-hide_banner', '-nostdin', '-y',
      '-i', `/work/${file.name}`,
      '-af', aexpr,
      ...specs.args,
      `/work/${outputFileName}`,
    ];
  } else {
    outputFileName = `${baseName}_cut.mp4`;
    outputMime = 'video/mp4';
    cutArgs = [
      '-hide_banner', '-nostdin', '-y',
      '-i', `/work/${file.name}`,
      '-filter_complex', `[0:v:0]select='${expr}',setpts=N/FRAME_RATE/TB[v];[0:a:0]${aexpr}[a]`,
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      `/work/${outputFileName}`,
    ];
  }

  const cutSteps = [
    {
      args: cutArgs,
      stageLabel: audioOnly ? 'Cutting audio silence' : 'Rendering jump-cuts',
      outputFileName,
      outputMime,
    },
  ];

  const cutRes = await executeMediaJob({
    files: [{ name: file.name, file }],
    steps: cutSteps,
    totalDuration: duration,
    onProgress: ctx.onProgress,
    signal: ctx.signal,
    log: ctx.log,
  });

  const outItem = cutRes.outputs[0];
  if (!outItem) {
    throw new Error('Silence cutter finished but produced no output file.');
  }

  const newDuration = Math.max(0, duration - removedDuration);

  return {
    outputs: [
      {
        name: outputFileName,
        blob: outItem.blob,
        mime: outputMime,
      },
    ],
    stats: [
      { label: 'Original', value: formatSeconds(duration) },
      { label: 'New Duration', value: formatSeconds(newDuration) },
      { label: 'Saved', value: formatSeconds(removedDuration) },
      { label: 'Gaps Cut', value: `${silences.length}` },
    ],
    diagnostics: {
      silencesCount: silences.length,
      removedSeconds: removedDuration,
      newDuration,
      threshold: userThreshold,
    },
  };
}

