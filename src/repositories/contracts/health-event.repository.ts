import type { HealthEvent, HealthEventType } from './schemas';

export interface AddHealthEventInput {
  patientId: string;
  type: HealthEventType;
  title: string;
  description?: string;
  occurredAt?: string;
  relatedConversationId?: string | null;
  source?: HealthEvent['source'];
}

export interface HealthEventPatch {
  title?: string;
  description?: string;
  occurredAt?: string;
}

/** HealthEventRepository — discrete health occurrences (contracts/health-event.contract.md; FR-015). */
export interface HealthEventRepository {
  list(patientId: string): Promise<HealthEvent[]>;
  add(input: AddHealthEventInput, clientMutationId: string): Promise<HealthEvent>;
  correct(eventId: string, patch: HealthEventPatch, clientMutationId: string): Promise<HealthEvent>;
  remove(eventId: string, clientMutationId: string): Promise<void>;
}
