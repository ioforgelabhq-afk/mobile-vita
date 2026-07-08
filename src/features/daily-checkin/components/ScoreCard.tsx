import { Text, View } from 'react-native';
import { Card } from '@/ui';
import type { DailyScore } from '@/repositories/contracts/schemas';
import { scoreCopy } from '@/features/daily-checkin/content';

const BAND_TONE: Record<DailyScore['band'], string> = {
  great: 'text-secondary-deep',
  good: 'text-primary',
  moderate: 'text-ink',
  low: 'text-accent',
};

/**
 * The Daily Score card — an informational wellness indicator (Principle III, FR-006/007/008):
 * 0–100 + band + component breakdown, always with the informational disclaimer.
 */
export function ScoreCard({ score }: { score: DailyScore }) {
  return (
    <Card className="gap-3">
      <Text className="font-mono text-xs uppercase text-ink-3">{scoreCopy.title}</Text>
      <View className="flex-row items-end gap-2">
        <Text className={`font-mono text-5xl font-bold ${BAND_TONE[score.band]}`}>{score.score}</Text>
        <Text className="font-sans text-ink-2 mb-2">/ 100 · {scoreCopy.bandLabel[score.band]}</Text>
      </View>

      {score.components.length > 0 ? (
        <View className="gap-1.5 mt-1">
          {score.components.map((c) => (
            <View key={c.key} className="flex-row items-center justify-between">
              <Text className="font-sans text-ink-2 text-sm">{c.label}</Text>
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-24 rounded-full bg-line">
                  <View
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.round(c.value * 100)}%` }}
                  />
                </View>
                <Text className="font-mono text-xs text-ink-3">{Math.round(c.value * 100)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <Text className="font-sans text-xs text-ink-3 mt-1">{scoreCopy.disclaimer}</Text>
    </Card>
  );
}
