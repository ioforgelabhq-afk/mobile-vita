import type {
  ConsentRepository,
  ConsentDefinition,
  CaptureConsentInput,
  RevokeConsentInput,
} from '@/repositories/contracts/consent.repository';
import type { ConsentRecord, ConsentPurpose } from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

/** API ConsentRepository — conforms to /consent* (openapi.yaml). Stub until backend exists. */
export class ApiConsentRepository implements ConsentRepository {
  async getConsentDefinition(): Promise<ConsentDefinition> {
    throw new RepositoryError('internal_error', 'ApiConsentRepository not implemented (no backend yet)');
  }
  async get(_patientId: string): Promise<ConsentRecord | null> {
    throw new RepositoryError('internal_error', 'ApiConsentRepository not implemented (no backend yet)');
  }
  async capture(_input: CaptureConsentInput, _clientMutationId: string): Promise<ConsentRecord> {
    throw new RepositoryError('internal_error', 'ApiConsentRepository not implemented (no backend yet)');
  }
  async revoke(_input: RevokeConsentInput, _clientMutationId: string): Promise<ConsentRecord> {
    throw new RepositoryError('internal_error', 'ApiConsentRepository not implemented (no backend yet)');
  }
  async isGranted(_patientId: string, _purpose: ConsentPurpose): Promise<boolean> {
    throw new RepositoryError('internal_error', 'ApiConsentRepository not implemented (no backend yet)');
  }
}
