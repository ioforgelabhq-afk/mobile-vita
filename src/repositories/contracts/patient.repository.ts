import type { Patient } from './schemas';

export interface PatientPatch {
  displayName?: string;
  dateOfBirth?: string;
  biologicalSex?: Patient['biologicalSex'];
  locale?: string;
}

/** PatientRepository — minimal, conversationally-gathered profile (contracts/patient.contract.md). */
export interface PatientRepository {
  get(patientId: string): Promise<Patient | null>;
  update(patientId: string, patch: PatientPatch, clientMutationId: string): Promise<Patient>;
}
