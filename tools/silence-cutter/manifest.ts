import type { ToolManifest } from '@pegbox/tool-kit';

export const manifest: ToolManifest = {
  id: 'silence-cutter',
  name: 'Silence Cutter',
  shortName: 'Cut',
  tagline: 'Removes pauses and dead air (automatic jump-cuts).',
  description: 'Automatically detects and cuts dead air, long pauses, and gaps from video and audio. Speeds up editing without losing natural cadence.',
  category: 'audio',
  icon: 'Scissors',
  keywords: [
    'silence cutter',
    'remove silence from video',
    'auto jump cut',
    'remove dead air',
    'silence remover online',
    'video jump cut',
    'podcast silence trimmer'
  ],
  status: 'live',
  runtime: 'browser',
  input: {
    kind: 'any',
    extensions: [
      'mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'flv', 'wmv', 'mpg', 'mpeg', '3gp', 'ts', 'mts',
      'mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus', 'wma'
    ],
    maxMB: 500,
  },
  options: [
    {
      type: 'slider',
      key: 'threshold',
      label: 'Silence Sensitivity',
      help: 'Volume level below which audio is considered silence (-35 dB is balanced; -45 dB catches very quiet breathing).',
      min: -50,
      max: -20,
      step: 1,
      default: -35,
      unit: 'dB',
    },
    {
      type: 'slider',
      key: 'min-silence',
      label: 'Minimum Pause Length',
      help: 'Only gaps longer than this duration will be cut.',
      min: 0.2,
      max: 2.0,
      step: 0.1,
      default: 0.5,
      unit: 's',
    },
    {
      type: 'slider',
      key: 'padding',
      label: 'Breathing Room Around Speech',
      help: 'Margin preserved before and after each word to avoid clipped first syllables.',
      min: 0.0,
      max: 0.5,
      step: 0.02,
      default: 0.15,
      unit: 's',
    },
  ],
  presets: [
    {
      id: 'gentle',
      name: 'Gentle',
      description: 'Cuts pauses ≥ 1.0s with 0.25s padding. Relaxed pacing for podcasts, lectures, and interviews.',
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Default. Cuts pauses ≥ 0.5s with 0.15s padding. Natural YouTube and presentation pace.',
      default: true,
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'Cuts pauses ≥ 0.3s with 0.08s padding. Fast, punchy rhythm for shorts and TikTok.',
    },
  ],
  limits: [
    'Silence detection works best on clear dialogue recordings.',
    'Heavy background noise or loud music can mask pauses and cause gaps to be missed; clean with Voice Cleaner first.',
    'If no pauses longer than the minimum duration threshold exist, the file is returned unchanged.',
  ],
  faq: [
    {
      q: 'Does Silence Cutter upload my video to a server?',
      a: 'No. Audio and video analysis, gap cutting, and timeline concatenation all occur locally inside your browser Web Worker.',
    },
    {
      q: 'Will words get accidentally cut off?',
      a: 'By default, Silence Cutter preserves 0.15 seconds of "breathing room" (padding) around every spoken segment so beginnings and endings of sentences are never abruptly clipped.',
    },
    {
      q: 'Why were fewer pauses detected than expected?',
      a: 'If your recording contains loud fan hum or room rumble, the algorithm may treat the noise as speech. Run the file through Voice Cleaner (Hush) first, then pass it to Silence Cutter.',
    },
    {
      q: 'How long does video cutting take in the browser?',
      a: 'Audio-only files cut in a few seconds. For video files, frame re-encoding runs locally via WebAssembly and typically processes at 1.5x to 3x real-time speed.',
    },
  ],
  next: ['voice-cleaner'],
  addedOn: '2026-11-03',
};

