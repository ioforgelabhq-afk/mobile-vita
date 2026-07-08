# Quickstart & Validation: Living Record View

How to run and validate the Living Record view (against Mock repositories). Builds on features
001/002; no new setup.

## Prerequisites

- Onboarding + at least one daily check-in completed (so there's data to browse).

## Setup & run

```bash
npm install
npx expo start
```

Navigate to the Living Record view (from the daily result screen or app navigation, per the
implementation) — no new feature flags; this feature adds no new repositories.

## Validation scenarios (map to Success Criteria)

| # | Scenario | Expected | Spec ref |
|---|----------|----------|----------|
| 1 | Open the view with entries + health events present | Both shown together, labeled by category/type/source | SC-001/002, FR-001/002 |
| 2 | Open the view with no data | Clear "nothing yet" state, not a blank/error screen | FR-003 |
| 3 | View daily history with 3+ days | Scores shown chronologically, each informational | FR-004/005 |
| 4 | View daily history with 0–1 days | No trend implied | FR-006 |
| 5 | Correct an entry from this view | Change reflected here and everywhere else that reads it | SC-003, FR-007/009 |
| 6 | Remove a health event from this view | No longer appears anywhere | FR-008/009 |
| 7 | Filter by category | Only matching items shown | FR-011/013 |
| 8 | Filter by date range | Only items in range shown | FR-012/013 |
| 9 | Filter yields nothing | Clear "no results" state | FR-013 |
| 10 | Export the record | File contains 100% of entries/events/checkins/scores | SC-004, FR-010 |
| 11 | Airplane mode | View loads and is fully usable | SC-005, FR-015 |

## Architecture invariants to verify

- No new repository contracts/mock/api files were added (grep `src/repositories/` diff — should
  be empty for this feature).
- The aggregation service (`src/services/living-record-view/`) calls only existing repository
  public methods — no direct store access, no duplicate correction logic.
- Screens import repositories only via `@/repositories` (existing architecture-invariant test
  extends automatically since it walks `app/`).

## References

- Contracts: [contracts/README.md](./contracts/README.md) (service interface, no new repo contracts)
- Data model: [data-model.md](./data-model.md) · Decisions: [research.md](./research.md)
- Reused foundation: `specs/001-conversational-onboarding/`, `specs/002-daily-checkin/`
