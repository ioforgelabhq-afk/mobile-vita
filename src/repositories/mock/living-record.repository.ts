import type {
  LivingRecordRepository,
  AddEntryInput,
  EntryPatch,
  LivingRecordExport,
} from '@/repositories/contracts/living-record.repository';
import { LivingRecordEntry } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { requireConsent } from '@/services/consent-gate';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * Mock LivingRecordRepository. Every add/correct is gated by the fail-closed consent gate
 * (FR-016) — throws ConsentRequiredError without `store_health_data` consent. Corrections
 * supersede the prior entry rather than mutating it (FR-008). Soft delete for removal (II).
 */
export class MockLivingRecordRepository implements LivingRecordRepository {
  constructor(private readonly store: CollectionStore<LivingRecordEntry>) {}

  async list(patientId: string): Promise<LivingRecordEntry[]> {
    const all = await this.store.list();
    return all.filter(
      (e) => e.patientId === patientId && e.status === 'active' && e.deletedAt === null,
    );
  }

  async add(input: AddEntryInput, clientMutationId: string): Promise<LivingRecordEntry> {
    await requireConsent(input.patientId, 'store_health_data');

    if (!syncQueue.enqueue({
      clientMutationId,
      collection: 'entries',
      op: 'create',
      payload: input,
      enqueuedAt: nowIso(),
    })) {
      const existing = (await this.store.list()).find(
        (e) => e.clientMutationId === clientMutationId,
      );
      if (existing) return existing;
    }

    const now = nowIso();
    const entry = LivingRecordEntry.parse({
      id: uuid(),
      patientId: input.patientId,
      category: input.category,
      content: input.content,
      source: 'onboarding',
      sourceTurnId: input.sourceTurnId ?? null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(entry);
  }

  async correct(
    entryId: string,
    patch: EntryPatch,
    clientMutationId: string,
  ): Promise<LivingRecordEntry> {
    const current = await this.store.get(entryId);
    if (!current) throw new RepositoryError('not_found', `Entry ${entryId} not found`);
    await requireConsent(current.patientId, 'store_health_data');

    // Mark the prior entry as corrected (never treat superseded value as truth — FR-008).
    await this.store.put({ ...current, status: 'corrected', updatedAt: nowIso() });

    const now = nowIso();
    const replacement = LivingRecordEntry.parse({
      ...current,
      id: uuid(),
      category: patch.category ?? current.category,
      content: patch.content ?? current.content,
      status: 'active',
      supersedesId: current.id,
      createdAt: now,
      updatedAt: now,
      version: 0,
      syncStatus: 'queued',
      clientMutationId,
    });
    syncQueue.enqueue({
      clientMutationId,
      collection: 'entries',
      op: 'update',
      payload: { entryId, patch },
      enqueuedAt: now,
    });
    return this.store.put(replacement);
  }

  async remove(entryId: string, clientMutationId: string): Promise<void> {
    const current = await this.store.get(entryId);
    if (!current) return;
    await this.store.put({
      ...current,
      status: 'removed',
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    });
    syncQueue.enqueue({
      clientMutationId,
      collection: 'entries',
      op: 'delete',
      payload: { entryId },
      enqueuedAt: nowIso(),
    });
  }

  async export(patientId: string): Promise<LivingRecordExport> {
    const all = await this.store.list();
    return {
      patientId,
      entries: all.filter((e) => e.patientId === patientId),
      exportedAt: nowIso(),
      format: 'json',
    };
  }
}
