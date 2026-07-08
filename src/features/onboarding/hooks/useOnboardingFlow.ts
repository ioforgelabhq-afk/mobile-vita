import { useCallback, useEffect } from 'react';
import { authRepository, conversationRepository } from '@/repositories';
import { useOnboardingStore } from '@/stores/onboarding';
import { uuid } from '@/lib/ids';

/**
 * Drives the onboarding conversation. Bridges the ConversationRepository (via the registry —
 * never a concrete impl) to the Zustand UI store. Safety is honored: when a companion response
 * carries a safetyEvent, it is parked in `pendingSafety` and normal flow does not continue until
 * the patient acknowledges (FR-018). Completion is triggered when the flow reaches its end.
 */
export function useOnboardingFlow() {
  const {
    conversationId,
    turns,
    pendingSafety,
    completed,
    setConversation,
    setTurns,
    setPendingSafety,
    setCompleted,
  } = useOnboardingStore();

  const start = useCallback(async () => {
    const patient = await authRepository().getOrCreateLocalIdentity();
    const convo = await conversationRepository().startOrResume(patient.id);
    setConversation(convo.id);
    setTurns(await conversationRepository().getTurns(convo.id));
    setCompleted(convo.status === 'completed');
  }, [setConversation, setTurns, setCompleted]);

  useEffect(() => {
    if (!conversationId) void start();
  }, [conversationId, start]);

  const send = useCallback(
    async (text: string) => {
      if (!conversationId) return;
      const repo = conversationRepository();
      const res = await repo.sendPatientMessage({ conversationId, text, clientMutationId: uuid() });
      // Refresh transcript from the source of truth.
      setTurns(await repo.getTurns(conversationId));
      if (res.safetyEvent) {
        setPendingSafety(res.safetyEvent); // FR-018: block normal flow until acknowledged
      }
    },
    [conversationId, setTurns, setPendingSafety],
  );

  const acknowledgeSafety = useCallback(() => setPendingSafety(null), [setPendingSafety]);

  const finish = useCallback(async () => {
    if (!conversationId) return;
    await conversationRepository().complete(conversationId, uuid());
    setCompleted(true);
  }, [conversationId, setCompleted]);

  return { conversationId, turns, pendingSafety, completed, send, acknowledgeSafety, finish };
}
