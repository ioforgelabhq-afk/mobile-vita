# Implementation Plan: Physician Briefing

**Branch**: `004-physician-briefing` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-physician-briefing/spec.md`

## Summary

Deliver Pillar 4: patients manage **physician contacts** and generate an **informational,
physician-ready briefing** from their Living Record — gated on the existing (previously unused)
`share_with_physician` consent purpose, never diagnostic, fully offline.

**Technical approach**: One genuinely new repository (`PhysicianRepository` — physician contacts
are new persisted data, unlike feature 003's pure aggregation). Everything else reuses existing
infrastructure: the `living-record-view` service (`loadItems`, `loadDailyHistory`, `filterItems`)
for the data going into the briefing, the existing `ConsentRepository`/consent-gate for the
`share_with_physician` check, and a new pure `briefing` service that composes/formats an
informational document (title, disclaimer, sections) from that data — never persisted as a new
entity. New screens under `app/(briefing)/` for managing physicians and viewing a generated
briefing.

## Technical Context

**Language/Version**: TypeScript 5.x/6.x (strict), React Native via Expo SDK 57 (RN 0.86, React 19)

**Primary Dependencies**: Expo Router, TanStack Query, React Hook Form, Zod, NativeWind — all
already in the project. No new runtime dependencies (consistent with feature 003's precedent).

**Storage**: New `PhysicianRepository` on the existing `CollectionStore` abstraction; briefing
generation is read-only against existing stores.

**Testing**: Jest (30) + ts-jest — Physician repository CRUD, consent gating, briefing
composition/formatting, disclaimer presence, and filter-scoping logic.

**Target Platform**: iOS 15+ / Android (Expo managed); Spanish-first (`es`).

**Project Type**: Mobile application (client only).

**Performance Goals**: Briefing generation in-app in under 5s, on-device, no network (SC-004).

**Constraints**: Briefing MUST NOT contain diagnostic language (FR-007, guardrail-checked);
generation MUST be blocked without `share_with_physician` consent (FR-010–012); one new
repository only — no duplication of Living Record aggregation (FR-015); fully offline (FR-017).

**Scale/Scope**: One feature, ~3 screens, 1 new repository (contract + mock + api stub), 1 new
pure briefing-composition service, reuse of the feature-003 aggregation service.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | How this plan complies | Status |
|---|-----------|------------------------|--------|
| I | Companion, not provider | Briefing is explicitly patient-reported/informational, addressed to the physician, not authored as clinical opinion | ✅ PASS |
| II | Patient data ownership | Patient manages physicians; briefing scope (date/category) is patient-controlled; nothing shared without action | ✅ PASS |
| III | Informational, never diagnostic | Briefing content passes `guardrails.inspect()`; prominent disclaimer; Daily Score bands keep their framing | ✅ PASS |
| IV | Safety over engagement | N/A — no new patient-authored free text is collected; reuses already-screened data | ✅ PASS |
| V | Human conversation, not a form | Physician-contact entry is a short form (reasonable here — structured contact fields, not health narrative) | ✅ PASS |
| VI | Every interaction enriches the Living Record | Briefing is a *view* of the record for an external purpose; doesn't mutate it | ✅ PASS |
| VII | Privacy by design | Sharing gated on explicit `share_with_physician` consent; revocation re-gates future generation (FR-012) | ✅ PASS |
| VIII | Offline-first | Physician CRUD + briefing generation are fully local (FR-017) | ✅ PASS |
| IX | API-first architecture | New `PhysicianRepository`: Zod contract + Mock + API stub behind a flag, matching every other repo | ✅ PASS |
| X | Four-pillar value test | Directly serves Pillar 4 (better physician briefing) | ✅ PASS |

**Gate result**: PASS. No violations. The one new repository is justified in research (D1) and the
spec's Assumptions; Complexity Tracking documents that justification for traceability.

## Project Structure

### Documentation (this feature)

```text
specs/004-physician-briefing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output (Physician entity + Briefing view model)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── README.md
│   └── physician.contract.md   # the one new repository contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root) — additive to features 001/002/003

```text
app/
└── (briefing)/                        # new Expo Router group
    ├── _layout.tsx
    ├── physicians.tsx                  # manage physician contacts (US1)
    └── generate.tsx                    # generate + view a briefing (US2/US3/US4)

src/
├── features/briefing/
│   ├── components/                     # PhysicianCard, PhysicianForm, BriefingDocument, ConsentGate
│   └── hooks/                          # usePhysicians, useBriefing
├── services/
│   └── briefing/                       # pure: composeBriefing(items, history, scope) -> BriefingDocument
├── repositories/
│   ├── contracts/physician.repository.ts   # new
│   ├── mock/physician.repository.ts        # new
│   ├── api/physician.repository.ts         # new
│   └── index.ts                            # + physicianRepository(), + 'physician' flag key

tests/
└── unit/                               # physician CRUD, consent gate, briefing composition/disclaimer, scoping
```

**Structure Decision**: Additive. One new repository seam (contract/mock/api, registered in the
existing registry exactly like every prior repository) plus a pure `briefing` composition service
that consumes feature 003's `living-record-view` service — no duplication of aggregation logic.
Screens import only via the registry (Principle IX).

## Complexity Tracking

> One documented exception: `PhysicianRepository` is a new repository, unlike feature 003's
> zero-new-repository design. **Why needed**: physician contacts are genuinely new persisted
> patient data with no existing owner repository — there is nothing to aggregate. **Simpler
> alternative rejected**: storing physicians as a special category of `LivingRecordEntry` was
> considered and rejected because physicians have a distinct, structured shape (contact fields,
> `sharedViaConsent`) already defined in the domain model/OpenAPI as their own entity; overloading
> `LivingRecordEntry` would blur that boundary and complicate the entry-correction UI in feature
> 003 with fields that don't belong there.
