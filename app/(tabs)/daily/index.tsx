import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { authRepository, dailyCheckinRepository } from '@/repositories';
import { todayLocal } from '@/lib/date';

/**
 * Default route for the "Hoy" tab — resolves to today's check-in (not started) or today's
 * result (already completed), so tapping the tab always lands in the right place (FR-004).
 */
export default function DailyIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ['daily-tab-status'],
    queryFn: async () => {
      const patient = await authRepository().getOrCreateLocalIdentity();
      const checkin = await dailyCheckinRepository().forDate(patient.id, todayLocal());
      return { checkedInToday: !!checkin?.completedAt };
    },
  });

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={(data.checkedInToday ? '/(tabs)/daily/result' : '/(tabs)/daily/checkin') as never} />;
}
