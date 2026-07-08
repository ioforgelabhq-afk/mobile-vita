# Phase 0 Research: Daily Guidance & Daily Check-in

Resolved from the spec, the constitution, and the established feature-001 architecture. No open
`NEEDS CLARIFICATION` remain.

## D1. Reuse the onboarding foundation (FR-024)

- **Decision**: Do not build new infrastructure. Reuse the Repository registry + `CollectionStore`,
  `SafetyService`, `guardrails`, the fail-closed consent gate (`services/consent-gate`), the durable
  `SyncQueue`, and the NativeWind design tokens. This feature only adds domain repositories,
  two on-device services, a feature module, and screens.
- **Rationale**: Constitution IX + the spec's explicit reuse requirement; avoids drift in safety,
  consent, and sync behavior that must be identical across features.
- **Alternatives considered**: A parallel daily-specific stack — rejected (duplication, divergence
  risk, violates FR-024).

## D2. On-device Daily Score heuristic (FR-006/007/009)

- **Decision**: A pure `scoring` service computes `score` (0–100) as a transparent weighted blend of
  the check-in inputs, and derives a `band` (low <40, moderate 40–64, good 65–84, great ≥85). Each
  contributing input is returned as a `ScoreComponent { key, label, weight, value }` so the breakdown
  is explainable. Missing inputs are skipped and remaining weights renormalized (supports sparse
  check-ins, FR-003).
- **Rationale**: On-device (works offline, FR-009), deterministic (testable), transparent
  (informational, not a clinical instrument — III). Weights are a constant the team can tune.
- **Alternatives considered**: Server/ML scoring (rejected — no backend, opacity conflicts with III
  and offline); single opaque number without breakdown (rejected — FR-007).
- **Illustrative default weights** (tunable): mood 0.40, sleep 0.25, energy 0.20, symptom-load 0.15
  (symptom-load lowers the score). Documented in the scoring service; not a clinical claim.

## D3. Rule-based, guardrail-checked Insights (FR-010–014)

- **Decision**: A pure `insights` service generates 1–3 Insights from the current score + recent
  history, choosing a category (`trend`, `education`, `encouragement`, `reminder_suggestion`). Every
  generated body is passed through `guardrails.inspect()`; anything that reads as diagnostic is
  dropped/replaced. With little/no history, trend rules are skipped in favor of an education or
  encouragement Insight (FR-014). Each Insight carries `disclaimerShown` and is dismissible.
- **Rationale**: Deterministic + testable, offline, and structurally prevents diagnostic content
  (III). Reuses the existing guardrails service (D1).
- **Alternatives considered**: LLM-generated insights now (rejected — no backend; harder to keep
  non-diagnostic deterministically); no insights (rejected — FR-010, weakens Pillar 2 value).

## D4. One-per-day enforcement (FR-004/005) & day boundary

- **Decision**: DailyCheckin and DailyScore are keyed uniquely by `(patientId, date)` where `date` is
  the patient's **local** calendar day (`YYYY-MM-DD` from the device). `DailyCheckinRepository.forDate`
  returns the day's record if present; `startOrResume` returns an in-progress check-in for today
  (resume) or creates one, never a second completed record for the day.
- **Rationale**: Matches FR-004/005 and the domain model's unique `(patientId, date)` constraint;
  local-day is the intuitive user expectation.
- **Alternatives considered**: UTC day (rejected — confusing near midnight for users); server-assigned
  day (rejected — no backend, breaks offline).

## D5. Reuse Conversation(type=daily_checkin) + adaptive flow (FR-001/002/019)

- **Decision**: The check-in is a `Conversation` with `type: 'daily_checkin'`, driven by a daily
  prompt set in `features/daily-checkin/flow/` using the same adaptive-advance pattern as onboarding.
  `sendPatientMessage` runs `SafetyService` first (identical safety-first ordering), then extracts
  structured signals (mood/energy/sleep/symptoms/notes) that feed scoring and Health Events.
- **Rationale**: Reuses the proven conversation model + safety gate (IV, V), and keeps a single
  conversation abstraction. Symptom mentions become Health Events (VI).
- **Alternatives considered**: A separate check-in-specific dialogue type (rejected — duplicates the
  Conversation/turn/safety machinery).

## D6. Living Record enrichment & consent gating (FR-015–018)

- **Decision**: On completion, the check-in persists: the DailyCheckin record, its DailyScore, and a
  HealthEvent per reported symptom (source `daily_checkin`). All health-bearing writes pass the
  fail-closed consent gate (`requireConsent('store_health_data')`); without consent the check-in still
  runs and shows a score, but nothing is persisted and the patient is told (edge case). Corrections
  supersede prior values (reusing the LivingRecord correction pattern).
- **Rationale**: Principles II, VI, VII; consistent with feature-001 gating (verified by its tests).
- **Alternatives considered**: Persisting without consent (rejected — violates VII/FR-018).

## D7. Offline-first & replay-safe sync (FR-022/023)

- **Decision**: All new mutations carry a `clientMutationId` and enqueue on the shared `SyncQueue`;
  idempotent replay prevents duplicates, including a duplicate day record. The score is computed
  locally so results show with no connectivity.
- **Rationale**: Principle VIII; reuses the queue + idempotency proven in feature 001.
- **Alternatives considered**: Compute score server-side (rejected — offline + III).
