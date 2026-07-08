import { Pressable, Text, View } from 'react-native';
import { Card } from '@/ui';
import type { Physician } from '@/repositories/contracts/schemas';

/** One physician contact — name, specialty/org, contact details, edit/remove actions (FR-002). */
export function PhysicianCard({
  physician,
  onEdit,
  onRemove,
}: {
  physician: Physician;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <Card className="gap-1.5">
      <Text className="font-sans font-semibold text-ink">{physician.name}</Text>
      {physician.specialty || physician.organization ? (
        <Text className="font-sans text-ink-2 text-sm">
          {[physician.specialty, physician.organization].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {physician.phone || physician.email ? (
        <Text className="font-mono text-xs text-ink-3">
          {[physician.phone, physician.email].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      <View className="flex-row gap-3 mt-2">
        <Pressable onPress={onEdit}>
          <Text className="font-sans font-semibold text-primary">Editar</Text>
        </Pressable>
        <Pressable onPress={onRemove}>
          <Text className="font-sans font-semibold text-accent">Quitar</Text>
        </Pressable>
      </View>
    </Card>
  );
}
