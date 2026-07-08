# Phase 1 Data Model: Conversational Onboarding

Entities are derived from the spec's Key Entities and Functional Requirements. All are stored
locally (encrypted `expo-sqlite`) for the MVP and validated at the repository boundary with Zod.
Types below are conceptual; the authoritative schemas live in
`src/repositories/contracts/schemas.ts` and are summarized in [contracts/](./contracts/).

## Conventions

- **Ids**: string UUIDs generated on-device.
- **Timestamps**: ISO-8601 UTC strings (`createdAt`, `updatedAt`).
- **Sync fields**: every mutable record carries `syncStatus` (`local` | `queued` | `synced`) and
  an idempotency `clientMutationId` so replay through the sync queue cannot duplicate (FR-021).
- **Soft delete**: records support `deletedAt` to honor patient deletion (II) while keeping the
  sync queue consistent.

## Entities

### Patient

The person onboarding; owns all their data (II). Local-first identity (FR-020a).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | local anonymous identity created at first launch |
| `displayName` | string? | optional, gathered conversationally |
| `accountLinked` | boolean | false until an account is created/linked (FR-020b) |
| `locale` | string | single primary locale for MVP |
| `createdAt` / `updatedAt` | timestamp | |

- **Rules**: never required before the conversation starts; no auth gate (FR-020a).

### Conversation (type = `onboarding`)

The evolving dialogue session (spec: "Onboarding Conversation"). This is the same
`Conversation` entity defined app-wide in `docs/domain/domain-model.md` §3 and exposed as
`Conversation` in `docs/api/openapi.yaml`, narrowed here to `type: onboarding`. (Earlier drafts
called this `OnboardingSession`; it is now unified as `Conversation` — resolves analysis
finding I1.)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `type` | enum | `onboarding` (fixed for this feature) |
| `status` | enum | `in_progress` \| `completed` \| `abandoned` |
| `currentStepId` | string | drives adaptive flow / resume (FR-023) |
| `startedAt` / `updatedAt` / `completedAt?` | timestamp | |

- **State transitions**: `in_progress → completed` (FR-025) or `in_progress → abandoned`
  (resumable, FR-023). Returning patient with an existing completed conversation is recognized and
  not duplicated (FR-024).

### ConversationTurn

One exchange in the conversation. Feeds Living Record extraction (VI).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `conversationId` | UUID | → Conversation |
| `role` | enum | `companion` \| `patient` |
| `text` | string | |
| `promptId` | string? | which curated prompt (for adaptive flow) |
| `safetyFlagged` | boolean | set if SafetyService matched (IV) |
| `createdAt` | timestamp | |

### LivingRecordEntry

Discrete, **categorized** captured information (clarification Q4; FR-005, FR-006, FR-007).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `category` | enum | `goal` \| `concern` \| `health_context` \| `preference` \| `other` |
| `content` | string | |
| `source` | enum | `onboarding` (attribution, FR-006) |
| `sourceTurnId` | UUID? | → ConversationTurn that produced it |
| `status` | enum | `active` \| `corrected` \| `removed` (FR-007, FR-008) |
| `supersedesId` | UUID? | prior entry this correction replaces (FR-008) |
| `createdAt` / `updatedAt` | timestamp | |

- **Rules**: correcting an entry sets the old one to `corrected` and links via `supersedesId`;
  the superseded value is never treated as current truth (FR-008). Entries are individually
  viewable/editable/removable by the patient (FR-007).

### ConsentRecord

Granular, auditable consent (clarification Q3; FR-012–FR-016a). HIPAA/GDPR-grade.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `grants` | ConsentGrant[] | per-purpose decisions |
| `version` | string | consent-copy version shown to patient (auditability) |
| `capturedAt` | timestamp | |
| `revokedAt` | timestamp? | consent can be revoked later (FR-015) |

**ConsentGrant**

| Field | Type | Notes |
|-------|------|-------|
| `purpose` | enum | e.g. `store_health_data` \| `personalize_guidance` \| `improve_service` |
| `granted` | boolean | individually grantable/declinable (FR-013, FR-014) |
| `decidedAt` | timestamp | |

- **Rules**: no health-data write occurs for a purpose whose grant is absent/false (FR-014,
  FR-016). The record is retained as an auditable log (FR-016a).

### SafetyEvent

A crisis/emergency signal during onboarding (IV; FR-017–FR-019).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `conversationId` | UUID | → Conversation |
| `turnId` | UUID | → ConversationTurn that triggered it |
| `matchType` | enum | `explicit` \| `intent_pattern` (clarification Q2) |
| `resourcesSurfacedAt` | timestamp | proves resources shown before continuing (FR-017/018) |
| `createdAt` | timestamp | |

> **API DTO note**: the `SafetyEvent` schema in `docs/api/openapi.yaml` is a client-facing subset
> (`id`, `matchType`, `resources`, `surfacedAt`); `conversationId`/`turnId` are local-only linkage
> fields (analysis finding I2 — local superset is intentional).

## Relationships

```text
Patient 1─* Conversation(type=onboarding) 1─* ConversationTurn
Patient 1─* LivingRecordEntry (LivingRecordEntry *─0..1 ConversationTurn via sourceTurnId)
Patient 1─1 ConsentRecord 1─* ConsentGrant
Conversation 1─* SafetyEvent (SafetyEvent *─1 ConversationTurn)
```

## Validation & privacy notes

- All health-bearing writes (`LivingRecordEntry`, health-context `ConversationTurn`) are gated by
  the relevant `ConsentGrant` (FR-016).
- Records persist encrypted at rest; the encryption key lives in `expo-secure-store` (VII).
- Minimal collection: only fields above are captured; nothing speculative (VII).
