/**
 * VITA Tailwind / NativeWind theme.
 * Values mirror docs/design/brand-tokens.md. Colors resolve to CSS variables so the
 * accent direction (A/B/C) and light/dark theme switch at runtime (see src/ui/global.css).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-deep': 'var(--primary-deep)',
        secondary: 'var(--secondary)',
        'secondary-deep': 'var(--secondary-deep)',
        accent: 'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        sunken: 'var(--sunken)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
      },
      fontFamily: {
        sans: ['Hanken Grotesk'],
        mono: ['IBM Plex Mono'],
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '18px',
        lg: '26px',
        xl: '34px',
        full: '999px',
      },
    },
  },
  plugins: [],
};
