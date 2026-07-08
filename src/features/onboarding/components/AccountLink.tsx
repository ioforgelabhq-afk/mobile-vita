import { useState } from 'react';
import { Text, View, TextInput } from 'react-native';
import { Button, Card } from '@/ui';
import { authRepository } from '@/repositories';
import { connectivity } from '@/lib/sync/connectivity';

/**
 * Optional, post-onboarding account link (FR-020b). Local-first identity works without it; an
 * account simply enables syncing the Living Record to a (future) backend. Offline → graceful
 * degradation message (FR-022). Nothing here gates onboarding completion.
 */
export function AccountLink() {
  const [email, setEmail] = useState('');
  const [linked, setLinked] = useState(false);

  const link = async () => {
    if (!connectivity.isOnline()) return; // will retry when back online
    await authRepository().linkAccount({ email: email.trim() || undefined });
    setLinked(true);
  };

  if (linked) {
    return (
      <Card className="bg-surface-2">
        <Text className="font-sans text-ink-2">Cuenta vinculada. Tu registro se sincronizará.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text className="font-sans font-semibold text-ink">Guarda tu registro en la nube (opcional)</Text>
      <Text className="font-sans text-ink-2 text-sm mt-1">
        Puedes seguir sin cuenta. Si creas una, tu Registro Vivo se sincroniza entre dispositivos.
      </Text>
      <View className="mt-3 gap-2">
        <TextInput
          className="font-sans text-ink border border-line rounded-full px-4 py-2"
          placeholder="tu@correo.com"
          placeholderTextColor="#6e858c"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Button label="Crear cuenta" variant="outline" onPress={() => void link()} />
      </View>
    </Card>
  );
}
