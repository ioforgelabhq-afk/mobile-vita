/**
 * VITA — shared Zod schemas & types (onboarding slice).
 *
 * These schemas ARE the contract: they validate at the repository boundary and mirror
 * docs/domain/domain-model.md + docs/api/openapi.yaml. Mock and API repositories both
 * conform to them (Constitution Principle IX). Kept dependency-free so they run in tests
 * and in any runtime.
 */
import { z } from 'zod';

/** ISO-8601 UTC timestamp string. */
export const zTimestamp = z.string();
/**
 * Opaque id. Generated ids are UUIDs (see lib/ids), but the schema only requires a non-empty
 * string so fixed local keys (e.g. the single local-patient identity) and future server ids
 * both validate. OpenAPI still documents these as `format: uuid`.
 */
export const zUuid = z.string().min(1);

/** Sync/idempotency fields carried by every persisted record (Principle VIII). */
export const SyncStatus = z.enum(['local', 'queued', 'synced', 'conflict']);
export type SyncStatus = z.infer<typeof SyncStatus>;

export const SyncMeta = z.object({
  id: zUuid,
  createdAt: zTimestamp,
  updatedAt: zTimestamp,
  version: z.number().int().nonnegative().default(0),
  deletedAt: zTimestamp.nullable().default(null),
  syncStatus: SyncStatus.default('local'),
  clientMutationId: zUuid,
  serverId: z.string().nullable().default(null),
});
export type SyncMeta = z.infer<typeof SyncMeta>;

/* ----------------------------- Patient ----------------------------- */
export const BiologicalSex = z.enum(['female', 'male', 'intersex', 'unspecified']);

export const Patient = SyncMeta.extend({
  displayName: z.string().min(1).max(80).nullable().default(null),
  dateOfBirth: z.string().nullable().default(null),
  biologicalSex: BiologicalSex.nullable().default(null),
  locale: z.string().default('es'),
  accountLinked: z.boolean().default(false),
  email: z.string().email().nullable().default(null),
});
export type Patient = z.infer<typeof Patient>;

/* ----------------------------- Consent ----------------------------- */
export const ConsentPurpose = z.enum([
  'store_health_data',
  'personalize_guidance',
  'improve_service',
  'share_with_physician',
]);
export type ConsentPurpose = z.infer<typeof ConsentPurpose>;

export const ConsentGrant = z.object({
  purpose: ConsentPurpose,
  granted: z.boolean(),
  decidedAt: zTimestamp,
});
export type ConsentGrant = z.infer<typeof ConsentGrant>;

export const ConsentRecord = SyncMeta.extend({
  patientId: zUuid,
  definitionVersion: z.string(),
  capturedAt: zTimestamp,
  revokedAt: zTimestamp.nullable().default(null),
  grants: z.array(ConsentGrant),
});
export type ConsentRecord = z.infer<typeof ConsentRecord>;

/* --------------------------- Conversation --------------------------- */
export const ConversationType = z.enum(['onboarding', 'daily_checkin', 'freeform']);
export const ConversationStatus = z.enum(['in_progress', 'completed', 'abandoned']);
export const TurnRole = z.enum(['companion', 'patient']);

export const Conversation = SyncMeta.extend({
  patientId: zUuid,
  type: ConversationType,
  status: ConversationStatus,
  currentStepId: z.string().nullable().default(null),
  startedAt: zTimestamp,
  completedAt: zTimestamp.nullable().default(null),
});
export type Conversation = z.infer<typeof Conversation>;

export const ConversationTurn = SyncMeta.extend({
  conversationId: zUuid,
  role: TurnRole,
  text: z.string().min(1).max(4000),
  promptId: z.string().nullable().default(null),
  safetyFlagged: z.boolean().default(false),
});
export type ConversationTurn = z.infer<typeof ConversationTurn>;

/* -------------------------- Living Record --------------------------- */
export const EntryCategory = z.enum([
  'goal',
  'concern',
  'health_context',
  'preference',
  'other',
]);
export type EntryCategory = z.infer<typeof EntryCategory>;

export const EntryStatus = z.enum(['active', 'corrected', 'removed']);
export const EntrySource = z.enum(['onboarding', 'daily_checkin', 'freeform']);

export const LivingRecordEntry = SyncMeta.extend({
  patientId: zUuid,
  category: EntryCategory,
  content: z.string().min(1).max(2000),
  source: EntrySource,
  sourceTurnId: zUuid.nullable().default(null),
  status: EntryStatus.default('active'),
  supersedesId: zUuid.nullable().default(null),
});
export type LivingRecordEntry = z.infer<typeof LivingRecordEntry>;

/* ---------------------------- SafetyEvent --------------------------- */
export const SafetyMatchType = z.enum(['explicit', 'intent_pattern']);
export type SafetyMatchType = z.infer<typeof SafetyMatchType>;

export const SafetyResource = z.object({
  label: z.string(),
  description: z.string(),
  phone: z.string().nullable().default(null),
  url: z.string().nullable().default(null),
});
export type SafetyResource = z.infer<typeof SafetyResource>;

export const SafetyEvent = z.object({
  id: zUuid,
  conversationId: zUuid.nullable().default(null),
  turnId: zUuid.nullable().default(null),
  matchType: SafetyMatchType,
  resources: z.array(SafetyResource),
  surfacedAt: zTimestamp,
  createdAt: zTimestamp,
});
export type SafetyEvent = z.infer<typeof SafetyEvent>;

/* ----------------------- Companion response ------------------------- */
export const CompanionResponse = z.object({
  companionTurn: ConversationTurn,
  suggestedEntries: z.array(LivingRecordEntry),
  safetyEvent: SafetyEvent.optional(),
});
export type CompanionResponse = z.infer<typeof CompanionResponse>;
