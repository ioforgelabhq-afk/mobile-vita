import { Text, View, Pressable, type PressableProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * VITA UI primitives (NativeWind). Colors come from CSS-variable tokens in global.css
 * (docs/design/brand-tokens.md) so light/dark + accent A/B/C switch at runtime. Crimson
 * (`accent`) is reserved for safety/critical (Principle IV).
 */

export function Screen({ children, className, ...rest }: ViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-canvas" {...rest}>
      <View className={`flex-1 px-6 ${className ?? ''}`}>{children}</View>
    </SafeAreaView>
  );
}

/** Wordmark + "Ascenso" mark. (A production build renders the SVG path via react-native-svg.) */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text style={{ fontSize: size }} className="text-primary font-bold">
        ✓
      </Text>
      <Text style={{ fontSize: size, letterSpacing: -1 }} className="text-ink font-sans font-extrabold">
        VITA
      </Text>
    </View>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  outline: 'bg-transparent border border-line',
  ghost: 'bg-surface-2',
};
const BTN_TEXT: Record<BtnVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-deep',
  accent: 'text-white',
  outline: 'text-ink',
  ghost: 'text-ink',
};

export function Button({
  label,
  variant = 'primary',
  ...rest
}: { label: string; variant?: BtnVariant } & PressableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-full px-5 py-3 items-center justify-center ${BTN[variant]}`}
      {...rest}
    >
      <Text className={`font-sans font-semibold ${BTN_TEXT[variant]}`}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, className, ...rest }: ViewProps) {
  return (
    <View className={`bg-surface border border-line rounded-lg p-5 ${className ?? ''}`} {...rest}>
      {children}
    </View>
  );
}
