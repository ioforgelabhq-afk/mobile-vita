import type {
  LivingRecordRepository,
  AddEntryInput,
  EntryPatch,
  LivingRecordExport,
} from '@/repositories/contracts/living-record.repository';
import type { LivingRecordEntry } from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

/** API LivingRecordRepository — conforms to /living-record* (openapi.yaml). Stub until backend. */
export class ApiLivingRecordRepository implements LivingRecordRepository {
  async list(_patientId: string): Promise<LivingRecordEntry[]> {
    throw new RepositoryError('internal_error', 'ApiLivingRecordRepository not implemented (no backend yet)');
  }
  async add(_input: AddEntryInput, _clientMutationId: string): Promise<LivingRecordEntry> {
    throw new RepositoryError('internal_error', 'ApiLivingRecordRepository not implemented (no backend yet)');
  }
  async correct(_entryId: string, _patch: EntryPatch, _clientMutationId: string): Promise<LivingRecordEntry> {
    throw new RepositoryError('internal_error', 'ApiLivingRecordRepository not implemented (no backend yet)');
  }
  async remove(_entryId: string, _clientMutationId: string): Promise<void> {
    throw new RepositoryError('internal_error', 'ApiLivingRecordRepository not implemented (no backend yet)');
  }
  async export(_patientId: string): Promise<LivingRecordExport> {
    throw new RepositoryError('internal_error', 'ApiLivingRecordRepository not implemented (no backend yet)');
  }
}
