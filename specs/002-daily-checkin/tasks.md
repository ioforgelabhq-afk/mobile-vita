---
description: "Task list for Daily Guidance & Daily Check-in"
---

# Tasks: Daily Guidance & Daily Check-in

**Input**: Design documents from `/specs/002-daily-checkin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Reuses** (feature 001, do not duplicate — FR-024): repository registry, `SafetyService`,
`guardrails`, consent gate, `SyncQueue`, `ConversationRepository`, design tokens.

**Tests**: Included for constitution-mandated paths (safety, offline/sync, contract parity) and the
pure on-device logic (scoring, insights). Other tasks are implementation-only.

**Organization**: By user story. US1, US2, US4 are P1; US3 is P2.

## Format: `[ID] [P?] [Story?] Description`

- **[P]** = different files, no dependency on an incomplete task
- **[Story]** = US1–US4 on user-story tasks; Setup/Foundational/Polish carry no story label
- Paths follow plan.md (additive to feature 001)

---

## Phase 1: Setup

- [X] T001 Add feature-flag keys `dailyCheckin`, `dailyScore`, `healthEvent`, `insight` (default `mock`) in `src/lib/feature-flags/index.ts`
- [X] T002 Create module folders: `app/(daily)/`, `src/features/daily-checkin/{components,hooks,flow,content}`, `src/services/{scoring,insights}`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete before any user story.

- [X] T003 Extend `src/repositories/contracts/schemas.ts` with Zod schemas: `DailyCheckin`, `DailyScore` (+ `ScoreComponent`), `HealthEvent`, `Insight` (mirror `data-model.md`)
- [X] T004 [P] Add local-calendar-day helper (`todayLocal(): YYYY-MM-DD`) in `src/lib/date.ts`
- [X] T005 Implement on-device `scoring` service in `src/services/scoring/index.ts`: weighted heuristic → `{ score 0–100, band, components[] }`, renormalizing weights when inputs are missing (FR-003/006/007/009)
- [X] T006 [P] Implement `insights` service in `src/services/insights/index.ts`: rule-based generation by category, each body passed through `guardrails.inspect()`, history-thin fallback to education/encouragement (FR-010–014)
- [X] T007 [P] DailyScoreRepository contract in `src/repositories/contracts/daily-score.repository.ts` (per `contracts/daily-score.contract.md`)
- [X] T008 [P] HealthEventRepository contract in `src/repositories/contracts/health-event.repository.ts`
- [X] T009 [P] InsightRepository contract in `src/repositories/contracts/insight.repository.ts`
- [X] T010 [P] DailyCheckinRepository contract in `src/repositories/contracts/daily-checkin.repository.ts`
- [X] T011 Add the 4 new collection stores to `src/repositories/mock/stores.ts` and register the new repos + flags in `src/repositories/index.ts`
- [X] T012 Daily prompt set + adaptive flow in `src/features/daily-checkin/flow/engine.ts` (one prompt at a time; extracts mood/energy/sleep/symptoms/notes)
- [X] T013 [P] Daily companion copy (es) in `src/features/daily-checkin/content/index.ts`
- [X] T014 [P] Zustand daily-checkin UI store in `src/stores/daily-checkin.ts`
- [X] T015 Extend `tests/contract/repository-parity.test.ts` to include the 4 new repos (Mock ≡ API — Principle IX)

**Checkpoint**: foundation ready.

---

## Phase 3: User Story 1 - Quick check-in → informational Daily Score (Priority: P1) 🎯 MVP

**Goal**: A patient completes a brief conversational check-in and sees a Daily Score (band +
breakdown), informational, computed on-device.

**Independent Test**: Drive the check-in against mocks (consent seeded); see a Daily Score with band
+ components; no form, no diagnostic language; a repeat visit same day shows today's result.

### Tests for User Story 1

- [X] T016 [P] [US1] Unit test scoring: bands, missing-input renormalization, sparse check-in in `tests/unit/scoring.test.ts` (FR-003/006/007)
- [X] T017 [P] [US1] Integration test: full check-in → Daily Score in `tests/integration/daily-checkin.test.ts` (SC-001/004, FR-001/006)

### Implementation for User Story 1

- [X] T018 [US1] Mock DailyCheckinRepository in `src/repositories/mock/daily-checkin.repository.ts` (`forDate`/`startOrResume`/`update`/`complete`; one-per-day via unique `(patientId,date)`; health fields consent-gated) + API stub `src/repositories/api/daily-checkin.repository.ts`
- [X] T019 [US1] Mock + API DailyScoreRepository in `src/repositories/{mock,api}/daily-score.repository.ts` (`save`/`forDate`/`list`, unique per day)
- [X] T020 [US1] `useDailyCheckin` hook in `src/features/daily-checkin/hooks/useDailyCheckin.ts`: starts/resumes today's check-in via ConversationRepository(type=daily_checkin) + daily flow, computes score via `scoring` on complete, saves via DailyScoreRepository
- [X] T021 [P] [US1] `ScoreCard` component (band, 0–100, component breakdown, informational label) in `src/features/daily-checkin/components/ScoreCard.tsx`
- [X] T022 [US1] Check-in screen `app/(daily)/checkin.tsx` (conversational, Wizard-free single flow) + `app/(daily)/_layout.tsx`
- [X] T023 [US1] Result screen `app/(daily)/result.tsx` showing the Daily Score with informational framing (FR-008)
- [X] T024 [US1] One-per-day gate + entry: if today's check-in is complete, route to result; else to check-in (FR-004)

**Checkpoint**: US1 independently functional — the MVP daily loop.

---

## Phase 4: User Story 2 - Every check-in enriches the Living Record (Priority: P1)

**Goal**: Symptoms become Health Events; the check-in + Daily Score are stored, attributed,
correctable; all consent-gated.

**Independent Test**: A check-in mentioning a symptom yields a Health Event; check-in + score are
viewable/correctable; with no `store_health_data` consent, nothing health-bearing is persisted.

### Tests for User Story 2

- [X] T025 [P] [US2] Integration test: symptom → HealthEvent, check-in+score stored, consent-gated skip in `tests/integration/daily-enrichment.test.ts` (SC-010, FR-015/016/018)

### Implementation for User Story 2

- [X] T026 [US2] Mock + API HealthEventRepository in `src/repositories/{mock,api}/health-event.repository.ts` (`add` consent-gated, `correct` supersedes, `remove` soft-delete, `list`)
- [X] T027 [US2] On check-in completion, create a HealthEvent per reported symptom (source `daily_checkin`) via HealthEventRepository in `src/features/daily-checkin/hooks/useDailyCheckin.ts` (FR-015)
- [X] T028 [US2] Persist check-in + Daily Score as viewable/correctable records; surface them in the existing record/review views (FR-016/017)
- [X] T029 [US2] No-consent path: run the check-in and show the score, skip health persistence, inform the patient (FR-018 edge case)

**Checkpoint**: US1 + US2 — the daily loop grows the Living Record.

---

## Phase 5: User Story 3 - Informational Insights (Priority: P2)

**Goal**: Surface ≥1 informational, dismissible Insight after the check-in; never diagnostic;
graceful when history is thin.

**Independent Test**: After a check-in, ≥1 Insight with informational framing appears; a
diagnostic-sounding body is never shown; dismiss removes it; first-ever check-in still shows an
education/encouragement Insight.

### Tests for User Story 3

- [X] T030 [P] [US3] Unit test insights: guardrail rejection of diagnostic bodies + history-thin fallback in `tests/unit/insights.test.ts` (FR-011/014)

### Implementation for User Story 3

- [X] T031 [US3] Mock + API InsightRepository in `src/repositories/{mock,api}/insight.repository.ts` (`add` guardrail-checked, `list` excludes dismissed, `dismiss`)
- [X] T032 [US3] Generate Insights on completion via the `insights` service and persist them (FR-010/012)
- [X] T033 [P] [US3] `InsightCard` component (informational framing + dismiss) in `src/features/daily-checkin/components/InsightCard.tsx`
- [X] T034 [US3] Show Insights on the result screen `app/(daily)/result.tsx` (FR-010/013)

**Checkpoint**: US1 + US2 + US3 — guidance feels guiding.

---

## Phase 6: User Story 4 - Safety first & offline (Priority: P1)

**Goal**: Crisis screening ahead of the check-in; full offline check-in with on-device score and
replay-safe sync (no duplicate day record).

**Independent Test**: A crisis phrase surfaces resources before continuing; offline check-in
completes with an on-device score and syncs exactly once on reconnect.

### Tests for User Story 4 (mandatory)

- [X] T035 [P] [US4] Integration test: crisis during check-in surfaces resources before continuing in `tests/integration/daily-safety.test.ts` (SC-007, FR-019/020)
- [X] T036 [P] [US4] Integration test: offline check-in → on-device score → sync exactly once (no duplicate day) in `tests/integration/daily-offline.test.ts` (SC-008, FR-022/023)

### Implementation for User Story 4

- [X] T037 [US4] Ensure the daily flow runs `SafetyService` on every patient turn before normal flow (reuse via ConversationRepository) and surfaces resources ahead of the check-in in `src/features/daily-checkin/hooks/useDailyCheckin.ts` + a reused SafetyResources surface (FR-019/020)
- [X] T038 [US4] Route all new mutations (check-in, score, health events, insights) through the shared `SyncQueue` with `clientMutationId`; ensure one-per-day is replay-safe (FR-023)
- [X] T039 [US4] Diagnosis-request handling in the daily flow: decline + reframe + point to provider via `guardrails` (FR-021)

**Checkpoint**: all four stories independently functional.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T040 [P] Run `quickstart.md` scenarios (12) and record results
- [X] T041 [P] Extend the architecture-invariant guard to `app/(daily)` (screens import repos only via the registry) in `tests/unit/architecture.test.ts`
- [ ] T042 [P] Accessibility pass on `app/(daily)/` screens
- [X] T043 Privacy-review addendum for daily data (symptoms, score) in `specs/002-daily-checkin/checklists/privacy-review.md`
- [X] T044 [P] Feature README for `specs/002-daily-checkin/`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2, blocks all stories)** → **User Stories** → **Polish**.
- US1 (P1) is the MVP; US2 (P1) builds on US1's completion hook; US3 (P2) adds insights; US4 (P1)
  hardens safety/offline across the flow. US2/US3/US4 each independently testable after Foundational.
- **Within a story**: contracts before impls; Mock before/with API stub; repositories/services
  before hook; hook before screens. Mandated tests (US4, scoring, insights, parity) written to fail first.

### Parallel Opportunities

- Foundational: T004, T006, T007, T008, T009, T010, T013, T014 in parallel (distinct files).
- Per story, `[P]` tasks touch distinct files; with capacity US2/US3/US4 can proceed in parallel
  once Foundational lands.

---

## Parallel Example: User Story 1

```bash
Task: "Unit test scoring in tests/unit/scoring.test.ts"
Task: "Integration test check-in→score in tests/integration/daily-checkin.test.ts"
Task: "ScoreCard component in src/features/daily-checkin/components/ScoreCard.tsx"
Task: "API DailyCheckin stub in src/repositories/api/daily-checkin.repository.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

Setup → Foundational → US1 → **stop & validate** the check-in + Daily Score. This is the demoable
daily loop.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. + US1 → check-in produces an on-device Daily Score (MVP).
3. + US2 → check-ins grow the Living Record (symptoms, stored score).
4. + US3 → informational Insights.
5. + US4 → safety-first + offline hardening.
6. Polish.

### Constitution guardrails baked into tasks

- **III** (informational): scoring/insights framed non-diagnostic; insights guardrail-checked (T006/T030/T032).
- **IV** (safety): T035, T037 make safety-first mandatory and tested.
- **VI/II/VII** (Living Record/ownership/consent): T025, T026–T029 enforce consent-gated enrichment.
- **VIII** (offline): T036, T038 make offline + replay-safe sync mandatory and tested.
- **IX** (API-first): T015, T041 enforce Mock≡API parity + the no-direct-import invariant.

---

## Notes

- [P] = different files, no incomplete-task dependency.
- Every user-story task carries its [US#] label for traceability to `spec.md`.
- Reuses feature-001 foundations wholesale (FR-024) — no re-implementation of safety/consent/sync/UI tokens.
