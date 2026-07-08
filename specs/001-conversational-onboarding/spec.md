# Feature Specification: Conversational Onboarding

**Feature Branch**: `001-conversational-onboarding`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Conversational onboarding for the VITA mobile app (Pillar 1: better onboarding). A new patient opens VITA for the first time and is welcomed by the AI companion through a natural, human-feeling conversation — never a form or clinical intake questionnaire. During this conversation VITA progressively gets to know the patient, begins building the Living Record, establishes that VITA is a companion (not a medical provider) offering informational (never diagnostic) support, obtains granular revocable consent, works offline-first, and puts safety first if a crisis signal appears."

## Clarifications

### Session 2026-07-06

- Q: How should patient identity/account work at onboarding? → A: Local-first — the patient
  begins the conversation with no sign-up; data is captured locally and an account can be
  created/linked later to enable sync (account is optional at onboarding).
- Q: What is the scope of crisis/safety-signal detection during onboarding? → A: Detect both
  explicit patient statements and concerning intent/keyword patterns (e.g., self-harm,
  emergency), then surface safety resources/escalation — no clinical triage or diagnosis.
- Q: What privacy/compliance posture should the MVP target for health data? → A: Target both
  HIPAA safeguards and GDPR-style data rights from the start.
- Q: How should the Living Record capture what's shared in conversation? → A: Extract discrete,
  categorized entries (e.g., goals, concerns, health context) that are individually viewable
  and editable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A welcoming first conversation that starts the Living Record (Priority: P1)

A new patient opens VITA for the first time. Instead of a sign-up form or clinical
questionnaire, they are greeted by the companion in warm, plain language. Through a natural
back-and-forth, the companion learns who the patient is, why they came to VITA, and their
current health context — asking one thing at a time, adapting to what the patient says, and
never demanding a wall of inputs. As the patient shares, a foundational Living Record is
quietly built from the conversation, and the patient can see and correct what was captured.

**Why this priority**: This is the essence of the feature and of Pillar 1. Without a
conversation that feels human and produces an initial Living Record, onboarding has failed
its purpose. It is the minimum viable slice: a patient can arrive, feel heard, and leave with
a meaningful record started.

**Independent Test**: A first-time patient can complete a guided conversation end-to-end and,
afterward, view a populated Living Record whose entries reflect what they shared and which
they can correct — with no clinical intake form presented at any point.

**Acceptance Scenarios**:

1. **Given** a first-time patient who has just opened VITA, **When** onboarding begins,
   **Then** they are greeted conversationally and asked open questions one at a time, not
   presented with a multi-field form.
2. **Given** an in-progress onboarding conversation, **When** the patient answers a question,
   **Then** the companion's next prompt reflects what was just said (adaptive follow-up)
   rather than a fixed script that ignores the answer.
3. **Given** a patient has shared meaningful information (e.g., a goal or a health concern),
   **When** they reach a review point or open their record, **Then** a corresponding Living
   Record entry exists, is timestamped, is attributed to onboarding, and can be edited or
   removed by the patient.
4. **Given** a patient finishes onboarding, **When** the conversation concludes, **Then** they
   are told the Living Record has been started and that they can now receive daily guidance.

---

### User Story 2 - Understanding VITA's role and giving informed, granular consent (Priority: P1)

Early in the experience, and in plain companion language, the patient learns that VITA is a
health companion — not a doctor or medical provider — and that what it shares is
informational, never a diagnosis. Before the companion collects or uses health information,
the patient is asked for informed consent that is specific and granular (they can agree to
some uses and decline others), is told they own their data and can view, export, or delete it,
and understands the consent can be revoked later.

**Why this priority**: The constitution makes role clarity (Principle I), the informational
boundary (Principle III), data ownership (Principle II), privacy (Principle VII), and consent
non-negotiable. Collecting health information without this is not permitted, so it is a P1
gate around Story 1 rather than a later nicety.

**Independent Test**: Before any health information is stored, the patient can be shown VITA's
role and boundaries and a granular consent choice; declining a specific use prevents that use,
and the patient can locate how to view/export/delete their data and how to revoke consent.

**Acceptance Scenarios**:

