/**
 * Durable outbound sync queue (Constitution Principle VIII).
 *
 * Every mutation is enqueued with a clientMutationId. Replay is idempotent: enqueuing the
 * same clientMutationId twice is a no-op, so offline replay can never duplicate a record
 * (spec FR-021). While only Mock repositories exist the queue simply holds entries; the API
 * repositories drain it once a backend + connectivity are present.
 */
export type SyncOp = 'create' | 'update' | 'delete';

export interface SyncEntry {
  clientMutationId: string;
  collection: string;
  op: SyncOp;
  payload: unknown;
  enqueuedAt: string;
}

export class SyncQueue {
  private readonly seen = new Set<string>();
  private readonly pending: SyncEntry[] = [];

  /** Idempotent: a repeated clientMutationId is ignored. Returns true if newly enqueued. */
  enqueue(entry: SyncEntry): boolean {
    if (this.seen.has(entry.clientMutationId)) return false;
    this.seen.add(entry.clientMutationId);
    this.pending.push(entry);
    return true;
  }

  size(): number {
    return this.pending.length;
  }

  peek(): readonly SyncEntry[] {
    return this.pending;
  }

  /**
   * Drain pending entries through a transport. Entries that succeed are removed; a failing
   * entry stays queued (and blocks the rest to preserve order) for a later retry.
   */
  async drain(send: (entry: SyncEntry) => Promise<void>): Promise<number> {
    let sent = 0;
    while (this.pending.length > 0) {
      const next = this.pending[0];
      try {
        await send(next);
      } catch {
        break; // keep order; retry later
      }
      this.pending.shift();
      sent += 1;
    }
    return sent;
  }
}

/** App-wide singleton for the MVP. */
export const syncQueue = new SyncQueue();
