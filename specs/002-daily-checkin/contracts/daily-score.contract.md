# Contract: DailyScoreRepository

Persists the on-device Daily Score (FR-006–009). The score itself is computed by the `scoring`
service; this repository stores/reads it.

```ts
interface DailyScoreRepository {
  forDate(patientId: string, date: string): Promise<DailyScore | null>;
  save(input: SaveScoreInput, clientMutationId: string): Promise<DailyScore>;
  list(patientId: string): Promise<DailyScore[]>; // history feeds insights/trends
}

// SaveScoreInput: {
//   patientId; date; score: number(0-100); band: 'low'|'moderate'|'good'|'great';
//   components: { key; label; weight; value }[]; checkInId?
// }
```

**Behavioral guarantees**

- Unique per `(patientId, date)`; saving twice for a day is idempotent (no duplicate — FR-023).
- Every returned score carries `disclaimerShown` and is presented as an informational wellness
  indicator, never a diagnosis (FR-008).
- `save` is consent-gated only insofar as it references check-in health data; the score value may be
  computed and shown even when health data is not persisted (edge case).
