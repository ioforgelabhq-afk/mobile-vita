import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen, Button, Card } from '@/ui';
import { DataRights } from '@/features/onboarding/components/DataRights';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';
import { authRepository, livingRecordRepository } from '@/repositories';
import type { LivingRecordEntry, EntryCategory } from '@/repositories/contracts/schemas';
import { nextRoute } from '@/features/onboarding/wizard';
import { uuid } from '@/lib/ids';

const LABELS: Record<EntryCategory, string> = {
  goal: 'Meta',
  concern: 'Preocupación',
  health_context: 'Contexto',
  preference: 'Preferencia',
  other: 'Nota',
};

/**
 * Review & correct the Living Record seeded during onboarding (FR-007). Entries are
 * viewable, editable (repo.correct → supersede, FR-008) and removable (soft delete). Also
 * surfaces data rights (FR-015). Continue → completion (FR-025).
 */
export default function ReviewScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const { data: entries = [] } = useQuery({
    queryKey: ['entries'],
    queryFn: async () => {
      const p = await authRepository().getOrCreateLocalIdentity();
      return livingRecordRepository().list(p.id);
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['entries'] });

  const save = async (entry: LivingRecordEntry) => {
    await livingRecordRepository().correct(entry.id, { content: draft }, uuid());
    setEditing(null);
    await refresh();
  };
  const remove = async (entry: LivingRecordEntry) => {
    await livingRecordRepository().remove(entry.id, uuid());
    await refresh();
  };

  return (
    <Screen>
      <WizardHeader current="review" />
      <ScrollView contentContainerClassName="py-2 gap-4">
        <Text className="font-sans text-3xl font-bold text-ink">Esto empecé a anotar</Text>
        <Text className="font-sans text-ink-2">
          Revisa y ajusta lo que quieras. Es tu registro: puedes editar o quitar cualquier cosa.
        </Text>

        {entries.map((e) => (
          <Card key={e.id}>
            <Text className="font-mono text-xs uppercase text-ink-3">{LABELS[e.category]}</Text>
            {editing === e.id ? (
              <TextInput
                className="font-sans text-ink mt-1 border border-line rounded-sm p-2"
                value={draft}
                onChangeText={setDraft}
                multiline
                autoFocus
              />
            ) : (
              <Text className="font-sans text-ink mt-1">{e.content}</Text>
            )}
            <View className="flex-row gap-3 mt-3">
              {editing === e.id ? (
                <Pressable onPress={() => void save(e)}>
                  <Text className="font-sans font-semibold text-primary">Guardar</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setEditing(e.id);
                    setDraft(e.content);
                  }}
                >
                  <Text className="font-sans font-semibold text-primary">Editar</Text>
                </Pressable>
              )}
              <Pressable onPress={() => void remove(e)}>
                <Text className="font-sans font-semibold text-accent">Quitar</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        {entries.length === 0 ? (
          <Text className="font-sans text-ink-3">
            Aún no hay notas. Está bien — podemos empezar de a poco.
          </Text>
        ) : null}

        <DataRights />
        <Button label="Continuar" onPress={() => router.replace(nextRoute('review')!)} />
      </ScrollView>
    </Screen>
  );
}
