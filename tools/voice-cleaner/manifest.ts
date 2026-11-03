import type { ToolManifest } from '@pegbox/tool-kit';

export const manifest: ToolManifest = {
  id: 'voice-cleaner',
  name: 'Voice Cleaner',
  shortName: 'Hush',
  tagline: 'Removes background noise, keeps the voice natural, makes it louder and even.',
  description: 'Cleans background hum, fan noise, and hiss while keeping dialogue clear and natural. Works on video and audio files entirely in your browser.',
  category: 'audio',
  icon: 'Volume2',
  keywords: [
    'voice cleaner',
    'remove background noise',
    'audio denoiser',
    'clean audio online free',
    'noise reduction',
    'hush',
    'video voice cleaner'
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
      key: 'lufs',
      label: 'Target Loudness',
      help: 'Standard target loudness for voice/podcast content (-16 is podcast standard, -14 is YouTube).',
      min: -20,
      max: -9,
      step: 1,
      default: -14,
      unit: 'LUFS',
    },
    {
      type: 'slider',
      key: 'gain',
      label: 'Extra Boost',
      help: 'Additional gain if the original recording was very quiet.',
      min: 0,
      max: 10,
      step: 0.5,
      default: 0,
      unit: 'dB',
    },
    {
      type: 'toggle',
      key: 'mono',
      label: 'Mono Output',
      help: 'Collapse output audio to single channel (recommended for single-microphone dialogue).',
      default: false,
    },
  ],
  presets: [
    {
      id: 'natural',
      name: 'Natural',
      description: 'Gentle, most natural voice for already fairly clean recordings.',
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Default. Strong noise removal while keeping the voice smooth and clear.',
      default: true,
    },
    {
      id: 'strong',
      name: 'Strong',
      description: 'Maximum noise removal for noisy rooms, AC units, fans, or street traffic.',
    },
  ],
  limits: [
    'Reduces steady background noise (fans, air conditioning, traffic, and mic hiss).',
    'Cannot remove room echo or reverberation, and reducing noise may make existing room echo slightly more noticeable.',
    'Extreme noise distortion where speech is fully drowned out cannot be reconstructed.',
  ],
  faq: [
    {
      q: 'Does Voice Cleaner upload my audio or video to a server?',
      a: 'No. The entire neural denoising and loudness normalization pipeline runs directly inside your web browser using WebAssembly. Your files never leave your computer or phone.',
    },
    {
      q: 'Does it change video quality?',
      a: 'Not at all. For video files, the video stream is copied 1:1 without re-encoding, preserving exact original video resolution, colors, and quality.',
    },
    {
      q: 'Why does room echo still remain?',
      a: 'Room echo (reverberation) is a reflection of the voice itself. While background hiss is filtered out, acoustic reflections bounce at the exact same frequencies as your vocal cords.',
    },
    {
      q: 'Which preset should I choose?',
      a: 'Start with Balanced. If the speaker sounds at all filtered, switch to Natural. If you have loud air conditioning or car hum in the background, choose Strong.',
    },
  ],
  next: ['silence-cutter'],
  addedOn: '2026-11-03',
};

