/**
 * T015/T020/T024 — briefing composition: sections from the Living Record, disclaimer always
 * present, diagnostic content omitted, empty-record handling (FR-005–009), fail-closed consent
 * gating (FR-010–012), and scoping by date/excluded category (FR-013/014).
 */
import { stores } from '@/repositories/mock/stores';
import { setConsentChecker } from '@/services/consent-gate';
import { livingRecordRepository, healthEventRepository, dailyScoreRepository } from '@/repositories';
import { canGenerate, generate } from '@/services/briefing';
import { ConsentRequiredError } from '@/repositories/contracts/errors';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';

async function clearAll() {
  await stores.entries.clear();
  await stores.healthEvents.clear();
  await stores.dailyScores.clear();
}

afterEach(() => setConsentChecker(null));

describe('consent gating (FR-010-012)', () => {
  it('is fail-closed: canGenerate is false and generate throws without consent', async () => {
    await clearAll();
    setConsentChecker({ async isGranted() { return false; } });
    expect(await canGenerate(PATIENT)).toBe(false);
    await expect(generate(PATIENT)).rejects.toBeInstanceOf(ConsentRequiredError);
  });

  it('succeeds once share_with_physician is granted', async () => {
    await clearAll();
    setConsentChecker({ async isGranted(_p, purpose) { return purpose === 'share_with_physician'; } });
    expect(await canGenerate(PATIENT)).toBe(true);
    await expect(generate(PATIENT)).resolves.toBeDefined();
  });

  it('re-blocks after consent is revoked', async () => {
    await clearAll();
    setConsentChecker({ async isGranted() { return true; } });
    await expect(generate(PATIENT)).resolves.toBeDefined();
    setConsentChecker({ async isGranted() { return false; } }); // simulate revocation
    await expect(generate(PATIENT)).rejects.toBeInstanceOf(ConsentRequiredError);
  });
});

describe('briefing composition (FR-005-009)', () => {
  beforeEach(async () => {
    await clearAll();
    setConsentChecker({ async isGranted() { return true; } });
  });

  it('includes entries, health events, and daily history, with a disclaimer', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'dormir mejor' }, uuid());
    await healthEventRepository().add({ patientId: PATIENT, type: 'symptom', title: 'dolor de cabeza' }, uuid());
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-01', score: 70, band: 'good', components: [] }, uuid());

    const doc = await generate(PATIENT);
    expect(doc.disclaimer.length).toBeGreaterThan(0);
    expect(doc.disclaimer).toMatch(/informativ/i);
    expect(doc.isEmpty).toBe(false);
    const goals = doc.sections.find((s) => s.title === 'Metas y preocupaciones')!;
    const events = doc.sections.find((s) => s.title === 'Eventos de salud')!;
    const history = doc.sections.find((s) => s.title === 'Historial diario')!;
    expect(goals.items.some((i) => i.includes('dormir mejor'))).toBe(true);
    expect(events.items.some((i) => i.includes('dolor de cabeza'))).toBe(true);
    expect(history.items.some((i) => i.includes('2026-07-01'))).toBe(true);
  });

  it('reflects an empty Living Record plainly (isEmpty=true), not fabricated content', async () => {
    const doc = await generate(PATIENT);
    expect(doc.isEmpty).toBe(true);
    expect(doc.sections.every((s) => s.items.length === 0)).toBe(true);
  });

  it('omits diagnostic-sounding content from a section rather than showing it', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'concern', content: 'tienes cáncer' }, uuid());
    const doc = await generate(PATIENT);
    const goals = doc.sections.find((s) => s.title === 'Metas y preocupaciones')!;
    expect(goals.items.some((i) => /cáncer/i.test(i))).toBe(false);
  });

  it('keeps the Daily Score framed as informational, never a diagnosis', async () => {
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-01', score: 30, band: 'low', components: [] }, uuid());
    const doc = await generate(PATIENT);
    const history = doc.sections.find((s) => s.title === 'Historial diario')!;
    expect(history.items[0]).toMatch(/informativ/i);
  });
});

describe('scoping (FR-013/014)', () => {
  beforeEach(async () => {
    await clearAll();
    setConsentChecker({ async isGranted() { return true; } });
  });

  it('restricts to a date range', async () => {
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-06-01', score: 60, band: 'moderate', components: [] }, uuid());
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-01', score: 80, band: 'great', components: [] }, uuid());
    const doc = await generate(PATIENT, { from: '2026-06-15', to: '2026-07-15' });
    const history = doc.sections.find((s) => s.title === 'Historial diario')!;
    expect(history.items).toHaveLength(1);
    expect(history.items[0]).toContain('2026-07-01');
  });

  it('excludes a category from the entries section', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'meta a' }, uuid());
    await livingRecordRepository().add({ patientId: PATIENT, category: 'concern', content: 'preocupación b' }, uuid());
    const doc = await generate(PATIENT, { excludedCategories: ['concern'] });
    const goals = doc.sections.find((s) => s.title === 'Metas y preocupaciones')!;
    expect(goals.items.some((i) => i.includes('meta a'))).toBe(true);
    expect(goals.items.some((i) => i.includes('preocupación b'))).toBe(false);
  });
});
