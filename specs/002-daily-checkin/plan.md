# Implementation Plan: Daily Guidance & Daily Check-in

**Branch**: `002-daily-checkin` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-daily-checkin/spec.md`

## Summary

Deliver VITA's daily loop (Pillar 2): a brief, conversational **daily check-in** that produces an
informational **Daily Score** (band + component breakdown) computed on-device, surfaces
informational **Insights**, enriches the **Living Record** (symptoms → Health Events; check-in +
score stored), screens for safety first, and enforces one check-in per local calendar day — all
offline-first.

**Technical approach**: Extend the existing onboarding architecture, not duplicate it. Reuse the
Repository layer + registry, `SafetyService`, `guardrails`, the fail-closed consent gate, the sync
queue, and the NativeWind design tokens. Add four new repositories (DailyCheckin, HealthEvent,
Insight, DailyScore) with Mock + API-stub impls behind feature flags (Principle IX), plus two pure
on-device services: a **scoring service** (transparent heuristic → Daily Score) and an **insights
service** (rule-based, informational, guardrail-checked). The check-in reuses the
`Conversation(type=daily_checkin)` entity and the adaptive-flow pattern with a daily prompt set.
New Expo Router screens live under `app/(daily)/`; screens import only via the registry.

## Technical Context

**Language/Version**: TypeScript 5.x/6.x (strict), React Native via Expo SDK 57 (RN 0.86, React 19)

**Primary Dependencies**: Expo Router, Zustand, TanStack Query, React Hook Form, Zod, NativeWind
(all already in the project) — no new runtime dependencies expected.

**Storage**: On-device, offline-first — same encrypted `expo-sqlite` (production) / in-memory
(current) store behind the `CollectionStore` abstraction; secrets in `expo-secure-store`.

**Testing**: Jest (30) + ts-jest logic suites (scoring, insights, one-per-day, offline/sync,
contract parity, safety) — the always-green project established in feature 001.

**Target Platform**: iOS 15+ / Android (Expo managed); Spanish-first (`es`).

**Project Type**: Mobile application (client only; backend deferred).

**Performance Goals**: Check-in completes in under 2 minutes (SC-002); Daily Score computed
instantly on-device; 60 fps conversational UI.

**Constraints**: One completed check-in per patient per local calendar day (FR-004); on-device
score (FR-009); consent-gated health writes (FR-018); safety screened first (FR-019); replay-safe
offline sync (FR-023); no diagnostic framing (FR-008/011); screens unchanged on Mock→API (IX).

**Scale/Scope**: One feature, ~4–6 screens/steps, 4 new repositories + 2 services, reusing ~all of
the feature-001 foundation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | How this plan complies | Status |
|---|-----------|------------------------|--------|
| I | Companion, not provider | Reuses role framing/content; daily copy stays companion-voiced | ✅ PASS |
| II | Patient data ownership | Check-in/score/events are patient-owned, viewable, correctable, exportable via existing LivingRecord/repository patterns | ✅ PASS |
| III | Informational, never diagnostic | Daily Score labeled a wellness indicator; Insights pass the `guardrails` check; no clinical assertions | ✅ PASS |
| IV | Safety over engagement | Reuses `SafetyService` on every patient turn before flow; crisis resources ahead of the check-in | ✅ PASS |
| V | Human conversation, not a form | Adaptive daily flow, one prompt at a time; no structured form | ✅ PASS |
| VI | Every interaction enriches the Living Record | Symptoms→HealthEvents; check-in + Daily Score stored, attributed, timestamped | ✅ PASS |
| VII | Privacy by design | Consent-gated writes; minimal collection; encrypted local store; on-device score | ✅ PASS |
| VIII | Offline-first | Check-in + score work offline; mutations drain via the durable sync queue, replay-safe | ✅ PASS |
| IX | API-first architecture | New repos are Zod-typed contracts with Mock + API impls behind flags; logic behind repositories/services | ✅ PASS |
| X | Four-pillar value test | Serves Pillar 2 (daily guidance); enriches Pillar 3 (Living Record) | ✅ PASS |

**Gate result**: PASS. No violations. The design maximizes reuse of feature-001 foundations
(explicit requirement FR-024), so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-daily-checkin/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (repository interface contracts)
│   ├── README.md
│   ├── daily-checkin.contract.md
│   ├── daily-score.contract.md
│   ├── health-event.contract.md
│   └── insight.contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root) — additive to feature 001

```text
app/
└── (daily)/                          # new Expo Router group
    ├── _layout.tsx
    ├── checkin.tsx                    # the daily conversational check-in (V, IV)
    └── result.tsx                     # Daily Score + Insights (III, VI)

src/
├── features/daily-checkin/
│   ├── components/                    # ScoreCard, InsightCard, DayGate banner
│   ├── hooks/                         # useDailyCheckin
│   ├── flow/                          # daily prompt set + adaptive selection
│   └── content/                       # daily companion copy (es)
├── services/
│   ├── scoring/                       # on-device Daily Score heuristic (FR-006/009)
│   └── insights/                      # rule-based, guardrail-checked Insights (FR-010–014)
├── repositories/
│   ├── contracts/                     # + daily-checkin, daily-score, health-event, insight
│   ├── mock/                          # + mock impls (one-per-day guard, consent-gated writes)
│   ├── api/                           # + api stubs conforming to openapi.yaml
│   └── index.ts                       # registry extended with the new repositories
└── stores/                            # + daily-checkin UI store (Zustand)

tests/
├── unit/                              # scoring, insights, one-per-day, day-boundary
├── contract/                          # Mock ≡ API parity for the 4 new repos
└── integration/                       # full check-in → score + insights + record enrichment; safety; offline
```

**Structure Decision**: Additive. New routes under `app/(daily)/` and a `src/features/daily-checkin/`
module, plus four repositories and two on-device services. Everything flows through the existing
registry and reuses `SafetyService`/`guardrails`/consent-gate/sync-queue/design-tokens — screens
import only from `repositories/contracts` + the registry, preserving the Mock→API swap guarantee (IX).

## Complexity Tracking

> No constitution violations. Reuse of the feature-001 foundation is mandated (FR-024); nothing to
> justify here.
