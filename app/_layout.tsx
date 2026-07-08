import '@/ui/global.css';
import { Stack } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/client';

/**
 * Root layout. Applies the design-token theme (dark class per system scheme; accent A default)
 * and provides TanStack Query. Brand fonts (Hanken Grotesk / IBM Plex Mono) are loaded via
 * expo-font during native setup. Screens/hooks reach data only via repositories.
 */
export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View className={scheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
