import { Pressable, Text, View } from 'react-native';
import { Card } from '@/ui';
import type { Insight } from '@/repositories/contracts/schemas';

const CATEGORY_LABEL: Record<Insight['category'], string> = {
  trend: 'Tendencia',
  education: 'Información',
  encouragement: 'Ánimo',
  reminder_suggestion: 'Sugerencia',
};

/**
 * An informational Insight (Principle III, FR-010–013): category tag, body, and a dismiss
 * action. Never diagnostic — bodies are guardrail-checked before they ever reach this component.
 */
export function InsightCard({ insight, onDismiss }: { insight: Insight; onDismiss?: () => void }) {
  return (
    <Card className="bg-surface-2 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[10px] uppercase tracking-wide text-primary">
          {CATEGORY_LABEL[insight.category]}
        </Text>
        {onDismiss ? (
          <Pressable accessibilityRole="button" onPress={onDismiss}>
            <Text className="font-sans text-xs text-ink-3">Descartar</Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="font-sans font-semibold text-ink">{insight.title}</Text>
      <Text className="font-sans text-ink-2 text-sm">{insight.body}</Text>
    </Card>
  );
}
