import { Text, View } from 'react-native';

/** A clear "nothing here yet" / "no results" state (FR-003/FR-013) — never a blank screen. */
export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center justify-center py-16 gap-2 px-6">
      <Text className="font-sans text-lg font-semibold text-ink text-center">{title}</Text>
      <Text className="font-sans text-ink-2 text-center">{body}</Text>
    </View>
  );
}
