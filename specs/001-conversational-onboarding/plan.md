# Implementation Plan: Conversational Onboarding

**Branch**: `001-conversational-onboarding` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-conversational-onboarding/spec.md`

## Summary

Deliver VITA's first-run experience: a warm, adaptive conversation that gets to know the
patient, seeds a categorized Living Record, establishes VITA's companion (not provider) role
and informational (not diagnostic) boundaries, captures granular HIPAA/GDPR-grade consent, puts
safety first on crisis signals, and works fully offline with an optional account for later sync.

**Technical approach**: A React Native + Expo (TypeScript) app using Expo Router for
navigation. Because **no backend exists yet**, all data access flows through a **Repository
layer** where every repository ships both a **Mock** and an **API** implementation, selected at
runtime by **feature flags**. Zod schemas are the single source of truth for every repository
contract (they are the "API contract" the future backend must honor). TanStack Query manages
async/server-state through repositories (never raw fetch in screens); Zustand holds ephemeral
UI/conversation state; React Hook Form + Zod validate structured input (consent). NativeWind
handles styling. Auth is a mocked repository. Screens depend only on repository interfaces and
query hooks, so swapping Mock → API later requires no screen changes.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React Native via Expo SDK (latest stable)

**Primary Dependencies**: Expo, Expo Router, Zustand, TanStack Query (React Query), React Hook
Form, Zod, NativeWind

**Storage**: On-device, offline-first. `expo-secure-store` for secrets/encryption keys and
sensitive small values; `expo-sqlite` (encrypted) for the Living Record, conversation, consent,
and a durable outbound **sync queue**. No remote persistence until the backend exists.

**Testing**: Jest + React Native Testing Library (unit/component); contract tests that assert
Mock and API repositories satisfy the same Zod-typed interface; integration tests driving the
onboarding flow end-to-end against Mock repositories.

**Target Platform**: iOS 15+ and Android (Expo managed workflow); single primary language/locale
for MVP.

**Project Type**: Mobile application (client only for this feature; backend deferred).

**Performance Goals**: 60 fps conversational UI; companion responses feel immediate (mock
latency simulated ≤300 ms); typical onboarding completes in under 10 minutes (SC-008).

**Constraints**: Fully offline-capable core flow (VIII); health data encrypted at rest (VII,
HIPAA/GDPR); no account/auth required to start (FR-020a); screens MUST NOT change when Mock is
replaced by API (repository indirection); no diagnostic content generated (III).

**Scale/Scope**: Single feature, ~6–9 onboarding screens/steps, ~5 repositories (Auth,
Patient, Conversation, LivingRecord, Consent) plus Safety and FeatureFlag services.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | How this plan complies | Status |
|---|-----------|------------------------|--------|
| I | Companion, not provider | Dedicated content/copy layer with companion framing; a role-disclosure step; no provider language | ✅ PASS |
| II | Patient data ownership | Local-first store the patient controls; view/edit/delete of entries; export designed into data layer | ✅ PASS |
| III | Informational, never diagnostic | Companion responses are scripted/guarded mock content; a guardrail service blocks diagnostic phrasing; no clinical inference | ✅ PASS |
| IV | Safety over engagement | `SafetyService` runs on every patient message before normal flow; crisis → resources ahead of onboarding; no engagement dark patterns | ✅ PASS |
| V | Human conversation, not a form | Conversation-driven UI, one prompt at a time, adaptive next-step selection; RHF forms used only for the explicit consent step | ✅ PASS |
| VI | Every interaction enriches the Living Record | Meaningful turns produce categorized, timestamped, attributed, editable entries via `LivingRecordRepository` | ✅ PASS |
| VII | Privacy by design | Minimal collection; encrypted at-rest storage; consent-gated writes; secrets in secure store | ✅ PASS |
| VIII | Offline-first | Everything works against local store; durable sync queue drains when a real API + connectivity exist | ✅ PASS |
| IX | API-first architecture | Zod-typed repository interfaces ARE the API contract; Mock + API implementations behind feature flags; logic lives behind repositories, not in screens | ✅ PASS |
| X | Four-pillar value test | Feature serves Pillar 1 (better onboarding) and seeds Pillar 3 (Living Record) | ✅ PASS |

**Gate result**: PASS. No violations. The Repository + Mock/API pattern is explicitly mandated
by the API-first principle and the "backend not implemented" constraint, so it is not
complexity to justify — it is the required design. Complexity Tracking is therefore empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-conversational-onboarding/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (repository interface contracts)
│   ├── README.md
│   ├── auth.contract.md
│   ├── patient.contract.md
│   ├── conversation.contract.md
│   ├── living-record.contract.md
│   └── consent.contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/                                 # Expo Router routes (thin; delegate to features)
├── _layout.tsx
├── index.tsx                        # entry → routes to onboarding if not completed
└── (onboarding)/
    ├── _layout.tsx
    ├── welcome.tsx                  # companion intro + role disclosure (I, III)
    ├── consent.tsx                  # granular consent (RHF + Zod) (II, VII)
    ├── conversation.tsx             # the adaptive chat (V, VI)
    ├── review.tsx                   # review/correct Living Record (II, VI)
    └── complete.tsx                 # confirmation + "ready for daily guidance" (FR-025)

src/
├── features/onboarding/
│   ├── components/                  # message bubbles, prompt input, consent controls
│   ├── hooks/                       # useOnboardingFlow, useConsent, etc.
│   ├── flow/                        # adaptive step selection (conversation orchestration)
│   └── content/                     # companion copy, disclosures, safety resources
├── repositories/
│   ├── contracts/                   # TS interfaces + Zod schemas (the API contract)
│   │   ├── auth.repository.ts
│   │   ├── patient.repository.ts
│   │   ├── conversation.repository.ts
│   │   ├── living-record.repository.ts
│   │   ├── consent.repository.ts
│   │   └── schemas.ts               # shared Zod models & DTOs
│   ├── mock/                        # Mock implementations (default for MVP)
│   ├── api/                         # API implementations (stubs honoring contracts)
│   └── index.ts                     # repository registry / DI resolver (flag-driven)
├── services/
│   ├── safety/                      # SafetyService: crisis detection (IV)
│   └── guardrails/                  # informational-not-diagnostic content guard (III)
├── stores/                          # Zustand: conversation/UI/session state
├── lib/
│   ├── query/                       # TanStack Query client + persistence
│   ├── storage/                     # encrypted SQLite + secure-store adapters (VII, VIII)
│   ├── sync/                        # durable outbound sync queue (VIII)
│   └── feature-flags/               # flag definitions + provider (Mock ↔ API)
└── ui/                              # NativeWind primitives / design tokens

tests/
├── contract/                        # Mock & API satisfy the same Zod-typed interface
├── integration/                     # onboarding flow end-to-end vs Mock repos
└── unit/                            # SafetyService, flow selection, stores, guardrails
```

**Structure Decision**: Single Expo mobile app. Expo Router routes under `app/` stay thin and
delegate to `src/features/onboarding`. The critical boundary is `src/repositories/`: screens and
hooks import **only** from `repositories/contracts` (interfaces) and reach implementations via
the flag-driven registry in `repositories/index.ts`. This guarantees Mock → API replacement
without touching screens (satisfies IX and the user's stated architecture requirement).

## Complexity Tracking

> No constitution violations. The Repository + Mock/API + feature-flag design is mandated by
> Principle IX and the "no backend" constraint, so there is nothing to justify here.
