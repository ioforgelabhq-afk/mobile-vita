import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Mark } from '@/ui';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';
import { AccountLink } from '@/features/onboarding/components/AccountLink';
import { completion } from '@/features/onboarding/content';

/**
 * Completion (FR-025): confirms the Living Record has started and hands off to daily guidance
 * (feature 002) — the CTA starts the first daily check-in.
 */
export default function CompleteScreen() {
  const router = useRouter();
  return (
    <Screen>
      <WizardHeader current="complete" />
      <View className="flex-1 justify-center gap-5">
        <Mark size={30} />
        <Text className="font-sans text-3xl font-bold text-ink">{completion.title}</Text>
        <Text className="font-sans text-ink-2 text-base">{completion.body}</Text>
        <AccountLink />
        <Button label={completion.cta} onPress={() => router.replace('/(tabs)/daily/checkin' as never)} />
      </View>
    </Screen>
  );
}
