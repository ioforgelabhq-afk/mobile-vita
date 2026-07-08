import { Text, View } from 'react-native';
import { Card } from '@/ui';
import { consentIntro } from '@/features/onboarding/content';

/**
 * Surfaces the patient's data rights (FR-015): ownership + view/export/delete + revoke consent.
 * Discoverable within onboarding so the patient learns their control early (Principle II).
 */
export function DataRights() {
  return (
    <Card className="bg-surface-2">
      <Text className="font-sans font-semibold text-ink">Tú eres dueño de tus datos</Text>
      <Text className="font-sans text-ink-2 mt-1">{consentIntro.ownershipNote}</Text>
      <View className="flex-row flex-wrap gap-2 mt-3">
        {['Ver', 'Exportar', 'Eliminar', 'Revocar consentimiento'].map((r) => (
          <View key={r} className="rounded-full bg-surface border border-line px-3 py-1.5">
            <Text className="font-mono text-xs text-ink-2">{r}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
