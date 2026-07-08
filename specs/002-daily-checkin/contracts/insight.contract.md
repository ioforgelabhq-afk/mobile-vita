# Contract: InsightRepository

Stores informational Insights surfaced after a check-in (FR-010–014). Bodies are produced by the
`insights` service and MUST pass the `guardrails` check before persistence/display.

```ts
interface InsightRepository {
  list(patientId: string, opts?: { includeDismissed?: boolean }): Promise<Insight[]>;
  add(input: AddInsightInput, clientMutationId: string): Promise<Insight>;
  dismiss(insightId: string, clientMutationId: string): Promise<Insight>;
}

// AddInsightInput: {
//   patientId; title; body; category: 'trend'|'education'|'encouragement'|'reminder_suggestion';
//   relatedEntityType?: 'daily_score'|'health_event'; relatedEntityId?
// }
```

**Behavioral guarantees**

- `add` rejects a body that fails `guardrails.inspect()` (no diagnostic assertion — FR-011); stored
  Insights always have `disclaimerShown: true` (FR-012).
- `list` excludes dismissed Insights by default; `dismiss` sets `dismissedAt` (FR-013).
- After any completed check-in, at least one Insight exists (FR-010), with graceful fallback when
  history is thin (FR-014) — enforced by the `insights` service, surfaced through this repo.
