# VITA Mobile — Domain Model (Source of Truth)

This is the **authoritative domain model** for the VITA mobile application, designed
**independently of any backend**. The mobile app owns and persists this model locally
(offline-first, VIII); the future backend must conform to it (see [../api/openapi.yaml](../api/openapi.yaml)).

It governs every feature. Feature specs (e.g. `specs/001-conversational-onboarding/`) reference a
subset of these entities; this document is the union.

## Cross-cutting conventions

Applied to **every** entity unless noted:

- **`id`**: string UUID, generated on-device.
- **Timestamps**: ISO-8601 UTC strings. `createdAt` (set once), `updatedAt` (touched on write).
- **Ownership**: every entity carries `patientId` and is owned by the patient (Principle II).
- **Sync fields** (Principle VIII):
  - `syncStatus`: `local` | `queued` | `synced` | `conflict`
  - `clientMutationId`: UUID stamped on each mutation → idempotent replay, no duplicates (FR-021).
  - `serverId?`: nullable; populated when a record first syncs to a real backend.
  - `version`: integer, incremented per update → optimistic concurrency / conflict detection.
- **Soft delete**: `deletedAt?` timestamp. Deletes are soft locally so the sync queue stays
  consistent; hard purge runs after successful server delete or on patient-initiated wipe (II).
- **Encryption**: all tables are stored in an **encrypted `expo-sqlite`** database. The DB
  encryption key is generated on first launch and stored in **`expo-secure-store`** (VII).
- **Consent gating**: any write that stores health information first checks the governing
  `ConsentGrant` via `ConsentRepository.isGranted` (Principle VII, FR-016).
- **Informational, never diagnostic**: `Insight`, `DailyScore`, and companion-authored content
  carry informational framing and MUST NOT assert diagnosis (Principle III).

### Persistence strategy (shared)

- **Store**: encrypted SQLite (`expo-sqlite`) — relational, queryable, supports the categorized
  and time-series data below. One table per entity (child tables for collections).
- **Secrets**: `expo-secure-store` holds the DB key and any tokens (auth is mocked for MVP).
- **Read cache**: TanStack Query with a persister; reads survive app restarts and work offline.
- **Write path**: repository writes to SQLite → enqueues in the durable sync queue
  (`src/lib/sync/`) → API repositories drain the queue when a backend + connectivity exist.
- **Indexes**: every table indexes `(patientId)`, and time-series tables also index the primary
  time column (e.g. `occurredAt`, `date`). Uniqueness constraints are called out per entity.

---

## 1. Patient

The device owner. Local-first identity; account optional (FR-020a/b).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | local anonymous identity at first launch |
| `displayName` | string? | 1–80 chars; gathered conversationally |
| `dateOfBirth` | date? | ISO date; must be in the past; used only for context, never age-gating care |
| `biologicalSex` | enum? | `female` \| `male` \| `intersex` \| `unspecified` |
| `locale` | string | BCP-47; defaults to `es` (Spanish-first per brand kit); single locale for MVP |
| `accountLinked` | boolean | false until an account is linked |
| `email` | string? | only if account linked; validated email |
| timestamps, sync fields | | see conventions |

**Relationships**: root aggregate — has many of every other entity (all reference `patientId`);
has one `LivingRecord`; has one active `Consent`.

**Validation**: `displayName` length; `email` format when present; `dateOfBirth` not in future.
Nothing is required to begin onboarding (FR-020a).

**Local persistence**: table `patients`. Typically one row (the device owner) for MVP.

---

## 2. Consent

Granular, auditable consent (HIPAA + GDPR). Composed of `ConsentGrant`s.

**Fields (Consent)**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `definitionVersion` | string | version of consent copy shown (auditability, FR-016a) |
| `capturedAt` | timestamp | |
| `revokedAt` | timestamp? | consent revocable later (FR-015) |
| timestamps, sync fields | | |

**Fields (ConsentGrant)** — child, keyed by `consentId`

| Field | Type | Notes |
|-------|------|-------|
| `purpose` | enum | `store_health_data` \| `personalize_guidance` \| `improve_service` \| `share_with_physician` |
| `granted` | boolean | individually grantable/declinable (FR-013/014) |
| `decidedAt` | timestamp | |

**Relationships**: belongs to Patient (1:1 active record); gates writes on health-bearing entities.

**Validation**: at most one non-revoked Consent per patient; every purpose in the current
`definitionVersion` has a decision before health data is stored (FR-012).

**Local persistence**: tables `consents`, `consent_grants`. Auditable — never hard-deleted while
a session references it; revocation sets `revokedAt` rather than removing.

