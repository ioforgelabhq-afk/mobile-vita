/**
 * T052 [US4] — offline capture + replay-safe sync (Principle VIII; FR-020/021).
 *
 * The repos write to local storage regardless of connectivity, and each mutation carries a
 * clientMutationId. Replaying the same mutation (e.g. after a dropped/retried sync) must NOT
 * create a duplicate. Draining the queue sends each queued mutation exactly once.
 */
import { memoryStore } from '@/lib/storage/store';
import { LivingRecordEntry } from '@/repositories/contracts/schemas';
import { MockLivingRecordRepository } from '@/repositories/mock/living-record.repository';
import { SyncQueue } from '@/lib/sync/queue';
import { setConsentChecker } from '@/services/consent-gate';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';
beforeEach(() => setConsentChecker({ async isGranted() { return true; } }));
afterEach(() => setConsentChecker(null));

it('captures locally and does not duplicate on replay of the same clientMutationId (FR-021)', async () => {
  const repo = new MockLivingRecordRepository(memoryStore<LivingRecordEntry>());
  const cmid = uuid();
  const first = await repo.add({ patientId: PATIENT, category: 'goal', content: 'dormir mejor' }, cmid);
  const replay = await repo.add({ patientId: PATIENT, category: 'goal', content: 'dormir mejor' }, cmid);

  expect(replay.id).toBe(first.id); // same record returned, not a new one
  expect(await repo.list(PATIENT)).toHaveLength(1);
});

it('drains queued mutations exactly once and preserves order', async () => {
  const q = new SyncQueue();
  ['a', 'b', 'c'].forEach((id) =>
    q.enqueue({ clientMutationId: id, collection: 'entries', op: 'create', payload: {}, enqueuedAt: '2026-07-07T00:00:00Z' }),
  );
  const sent: string[] = [];
  const n = await q.drain(async (e) => void sent.push(e.clientMutationId));
  expect(n).toBe(3);
  expect(sent).toEqual(['a', 'b', 'c']);
  // A second drain sends nothing (all already delivered exactly once).
  expect(await q.drain(async () => {})).toBe(0);
});
