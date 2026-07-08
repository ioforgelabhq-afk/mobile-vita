# Contract: ConversationRepository

Drives the adaptive companion dialogue (V, VI). Mock = deterministic flow engine over curated
content; API (future) = LLM-backed service. Screens do not change between them (IX, D6).

Maps to the app-wide `Conversation` entity (`type: onboarding`) — see `docs/domain/domain-model.md`
§3 and the `Conversation` schema in `docs/api/openapi.yaml`. (Unified from the earlier
`OnboardingSession` name — analysis finding I1.)

```ts
interface ConversationRepository {
  /** Starts or resumes the onboarding conversation for a patient (FR-023, FR-024). */
  startOrResume(patientId: string): Promise<Conversation>;

  /** Records a patient turn and returns the next companion turn + any derived record entries. */
  sendPatientMessage(input: SendMessageInput): Promise<CompanionResponse>;

  /** Marks the conversation complete (FR-025). */
  complete(conversationId: string, clientMutationId: string): Promise<Conversation>;

  getTurns(conversationId: string): Promise<ConversationTurn[]>;
}

// SendMessageInput: { conversationId: string; text: string; clientMutationId: string }
// CompanionResponse: {
//   companionTurn: ConversationTurn;          // next adaptive prompt (V)
//   suggestedEntries: LivingRecordEntry[];    // categorized, patient-confirmable (VI, Q4)
//   safetyEvent?: SafetyEvent;                // present if a crisis signal matched (IV)
// }
```

**Behavioral guarantees**

- `sendPatientMessage` MUST run `SafetyService` on the patient text **before** producing normal
  flow; if a crisis is detected it returns a `safetyEvent` and the caller surfaces resources
  ahead of continuing (FR-017, FR-017a, FR-018, FR-019).
- The next companion turn MUST be selected adaptively from prior answers — not a fixed script
  (FR-002); one topic at a time (FR-001).
- Companion text MUST pass the informational-not-diagnostic guardrail (III); on a diagnosis/
  treatment request it reframes as informational and points to a licensed provider (FR-011).
- `suggestedEntries` are categorized and become `LivingRecordEntry`s only after the patient
  confirms/edits them (VI, FR-007).
- All methods work offline; mutations carry `clientMutationId` for replay-safe sync.
