# Privacy & Safety Review — Daily Guidance & Daily Check-in

**Purpose**: Constitution-mandated review for a feature that captures daily health signals and
computes a wellness score. Addendum to
[`specs/001-conversational-onboarding/checklists/privacy-review.md`](../../001-conversational-onboarding/checklists/privacy-review.md);
covers only what's new in feature 002.

**Reviewed**: 2026-07-08 · **Feature**: `specs/002-daily-checkin/`

## Privacy by design (Principle VII)

- [x] **Minimal collection** — the check-in captures only mood/energy/sleep/symptoms/notes; no
  new fields beyond what the spec calls for.
- [x] **Consent-gated writes** — `DailyCheckinRepository.update` drops symptoms/notes without
  `store_health_data` consent; `HealthEventRepository.add` is fail-closed via the shared consent
  gate. Verified by `daily-enrichment.test.ts`.
- [x] **On-device computation** — the Daily Score is computed locally (`services/scoring`); no
  score is ever computed server-side, so it's available offline and nothing health-derived need
  leave the device to produce it.
- [ ] **Encryption at rest** — inherits the feature-001 gap: in-memory store today, encrypted
  `expo-sqlite` required before real patient data (unchanged status).

## Data ownership (Principle II)

- [x] **Correctable** — `HealthEventRepository.correct` supersedes prior values (FR-017).
- [x] **Attributed & timestamped** — every Health Event and score carries `source`/`occurredAt`/
  `computedAt`.
- [ ] **Historical browsing UI** — deferred by design (analysis finding V1): today's result screen
  is the only view built here; a dedicated history/browse view belongs to the Pillar 3 Living
  Record feature. Data is fully queryable (`list()`) in the meantime.

## Informational, never diagnostic (Principle III)

- [x] **Score framed as a wellness indicator** — `ScoreCard` always renders the disclaimer;
  `DailyScore.disclaimerShown` defaults `true`.
- [x] **Insights guardrail-checked** — `InsightRepository.add` rejects any body that fails
  `guardrails.inspect()`; verified by `insights.test.ts`.
- [x] **Diagnosis requests reframed** — same `guardrails.detectDiagnosisRequest` reuse as
  onboarding; verified by `daily-safety.test.ts`.

## Safety over engagement (Principle IV)

- [x] **Safety screened first** — every check-in answer is screened by the shared `SafetyService`
  before normal flow; verified by `daily-safety.test.ts` (explicit + ambiguous signals).
- [x] **No streaks/pressure** — the check-in has no gamification; one-per-day is a data
  constraint, not an engagement mechanic.

## Offline-first (Principle VIII)

- [x] **Fully local** — check-in, scoring, and insight generation all run against local storage;
  verified by `daily-offline.test.ts`.
- [x] **Replay-safe, no duplicate day** — idempotent mutation replay and unique `(patientId, date)`
  keys prevent duplicate check-ins/scores on reconnect; verified by `daily-offline.test.ts`.

## Known simplification (documented, not hidden)

- The daily check-in does **not** persist a full `Conversation`/`ConversationTurn` history (unlike
  onboarding); the in-progress transcript lives only in the Zustand UI store. Safety and guardrails
  are still applied to every message via the shared services — only the durable turn-by-turn
  conversation record is not built for this MVP slice. Revisit if a physician-briefing or audit
  need requires the full transcript.
