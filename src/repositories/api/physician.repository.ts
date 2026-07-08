import type {
  PhysicianRepository,
  AddPhysicianInput,
  PhysicianPatch,
} from '@/repositories/contracts/physician.repository';
import type { Physician } from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

/** API PhysicianRepository — conforms to /physicians* (openapi.yaml). Stub until backend exists. */
export class ApiPhysicianRepository implements PhysicianRepository {
  async list(_patientId: string): Promise<Physician[]> {
    throw new RepositoryError('internal_error', 'ApiPhysicianRepository not implemented (no backend yet)');
  }
  async add(_input: AddPhysicianInput, _clientMutationId: string): Promise<Physician> {
    throw new RepositoryError('internal_error', 'ApiPhysicianRepository not implemented (no backend yet)');
  }
  async update(_physicianId: string, _patch: PhysicianPatch, _clientMutationId: string): Promise<Physician> {
    throw new RepositoryError('internal_error', 'ApiPhysicianRepository not implemented (no backend yet)');
  }
  async remove(_physicianId: string, _clientMutationId: string): Promise<void> {
    throw new RepositoryError('internal_error', 'ApiPhysicianRepository not implemented (no backend yet)');
  }
}