---

## 3. Conversation

Dialogue sessions with the companion (onboarding, daily check-in, or free-form). Composed of
`ConversationTurn`s. Human-feeling, adaptive (Principle V).

**Fields (Conversation)**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `type` | enum | `onboarding` \| `daily_checkin` \| `freeform` |
| `status` | enum | `in_progress` \| `completed` \| `abandoned` |
| `currentStepId` | string? | drives adaptive flow + resume (FR-023) |
| `startedAt` / `completedAt?` | timestamp | |
| timestamps, sync fields | | |

**Fields (ConversationTurn)** — child, keyed by `conversationId`

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `role` | enum | `companion` \| `patient` |
| `text` | string | 1–4000 chars |
| `promptId` | string? | curated prompt id (adaptive flow) |
| `safetyFlagged` | boolean | set if SafetyService matched (IV) |
| `createdAt` | timestamp | |

**Relationships**: belongs to Patient; has many turns; **produces** `LivingRecordEntry`,
`HealthEvent`, `Insight`, and (for `daily_checkin`) a `DailyCheckin` + `DailyScore`; may raise a
`SafetyEvent`.

**State transitions**: `in_progress → completed | abandoned`; abandoned is resumable (FR-023).

**Validation**: `text` non-empty/length-bounded; a `patient` turn is always safety-screened
before a `companion` turn is generated (FR-017).

**Local persistence**: tables `conversations`, `conversation_turns` (indexed by `createdAt`).

---

## 4. Daily Check-in

A once-per-day structured-but-conversational touchpoint that yields a `DailyScore` (Pillar 2).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `date` | date | patient-local calendar day; **unique per patient/day** |
| `conversationId` | UUID? | → Conversation (`type=daily_checkin`) |
| `mood` | enum? | `great` \| `good` \| `ok` \| `low` \| `bad` |
| `energy` | int? | 1–5 |
| `sleepHours` | number? | 0–24 |
| `symptoms` | string[]? | free tags; each → optional `HealthEvent` |
| `notes` | string? | ≤ 1000 chars |
| `completedAt` | timestamp? | null until finished |
| `dailyScoreId` | UUID? | → DailyScore produced |
| timestamps, sync fields | | |

**Relationships**: belongs to Patient; optionally backed by a Conversation; produces one
`DailyScore`; may spawn `HealthEvent`s from symptoms.

**Validation**: unique `(patientId, date)`; numeric ranges as above; requires
`store_health_data` consent before persisting symptoms.

**Local persistence**: table `daily_checkins`, unique index `(patientId, date)`.

---

## 5. Health Event

A discrete, timestamped health occurrence (symptom, measurement, appointment, note).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `type` | enum | `symptom` \| `measurement` \| `appointment` \| `medication_taken` \| `note` |
| `category` | string? | free classifier (e.g. `cardiovascular`, `sleep`) |
| `title` | string | 1–120 chars |
| `description` | string? | ≤ 2000 chars |
| `value` | number? | for measurements |
| `unit` | string? | for measurements (e.g. `bpm`, `mmHg`, `kg`) |
| `occurredAt` | timestamp | when it happened |
| `recordedAt` | timestamp | when captured |
| `source` | enum | `patient` \| `onboarding` \| `daily_checkin` \| `medication` |
| `relatedConversationId` | UUID? | → Conversation |
| `medicationId` | UUID? | → Medication (for `medication_taken`) |
| timestamps, sync fields | | |

**Relationships**: belongs to Patient; may reference a Conversation and/or Medication; aggregated
into the `LivingRecord`; may feed `Insight`s and `DailyScore`.

**Validation**: `measurement` requires `value` (+ recommended `unit`); `medication_taken`
requires `medicationId`; `occurredAt` not in the future beyond a small clock-skew tolerance;
health-data consent required.

**Local persistence**: table `health_events`, indexed by `(patientId, occurredAt)`.

---

## 6. Living Record

The patient's evolving longitudinal health picture (Principle VI). Modeled as a per-patient
**aggregate** composed of atomic `LivingRecordEntry`s and referencing the health-bearing
entities. It is the substrate for daily guidance and physician briefing.

**Fields (LivingRecord)** — 1:1 with Patient

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient (unique) |
| `summary` | string? | derived, informational overview (never diagnostic, III) |
| `lastEnrichedAt` | timestamp | updated whenever an interaction enriches it (VI) |
| timestamps, sync fields | | |

