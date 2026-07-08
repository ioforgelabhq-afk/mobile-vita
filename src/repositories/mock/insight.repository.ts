import type {
  InsightRepository,
  AddInsightInput,
} from '@/repositories/contracts/insight.repository';
import { Insight } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { guardrails } from '@/services/guardrails';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * Mock InsightRepository. `add` rejects a body that fails the guardrails check (no diagnostic
 * assertion — FR-011); stored insights always carry the disclaimer (FR-012). `list` excludes
 * dismissed by default; `dismiss` sets `dismissedAt` (FR-013).
 */
export class MockInsightRepository implements InsightRepository {
  constructor(private readonly store: CollectionStore<Insight>) {}

  async list(patientId: string, opts?: { includeDismissed?: boolean }): Promise<Insight[]> {
    const all = await this.store.list();
    return all.filter(
      (i) =>
        i.patientId === patientId &&
        i.deletedAt === null &&
        (opts?.includeDismissed ? true : i.dismissedAt === null),
    );
  }

  async add(input: AddInsightInput, clientMutationId: string): Promise<Insight> {
    if (!guardrails.inspect(input.body).ok) {
      throw new RepositoryError('validation_error', 'Insight body failed the informational guardrail');
    }
    if (!syncQueue.enqueue({ clientMutationId, collection: 'insights', op: 'create', payload: input, enqueuedAt: nowIso() })) {
      const existing = (await this.store.list()).find((i) => i.clientMutationId === clientMutationId);
      if (existing) return existing;
    }
    const now = nowIso();
    const insight = Insight.parse({
      id: uuid(),
      patientId: input.patientId,
      title: input.title,
      body: input.body,
      category: input.category,
      relatedEntityType: input.relatedEntityType ?? null,
      relatedEntityId: input.relatedEntityId ?? null,
      disclaimerShown: true,
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(insight);
  }

  async dismiss(insightId: string, clientMutationId: string): Promise<Insight> {
    const current = await this.store.get(insightId);
    if (!current) throw new RepositoryError('not_found', `Insight ${insightId} not found`);
    const updated: Insight = { ...current, dismissedAt: nowIso(), updatedAt: nowIso(), clientMutationId };
    syncQueue.enqueue({ clientMutationId, collection: 'insights', op: 'update', payload: { insightId, dismissed: true }, enqueuedAt: nowIso() });
    return this.store.put(updated);
  }
}
