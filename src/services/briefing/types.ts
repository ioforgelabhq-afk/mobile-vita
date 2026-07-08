/**
 * View models for the Physician Briefing (spec 004). Derived, never persisted (research D2) —
 * see data-model.md.
 */
export interface BriefingSection {
  title: string;
  items: string[];
}

export interface BriefingScope {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  excludedCategories?: string[];
}

export interface BriefingDocument {
  patientId: string;
  generatedAt: string;
  disclaimer: string;
  sections: BriefingSection[];
  scope: { from?: string; to?: string; excludedCategories: string[] };
  isEmpty: boolean;
}
