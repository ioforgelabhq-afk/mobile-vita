import { useState } from 'react';
import { TextInput, View, Pressable, Text } from 'react-native';

/** Single conversational input — one message at a time, never a form (Principle V). */
export function PromptInput({ onSend, disabled }: { onSend: (t: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState('');
  const submit = () => {
    const t = value.trim();
    if (!t) return;
    setValue('');
    onSend(t);
  };
  return (
    <View className="flex-row items-center gap-2 bg-surface-2 border border-line rounded-full px-4 py-2">
      <TextInput
        className="flex-1 font-sans text-ink"
        placeholder="Escribe tu respuesta…"
        placeholderTextColor="#6e858c"
        value={value}
        onChangeText={setValue}
        editable={!disabled}
        multiline
        onSubmitEditing={submit}
        accessibilityLabel="Mensaje para VITA"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enviar"
        onPress={submit}
        disabled={disabled}
        className="w-9 h-9 rounded-full bg-primary items-center justify-center"
      >
        <Text className="text-white font-bold">↑</Text>
      </Pressable>
    </View>
  );
}
