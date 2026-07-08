import type {
  HealthEventRepository,
  AddHealthEventInput,
  HealthEventPatch,
} from '@/repositories/contracts/health-event.repository';
import { HealthEvent } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { requireConsent } from '@/services/consent-gate';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * Mock HealthEventRepository. `add` is consent-gated (fail-closed, FR-018); events are attributed
 * and timestamped (FR-015); `correct` supersedes; `remove` is a soft delete (FR-017).
 */
export class MockHealthEventRepository implements HealthEventRepository {
  constructor(private readonly store: CollectionStore<HealthEvent>) {}

  async list(patientId: string): Promise<HealthEvent[]> {
    const all = await this.store.list();
    return all.filter((e) => e.patientId === patientId && e.deletedAt === null);
  }

  async add(input: AddHealthEventInput, clientMutationId: string): Promise<HealthEvent> {
    await requireConsent(input.patientId, 'store_health_data');
    if (!syncQueue.enqueue({ clientMutationId, collection: 'health_events', op: 'create', payload: input, enqueuedAt: nowIso() })) {
      const existing = (await this.store.list()).find((e) => e.clientMutationId === clientMutationId);
      if (existing) return existing;
    }
    const now = nowIso();
    const event = HealthEvent.parse({
      id: uuid(),
      patientId: input.patientId,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      occurredAt: input.occurredAt ?? now,
      recordedAt: now,
      source: input.source ?? 'daily_checkin',
      relatedConversationId: input.relatedConversationId ?? null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(event);
  }

  async correct(eventId: string, patch: HealthEventPatch, clientMutationId: string): Promise<HealthEvent> {
    const current = await this.store.get(eventId);
    if (!current) throw new RepositoryError('not_found', `Health event ${eventId} not found`);
    const updated = HealthEvent.parse({
      ...current,
      ...patch,
      updatedAt: nowIso(),
      version: current.version + 1,
      clientMutationId,
    });
    syncQueue.enqueue({ clientMutationId, collection: 'health_events', op: 'update', payload: { eventId, patch }, enqueuedAt: nowIso() });
    return this.store.put(updated);
  }

  async remove(eventId: string, clientMutationId: string): Promise<void> {
    const current = await this.store.get(eventId);
    if (!current) return;
    await this.store.put({ ...current, deletedAt: nowIso(), updatedAt: nowIso() });
    syncQueue.enqueue({ clientMutationId, collection: 'health_events', op: 'delete', payload: { eventId }, enqueuedAt: nowIso() });
  }
}
