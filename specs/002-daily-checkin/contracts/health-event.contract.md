# Contract: HealthEventRepository

Captures discrete health occurrences — here, symptoms mentioned during a check-in (FR-015).
Consent-gated, attributed, correctable (Principles II, VI, VII).

```ts
interface HealthEventRepository {
  list(patientId: string): Promise<HealthEvent[]>;
  add(input: AddHealthEventInput, clientMutationId: string): Promise<HealthEvent>;
  correct(eventId: string, patch: HealthEventPatch, clientMutationId: string): Promise<HealthEvent>;
  remove(eventId: string, clientMutationId: string): Promise<void>;
}

// AddHealthEventInput: {
//   patientId; type: 'symptom'; title; description?; occurredAt?; relatedConversationId?
// }  // source is fixed to 'daily_checkin' for this feature
// HealthEventPatch: { title?; description?; occurredAt? }
```

**Behavioral guarantees**

- `add` requires `store_health_data` consent (fail-closed gate, FR-018).
- Events are attributed (`source: 'daily_checkin'`) and timestamped (FR-015).
- `correct` supersedes the prior value; `remove` is a soft delete (FR-017). Idempotent per
  `clientMutationId` (replay-safe).
