# Contract: PatientRepository

Stores minimal, conversationally-gathered profile basics (VII: minimal collection).

```ts
interface PatientRepository {
  get(patientId: string): Promise<Patient | null>;
  update(patientId: string, patch: PatientPatch, clientMutationId: string): Promise<Patient>;
}

// PatientPatch: { displayName?: string; locale?: string }  — validated by Zod, all optional
```

**Behavioral guarantees**

- `update` is idempotent per `clientMutationId` (offline replay safe).
- No field is mandatory; sparse patients are valid (edge case: reluctant patient).
- Writes go through the sync queue (`syncStatus: queued`) when persisted locally.
