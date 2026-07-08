import { Pressable, ScrollView, Text } from 'react-native';

/** Category chip row (FR-011). `null` category means "all" (no filter applied). */
export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}) {
  const chip = (label: string, value: string | null) => (
    <Pressable
      key={label}
      onPress={() => onSelect(value)}
      className={`rounded-full px-3 py-1.5 border ${
        selected === value ? 'bg-primary border-primary' : 'bg-surface border-line'
      }`}
    >
      <Text className={`font-sans text-xs ${selected === value ? 'text-white' : 'text-ink-2'}`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 py-1">
      {chip('Todo', null)}
      {categories.map((c) => chip(c, c))}
    </ScrollView>
  );
}