**Fields (LivingRecordEntry)** — child, keyed by `livingRecordId` / `patientId`

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `category` | enum | `goal` \| `concern` \| `health_context` \| `preference` \| `other` |
| `content` | string | 1–2000 chars |
| `source` | enum | `onboarding` \| `daily_checkin` \| `freeform` |
| `sourceTurnId` | UUID? | → ConversationTurn |
| `status` | enum | `active` \| `corrected` \| `removed` |
| `supersedesId` | UUID? | prior entry replaced by a correction (FR-008) |
| timestamps, sync fields | | |

**Relationships**: 1:1 Patient; has many entries; conceptually aggregates `HealthEvent`, `Goal`,
`Medication`, `Insight` for briefing/guidance views.

**Validation**: entries timestamped + attributed (FR-006); correction sets old entry
`corrected` and links `supersedesId`; superseded values never treated as truth (FR-008);
individually editable/removable (FR-007).

**Local persistence**: tables `living_records` (1 row/patient), `living_record_entries` (indexed
by `(patientId, category)`).

---

## 7. Insight

An informational, **never diagnostic** observation surfaced to the patient (Pillar 2).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `title` | string | 1–120 chars |
| `body` | string | informational framing required (III) |
| `category` | enum | `trend` \| `education` \| `encouragement` \| `reminder_suggestion` |
| `sourceType` | enum | `rule` \| `model` (MVP: `rule`; future model-backed) |
| `relatedEntityType` | enum? | `health_event` \| `goal` \| `daily_score` \| `medication` |
| `relatedEntityId` | UUID? | soft reference to the source entity |
| `confidence` | number? | 0–1, informational only |
| `disclaimerShown` | boolean | must be true before display (III) |
| `generatedAt` | timestamp | |
| `dismissedAt` | timestamp? | patient dismissed |
| timestamps, sync fields | | |

**Relationships**: belongs to Patient; soft-references the entity it was derived from; may
generate a `Notification`.

**Validation**: `body` MUST NOT contain diagnostic assertions (guardrail service, III);
`disclaimerShown` required before surfacing; no clinical instruction to start/stop treatment.

**Local persistence**: table `insights`, indexed by `(patientId, generatedAt)`.

---

## 8. Goal

A patient health goal (Pillar 2/3).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `title` | string | 1–120 chars |
| `description` | string? | ≤ 1000 chars |
| `category` | enum | `activity` \| `nutrition` \| `sleep` \| `mindfulness` \| `medication_adherence` \| `other` |
| `target` | number? | numeric target (e.g. 8000 steps) |
| `unit` | string? | e.g. `steps`, `hours`, `servings` |
| `cadence` | enum | `daily` \| `weekly` \| `monthly` \| `once` |
| `status` | enum | `active` \| `achieved` \| `paused` \| `abandoned` |
| `progress` | number? | 0–1 derived indicator |
| `startDate` | date | |
| `targetDate` | date? | must be ≥ `startDate` |
| timestamps, sync fields | | |

**Relationships**: belongs to Patient; contributes to `DailyScore`; may generate `Insight`s and
`Notification` reminders; surfaced in Living Record.

**Validation**: `title` required; `targetDate ≥ startDate`; `target` numeric when present;
status transitions `active ↔ paused`, `active → achieved | abandoned`.

**Local persistence**: table `goals`, indexed by `(patientId, status)`.

---

## 9. Medication

Patient-tracked medication (informational tracking only — VITA does **not** prescribe, III).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `name` | string | 1–120 chars, required |
| `dosageAmount` | number? | e.g. 20 |
| `dosageUnit` | string? | e.g. `mg`, `ml`, `tablet` |
| `form` | enum? | `tablet` \| `capsule` \| `liquid` \| `injection` \| `topical` \| `other` |
| `schedule` | MedicationSchedule | times/frequency (embedded JSON) |
| `startDate` | date | |
| `endDate` | date? | ≥ `startDate` |
| `active` | boolean | derived from dates + patient toggle |
| `prescribedByPhysicianId` | UUID? | → Physician |
| `notes` | string? | ≤ 1000 chars |
| timestamps, sync fields | | |

**MedicationSchedule** (embedded): `{ frequency: 'daily'|'weekly'|'as_needed', timesOfDay: string[] (HH:mm), daysOfWeek?: int[] }`

**Relationships**: belongs to Patient; optionally references a `Physician`; generates
`medication_taken` `HealthEvent`s and adherence `Notification`s; feeds Living Record + physician
briefing.

**Validation**: `name` required; dosage amount numeric + unit when either present;
`endDate ≥ startDate`; times match `HH:mm`. Copy MUST NOT instruct the patient to change a
regimen (III) — reminders are informational only.

**Local persistence**: table `medications`, indexed by `(patientId, active)`.

---

## 10. Physician

