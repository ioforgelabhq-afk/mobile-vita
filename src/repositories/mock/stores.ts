/**
 * Shared in-memory collection stores for the Mock repositories, so Auth/Patient/Conversation/
 * LivingRecord/Consent all read a consistent local dataset. Swapped for encrypted-SQLite-backed
 * stores in a native build (same CollectionStore interface).
 */
import { memoryStore } from '@/lib/storage/store';
import type {
  Patient,
  ConsentRecord,
  Conversation,
  ConversationTurn,
  LivingRecordEntry,
  SafetyEvent,
} from '@/repositories/contracts/schemas';

export const stores = {
  patients: memoryStore<Patient>(),
  consents: memoryStore<ConsentRecord>(),
  conversations: memoryStore<Conversation>(),
  turns: memoryStore<ConversationTurn>(),
  entries: memoryStore<LivingRecordEntry>(),
  safetyEvents: memoryStore<SafetyEvent>(),
};

export type MockStores = typeof stores;
