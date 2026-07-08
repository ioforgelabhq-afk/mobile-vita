import { Pressable, Text, View } from 'react-native';
import { todayLocal } from '@/lib/date';

export interface DateRange {
  from?: string;
  to?: string;
}

const PRESETS: { label: string; days: number | null }[] = [
  { label: 'Todo', days: null },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
];

function rangeForDays(days: number | null): DateRange {
  if (days === null) return {};
  const to = todayLocal();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  return { from: todayLocal(fromDate), to };
}

/**
 * Date-range filter as simple presets (FR-012) — avoids pulling in a native date-picker
 * dependency for the MVP; "all time" is the default (no filter applied).
 */
export function DateRangeFilter({
  active,
  onSelect,
}: {
  active: DateRange;
  onSelect: (range: DateRange) => void;
}) {
  return (
    <View className="flex-row gap-2 py-1">
      {PRESETS.map((p) => {
        const range = rangeForDays(p.days);
        const isActive = active.from === range.from && active.to === range.to;
        return (
          <Pressable
            key={p.label}
            onPress={() => onSelect(range)}
            className={`rounded-full px-3 py-1.5 border ${
              isActive ? 'bg-secondary border-secondary' : 'bg-surface border-line'
            }`}
          >
            <Text className={`font-sans text-xs ${isActive ? 'text-primary-deep' : 'text-ink-2'}`}>
              {p.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
