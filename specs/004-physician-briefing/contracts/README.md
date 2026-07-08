# Contracts — Physician Briefing

One new repository contract (`PhysicianRepository` — see
[physician.contract.md](./physician.contract.md)), following the exact discipline established in
features 001/002: Zod-typed contract, Mock (default) + API stub, behind a feature flag, screens
import only via the registry (Principle IX).

The **briefing composition** is a pure service, not a repository (research D2) — documented here
rather than as a repository contract since it introduces no new persisted data:

## BriefingService (`src/services/briefing/`)

```ts
interface BriefingScope {
  from?: string;   // YYYY-MM-DD
  to?: string;     // YYYY-MM-DD
  excludedCategories?: string[];
}

interface BriefingService {
  /** True only if the patient has granted the (existing) share_with_physician purpose. */
  canGenerate(patientId: string): Promise<boolean>;

  /**
   * Composes a BriefingDocument from feature 003's living-record-view service. Throws
   * ConsentRequiredError if canGenerate() would be false — callers should check first to show
   * the consent-explanation UI (FR-011) rather than relying on the throw for control flow.
   */
  generate(patientId: string, scope?: BriefingScope): Promise<BriefingDocument>;
}
```

**Behavioral guarantees**

- `generate` calls feature 003's `loadItems`/`loadDailyHistory`/`filterItems` — no duplicate
  aggregation logic (FR-015).
- Every section item passes `guardrails.inspect()`; failing items are omitted (FR-007/009).
- `generate` is fail-closed on consent, mirroring `requireConsent` (FR-010).
- Fully synchronous-feeling in practice (<5s, on-device, no network) — SC-004.

## Reused (unchanged)

`livingRecordViewService` (loadItems/loadDailyHistory/filterItems), `consent-gate`
(`hasConsent`/`requireConsent`), `guardrails`, the repository registry, design tokens.
