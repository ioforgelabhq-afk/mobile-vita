import { Text, View } from 'react-native';
import { Mark } from '@/ui';
import { WIZARD_STEPS, stepIndex } from '@/features/onboarding/wizard';

/**
 * Wizard progress header — shows the brand mark, the current step, and a dot tracker so the
 * patient always knows where they are in onboarding (one screen at a time).
 */
export function WizardHeader({ current }: { current: string }) {
  const idx = stepIndex(current);
  return (
    <View className="pt-2 pb-4 gap-3">
      <View className="flex-row items-center justify-between">
        <Mark size={20} />
        <Text className="font-mono text-xs text-ink-3">
          Paso {idx + 1} de {WIZARD_STEPS.length}
        </Text>
      </View>
      <View className="flex-row gap-1.5" accessibilityLabel={`Paso ${idx + 1} de ${WIZARD_STEPS.length}`}>
        {WIZARD_STEPS.map((s, i) => (
          <View
            key={s.key}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-primary' : 'bg-line'}`}
          />
        ))}
      </View>
    </View>
  );
}
