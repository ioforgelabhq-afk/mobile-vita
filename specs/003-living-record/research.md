# Phase 0 Research: Living Record View

Resolved from the spec, the constitution, and features 001/002's established architecture. No
open `NEEDS CLARIFICATION` remain.

## D1. Pure aggregation, no new repositories (FR-014)

- **Decision**: Build one client-side aggregation service (`living-record-view`) that calls the
  four existing repositories' `list()` methods, tags each result with its origin, merges into a
  unified, sortable/filterable collection, and exposes `correct`/`remove` pass-throughs to the
  originating repository (never reimplementing the logic).
- **Rationale**: FR-014 explicitly forbids new repositories/entities; the existing repositories
  already expose everything needed (`list`, `correct`, `remove`, `export`). Aggregating client-side
  avoids any backend/API surface change.
- **Alternatives considered**: A new `LivingRecordViewRepository` — rejected (violates FR-014,
  adds a redundant seam for data that already has an owner repository).

## D2. Unified item shape for mixed-type browsing (FR-001/002)

- **Decision**: Map `LivingRecordEntry` and `HealthEvent` into a shared `RecordItem` view-model:
  `{ id, kind: 'entry'|'health_event', category/type, content/title, timestamp, source,
  originalRef }`. The UI renders one list from `RecordItem[]`; `originalRef` carries enough to call
  back into the correct repository for correct/remove.
- **Rationale**: Keeps FR-001 (unified browsing) and FR-002 (category/timestamp/source always
  shown) trivial to satisfy from one render path, while FR-007–009 (correct/remove/consistency)
  route through the real repository, so consistency is automatic — there's only one source of
  truth per item.
- **Alternatives considered**: Two separate lists (entries, then events) — rejected, doesn't
  satisfy "one place" (FR-001) as directly and complicates filtering across both.

## D3. Daily history without a client-side "trend" claim before 2 points (FR-004/006)

- **Decision**: The daily-history section lists `DailyScore.list()` sorted by date, rendered as a
  simple chronological list/sparkline. With fewer than 2 entries, no trend/comparison UI element is
  shown — just the available day(s).
- **Rationale**: Reuses feature 002's `DailyScoreRepository.list()` verbatim; satisfies FR-006
  (don't imply an uncomputable trend) with a simple length check, no new logic in the scoring
  domain.
- **Alternatives considered**: Computing a trend line/regression — rejected as unnecessary
  complexity for an MVP browsing feature; the daily check-in's own `insights` service already
  handles trend *insights* elsewhere (feature 002), this view only *displays* history.

## D4. Filtering (FR-011/012/013) and performance (SC-007)

- **Decision**: Filtering (category, date range) is a pure, synchronous client-side function over
  the already-loaded `RecordItem[]`/`DailyScore[]` arrays (no repository changes, no new queries).
  Given local-only data volumes (single patient, on-device), an in-memory filter over arrays is
  sub-millisecond in practice — satisfies SC-007 (<1s) trivially without indexing work.
- **Rationale**: Simplicity; avoids over-engineering for a single-device, single-user dataset.
- **Alternatives considered**: Repository-level query filters — rejected as unnecessary
  complexity/scope creep into repository contracts that FR-014 explicitly avoids.

## D5. Export shape (FR-010)

- **Decision**: Reuse `LivingRecordRepository.export()` for entries, and additionally call `list()`
  on the other three repositories, combining all four into one `LivingRecordFullExport` JSON object
  returned to the caller (e.g., for share/save). No new repository method — the aggregation service
  composes the existing `export()` + `list()` calls.
- **Rationale**: FR-014 discipline — the "export" contract already exists on
  `LivingRecordRepository`; this feature only assembles a superset for the patient's convenience,
  it doesn't add new export capability to any repository.
- **Alternatives considered**: Adding an `exportAll()` method to a repository — rejected, no single
  repository owns all four entity types, and adding cross-repository methods would blur ownership
  boundaries FR-014 is protecting.

## D6. Reuse UI/design tokens; no new safety/consent surface

- **Decision**: Reuse `Card`, `Screen`, `Button` primitives and brand tokens from `src/ui/`. No
  `SafetyService` or consent-gate involvement — this feature reads already-governed data and does
  not collect new patient-authored free text (Principle IV/VII already satisfied upstream).
- **Rationale**: Keeps the feature's footprint minimal, consistent with D1–D5.
- **Alternatives considered**: None needed — no new risk surface to mitigate.