A care provider the patient references (patient-owned contact). Basis for physician briefing
(Pillar 4).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `name` | string | 1–120 chars, required |
| `specialty` | string? | e.g. `cardiology` |
| `organization` | string? | clinic/hospital |
| `phone` | string? | E.164 when present |
| `email` | string? | validated email |
| `notes` | string? | ≤ 1000 chars |
| `sharedViaConsent` | boolean | true only if `share_with_physician` consent granted |
| timestamps, sync fields | | |

**Relationships**: belongs to Patient; referenced by `Medication`; target of physician-briefing
exports (future feature).

**Validation**: `name` required; `phone` E.164 / `email` format when present; sharing gated by
`share_with_physician` consent grant.

**Local persistence**: table `physicians`, indexed by `(patientId)`.

---

## 11. Notification

An informational or safety notification/reminder. Safety notifications take priority (IV).

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `type` | enum | `checkin_reminder` \| `medication_reminder` \| `goal_reminder` \| `insight` \| `safety` |
| `title` | string | 1–120 chars |
| `body` | string | ≤ 500 chars |
| `priority` | enum | `low` \| `normal` \| `high` \| `critical` (safety = `critical`) |
| `scheduledFor` | timestamp | when to deliver |
| `deliveredAt` | timestamp? | |
| `readAt` | timestamp? | |
| `status` | enum | `scheduled` \| `delivered` \| `read` \| `cancelled` |
| `deepLink` | string? | in-app route (e.g. `/goals/{id}`) |
| `relatedEntityType` / `relatedEntityId` | enum? / UUID? | soft reference |
| timestamps, sync fields | | |

**Relationships**: belongs to Patient; soft-references Goal / Medication / Insight / SafetyEvent.

**Validation**: `scheduledFor` required; `safety` type MUST be `critical` priority and MUST NOT
be suppressed by engagement rules (IV). No dark-pattern/streak-pressure notifications.

**Local persistence**: table `notifications`, indexed by `(patientId, scheduledFor)`. Scheduling
via `expo-notifications`; the row is the source of truth, the OS schedule mirrors it.

---

## 12. Daily Score

A computed daily wellness indicator (informational, never diagnostic — III). Drives Pillar 2.

**Fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `date` | date | **unique per patient/day** |
| `score` | int | 0–100 |
| `band` | enum | `low` \| `moderate` \| `good` \| `great` (informational band) |
| `components` | ScoreComponent[] | breakdown (embedded JSON) |
| `checkInId` | UUID? | → DailyCheckin the score was derived from |
| `computedAt` | timestamp | |
| `disclaimerShown` | boolean | informational framing required (III) |
| timestamps, sync fields | | |

**ScoreComponent** (embedded): `{ key: string, label: string, weight: number, value: number }`
(e.g. `mood`, `sleep`, `activity`, `adherence`).

**Relationships**: belongs to Patient; derived from a `DailyCheckin` (+ `HealthEvent`, `Goal`,
`Medication` adherence); may generate `Insight`s and a summary `Notification`.

**Validation**: unique `(patientId, date)`; `score` in 0–100; component weights sum to ~1.0; MUST
be labeled a wellness indicator, never a diagnosis (III).

**Local persistence**: table `daily_scores`, unique index `(patientId, date)`.

---

## Relationship overview

```text
Patient (root)
├─1:1─ LivingRecord ──*── LivingRecordEntry
├─1:1─ Consent ──*── ConsentGrant                (gates all health writes)
├─1:*─ Conversation ──*── ConversationTurn ──*── SafetyEvent
├─1:*─ DailyCheckin ──1:1── DailyScore
├─1:*─ HealthEvent            (from onboarding / check-in / medication / patient)
├─1:*─ Insight                (derived from HealthEvent | Goal | DailyScore | Medication)
├─1:*─ Goal
├─1:*─ Medication ──*── (medication_taken) HealthEvent   ──0..1── Physician
├─1:*─ Physician
├─1:*─ Notification           (soft-refs Goal | Medication | Insight | SafetyEvent)
└─1:*─ DailyScore
```

## Mapping to the repository layer

Each aggregate maps to one repository interface (`src/repositories/contracts/`) with Mock + API
implementations behind feature flags (Principle IX). Repositories: `Patient`, `Consent`,
`Conversation`, `DailyCheckin`, `HealthEvent`, `LivingRecord`, `Insight`, `Goal`, `Medication`,
`Physician`, `Notification`, `DailyScore`. The onboarding feature
(`specs/001-conversational-onboarding/`) uses the Patient, Consent, Conversation, and
LivingRecord slices of this model.
