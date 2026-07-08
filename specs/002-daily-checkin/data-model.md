# Phase 1 Data Model: Daily Guidance & Daily Check-in

Entities are the daily-guidance subset of the app-wide domain model
([`docs/domain/domain-model.md`](../../docs/domain/domain-model.md)) and reuse its cross-cutting
conventions (UUID ids, ISO timestamps, `patientId` ownership, sync fields with `clientMutationId`,
soft delete, encrypted-at-rest storage, consent-gated health writes). Authoritative Zod schemas will
be added to `src/repositories/contracts/schemas.ts`; the OpenAPI shapes already exist in
[`docs/api/openapi.yaml`](../../docs/api/openapi.yaml).

## Reused entities (from feature 001)

- **Conversation** (`type: daily_checkin`) + **ConversationTurn** + **SafetyEvent** — the dialogue
  backing the check-in, unchanged.
- **Patient**, **ConsentRecord** — identity + consent, unchanged.
- **LivingRecordEntry** — correction/supersede pattern reused for any note-style entries.

## New / feature entities

### DailyCheckin

A once-per-day interaction (spec Key Entities; domain §4).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `date` | date | patient-local `YYYY-MM-DD`; **unique per (patientId, date)** (FR-004) |
| `conversationId` | UUID? | → Conversation(type=daily_checkin) |
| `mood` | enum? | `great` \| `good` \| `ok` \| `low` \| `bad` |
| `energy` | int? | 1–5 |
| `sleepHours` | number? | 0–24 |
| `symptoms` | string[] | free tags; each → a HealthEvent |
| `notes` | string? | ≤ 1000 chars |
| `completedAt` | timestamp? | null until finished (resume support, FR-005) |
| `dailyScoreId` | UUID? | → DailyScore produced |
| timestamps, sync fields | | see conventions |

- **Rules**: unique `(patientId, date)`; numeric ranges enforced; symptoms/notes are health data →
  consent-gated (FR-018). `startOrResume(today)` returns the in-progress record or creates one;
  never a second completed record for the day.

### DailyScore

Informational wellness indicator for a date (domain §12).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `date` | date | **unique per (patientId, date)** |
| `score` | int | 0–100 (FR-006) |
| `band` | enum | `low` \| `moderate` \| `good` \| `great` |
| `components` | ScoreComponent[] | breakdown (FR-007) |
| `checkInId` | UUID? | → DailyCheckin |
| `computedAt` | timestamp | |
| `disclaimerShown` | boolean | informational framing required (III, FR-008) |
| timestamps, sync fields | | |

**ScoreComponent** (embedded): `{ key, label, weight, value }`.

- **Rules**: score 0–100; band derived from thresholds; components explain the score; never framed
  as diagnosis (FR-008). Computed on-device (FR-009).

### HealthEvent

A discrete health occurrence captured from the check-in (domain §5) — feature uses the `symptom`
type primarily.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `type` | enum | `symptom` (this feature) — full enum in domain model |
| `title` | string | 1–120 chars (the symptom) |
| `description` | string? | ≤ 2000 |
| `occurredAt` | timestamp | defaults to check-in time |
| `recordedAt` | timestamp | |
| `source` | enum | `daily_checkin` (attribution, FR-015) |
| `relatedConversationId` | UUID? | → the check-in conversation |
| timestamps, sync fields | | |

- **Rules**: consent-gated (FR-018); attributed + timestamped (FR-015); correctable/removable (FR-017).

### Insight

An informational observation surfaced to the patient (domain §7).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `title` | string | 1–120 |
| `body` | string | informational framing required (III) |
| `category` | enum | `trend` \| `education` \| `encouragement` \| `reminder_suggestion` |
| `sourceType` | enum | `rule` (MVP) |
| `relatedEntityType` / `relatedEntityId` | enum? / UUID? | e.g. `daily_score` |
| `disclaimerShown` | boolean | required before display (FR-012) |
| `generatedAt` | timestamp | |
| `dismissedAt` | timestamp? | dismiss support (FR-013) |
| timestamps, sync fields | | |

- **Rules**: body MUST pass the guardrails check (no diagnosis, FR-011); dismissible (FR-013);
  history-dependent categories degrade gracefully (FR-014).

## Relationships

```text
Patient 1─* DailyCheckin 1─1 DailyScore
DailyCheckin *─1 Conversation(type=daily_checkin) 1─* ConversationTurn ─* SafetyEvent
DailyCheckin 1─* HealthEvent (symptoms; source=daily_checkin)
Patient 1─* Insight (Insight *─0..1 DailyScore via relatedEntity)
```

## Validation & privacy notes

- Health-bearing writes (`DailyCheckin` symptoms/notes, `HealthEvent`) gated by
  `store_health_data` consent (FR-018); the score itself can be shown without persisting.
- Unique `(patientId, date)` on DailyCheckin and DailyScore enforces one-per-day (FR-004) and
  prevents duplicate day records on offline replay (FR-023).
- Minimal collection; encrypted at rest; on-device score (VII, VIII).
