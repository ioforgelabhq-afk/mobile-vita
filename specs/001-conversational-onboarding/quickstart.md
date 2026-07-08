# Quickstart & Validation: Conversational Onboarding

This guide explains how to run the onboarding feature (against Mock repositories) and validate it
against the spec's success criteria. Implementation lives in `tasks.md` / the implement phase.

## Prerequisites

- Node LTS + a package manager (npm/pnpm/yarn)
- Expo CLI (`npx expo`)
- iOS Simulator and/or Android emulator (or Expo Go on a device)

## Setup

```bash
npm install
# Repositories default to Mock; no backend or env needed to run onboarding.
npx expo start
```

Feature flags default to `mock` for every repository (`src/lib/feature-flags/`). Onboarding runs
fully offline — you can disable networking on the simulator and it still works (Principle VIII).

## Run the flow

1. Launch the app → `app/index.tsx` routes a first-time patient into `(onboarding)/welcome`.
2. Proceed through: **welcome/role disclosure → consent → conversation → review → complete**.

## Validation scenarios (map to spec Success Criteria)

Run these manually and/or via `tests/integration/`:

| # | Scenario | Expected outcome | Spec ref |
|---|----------|------------------|----------|
| 1 | Complete a first conversation | No form-style intake shown; prompts appear one at a time; companion follow-ups reflect prior answers | SC-002, FR-001, FR-002 |
| 2 | Finish onboarding | Review screen shows categorized Living Record entries; each is editable/removable | SC-001, FR-005, FR-007 |
| 3 | Read the intro | Companion states it is a companion, not a provider, and info is not diagnostic | SC-006, FR-009, FR-010 |
| 4 | Consent step | Each purpose can be granted/declined individually; declining one still lets others proceed | SC-003, FR-013, FR-014 |
| 5 | Ask for a diagnosis mid-chat | Companion declines, reframes as informational, points to a provider | FR-011 |
| 6 | Type a crisis phrase | Safety resources surface **before** the next onboarding prompt | SC-004, FR-017, FR-017a, FR-018 |
| 7 | Airplane mode throughout | Conversation + capture work offline; on reconnect, data appears exactly once (no dupes) | SC-005, FR-020, FR-021 |
| 8 | Quit mid-onboarding, relaunch | Session resumes with prior entries intact; no re-asking everything | FR-023 |
| 9 | Relaunch after completion | Existing record recognized; not overwritten/duplicated | FR-024 |
| 10 | Find data rights | View/export/delete + revoke consent are discoverable | SC-007, FR-015 |

## Architecture invariants to verify

- **Screens never import from `repositories/mock` or `repositories/api`** — only from
  `repositories/contracts` and query hooks. Grep to confirm (this is the Mock→API swap guarantee,
  Principle IX).
- **`tests/contract/`** proves Mock and API implementations satisfy the same Zod-typed interface.
- Flipping a feature flag from `mock` to `api` compiles and runs with **no screen changes**
  (API impls may be stubs until the backend exists).

## References

- Contracts: [contracts/](./contracts/)
- Data model: [data-model.md](./data-model.md)
- Research decisions: [research.md](./research.md)
