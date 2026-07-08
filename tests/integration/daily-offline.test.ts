/**
 * T036 [US4] — offline-first: the daily check-in and Daily Score work fully against local storage
 * (no network dependency), and replaying a mutation (the offline-reconnect scenario) never creates
 * a duplicate — including no duplicate day record (Principle VIII; FR-022/023).
 */
import { stores } from '@/repositories/mock/stores';
import { setConsentChecker } from '@/services/consent-gate';
import { dailyCheckinRepository, dailyScoreRepository } from '@/repositories';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';
const DATE = '2026-07-08';

beforeEach(async () => {
  await stores.dailyCheckins.clear();
  await stores.dailyScores.clear();
  setConsentChecker({ async isGranted() { return true; } });
});
afterEach(() => setConsentChecker(null));

it('completes entirely against local storage (no network call in the path)', async () => {
  const checkin = await dailyCheckinRepository().startOrResume(PATIENT, DATE);
  const updated = await dailyCheckinRepository().update(checkin.id, { mood: 'good' }, uuid());
  expect(updated.mood).toBe('good');
  const score = await dailyScoreRepository().save(
    { patientId: PATIENT, date: DATE, score: 75, band: 'good', components: [], checkInId: checkin.id },
    uuid(),
  );
  expect(score.score).toBe(75);
});

it('replaying the same update mutation id is idempotent (no duplicate state change)', async () => {
  const checkin = await dailyCheckinRepository().startOrResume(PATIENT, DATE);
  const cmid = uuid();
  const first = await dailyCheckinRepository().update(checkin.id, { mood: 'good' }, cmid);
  const replay = await dailyCheckinRepository().update(checkin.id, { mood: 'low' }, cmid); // ignored
  expect(replay.mood).toBe(first.mood); // replay returns the already-applied state, not a new mutation
});

it('saving the Daily Score twice for the same day never creates a duplicate record (FR-023)', async () => {
  const patientId = PATIENT;
  await dailyScoreRepository().save(
    { patientId, date: DATE, score: 60, band: 'moderate', components: [] },
    uuid(),
  );
  await dailyScoreRepository().save(
    { patientId, date: DATE, score: 82, band: 'great', components: [] },
    uuid(),
  );
  const scores = await dailyScoreRepository().list(patientId);
  expect(scores).toHaveLength(1);
  expect(scores[0].score).toBe(82); // latest write wins for the day, still one record
});

it('starting the check-in twice for the same day never creates a duplicate record', async () => {
  const a = await dailyCheckinRepository().startOrResume(PATIENT, DATE);
  const b = await dailyCheckinRepository().startOrResume(PATIENT, DATE);
  expect(a.id).toBe(b.id);
  expect(await stores.dailyCheckins.list()).toHaveLength(1);
});