1. **Given** a patient beginning onboarding, **When** the companion introduces itself, **Then**
   it states in plain language that it is a companion, not a medical provider, and that its
   guidance is informational and not diagnostic.
2. **Given** the companion is about to collect health information, **When** consent is
   requested, **Then** the patient can grant or decline distinct data uses individually rather
   than through a single all-or-nothing acceptance.
3. **Given** a patient declines a specific data use, **When** onboarding continues, **Then**
   that declined use does not occur and onboarding still proceeds for the uses that were
   granted.
4. **Given** a patient has completed consent, **When** they look for their rights, **Then**
   they can find how to view, export, and delete their data and how to revoke consent.

---

### User Story 3 - Safety takes precedence over onboarding (Priority: P1)

If, during onboarding, the patient reveals a crisis or emergency signal (for example, mention
of self-harm or an urgent medical emergency), the companion immediately prioritizes safety:
it surfaces appropriate safety resources and pathways ahead of continuing to gather onboarding
information, and does not treat the moment as a routine data-collection step.

**Why this priority**: Principle IV (Safety Over Engagement) is absolute — a crisis during
onboarding must never be subordinated to completing the flow. This is a P1 safety guarantee
that must hold even in the earliest patient interaction.

**Independent Test**: When a crisis signal is introduced during onboarding, the experience can
be observed to interrupt normal onboarding and present safety resources before resuming or
concluding.

**Acceptance Scenarios**:

1. **Given** an onboarding conversation, **When** the patient expresses a crisis or emergency
   signal, **Then** the companion surfaces safety resources and appropriate escalation ahead
   of any further onboarding questions.
2. **Given** a safety pathway has been surfaced, **When** the patient chooses to continue,
   **Then** onboarding resumes only after safety has been addressed, and the moment is handled
   with care rather than as a form field.

---

### User Story 4 - Onboarding works offline and syncs later (Priority: P2)

A patient begins onboarding without a network connection (or loses it mid-conversation). The
companion continues to work, capturing the conversation and the emerging Living Record locally.
When connectivity returns, the captured information synchronizes without loss or duplication,
and the patient is not blocked from completing onboarding by the lack of a connection.

**Why this priority**: Principle VIII (Offline-First) requires core patient flows to work
offline. It is P2 rather than P1 because the conversation and record-building (Stories 1–3)
can be demonstrated online first, but robust onboarding is incomplete without it.

**Independent Test**: With connectivity disabled, a patient can start and continue onboarding
and see their responses captured locally; on reconnection, the captured data appears
synchronized exactly once with no lost entries.

**Acceptance Scenarios**:

1. **Given** no network connection, **When** the patient starts onboarding, **Then** the
   conversation proceeds and responses are captured locally.
2. **Given** onboarding data captured offline, **When** connectivity is restored, **Then** the
   data synchronizes without loss and without creating duplicate Living Record entries.
3. **Given** a feature within onboarding genuinely requires connectivity, **When** the patient
   is offline, **Then** that part degrades gracefully and clearly communicates the offline
   limitation rather than failing silently.

---

### Edge Cases

- **Patient gives minimal or reluctant answers**: The companion must accept sparse input,
  never coerce, and still produce a (smaller) valid Living Record and reach a graceful
  conclusion.
- **Patient abandons onboarding partway**: Progress and any captured Living Record entries are
  preserved so the patient can resume later without repeating everything or losing data.
- **Patient shares something ambiguous that could read as a crisis**: The experience errs
  toward surfacing safety resources rather than ignoring a possible signal.
- **Patient declines all consent for data use**: The experience explains, without pressure,
  what VITA can and cannot do without consent, and does not store health information for
  declined uses.
- **Patient corrects or retracts information mid-conversation**: The Living Record reflects the
  correction, and the earlier value does not silently persist as truth.
- **Patient asks VITA for a diagnosis or treatment during onboarding**: The companion declines
  to diagnose, reframes its answer as informational, and points toward a licensed provider.
- **Connectivity drops mid-sync**: Synchronization resumes safely without duplicating or
  losing entries.
- **Returning patient re-triggers onboarding**: The experience recognizes an existing record
  and does not overwrite or duplicate it.

## Requirements *(mandatory)*

### Functional Requirements

**Conversational experience (Principle V)**

