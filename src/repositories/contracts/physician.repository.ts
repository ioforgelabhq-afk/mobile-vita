import type { Physician } from './schemas';

export interface AddPhysicianInput {
  patientId: string;
  name: string;
  specialty?: string;
  organization?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface PhysicianPatch {
  name?: string;
  specialty?: string;
  organization?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

/** PhysicianRepository — patient-owned contacts (contracts/physician.contract.md; FR-001–004). */
export interface PhysicianRepository {
  list(patientId: string): Promise<Physician[]>;
  add(input: AddPhysicianInput, clientMutationId: string): Promise<Physician>;
  update(physicianId: string, patch: PhysicianPatch, clientMutationId: string): Promise<Physician>;
  remove(physicianId: string, clientMutationId: string): Promise<void>;
}
