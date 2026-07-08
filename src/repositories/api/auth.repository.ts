import type { AuthRepository, LinkAccountInput } from '@/repositories/contracts/auth.repository';
import type { Patient } from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * API AuthRepository — conforms to docs/api/openapi.yaml (/auth/token, /patients/me).
 * Stubbed until the backend exists; throws so a misconfigured `api` flag fails loudly
 * rather than silently. Screens never change when this replaces the mock (Principle IX).
 */
export class ApiAuthRepository implements AuthRepository {
  async getOrCreateLocalIdentity(): Promise<Patient> {
    throw new RepositoryError('internal_error', 'ApiAuthRepository not implemented (no backend yet)');
  }
  async linkAccount(_input: LinkAccountInput): Promise<Patient> {
    throw new RepositoryError('internal_error', 'ApiAuthRepository not implemented (no backend yet)');
  }
  async isAccountLinked(): Promise<boolean> {
    throw new RepositoryError('internal_error', 'ApiAuthRepository not implemented (no backend yet)');
  }
}
