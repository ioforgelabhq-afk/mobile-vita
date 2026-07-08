import type {
  PhysicianRepository,
  AddPhysicianInput,
  PhysicianPatch,
} from '@/repositories/contracts/physician.repository';
import { Physician } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * Mock PhysicianRepository. Only `name` is required (FR-001); no uniqueness constraint (spec
 * edge case — duplicate names allowed). `remove` is a soft delete, consistent with every other
 * repository. Idempotent per `clientMutationId` (replay-safe).
 */
export class MockPhysicianRepository implements PhysicianRepository {
  constructor(private readonly store: CollectionStore<Physician>) {}

  async list(patientId: string): Promise<Physician[]> {
    const all = await this.store.list();
    return all.filter((p) => p.patientId === patientId && p.deletedAt === null);
  }

  async add(input: AddPhysicianInput, clientMutationId: string): Promise<Physician> {
    if (!syncQueue.enqueue({ clientMutationId, collection: 'physicians', op: 'create', payload: input, enqueuedAt: nowIso() })) {
      const existing = (await this.store.list()).find((p) => p.clientMutationId === clientMutationId);
      if (existing) return existing;
    }
    const now = nowIso();
    const physician = Physician.parse({
      id: uuid(),
      patientId: input.patientId,
      name: input.name,
      specialty: input.specialty ?? null,
      organization: input.organization ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(physician);
  }

  async update(physicianId: string, patch: PhysicianPatch, clientMutationId: string): Promise<Physician> {
    const current = await this.store.get(physicianId);
    if (!current) throw new RepositoryError('not_found', `Physician ${physicianId} not found`);
    if (!syncQueue.enqueue({ clientMutationId, collection: 'physicians', op: 'update', payload: patch, enqueuedAt: nowIso() })) {
      return current;
    }
    const updated = Physician.parse({
      ...current,
      ...patch,
      updatedAt: nowIso(),
      version: current.version + 1,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(updated);
  }

  async remove(physicianId: string, clientMutationId: string): Promise<void> {
    const current = await this.store.get(physicianId);
    if (!current) return;
    await this.store.put({ ...current, deletedAt: nowIso(), updatedAt: nowIso() });
    syncQueue.enqueue({ clientMutationId, collection: 'physicians', op: 'delete', payload: { physicianId }, enqueuedAt: nowIso() });
  }
}
