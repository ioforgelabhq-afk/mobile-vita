# Feature: Conversational Onboarding

VITA's first-run experience — a warm, wizard-style onboarding (one screen at a time) where the
AI companion gets to know the patient through a natural conversation, seeds their **Living
Record**, establishes its companion-not-provider role, captures granular consent, and puts safety
first. Serves **Pillar 1 (better onboarding)** and seeds **Pillar 3 (Living Record)**.

## Status

All four user stories implemented against the mock repository layer (no backend yet).
**61/67 tasks complete** · **38 tests across 11 suites** · iOS Metro bundle verified.

## The wizard (one screen at a time)

```
Bienvenida → Consentimiento → Conversación → Tu registro → Listo
 (welcome)     (consent)       (conversation)   (review)    (complete)
```
The conversation step stays fully conversational (one prompt at a time); the only structured
form is consent (Principle V).

## Spec Kit artifacts

| Doc | What |
|-----|------|
| [spec.md](./spec.md) | Requirements, user stories, success criteria (+ Clarifications) |
| [plan.md](./plan.md) | Technical plan + Constitution Check |
| [research.md](./research.md) | Phase 0 decisions |
| [data-model.md](./data-model.md) | Feature entities (subset of the app-wide model) |
| [contracts/](./contracts/) | Repository interface contracts |
| [quickstart.md](./quickstart.md) | Run + validation scenarios |
| [tasks.md](./tasks.md) | Dependency-ordered task list (progress tracked here) |
| [checklists/requirements.md](./checklists/requirements.md) | Spec quality checklist |
| [checklists/privacy-review.md](./checklists/privacy-review.md) | Privacy & safety review |

## Sources of truth (app-wide)

- **Domain model** (all 12 entities): [`docs/domain/domain-model.md`](../../docs/domain/domain-model.md)
- **API contract** (REST/OpenAPI 3.1): [`docs/api/openapi.yaml`](../../docs/api/openapi.yaml)
- **Design tokens** (brand kit): [`docs/design/brand-tokens.md`](../../docs/design/brand-tokens.md)

## Architecture

Screens/hooks import repositories **only** via the flag-driven registry
(`src/repositories/index.ts`); each repository has Zod-typed `contracts/`, a default `mock/`
impl, and an `api/` stub — Mock↔API swaps with zero screen changes (Principle IX, enforced by
`tests/unit/architecture.test.ts`). Health-bearing writes pass a fail-closed consent gate
(`src/services/consent-gate`); safety is screened on every message (`src/services/safety`);
companion copy passes `src/services/guardrails` (informational, never diagnostic).

Key code:
- Screens: [`app/(onboarding)/`](../../app/(onboarding))
- Feature: [`src/features/onboarding/`](../../src/features/onboarding) (flow engine, hook, components, content, wizard)
- Repositories: [`src/repositories/`](../../src/repositories)
- Services: [`src/services/`](../../src/services) (safety, guardrails, consent-gate)

## Run & test

```bash
npm install
npx expo start          # opens on the welcome step
npm test                # 38 logic tests (safety, consent, flow, sync, parity, integration…)
npm run lint            # ESLint (eslint-config-expo)
npm run typecheck       # tsc --noEmit
```

## Known gaps (see tasks.md)

- Encrypted `expo-sqlite` storage (MVP uses in-memory) — required before shipping real data.
- RN component tests (RNTL) parked on a jest-expo 29/30 transitive conflict.
- Manual quickstart run + accessibility audit require a simulator.
