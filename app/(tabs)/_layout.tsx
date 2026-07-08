import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

/**
 * Persistent bottom navigation across the three post-onboarding pillars (daily guidance, Living
 * Record, physician briefing). Onboarding stays outside this group — it's a linear wizard, not a
 * place to jump between sections (Principle V).
 */
export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors =
    scheme === 'dark'
      ? { active: '#35c6b3', inactive: '#7d949b', bg: '#0d242e', border: '#234049' }
      : { active: '#1f6f8e', inactive: '#6e858c', bg: '#f6f9fa', border: '#e1e9eb' };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: 'Hanken Grotesk', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="daily" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="record" options={{ title: 'Registro' }} />
      <Tabs.Screen name="briefing" options={{ title: 'Médicos' }} />
    </Tabs>
  );
}
