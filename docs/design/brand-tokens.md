# VITA — Brand & Design Tokens (Source of Truth)

Extracted from **VITA Brand Foundations v1.0** (the brand kit HTML). This is the authoritative
token set for the mobile app's design layer (`tailwind.config.js` + `src/ui/`). Screens consume
these tokens via NativeWind classes / theme variables — never hard-coded hex values.

Principle alignment: the system is **modern & professional, never clinical-cold**; cool whites
(no cream); **deep navy in dark mode, never pure black**; one system across phone/tablet/web.

## Brand voice & language

- **Spanish-first (`es`)** UI copy; English is a secondary/bilingual annotation only.
  → This is the concrete value behind the spec's "single primary locale" assumption
  (`Patient.locale` defaults to `es-MX`/`es`). Multi-language remains out of scope for the MVP.
- Companion tone: warm, human, plain language — reinforces Principle I (companion, not provider)
  and V (conversation, not a form).

## Typography

| Role | Family | Weight | Size (pt) | Notes |
|------|--------|--------|-----------|-------|
| Display | Hanken Grotesk | 800 | ~64 | wordmark / hero, letter-spacing −0.03em |
| H1 | Hanken Grotesk | 700 | 38 | letter-spacing −0.02em |
| H3 | Hanken Grotesk | 600 | 22 | |
| Body | Hanken Grotesk | 400 | 16 | line-height 1.5 |
| Caption | Hanken Grotesk | 500 | 13 | muted |
| Metric | IBM Plex Mono | 600 | 46 | numbers/vitals, letter-spacing −0.02em |
| Unit | IBM Plex Mono | 400 | 20 | mmHg · bpm · mg/dL |
| Label | IBM Plex Mono | 500 | 12 | UPPERCASE, letter-spacing .12em |

- **Sans**: `Hanken Grotesk` (fallback: system-ui, -apple-system, sans-serif). Weights 300–800.
- **Mono**: `IBM Plex Mono` (fallback: ui-monospace, monospace). Weights 400/500/600.
- Rule: **all numeric/health data and units render in the mono face** (vitals, scores, tokens).

## Color

### Accent directions (choose one; **A · Teal is the default/recommended**)

| Dir | `primary` | `primary-deep` | Feel |
|-----|-----------|----------------|------|
| **A · Teal (default)** | `#1f6f8e` | `#045373` | trustworthy, modern |
| B · Marino | `#08406d` | `#05314f` | deep navy |
| C · Pizarra | `#355d7c` | `#21425c` | slate blue |

Shared across all directions:

| Token | Hex | Meaning |
|-------|-----|---------|
| `secondary` | `#35c6b3` | mint — vitality / positive states |
| `secondary-deep` | `#0c7d6e` | |
| `accent` | `#d3204e` | crimson — **critical/alerts only, never decorative** |
| `accent-deep` | `#8f0c2c` | |

**Semantic usage rule (non-negotiable):** teal/blue = trust, actions, data · mint = vitality &
positive · crimson = alerts & critical emphasis only. The teal→mint gradient
(`linear-gradient(120deg, primary, secondary)`) is reserved for the brand mark and **one** accent
per screen. Crimson maps naturally to safety/crisis surfaces (Principle IV) and error states.

### Neutrals — Light (`data-theme="light"`)

| Token | Hex | | Token | Hex |
|-------|-----|-|-------|-----|
| `canvas` | `#f6f9fa` | | `ink` | `#14313a` |
| `surface` | `#ffffff` | | `ink-2` | `#425a62` |
| `surface-2` | `#f0f4f5` | | `ink-3` | `#6e858c` |
| `sunken` | `#eaf0f1` | | `line` | `#e1e9eb` |
| | | | `line-2` | `#eef3f4` |

### Neutrals — Dark (`data-theme="dark"`, deep teal-navy, never black)

| Token | Hex | | Token | Hex |
|-------|-----|-|-------|-----|
| `canvas` | `#0d242e` | | `ink` | `#eef4f5` |
| `surface` | `#143039` | | `ink-2` | `#aec0c5` |
| `surface-2` | `#0f2a33` | | `ink-3` | `#7d949b` |
| `sunken` | `#0a1d25` | | `line` | `#234049` |
| | | | `line-2` | `#1b323b` |

## Radii & shape

| Token | px |
|-------|----|
| `r-xs` | 8 |
| `r-sm` | 12 |
| `r-md` | 18 |
| `r-lg` | 26 |
| `r-xl` | 34 |
| `r-full` | 999 |

## Logo & iconography

- **Wordmark**: `VITA`, Hanken Grotesk weight 800, letter-spacing −0.03em.
- **Symbol** (default: concept 01 **"Ascenso"** — upward stroke reading as vitality / a check /
  the V): SVG path `M9 30 L21 41 L40 9`, gradient stroke (`primary → secondary`), width ~5.5,
  round caps/joins, viewBox `0 0 48 48`. Alternatives in the kit: 02 "Pulso+" (rounded medical
  cross), 03 "Órbita" (ring + node). Default to Ascenso unless the team picks otherwise.
- **App icon**: Ascenso mark in white on the teal→mint gradient, radius 22 at 84px (scales to 1024).
- Line icons: 2px stroke, round caps/joins, `currentColor`.

## Ready-to-use NativeWind theme mapping (for T003)

Feed these into `tailwind.config.js` `theme.extend`. Drive light/dark via a `data-theme`/class
strategy and expose `primary/secondary/accent` + neutrals as CSS variables so the accent direction
(A/B/C) is switchable at runtime.

```js
// tailwind.config.js (excerpt) — values mirror this doc; wire light/dark via CSS variables
theme: {
  extend: {
    colors: {
      primary:      'var(--primary)',      'primary-deep':   'var(--primary-deep)',
      secondary:    'var(--secondary)',    'secondary-deep': 'var(--secondary-deep)',
      accent:       'var(--accent)',       'accent-deep':    'var(--accent-deep)',
      canvas: 'var(--canvas)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)',
      sunken: 'var(--sunken)', ink: 'var(--ink)', 'ink-2': 'var(--ink-2)', 'ink-3': 'var(--ink-3)',
      line: 'var(--line)', 'line-2': 'var(--line-2)',
    },
    fontFamily: { sans: ['Hanken Grotesk'], mono: ['IBM Plex Mono'] },
    borderRadius: { xs: '8px', sm: '12px', md: '18px', lg: '26px', xl: '34px', full: '999px' },
  },
}
```

The concrete light/dark hex values (above) are defined once as CSS variables in `src/ui/` (a
`:root` / light block and a dark block), plus three accent presets (`A`/`B`/`C`) that only reset
`--primary` and `--primary-deep`. Default preset = **A**. Fonts are loaded via `expo-font`.

## Source

Original kit: `VITA Brand Foundations (print, standalone).html` (embedded fonts + live theme/accent
switcher). Keep it with the design team; this doc is the extracted, implementation-facing subset.
