import { makeTalkingWav } from '@pegbox/media';

export async function makeFixture(): Promise<File[]> {
  const wavBytes = makeTalkingWav({ seconds: 3, rate: 48000, noise: 0.02 });
  const file = new File([wavBytes.buffer as ArrayBuffer], 'hush-fixture.wav', { type: 'audio/wav' });
  return [file];
}

export function check(result: { outputs: { name: string; blob: Blob }[] }): string | null {
  if (!result || !result.outputs || result.outputs.length !== 1) {
    return 'Expected exactly 1 output file from Voice Cleaner';
  }
  const out = result.outputs[0];
  if (out.blob.size < 5000) {
    return `Output file is unexpectedly small (${out.blob.size} bytes)`;
  }
  return null;
}
