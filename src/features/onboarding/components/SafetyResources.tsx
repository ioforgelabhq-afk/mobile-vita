import { Linking, Pressable, Text, View } from 'react-native';
import type { SafetyEvent } from '@/repositories/contracts/schemas';
import { Button, Card } from '@/ui';
import { safetyIntro } from '@/features/onboarding/content';

/**
 * Crisis resources surfaced AHEAD of onboarding when SafetyService matches (Principle IV;
 * FR-017/018). Uses the crimson `accent` (critical-only). Onboarding resumes only after the
 * patient acknowledges via onContinue.
 */
export function SafetyResources({
  event,
  onContinue,
}: {
  event: SafetyEvent;
  onContinue: () => void;
}) {
  return (
    <View className="flex-1 justify-center gap-4">
      <View className="h-1.5 rounded-full bg-accent" accessibilityElementsHidden />
      <Text className="font-sans text-2xl font-bold text-ink">{safetyIntro.title}</Text>
      <Text className="font-sans text-ink-2">{safetyIntro.body}</Text>

      {event.resources.map((r, i) => (
        <Card key={i} className="border-accent/40">
          <Text className="font-sans font-semibold text-ink">{r.label}</Text>
          <Text className="font-sans text-ink-2 mt-1">{r.description}</Text>
          {r.phone ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openURL(`tel:${r.phone!.replace(/\s/g, '')}`)}
              className="mt-3 rounded-full bg-accent px-4 py-2 self-start"
            >
              <Text className="text-white font-mono font-semibold">Llamar {r.phone}</Text>
            </Pressable>
          ) : null}
        </Card>
      ))}

      <Button label={safetyIntro.resume} variant="outline" onPress={onContinue} />
    </View>
  );
}
