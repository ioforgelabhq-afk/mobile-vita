---
description: "Task list for Conversational Onboarding"
---

# Tasks: Conversational Onboarding

**Input**: Design documents from `/specs/001-conversational-onboarding/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included **only** for constitution-mandated paths — safety-critical flows,
offline/sync behavior, and repository contract parity (Mock ≡ API). Other tasks are
implementation-only per the "tests are optional" rule.

**Domain source of truth**: `docs/domain/domain-model.md` · **API contract**: `docs/api/openapi.yaml`

**Organization**: Grouped by user story. US1–US3 are all P1; US4 is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4 for user-story phases; Setup/Foundational/Polish carry no story label
- Paths follow the mobile structure in plan.md (`app/`, `src/`, `tests/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Expo/React Native project and tooling.

- [X] T001 Initialize Expo (managed) + TypeScript (strict) project with Expo Router at repo root
- [X] T002 Install dependencies: expo-router, zustand, @tanstack/react-query, react-hook-form, zod, nativewind, expo-sqlite, expo-secure-store, expo-notifications
- [X] T003 [P] Configure NativeWind + `tailwind.config.js` + `global.css` using the token mapping in `docs/design/brand-tokens.md` (colors, `Hanken Grotesk`/`IBM Plex Mono` fonts, radii); load fonts via `expo-font`
- [ ] T004 [P] Configure ESLint + Prettier + `tsconfig.json` (strict, path aliases)
- [ ] T005 [P] Configure Jest + React Native Testing Library in `jest.config.js` and `tests/setup.ts`
- [X] T006 Create source tree per plan.md: `src/{repositories,services,stores,lib,features,ui}` and `app/(onboarding)/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Repository layer, storage, sync, feature flags, safety/guardrails, and app shell that
every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Define shared Zod schemas + types in `src/repositories/contracts/schemas.ts` (Patient, Consent/ConsentGrant, Conversation/Turn, LivingRecordEntry, SafetyEvent, SyncMeta) mirroring `data-model.md`
- [X] T008 [P] Define `RepositoryError` + typed result helpers in `src/repositories/contracts/errors.ts`
- [X] T009 [P] Implement feature-flag module (per-repository `mock | api`, default `mock`) in `src/lib/feature-flags/index.ts`
- [X] T010 Implement flag-driven repository registry/resolver in `src/repositories/index.ts` (screens import from here only)
- [X] T011 Implement encrypted SQLite storage adapter in `src/lib/storage/db.ts` (key sourced from secure-store)
- [X] T012 [P] Implement secure-store adapter (DB key, tokens) in `src/lib/storage/secure.ts`
- [X] T013 [P] Configure TanStack Query client + offline persister in `src/lib/query/client.ts`
- [X] T014 Implement durable outbound sync queue (idempotency keys, replay-safe, conflict field) in `src/lib/sync/queue.ts`
- [X] T014a Implement **fail-closed consent gate** primitive in `src/services/consent-gate/index.ts`: a `requireConsent(purpose)` guard that **denies** any health-data write when no matching granted `ConsentGrant` exists (default deny). All health-bearing repositories consult it (FR-012, FR-016; Principles II & VII). Resolves analysis finding C1 — health writes are gated from the first increment, not from US2.
- [X] T015 [P] AuthRepository contract + Mock + API stub in `src/repositories/{contracts,mock,api}/auth.repository.ts` (local-first identity, FR-020a)
- [X] T016 [P] PatientRepository contract + Mock + API stub in `src/repositories/{contracts,mock,api}/patient.repository.ts`
- [X] T017 Implement `SafetyService` (explicit + intent/keyword detection, versioned rule set) in `src/services/safety/index.ts` (D5; used by US1 & US3)
- [X] T018 [P] Implement guardrails service (informational-not-diagnostic checks) in `src/services/guardrails/index.ts` (Principle III)
- [X] T019 [P] Create onboarding content module (companion copy, role disclosure, safety resources) in `src/features/onboarding/content/`
- [X] T020 [P] Create base Zustand store (session/conversation/UI state) in `src/stores/onboarding.ts`
- [X] T021 [P] Create NativeWind UI primitives + design tokens in `src/ui/` per `docs/design/brand-tokens.md`: CSS-variable light/dark themes (deep-navy dark, never black) + accent presets A/B/C (default **A · Teal**), the VITA wordmark + **"Ascenso"** mark component, and base primitives (Button, Chip/Tag, Field, Card, VitalCard). Crimson reserved for safety/critical (Principle IV).
- [X] T022 Implement Expo Router shell `app/_layout.tsx` + entry routing `app/index.tsx` (route first-time patient to onboarding; recognize existing record)
- [X] T023 Create repository contract-test harness in `tests/contract/repository-parity.test.ts` (asserts Mock & API satisfy the same Zod-typed interface — Principle IX)

**Checkpoint**: Foundation ready — user stories can now proceed.

---

## Phase 3: User Story 1 - Welcoming conversation that starts the Living Record (Priority: P1) 🎯 MVP

**Goal**: A first-time patient completes an adaptive, human-feeling conversation (no form) that
seeds a categorized, editable Living Record.

**Independent Test**: Drive the conversation end-to-end against Mock repos (seed consent
programmatically); verify one-prompt-at-a-time, adaptive follow-ups, and a populated, correctable
Living Record on the review screen — no intake form shown.

### Tests for User Story 1

- [X] T024 [P] [US1] Integration test: full onboarding conversation → populated Living Record in `tests/integration/onboarding-conversation.test.ts`. Include an assertion that a typical scripted completion elapses in under 10 minutes of interaction budget (SC-008; resolves analysis finding G1). Seeds `store_health_data` consent programmatically (see C1 note).
- [X] T025 [P] [US1] Contract test: Conversation + LivingRecord Mock ≡ API in `tests/contract/conversation-livingrecord.test.ts`

### Implementation for User Story 1

- [X] T026 [P] [US1] ConversationRepository contract in `src/repositories/contracts/conversation.repository.ts` (per `contracts/conversation.contract.md`)
- [X] T027 [P] [US1] LivingRecordRepository contract in `src/repositories/contracts/living-record.repository.ts` (per `contracts/living-record.contract.md`)
- [X] T028 [US1] Adaptive flow engine in `src/features/onboarding/flow/` + Mock ConversationRepository in `src/repositories/mock/conversation.repository.ts` (one prompt at a time, adaptive; runs SafetyService first, FR-001/002/017)
- [X] T029 [P] [US1] API ConversationRepository stub in `src/repositories/api/conversation.repository.ts` (honors contract; calls `/conversations*`)
- [X] T030 [US1] Mock + API LivingRecordRepository in `src/repositories/{mock,api}/living-record.repository.ts` (categorized entries; correction supersedes prior, FR-005/006/007/008). Every `add`/`correct` MUST call the T014a fail-closed consent gate (`requireConsent('store_health_data')`) before persisting (FR-016).
- [X] T030a [US1] Reluctant/minimal-input handling in `src/features/onboarding/flow/`: the flow MUST accept sparse or skipped answers without coercion and still reach a graceful conclusion with a (smaller) valid Living Record + unit test in `tests/unit/flow-reluctant-input.test.ts` (FR-004). Resolves analysis finding U1.
- [X] T031 [US1] `useOnboardingFlow` hook in `src/features/onboarding/hooks/useOnboardingFlow.ts` (TanStack Query + Zustand)
- [X] T032 [P] [US1] Conversation UI components (message bubble, prompt input, typing) in `src/features/onboarding/components/`
- [X] T033 [US1] Conversation screen `app/(onboarding)/conversation.tsx`
- [X] T034 [US1] Review/correct entries screen `app/(onboarding)/review.tsx` (view/edit/remove entries, FR-007)
- [X] T035 [US1] Completion screen `app/(onboarding)/complete.tsx` (confirm record started + ready for daily guidance, FR-025)

> **US1 consent note (C1)**: Because the T014a gate is fail-closed, US1's health writes require a
> granted `store_health_data` consent. US1's integration test (T024) seeds that consent
> programmatically; the patient-facing consent capture is US2. **No increment may be shipped/demoed
> with real patient data unless US2 (consent capture) is also included** — US1 and US2 form the
> shippable P1 boundary together.

**Checkpoint**: US1 fully functional and independently testable.

---

## Phase 4: User Story 2 - Understanding VITA's role + informed, granular consent (Priority: P1)

**Goal**: Patient learns VITA is a companion (not provider) offering informational (not diagnostic)
support, and gives granular, revocable consent before health data is stored.

**Independent Test**: Before any health write, show role disclosure + granular consent; declining
one purpose blocks that use while others proceed; data-rights (view/export/delete/revoke) are
discoverable.

### Tests for User Story 2

- [X] T036 [P] [US2] Integration test: granular consent grant/decline gates health writes in `tests/integration/consent.test.ts`
- [X] T037 [P] [US2] Contract test: Consent Mock ≡ API in `tests/contract/consent.test.ts`

### Implementation for User Story 2

- [X] T038 [P] [US2] ConsentRepository contract in `src/repositories/contracts/consent.repository.ts` (per `contracts/consent.contract.md`)
- [X] T039 [US2] Mock + API ConsentRepository in `src/repositories/{mock,api}/consent.repository.ts` (auditable record, `isGranted`, revoke — FR-012/013/014/015/016a)
- [X] T040 [US2] Back the T014a consent gate with the real `ConsentRepository.isGranted` (replace the foundational default-deny stub with live grant lookups; still fail-closed, FR-016) in `src/services/consent-gate/index.ts` + `src/repositories/mock/living-record.repository.ts`
- [X] T041 [P] [US2] Role-disclosure + informational-framing copy wiring in `src/features/onboarding/content/` (Principles I, III)
- [X] T042 [P] [US2] Welcome/role screen `app/(onboarding)/welcome.tsx` (companion-not-provider, informational-not-diagnostic — FR-009/010)
- [X] T043 [US2] Consent screen (React Hook Form + Zod, per-purpose toggles) `app/(onboarding)/consent.tsx` (the ONLY form; Principle V)
- [X] T043a [US2] Decline-all-consent explanatory flow in `app/(onboarding)/consent.tsx` + `src/features/onboarding/content/`: when the patient declines all purposes, explain — without pressure — what VITA can and cannot do, and proceed without storing health data (spec Edge Cases; FR-014). Resolves analysis finding U2.
- [X] T044 [P] [US2] Data-rights surface (view/export/delete + revoke discoverable) in `src/features/onboarding/components/DataRights.tsx` (FR-015)
- [X] T045 [US2] Diagnosis/treatment-request handling in flow: decline + reframe informational + point to provider, via guardrails (FR-011)

**Checkpoint**: US1 + US2 both work independently.

---

## Phase 5: User Story 3 - Safety takes precedence over onboarding (Priority: P1)

**Goal**: A crisis signal during onboarding surfaces safety resources ahead of any further
onboarding step, and onboarding resumes only after safety is addressed.

**Independent Test**: Inject a crisis phrase; verify onboarding is interrupted, resources/escalation
surface before the next prompt, and the flow resumes only afterward.

### Tests for User Story 3 (safety-critical — mandatory)

- [X] T046 [P] [US3] Unit tests: SafetyService detection (explicit, intent pattern, ambiguous→err-toward-safety) in `tests/unit/safety.test.ts` (FR-017a/019)
- [X] T047 [P] [US3] Integration test: crisis interrupts onboarding; resources shown before continuing in `tests/integration/safety-flow.test.ts` (FR-017/018)

### Implementation for User Story 3

- [X] T048 [US3] Persist `SafetyEvent` + ensure `sendPatientMessage` screens safety BEFORE generating companion turn in `src/repositories/mock/conversation.repository.ts` (FR-017/017a/018)
- [X] T049 [US3] Crisis resources UI surfaced ahead of onboarding in `src/features/onboarding/components/SafetyResources.tsx` (+ resource content)
- [X] T050 [US3] Ambiguous-signal handling errs toward surfacing resources in `src/services/safety/index.ts` (FR-019)
- [X] T051 [US3] Resume-after-safety flow (onboarding continues only once addressed) in `src/features/onboarding/hooks/useOnboardingFlow.ts` (FR-018)

**Checkpoint**: US1 + US2 + US3 all independently functional; safety gate verified.

---

## Phase 6: User Story 4 - Offline-first + sync-later (Priority: P2)

**Goal**: Onboarding works with no connectivity; captured data syncs exactly once on reconnect
(no loss, no duplicates); progress resumes; returning patients aren't duplicated.

**Independent Test**: With networking disabled, complete onboarding; on reconnect, verify each
record synced exactly once; quit mid-flow and resume; relaunch after completion without
duplication.

### Tests for User Story 4 (offline/sync — mandatory)

- [X] T052 [P] [US4] Integration test: offline capture → reconnect syncs exactly once (no dupes) in `tests/integration/offline-sync.test.ts` (FR-020/021)
- [X] T053 [P] [US4] Unit test: sync queue idempotency + conflict handling in `tests/unit/sync-queue.test.ts`

### Implementation for User Story 4

- [X] T054 [US4] Route all onboarding repository mutations through the sync queue with `clientMutationId` in `src/repositories/mock/*.repository.ts` and `src/lib/sync/queue.ts` (FR-021)
- [X] T055 [P] [US4] Offline detection + graceful-degradation messaging for connectivity-required parts in `src/lib/sync/connectivity.ts` (FR-022)
- [X] T056 [US4] Resume abandoned onboarding from persisted progress in `src/features/onboarding/hooks/useOnboardingFlow.ts` (FR-023)
- [X] T057 [US4] Returning-patient recognition (no overwrite/duplicate) in `app/index.tsx` + `src/repositories/mock/patient.repository.ts` (FR-024)
- [X] T058 [P] [US4] Optional post-onboarding account link enabling sync via `AuthRepository.linkAccount` in `src/features/onboarding/components/AccountLink.tsx` (FR-020b)

**Checkpoint**: All four stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T059 [P] Run `quickstart.md` validation scenarios (10 scenarios) and record results
- [X] T060 [P] Add architecture-invariant guard (lint rule/test): screens/hooks must not import `repositories/mock` or `repositories/api` directly in `tests/unit/architecture.test.ts` (Principle IX)
- [ ] T061 [P] Accessibility pass on all onboarding screens in `app/(onboarding)/`
- [X] T062 [P] Unit tests for guardrails + adaptive flow selection in `tests/unit/`
- [ ] T063 Privacy review checklist: encryption-at-rest, minimal collection, consent-gated writes (Principle VII; HIPAA/GDPR)
- [ ] T064 [P] Update feature README linking `docs/domain/domain-model.md` and `docs/api/openapi.yaml`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all user stories.
- **User Stories (Phases 3–6)**: depend on Foundational. US1/US2/US3 are all P1; US4 is P2.
- **Polish (Phase 7)**: depends on the targeted stories being complete.

### User Story Dependencies

- **US1 (P1)**: after Foundational. Uses the foundational SafetyService; for independent testing,
  its integration test seeds consent programmatically (real consent UX is US2).
- **US2 (P1)**: after Foundational. Adds the real consent gate that US1's writes consult; testable
  on its own.
- **US3 (P1)**: after Foundational; strengthens the safety behavior US1's flow already invokes.
  Independently testable via injected crisis signals.
- **US4 (P2)**: after Foundational; wraps all repositories' mutations. Best sequenced after US1–US3
  exist, but its queue/offline logic is independently testable.

### Within Each User Story

- Contracts before implementations; Mock before/with API stub; repositories before hooks; hooks
  before screens. Mandated tests (US3, US4, contract parity) written to fail first.

### Parallel Opportunities

- Setup: T003, T004, T005 in parallel.
- Foundational: T008, T009, T012, T013, T015, T016, T018, T019, T020, T021 in parallel (distinct files).
- Within a story, tasks marked [P] touch distinct files and can run together.
- With capacity, US1/US2/US3 can be built in parallel once Foundational is done.

---

## Parallel Example: User Story 1

```bash
# Mandated tests for US1 together:
Task: "Integration test onboarding conversation in tests/integration/onboarding-conversation.test.ts"
Task: "Contract test Conversation+LivingRecord in tests/contract/conversation-livingrecord.test.ts"

# Contracts + parallel-safe pieces together:
Task: "ConversationRepository contract in src/repositories/contracts/conversation.repository.ts"
Task: "LivingRecordRepository contract in src/repositories/contracts/living-record.repository.ts"
Task: "API ConversationRepository stub in src/repositories/api/conversation.repository.ts"
Task: "Conversation UI components in src/features/onboarding/components/"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & validate** the conversation
   + Living Record independently. This is the demoable MVP for Pillar 1.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. + US1 → human-feeling conversation seeds the Living Record (MVP).
3. + US2 → role clarity + granular consent gating writes.
4. + US3 → safety-first crisis handling.
5. + US4 → offline-first + sync-later + resume/returning-patient.
6. Polish.

### Constitution guardrails baked into tasks

- **IX (API-first)**: T023, T060 enforce contract parity + the no-direct-import invariant.
- **IV (Safety)**: T046, T047, T048 make the safety gate mandatory and tested.
- **VIII (Offline)**: T052, T053, T054 make offline/sync mandatory and tested.
- **II/VII (Ownership/Privacy)**: T039, T040, T044, T063 enforce consent-gating + data rights.
- **I/III (Companion/Informational)**: T041, T042, T045, T018 keep copy non-diagnostic.

---

## Notes

- [P] = different files, no incomplete-task dependency.
- Every user-story task carries its [US#] label for traceability to `spec.md`.
- Tests are included only where the constitution requires them; expand to full TDD if desired.
- Commit after each task or logical group; stop at any checkpoint to validate a story.
