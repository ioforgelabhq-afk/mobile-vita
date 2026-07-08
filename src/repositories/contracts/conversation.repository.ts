import type {
  Conversation,
  ConversationTurn,
  CompanionResponse,
} from './schemas';

export interface SendMessageInput {
  conversationId: string;
  text: string;
  clientMutationId: string;
}

/**
 * ConversationRepository — adaptive companion dialogue (contracts/conversation.contract.md).
 * Maps to the app-wide Conversation entity (type=onboarding). sendPatientMessage MUST run
 * SafetyService before producing a companion turn (Principle IV).
 */
export interface ConversationRepository {
  startOrResume(patientId: string): Promise<Conversation>;
  sendPatientMessage(input: SendMessageInput): Promise<CompanionResponse>;
  complete(conversationId: string, clientMutationId: string): Promise<Conversation>;
  getTurns(conversationId: string): Promise<ConversationTurn[]>;
}
