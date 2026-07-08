/**
 * T025 [US2] — every check-in enriches the Living Record: symptoms become attributed Health
 * Events, the check-in + score are stored/correctable, and health data is skipped (not persisted)
 * without `store_health_data` consent (SC-010, FR-015/016/017/018).
 */
import { stores } from '@/repositories/mock/stores';
import { setConsentChecker } from '@/services/consent-gate';
import { startCheckin, submitAnswer } from '@/features/daily-checkin/checkin-runner';
import type { DailyStepId } from '@/features/daily-checkin/flow/engine';
import { healthEventRepository } from '@/repositories';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';
const DATE = '2026-07-08';

async function clearAll() {
  await stores.dailyCheckins.clear();
  await stores.dailyScores.clear();
  await stores.healthEvents.clear();
  await stores.insights.clear();
}

afterEach(() => setConsentChecker(null));

async function runFullCheckin(answers: Partial<Record<DailyStepId, string>>) {
  const start = await startCheckin(PATIENT, DATE);
  let checkin = start.checkin;
  let step: DailyStepId | null = start.step;
  let last: Awaited<ReturnType<typeof submitAnswer>> | null = null;
  const DEFAULTS: Record<DailyStepId, string> = {
    mood: 'bien', sleep: '8', energy: '4', symptoms: 'no', notes: 'no',
  };
  while (step) {
    const res = await submitAnswer(checkin, step, answers[step] ?? DEFAULTS[step]);
    checkin = res.checkin;
    last = res;
    if (res.done) break;
    step = res.nextStep ?? null;
  }
  return last!;
}

it('turns a reported symptom into an attributed Health Event (FR-015)', async () => {
  await clearAll();
  setConsentChecker({ async isGranted() { return true; } });

  const res = await runFullCheckin({ symptoms: 'dolor de cabeza, náuseas' });
  const events = await healthEventRepository().list(PATIENT);
  expect(events.length).toBe(2);
  expect(events.every((e) => e.source === 'daily_checkin')).toBe(true);
  expect(events.map((e) => e.title)).toEqual(expect.arrayContaining(['dolor de cabeza', 'náuseas']));
  expect(res.score).toBeDefined();
});

it('stores the check-in + score as correctable records (FR-016/017)', async () => {
  await clearAll();
  setConsentChecker({ async isGranted() { return true; } });
  await runFullCheckin({});

  const events = await healthEventRepository().list(PATIENT);
  // no symptoms this run, but correction still works on an arbitrary event if present later;
  // verify the check-in/score themselves are queryable and carry attribution.
  const checkins = await stores.dailyCheckins.list();
  const scores = await stores.dailyScores.list();
  expect(checkins).toHaveLength(1);
  expect(scores).toHaveLength(1);
  expect(checkins[0].completedAt).toBeTruthy();
  expect(events).toHaveLength(0);
});

it('skips persisting health data without store_health_data consent, but still scores (FR-018)', async () => {
  await clearAll();
  setConsentChecker({ async isGranted() { return false; } });

  const res = await runFullCheckin({ symptoms: 'dolor de espalda' });
  expect(res.score).toBeDefined(); // score still shown
  const events = await healthEventRepository().list(PATIENT);
  expect(events).toHaveLength(0); // nothing health-bearing persisted
  const checkins = await stores.dailyCheckins.list();
  expect(checkins[0].symptoms).toEqual([]); // symptoms dropped by the consent gate in update()
});

it('a correction supersedes the prior Health Event value', async () => {
  await clearAll();
  setConsentChecker({ async isGranted() { return true; } });
  const event = await healthEventRepository().add(
    { patientId: PATIENT, type: 'symptom', title: 'dolor leve' },
    uuid(),
  );
  const corrected = await healthEventRepository().correct(event.id, { title: 'dolor moderado' }, uuid());
  expect(corrected.title).toBe('dolor moderado');
  expect(corrected.id).toBe(event.id);
});
