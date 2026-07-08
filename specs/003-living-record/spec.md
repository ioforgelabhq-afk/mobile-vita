# Feature Specification: Living Record View

**Feature Branch**: `003-living-record`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "A dedicated Living Record view for VITA (Pillar 3). Onboarding
seeds the record and the daily check-in grows it, but there is no single place for the patient
to browse everything that's accumulated: their entries, health events, and daily history/trends.
Build that view: browse the full record, see daily score history/trends, search and filter,
correct or remove any item from one place, and export everything. Pure read/aggregate feature —
reuse the existing repository layer (LivingRecordRepository, HealthEventRepository,
DailyCheckinRepository, DailyScoreRepository); no new data capture, no new repositories needed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the whole Living Record in one place (Priority: P1)

A patient who has been using VITA for a while (onboarding + several daily check-ins) opens a
dedicated Living Record view. They see everything that has accumulated about them — the entries
from onboarding (goals, concerns, context, preferences) and the health events captured from daily
check-ins — organized and easy to scan, not scattered across separate onboarding-only screens.

**Why this priority**: This is the entire point of Pillar 3. Without one place to see the
accumulated record, the patient can't experience the value of everything VITA has been quietly
building. P1 because every other story in this feature depends on this view existing.

**Independent Test**: With a patient who has onboarding entries and daily-check-in health events
already in their record, opening the Living Record view shows all of them, correctly labeled by
category/type and source.

**Acceptance Scenarios**:

1. **Given** a patient with onboarding entries and health events from check-ins, **When** they
   open the Living Record view, **Then** they see both, clearly organized (e.g., by category or
   type), not just the onboarding-only subset.
2. **Given** an empty or sparse record, **When** the patient opens the view, **Then** it explains
   there is not much yet rather than showing a confusing empty state.
3. **Given** the view is open, **When** the patient looks at any item, **Then** they can see when
   it was captured and where it came from (e.g., "onboarding", "daily check-in").

---

### User Story 2 - See daily history and trends (Priority: P1)

The patient can see their history of daily check-ins and Daily Scores over time — not just
today's result (which the daily check-in feature already shows), but a look back at previous
days, so they can notice how they've been doing.

