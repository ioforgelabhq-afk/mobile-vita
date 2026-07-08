import { computeScore, bandFor } from '@/services/scoring';

// T016 [US1] — on-device Daily Score: bands, sparse input renormalization (FR-003/006/007).
describe('scoring service', () => {
  it('maps score ranges to bands', () => {
    expect(bandFor(90)).toBe('great');
    expect(bandFor(70)).toBe('good');
    expect(bandFor(50)).toBe('moderate');
    expect(bandFor(20)).toBe('low');
  });

  it('produces a 0–100 score with a component breakdown', () => {
    const r = computeScore({ mood: 'good', sleepHours: 8, energy: 4, symptomCount: 0 });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.components.map((c) => c.key)).toEqual(
      expect.arrayContaining(['mood', 'sleep', 'energy', 'symptoms']),
    );
    expect(r.band).toBe(bandFor(r.score));
  });

  it('renormalizes weights when inputs are missing (sparse check-in still scores)', () => {
    const r = computeScore({ mood: 'great' }); // only mood provided
    expect(r.components).toHaveLength(1);
    // single component weight renormalizes to ~1.0
    expect(r.components[0].weight).toBeCloseTo(1, 5);
    expect(r.score).toBeGreaterThan(80); // 'great' mood alone → high
  });

  it('returns a neutral score when nothing was shared', () => {
    const r = computeScore({});
    expect(r.score).toBe(60);
    expect(r.components).toHaveLength(0);
  });

  it('lowers the score as symptom load rises', () => {
    const none = computeScore({ mood: 'ok', symptomCount: 0 });
    const many = computeScore({ mood: 'ok', symptomCount: 4 });
    expect(many.score).toBeLessThan(none.score);
  });
});
