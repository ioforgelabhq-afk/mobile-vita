# Contract: LivingRecordRepository

Categorized, patient-owned entries (VI, II; clarification Q4). Supports correction, removal, and
export (data ownership / GDPR-HIPAA rights, FR-016a).

```ts
interface LivingRecordRepository {
  list(patientId: string): Promise<LivingRecordEntry[]>;                 // active entries
  add(input: AddEntryInput, clientMutationId: string): Promise<LivingRecordEntry>;
  /** Correction: supersedes an entry, preserving history but not treating old value as truth (FR-008). */
  correct(entryId: string, patch: EntryPatch, clientMutationId: string): Promise<LivingRecordEntry>;
  remove(entryId: string, clientMutationId: string): Promise<void>;     // soft delete (II)
  /** Portable export of the patient's record (data ownership, FR-015). */
  export(patientId: string): Promise<LivingRecordExport>;
}

// AddEntryInput: { patientId; category; content; sourceTurnId? }
// EntryPatch: { category?; content? }
// LivingRecordExport: { patientId; entries: LivingRecordEntry[]; exportedAt; format: "json" }
```

**Behavioral guarantees**

- Every entry is timestamped and attributed to `onboarding` (FR-006).
- `add` MUST be rejected/blocked when the governing `ConsentGrant` is absent or false (FR-016).
- `correct` sets the prior entry `status: corrected` and links `supersedesId` (FR-008).
- `remove` is a soft delete honoring patient control (II) and stays sync-consistent.
- `export` returns a portable, machine-readable payload (II, FR-015).
- Idempotent per `clientMutationId`; no duplicate entries on offline replay (FR-021).
