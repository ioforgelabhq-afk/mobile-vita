<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 0.0.0
Bump rationale: Initial ratification of the VITA Mobile MVP constitution. Template
placeholders replaced with ten concrete, non-negotiable principles plus governance.

Modified principles: N/A (initial adoption)
Added principles:
  I.    AI Companion, Not a Medical Provider
  II.   Patient Data Ownership
  III.  Informational, Never Diagnostic
  IV.   Safety Over Engagement
  V.    Human Conversation, Not a Form
  VI.   Every Interaction Enriches the Living Record
  VII.  Privacy by Design
  VIII. Offline-First
  IX.   API-First Architecture
  X.    Four-Pillar Value Test
Added sections:
  - Product Constraints (health-domain boundaries)
  - Development Workflow & Quality Gates
Removed sections: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md  — Constitution Check reads gates dynamically; no edit needed
  ✅ .specify/templates/spec-template.md  — no constitution-name references; no edit needed
  ✅ .specify/templates/tasks-template.md — no constitution-name references; no edit needed
  ✅ .specify/templates/checklist-template.md — generic; no edit needed

Follow-up TODOs: None
-->

# VITA Mobile MVP Constitution

VITA is an AI health companion delivered as a mobile application. This constitution
defines the non-negotiable principles that every specification, plan, task, and line of
implementation MUST satisfy. When a decision is ambiguous, these principles decide it.

## Core Principles

### I. AI Companion, Not a Medical Provider

VITA is a companion that supports, informs, and accompanies the patient; it is NOT a
doctor, clinic, or licensed medical provider, and MUST never present itself as one.

- The product MUST NOT diagnose conditions, prescribe treatment, or issue clinical orders.
- User-facing language, branding, and copy MUST reinforce the companion role and avoid any
  implication of medical authority or a provider-patient relationship.
- VITA MUST route the patient to qualified human clinicians for any decision that requires
  a licensed medical provider.

Rationale: Overstepping the companion role creates legal, ethical, and safety liability and
erodes the trust the entire product depends on.

### II. Patient Data Ownership

The patient owns all of their health data, unconditionally. VITA is a custodian, never the
owner.

- The patient MUST be able to view, export (in a portable, machine-readable format), and
  delete their data at any time.
- Data MUST NOT be sold, and MUST NOT be shared with any third party without explicit,
  revocable, informed consent from the patient.
- Deletion MUST be honored end-to-end, including derived data and backups, within a
  defined and documented window.

Rationale: Ownership is the foundation of trust in a health product; the patient's control
over their record is not a feature to be traded away.

### III. Informational, Never Diagnostic

Every recommendation, insight, or suggestion VITA produces is informational and educational.
It is never a diagnosis, prognosis, or clinical instruction.

- Outputs that could be read as medical guidance MUST be framed as information and MUST
  encourage consultation with a licensed provider where appropriate.
- VITA MUST NOT assert clinical certainty (e.g., "you have X") and MUST NOT direct the
  patient to start, stop, or change treatment.
- Sources and reasoning for informational content SHOULD be transparent to the patient.

Rationale: The line between information and diagnosis is the line between a safe companion
and unlicensed practice of medicine; it must never be blurred.

### IV. Safety Over Engagement

When safety and engagement conflict, safety wins — always. No metric, growth goal, or
retention target may override patient safety.

- Features MUST NOT use manipulative or dark patterns to maximize time-in-app or streaks.
- Detected risk signals (e.g., crisis, self-harm, emergency symptoms) MUST trigger
  safety-first flows (escalation, emergency resources) ahead of any engagement flow.
- A feature that increases engagement at the cost of patient wellbeing MUST be rejected.

Rationale: A health companion that optimizes engagement over safety actively harms the
people it claims to serve.

### V. Human Conversation, Not a Form

Interactions MUST feel like a conversation with an attentive human, not like filling out a
form or questionnaire.

- Data collection MUST be woven into natural dialogue; the UI MUST NOT present clinical
  intake forms as the primary means of gathering information.
- VITA SHOULD adapt tone, pacing, and follow-ups to the patient's context and prior
  responses rather than marching through fixed field lists.
- Required information SHOULD be gathered progressively over conversation, never demanded
  up front as a wall of inputs.

Rationale: Trust and honest disclosure come from feeling heard; form-filling produces
disengagement and incomplete, low-quality health data.

### VI. Every Interaction Enriches the Living Record

The Living Record — the patient's evolving, longitudinal health picture — is the heart of
VITA. Every meaningful interaction MUST make it better.

- Each conversation, check-in, or input MUST be capable of updating the Living Record with
  new, corrected, or enriched information.
- Updates to the Living Record MUST be attributable, timestamped, and reversible/correctable
  by the patient.
- A feature that captures patient information but does not feed the Living Record MUST
  justify its existence against Principle X.

