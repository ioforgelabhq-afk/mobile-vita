import { Text, View } from 'react-native';
import { Button, Card } from '@/ui';

/**
 * Shown instead of the briefing when `share_with_physician` consent has not been granted
 * (FR-011). Explains why and offers a path to grant it; declining doesn't block anything else
 * in the app — the patient can simply leave this screen.
 */
export function ConsentGate({ onGrant }: { onGrant: () => void }) {
  return (
    <View className="flex-1 justify-center gap-4">
      <Text className="font-sans text-2xl font-bold text-ink">Compartir con tu médico</Text>
      <Card className="bg-surface-2">
        <Text className="font-sans text-ink-2">
          Para generar un resumen para compartir con un médico, primero necesitamos tu
          consentimiento. Puedes revocarlo cuando quieras — esto no afecta el resto de tu
          experiencia en VITA.
        </Text>
      </Card>
      <Button label="Dar consentimiento" onPress={onGrant} />
    </View>
  );
}
