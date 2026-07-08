import { ScrollView, Switch, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, Button, Card } from '@/ui';
import { WizardHeader } from '@/features/onboarding/components/WizardHeader';
import { DataRights } from '@/features/onboarding/components/DataRights';
import { consentIntro } from '@/features/onboarding/content';
import { authRepository, consentRepository } from '@/repositories';
import { nextRoute } from '@/features/onboarding/wizard';
import { uuid } from '@/lib/ids';
import type { ConsentPurpose } from '@/repositories/contracts/schemas';

/**
 * Wizard step 2 — granular, revocable consent (React Hook Form). Each purpose is grantable or
 * declinable individually (FR-013/014). Declining everything is allowed: an explanatory note
 * appears and onboarding still continues, just without storing health data (FR-014, T043a).
 * Data rights (ownership / view / export / delete / revoke) are surfaced here (FR-015).
 */
export default function ConsentScreen() {
  const router = useRouter();

  const { data: def } = useQuery({
    queryKey: ['consent-definition'],
    queryFn: () => consentRepository().getConsentDefinition(),
  });

  const { control, handleSubmit, watch } = useForm<Record<ConsentPurpose, boolean>>({
    defaultValues: {
      store_health_data: true,
      personalize_guidance: true,
      improve_service: false,
      share_with_physician: false,
    },
  });

  const values = watch();
  const allDeclined = def ? def.purposes.every((p) => !values[p.purpose]) : false;

  const onSubmit = handleSubmit(async (form) => {
    if (!def) return;
    const patient = await authRepository().getOrCreateLocalIdentity();
    await consentRepository().capture(
      {
        patientId: patient.id,
        version: def.version,
        grants: def.purposes.map((p) => ({ purpose: p.purpose, granted: !!form[p.purpose] })),
      },
      uuid(),
    );
    router.push(nextRoute('consent')!);
  });

  return (
    <Screen>
      <WizardHeader current="consent" />
      <ScrollView contentContainerClassName="py-2 gap-4">
        <Text className="font-sans text-3xl font-bold text-ink">{consentIntro.title}</Text>
        <Text className="font-sans text-ink-2">{consentIntro.body}</Text>

        {def?.purposes.map((p) => (
          <Card key={p.purpose}>
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="font-sans font-semibold text-ink">{p.label}</Text>
                <Text className="font-sans text-ink-2 text-sm mt-1">{p.description}</Text>
              </View>
              <Controller
                control={control}
                name={p.purpose}
                render={({ field: { value, onChange } }) => (
                  <Switch value={!!value} onValueChange={onChange} accessibilityLabel={p.label} />
                )}
              />
            </View>
          </Card>
        ))}

        {allDeclined ? (
          <Card className="bg-surface-2">
            <Text className="font-sans text-ink-2">
              Está bien. Sin estos permisos puedo acompañarte con información general, pero no
              guardaré tu información de salud ni personalizaré tu experiencia. Puedes cambiarlo
              cuando quieras.
            </Text>
          </Card>
        ) : null}

        <DataRights />
      </ScrollView>
      <View className="py-4">
        <Button label="Continuar" onPress={onSubmit} />
      </View>
    </Screen>
  );
}
