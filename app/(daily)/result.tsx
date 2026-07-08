import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Mark } from '@/ui';
import { ScoreCard } from '@/features/daily-checkin/components/ScoreCard';
import { useDailyCheckinStore } from '@/stores/daily-checkin';
import { alreadyToday } from '@/features/daily-checkin/content';

/**
 * Daily result (US1): shows today's informational Daily Score. Insights are appended here in US3.
 * Reached after a completed check-in, or directly when the patient already checked in today.
 */
export default function ResultScreen() {
  const router = useRouter();
  const score = useDailyCheckinStore((s) => s.score);

  return (
    <Screen>
      <View className="py-3">
        <Mark size={20} />
      </View>
      <ScrollView contentContainerClassName="py-2 gap-4">
        <Text className="font-sans text-2xl font-bold text-ink">{alreadyToday.title}</Text>
        <Text className="font-sans text-ink-2">{alreadyToday.body}</Text>
        {score ? <ScoreCard score={score} /> : null}
      </ScrollView>
      <View className="py-4">
        <Button label="Listo" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
