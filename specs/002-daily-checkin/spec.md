# Feature Specification: Daily Guidance & Daily Check-in

**Feature Branch**: `002-daily-checkin`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Daily guidance and daily check-in for VITA (Pillar 2). A brief,
human-feeling daily check-in that produces an informational Daily Score and Insights, enriches
the Living Record, screens for safety, enforces one-per-day, and works offline. Reuses the
onboarding feature's repository layer, SafetyService, guardrails, consent gate, and design tokens."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A quick, human daily check-in that produces a Daily Score (Priority: P1)

A patient who has completed onboarding opens VITA later in the day. The companion greets them and
offers a brief, conversational check-in — asking how they feel (mood, energy, sleep, anything
notable) one thing at a time, never as a clinical form. When the check-in concludes, VITA shows an
informational **Daily Score** — a wellness indicator with a simple band (low / moderate / good /
great) and a short breakdown of what contributed — clearly framed as information, not a diagnosis.

**Why this priority**: This is the core daily loop and the heart of Pillar 2. Without a check-in
that feels human and yields a Daily Score, the feature delivers no daily guidance. It is the
minimum viable slice: a patient can check in once and see their score.

**Independent Test**: A patient can complete a check-in conversation end-to-end and see a Daily
Score with a band and component breakdown, with no clinical intake form shown and no diagnostic
language.

**Acceptance Scenarios**:

1. **Given** an onboarded patient opening VITA, **When** they start the daily check-in, **Then**
   the companion asks about their day conversationally, one prompt at a time.
2. **Given** a completed check-in, **When** the score is shown, **Then** a Daily Score (0–100) with
   a band and a component breakdown appears, labeled as an informational wellness indicator.
3. **Given** the Daily Score is shown, **When** the patient reads it, **Then** no diagnostic or
   clinical-instruction language is present, and informational framing is visible.
4. **Given** a patient has already completed today's check-in, **When** they return the same
   calendar day, **Then** they are not asked to check in again and instead see today's result.

---

### User Story 2 - Every check-in enriches the Living Record (Priority: P1)

As the patient shares during the check-in, meaningful information flows into their Living Record:
symptoms they mention become Health Events, and the check-in itself plus its Daily Score are stored
as attributable, timestamped, patient-correctable records. Over days, the record visibly grows.

**Why this priority**: Principle VI — every meaningful interaction must improve the Living Record.
A check-in that captures nothing has no lasting value; this is what turns daily use into a
longitudinal record. P1 because it is inseparable from the check-in's purpose.

**Independent Test**: After a check-in that mentions a symptom, the patient can see a corresponding
Health Event and the stored check-in + Daily Score in their record, each timestamped and editable.

**Acceptance Scenarios**:

1. **Given** a check-in where the patient mentions a symptom, **When** the check-in is saved,
   **Then** a Health Event is created for that symptom, attributed to the check-in and timestamped.
2. **Given** a completed check-in, **When** it is saved, **Then** the check-in and its Daily Score
   are stored as records the patient can later view and correct.
3. **Given** stored check-in data, **When** the patient corrects or removes an entry, **Then** the
   record reflects the change and does not retain the superseded value as truth.
4. **Given** health-bearing information from a check-in, **When** it is about to be stored, **Then**
   it is stored only if the patient has consented to storing health data.

---

### User Story 3 - Informational Insights that gently guide (Priority: P2)

Alongside the Daily Score, VITA surfaces one or more **Insights** — a noticed trend, a piece of
gentle education, encouragement, or a suggestion (e.g., a reminder idea). Each Insight is framed as
information, never a diagnosis, and shown with its informational framing. The patient can dismiss an
Insight.

**Why this priority**: Insights are what make the guidance feel *guiding* rather than just a score.
P2 because the check-in + score (P1) already deliver value; insights enrich it and can ship next.

**Independent Test**: After a check-in, the patient sees at least one relevant Insight with
informational framing, and can dismiss it so it does not persist as active.

**Acceptance Scenarios**:

1. **Given** a completed check-in (and any prior history), **When** the result is shown, **Then**
   at least one relevant Insight appears, framed as information.
2. **Given** an Insight, **When** the patient reads it, **Then** it contains no diagnostic assertion
   and includes informational framing.
3. **Given** an Insight, **When** the patient dismisses it, **Then** it no longer appears as active.

---

### User Story 4 - Safety first, and works offline (Priority: P1)

