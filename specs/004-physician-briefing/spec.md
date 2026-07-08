# Feature Specification: Physician Briefing

**Feature Branch**: `004-physician-briefing`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Physician briefing for VITA (Pillar 4). The patient can manage
physician contacts and generate a physician-ready summary from their Living Record — clearly
informational, never diagnostic — gated on the existing `share_with_physician` consent purpose.
Reuses the Living Record view's aggregation (entries, health events, daily score history) and the
existing Physician entity/consent purpose already defined in the domain model and API contract."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage physician contacts (Priority: P1)

The patient can add, edit, and remove the physicians involved in their care — name, specialty,
organization, and contact details — so that later they have someone to prepare a briefing for.

**Why this priority**: Without a physician on file, there's nothing to brief. This is the
foundational data the rest of the feature depends on. P1 because every other story needs at least
one physician to exist to be meaningfully tested.

**Independent Test**: The patient can add a physician with a name (minimum required field),
optionally fill in specialty/organization/contact/notes, see it in a list, edit it, and remove it.

**Acceptance Scenarios**:

1. **Given** the patient wants to add a physician, **When** they provide at least a name,
   **Then** the physician is saved and appears in their list of physicians.
2. **Given** an existing physician, **When** the patient edits their details, **Then** the
   updated information is what's shown and used going forward.
3. **Given** an existing physician, **When** the patient removes them, **Then** they no longer
   appear in the list.

---

### User Story 2 - Generate an informational, physician-ready briefing (Priority: P1)

From their Living Record, the patient can generate a briefing — a clear, organized summary
covering their entries (goals, concerns, context, preferences), health events, and daily score
history — written to be useful context for a physician, explicitly framed as informational and
patient-reported, never as a diagnosis or clinical assessment.

**Why this priority**: This is the core value of Pillar 4 — turning the accumulated Living Record
into something a physician can actually use. P1 because it's the entire point of the feature.

**Independent Test**: With a patient who has onboarding entries, some health events, and several
days of check-in history, generating a briefing produces a single organized document containing
all three, with a visible statement that the content is patient-reported/informational.

**Acceptance Scenarios**:

1. **Given** a patient with Living Record data, **When** they generate a briefing, **Then** it
   includes their entries, health events, and daily score history, organized and readable.
2. **Given** a generated briefing, **When** the patient or physician reads it, **Then** it clearly
   states the content is patient-reported and informational, not a diagnosis or clinical opinion.
3. **Given** a patient with little or no Living Record data, **When** they generate a briefing,
   **Then** it reflects that plainly rather than fabricating content.

---

### User Story 3 - Sharing requires explicit consent (Priority: P1)

Generating or viewing a briefing for sharing purposes requires the patient to have granted the
`share_with_physician` consent. If they haven't, VITA explains why and offers to collect that
consent; declining does not block any other part of the app.

**Why this priority**: Principle II (data ownership) and VII (privacy by design) make sharing
health data with any third party — including a physician — subject to explicit, informed,
revocable consent. This is non-negotiable and must gate the feature from the start. P1.

**Independent Test**: Without `share_with_physician` consent granted, attempting to generate a
briefing shows an explanation and a path to grant consent instead of silently producing the
briefing; after granting consent, the briefing generates normally.

**Acceptance Scenarios**:

1. **Given** the patient has not granted `share_with_physician` consent, **When** they try to
   generate a briefing, **Then** they see an explanation and an option to grant that consent.
2. **Given** the patient grants `share_with_physician` consent, **When** they generate a
   briefing, **Then** it proceeds normally.
3. **Given** the patient later revokes `share_with_physician` consent, **When** they try to
   generate a new briefing, **Then** they are asked to grant it again — a previously generated
   briefing does not silently persist as an active sharing channel.

---

### User Story 4 - Choose what's included before finalizing (Priority: P2)

Before finalizing a briefing, the patient can review it and narrow what's included — such as a
date range or specific categories — so they share only what's relevant.

**Why this priority**: Enhances the core briefing capability (Story 2 already delivers value on
its own with the full record). P2 because it's a refinement of scope, not the briefing capability
itself.

**Independent Test**: The patient can preview a briefing, apply a date-range or category filter,
and see the briefing update to reflect only the selected scope.

**Acceptance Scenarios**:

1. **Given** a generated briefing, **When** the patient applies a date range, **Then** only data
   within that range appears in the briefing.
2. **Given** a generated briefing, **When** the patient excludes a category, **Then** that
   category's items no longer appear.

---

### Edge Cases

