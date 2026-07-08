# Feature: Daily Guidance & Daily Check-in

VITA's daily loop — a brief conversational check-in that produces an on-device, informational
**Daily Score** and **Insights**, and enriches the **Living Record**. Serves **Pillar 2 (better
daily guidance)**; grows **Pillar 3 (Living Record)**. Reuses the onboarding foundation (FR-024).

## Status

All four user stories implemented against the mock repository layer. **39/44 tasks complete** ·
**67 tests across 17 suites** · iOS Metro bundle verified.

## The daily loop

```
Check-in (one prompt at a time) → Daily Score (band + breakdown) → Insights (dismissible)
```
One check-in per patient per local calendar day; symptoms mentioned become Health Events.

## Spec Kit artifacts

| Doc | What |
|-----|------|
| [spec.md](./spec.md) | Requirements, user stories, success criteria |
| [plan.md](./plan.md) | Technical plan + Constitution Check |
| [research.md](./research.md) | Phase 0 decisions (scoring heuristic, insights rules, one-per-day) |
| [data-model.md](./data-model.md) | Feature entities (DailyCheckin, DailyScore, HealthEvent, Insight) |
| [contracts/](./contracts/) | Repository interface contracts |
| [quickstart.md](./quickstart.md) | Run + validation scenarios |
| [tasks.md](./tasks.md) | Dependency-ordered task list (progress tracked here) |
| [checklists/requirements.md](./checklists/requirements.md) | Spec quality checklist |
| [checklists/privacy-review.md](./checklists/privacy-review.md) | Privacy & safety review addendum |

Reuses (do not duplicate): the repository registry, `SafetyService`, `guardrails`, the consent
gate, the sync queue, `ConversationRepository`'s patterns, and the design tokens from
[`specs/001-conversational-onboarding/`](../001-conversational-onboarding/).

## Architecture

Two new pure, deterministic on-device services:
- `src/services/scoring/` — transparent weighted heuristic → `{ score, band, components[] }`,
  renormalized for sparse check-ins. Not a clinical instrument (Principle III).
- `src/services/insights/` — rule-based Insight generation, every body guardrail-checked before
  it can be shown.

Four new repositories (Zod contracts + Mock + API stub, behind feature flags): `DailyCheckin`,
`DailyScore`, `HealthEvent`, `Insight` — registered in `src/repositories/index.ts` alongside the
feature-001 repositories.

Key code:
- Screens: [`app/(daily)/`](../../app/(daily)) (`checkin.tsx`, `result.tsx`)
- Feature: [`src/features/daily-checkin/`](../../src/features/daily-checkin) (runner, hook, flow, components, content)
- Services: [`src/services/{scoring,insights}/`](../../src/services)

## Known simplification

The check-in does not persist a full `Conversation`/`ConversationTurn` history — the transcript
lives only in the Zustand UI store for the session. Safety and guardrails still run on every
message via the shared services. See the privacy-review addendum.

## Run & test

```bash
npm install
npx expo start          # onboarded patients land in the daily check-in
npm test                # 67 logic tests
npm run lint
```

## Known gaps (see tasks.md)

- Encrypted `expo-sqlite` storage — same pre-ship gap as feature 001.
- Daily-history browsing UI — deferred to the Pillar 3 Living Record feature (analysis finding V1).
- Manual quickstart run + accessibility audit require a simulator (T040, T042).
