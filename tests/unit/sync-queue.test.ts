import { SyncQueue } from '@/lib/sync/queue';

// T053 [US4] — sync queue idempotency + ordered drain (FR-021).
describe('SyncQueue', () => {
  const entry = (id: string) => ({
    clientMutationId: id,
    collection: 'entries',
    op: 'create' as const,
    payload: {},
    enqueuedAt: '2026-07-07T00:00:00.000Z',
  });

  it('is idempotent: a repeated clientMutationId does not duplicate', () => {
    const q = new SyncQueue();
    expect(q.enqueue(entry('m1'))).toBe(true);
    expect(q.enqueue(entry('m1'))).toBe(false);
    expect(q.size()).toBe(1);
  });

  it('drains successfully-sent entries and keeps order', async () => {
    const q = new SyncQueue();
    q.enqueue(entry('m1'));
    q.enqueue(entry('m2'));
    const sent: string[] = [];
    const n = await q.drain(async (e) => {
      sent.push(e.clientMutationId);
    });
    expect(n).toBe(2);
    expect(sent).toEqual(['m1', 'm2']);
    expect(q.size()).toBe(0);
  });

  it('stops draining on failure and preserves the remaining queue (retry-safe)', async () => {
    const q = new SyncQueue();
    q.enqueue(entry('m1'));
    q.enqueue(entry('m2'));
    const n = await q.drain(async (e) => {
      if (e.clientMutationId === 'm2') throw new Error('offline');
    });
    expect(n).toBe(1);
    expect(q.size()).toBe(1);
  });
});
