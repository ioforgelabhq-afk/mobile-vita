import type { AuthRepository, LinkAccountInput } from '@/repositories/contracts/auth.repository';
import { Patient } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { memoryStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';

const IDENTITY_ID = 'local-patient';

/**
 * Mock AuthRepository: local-first anonymous identity, account optional (FR-020a/b).
 * Persists a single Patient row in the injected store.
 */
export class MockAuthRepository implements AuthRepository {
  constructor(private readonly store: CollectionStore<Patient> = memoryStore<Patient>()) {}

  async getOrCreateLocalIdentity(): Promise<Patient> {
    const existing = await this.store.get(IDENTITY_ID);
    if (existing) return existing;
    const now = nowIso();
    const patient = Patient.parse({
      id: IDENTITY_ID,
      createdAt: now,
      updatedAt: now,
      clientMutationId: uuid(),
      locale: 'es',
      accountLinked: false,
    });
    return this.store.put(patient);
  }

  async linkAccount(input: LinkAccountInput): Promise<Patient> {
    const patient = await this.getOrCreateLocalIdentity();
    const updated: Patient = {
      ...patient,
      accountLinked: true,
      email: input.email ?? patient.email,
      updatedAt: nowIso(),
      version: patient.version + 1,
      clientMutationId: uuid(),
    };
    return this.store.put(updated);
  }

  async isAccountLinked(): Promise<boolean> {
    const p = await this.store.get(IDENTITY_ID);
    return p?.accountLinked ?? false;
  }
}
