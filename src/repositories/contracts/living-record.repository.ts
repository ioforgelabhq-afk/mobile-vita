import type { LivingRecordEntry, EntryCategory } from './schemas';

export interface AddEntryInput {
  patientId: string;
  category: EntryCategory;
  content: string;
  sourceTurnId?: string | null;
}

export interface EntryPatch {
  category?: EntryCategory;
  content?: string;
}

export interface LivingRecordExport {
  patientId: string;
  entries: LivingRecordEntry[];
  exportedAt: string;
  format: 'json';
}

/**
 * LivingRecordRepository — categorized, patient-owned entries (contracts/living-record.contract.md).
 * add/correct MUST pass the fail-closed consent gate before persisting (FR-016).
 */
export interface LivingRecordRepository {
  list(patientId: string): Promise<LivingRecordEntry[]>;
  add(input: AddEntryInput, clientMutationId: string): Promise<LivingRecordEntry>;
  correct(entryId: string, patch: EntryPatch, clientMutationId: string): Promise<LivingRecordEntry>;
  remove(entryId: string, clientMutationId: string): Promise<void>;
  export(patientId: string): Promise<LivingRecordExport>;
}
