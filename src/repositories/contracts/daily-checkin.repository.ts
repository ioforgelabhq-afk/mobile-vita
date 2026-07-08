import type { DailyCheckin, Mood } from './schemas';

export interface CheckinPatch {
  mood?: Mood;
  energy?: number;
  sleepHours?: number;
  symptoms?: string[];
  notes?: string;
}

/** DailyCheckinRepository — one-per-day lifecycle (contracts/daily-checkin.contract.md; FR-004/005). */
export interface DailyCheckinRepository {
  forDate(patientId: string, date: string): Promise<DailyCheckin | null>;
  startOrResume(patientId: string, date: string): Promise<DailyCheckin>;
  update(checkInId: string, patch: CheckinPatch, clientMutationId: string): Promise<DailyCheckin>;
  complete(checkInId: string, dailyScoreId: string, clientMutationId: string): Promise<DailyCheckin>;
  list(patientId: string): Promise<DailyCheckin[]>;
}
