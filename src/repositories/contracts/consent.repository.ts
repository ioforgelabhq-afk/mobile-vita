import type { ConsentRecord, ConsentPurpose } from './schemas';

export interface ConsentDefinition {
  version: string;
  purposes: {
    purpose: ConsentPurpose;
    label: string;
    description: string;
    required: boolean;
  }[];
}

export interface CaptureConsentInput {
  patientId: string;
  version: string;
  grants: { purpose: ConsentPurpose; granted: boolean }[];
}

export interface RevokeConsentInput {
  patientId: string;
  purpose?: ConsentPurpose; // omit → revoke all
}

/**
 * ConsentRepository — granular, auditable consent (contracts/consent.contract.md; FR-012–016a).
 * `isGranted` is the single gate the fail-closed consent gate consults.
 */
export interface ConsentRepository {
  getConsentDefinition(): Promise<ConsentDefinition>;
  get(patientId: string): Promise<ConsentRecord | null>;
  capture(input: CaptureConsentInput, clientMutationId: string): Promise<ConsentRecord>;
  revoke(input: RevokeConsentInput, clientMutationId: string): Promise<ConsentRecord>;
  isGranted(patientId: string, purpose: ConsentPurpose): Promise<boolean>;
}
