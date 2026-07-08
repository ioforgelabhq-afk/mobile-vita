import type {
  ConsentRepository,
  ConsentDefinition,
  CaptureConsentInput,
  RevokeConsentInput,
} from '@/repositories/contracts/consent.repository';
import { ConsentRecord, type ConsentPurpose } from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { CONSENT_DEFINITION } from '@/features/onboarding/content/consent-definition';

/**
 * Mock ConsentRepository. Consent is granular and auditable (records the shown copy `version`).
 * A revoked purpose is set to granted:false rather than deleted, keeping the audit trail (FR-016a).
 */
export class MockConsentRepository implements ConsentRepository {
  constructor(private readonly store: CollectionStore<ConsentRecord>) {}

  async getConsentDefinition(): Promise<ConsentDefinition> {
    return CONSENT_DEFINITION;
  }

  async get(patientId: string): Promise<ConsentRecord | null> {
    const all = await this.store.list();
    return all.find((c) => c.patientId === patientId && c.deletedAt === null) ?? null;
  }

  async capture(input: CaptureConsentInput, clientMutationId: string): Promise<ConsentRecord> {
    if (!syncQueue.enqueue({
      clientMutationId,
      collection: 'consents',
      op: 'create',
      payload: input,
      enqueuedAt: nowIso(),
    })) {
      const existing = (await this.store.list()).find((c) => c.clientMutationId === clientMutationId);
      if (existing) return existing;
    }
    const now = nowIso();
    const record = ConsentRecord.parse({
      id: uuid(),
      patientId: input.patientId,
      definitionVersion: input.version,
      capturedAt: now,
      grants: input.grants.map((g) => ({ ...g, decidedAt: now })),
      createdAt: now,
      updatedAt: now,
      syncStatus: 'queued',
      clientMutationId,
    });
    return this.store.put(record);
  }

  async revoke(input: RevokeConsentInput, clientMutationId: string): Promise<ConsentRecord> {
    const record = await this.get(input.patientId);
    if (!record) throw new Error('No consent record to revoke');
    const now = nowIso();
    const grants = input.purpose
      ? record.grants.map((g) => (g.purpose === input.purpose ? { ...g, granted: false, decidedAt: now } : g))
      : record.grants.map((g) => ({ ...g, granted: false, decidedAt: now }));
    const updated: ConsentRecord = {
      ...record,
      grants,
      revokedAt: input.purpose ? record.revokedAt : now,
      updatedAt: now,
      version: record.version + 1,
      clientMutationId,
    };
    syncQueue.enqueue({ clientMutationId, collection: 'consents', op: 'update', payload: input, enqueuedAt: now });
    return this.store.put(updated);
  }

  async isGranted(patientId: string, purpose: ConsentPurpose): Promise<boolean> {
    const record = await this.get(patientId);
    if (!record || record.revokedAt) return false;
    return record.grants.some((g) => g.purpose === purpose && g.granted);
  }
}
