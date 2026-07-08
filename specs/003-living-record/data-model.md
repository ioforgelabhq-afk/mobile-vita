# Phase 1 Data Model: Living Record View

This feature introduces **no new persisted entities** (FR-014). It defines **view models** only —
in-memory shapes produced by the aggregation service from existing repository data
([`docs/domain/domain-model.md`](../../docs/domain/domain-model.md)).

## Reused persisted entities (unchanged)

- **LivingRecordEntry** — via `LivingRecordRepository.list/correct/remove/export`.
- **HealthEvent** — via `HealthEventRepository.list/correct/remove`.
- **DailyCheckin** — via `DailyCheckinRepository.list`.
- **DailyScore** — via `DailyScoreRepository.list`.

## View models (in-memory only, `src/services/living-record-view/`)

### RecordItem

Unified shape for browsing entries + health events together (research D2).

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | the underlying entity's id |
| `kind` | `'entry' \| 'health_event'` | discriminates which repository owns it |
| `category` | string | `LivingRecordEntry.category` or `HealthEvent.type` |
| `content` | string | `LivingRecordEntry.content` or `HealthEvent.title` |
| `timestamp` | string | `createdAt` (or `occurredAt` for health events) |
| `source` | string | e.g. `onboarding`, `daily_checkin` |
| `status` | string | `active`/`corrected`/`removed` (entries) or presence (`deletedAt`) for events |

- **Rules**: `RecordItem` is derived, never stored. Correcting/removing acts on the underlying
  entity via its owning repository (FR-007/008); the view re-derives `RecordItem`s afterward, so
  there is exactly one source of truth (FR-009).

### DailyHistoryPoint

One day's entry in the history/trend list (research D3).

| Field | Type | Notes |
|-------|------|-------|
| `date` | string | `YYYY-MM-DD` |
| `score` | number | 0–100 |
| `band` | string | `low`/`moderate`/`good`/`great` |
| `checkInId` | string? | for drill-down if needed |

- **Rules**: derived from `DailyScore.list()`, sorted ascending by date. No trend/comparison
  rendering with fewer than 2 points (FR-006).

### LivingRecordFullExport

The export payload (research D5) — a superset of `LivingRecordRepository.export()`.

| Field | Type | Notes |
|-------|------|-------|
| `patientId` | string | |
| `entries` | LivingRecordEntry[] | from `LivingRecordRepository.export()` |
| `healthEvents` | HealthEvent[] | from `HealthEventRepository.list()` |
| `dailyCheckins` | DailyCheckin[] | from `DailyCheckinRepository.list()` |
| `dailyScores` | DailyScore[] | from `DailyScoreRepository.list()` |
| `exportedAt` | string | |
| `format` | `'json'` | |

## Relationships (unchanged — this feature only reads across them)

```text
Patient 1─* LivingRecordEntry
Patient 1─* HealthEvent
Patient 1─* DailyCheckin 1─1 DailyScore
(RecordItem, DailyHistoryPoint, LivingRecordFullExport are derived, not persisted)
```

## Validation & privacy notes

- No new writes are introduced; `correct`/`remove` reuse each repository's existing consent-aware
  logic (health-bearing corrections still gated where the underlying repository already gates
  them).
- Export composes only already-persisted, already-governed data — no new consent surface (VII).
