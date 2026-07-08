import type {
  DailyCheckinRepository,
  CheckinPatch,
} from '@/repositories/contracts/daily-checkin.repository';
import { DailyCheckin } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { hasConsent } from '@/services/consent-gate';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * Mock DailyCheckinRepository. One completed check-in per (patientId, date) (FR-004); resumes an
 * in-progress record the same day (FR-005). Health-bearing fields (symptoms, notes) are only
 * persisted with `store_health_data` consent (FR-018) — the rest of the check-in still proceeds.
 */
export class MockDailyCheckinRepository implements DailyCheckinRepository {
  constructor(private readonly store: CollectionStore<DailyCheckin>) {}

  async forDate(patientId: string, date: string): Promise<DailyCheckin | null> {
    const all = await this.store.list();
    return all.find((c) => c.patientId === patientId && c.date === date && c.deletedAt === null) ?? null;
  }

  async startOrResume(patientId: string, date: string): Promise<DailyCheckin> {
    const existing = await this.forDate(patientId, date);
    if (existing) return existing; // resume today's (in-progress or completed) — never a 2nd record

    const now = nowIso();
    const checkin = DailyCheckin.parse({
      id: uuid(),
      patientId,
      date,
      createdAt: now,
      updatedAt: now,
      clientMutationId: uuid(),
    });
    await this.store.put(checkin);
    syncQueue.enqueue({ clientMutationId: checkin.clientMutationId, collection: 'daily_checkins', op: 'create', payload: { date }, enqueuedAt: now });
    return checkin;
  }

  async update(checkInId: string, patch: CheckinPatch, clientMutationId: string): Promise<DailyCheckin> {
    const current = await this.store.get(checkInId);
    if (!current) throw new RepositoryError('not_found', `Check-in ${checkInId} not found`);
    if (!syncQueue.enqueue({ clientMutationId, collection: 'daily_checkins', op: 'update', payload: patch, enqueuedAt: nowIso() })) {
      return current;
    }

    // Consent gate: symptoms/notes are health data (FR-018). Drop them if not consented.
    const canStoreHealth = await hasConsent(current.patientId, 'store_health_data');
    const safePatch: CheckinPatch = { ...patch };
    if (!canStoreHealth) {
      delete safePatch.symptoms;
      delete safePatch.notes;
    }

    const updated = DailyCheckin.parse({
      ...current,
      ...safePatch,
      updatedAt: nowIso(),
      version: current.version + 1,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(updated);
  }

  async complete(checkInId: string, dailyScoreId: string, clientMutationId: string): Promise<DailyCheckin> {
    const current = await this.store.get(checkInId);
    if (!current) throw new RepositoryError('not_found', `Check-in ${checkInId} not found`);
    const completed: DailyCheckin = {
      ...current,
      completedAt: nowIso(),
      dailyScoreId,
      updatedAt: nowIso(),
      version: current.version + 1,
      clientMutationId,
    };
    syncQueue.enqueue({ clientMutationId, collection: 'daily_checkins', op: 'update', payload: { id: checkInId, completed: true }, enqueuedAt: nowIso() });
    return this.store.put(completed);
  }

  async list(patientId: string): Promise<DailyCheckin[]> {
    const all = await this.store.list();
    return all
      .filter((c) => c.patientId === patientId && c.deletedAt === null)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}
