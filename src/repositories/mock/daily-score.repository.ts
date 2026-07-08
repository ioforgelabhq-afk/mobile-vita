import type {
  DailyScoreRepository,
  SaveScoreInput,
} from '@/repositories/contracts/daily-score.repository';
import { DailyScore } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';

/**
 * Mock DailyScoreRepository. Unique per (patientId, date); saving twice for a day is idempotent
 * (no duplicate on replay — FR-023). The score value is computed on-device by the scoring service;
 * this just persists/reads it. Always carries the informational disclaimer (FR-008).
 */
export class MockDailyScoreRepository implements DailyScoreRepository {
  constructor(private readonly store: CollectionStore<DailyScore>) {}

  async forDate(patientId: string, date: string): Promise<DailyScore | null> {
    const all = await this.store.list();
    return all.find((s) => s.patientId === patientId && s.date === date && s.deletedAt === null) ?? null;
  }

  async save(input: SaveScoreInput, clientMutationId: string): Promise<DailyScore> {
    // Idempotent replay + one-per-day: reuse the day's record if present.
    const existing = await this.forDate(input.patientId, input.date);
    if (existing) {
      const updated: DailyScore = {
        ...existing,
        score: input.score,
        band: input.band,
        components: input.components,
        checkInId: input.checkInId ?? existing.checkInId,
        computedAt: nowIso(),
        updatedAt: nowIso(),
        version: existing.version + 1,
      };
      return this.store.put(updated);
    }

    const now = nowIso();
    const record = DailyScore.parse({
      id: uuid(),
      patientId: input.patientId,
      date: input.date,
      score: input.score,
      band: input.band,
      components: input.components,
      checkInId: input.checkInId ?? null,
      computedAt: now,
      disclaimerShown: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'queued',
      clientMutationId,
    });
    await this.store.put(record);
    syncQueue.enqueue({ clientMutationId, collection: 'daily_scores', op: 'create', payload: { date: input.date }, enqueuedAt: now });
    return record;
  }

  async list(patientId: string): Promise<DailyScore[]> {
    const all = await this.store.list();
    return all
      .filter((s) => s.patientId === patientId && s.deletedAt === null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
