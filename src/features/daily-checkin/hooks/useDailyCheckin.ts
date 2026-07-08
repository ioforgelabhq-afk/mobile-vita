import { useCallback, useEffect } from 'react';
import { authRepository } from '@/repositories';
import { todayLocal } from '@/lib/date';
import { uuid } from '@/lib/ids';
import { useDailyCheckinStore } from '@/stores/daily-checkin';
import { startCheckin, submitAnswer } from '@/features/daily-checkin/checkin-runner';

/**
 * Thin React wrapper over the pure check-in runner. Holds the current check-in + transcript + step
 * in the Zustand store; safety interventions park in `pendingSafety` and block advancing until
 * acknowledged (FR-020). When the flow finishes, `score`/`done` drive the result screen.
 */
export function useDailyCheckin() {
  const { checkin, step, transcript, pendingSafety, score, done, set, reset } =
    useDailyCheckinStore();

  const begin = useCallback(async () => {
    const patient = await authRepository().getOrCreateLocalIdentity();
    const res = await startCheckin(patient.id, todayLocal());
    if (res.alreadyDone) {
      set({ checkin: res.checkin, done: true, score: res.score });
      return;
    }
    set({
      checkin: res.checkin,
      step: res.step,
      done: false,
      score: null,
      transcript: [{ id: uuid(), role: 'companion', text: res.prompt }],
    });
  }, [set]);

  useEffect(() => {
    if (!checkin && !done) void begin();
  }, [checkin, done, begin]);

  const send = useCallback(
    async (text: string) => {
      const s = useDailyCheckinStore.getState();
      if (!s.checkin || !s.step) return;
      const withPatient = [...s.transcript, { id: uuid(), role: 'patient' as const, text }];
      set({ transcript: withPatient });

      const res = await submitAnswer(s.checkin, s.step, text);
      set({ checkin: res.checkin });

      if (res.safetyEvent) {
        set({ pendingSafety: res.safetyEvent });
        return;
      }
      if (res.reframe) {
        set({ transcript: [...withPatient, { id: uuid(), role: 'companion', text: res.reframe }] });
        return;
      }
      if (res.done) {
        set({ done: true, score: res.score ?? null });
        return;
      }
      set({
        step: res.nextStep ?? s.step,
        transcript: [...withPatient, { id: uuid(), role: 'companion', text: res.prompt ?? '' }],
      });
    },
    [set],
  );

  const acknowledgeSafety = useCallback(() => set({ pendingSafety: null }), [set]);

  return { checkin, step, transcript, pendingSafety, score, done, send, acknowledgeSafety, reset };
}
