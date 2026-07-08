import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Mark } from '@/ui';
import { ScoreCard } from '@/features/daily-checkin/components/ScoreCard';
import { InsightCard } from '@/features/daily-checkin/components/InsightCard';
import { useDailyCheckinStore } from '@/stores/daily-checkin';
import { insightRepository } from '@/repositories';
import { alreadyToday } from '@/features/daily-checkin/content';
import { uuid } from '@/lib/ids';

/**
 * Daily result (US1 + US3): today's informational Daily Score plus ≥1 dismissible, informational
 * Insight (FR-010/013). Reached after a completed check-in, or directly when already checked in
 * today.
 */
export default function ResultScreen() {
  const router = useRouter();
  const { score, insights, set } = useDailyCheckinStore();

  const dismiss = async (id: string) => {
    await insightRepository().dismiss(id, uuid());
    set({ insights: insights.filter((i) => i.id !== id) });
  };

  return (
    <Screen>
      <View className="py-3">
        <Mark size={20} />
      </View>
      <ScrollView contentContainerClassName="py-2 gap-4">
        <Text className="font-sans text-2xl font-bold text-ink">{alreadyToday.title}</Text>
        <Text className="font-sans text-ink-2">{alreadyToday.body}</Text>
        {score ? <ScoreCard score={score} /> : null}
        {insights
          .filter((i) => !i.dismissedAt)
          .map((i) => (
            <InsightCard key={i.id} insight={i} onDismiss={() => void dismiss(i.id)} />
          ))}
      </ScrollView>
      <View className="py-4 gap-2">
        <Button label="Ver mi Registro Vivo" variant="outline" onPress={() => router.push('/(record)')} />
        <Button label="Listo" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
