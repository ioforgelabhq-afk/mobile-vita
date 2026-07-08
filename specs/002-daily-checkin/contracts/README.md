# Repository Contracts — Daily Guidance & Daily Check-in

Same contract discipline as feature 001 (see `specs/001-conversational-onboarding/contracts/`):
each interface is the authoritative contract that both the **Mock** (default) and future **API**
implementation satisfy; inputs/outputs validated by Zod (`schemas.ts`); screens/hooks depend on
these interfaces via the registry only; every mutation carries a `clientMutationId` (idempotent,
replay-safe). These are added to the existing registry and reuse the shared services.

Feature flags (added): `dailyCheckin`, `dailyScore`, `healthEvent`, `insight` → `"mock" | "api"`,
default `"mock"`.

Two on-device **services** (not repositories, pure/deterministic):
- **scoring** — `computeScore(inputs) → { score, band, components }` (FR-006/007/009)
- **insights** — `generate(score, history) → Insight[]`, each guardrail-checked (FR-010–014)

## Contracts

- [daily-checkin.contract.md](./daily-checkin.contract.md) — one-per-day check-in lifecycle
- [daily-score.contract.md](./daily-score.contract.md) — persisted daily scores
- [health-event.contract.md](./health-event.contract.md) — symptom capture from check-ins
- [insight.contract.md](./insight.contract.md) — informational insights (list/dismiss)

Reuses (unchanged): `ConversationRepository`, `ConsentRepository`/consent-gate, `SafetyService`,
`guardrails`, `SyncQueue`, `LivingRecordRepository` (correction pattern).
