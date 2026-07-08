import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  authRepository,
  conversationRepository,
  consentRepository,
  dailyCheckinRepository,
} from '@/repositories';
import { todayLocal } from '@/lib/date';

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
      const onboardingDone = convo.status === 'completed';
      // Once onboarding is done, the daily loop is home. Check today's check-in (FR-004).
      const todayCheckin = onboardingDone
        ? await dailyCheckinRepository().forDate(patient.id, todayLocal())
        : null;
      return {
        completed: onboardingDone,
        started: patientTurns > 0, // onboarding conversation under way → resume it
        hasConsent: !!consent,
        checkedInToday: !!todayCheckin?.completedAt,
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

  // Routing: finished onboarding → the daily loop (today's result if already checked in, else the
  // check-in). Mid-onboarding → resume the wizard where the patient left off (FR-023/024).
  let href: string;
  if (data.completed) {
    href = data.checkedInToday ? '/(daily)/result' : '/(daily)/checkin';
  } else if (data.started || data.hasConsent) {
    href = '/(onboarding)/conversation';
  } else {
    href = '/(onboarding)/welcome';
  }
  return <Redirect href={href as never} />;
}