**Why this priority**: This was explicitly deferred from the daily check-in feature (which only
shows today's result) specifically to live here. Without it, days of check-ins accumulate with no
way to look back — a core promise of a longitudinal, "living" record. P1 alongside Story 1.

**Independent Test**: With several days of completed check-ins, the Living Record view shows a
history of daily scores (list and/or simple trend) that the patient can scroll through, each
still framed as informational.

**Acceptance Scenarios**:

1. **Given** multiple days of completed check-ins, **When** the patient views daily history,
   **Then** they see each day's score and band in chronological order.
2. **Given** the daily history is shown, **When** the patient looks at it, **Then** scores remain
   labeled as an informational wellness indicator, never a diagnosis (consistent with the daily
   check-in feature).
3. **Given** only one or zero days of history, **When** the patient views daily history, **Then**
   it shows what exists without implying a trend that isn't there.

---

### User Story 3 - Correct or remove any record item from one place (Priority: P1)

From the Living Record view, the patient can edit/correct or remove any entry or health event —
not only during the flow that originally captured it (onboarding review, daily check-in result),
but at any later time, from a single consistent place.

**Why this priority**: Principle II (patient owns their data) requires ongoing control, not just
a one-time correction window right after capture. P1 because data ownership is non-negotiable and
this view is the natural, persistent place to exercise it.

**Independent Test**: From the Living Record view, the patient can open any entry or health event,
change or remove it, and see the change reflected immediately and consistently (the corrected
value is used elsewhere in the app, e.g., today's daily result if unaffected by the edit).

**Acceptance Scenarios**:

1. **Given** an existing entry, **When** the patient corrects it from the Living Record view,
   **Then** the correction supersedes the prior value and is reflected in the view.
2. **Given** an existing health event, **When** the patient removes it, **Then** it no longer
   appears in the record.
3. **Given** the patient corrects or removes an item, **When** they look elsewhere in the app that
   references that data, **Then** they do not see the superseded value presented as current truth.

---

### User Story 4 - Search, filter, and export the record (Priority: P2)

The patient can narrow the Living Record view by category or date, and can export their full
record as a portable file to keep for themselves or share elsewhere.

**Why this priority**: Valuable once the record has enough content to need narrowing (Story 1/2
already deliver value without this). Export directly serves Principle II (data ownership) and
sets up future physician-briefing use. P2 because it's an enhancement to browsing, not the browsing
capability itself.

**Independent Test**: With a record spanning multiple categories and dates, the patient can filter
to a subset (e.g., only "concern" entries, or a date range) and can trigger an export that produces
a complete, portable copy of their record.

**Acceptance Scenarios**:

1. **Given** a record with multiple categories, **When** the patient filters by one category,
   **Then** only matching items are shown.
2. **Given** a record spanning multiple dates, **When** the patient filters by a date range,
   **Then** only items within that range are shown.
3. **Given** the patient requests an export, **When** it completes, **Then** they receive a
   complete, portable copy of their Living Record (entries, health events, daily check-ins/scores).

---

### Edge Cases

- **No data yet**: A brand-new patient (onboarding not completed, or completed with nothing
  captured) sees a clear "nothing here yet" state, not an error or a blank confusing screen.
- **Large history**: A patient with many months of daily check-ins can still scroll/browse without
  the view becoming unusably slow (reasonable pagination or lazy loading).
- **Item already corrected elsewhere**: If an item was corrected from its original capture screen
  (e.g., onboarding review) before the patient opens this view, the view shows the current
  (corrected) value, never the superseded one.
- **Offline use**: The patient can open and browse the Living Record view with no network
  connection, since all underlying data is already local.
- **Filter yields nothing**: An empty filter result explains that nothing matches rather than
  looking broken.
- **Mixed consent history**: If the patient declined health-data consent for a period and later
  granted it, the view shows only what was actually persisted for each period — it does not
  fabricate gaps as data.

## Requirements *(mandatory)*

### Functional Requirements

**Unified browsing (Principle VI)**

- **FR-001**: The system MUST provide a single Living Record view that shows the patient's
  Living Record entries and Health Events together, not only the subset visible on any single
  capture screen.
- **FR-002**: Each item shown MUST display its category/type, timestamp, and source (e.g.,
  onboarding, daily check-in).
- **FR-003**: The view MUST handle an empty or near-empty record with a clear explanatory state,
  not a blank or error-like screen.

**Daily history & trends (Principle III)**

- **FR-004**: The system MUST provide a history of the patient's completed daily check-ins and
  Daily Scores, viewable in chronological order.
- **FR-005**: Every Daily Score shown in the history MUST retain its informational framing (band,
  disclaimer) — never presented as a diagnosis.
- **FR-006**: With fewer than two days of history, the view MUST NOT imply a trend that cannot be
  computed from the available data.

**Ownership: correct, remove, export (Principle II)**

- **FR-007**: The patient MUST be able to correct any Living Record entry or Health Event from
  the Living Record view; a correction MUST supersede the prior value rather than retaining it as
  truth.
- **FR-008**: The patient MUST be able to remove any Living Record entry or Health Event from the
  Living Record view (soft delete, consistent with existing repository behavior).
- **FR-009**: Corrections and removals made from this view MUST be reflected consistently
  elsewhere in the app that references the same underlying data.
- **FR-010**: The patient MUST be able to export their complete Living Record (entries, health
  events, daily check-ins, and daily scores) as a single portable, machine-readable copy.

**Search & filter**

- **FR-011**: The patient MUST be able to filter the Living Record view by category/type.
- **FR-012**: The patient MUST be able to filter the Living Record view by a date range.
- **FR-013**: A filter that matches nothing MUST clearly indicate no results, not appear broken.

**Architecture & reuse (Principle IX)**

- **FR-014**: This feature MUST reuse the existing repository layer (LivingRecordRepository,
  HealthEventRepository, DailyCheckinRepository, DailyScoreRepository) without introducing new
  repositories or duplicating their logic; it is a read/aggregate and edit-via-existing-methods
  feature.
- **FR-015**: The Living Record view MUST function fully offline, since all data it displays is
  already stored locally.

### Key Entities *(include if feature involves data)*

This feature introduces no new entities. It reads and aggregates existing ones:

- **LivingRecordEntry** (reused) — categorized entries from onboarding/daily check-ins.
- **HealthEvent** (reused) — symptoms and other health occurrences.
- **DailyCheckin** / **DailyScore** (reused) — the daily history and trend data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient with existing onboarding entries and daily check-in history can find any
  specific past item (an entry or a health event) in under 30 seconds using the Living Record view.
- **SC-002**: 100% of items shown in the Living Record view display their category/type,
  timestamp, and source.
- **SC-003**: 100% of corrections or removals made from the Living Record view are reflected
  consistently in any other part of the app that displays the same data.
- **SC-004**: A patient can export their complete Living Record and receive a file containing
  100% of their stored entries, health events, check-ins, and scores.
- **SC-005**: The Living Record view loads and is usable with no network connection.
- **SC-006**: At least 85% of patients, in feedback, agree the Living Record view helps them see
  their health information "all in one place."
- **SC-007**: Filtering by category or date range returns results in under 1 second for a typical
  patient's record size.

## Assumptions

- **Data already exists**: This feature depends on onboarding (001) and daily check-in (002)
  having already captured data; it does not itself create Living Record entries or Health Events.
- **No new entities/repositories**: All data comes from the four existing repositories (FR-014);
  no Goal, Medication, or Physician data is included (those are separate future features).
- **Read-mostly with existing edit primitives**: "Correct" and "remove" in this feature call the
  same repository methods (`correct`/`remove`) already used by onboarding review and daily
  check-in — this feature is a new, persistent surface for them, not new logic.
- **Export reuses/extends the existing export shape**: `LivingRecordRepository.export()` already
  exports entries; this feature's export additionally includes health events, check-ins, and
  scores, packaged as one file.
- **No physician sharing here**: Sharing the export with a physician (Pillar 4) is a distinct
  future feature; this feature only produces the exportable file for the patient's own use.
- **Spanish-first (`es`)**: Consistent with the brand kit and prior features.
