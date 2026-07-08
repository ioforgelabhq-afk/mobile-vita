import { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/ui';
import { MessageBubble } from '@/features/onboarding/components/MessageBubble';
import { PromptInput } from '@/features/onboarding/components/PromptInput';
import { SafetyResources } from '@/features/onboarding/components/SafetyResources';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';
import { useOnboardingFlow } from '@/features/onboarding/hooks/useOnboardingFlow';
import { nextRoute } from '@/features/onboarding/wizard';

/**
 * The adaptive onboarding conversation (US1). One prompt at a time (Principle V). If a crisis
 * signal is detected, SafetyResources takes over the screen until acknowledged (Principle IV,
 * FR-017/018). When the flow completes, we route to the completion screen (FR-025).
 */
export default function ConversationScreen() {
  const router = useRouter();
  const { turns, pendingSafety, completed, send, acknowledgeSafety, finish } = useOnboardingFlow();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns.length]);

  useEffect(() => {
    if (completed) router.replace(nextRoute('conversation')!);
  }, [completed, router]);

  // Flow reaches its end when the last companion turn is the closing prompt.
  const last = turns[turns.length - 1];
  const atEnd = last?.role === 'companion' && last?.promptId === 'complete';

  if (pendingSafety) {
    return (
      <Screen>
        <SafetyResources event={pendingSafety} onContinue={acknowledgeSafety} />
      </Screen>
    );
  }

  return (
    <Screen>
      <WizardHeader current="conversation" />
      <ScrollView ref={scrollRef} className="flex-1" contentContainerClassName="py-2">
        {turns.map((t) => (
          <MessageBubble key={t.id} turn={t} />
        ))}
      </ScrollView>
      <View className="py-3">
        {atEnd ? (
          <PromptInput onSend={() => void finish()} />
        ) : (
          <PromptInput onSend={(t) => void send(t)} />
        )}
      </View>
    </Screen>
  );
}
