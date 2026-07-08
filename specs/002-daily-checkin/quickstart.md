# Quickstart & Validation: Daily Guidance & Daily Check-in

How to run and validate the daily check-in (against Mock repositories). Implementation lives in
`tasks.md` / the implement phase. Builds on the feature-001 app; no new setup beyond `npm install`.

## Prerequisites

- The onboarding feature is present (repository layer, services, design tokens).
- Node LTS + Expo (`npx expo`), iOS Simulator / Android emulator or Expo Go.

## Setup & run

```bash
npm install
npx expo start
```

All new repositories default to `mock`. Onboard once (or reuse an existing local identity with
`store_health_data` consent), then open the daily check-in.

## Validation scenarios (map to Success Criteria)

Run manually and/or via `tests/`:

| # | Scenario | Expected | Spec ref |
|---|----------|----------|----------|
| 1 | Complete a daily check-in | Conversational, one prompt at a time; ends with a Daily Score (band + breakdown) | SC-001/002/004, FR-001/006/007 |
| 2 | Read the score | Labeled an informational wellness indicator; no diagnostic language | SC-009, FR-008 |
| 3 | See insights | ≥1 relevant Insight with informational framing; dismiss works | SC-005, FR-010/012/013 |
| 4 | Mention a symptom | A Health Event appears in the record, attributed to the check-in | SC-010, FR-015 |
| 5 | Record stored | Check-in + Daily Score viewable and correctable | FR-016/017 |
| 6 | Check in again same day | Shows today's result; no second check-in created | SC-006, FR-004 |
| 7 | Quit mid-check-in, reopen same day | Resumes; no duplicate day record | FR-005 |
| 8 | Type a crisis phrase | Safety resources surface before continuing | SC-007, FR-019/020 |
| 9 | Airplane mode | Check-in completes; Daily Score computed on-device; syncs once on reconnect | SC-008, FR-009/022/023 |
| 10 | No `store_health_data` consent | Score shows; health data not persisted; patient informed | FR-018 |
| 11 | First-ever check-in (no history) | Insight still shown (education/encouragement, not a trend) | FR-014 |
| 12 | Ask for a diagnosis | Companion declines, reframes as informational, points to a provider | FR-021 |

## Architecture invariants to verify

- Screens import repositories only via `@/repositories` (registry) — the architecture test extends
  to the new screens (Principle IX).
- `tests/contract/` proves the 4 new repos' Mock ≡ API surfaces.
- `scoring` and `insights` are pure/deterministic (unit-tested; run in the logic suite).
- Flipping `mock`→`api` for the new repos compiles and runs with no screen changes.

## References

- Contracts: [contracts/](./contracts/) · Data model: [data-model.md](./data-model.md) ·
  Decisions: [research.md](./research.md)
- Reused foundation: `specs/001-conversational-onboarding/`
