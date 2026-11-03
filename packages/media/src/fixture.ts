/**
 * Generates a synthetic "talking with pauses and background hiss" WAV in memory.
 * No external dependencies; safe in browser, Web Worker, and Node.
 */
export function makeTalkingWav({
  seconds = 12,
  rate = 48000,
  noise = 0.02,
  layout,
}: {
  seconds?: number;
  rate?: number;
  noise?: number;
  layout?: [string, number][];
} = {}): Uint8Array {
  const plan = layout ?? [
    ['talk', 3],
    ['pause', 1.2],
    ['talk', 2.5],
    ['pause', 1.5],
    ['talk', 2.9],
    ['pause', 0.9],
  ];

  const n = Math.floor(seconds * rate);
  const pcm = new Int16Array(n);
  let t = 0;
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 4294967296) * 2 - 1;
  };

  for (const [kind, len] of plan) {
    const end = Math.min(n, t + Math.floor(len * rate));
    for (let i = t; i < end; i++) {
      const s = i / rate;
      let v = noise * rnd();
      if (kind === 'talk') {
        const env = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3.2 * s);
        const f = 140 + 20 * Math.sin(2 * Math.PI * 0.7 * s);
        v +=
          (0.35 *
            env *
            (Math.sin(2 * Math.PI * f * s) +
              0.5 * Math.sin(2 * Math.PI * 2 * f * s) +
              0.25 * Math.sin(2 * Math.PI * 3 * f * s))) /
          1.75;
      }
      pcm[i] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
    }
    t = end;
  }

  const buf = new ArrayBuffer(44 + n * 2);
  const dv = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));

  w(0, 'RIFF');
  dv.setUint32(4, 36 + n * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, rate, true);
  dv.setUint32(28, rate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  w(36, 'data');
  dv.setUint32(40, n * 2, true);
  new Int16Array(buf, 44).set(pcm);

  return new Uint8Array(buf);
}