- **FR-001**: The onboarding experience MUST present as a natural conversation, introducing one
  topic or question at a time, and MUST NOT present a clinical intake form or multi-field
  questionnaire as the means of gathering information.
- **FR-002**: The companion MUST adapt its follow-up prompts to the patient's prior responses
  rather than following a fixed script that ignores what the patient said.
- **FR-003**: The experience MUST gather information progressively and MUST NOT require the
  patient to provide a large batch of information up front before proceeding.
- **FR-004**: The companion MUST accept minimal, partial, or reluctant answers without coercion
  and still allow onboarding to conclude gracefully.

**Living Record (Principle VI)**

- **FR-005**: The experience MUST begin building the patient's Living Record from meaningful
  information shared during the conversation, capturing it as discrete, categorized entries
  (e.g., goals, concerns, health context) that are individually viewable and editable.
- **FR-006**: Each Living Record entry created during onboarding MUST be timestamped and
  attributed to its source (the onboarding conversation).
- **FR-007**: The patient MUST be able to view, correct, and remove Living Record entries
  captured during onboarding.
- **FR-008**: When the patient corrects or retracts information during the conversation, the
  Living Record MUST reflect the current value and MUST NOT silently retain the superseded
  value as truth.

**Role, boundaries, and information framing (Principles I & III)**

- **FR-009**: The companion MUST clearly communicate, in plain language, that VITA is a health
  companion and not a doctor, clinic, or licensed medical provider.
- **FR-010**: The companion MUST frame anything it shares as informational and MUST NOT present
  diagnoses, prognoses, or clinical instructions during onboarding.
- **FR-011**: If the patient requests a diagnosis or treatment decision, the companion MUST
  decline to provide one, reframe its response as informational, and direct the patient toward
  a licensed provider where appropriate.

**Consent, ownership, and privacy (Principles II & VII)**

- **FR-012**: Before collecting or using health information, the experience MUST obtain the
  patient's informed consent.
- **FR-013**: Consent MUST be granular — the patient MUST be able to grant or decline distinct
  data uses individually rather than through a single all-or-nothing acceptance.
- **FR-014**: When the patient declines a specific data use, the experience MUST NOT perform
  that use and MUST still proceed for the uses that were granted.
- **FR-015**: The experience MUST inform the patient that they own their data and can view,
  export, and delete it, and MUST make clear that consent can be revoked later.
- **FR-016**: The experience MUST default to collecting only the information needed for
  onboarding and MUST NOT collect health information for uses the patient has not consented to.
- **FR-016a**: Handling of health information during onboarding MUST satisfy both HIPAA
  safeguards and GDPR-style data-subject rights, including a recorded, auditable consent
  decision and support for access, export, deletion, and consent revocation.

**Safety (Principle IV)**

- **FR-017**: If the patient expresses a crisis or emergency signal during onboarding, the
  experience MUST surface appropriate safety resources and escalation ahead of continuing to
  gather onboarding information.
- **FR-017a**: Crisis-signal detection MUST cover both explicit patient statements and
  concerning intent/keyword patterns (e.g., self-harm, medical emergency). Detection MUST NOT
  perform clinical triage or produce a diagnosis; it only surfaces safety resources and
  escalation pathways.
- **FR-018**: After a safety pathway has been surfaced, onboarding MUST resume only once safety
  has been addressed, and MUST NOT treat the crisis moment as a routine data-collection step.
- **FR-019**: When a shared statement is ambiguous but could indicate a crisis, the experience
  MUST err toward surfacing safety resources rather than ignoring the possible signal.

**Offline-first and continuity (Principle VIII)**

- **FR-020**: The onboarding conversation and Living Record capture MUST function without a
  network connection, capturing responses locally.
- **FR-020a**: The experience MUST NOT require account creation or authentication before the
  onboarding conversation begins; the patient MUST be able to start immediately with data
  captured locally.
- **FR-020b**: The patient MUST be able to create or link an account after onboarding to enable
  synchronization; until then, their locally captured Living Record MUST remain usable.
- **FR-021**: Locally captured onboarding data MUST synchronize when connectivity is restored
  without data loss and without creating duplicate Living Record entries.
- **FR-022**: Any part of onboarding that genuinely requires connectivity MUST degrade
  gracefully and clearly communicate the offline limitation.
