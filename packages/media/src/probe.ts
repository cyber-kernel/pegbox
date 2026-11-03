export const VIDEO_EXTENSIONS = [
  'mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'flv', 'wmv', 'mpg', 'mpeg', '3gp', 'ts', 'mts'
];

export const AUDIO_EXTENSIONS = [
  'mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus', 'wma'
];

export function isAudioFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return AUDIO_EXTENSIONS.includes(ext);
}

export function isVideoFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return VIDEO_EXTENSIONS.includes(ext);
}

export function getAudioOutputSpecs(filename: string): { ext: string; args: string[]; mime: string } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'mp3') {
    return { ext: 'mp3', args: ['-c:a', 'libmp3lame', '-b:a', '192k'], mime: 'audio/mpeg' };
  }
  if (ext === 'wav') {
    return { ext: 'wav', args: ['-c:a', 'pcm_s16le'], mime: 'audio/wav' };
  }
  return { ext: 'm4a', args: ['-c:a', 'aac', '-b:a', '192k'], mime: 'audio/mp4' };
}

export function formatSeconds(totalSecs: number): string {
  const s = Math.round(totalSecs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;
  if (h > 0) {
    return `${h}h ${m}m ${remSec}s`;
  }
  if (m > 0) {
    return `${m}m ${remSec}s`;
  }
  return `${remSec}s`;
}

export function formatTimestamp(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const remSec = s % 60;
  return `${m}:${remSec < 10 ? '0' : ''}${remSec}`;
}

/**
 * Fast client-side media duration & track probe using HTML5 Media Element
 */
export async function probeMedia(file: File): Promise<{ duration: number; hasAudio: boolean; hasVideo: boolean }> {
  return new Promise((resolve) => {
    const isAudio = isAudioFile(file.name);
    const mediaEl = document.createElement(isAudio ? 'audio' : 'video');
    const url = URL.createObjectURL(file);

    let resolved = false;
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(url);
      }
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({ duration: 0, hasAudio: true, hasVideo: !isAudio });
    }, 5000);

    mediaEl.preload = 'metadata';
    mediaEl.onloadedmetadata = () => {
      clearTimeout(timer);
      const duration = mediaEl.duration || 0;
      let hasAudio = true;
      let hasVideo = !isAudio;

      if (!isAudio && mediaEl instanceof HTMLVideoElement) {
        // Modern browsers webkitAudioDecodedByteCount or mozHasAudio
        const v = mediaEl as any;
        if (typeof v.webkitAudioDecodedByteCount !== 'undefined') {
          hasAudio = v.webkitAudioDecodedByteCount > 0;
        }
        hasVideo = (v.videoWidth || 0) > 0;
      }

      cleanup();
      resolve({
        duration: isFinite(duration) ? duration : 0,
        hasAudio,
        hasVideo,
      });
    };

    mediaEl.onerror = () => {
      clearTimeout(timer);
      cleanup();
      resolve({ duration: 0, hasAudio: true, hasVideo: !isAudio });
    };

    mediaEl.src = url;
  });
}

