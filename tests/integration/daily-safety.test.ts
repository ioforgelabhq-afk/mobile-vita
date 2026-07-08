/**
 * T035 [US4] — crisis screening during the daily check-in surfaces resources ahead of continuing
 * (Principle IV; FR-019/020), errs toward safety on ambiguous signals (FR-019), and resumes
 * normal flow (without re-triggering) once the patient answers again for the same step.
 */
import { stores } from '@/repositories/mock/stores';
import { setConsentChecker } from '@/services/consent-gate';
import { startCheckin, submitAnswer } from '@/features/daily-checkin/checkin-runner';

const PATIENT = 'local-patient';
const DATE = '2026-07-08';

beforeEach(async () => {
  await stores.dailyCheckins.clear();
  await stores.dailyScores.clear();
  setConsentChecker({ async isGranted() { return true; } });
});
afterEach(() => setConsentChecker(null));

it('surfaces safety resources before continuing on an explicit crisis signal', async () => {
  const start = await startCheckin(PATIENT, DATE);
  const res = await submitAnswer(start.checkin, start.step, 'ya no quiero vivir');
  expect(res.safetyEvent).toBeDefined();
  expect(res.safetyEvent!.resources.length).toBeGreaterThan(0);
  expect(res.nextStep).toBeUndefined();
  expect(res.done).toBeUndefined();
});

it('errs toward surfacing resources on an ambiguous signal (FR-019)', async () => {
  const start = await startCheckin(PATIENT, DATE);
  const res = await submitAnswer(start.checkin, start.step, 'ya no aguanto');
  expect(res.safetyEvent).toBeDefined();
});

it('resumes normal flow on the same step after the safety moment (does not skip content)', async () => {
  const start = await startCheckin(PATIENT, DATE);
  const crisis = await submitAnswer(start.checkin, start.step, 'me quiero morir');
  expect(crisis.safetyEvent).toBeDefined();

  // Patient (having seen resources) answers the SAME step normally — flow proceeds as usual.
  const resumed = await submitAnswer(crisis.checkin, start.step, 'me siento bien');
  expect(resumed.safetyEvent).toBeUndefined();
  expect(resumed.nextStep).toBeDefined();
});

it('declines a diagnosis request and reframes without advancing (FR-021)', async () => {
  const start = await startCheckin(PATIENT, DATE);
  const res = await submitAnswer(start.checkin, start.step, '¿qué tengo?');
  expect(res.reframe).toBeDefined();
  expect(res.reframe).toMatch(/no puedo darte un diagnóstico/i);
  expect(res.nextStep).toBeUndefined();
});
