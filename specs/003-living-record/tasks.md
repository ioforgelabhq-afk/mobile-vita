---
description: "Task list for Living Record View"
---

# Tasks: Living Record View

**Input**: Design documents from `/specs/003-living-record/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Reuses** (features 001/002, do not duplicate — FR-014): `LivingRecordRepository`,
`HealthEventRepository`, `DailyCheckinRepository`, `DailyScoreRepository`, the registry, design
tokens. **No new repositories/contracts/mock/api are created by this feature.**

**Tests**: Included for the pure aggregation/filter/export logic (this feature's entire risk
surface) and the consistency-after-correction guarantee.

**Organization**: By user story. US1, US2, US3 are P1; US4 is P2.

## Format: `[ID] [P?] [Story?] Description`

- **[P]** = different files, no dependency on an incomplete task
- **[Story]** = US1–US4 on user-story tasks; Setup/Foundational/Polish carry no story label

---

## Phase 1: Setup

- [X] T001 Create module folders: `app/(record)/`, `src/features/living-record/{components,hooks}`, `src/services/living-record-view/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete before any user story. (Minimal — this feature adds no new repositories.)

- [X] T002 Define view-model types `RecordItem`, `DailyHistoryPoint`, `LivingRecordFullExport` in `src/services/living-record-view/types.ts` (mirror `data-model.md`)
- [X] T003 [P] Empty-state component (`EmptyState`) in `src/features/living-record/components/EmptyState.tsx` (FR-003)

**Checkpoint**: foundation ready.

---

## Phase 3: User Story 1 - Browse the whole Living Record in one place (Priority: P1) 🎯 MVP

**Goal**: One view shows Living Record entries + Health Events together, labeled by
category/timestamp/source.

**Independent Test**: With entries (from onboarding) and health events (from a check-in) already
in the mock stores, the view lists both, each correctly labeled.

### Tests for User Story 1

- [X] T004 [P] [US1] Unit test: `loadItems` merges entries + health events into `RecordItem[]`, sorted, each carrying category/timestamp/source in `tests/unit/living-record-view.test.ts` (FR-001/002)

### Implementation for User Story 1

- [X] T005 [US1] Implement `loadItems(patientId)` in `src/services/living-record-view/index.ts`: call `livingRecordRepository().list()` + `healthEventRepository().list()`, map both to `RecordItem`, merge + sort by timestamp desc
- [X] T006 [P] [US1] `RecordItemCard` component (category badge, content, timestamp, source) in `src/features/living-record/components/RecordItemCard.tsx`
- [X] T007 [US1] `useLivingRecordView` hook (loads items via TanStack Query) in `src/features/living-record/hooks/useLivingRecordView.ts`
- [X] T008 [US1] Living Record screen `app/(record)/index.tsx` + `app/(record)/_layout.tsx`: list of `RecordItemCard`s, `EmptyState` when empty (FR-003)
- [X] T009 [US1] Add navigation entry point to the Living Record view (e.g., from the daily result screen or a persistent nav element)

**Checkpoint**: US1 independently functional — the MVP unified view.

---

## Phase 4: User Story 2 - Daily history and trends (Priority: P1)

**Goal**: A chronological history of Daily Scores, informational, no false trend implication
below 2 points.

**Independent Test**: With 3+ completed check-ins, the view shows each day's score/band in order;
with 0–1 days, no trend UI appears.

### Tests for User Story 2

- [X] T010 [P] [US2] Unit test: `loadDailyHistory` returns ascending-by-date points; verify no-trend behavior with <2 points in `tests/unit/living-record-view.test.ts` (FR-004/006)

### Implementation for User Story 2