If the patient reveals a crisis or emergency signal during the check-in, VITA surfaces safety
resources ahead of continuing — exactly as in onboarding. The entire check-in also works without
connectivity: it captures locally, computes the Daily Score on-device, and syncs later without
creating duplicates.

**Why this priority**: Principles IV and VIII are non-negotiable and must hold in the daily loop,
not just onboarding. P1 because a daily feature that fails offline or ignores a crisis is unsafe
and unreliable.

**Independent Test**: Injecting a crisis phrase surfaces resources before the check-in continues;
with connectivity disabled, the patient can complete a check-in, see an on-device Daily Score, and
on reconnect the data appears exactly once.

**Acceptance Scenarios**:

1. **Given** a check-in in progress, **When** the patient expresses a crisis signal, **Then** safety
   resources are surfaced ahead of continuing the check-in.
2. **Given** no network connection, **When** the patient completes a check-in, **Then** it is
   captured locally and the Daily Score is computed and shown on-device.
3. **Given** check-in data captured offline, **When** connectivity returns, **Then** it synchronizes
   without loss and without duplicate records.

---

### Edge Cases

- **Second attempt same day**: A patient who already checked in today sees today's result, not a new
  check-in (one-per-day). A new check-in becomes available the next calendar day.
- **Minimal / skipped answers**: The patient can give sparse answers or skip questions; the check-in
  still concludes and still produces a Daily Score from whatever was shared.
- **Day boundary / timezone**: "One per day" is evaluated on the patient's local calendar day.
- **No consent to store health data**: The check-in still runs and shows a Daily Score, but health
  information is not persisted; the patient is informed of the limitation.
- **First-ever check-in (no history)**: Insights that need history degrade gracefully (e.g., an
  encouragement/education insight instead of a trend).
- **Ambiguous crisis signal**: The experience errs toward surfacing safety resources.
- **Patient requests a diagnosis during check-in**: The companion declines, reframes as
  informational, and points to a licensed provider.
- **Interrupted check-in**: A partially completed check-in can be resumed the same day without
  duplicating the day's record.

## Requirements *(mandatory)*

### Functional Requirements

**Daily check-in experience (Principle V)**

- **FR-001**: The daily check-in MUST present as a brief conversation, one prompt at a time, and
  MUST NOT present a clinical intake form.
- **FR-002**: The check-in MUST cover the patient's current state (at minimum mood; and where
  offered, energy, sleep, symptoms, and free notes) through conversational prompts.
- **FR-003**: The check-in MUST accept minimal, partial, or skipped answers and still conclude and
  still produce a Daily Score.
- **FR-004**: The system MUST allow at most one completed check-in per patient per local calendar
  day; a repeat visit the same day MUST show that day's existing result rather than a new check-in.
- **FR-005**: A partially completed check-in MUST be resumable the same day without creating a
  duplicate record for that day.

**Daily Score (Principle III)**

- **FR-006**: On check-in completion, the system MUST compute and display a Daily Score in the range
  0–100 with a band of `low` | `moderate` | `good` | `great`.
- **FR-007**: The Daily Score MUST include a breakdown of the components that contributed to it.
- **FR-008**: The Daily Score MUST be presented as an informational wellness indicator and MUST NOT
  be framed as a diagnosis, prognosis, or clinical instruction.
- **FR-009**: The Daily Score MUST be computed on-device so it is available without connectivity.

**Insights (Principles III, VI)**

- **FR-010**: After a check-in, the system MUST surface at least one Insight relevant to the patient.
- **FR-011**: Every Insight MUST be framed as information (trend, education, encouragement, or
  suggestion) and MUST NOT contain a diagnostic assertion or clinical instruction.
- **FR-012**: Each Insight MUST display its informational framing/disclaimer before or with its
  content.
- **FR-013**: The patient MUST be able to dismiss an Insight so it no longer appears as active.
- **FR-014**: Insights that depend on history MUST degrade gracefully when little or no history
  exists (e.g., substitute an educational or encouraging Insight).

**Living Record enrichment (Principles II, VI)**

- **FR-015**: Symptoms mentioned in a check-in MUST be captured as Health Events, attributed to the
  check-in and timestamped.
- **FR-016**: The completed check-in and its Daily Score MUST be stored as attributable, timestamped
  records the patient can view.
- **FR-017**: The patient MUST be able to correct or remove check-in-derived records; a correction
  MUST supersede the prior value rather than retaining it as truth.