- **No physicians on file**: Generating a briefing without any physician saved still works (the
  briefing is about the patient's data, not tied to a specific recipient); the patient is
  prompted to add a physician if they want to associate one.
- **No Living Record data yet**: The briefing plainly states there isn't much recorded yet, rather
  than presenting an empty or broken-looking document.
- **Consent revoked mid-session**: If consent is revoked while a briefing is open, the patient can
  still view what they already generated locally, but generating a new one requires consent again.
- **Duplicate physician**: Adding a physician with the same name as an existing one is allowed
  (patients may see multiple providers with common names); no uniqueness is enforced.
- **Offline use**: The patient can manage physicians and generate a briefing with no network
  connection, since generation is a local, informational summary — not a diagnosis requiring
  external validation.
- **Very large record**: A patient with months of history can still generate and read a briefing
  without it becoming unusably long (e.g., date-range narrowing from Story 4 helps here).

## Requirements *(mandatory)*

### Functional Requirements

**Physician contacts (Principle II)**

- **FR-001**: The patient MUST be able to add a physician with at least a name; specialty,
  organization, phone, email, and notes MUST be optional.
- **FR-002**: The patient MUST be able to view a list of their saved physicians.
- **FR-003**: The patient MUST be able to edit any saved physician's details.
- **FR-004**: The patient MUST be able to remove a saved physician.

**Briefing generation (Principles III, VI)**

- **FR-005**: The system MUST generate a briefing that includes the patient's Living Record
  entries, health events, and daily score history.
- **FR-006**: The briefing MUST be organized and readable (not a raw data dump), suitable for a
  physician to review as context.
- **FR-007**: The briefing MUST prominently state that its content is patient-reported and
  informational, and MUST NOT present any diagnosis, prognosis, or clinical assessment.
- **FR-008**: A briefing generated from a sparse or empty Living Record MUST reflect that
  plainly, not fabricate or imply content that doesn't exist.
- **FR-009**: The briefing MUST retain each item's original informational framing (e.g., Daily
  Score bands remain labeled as wellness indicators, not diagnoses).

**Consent gating (Principles II, VII)**

- **FR-010**: Generating a briefing intended for sharing MUST require the patient's granted
  `share_with_physician` consent.
- **FR-011**: Without that consent, the system MUST explain why and offer a path to grant it,
  MUST NOT generate a shareable briefing, and MUST NOT block any other app functionality.
- **FR-012**: If `share_with_physician` consent is later revoked, generating a new briefing MUST
  require the patient to grant it again.

**Scoping the briefing (P2)**

- **FR-013**: The patient MUST be able to narrow a briefing by date range.
- **FR-014**: The patient MUST be able to exclude specific categories/types of data from a
  briefing.

**Architecture & reuse (Principle IX)**

- **FR-015**: The system MUST reuse the existing Living Record aggregation (entries, health
  events, daily score history) and the existing `Physician` entity/`share_with_physician` consent
  purpose already defined in the domain model and API contract, rather than duplicating this data
  or introducing a new consent purpose.
- **FR-016**: All physician-contact data access MUST go through a repository with Mock and API
  implementations selected by feature flags, consistent with every other data type in the app.
- **FR-017**: Managing physician contacts and generating a briefing MUST function fully offline.

### Key Entities *(include if feature involves data)*

- **Physician** (new repository; entity already defined in the domain model) — name, specialty,
  organization, phone, email, notes, and whether it has been shared under consent.
- **Briefing** (derived, not persisted as a new entity) — an organized, informational document
  composed from existing Living Record entries, health events, and daily score history, scoped by
  optional date range/category filters, always carrying an informational disclaimer.
- Reused: **LivingRecordEntry**, **HealthEvent**, **DailyCheckin**, **DailyScore**,
  **ConsentRecord** (specifically the `share_with_physician` purpose).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can add a physician with just a name in under 15 seconds.
- **SC-002**: 100% of generated briefings include a visible informational/patient-reported
  disclaimer and contain no diagnostic language.
- **SC-003**: 100% of briefing-generation attempts without `share_with_physician` consent are
  blocked with an explanation, and 100% succeed once consent is granted.
- **SC-004**: A patient can generate a complete briefing from their existing Living Record data
  in under 5 seconds (on-device, no network dependency).
- **SC-005**: 100% of briefings generated with a date-range or category filter applied contain
  only data within that scope.
- **SC-006**: The physician-contacts list and briefing generation are fully usable with no network
  connection.
- **SC-007**: At least 85% of patients, in feedback, agree the briefing "would be useful to show a
  doctor."

## Assumptions

- **No new consent purpose**: `share_with_physician` already exists (defined during feature 001's
  planning); this feature is the first to actually gate behavior on it.
- **One new repository, deliberately**: Unlike feature 003, this feature legitimately introduces
  `PhysicianRepository` — physician contacts are genuinely new persisted data, not an aggregation
  of existing data. Everything else (entries, health events, scores) is reused.
- **Briefing is a view, not a new stored entity**: The briefing document is generated on demand
  from existing data; it is not itself persisted as a new record (consistent with keeping this
  feature's data footprint minimal).
- **Sharing mechanism deferred**: Actually transmitting the briefing (share sheet, PDF, email) is
  out of scope for this MVP, consistent with feature 003's deferral of file/share output — this
  feature produces a complete, viewable briefing in-app; transmission is a follow-up.
- **No new safety/diagnostic risk**: This feature does not collect new patient-authored free text
  requiring safety screening; it aggregates and presents existing, already-governed data.
- **Spanish-first (`es`)**: Consistent with the brand kit and prior features.