- [X] T011 [US2] Implement `loadDailyHistory(patientId)` in `src/services/living-record-view/index.ts` (calls `dailyScoreRepository().list()`, maps to `DailyHistoryPoint`, sorts ascending)
- [X] T012 [P] [US2] `DailyHistoryRow` component (date, score, band — informational styling reused from `ScoreCard`'s band tone) in `src/features/living-record/components/DailyHistoryRow.tsx`
- [X] T013 [US2] Add the daily history section to `app/(record)/index.tsx`, gated on ≥1 point; no trend framing below 2 (FR-006); show the informational disclaimer once for the section (not per row) so FR-005 holds without visual noise

**Checkpoint**: US1 + US2 — browsing plus history.

---

## Phase 5: User Story 3 - Correct or remove any item from one place (Priority: P1)

**Goal**: Edit/remove any entry or health event from the Living Record view; changes are
consistent everywhere.

**Independent Test**: Correct an entry from this view; verify the corrected value (not the
superseded one) is what any other read of that data returns.

### Tests for User Story 3

- [X] T014 [P] [US3] Unit test: `correctItem`/`removeItem` route to the correct owning repository by `kind`, and a subsequent `loadItems` reflects the change (no stale/superseded value) in `tests/unit/living-record-view.test.ts` (FR-007/008/009)

### Implementation for User Story 3

- [X] T015 [US3] Implement `correctItem`/`removeItem` in `src/services/living-record-view/index.ts`: dispatch to `livingRecordRepository().correct/remove` or `healthEventRepository().correct/remove` based on `item.kind`
- [X] T016 [US3] Wire edit/remove actions into `RecordItemCard` (or a detail view) in `src/features/living-record/components/RecordItemCard.tsx` + `app/(record)/index.tsx`

**Checkpoint**: US1 + US2 + US3 — a fully functional, correctable Living Record view.

---

## Phase 6: User Story 4 - Search, filter, and export (Priority: P2)

**Goal**: Filter by category/date range; export the complete record as one portable file.

**Independent Test**: Filtering narrows results correctly (including an empty-result state);
export produces a file containing all four data types.

### Tests for User Story 4

- [X] T017 [P] [US4] Unit test: `filterItems` by category and by date range, including a no-match case in `tests/unit/living-record-view.test.ts` (FR-011/012/013)
- [X] T018 [P] [US4] Unit test: `exportAll` composes entries + health events + check-ins + scores into one payload in `tests/unit/living-record-view.test.ts` (SC-004, FR-010)

### Implementation for User Story 4

- [X] T019 [US4] Implement `filterItems` (category, date range) in `src/services/living-record-view/index.ts`
- [X] T020 [P] [US4] `CategoryFilter` + `DateRangeFilter` components in `src/features/living-record/components/`
- [X] T021 [US4] Implement `exportAll(patientId)` in `src/services/living-record-view/index.ts` (composes `livingRecordRepository().export()` + the other three `list()` calls)
- [X] T022 [US4] Wire filters + an export action into `app/(record)/index.tsx`; empty-filter state reuses `EmptyState` (FR-013)

**Checkpoint**: all four stories independently functional.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T023 [P] Run `quickstart.md` scenarios (11) and record results
- [X] T024 [P] Confirm the architecture-invariant guard (`tests/unit/architecture.test.ts`) covers `app/(record)` with no changes needed (it walks `app/` recursively) — verify passing
- [ ] T025 [P] Accessibility pass on `app/(record)/` screens
- [X] T026 Confirm no new repository/contract/mock/api files were added (grep diff) — document in `specs/003-living-record/checklists/privacy-review.md`
- [X] T027 [P] Feature README for `specs/003-living-record/`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2, blocks all stories)** → **User Stories** → **Polish**.
- US1 (P1) is the MVP; US2 (P1) and US3 (P1) each build additively on the screen US1 creates; US4
  (P2) adds filter/export on top. All reuse the same aggregation service module, so within-file
  edits to `src/services/living-record-view/index.ts` are sequential across US1→US2→US3→US4 even
  though they're independently testable.

### Parallel Opportunities

- Foundational: T002, T003 in parallel.
- Tests across stories ([P]) can be written up front since they target the same (evolving) test
  file — coordinate to avoid clobbering; components ([P] tasks) are always parallel-safe (distinct
  files).

---

## Parallel Example: User Story 1

```bash
Task: "Unit test loadItems merge/sort in tests/unit/living-record-view.test.ts"
Task: "RecordItemCard component in src/features/living-record/components/RecordItemCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

Setup → Foundational → US1 → **stop & validate** the unified browse view.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. + US1 → unified browsing (MVP).
3. + US2 → daily history/trends (resolves feature 002's V1 deferral).
4. + US3 → correct/remove from one place (completes data-ownership story).
5. + US4 → filter + export.
6. Polish.

### Constitution guardrails baked into tasks

- **II** (ownership): T015/T016 (correct/remove from one place), T021 (export).
- **III** (informational): T012/T013 keep Daily Score history framed as a wellness indicator.
- **IX** (reuse, no new repos): T005/T011/T015/T021 call only existing repository public methods;
  T026 explicitly verifies no new repository surface was added.

---

## Notes

- [P] = different files, no incomplete-task dependency.
- This feature's entire implementation lives in one new service module + one new screen —
  smallest footprint of the three features so far, by design (FR-014).
