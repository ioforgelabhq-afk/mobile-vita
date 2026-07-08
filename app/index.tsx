import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { authRepository, conversationRepository, consentRepository } from '@/repositories';

/**
 * Entry route. Routes a first-time patient into onboarding; a returning patient with a
 * completed onboarding conversation is recognized and not sent through it again (FR-024).
 */
export default function Index() {
  const { data, isLoading } = useQuery({
    queryKey: ['bootstrap'],
    queryFn: async () => {
      const patient = await authRepository().getOrCreateLocalIdentity();
      const convo = await conversationRepository().startOrResume(patient.id);
      const consent = await consentRepository().get(patient.id);
      const turns = await conversationRepository().getTurns(convo.id);
      const patientTurns = turns.filter((t) => t.role === 'patient').length;
      return {
        completed: convo.status === 'completed',
        started: patientTurns > 0, // the conversation is under way → resume it
        hasConsent: !!consent,
      };
    },
  });

  useEffect(() => {}, []);

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  // Resume where the patient left off (FR-023/024): completed → complete; a conversation already
  // under way → conversation; consent captured but not yet chatting → conversation; otherwise the
  // wizard start. (Durable resume across app restarts arrives with the encrypted SQLite store.)
  const href = data.completed
    ? '/(onboarding)/complete'
    : data.started
      ? '/(onboarding)/conversation'
      : data.hasConsent
        ? '/(onboarding)/conversation'
        : '/(onboarding)/welcome';
  return <Redirect href={href} />;
}
