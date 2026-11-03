import { makeTalkingWav } from '@pegbox/media';

export async function makeFixture(): Promise<File[]> {
  const wavBytes = makeTalkingWav({ seconds: 6, rate: 48000, noise: 0.01 });
  const file = new File([wavBytes.buffer as ArrayBuffer], 'cut-fixture.wav', { type: 'audio/wav' });
  return [file];
}

export function check(result: { outputs: { name: string; blob: Blob }[]; stats?: { label: string; value: string }[] }): string | null {
  if (!result || !result.outputs || result.outputs.length !== 1) {
    return 'Expected exactly 1 output file from Silence Cutter';
  }
  const out = result.outputs[0];
  if (out.blob.size < 1000) {
    return `Output file is unexpectedly small (${out.blob.size} bytes)`;
  }
  return null;
}
