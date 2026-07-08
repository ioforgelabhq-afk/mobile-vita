---
description: "Task list for Physician Briefing"
---

# Tasks: Physician Briefing

**Input**: Design documents from `/specs/004-physician-briefing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Reuses** (do not duplicate — FR-015): feature 003's `living-record-view` service
(loadItems/loadDailyHistory/filterItems), the consent gate (`hasConsent`), `guardrails`, the
repository registry, design tokens. **One new repository is introduced deliberately**:
`PhysicianRepository` (see plan.md Complexity Tracking).

**Tests**: Included for Physician CRUD, consent gating, briefing composition/disclaimer/omission,
and scoping (this feature's entire risk surface).

**Organization**: By user story. US1, US2, US3 are P1; US4 is P2.

## Format: `[ID] [P?] [Story?] Description`

- **[P]** = different files, no dependency on an incomplete task
- **[Story]** = US1–US4 on user-story tasks; Setup/Foundational/Polish carry no story label

---

## Phase 1: Setup

- [X] T001 Add feature-flag key `physician` (default `mock`) in `src/lib/feature-flags/index.ts`
- [X] T002 Create module folders: `app/(briefing)/`, `src/features/briefing/{components,hooks}`, `src/services/briefing/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete before any user story.

- [X] T003 Add `Physician` Zod schema to `src/repositories/contracts/schemas.ts` (mirror `data-model.md` / `docs/domain/domain-model.md` §10)
- [X] T004 [P] `PhysicianRepository` contract in `src/repositories/contracts/physician.repository.ts` (per `contracts/physician.contract.md`)
- [X] T005 Mock `PhysicianRepository` in `src/repositories/mock/physician.repository.ts` (list/add/update/remove; soft delete; idempotent per `clientMutationId`) + add a `physicians` store to `src/repositories/mock/stores.ts`
- [X] T006 [P] API `PhysicianRepository` stub in `src/repositories/api/physician.repository.ts` (conforms to `docs/api/openapi.yaml` `/physicians*`)
- [X] T007 Register `physicianRepository()` + wire the `physician` flag in `src/repositories/index.ts`
- [X] T008 Extend `tests/contract/repository-parity.test.ts` to include `PhysicianRepository` (Mock ≡ API — Principle IX)
- [X] T009 [P] Define `BriefingSection`/`BriefingDocument`/`BriefingScope` types in `src/services/briefing/types.ts` (mirror `data-model.md`)

**Checkpoint**: foundation ready.

---

## Phase 3: User Story 1 - Manage physician contacts (Priority: P1) 🎯 MVP

**Goal**: Add, view, edit, and remove physician contacts (name required, rest optional).

**Independent Test**: Add a physician with only a name; see it listed; edit it; remove it.

### Tests for User Story 1

- [X] T010 [P] [US1] Unit test: `PhysicianRepository` CRUD (name-only add, update, soft-delete remove, no uniqueness enforced) in `tests/unit/physician-repository.test.ts` (FR-001–004)

### Implementation for User Story 1

- [X] T011 [P] [US1] `PhysicianCard` component (name, specialty/org, contact, edit/remove actions) in `src/features/briefing/components/PhysicianCard.tsx`
- [X] T012 [US1] `PhysicianForm` component (React Hook Form + Zod; only `name` required) in `src/features/briefing/components/PhysicianForm.tsx`
- [X] T013 [US1] `usePhysicians` hook (list/add/update/remove via the registry, TanStack Query) in `src/features/briefing/hooks/usePhysicians.ts`
- [X] T014 [US1] Physicians screen `app/(briefing)/physicians.tsx` + `app/(briefing)/_layout.tsx`

**Checkpoint**: US1 independently functional.

---

## Phase 4: User Story 2 - Generate an informational, physician-ready briefing (Priority: P1)

**Goal**: Compose an organized, disclaimer-led briefing from the Living Record; never diagnostic;
handles sparse data plainly.

**Independent Test**: With entries/health events/daily history present, generate a briefing and
verify it contains all three sections, a disclaimer, and no diagnostic language; with no data,
verify it says so plainly.

### Tests for User Story 2

- [X] T015 [P] [US2] Unit test: `composeBriefing` builds sections from `loadItems`/`loadDailyHistory`, always includes the disclaimer, omits guardrail-failing items, and reflects an empty record plainly in `tests/unit/briefing.test.ts` (FR-005–009)

### Implementation for User Story 2

- [X] T016 [US2] Implement `composeBriefing(patientId, scope?)` in `src/services/briefing/index.ts`: call feature 003's `loadItems`/`loadDailyHistory`, group into sections, guardrail-check each item body, set `isEmpty`, attach the fixed disclaimer
- [X] T017 [P] [US2] `BriefingDocument` view component (disclaimer banner, sectioned content, empty-state copy) in `src/features/briefing/components/BriefingDocument.tsx`
- [X] T018 [US2] `useBriefing` hook (calls `canGenerate`/`generate`) in `src/features/briefing/hooks/useBriefing.ts`
- [X] T019 [US2] Briefing screen `app/(briefing)/generate.tsx` rendering `BriefingDocument`

