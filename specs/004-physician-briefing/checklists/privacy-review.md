# Privacy & Safety Review — Physician Briefing

**Purpose**: Constitution-mandated review. Addendum to the feature 001–003 privacy reviews —
covers only what's new here. This is the first feature that persists new patient data
(`Physician`) since feature 002, and the first to gate an entire feature behind a specific
consent purpose (`share_with_physician`).

**Reviewed**: 2026-07-08 · **Feature**: `specs/004-physician-briefing/`

## New repository — justified (Principle IX)

- [x] **`PhysicianRepository` is the only new repository**, and it is justified in
  `plan.md`'s Complexity Tracking: physician contacts (name/specialty/organization/phone/
  email/notes) are new persisted patient data, not a view over existing repositories — unlike
  feature 003, which added zero repositories.
- [x] **Mock ≡ API parity enforced** — `tests/contract/repository-parity.test.ts` now includes
  `PhysicianRepository`, matching the pattern used for every other repository (Principle IX).
- [x] **Screens import only `repositories/contracts`** — `usePhysicians.ts` calls
  `physicianRepository()` from the registry, never `mock/` or `api/` directly. Covered by the
  existing `tests/unit/architecture.test.ts` guard (walks `app/` recursively; no changes needed
  since `app/(briefing)` is a new directory under the same walked root).
- [x] **Offline-first** — `MockPhysicianRepository` enqueues every mutation through the shared
  `syncQueue` with `clientMutationId`-based idempotency, identical to every other repository.

## Briefing composition is never persisted (research D2)

- [x] `BriefingDocument`/`BriefingSection`/`BriefingScope` (`src/services/briefing/types.ts`) are
  plain view models, generated fresh on each `generate()` call from feature 003's
  `loadItems`/`loadDailyHistory`. No new storage, no new entity. This keeps the feature's
  persistent footprint to exactly one repository (`Physician`), consistent with feature 003's
  "reuse over duplication" discipline.

## Informational, never diagnostic (Principle III)

- [x] Every briefing carries a fixed, non-removable disclaimer
  (`src/services/briefing/index.ts` → `DISCLAIMER`), verified by `tests/unit/briefing.test.ts`
  ("includes disclaimer").
- [x] Every entry/health-event line is guardrail-checked (`guardrails.inspect(line).ok`) before
  inclusion — a line that reads as diagnostic is silently omitted rather than surfaced, verified
  by the "omits diagnostic content" test.
- [x] Daily Score history keeps its informational framing in the briefing text itself
  ("indicador informativo"), not just in the UI — so the disclaimer travels with the data if this
  is ever exported/copied outside VITA in the future.

## Consent-gated sharing — fail-closed (Principles II/VII, FR-010–012)

- [x] `canGenerate`/`generate` check `hasConsent(patientId, 'share_with_physician')` — the
  **pre-existing** consent purpose defined in schemas since feature 001 but unused until now.
  No new consent purpose was introduced; no consent-schema changes were needed.
- [x] **Fail-closed by default**: `generate()` throws `ConsentRequiredError` when consent is
  absent — verified by "blocks without consent (fail-closed)".
- [x] **Granting unblocks, revoking re-blocks**: verified end-to-end by
  `tests/unit/briefing.test.ts` ("succeeds once granted" / "re-blocks after revoke"). The UI's
  `ConsentGate` (`src/features/briefing/components/ConsentGate.tsx`) explains why consent is
  needed and offers a single CTA to grant it — modeled on the onboarding consent-capture screen.
- [x] Granting consent for `share_with_physician` (`useBriefing.ts` → `grantConsent`) merges into
  the patient's existing consent record rather than overwriting other purposes' grants — verified
  by construction (reads `getConsentDefinition()` + the current record, only flips the one
  purpose, re-captures the full set).

## Scope controls don't leak excluded data (US4, FR-013/014)

- [x] Date-range and category-exclusion filters are applied **before** guardrail-checking and
  section assembly in `generate()`, so excluded/out-of-range items never enter the composed
  document at all (not merely hidden in the UI) — verified by "date range restricts" and
  "category exclusion works".

## Known deferral (consistent with feature 003's precedent)

- [x] The briefing is displayed in-app only; no share sheet / PDF export / physician delivery
  mechanism exists yet (research D6, deferred). This mirrors feature 003's decision to keep
  `exportAll()` as an in-app summary rather than add `expo-file-system`/`expo-sharing` — no new
  runtime dependencies were introduced by this feature either.
