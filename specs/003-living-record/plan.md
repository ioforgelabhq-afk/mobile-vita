# Implementation Plan: Living Record View

**Branch**: `003-living-record` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-living-record/spec.md`

## Summary

Deliver a single, persistent **Living Record view** (Pillar 3): unified browsing of Living Record
entries + Health Events, a daily history/trend of Daily Scores (resolving the daily-checkin
feature's deferred "V1" browsing gap), correction/removal of any item from one place, filtering by
category/date, and a full-record export.

**Technical approach**: This is a **read/aggregate feature — no new repositories or entities**
(FR-014). It queries the four existing repositories (`LivingRecordRepository`,
`HealthEventRepository`, `DailyCheckinRepository`, `DailyScoreRepository`) via the existing
registry, merges their results client-side into one browsable, filterable list plus a daily-score
history, and reuses each repository's existing `correct`/`remove` methods for edits. A single new
`livingRecordView` aggregation service (pure, client-side) does the merge/sort/filter; a new Expo
Router screen (`app/(record)/`) presents it. Export extends `LivingRecordRepository.export()`
output with health events, check-ins, and scores into one JSON payload.

## Technical Context

**Language/Version**: TypeScript 5.x/6.x (strict), React Native via Expo SDK 57 (RN 0.86, React 19)

**Primary Dependencies**: Expo Router, TanStack Query, NativeWind — all already in the project.
No new runtime dependencies.

**Storage**: Read-only against the existing local stores (`CollectionStore` abstraction); no new
storage.

**Testing**: Jest (30) + ts-jest logic suite — aggregation/merge/filter/export logic and the
consistency-after-correction behavior.

**Target Platform**: iOS 15+ / Android (Expo managed); Spanish-first (`es`).

**Project Type**: Mobile application (client only).

**Performance Goals**: Filter results in under 1s for a typical record (SC-007); smooth scroll for
months of daily history (spec edge case "large history").

**Constraints**: No new repositories/entities (FR-014); fully offline (FR-015); corrections must
be reflected consistently everywhere else that reads the same data (FR-009) — satisfied for free
since everything reads from the same repositories/stores.

**Scale/Scope**: One feature, ~1–2 screens, 1 aggregation service, zero new repositories.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | How this plan complies | Status |
|---|-----------|------------------------|--------|
| I | Companion, not provider | No new companion copy risk; purely a data view | ✅ PASS |
| II | Patient data ownership | Central place to view/correct/remove/export everything (FR-007–010) | ✅ PASS |
| III | Informational, never diagnostic | Daily Score history keeps band + disclaimer (FR-005) | ✅ PASS |
| IV | Safety over engagement | N/A — no new patient-authored free text is screened here; no engagement mechanics | ✅ PASS |
| V | Human conversation, not a form | N/A — a browse/list view, not a data-collection flow | ✅ PASS |
| VI | Every interaction enriches the Living Record | Gives the record a persistent home; corrections keep it accurate | ✅ PASS |
| VII | Privacy by design | No new collection; reads existing consent-gated data as already governed | ✅ PASS |
| VIII | Offline-first | Read-only against local stores; works with no network (FR-015) | ✅ PASS |
| IX | API-first architecture | Zero new repositories; reuses existing contracts exclusively (FR-014) | ✅ PASS |
| X | Four-pillar value test | Directly serves Pillar 3 (better Living Record) | ✅ PASS |

**Gate result**: PASS. No violations. This is the smallest-footprint feature so far — pure
aggregation over existing, already-governed data — so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-living-record/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output (view models, not new entities)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── README.md         # documents the aggregation service "contract" (no new repo contracts)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root) — additive to features 001/002

```text
app/
└── (record)/                          # new Expo Router group
    ├── _layout.tsx
    └── index.tsx                       # the Living Record view (list + filters + history)

src/
├── features/living-record/
│   ├── components/                     # RecordItemCard, DailyHistoryRow, CategoryFilter, DateRangeFilter, EmptyState
│   └── hooks/                          # useLivingRecordView (query + filter state)
├── services/
│   └── living-record-view/             # pure aggregation: merge, sort, filter, export-shape
└── (no new repositories/, contracts/, mock/, api/ — reuse only)

tests/
└── unit/                               # aggregation merge/sort/filter, export shape, empty/sparse states
```

**Structure Decision**: Purely additive UI + one aggregation service. No changes to the
repository layer's contracts, mocks, or API stubs — this feature only calls existing public
methods (`list`, `correct`, `remove`, `export`). This keeps the Mock→API swap guarantee intact
automatically, since nothing new is added to that seam (Principle IX).

## Complexity Tracking

> No constitution violations. No new repositories were introduced by design (FR-014); nothing to
> justify here.