- **FR-018**: Any health-bearing write MUST be gated by the patient's consent to store health data;
  without it, the check-in runs and shows a score but does not persist health information, and the
  patient is informed.

**Safety (Principle IV)**

- **FR-019**: The system MUST screen every patient message during the check-in for crisis/emergency
  signals before normal flow, using the same safety screening as onboarding.
- **FR-020**: On a detected crisis signal, the system MUST surface safety resources ahead of
  continuing the check-in, and MUST err toward surfacing on ambiguous signals.
- **FR-021**: If the patient requests a diagnosis or treatment decision, the companion MUST decline,
  reframe as informational, and point to a licensed provider.

**Offline-first (Principle VIII)**

- **FR-022**: The check-in and Daily Score MUST function without a network connection, capturing
  responses locally.
- **FR-023**: Data captured offline MUST synchronize when connectivity returns without loss and
  without creating duplicate records (including no duplicate check-in for the day).

**Architecture & reuse (Principle IX)**

- **FR-024**: All data access MUST go through the repository layer with Mock and API implementations
  selected by feature flags; the feature MUST reuse the existing SafetyService, guardrails, consent
  gate, repository registry, and design tokens rather than duplicating them.

### Key Entities *(include if feature involves data)*

- **Daily Check-in**: A once-per-day interaction. Attributes: patient, local date (unique per
  patient/day), captured responses (mood, energy, sleep, symptoms, notes), completion state, link to
  the conversation and to the produced Daily Score.
- **Daily Score**: An informational wellness indicator for a date. Attributes: patient, date
  (unique per patient/day), score (0–100), band, component breakdown, link to the check-in,
  computed-at timestamp, informational-framing flag.
- **Health Event**: A discrete health occurrence captured from the check-in (e.g., a symptom).
  Attributes: patient, type/category, description, when it occurred, source (daily check-in),
  timestamps.
- **Insight**: An informational observation surfaced to the patient. Attributes: patient, title,
  body, category (trend / education / encouragement / reminder-suggestion), informational framing,
  relation to a source (score/event), generated-at, dismissed state.
- **Conversation (type = daily_checkin)**: The dialogue backing the check-in, reusing the existing
  Conversation entity with its turns and safety events.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 80% of patients who start a daily check-in complete it and see a Daily Score.
- **SC-002**: A typical daily check-in can be completed in under 2 minutes.
- **SC-003**: In feedback, at least 85% of patients rate the check-in as feeling like a conversation
  rather than a form.
- **SC-004**: 100% of completed check-ins produce a Daily Score with a band and component breakdown.
- **SC-005**: 100% of completed check-ins surface at least one Insight.
- **SC-006**: 100% of check-in sessions enforce one-per-day (no patient can create two check-in
  records for the same local calendar day).
- **SC-007**: 100% of check-in sessions in which a crisis signal is expressed surface safety
  resources before continuing.
- **SC-008**: A patient can complete a check-in fully offline and see an on-device Daily Score;
  100% of offline-captured data appears synchronized exactly once after reconnection.
- **SC-009**: At least 90% of patients can, immediately after a check-in, correctly state that the
  Daily Score is an informational indicator and not a diagnosis.
- **SC-010**: Every completed check-in results in at least one new or updated Living Record item
  (check-in, score, and any symptom health events).

## Assumptions

- **Onboarding precedes this feature**: The patient has completed onboarding (has a local identity,
  a Living Record, and consent decisions). Guidance for brand-new users without onboarding is out of
  scope here.
- **Reuse of onboarding foundations**: The repository layer, SafetyService, guardrails, consent
  gate, repository registry, and design tokens from `specs/001-conversational-onboarding/` are
  reused; this feature does not re-implement them.
- **Daily Score is heuristic**: The score is a transparent, on-device heuristic (a weighted
  combination of check-in inputs), not a clinical instrument; exact weighting is a planning detail.
- **One primary locale**: Spanish (`es`) per the brand kit; multi-language is out of scope.
- **Local calendar day**: "One per day" uses the device's local date; cross-timezone travel edge
  cases are out of scope for the MVP.
- **No backend**: Mock repositories are the default; API implementations are stubs conforming to the
  documented contract until a backend exists.
- **Reminders/notifications are suggestions only**: Insights may *suggest* reminders; actually
  scheduling push notifications is out of scope for this feature (a later Notification feature).