Rationale: A continuously improving longitudinal record is what turns isolated interactions
into genuine, personalized guidance and useful physician briefings.

### VII. Privacy by Design

Privacy is a default and an architectural property, not a setting the patient must discover.

- Systems MUST collect the minimum data necessary and MUST default to the most private
  configuration.
- Health data MUST be encrypted in transit and at rest, and access MUST follow least
  privilege.
- Privacy implications MUST be evaluated at design time for every feature; privacy MUST NOT
  be retrofitted after implementation.

Rationale: In a health context, a privacy failure is a safety and trust failure; it must be
prevented by design, not patched later.

### VIII. Offline-First

The application MUST remain useful without connectivity wherever it is technically feasible.

- Core patient-facing flows (viewing the Living Record, capturing new information) MUST
  function offline and synchronize when connectivity returns.
- Local data MUST be persisted securely on-device and reconciled deterministically on sync,
  with defined conflict-resolution behavior.
- A feature that requires connectivity MUST degrade gracefully and clearly communicate its
  offline limitations.

Rationale: Health moments do not wait for a signal; a companion that goes dark offline fails
the patient when they may need it most.

### IX. API-First Architecture

All capabilities MUST be exposed through well-defined APIs. The mobile client is one
consumer of these APIs, not a place where core logic hides.

- Every feature's data and behavior MUST be accessible via a documented, versioned API
  contract defined before or alongside implementation.
- Business logic MUST live behind APIs, not embedded solely in the UI layer.
- API contracts MUST be backward-compatible within a major version; breaking changes require
  a version increment and migration path.

Rationale: An API-first design keeps the system composable, testable, and ready for future
clients (web, physician tools, integrations) without rework.

### X. Four-Pillar Value Test

Every feature MUST measurably contribute to at least one of the four product pillars.
Features that serve none MUST NOT be built.

The four pillars:
1. **Better onboarding** — helping a new patient start and reach value faster.
2. **Better daily guidance** — improving the informational support VITA gives day to day.
3. **Better Living Record** — enriching the accuracy, depth, or usefulness of the record.
4. **Better physician briefing** — improving what a clinician receives to act on.

- Every specification MUST name the pillar(s) its feature serves.
- A feature that cannot be tied to a pillar is out of scope for the MVP.

Rationale: Focus is what makes an MVP ship; the four pillars are the definition of value for
VITA, and anything outside them is a distraction.

## Product Constraints

These domain constraints apply across all features and complement the principles above.

- **Regulatory posture**: VITA operates as an informational wellness companion, not a
  regulated medical device. Any feature that risks crossing into regulated medical-device
  territory MUST be escalated for review before implementation.
- **Crisis handling**: Emergency and crisis pathways MUST be present, prominent, and tested;
  they take precedence over all standard flows (see Principle IV).
- **Data portability**: The Living Record and its underlying data MUST be exportable in an
  open, documented format so the patient can take it elsewhere (see Principle II).
- **Consent granularity**: Consent MUST be specific, informed, revocable, and recorded; no
  blanket or bundled consent for unrelated data uses.

## Development Workflow & Quality Gates

- **Constitution Check**: Every plan MUST pass a Constitution Check gate. Any violation MUST
  be documented and justified in the plan's Complexity/Deviation section, or the plan MUST
  be revised to comply.
- **Spec traceability**: Every specification MUST state which of the four pillars (Principle
  X) it serves and MUST call out its data-ownership, privacy, and safety implications.
- **Contract-first delivery**: API contracts (Principle IX) MUST be defined and reviewed
  before dependent client work is considered complete.
- **Safety and privacy review**: Features touching health data, risk signals, or crisis
  flows MUST receive an explicit safety and privacy review before merge.
- **Testing discipline**: Offline behavior, sync/conflict resolution, and safety-critical
  flows MUST have automated tests. Safety-critical paths are non-negotiable coverage.

## Governance

This constitution supersedes all other development practices for the VITA Mobile MVP. Where
another guideline conflicts with this document, this document prevails.

- **Amendments**: Changes MUST be proposed in writing with rationale and impact analysis,
  reviewed and approved by project maintainers, and accompanied by a version bump and update
  of dependent templates and artifacts.
- **Versioning policy**: This constitution follows semantic versioning.
  - **MAJOR**: Backward-incompatible governance changes or removal/redefinition of a
    principle.
  - **MINOR**: Addition of a new principle or section, or materially expanded guidance.
  - **PATCH**: Clarifications and wording refinements that do not change meaning.
- **Compliance review**: All plans and pull requests MUST verify compliance with these
  principles. Complexity and any deviation MUST be explicitly justified; unjustified
  violations block delivery.
- **Living document**: This constitution is expected to evolve with the product; every
  amendment MUST keep the Sync Impact Report and dependent templates in sync.

**Version**: 0.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
