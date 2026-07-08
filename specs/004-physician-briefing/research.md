# Phase 0 Research: Physician Briefing

Resolved from the spec, the constitution, and features 001–003's established architecture. No
open `NEEDS CLARIFICATION` remain.

## D1. One new repository, justified (FR-015/016)

- **Decision**: Introduce `PhysicianRepository` (contract + Mock + API stub), following the exact
  same pattern as every prior repository (Zod schema already exists in `docs/domain/domain-model.md`
  §10 and `docs/api/openapi.yaml`; only the client-side implementation is new).
- **Rationale**: Unlike feature 003, there is no existing repository that owns physician-contact
  data — it isn't an aggregation of something else. FR-016 requires the same Mock/API-behind-a-flag
  discipline as every other data type (Principle IX).
- **Alternatives considered**: Storing physicians as `LivingRecordEntry` with `category: 'other'` —
  rejected; physicians have a distinct structured shape (phone/email/specialty/`sharedViaConsent`)
  that doesn't fit the entry-correction UI or its category taxonomy (see plan's Complexity Tracking).

## D2. Briefing is composed, not persisted (FR-005–009)

- **Decision**: A pure `briefing` service (`composeBriefing`) takes already-loaded `RecordItem[]`
  (from feature 003's `loadItems`), `DailyHistoryPoint[]` (from `loadDailyHistory`), and an optional
  scope (date range / excluded categories), and returns a `BriefingDocument`: sections (entries,
  health events, daily history), a prominent disclaimer, and a generated timestamp. Nothing new is
  written to storage.
- **Rationale**: Keeps the feature's persisted footprint to exactly one new thing (Physician
  contacts). The briefing is inherently a point-in-time view for an external purpose, not something
  the patient needs to browse historically (unlike the Living Record itself) — regenerating on
  demand is simpler and avoids stale-briefing drift.
- **Alternatives considered**: Persisting generated briefings as a history — rejected as
  unnecessary scope; the patient can regenerate any time from current data (on-device, <5s, SC-004).

## D3. Every briefing body passes the informational guardrail (FR-007/009)

- **Decision**: Reuse `guardrails.inspect()` (from feature 001) on every free-text section of the
  composed briefing (entry/health-event content) before rendering; if anything fails, that item is
  omitted from the briefing with a note, rather than shown. The disclaimer banner is a fixed,
  reviewed string, always rendered first.
- **Rationale**: Reuses the proven mechanism from feature 001/002 rather than inventing new
  diagnostic-detection logic; guarantees FR-007 structurally, not just by convention.
- **Alternatives considered**: Trusting that source data is already "clean" (it is, since it's all
  been through onboarding/daily-checkin guardrails already) — still applying the check here is
  cheap defense-in-depth for content now being repurposed for an external audience.

## D4. Consent gate mirrors the existing fail-closed pattern (FR-010–012)

- **Decision**: Before composing a shareable briefing, call `hasConsent(patientId, 'share_with_physician')`
  (the existing fail-closed consent-gate service from feature 001). If false, the UI shows an
  explanation + a path to grant it (a lightweight consent-capture screen, reusing the pattern from
  onboarding's consent step) rather than generating anything. Revocation is already handled by the
  existing `ConsentRepository.revoke` — no new logic needed, just checking it again on each
  generation attempt (FR-012 falls out for free).
- **Rationale**: `share_with_physician` was defined in feature 001's schema but never checked
  anywhere until now — this is the first consumer. Reusing `hasConsent`/`requireConsent` keeps the
  gating behavior identical to every other consent-gated write/action in the app.
- **Alternatives considered**: A new physician-specific consent flag — rejected; FR-015 explicitly
  requires reusing the existing purpose, and inventing a second one would fragment consent state.

## D5. Scoping (date range / category exclusion) reuses feature 003's filter (FR-013/014)

- **Decision**: `composeBriefing` accepts the same `{ from?, to?, category? }`-shaped filter feature
  003's `filterItems` already takes, and calls it internally before composing sections. Category
  *exclusion* (vs. feature 003's category *inclusion* filter) is implemented as a thin wrapper:
  filter to "not this category" by inverting the existing single-category filter across the full
  category set.
- **Rationale**: No new filter logic; the exclusion framing in the spec is a UI/UX choice (patients
  think "leave this out"), not a different underlying mechanism.
- **Alternatives considered**: A separate exclusion-aware filter in `living-record-view` — rejected,
  unnecessary duplication when composing the inverse client-side is trivial and keeps feature 003's
  service untouched (no ripple risk to already-shipped, tested code).

## D6. No new sharing mechanism (deferred, same as feature 003)

- **Decision**: The generated briefing is displayed in-app (`app/(briefing)/generate.tsx`); actual
  transmission (share sheet, PDF export, email) is out of scope, consistent with feature 003's
  documented deferral of `expo-file-system`/`expo-sharing`.
- **Rationale**: Consistency with the established "no new dependencies without a clear need" pattern
  from this codebase; the value (an organized, consent-gated, informational document) is delivered
  without them.
- **Alternatives considered**: Adding `expo-sharing` now — rejected for this feature; flagged as a
  natural, isolated follow-up once both export (003) and briefing (004) want it.
