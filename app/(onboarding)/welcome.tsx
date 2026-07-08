import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Card } from '@/ui';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';
import { roleDisclosure } from '@/features/onboarding/content';
import { nextRoute } from '@/features/onboarding/wizard';

/**
 * Wizard step 1 — welcome & role disclosure (Principles I & III). Establishes, in plain
 * language, that VITA is a companion (not a provider) and that its guidance is informational,
 * never diagnostic. Continue → consent.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <WizardHeader current="welcome" />
      <ScrollView contentContainerClassName="py-4 gap-5">
        <Text className="font-sans text-3xl font-bold text-ink">{roleDisclosure.title}</Text>
        <Text className="font-sans text-base text-ink-2">{roleDisclosure.companionLine}</Text>

        <Card className="bg-surface-2">
          <Text className="font-sans text-ink-2">{roleDisclosure.informationalLine}</Text>
        </Card>
      </ScrollView>
      <View className="py-4">
        <Button label={roleDisclosure.cta} onPress={() => router.push(nextRoute('welcome')!)} />
      </View>
    </Screen>
  );
}
