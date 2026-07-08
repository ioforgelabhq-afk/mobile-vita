# Privacy & Safety Review — Conversational Onboarding

**Purpose**: Constitution-mandated review (Development Workflow & Quality Gates) for a feature
that touches health data, consent, and crisis signals. Covers Principles II, III, IV, VII and
the HIPAA + GDPR posture (clarification Q3).

**Reviewed**: 2026-07-07 · **Feature**: `specs/001-conversational-onboarding/`

## Privacy by design (Principle VII)

- [x] **Minimal collection** — onboarding stores only what the patient shares conversationally;
  no speculative fields. Schema (`schemas.ts`) has no analytics/tracking fields.
- [x] **Consent-gated writes** — every health-bearing write passes the fail-closed consent gate
  (`services/consent-gate`); no `store_health_data` grant → `ConsentRequiredError`, nothing
  persisted. Verified by `consent-gate.test.ts`, `consent.test.ts`, `offline-sync.test.ts`.
- [x] **Local-first, on-device** — data lives in the local store; nothing leaves the device
  (no backend). API repositories are inert stubs.
- [ ] **Encryption at rest** — the MVP uses an in-memory store; the production swap is encrypted
  `expo-sqlite` with the key in `expo-secure-store` (`lib/storage`). ⚠️ Must be implemented
  before shipping real patient data. Tracked for the storage-hardening task.
- [x] **No secrets in plain storage** — `secure.ts` abstracts secret access (secure-store in prod).

## Data ownership (Principle II)

- [x] **View / edit / remove** — `review` step lists entries; correct (supersede) + soft-delete
  wired (`living-record.repository`), FR-007/008.
- [x] **Export** — `LivingRecordRepository.export()` returns a portable JSON payload (FR-015).
- [x] **Revoke consent** — `ConsentRepository.revoke()` + surfaced in the DataRights component.
- [x] **No sale / no undisclosed sharing** — no third-party data flows exist; `share_with_physician`
  is a distinct, separately-granted purpose.

## Informational, never diagnostic (Principle III)

- [x] **Guardrails on companion copy** — `services/guardrails` blocks diagnostic/treatment
  phrasing; verified by `guardrails.test.ts`.
- [x] **Diagnosis requests reframed** — patient diagnosis/treatment asks are declined and
  redirected to a licensed provider (FR-011), wired in the conversation repo.
- [x] **Role disclosure** — welcome step states companion-not-provider + informational framing
  (Principle I).

## Safety over engagement (Principle IV)

- [x] **Safety screened first** — every patient message runs `SafetyService` before normal flow.
- [x] **Resources ahead of onboarding** — crisis → `SafetyResources` (crimson/critical) surfaces
  before advancing; flow resumes only after acknowledgement (FR-017/018). Verified by
  `safety-flow.test.ts`.
- [x] **Err toward safety** — ambiguous signals still surface resources (FR-019).
- [x] **No dark patterns** — no streaks/pressure mechanics in onboarding.

## HIPAA + GDPR posture (clarification Q3)

- [x] **Auditable consent** — `ConsentRecord` stores granular grants + the shown copy `version`
  + timestamps (FR-016a).
- [x] **Data-subject rights modeled** — access/export/delete/revoke exist in the contracts.
- [ ] **Regulated safeguards for production** — encryption-at-rest (above), transport security,
  retention windows, and BAA/DPA processes are backend/ops concerns to complete before GA.

## Outstanding before shipping real patient data

1. Implement encrypted `expo-sqlite` + `expo-secure-store` storage (replace in-memory store).
2. Add retention/deletion windows and confirm end-to-end deletion once a backend exists.
3. Complete transport security + HIPAA/GDPR operational processes with the backend.
