import type { RunContext, RunResult } from '@pegbox/tool-kit';
import { executeMediaJob, isAudioFile, getAudioOutputSpecs, probeMedia } from '@pegbox/media';

interface PresetConfig {
  rnn: number;
  mix: number;
  fft: string | null;
  gate: { range: number; ratio: number; release: number } | null;
  comp: number;
}

const PRESETS: Record<string, PresetConfig> = {
  natural: { rnn: 1, mix: 0.9, fft: 'afftdn=nr=8:nf=-50', gate: { range: 0.18, ratio: 1.5, release: 400 }, comp: 2.0 },
  balanced: { rnn: 1, mix: 1.0, fft: 'afftdn=nr=12:nf=-45', gate: { range: 0.08, ratio: 2.0, release: 350 }, comp: 2.5 },
  strong: { rnn: 2, mix: 1.0, fft: 'afftdn=nr=18:nf=-40', gate: { range: 0.04, ratio: 4.0, release: 250 }, comp: 3.0 },
};

function buildChain(p: PresetConfig, gateDb = -48): string {
  const thr = Math.pow(10, gateDb / 20).toFixed(5);
  const f = ['highpass=f=85', 'lowpass=f=14000'];
  for (let i = 0; i < p.rnn; i++) {
    f.push(`arnndn=m=/models/bd.rnnn:mix=${p.mix}`);
  }
  if (p.fft) f.push(p.fft);
  if (p.gate) {
    f.push(`agate=threshold=${thr}:ratio=${p.gate.ratio}:attack=15:release=${p.gate.release}:range=${p.gate.range}:knee=4`);
  }
  f.push('equalizer=f=250:t=q:w=1:g=-1.5');
  f.push('equalizer=f=3200:t=q:w=1:g=2');
  f.push(`acompressor=threshold=-20dB:ratio=${p.comp}:attack=20:release=250:makeup=2`);
  return f.join(',');
}

export async function run(ctx: RunContext): Promise<RunResult> {
  const [file] = ctx.files;
  if (!file) throw new Error('No file provided to Voice Cleaner.');

  const presetName = ctx.preset || 'balanced';
  const presetConfig = PRESETS[presetName] || PRESETS.balanced;

  const lufs = Number(ctx.options.lufs ?? -14);
  const gainDb = Number(ctx.options.gain ?? 0);
  const mono = Boolean(ctx.options.mono ?? false);
  const outChannels = mono ? 1 : 2;

  const audioOnly = isAudioFile(file.name);
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  // Probe duration for accurate progress calculation
  let duration = 10;
  try {
    const probe = await probeMedia(file);
    if (probe.duration > 0) duration = probe.duration;
  } catch (_) {}

  const chain = buildChain(presetConfig);
  const gainArg = gainDb > 0 ? `,volume=${gainDb}dB` : '';

  // Determine output filename and specs
  let outputFileName = '';
  let outputMime = '';
  let muxArgs: string[] = [];

  if (audioOnly) {
    const specs = getAudioOutputSpecs(file.name);
    outputFileName = `${baseName}_clean.${specs.ext}`;
    outputMime = specs.mime;
    muxArgs = [
      '-hide_banner', '-nostdin', '-y',
      '-i', '/work/clean.wav',
      '-ar', '48000',
      '-ac', String(outChannels),
      ...specs.args,
      `/work/${outputFileName}`,
    ];
  } else {
    outputFileName = `${baseName}_clean.mp4`;
    outputMime = 'video/mp4';
    muxArgs = [
      '-hide_banner', '-nostdin', '-y',
      '-i', `/work/${file.name}`,
      '-i', '/work/clean.wav',
      '-map', '0:v:0?',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-ar', '48000',
      '-ac', String(outChannels),
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      '-shortest',
      `/work/${outputFileName}`,
    ];
  }

  // Define steps
  const steps = [
    // Step 1: Extract 48kHz mono raw wav
    {
      args: [
        '-hide_banner', '-nostdin', '-y',
        '-i', `/work/${file.name}`,
        '-vn',
        '-map', '0:a:0',
        '-ac', '1',
        '-af', 'aresample=48000',
        '-ar', '48000',
        '-c:a', 'pcm_s16le',
        '/work/raw.wav',
      ],
      stageLabel: 'Extracting audio',
    },
    // Step 2: Pass 1 measure loudness
    {
      args: [
        '-hide_banner', '-nostdin', '-y',
        '-i', '/work/raw.wav',
        '-af', `${chain},loudnorm=I=${lufs}:TP=-1.5:LRA=11:print_format=json`,
        '-f', 'null', '-',
      ],
      stageLabel: 'Analyzing voice & noise',
      extractJson: true,
    },
    // Step 3: Pass 2 denoise + normalize + limit
    {
      args: [
        '-hide_banner', '-nostdin', '-y',
        '-i', '/work/raw.wav',
        '-af', `${chain},loudnorm=I=${lufs}:TP=-1.5:LRA=11${gainArg},alimiter=limit=0.89:level=false,aresample=48000`,
        '-ar', '48000',
        '-c:a', 'pcm_s16le',
        '/work/clean.wav',
      ],
      stageLabel: 'Removing noise & boosting voice',
    },
    // Step 4: Final packaging / mux
    {
      args: muxArgs,
      stageLabel: 'Saving cleaned file',
      outputFileName,
      outputMime,
    },
  ];

  ctx.onProgress('Starting Voice Cleaner', 5);

  const mediaRes = await executeMediaJob({
    files: [{ name: file.name, file }],
    steps,
    needModel: true,
    totalDuration: duration,
    onProgress: ctx.onProgress,
    signal: ctx.signal,
    log: ctx.log,
  });

  const outItem = mediaRes.outputs[0];
  if (!outItem) {
    throw new Error('Voice cleaner finished but produced no output file.');
  }

  return {
    outputs: [
      {
        name: outputFileName,
        blob: outItem.blob,
        mime: outputMime,
      },
    ],
    stats: [
      { label: 'Mode', value: presetName.toUpperCase() },
      { label: 'Target Loudness', value: `${lufs} LUFS` },
      { label: 'Channels', value: mono ? 'Mono (1 ch)' : 'Stereo (2 ch)' },
    ],
    diagnostics: {
      mode: presetName,
      options: ctx.options,
      loudnorm: mediaRes.diagnostics?.loudnorm,
    },
  };
}

