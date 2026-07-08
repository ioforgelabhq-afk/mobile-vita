import { Text, View } from 'react-native';
import type { ConversationTurn } from '@/repositories/contracts/schemas';

/** One conversation turn. Companion left/neutral, patient right/primary. */
export function MessageBubble({ turn }: { turn: ConversationTurn }) {
  const isPatient = turn.role === 'patient';
  return (
    <View className={`my-1.5 max-w-[85%] ${isPatient ? 'self-end' : 'self-start'}`}>
      <View
        className={`px-4 py-3 rounded-lg ${
          isPatient ? 'bg-primary rounded-br-xs' : 'bg-surface-2 rounded-bl-xs'
        }`}
      >
        <Text className={`font-sans ${isPatient ? 'text-white' : 'text-ink'}`}>{turn.text}</Text>
      </View>
    </View>
  );
}
