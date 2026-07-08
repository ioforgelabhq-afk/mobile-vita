# Phase 0 Research: Conversational Onboarding

All items below were resolved from the user-provided technical direction, the feature spec, and
the constitution. No open `NEEDS CLARIFICATION` remain.

## D1. Repository layer with Mock + API implementations behind feature flags

- **Decision**: Every data capability is defined as a TypeScript interface in
  `src/repositories/contracts/`, typed by Zod schemas. Each interface has two implementations —
  `mock/` (default for the MVP) and `api/` (stubs that will call the real backend). A registry
  (`src/repositories/index.ts`) resolves the active implementation per repository from feature
  flags. Screens and hooks import interfaces only.
- **Rationale**: Directly satisfies Constitution Principle IX (API-first) and the user's
  requirement that Mock → API replacement not touch screens. Zod schemas double as the contract
  the future backend must honor and as runtime validation at the boundary.
- **Alternatives considered**: (a) Call `fetch`/`axios` directly in components — rejected: leaks
  networking into UI, violates IX, blocks offline. (b) A single service singleton without a
  swap mechanism — rejected: no clean Mock/API switch. (c) Full dependency-injection framework
  — rejected: overkill for MVP; a typed registry + React context is sufficient.

## D2. Server-state vs client-state boundary (TanStack Query + Zustand)

- **Decision**: TanStack Query owns all async/"server" state and always calls repositories
  (never raw fetch). Zustand owns ephemeral client/UI state: current conversation step, draft
  answers, in-progress consent selections, and session flags. React Hook Form + Zod own the one
  explicit structured form (granular consent).
- **Rationale**: Clear separation keeps screens declarative; Query gives caching, retries, and
  persistence for offline; Zustand is lightweight for conversation flow. RHF+Zod gives validated
  consent capture without turning the whole experience into a form (Principle V limits forms to
  the consent step only).
- **Alternatives considered**: Putting everything in Zustand (loses Query's async ergonomics and
  offline persistence); Redux Toolkit (heavier than needed).

## D3. Offline-first storage and sync

- **Decision**: `expo-sqlite` (encrypted) is the durable local store for Living Record,
  conversation, and consent. `expo-secure-store` holds the encryption key and any sensitive
  small values. TanStack Query is configured with a persister so cached reads survive restarts.
  A durable **outbound sync queue** (`src/lib/sync/`) records mutations; while only Mock repos
  exist it effectively no-ops/holds, and the API repositories will drain it when a backend and
  connectivity are present.
- **Rationale**: Principle VIII requires the core flow to work offline and sync later without
  loss or duplication (FR-020, FR-021). A queue with idempotency keys prevents duplicate Living
  Record entries on replay.
- **Alternatives considered**: AsyncStorage only (no query/relational capability, weaker for
  categorized entries); WatermelonDB (powerful but heavier than MVP needs); no encryption
  (violates VII + HIPAA/GDPR).

## D4. Identity: local-first, account optional (from clarification Q1)

- **Decision**: Onboarding starts with **no** account or auth (FR-020a). A local anonymous
  patient identity is created on-device. `AuthRepository` is mocked; account creation/linking is
  offered after onboarding to enable future sync (FR-020b).
- **Rationale**: Aligns offline-first (VIII) and conversation-not-form (V); avoids a sign-up
  wall before the patient feels heard.
- **Alternatives considered**: Require account up front (rejected per clarification and V);
  real auth now (rejected — backend not implemented, auth is mocked).

## D5. Crisis/safety detection (from clarification Q2)

- **Decision**: A client-side `SafetyService` inspects every patient message before normal
  onboarding flow. It matches **explicit statements + concerning intent/keyword patterns**
  (self-harm, medical emergency) using a curated, versioned rule set. On a hit it surfaces
  safety resources and escalation ahead of any further onboarding step (FR-017, FR-017a,
  FR-018), and errs toward surfacing resources on ambiguous signals (FR-019). It performs **no**
  clinical triage or diagnosis.
- **Rationale**: Principle IV is absolute and must hold with no backend; a deterministic on-
  device detector guarantees the safety gate works offline and is unit-testable.
- **Alternatives considered**: Server/LLM risk classification (rejected — no backend, and
  reduces testability/offline guarantee for MVP); explicit-only detection (rejected per
  clarification — misses ambiguous but concerning phrasing).

## D6. Companion conversation without a backend/LLM

- **Decision**: The "AI companion" for the MVP is a deterministic, adaptive **flow engine**
  (`src/features/onboarding/flow/`) that selects the next prompt from prior answers, backed by a
  curated content set. It is exposed via `ConversationRepository` (Mock now, API later), so a
  real LLM-backed service can replace the mock without screen changes.
- **Rationale**: Delivers the human-feeling, adaptive experience (Principle V) and seeds the
  Living Record (VI) today, while keeping the seam for a real backend (IX). Guardrails ensure
  responses stay informational, never diagnostic (III).
- **Alternatives considered**: Calling an LLM directly from the client now (rejected — no
  backend, and would embed provider/networking in the client against IX); a static linear script
  (rejected — fails the adaptive/"not a form" requirement).

## D7. Compliance posture: HIPAA + GDPR (from clarification Q3)

- **Decision**: Design the data layer to satisfy both from the start: encrypted at rest, minimal
  collection, an auditable/recorded **Consent Record** with granular grants (FR-013, FR-016a),
  and data-subject rights (access/export/delete/revoke) modeled in the repositories even though
  the export/delete UI may be surfaced app-wide. No PHI leaves the device until a compliant
  backend exists.
- **Rationale**: Principles II and VII plus the clarification. Building consent auditing and
  rights into the contracts now avoids costly retrofitting (VII: privacy by design).
- **Alternatives considered**: GDPR-only or best-effort (rejected per clarification); deferring
  consent auditing (rejected — retrofit risk).

## D8. Content, copy, and guardrails (Principles I & III)

- **Decision**: A dedicated content module (`src/features/onboarding/content/`) holds all
  companion copy, the role-disclosure text, and the safety-resource content. A `guardrails`
  service validates that generated/selected companion responses avoid diagnostic phrasing and
  include informational framing where relevant.
- **Rationale**: Centralizing copy makes the companion-not-provider and informational-not-
  diagnostic guarantees reviewable and testable rather than scattered across screens.
- **Alternatives considered**: Inline strings per screen (rejected — unreviewable, easy to
  drift from Principles I/III).
