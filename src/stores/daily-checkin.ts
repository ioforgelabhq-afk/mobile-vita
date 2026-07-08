import { create } from 'zustand';
import type { DailyCheckin, DailyScore, Insight, SafetyEvent } from '@/repositories/contracts/schemas';
import type { DailyStepId } from '@/features/daily-checkin/flow/engine';

/** Lightweight transcript message for the daily check-in UI (durable turn storage deferred). */
export interface DailyMsg {
  id: string;
  role: 'companion' | 'patient';
  text: string;
}

/**
 * Ephemeral UI state for the daily check-in. Durable data lives in the repositories; this holds
 * the in-progress transcript, current step, a pending safety intervention (must clear before the
 * check-in resumes — FR-020), and the computed score for the result screen.
 */
interface DailyCheckinState {
  checkin: DailyCheckin | null;
  step: DailyStepId | null;
  transcript: DailyMsg[];
  pendingSafety: SafetyEvent | null;
  score: DailyScore | null;
  insights: Insight[];
  done: boolean;

  set: (partial: Partial<DailyCheckinState>) => void;
  reset: () => void;
}

const initial = {
  checkin: null,
  step: null,
  transcript: [] as DailyMsg[],
  pendingSafety: null,
  score: null,
  insights: [] as Insight[],
  done: false,
};

export const useDailyCheckinStore = create<DailyCheckinState>((set) => ({
  ...initial,
  set: (partial) => set(partial),
  reset: () => set(initial),
}));
