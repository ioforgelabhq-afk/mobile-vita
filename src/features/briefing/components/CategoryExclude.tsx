import { Pressable, ScrollView, Text } from 'react-native';

/**
 * Multi-select "exclude from briefing" chips (FR-016/US4) — unlike the Living Record's
 * single-select CategoryFilter, a briefing can omit several categories at once (e.g. leave out
 * both mood and sleep) while keeping the rest.
 */
export function CategoryExclude({
  categories,
  excluded,
  onToggle,
}: {
  categories: string[];
  excluded: string[];
  onToggle: (category: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 py-1">
      {categories.map((c) => {
        const isExcluded = excluded.includes(c);
        return (
          <Pressable
            key={c}
            onPress={() => onToggle(c)}
            className={`rounded-full px-3 py-1.5 border ${
              isExcluded ? 'bg-surface-2 border-line' : 'bg-primary border-primary'
            }`}
          >
            <Text className={`font-sans text-xs ${isExcluded ? 'text-ink-3 line-through' : 'text-white'}`}>
              {c}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