**Checkpoint**: US1 + US2 — physicians + a real, informational briefing.

---

## Phase 5: User Story 3 - Sharing requires explicit consent (Priority: P1)

**Goal**: Block briefing generation without `share_with_physician` consent; explain + offer to
grant it; re-gate after revocation.

**Independent Test**: Without consent, generation is blocked with an explanation; after granting,
it succeeds; after revoking, a new attempt is blocked again.

### Tests for User Story 3 (mandatory — consent gating)

- [X] T020 [P] [US3] Unit test: `canGenerate`/`generate` are fail-closed on `share_with_physician`; granting unblocks; revoking re-blocks in `tests/unit/briefing.test.ts` (FR-010–012)

### Implementation for User Story 3

- [X] T021 [US3] Implement `canGenerate(patientId)` in `src/services/briefing/index.ts` using `hasConsent(patientId, 'share_with_physician')`; `generate` checks it first and throws `ConsentRequiredError` if false (FR-010)
- [X] T022 [US3] `ConsentGate` component (explanation + CTA to grant `share_with_physician`, reusing onboarding's consent-capture pattern) in `src/features/briefing/components/ConsentGate.tsx`
- [X] T023 [US3] Wire `ConsentGate` into `app/(briefing)/generate.tsx`: show it instead of the briefing when `canGenerate` is false (FR-011)

**Checkpoint**: US1 + US2 + US3 — a fully consent-gated, functional briefing feature.

---

## Phase 6: User Story 4 - Choose what's included before finalizing (Priority: P2)

**Goal**: Narrow the briefing by date range and/or excluded categories.

**Independent Test**: Applying a date range or excluding a category updates the briefing to
reflect only the selected scope.

### Tests for User Story 4

- [X] T024 [P] [US4] Unit test: `composeBriefing` with a date range and with excluded categories only includes matching/non-excluded items in `tests/unit/briefing.test.ts` (FR-013/014)

### Implementation for User Story 4

- [X] T025 [US4] Extend `composeBriefing` to accept `BriefingScope` and pass it to `filterItems` (inverting category selection for exclusion — research D5) in `src/services/briefing/index.ts`
- [X] T026 [P] [US4] Reuse/extend `DateRangeFilter` and add a category-exclusion control in `src/features/briefing/components/` (compose from feature 003's `CategoryFilter`/`DateRangeFilter` where possible)
- [X] T027 [US4] Wire scope controls into `app/(briefing)/generate.tsx`, regenerating the briefing on change

**Checkpoint**: all four stories independently functional.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T028 [P] Run `quickstart.md` scenarios (11) and record results
- [X] T029 [P] Confirm the architecture-invariant guard covers `app/(briefing)` with no changes needed (it walks `app/` recursively) — verify passing
- [ ] T030 [P] Accessibility pass on `app/(briefing)/` screens
- [X] T031 Privacy-review addendum for `specs/004-physician-briefing/checklists/privacy-review.md` (consent-gating verification, no new diagnostic risk, sharing-mechanism deferral)
- [X] T032 [P] Feature README for `specs/004-physician-briefing/`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2, blocks all stories)** → **User Stories** → **Polish**.
- US1 (P1) is the MVP (physician contacts exist independent of briefing generation). US2 (P1)
  builds the briefing itself; US3 (P1) gates it on consent — US2 and US3 touch the same
  `generate.tsx`/`composeBriefing` so are sequential in practice even though independently
  testable at the service level. US4 (P2) extends `composeBriefing` further.

### Parallel Opportunities

- Foundational: T004, T006, T009 in parallel (distinct files); T003/T005/T007/T008 are sequential
  (same files / dependent order).
- Component tasks ([P]) across stories are parallel-safe (distinct files).

---

## Parallel Example: User Story 1

```bash
Task: "Unit test PhysicianRepository CRUD in tests/unit/physician-repository.test.ts"
Task: "PhysicianCard component in src/features/briefing/components/PhysicianCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

Setup → Foundational → US1 → **stop & validate** physician-contact management.

### Incremental Delivery

1. Setup + Foundational → foundation ready (incl. the one new repository).
2. + US1 → manage physicians (MVP).
3. + US2 → generate a real, informational briefing.
4. + US3 → consent-gate sharing (non-negotiable before this feature is usable end-to-end).
5. + US4 → scope the briefing.
6. Polish.

### Constitution guardrails baked into tasks

- **III** (informational): T016 guardrail-checks every section item; T015 tests the disclaimer +
  omission behavior explicitly.
- **II/VII** (consent-gated sharing): T020–T023 make fail-closed gating mandatory and tested.
- **IX** (reuse + justified new repo): T008 parity-tests the one new repository; T016/T025 call
  feature 003's aggregation rather than reimplementing it.

---

## Notes

- [P] = different files, no incomplete-task dependency.
- This feature's only new persisted data is `Physician`; the briefing itself is always derived,
  never stored (research D2) — keeping the footprint close to feature 003's discipline while still
  justifying the one repository this feature genuinely needs.
