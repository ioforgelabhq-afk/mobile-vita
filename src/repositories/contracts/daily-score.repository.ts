import type { DailyScore, ScoreBand, ScoreComponent } from './schemas';

export interface SaveScoreInput {
  patientId: string;
  date: string;
  score: number;
  band: ScoreBand;
  components: ScoreComponent[];
  checkInId?: string | null;
}

/** DailyScoreRepository — persists the on-device Daily Score (contracts/daily-score.contract.md). */
export interface DailyScoreRepository {
  forDate(patientId: string, date: string): Promise<DailyScore | null>;
  save(input: SaveScoreInput, clientMutationId: string): Promise<DailyScore>;
  list(patientId: string): Promise<DailyScore[]>;
}
