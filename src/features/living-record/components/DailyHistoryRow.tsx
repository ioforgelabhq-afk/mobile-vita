import { Text, View } from 'react-native';
import type { DailyHistoryPoint } from '@/services/living-record-view/types';

const BAND_TONE: Record<DailyHistoryPoint['band'], string> = {
  great: 'text-secondary-deep',
  good: 'text-primary',
  moderate: 'text-ink',
  low: 'text-accent',
};

const BAND_LABEL: Record<DailyHistoryPoint['band'], string> = {
  great: 'Muy bien',
  good: 'Bien',
  moderate: 'Moderado',
  low: 'Bajo',
};

/** One day in the history list (FR-004/005) — the section disclaimer is shown once by the caller. */
export function DailyHistoryRow({ point }: { point: DailyHistoryPoint }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-line-2">
      <Text className="font-sans text-ink-2 text-sm">
        {new Date(point.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className={`font-mono font-semibold ${BAND_TONE[point.band]}`}>{point.score}</Text>
        <Text className="font-sans text-xs text-ink-3">{BAND_LABEL[point.band]}</Text>
      </View>
    </View>
  );
}
