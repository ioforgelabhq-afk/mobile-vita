import { SafetyService } from '@/services/safety';

// T046 [US3] — SafetyService detection (explicit, intent pattern, ambiguous → err toward safety).
describe('SafetyService', () => {
  const svc = new SafetyService();

  it('detects explicit self-harm statements', () => {
    const r = svc.screen('a veces siento que me quiero morir');
    expect(r.matched).toBe(true);
    expect(r.matchType).toBe('explicit');
    expect(r.category).toBe('self_harm');
  });

  it('detects explicit medical emergency', () => {
    const r = svc.screen('tengo un dolor en el pecho muy fuerte');
    expect(r.matched).toBe(true);
    expect(r.category).toBe('medical_emergency');
  });

  it('flags a single concerning signal as ambiguous (errs toward surfacing — FR-019)', () => {
    const r = svc.screen('ya no aguanto esta situación en el trabajo');
    expect(r.matched).toBe(true);
    expect(r.ambiguous).toBe(true);
    expect(r.matchType).toBe('intent_pattern');
  });

  it('escalates two intent signals to a non-ambiguous match', () => {
    const r = svc.screen('ya no aguanto, mejor sin mí');
    expect(r.matched).toBe(true);
    expect(r.ambiguous).toBeUndefined();
  });

  it('does not flag ordinary messages', () => {
    const r = svc.screen('quiero dormir mejor y caminar más');
    expect(r.matched).toBe(false);
  });

  it('provides self-harm resources with a hotline', () => {
    const res = svc.resourcesFor('self_harm');
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((r) => r.phone)).toBe(true);
  });
});
