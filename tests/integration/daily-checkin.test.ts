/**
 * T017 [US1] — full daily check-in → on-device Daily Score, driven through the runner + registry.
 * Also covers C1 (one-per-day enforcement) and the safety-first gate during the check-in (US4).
 * Consent is seeded; the shared mock stores are cleared per test.
 */
import { stores } from '@/repositories/mock/stores';
import { setConsentChecker } from '@/services/consent-gate';
import { startCheckin, submitAnswer } from '@/features/daily-checkin/checkin-runner';
import type { DailyStepId } from '@/features/daily-checkin/flow/engine';
import type { DailyCheckin, DailyScore } from '@/repositories/contracts/schemas';

const PATIENT = 'local-patient';
const DATE = '2026-07-08';

beforeEach(async () => {
  await stores.dailyCheckins.clear();
  await stores.dailyScores.clear();
  setConsentChecker({ async isGranted() { return true; } });
});
afterEach(() => setConsentChecker(null));

const ANSWERS: Record<DailyStepId, string> = {
  mood: 'me siento bien',
  sleep: 'dormí 8 horas',
  energy: '4',
  symptoms: 'no',
  notes: 'nada',
};

async function runFullCheckin(): Promise<{ checkin: DailyCheckin; score: DailyScore | null }> {
  const start = await startCheckin(PATIENT, DATE);
  let checkin = start.checkin;
  let step: DailyStepId | null = start.step;
  let score: DailyScore | null = null;
  while (step) {
    const res = await submitAnswer(checkin, step, ANSWERS[step]);
    checkin = res.checkin;
    if (res.done) { score = res.score ?? null; break; }
    step = res.nextStep ?? null;
  }
  return { checkin, score };
}

it('produces an on-device Daily Score with band + components (SC-001/004)', async () => {
  const { checkin, score } = await runFullCheckin();
  expect(checkin.completedAt).toBeTruthy();
  expect(score).not.toBeNull();
  expect(score!.score).toBeGreaterThanOrEqual(0);
  expect(score!.score).toBeLessThanOrEqual(100);
  expect(['low', 'moderate', 'good', 'great']).toContain(score!.band);
  expect(score!.components.length).toBeGreaterThan(0);
  expect(score!.disclaimerShown).toBe(true);
});

it('enforces one check-in per local day (C1 / FR-004)', async () => {
  await runFullCheckin();
  // A second start for the same (patient, date) returns the SAME completed record — no new one.
  const second = await startCheckin(PATIENT, DATE);
  expect(second.alreadyDone).toBe(true);
  expect(second.checkin.completedAt).toBeTruthy();
  expect(await stores.dailyCheckins.list()).toHaveLength(1);
  expect(await stores.dailyScores.list()).toHaveLength(1);
});

it('screens safety first and does not advance on a crisis signal (FR-020)', async () => {
  const start = await startCheckin(PATIENT, DATE);
  const res = await submitAnswer(start.checkin, start.step, 'la verdad me quiero morir');
  expect(res.safetyEvent).toBeDefined();
  expect(res.done).toBeUndefined();
  expect(res.nextStep).toBeUndefined();
});
