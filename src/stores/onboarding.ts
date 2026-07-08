import { create } from 'zustand';
import type { ConversationTurn, SafetyEvent } from '@/repositories/contracts/schemas';

/**
 * Ephemeral UI/session state for onboarding (Zustand). Durable data lives in repositories;
 * this only holds what the screens need in-memory: the visible transcript, the pending safety
 * intervention (which must be cleared before onboarding resumes — FR-018), and completion.
 */
interface OnboardingState {
  conversationId: string | null;
  turns: ConversationTurn[];
  pendingSafety: SafetyEvent | null;
  completed: boolean;

  setConversation: (id: string) => void;
  setTurns: (turns: ConversationTurn[]) => void;
  appendTurns: (turns: ConversationTurn[]) => void;
  setPendingSafety: (event: SafetyEvent | null) => void;
  setCompleted: (v: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  conversationId: null,
  turns: [],
  pendingSafety: null,
  completed: false,

  setConversation: (id) => set({ conversationId: id }),
  setTurns: (turns) => set({ turns }),
  appendTurns: (turns) => set((s) => ({ turns: [...s.turns, ...turns] })),
  setPendingSafety: (event) => set({ pendingSafety: event }),
  setCompleted: (v) => set({ completed: v }),
  reset: () => set({ conversationId: null, turns: [], pendingSafety: null, completed: false }),
}));
