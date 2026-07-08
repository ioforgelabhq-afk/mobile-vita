# Contract: ConsentRepository

Granular, auditable consent (FR-012–FR-016a; clarification Q3 → HIPAA + GDPR).

```ts
interface ConsentRepository {
  /** The purposes to present, with current copy version (auditability). */
  getConsentDefinition(): Promise<ConsentDefinition>;

  get(patientId: string): Promise<ConsentRecord | null>;

  /** Captures per-purpose grants. Individually grantable/declinable (FR-013, FR-014). */
  capture(input: CaptureConsentInput, clientMutationId: string): Promise<ConsentRecord>;

  /** Revokes consent (all or a purpose) — consent is revocable later (FR-015). */
  revoke(input: RevokeConsentInput, clientMutationId: string): Promise<ConsentRecord>;

  /** Convenience gate used by health-data writes (FR-016). */
  isGranted(patientId: string, purpose: ConsentPurpose): Promise<boolean>;
}

// ConsentPurpose: "store_health_data" | "personalize_guidance" | "improve_service"
// ConsentDefinition: { version: string; purposes: { purpose; label; description }[] }
// CaptureConsentInput: { patientId; version; grants: { purpose; granted }[] }
// RevokeConsentInput: { patientId; purpose?: ConsentPurpose }   // omit purpose = revoke all
```

**Behavioral guarantees**

- Consent MUST be captured before any health-data is stored (FR-012); the record is retained as
  an auditable log with the shown copy `version` (FR-016a).
- Declining a purpose MUST prevent that use while allowing granted uses to proceed (FR-014).
- `isGranted` is the single gate the LivingRecord/health writes consult (FR-016).
- The consent screen is the ONLY place onboarding uses a structured form (React Hook Form + Zod),
  consistent with Principle V.
- Patient is informed they own their data and can view/export/delete and revoke (FR-015) — copy
  surfaced from `ConsentDefinition`.
