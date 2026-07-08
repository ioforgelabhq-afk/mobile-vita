import { advance, firstPrompt, isMinimalAnswer, FIRST_STEP_ID } from '@/features/onboarding/flow/engine';

// T030a [US1] — reluctant/minimal input handling (FR-004) + adaptive advance (FR-002).
describe('onboarding flow engine', () => {
  it('opens with the first prompt', () => {
    const f = firstPrompt();
    expect(f.stepId).toBe(FIRST_STEP_ID);
    expect(f.companionText.length).toBeGreaterThan(0);
  });

  it('recognizes minimal / skip answers', () => {
    expect(isMinimalAnswer('no sé')).toBe(true);
    expect(isMinimalAnswer('paso')).toBe(true);
    expect(isMinimalAnswer('')).toBe(true);
    expect(isMinimalAnswer('quiero bajar de peso y dormir mejor')).toBe(false);
  });

  it('creates a categorized entry from a substantive answer', () => {
    const r = advance('why', 'me preocupa mi presión arterial');
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].category).toBe('concern');
    expect(r.nextStepId).toBe('context');
  });

  it('accepts a minimal answer without creating an entry and still advances', () => {
    const r = advance('goals', 'no sé');
    expect(r.entries).toHaveLength(0);
    expect(r.nextStepId).toBe('preferences');
    expect(r.companionText.length).toBeGreaterThan(0);
  });

  it('reaches a graceful conclusion even when the last answer is minimal', () => {
    const r = advance('wrap', 'nada');
    expect(r.nextStepId).toBeNull();
    expect(r.promptId).toBe('complete');
  });
});
