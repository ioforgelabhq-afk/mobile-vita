# Repository Contracts

These files define the **repository interfaces** for the onboarding feature. Because no backend
exists yet, each interface is the authoritative contract that:

1. the **Mock** implementation satisfies today (default for the MVP), and
2. the **API** implementation must satisfy later (the future backend must conform to it).

Contract rules (enforced by tests in `tests/contract/`):

- Both Mock and API implementations implement the identical TypeScript interface.
- All inputs/outputs are validated with the Zod schemas in
  `src/repositories/contracts/schemas.ts` (mirrors [../data-model.md](../data-model.md)).
- Screens/hooks depend on these interfaces only; the active implementation is chosen by feature
  flags in `src/lib/feature-flags/` via the registry `src/repositories/index.ts`.
- Every mutation accepts a `clientMutationId` (idempotency) so offline replay via the sync queue
  cannot duplicate records (FR-021).
- Methods are `async` and return typed results or a typed `RepositoryError`.

Feature flags (per repository): `auth`, `patient`, `conversation`, `livingRecord`, `consent`
each resolve to `"mock" | "api"`. Default = `"mock"` for all until the backend ships.

## Contracts

- [auth.contract.md](./auth.contract.md) — mocked local-first identity & optional account
- [patient.contract.md](./patient.contract.md) — patient profile basics
- [conversation.contract.md](./conversation.contract.md) — adaptive companion turns
- [living-record.contract.md](./living-record.contract.md) — categorized entries CRUD + export
- [consent.contract.md](./consent.contract.md) — granular, auditable consent
