import { InsightsService } from '@/services/insights';

// T030 [US3] — insights: always ≥1, guardrail-checked, graceful with thin history (FR-011/014).
describe('InsightsService', () => {
  const svc = new InsightsService();

  it('always returns at least one insight (FR-010)', () => {
    const r = svc.generate({ band: 'good', score: 70, history: [] });
    expect(r.length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to encouragement/education when history is thin (FR-014)', () => {
    const r = svc.generate({ band: 'moderate', score: 55, history: [] });
    expect(r.every((c) => c.category !== 'trend')).toBe(true);
  });

  it('surfaces a trend insight when history shows a meaningful change', () => {
    const up = svc.generate({ band: 'good', score: 80, history: [60] });
    expect(up.some((c) => c.category === 'trend')).toBe(true);

    const down = svc.generate({ band: 'low', score: 30, history: [70] });
    expect(down.some((c) => c.category === 'trend')).toBe(true);
  });

  it('never surfaces a body that fails the informational guardrail', () => {
    const r = svc.generate({ band: 'low', score: 20, history: [80] });
    for (const c of r) {
      expect(/tienes|padeces|diagnostic/i.test(c.body)).toBe(false);
    }
  });

  it('does not flag a small day-to-day change as a trend', () => {
    const r = svc.generate({ band: 'good', score: 72, history: [70] });
    expect(r.every((c) => c.category !== 'trend')).toBe(true);
  });
});
