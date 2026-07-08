import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Mark } from '@/ui';
import { EmptyState } from '@/features/living-record/components/EmptyState';
import { PhysicianCard } from '@/features/briefing/components/PhysicianCard';
import { PhysicianForm } from '@/features/briefing/components/PhysicianForm';
import { usePhysicians } from '@/features/briefing/hooks/usePhysicians';
import type { Physician } from '@/repositories/contracts/schemas';

/** Manage physician contacts (US1, FR-001-004). */
export default function PhysiciansScreen() {
  const router = useRouter();
  const { physicians, add, update, remove } = usePhysicians();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Physician | null>(null);

  return (
    <Screen>
      <View className="py-3 flex-row items-center justify-between">
        <Mark size={20} />
        <Text className="font-mono text-xs text-ink-3">Médicos</Text>
      </View>
      <ScrollView contentContainerClassName="py-2 gap-3">
        <Text className="font-sans text-2xl font-bold text-ink">Tus médicos</Text>

        {physicians.length === 0 && !adding ? (
          <EmptyState
            title="Aún no tienes médicos guardados"
            body="Agrega uno para poder preparar un resumen para tu próxima cita."
          />
        ) : null}

        {physicians.map((p) =>
          editing?.id === p.id ? (
            <PhysicianForm
              key={p.id}
              initial={p}
              onSubmit={async (values) => {
                await update(p.id, values);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <PhysicianCard
              key={p.id}
              physician={p}
              onEdit={() => setEditing(p)}
              onRemove={() => void remove(p.id)}
            />
          ),
        )}

        {adding ? (
          <PhysicianForm
            onSubmit={async (values) => {
              await add(values);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <Button label="Agregar médico" variant="outline" onPress={() => setAdding(true)} />
        )}

        <Button label="Generar resumen" onPress={() => router.push('/(tabs)/briefing/generate')} />
      </ScrollView>
    </Screen>
  );
}
