import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '@/ui';
import type { RecordItem } from '@/services/living-record-view/types';

const SOURCE_LABEL: Record<string, string> = {
  onboarding: 'Bienvenida',
  daily_checkin: 'Registro diario',
  freeform: 'Conversación',
  patient: 'Tú',
  medication: 'Medicamento',
};

/**
 * One Living Record item — category badge, content, timestamp, source (FR-002), with correct
 * (in place) and remove actions (FR-007/008) wired to the aggregation service by the caller.
 */
export function RecordItemCard({
  item,
  onCorrect,
  onRemove,
}: {
  item: RecordItem;
  onCorrect: (content: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);

  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[10px] uppercase tracking-wide text-primary">
          {item.category}
        </Text>
        <Text className="font-mono text-[10px] text-ink-3">
          {new Date(item.timestamp).toLocaleDateString('es-MX')} · {SOURCE_LABEL[item.source] ?? item.source}
        </Text>
      </View>

      {editing ? (
        <TextInput
          className="font-sans text-ink border border-line rounded-sm p-2"
          value={draft}
          onChangeText={setDraft}
          multiline
          autoFocus
        />
      ) : (
        <Text className="font-sans text-ink">{item.content}</Text>
      )}

      <View className="flex-row gap-3">
        {editing ? (
          <Pressable
            onPress={() => {
              onCorrect(draft);
              setEditing(false);
            }}
          >
            <Text className="font-sans font-semibold text-primary">Guardar</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Text className="font-sans font-semibold text-primary">Editar</Text>
          </Pressable>
        )}
        <Pressable onPress={onRemove}>
          <Text className="font-sans font-semibold text-accent">Quitar</Text>
        </Pressable>
      </View>
    </Card>
  );
}
