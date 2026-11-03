import { describe, it, expect } from 'vitest';
import { manifest } from '../manifest.js';
import { makeFixture, check } from '../selftest.js';
import { keepSegments } from '../engine.js';

describe('Tool: silence-cutter (Cut)', () => {
  it('validates manifest structure', () => {
    expect(manifest.id).toBe('silence-cutter');
    expect(manifest.status).toBe('live');
    expect(manifest.presets.length).toBeGreaterThanOrEqual(3);
    expect(manifest.limits.length).toBeGreaterThanOrEqual(2);
    expect(manifest.faq.length).toBeGreaterThanOrEqual(3);
  });

  it('correctly calculates keepSegments with padding', () => {
    // 12s file, pauses at [3.0 - 4.2] and [7.0 - 8.5]
    const silences: [number, number][] = [
      [3.0, 4.2],
      [7.0, 8.5],
    ];
    const duration = 12.0;
    const padding = 0.15;

    const kept = keepSegments(silences, duration, padding);
    expect(kept).toHaveLength(3);
    // Segment 1: [0, 3.15]
    expect(kept[0][0]).toBe(0);
    expect(kept[0][1]).toBeCloseTo(3.15, 2);
    // Segment 2: [4.05, 7.15]
    expect(kept[1][0]).toBeCloseTo(4.05, 2);
    expect(kept[1][1]).toBeCloseTo(7.15, 2);
    // Segment 3: [8.35, 12.0]
    expect(kept[2][0]).toBeCloseTo(8.35, 2);
    expect(kept[2][1]).toBe(12.0);
  });

  it('generates synthetic fixture and validates result checker', async () => {
    const files = await makeFixture();
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('cut-fixture.wav');

    const mockRes = {
      outputs: [
        {
          name: 'cut-fixture_cut.wav',
          blob: new Blob([new Uint8Array(10000)], { type: 'audio/wav' }),
        },
      ],
    };
    expect(check(mockRes)).toBeNull();
  });
});

