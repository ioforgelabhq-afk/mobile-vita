# Contract: PhysicianRepository

Manages physician contacts (FR-001–004; spec Key Entities). The one genuinely new repository in
this feature — see plan.md's Complexity Tracking for why.

```ts
interface PhysicianRepository {
  list(patientId: string): Promise<Physician[]>;
  add(input: AddPhysicianInput, clientMutationId: string): Promise<Physician>;
  update(physicianId: string, patch: PhysicianPatch, clientMutationId: string): Promise<Physician>;
  remove(physicianId: string, clientMutationId: string): Promise<void>;
}

// AddPhysicianInput: { patientId; name; specialty?; organization?; phone?; email?; notes? }
// PhysicianPatch: { name?; specialty?; organization?; phone?; email?; notes? }
```

**Behavioral guarantees**

- `add` requires only `name` (FR-001); all other fields optional.
- No uniqueness constraint — duplicate names are allowed (spec edge case).
- `remove` is a soft delete (`deletedAt`), consistent with every other repository.
- Idempotent per `clientMutationId` (replay-safe, same pattern as every other repository).
- Works fully offline (FR-017) — no network calls in the Mock implementation; the future API
  implementation conforms to `docs/api/openapi.yaml`'s existing `/physicians*` endpoints.
