import { Text, View } from 'react-native';
import { Screen, Button, Mark } from '@/ui';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';
import { AccountLink } from '@/features/onboarding/components/AccountLink';
import { completion } from '@/features/onboarding/content';

/**
 * Completion (FR-025): confirms the Living Record has started and the patient is ready to
 * receive daily guidance. Daily guidance is a later pillar/feature; the CTA is a placeholder.
 */
export default function CompleteScreen() {
  return (
    <Screen>
      <WizardHeader current="complete" />
      <View className="flex-1 justify-center gap-5">
        <Mark size={30} />
        <Text className="font-sans text-3xl font-bold text-ink">{completion.title}</Text>
        <Text className="font-sans text-ink-2 text-base">{completion.body}</Text>
        <AccountLink />
        <Button label={completion.cta} onPress={() => { /* → daily guidance (future) */ }} />
      </View>
    </Screen>
  );
}
