import { describe, it, expect } from 'vitest';
import { manifest } from '../manifest.js';
import { makeFixture, check } from '../selftest.js';

describe('Tool: voice-cleaner (Hush)', () => {
  it('validates manifest properties', () => {
    expect(manifest.id).toBe('voice-cleaner');
    expect(manifest.status).toBe('live');
    expect(manifest.category).toBe('audio');
    expect(manifest.presets.length).toBeGreaterThanOrEqual(3);
    expect(manifest.limits.length).toBeGreaterThanOrEqual(2);
    expect(manifest.faq.length).toBeGreaterThanOrEqual(3);
  });

  it('generates synthetic test fixture', async () => {
    const files = await makeFixture();
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('hush-fixture.wav');
    expect(files[0].size).toBeGreaterThan(1000);
  });

  it('verifies selftest validator detects valid results', () => {
    const mockSuccess = {
      outputs: [
        {
          name: 'hush-fixture_clean.wav',
          blob: new Blob([new Uint8Array(20000)], { type: 'audio/wav' }),
        },
      ],
    };
    expect(check(mockSuccess)).toBeNull();

    const mockEmpty = { outputs: [] };
    expect(check(mockEmpty)).toContain('Expected exactly 1 output');
  });
});

