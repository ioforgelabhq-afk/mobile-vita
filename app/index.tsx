import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { authRepository, conversationRepository, consentRepository } from '@/repositories';

/**
 * Entry route. Routes a first-time patient into onboarding; a returning patient with a
 * completed onboarding conversation is recognized and not sent through it again (FR-024). Once
 * onboarding is done, the tab bar (`(tabs)`) is home — the "Hoy" tab decides check-in vs. result.
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
        started: patientTurns > 0, // onboarding conversation under way → resume it
        hasConsent: !!consent,
      };
    },
  });

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  // Mid-onboarding → resume the wizard where the patient left off (FR-023/024).
  let href: string;
  if (data.completed) {
    href = '/(tabs)/daily';
  } else if (data.started || data.hasConsent) {
    href = '/(onboarding)/conversation';
  } else {
    href = '/(onboarding)/welcome';
  }
  return <Redirect href={href as never} />;
}
