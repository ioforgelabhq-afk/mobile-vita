# Feature: Physician Briefing

Lets a patient keep a list of physicians and generate a short, informational summary of their
Living Record to share at an appointment. Serves **Pillar 4 (physician briefing)** — the last of
VITA's four pillars.

## Status

All four user stories implemented. **30/32 tasks complete** (the 2 remaining — quickstart run,
accessibility pass — are simulator-dependent and left honestly unchecked). **93 tests across 20
suites** · iOS Metro bundle verified · 0 lint errors.

## What makes this feature different

**Exactly one new repository** (`PhysicianRepository`) — the first new repository since feature
002, and justified explicitly in `plan.md`'s Complexity Tracking: physician contacts are new
persisted patient data, not a view over existing data (unlike feature 003, which added zero).
The briefing itself is a second, pure derived service (`src/services/briefing/`) that reuses
feature 003's `loadItems`/`loadDailyHistory`/`filterItems` — it is composed fresh on every
request and never persisted (research D2).

This is also the first feature to activate the `share_with_physician` consent purpose, which has
existed in the consent schema since feature 001 but was unused until now.

## Spec Kit artifacts

| Doc | What |
|-----|------|
| [spec.md](./spec.md) | Requirements, user stories, success criteria |
| [plan.md](./plan.md) | Technical plan + Constitution Check + Complexity Tracking (the one new repo) |
| [research.md](./research.md) | Decisions D1–D6 (repo justification, derived-not-persisted briefing, consent gating, exclusion semantics, sharing deferral) |
| [data-model.md](./data-model.md) | `Physician` entity + `BriefingSection`/`BriefingDocument`/`BriefingScope` view models |
| [contracts/README.md](./contracts/README.md) · [contracts/physician.contract.md](./contracts/physician.contract.md) | `PhysicianRepository` interface |
| [quickstart.md](./quickstart.md) | 11 run + validation scenarios |
| [tasks.md](./tasks.md) | Dependency-ordered task list (32 tasks) |
| [checklists/requirements.md](./checklists/requirements.md) | Spec quality checklist |
| [checklists/privacy-review.md](./checklists/privacy-review.md) | Privacy & safety review addendum |

## Architecture

Key code:
- Screens: [`app/(briefing)/physicians.tsx`](../../app/(briefing)/physicians.tsx) (US1),
  [`app/(briefing)/generate.tsx`](../../app/(briefing)/generate.tsx) (US2–US4)
- Repository: `src/repositories/{contracts,mock,api}/physician.repository.ts`, registered in
  `src/repositories/index.ts` behind the `physician` feature flag
- Service: [`src/services/briefing/`](../../src/services/briefing) — `canGenerate`, `generate`
  (composes sections from feature 003's aggregation, guardrail-checks every line, applies scope)
- Components: [`src/features/briefing/components/`](../../src/features/briefing/components) —
  `PhysicianCard`, `PhysicianForm`, `BriefingDocument`, `ConsentGate`, `CategoryExclude`
- Hooks: `src/features/briefing/hooks/{usePhysicians,useBriefing}.ts`

Entry points: a "Preparar resumen para tu médico" button on the Living Record screen
(`app/(record)/index.tsx`), and a "Generar resumen" button on the physicians screen.

## Known gap

The generated briefing is shown in-app only — no share sheet, PDF export, or direct delivery to
a physician exists yet. This mirrors feature 003's precedent (in-app export summary instead of
`expo-file-system`/`expo-sharing`): no new runtime dependencies were introduced by this feature.
A natural follow-up task once a sharing mechanism is scoped.

## Run & test

```bash
npm install
npx expo start          # from the Living Record screen, tap "Preparar resumen para tu médico"
npm test                # 93 logic tests
npm run lint
```
