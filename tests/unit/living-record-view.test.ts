/**
 * Living Record View — aggregation, filter, correction-consistency, and export tests
 * (T004/T010/T014/T017/T018). Drives the pure service against the mock stores directly, since it
 * introduces no new repositories (FR-014).
 */
import { stores } from '@/repositories/mock/stores';
import { setConsentChecker } from '@/services/consent-gate';
import { livingRecordRepository, healthEventRepository, dailyScoreRepository } from '@/repositories';
import {
  loadItems,
  loadDailyHistory,
  filterItems,
  correctItem,
  removeItem,
  exportAll,
} from '@/services/living-record-view';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';

async function clearAll() {
  await stores.entries.clear();
  await stores.healthEvents.clear();
  await stores.dailyCheckins.clear();
  await stores.dailyScores.clear();
}

beforeEach(async () => {
  await clearAll();
  setConsentChecker({ async isGranted() { return true; } });
});
afterEach(() => setConsentChecker(null));

describe('loadItems (FR-001/002)', () => {
  it('merges entries + health events, each carrying category/timestamp/source', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'dormir mejor' }, uuid());
    await healthEventRepository().add({ patientId: PATIENT, type: 'symptom', title: 'dolor de cabeza' }, uuid());

    const items = await loadItems(PATIENT);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.kind).sort()).toEqual(['entry', 'health_event']);
    for (const item of items) {
      expect(item.category).toBeTruthy();
      expect(item.timestamp).toBeTruthy();
      expect(item.source).toBeTruthy();
    }
  });

  it('sorts newest first', async () => {
    const first = await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'a' }, uuid());
    await new Promise((r) => setTimeout(r, 2));
    const second = await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'b' }, uuid());
    const items = await loadItems(PATIENT);
    expect(items[0].id).toBe(second.id);
    expect(items[1].id).toBe(first.id);
  });
});

describe('loadDailyHistory (FR-004/006)', () => {
  it('returns points ascending by date', async () => {
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-02', score: 70, band: 'good', components: [] }, uuid());
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-01', score: 60, band: 'moderate', components: [] }, uuid());
    const history = await loadDailyHistory(PATIENT);
    expect(history.map((h) => h.date)).toEqual(['2026-07-01', '2026-07-02']);
  });

  it('returns a single point without error when history is thin (no trend implied by the caller)', async () => {
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-01', score: 60, band: 'moderate', components: [] }, uuid());
    const history = await loadDailyHistory(PATIENT);
    expect(history).toHaveLength(1); // UI layer decides not to render trend below 2 (FR-006)
  });
});

describe('filterItems (FR-011/012/013)', () => {
  it('filters by category', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'a' }, uuid());
    await livingRecordRepository().add({ patientId: PATIENT, category: 'concern', content: 'b' }, uuid());
    const items = await loadItems(PATIENT);
    const filtered = filterItems(items, { category: 'goal' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('goal');
  });

  it('filters by date range', async () => {
    const items = [
      { id: '1', kind: 'entry' as const, category: 'goal' as const, content: 'a', timestamp: '2026-07-01T00:00:00Z', source: 'onboarding', status: 'active' as const },
      { id: '2', kind: 'entry' as const, category: 'goal' as const, content: 'b', timestamp: '2026-07-10T00:00:00Z', source: 'onboarding', status: 'active' as const },
    ];
    const filtered = filterItems(items, { from: '2026-07-05', to: '2026-07-15' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('returns an empty array when nothing matches (no-results state)', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'a' }, uuid());
    const items = await loadItems(PATIENT);
    expect(filterItems(items, { category: 'concern' })).toHaveLength(0);
  });
});

describe('correctItem / removeItem consistency (FR-007/008/009)', () => {
  it('a correction is reflected in a subsequent loadItems (no stale value)', async () => {
    const entry = await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'caminar' }, uuid());
    const items = await loadItems(PATIENT);
    const item = items.find((i) => i.id === entry.id)!;

    await correctItem(item, { content: 'caminar 30 min' }, uuid());
    const after = await loadItems(PATIENT);
    expect(after).toHaveLength(1); // superseded entry does not linger as a second item
    expect(after[0].content).toBe('caminar 30 min');
  });

  it('removing a health event makes it disappear from loadItems everywhere', async () => {
    const event = await healthEventRepository().add({ patientId: PATIENT, type: 'symptom', title: 'mareo' }, uuid());
    const items = await loadItems(PATIENT);
    const item = items.find((i) => i.id === event.id)!;

    await removeItem(item, uuid());
    const after = await loadItems(PATIENT);
    expect(after).toHaveLength(0);
    expect(await healthEventRepository().list(PATIENT)).toHaveLength(0);
  });
});

describe('exportAll (SC-004, FR-010)', () => {
  it('composes entries, health events, check-ins, and scores into one payload', async () => {
    await livingRecordRepository().add({ patientId: PATIENT, category: 'goal', content: 'a' }, uuid());
    await healthEventRepository().add({ patientId: PATIENT, type: 'symptom', title: 'b' }, uuid());
    await dailyScoreRepository().save({ patientId: PATIENT, date: '2026-07-01', score: 70, band: 'good', components: [] }, uuid());

    const result = await exportAll(PATIENT);
    expect(result.entries).toHaveLength(1);
    expect(result.healthEvents).toHaveLength(1);
    expect(result.dailyScores).toHaveLength(1);
    expect(result.format).toBe('json');
    expect(result.exportedAt).toBeTruthy();
  });
});