- **FR-023**: If the patient abandons onboarding partway, progress and captured entries MUST be
  preserved so the patient can resume later without losing data or repeating everything.
- **FR-024**: For a returning patient who already has a record, the experience MUST recognize
  the existing record and MUST NOT overwrite or duplicate it.

**Completion (Pillar 1 outcome)**

- **FR-025**: On conclusion, the experience MUST confirm to the patient that a foundational
  Living Record has been started and that they are ready to receive daily guidance.

### Key Entities *(include if feature involves data)*

- **Patient**: The person onboarding. Owns all their health data. Key attributes: identity/
  profile basics gathered conversationally, and the consent choices they have made.
- **Onboarding Conversation**: The evolving dialogue session. Key attributes: sequence of
  exchanges, progress/completion state, and whether it was completed, abandoned, or resumed.
- **Living Record**: The patient's evolving longitudinal health picture, seeded during
  onboarding. Composed of individual entries.
- **Living Record Entry**: A single discrete, categorized piece of information (e.g., a goal, a
  concern, a health-context detail). Key attributes: category, content, timestamp, source
  attribution (onboarding), and correctable/removable status.
- **Consent Record**: The patient's granular consent decisions, recorded and auditable to
  satisfy HIPAA and GDPR obligations. Key attributes: which data uses were granted or declined,
  when, and current revocation status.
- **Safety Event**: A crisis/emergency signal detected during onboarding. Key attributes: that
  it occurred, what safety pathway was surfaced, and the point in the conversation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 80% of first-time patients who begin onboarding complete it and finish
  with a Living Record containing at least one patient-confirmed entry.
- **SC-002**: In post-onboarding feedback, at least 85% of patients rate the experience as
  feeling like a conversation with a person rather than filling out a form.
- **SC-003**: 100% of onboarding sessions that collect health information capture the patient's
  granular consent before any such information is stored.
- **SC-004**: 100% of onboarding sessions in which a crisis signal is expressed surface safety
  resources before any further onboarding question is asked.
- **SC-005**: A patient can begin and continue onboarding with no connectivity, and 100% of
  data captured offline appears synchronized exactly once (no loss, no duplicates) after
  reconnection.
- **SC-006**: At least 90% of patients can, immediately after onboarding, correctly state that
  VITA is a companion (not a medical provider) and that its guidance is informational.
- **SC-007**: A patient can locate how to view, export, delete their data, and revoke consent
  within the onboarding experience without external help.
- **SC-008**: A typical patient completes a meaningful first conversation in under 10 minutes,
  while patients who wish to share more are not cut off.

## Assumptions

- **Single patient role**: Onboarding targets the patient themselves as the sole user; caregiver
  or proxy onboarding is out of scope for this feature.
- **New-patient focus**: The primary flow assumes a first-time patient; returning-patient
  recognition (FR-024) is handled defensively but full account recovery/migration is out of
  scope here.
- **Companion conversation capability exists or is provided**: The underlying ability to hold an
  adaptive conversation is assumed available to this feature; its internal mechanics are defined
  during planning, not in this spec.
- **Safety resource content is available**: Appropriate crisis/emergency resources and escalation
  content are assumed to be provided (their sourcing and jurisdiction-specific accuracy are a
  dependency, not defined here).
- **Data rights mechanisms exist app-wide**: View/export/delete and consent-revocation are
  assumed to be supported capabilities of the broader product that onboarding surfaces, not
  built solely within onboarding. These must satisfy both HIPAA and GDPR-style obligations
  (see FR-016a).
- **Local-first identity**: Onboarding requires no account or authentication to begin; data is
  captured on-device and an account may be created/linked afterward to enable sync (see FR-020a,
  FR-020b). Full authentication and account-recovery design is handled in planning.
- **Language/locale**: A single primary language — **Spanish (`es`)** per the brand kit
  (`docs/design/brand-tokens.md`) — is assumed for the MVP; multi-language support is out of scope
  for this feature.
- **Standard mobile expectations**: Standard mobile responsiveness, error handling with
  user-friendly messaging, and secure on-device persistence are assumed per the constitution
  (Principle VII) without being re-specified per requirement.
