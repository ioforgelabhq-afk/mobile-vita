import type {
  PatientRepository,
  PatientPatch,
} from '@/repositories/contracts/patient.repository';
import { Patient } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { RepositoryError } from '@/repositories/contracts/errors';

export class MockPatientRepository implements PatientRepository {
  constructor(private readonly store: CollectionStore<Patient>) {}

  async get(patientId: string): Promise<Patient | null> {
    return this.store.get(patientId);
  }

  async update(
    patientId: string,
    patch: PatientPatch,
    clientMutationId: string,
  ): Promise<Patient> {
    const current = await this.store.get(patientId);
    if (!current) throw new RepositoryError('not_found', `Patient ${patientId} not found`);

    // Idempotent replay guard (FR-021): a repeated mutation id returns current state.
    if (!syncQueue.enqueue({
      clientMutationId,
      collection: 'patients',
      op: 'update',
      payload: patch,
      enqueuedAt: nowIso(),
    })) {
      return current;
    }

    const updated = Patient.parse({
      ...current,
      ...patch,
      updatedAt: nowIso(),
      version: current.version + 1,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(updated);
  }
}
