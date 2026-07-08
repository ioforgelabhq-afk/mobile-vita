import type { Insight, InsightCategory } from './schemas';

export interface AddInsightInput {
  patientId: string;
  title: string;
  body: string;
  category: InsightCategory;
  relatedEntityType?: Insight['relatedEntityType'];
  relatedEntityId?: string | null;
}

/** InsightRepository — informational insights (contracts/insight.contract.md; FR-010–014). */
export interface InsightRepository {
  list(patientId: string, opts?: { includeDismissed?: boolean }): Promise<Insight[]>;
  add(input: AddInsightInput, clientMutationId: string): Promise<Insight>;
  dismiss(insightId: string, clientMutationId: string): Promise<Insight>;
}
