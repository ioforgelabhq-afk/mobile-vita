import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Mark } from '@/ui';
import { MessageBubble } from '@/features/onboarding/components/MessageBubble';
import { PromptInput } from '@/features/onboarding/components/PromptInput';
import { SafetyResources } from '@/features/onboarding/components/SafetyResources';
import { useDailyCheckin } from '@/features/daily-checkin/hooks/useDailyCheckin';

/**
 * Daily check-in (US1). A brief conversation, one prompt at a time (Principle V), reusing the
 * onboarding message/prompt/safety components. If a crisis signal appears, SafetyResources takes
 * over until acknowledged (Principle IV). On completion → the result screen (score + insights).
 */
export default function CheckinScreen() {
  const router = useRouter();
  const { transcript, pendingSafety, done, send, acknowledgeSafety } = useDailyCheckin();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [transcript.length]);

  useEffect(() => {
    if (done) router.replace('/(tabs)/daily/result');
  }, [done, router]);

  if (pendingSafety) {
    return (
      <Screen>
        <SafetyResources event={pendingSafety} onContinue={acknowledgeSafety} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="py-3 flex-row items-center justify-between">
        <Mark size={20} />
        <Text className="font-mono text-xs text-ink-3">Registro diario</Text>
      </View>
      <ScrollView ref={scrollRef} className="flex-1" contentContainerClassName="py-2">
        {transcript.map((m) => (
          <MessageBubble key={m.id} turn={m} />
        ))}
      </ScrollView>
      <View className="py-3">
        <PromptInput onSend={(t) => void send(t)} />
      </View>
    </Screen>
  );
}
