import { useForm, Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import { Button, Card } from '@/ui';
import type { Physician } from '@/repositories/contracts/schemas';

export interface PhysicianFormValues {
  name: string;
  specialty: string;
  organization: string;
  phone: string;
  email: string;
  notes: string;
}

const FIELD_LABEL: Record<keyof PhysicianFormValues, string> = {
  name: 'Nombre',
  specialty: 'Especialidad',
  organization: 'Clínica u hospital',
  phone: 'Teléfono',
  email: 'Correo',
  notes: 'Notas',
};

/** Add/edit a physician. Only `name` is required (FR-001) — Principle V exception: structured
 * contact fields, not health narrative, so a short form is appropriate here. */
export function PhysicianForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Physician;
  onSubmit: (values: PhysicianFormValues) => void;
  onCancel: () => void;
}) {
  const { control, handleSubmit, formState } = useForm<PhysicianFormValues>({
    defaultValues: {
      name: initial?.name ?? '',
      specialty: initial?.specialty ?? '',
      organization: initial?.organization ?? '',
      phone: initial?.phone ?? '',
      email: initial?.email ?? '',
      notes: initial?.notes ?? '',
    },
  });

  const fields: (keyof PhysicianFormValues)[] = ['name', 'specialty', 'organization', 'phone', 'email', 'notes'];

  return (
    <Card className="gap-3">
      {fields.map((field) => (
        <View key={field} className="gap-1">
          <Text className="font-mono text-[10px] uppercase text-ink-3">
            {FIELD_LABEL[field]}
            {field === 'name' ? ' *' : ''}
          </Text>
          <Controller
            control={control}
            name={field}
            rules={field === 'name' ? { required: true } : undefined}
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="font-sans text-ink border border-line rounded-sm px-3 py-2"
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#6e858c"
              />
            )}
          />
        </View>
      ))}
      {formState.errors.name ? (
        <Text className="font-sans text-xs text-accent">El nombre es obligatorio.</Text>
      ) : null}
      <View className="flex-row gap-3 mt-1">
        <Button label="Guardar" onPress={handleSubmit(onSubmit)} />
        <Button label="Cancelar" variant="ghost" onPress={onCancel} />
      </View>
    </Card>
  );
}
