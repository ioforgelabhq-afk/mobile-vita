import type {
  ConversationRepository,
  SendMessageInput,
} from '@/repositories/contracts/conversation.repository';
import type {
  Conversation,
  ConversationTurn,
  CompanionResponse,
} from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

/**
 * API ConversationRepository — conforms to /conversations* (openapi.yaml). A real backend
 * (LLM-backed companion) implements this. Stubbed until it exists; screens do not change
 * when this replaces the mock (Principle IX).
 */
export class ApiConversationRepository implements ConversationRepository {
  async startOrResume(_patientId: string): Promise<Conversation> {
    throw new RepositoryError('internal_error', 'ApiConversationRepository not implemented (no backend yet)');
  }
  async sendPatientMessage(_input: SendMessageInput): Promise<CompanionResponse> {
    throw new RepositoryError('internal_error', 'ApiConversationRepository not implemented (no backend yet)');
  }
  async complete(_conversationId: string, _clientMutationId: string): Promise<Conversation> {
    throw new RepositoryError('internal_error', 'ApiConversationRepository not implemented (no backend yet)');
  }
  async getTurns(_conversationId: string): Promise<ConversationTurn[]> {
    throw new RepositoryError('internal_error', 'ApiConversationRepository not implemented (no backend yet)');
  }
}
