# Phase 1 Data Model: Physician Briefing

One new persisted entity (`Physician`) plus a derived, non-persisted `BriefingDocument` view model.
Mirrors [`docs/domain/domain-model.md`](../../docs/domain/domain-model.md) §10 and the `Physician`
schema already in [`docs/api/openapi.yaml`](../../docs/api/openapi.yaml).

## New persisted entity

### Physician

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `patientId` | UUID | → Patient |
| `name` | string | 1–120 chars, required (FR-001) |
| `specialty` | string? | e.g. `cardiología` |
| `organization` | string? | clinic/hospital |
| `phone` | string? | free text (no strict E.164 validation for MVP) |
| `email` | string? | validated email format when present |
| `notes` | string? | ≤ 1000 chars |
| `sharedViaConsent` | boolean | true once a briefing has been shared with `share_with_physician` granted |
| timestamps, sync fields | | shared `SyncMeta` conventions |

- **Rules**: `name` required; no uniqueness enforced (spec edge case — duplicate names allowed).
  Soft delete via `deletedAt` (consistent with every other repository).

## View models (derived, not persisted)

### BriefingSection

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | e.g. "Metas y preocupaciones", "Eventos de salud", "Historial diario" |
| `items` | string[] | rendered lines, each guardrail-checked (research D3) |

### BriefingDocument

| Field | Type | Notes |
|-------|------|-------|
| `patientId` | UUID | |
| `generatedAt` | string | ISO timestamp |
| `disclaimer` | string | fixed, prominent informational statement (FR-007) |
| `sections` | BriefingSection[] | entries / health events / daily history |
| `scope` | `{ from?: string; to?: string; excludedCategories: string[] }` | what was applied (FR-013/014) |
| `isEmpty` | boolean | true when no data matched (FR-008) |

- **Rules**: Never persisted — regenerated on demand from `living-record-view` (feature 003) +
  `PhysicianRepository`. `disclaimer` is always present and non-empty.

## Relationships

```text
Patient 1─* Physician
BriefingDocument is derived from: LivingRecordEntry, HealthEvent, DailyCheckin/DailyScore
                                   (via feature 003's living-record-view service)
ConsentRecord (purpose='share_with_physician') gates BriefingDocument generation
```

## Validation & privacy notes

- Generating a `BriefingDocument` for sharing requires `hasConsent(patientId, 'share_with_physician')`
  (research D4); without it, no document is composed.
- Every section item is passed through `guardrails.inspect()` before inclusion (research D3); a
  failing item is omitted, not shown.
- `Physician.sharedViaConsent` is a denormalized convenience flag, not itself a consent record —
  the authoritative consent state remains on `ConsentRecord`.
