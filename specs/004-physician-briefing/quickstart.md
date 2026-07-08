# Quickstart & Validation: Physician Briefing

How to run and validate physician management + briefing generation (against Mock repositories).
Builds on features 001–003; the only new setup is the `physician` feature flag.

## Prerequisites

- Onboarding + at least one daily check-in completed (so there's Living Record data to brief).

## Setup & run

```bash
npm install
npx expo start
```

## Validation scenarios (map to Success Criteria)

| # | Scenario | Expected | Spec ref |
|---|----------|----------|----------|
| 1 | Add a physician with only a name | Saved, appears in the list | SC-001, FR-001/002 |
| 2 | Edit a physician | Updated details shown/used | FR-003 |
| 3 | Remove a physician | No longer in the list | FR-004 |
| 4 | Generate a briefing without `share_with_physician` consent | Explanation shown + path to grant consent; nothing generated | SC-003, FR-010/011 |
| 5 | Grant consent, generate a briefing | Succeeds; includes entries, health events, daily history | SC-003/004, FR-005/006/010 |
| 6 | Read the briefing | Prominent informational/patient-reported disclaimer; no diagnostic language | SC-002, FR-007/009 |
| 7 | Generate with sparse/no Living Record data | Plainly reflects that, no fabricated content | FR-008 |
| 8 | Revoke consent, try to generate again | Asked to grant consent again | FR-012 |
| 9 | Apply a date range | Only in-range data appears | SC-005, FR-013 |
| 10 | Exclude a category | That category's items absent | SC-005, FR-014 |
| 11 | Airplane mode | Physician CRUD + generation fully usable | SC-006, FR-017 |

## Architecture invariants to verify

- `PhysicianRepository` is the only new repository — grep confirms Mock ≡ API parity (extend
  `tests/contract/repository-parity.test.ts`).
- `composeBriefing` calls feature 003's `living-record-view` functions — no duplicated
  aggregation/filter logic (`git grep` for a second implementation should find none).
- Screens import repositories/services only via `@/repositories`/`@/services` (architecture
  invariant test extends automatically to `app/(briefing)`).

## References

- Contracts: [contracts/](./contracts/) · Data model: [data-model.md](./data-model.md) ·
  Decisions: [research.md](./research.md)
- Reused: `specs/001-conversational-onboarding/` (consent gate, guardrails),
  `specs/003-living-record/` (aggregation/filter service)
