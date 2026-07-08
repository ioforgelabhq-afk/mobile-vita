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
  DailyCheckin,
  DailyScore,
  HealthEvent,
  Insight,
} from '@/repositories/contracts/schemas';

export const stores = {
  patients: memoryStore<Patient>(),
  consents: memoryStore<ConsentRecord>(),
  conversations: memoryStore<Conversation>(),
  turns: memoryStore<ConversationTurn>(),
  entries: memoryStore<LivingRecordEntry>(),
  safetyEvents: memoryStore<SafetyEvent>(),
  dailyCheckins: memoryStore<DailyCheckin>(),
  dailyScores: memoryStore<DailyScore>(),
  healthEvents: memoryStore<HealthEvent>(),
  insights: memoryStore<Insight>(),
};

export type MockStores = typeof stores;
