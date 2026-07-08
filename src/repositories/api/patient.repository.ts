import type {
  PatientRepository,
  PatientPatch,
} from '@/repositories/contracts/patient.repository';
import type { Patient } from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

/** API PatientRepository — conforms to /patients/me (openapi.yaml). Stub until backend exists. */
export class ApiPatientRepository implements PatientRepository {
  async get(_patientId: string): Promise<Patient | null> {
    throw new RepositoryError('internal_error', 'ApiPatientRepository not implemented (no backend yet)');
  }
  async update(
    _patientId: string,
    _patch: PatientPatch,
    _clientMutationId: string,
  ): Promise<Patient> {
    throw new RepositoryError('internal_error', 'ApiPatientRepository not implemented (no backend yet)');
  }
}
