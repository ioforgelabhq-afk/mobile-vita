/**
 * Daily check-in flow (spec FR-001/002/003). One conversational prompt at a time (Principle V),
 * each mapping to one check-in signal. `parseAnswer` heuristically extracts a structured value
 * from the patient's free text; minimal/skipped answers yield no value and the flow still advances
 * (FR-003). Pure + deterministic → unit-testable; the hook handles safety, persistence, scoring.
 */
import type { CheckinPatch } from '@/repositories/contracts/daily-checkin.repository';
import type { Mood } from '@/repositories/contracts/schemas';

export type DailyStepId = 'mood' | 'sleep' | 'energy' | 'symptoms' | 'notes';

const ORDER: DailyStepId[] = ['mood', 'sleep', 'energy', 'symptoms', 'notes'];

const PROMPTS: Record<DailyStepId, string> = {
  mood: '¿Cómo te sientes hoy?',
  sleep: '¿Qué tal dormiste anoche? Si quieres, dime cuántas horas.',
  energy: '¿Cómo está tu energía hoy, del 1 (baja) al 5 (alta)?',
  symptoms: '¿Has notado algún síntoma o molestia hoy?',
  notes: '¿Algo más que quieras anotar para tu registro?',
};

export const FIRST_DAILY_STEP: DailyStepId = 'mood';

export function dailyPrompt(step: DailyStepId): string {
  return PROMPTS[step];
}

export function nextDailyStep(step: DailyStepId): DailyStepId | null {
  const i = ORDER.indexOf(step);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
}

const MINIMAL = ['no', 'no sé', 'no se', 'nada', 'paso', 'ninguno', 'ninguna', 'na', ''];
export function isMinimal(text: string): boolean {
  const t = text.trim().toLowerCase();
  return MINIMAL.includes(t);
}

const MOOD_MAP: { re: RegExp; mood: Mood }[] = [
  { re: /genial|excelente|muy bien|de maravilla/i, mood: 'great' },
  { re: /\bbien\b|contento|tranquil/i, mood: 'good' },
  { re: /más o menos|mas o menos|regular|normal|ahí|neutral/i, mood: 'ok' },
  { re: /\bmal\b|baj[oa]|triste|cansad/i, mood: 'low' },
  { re: /muy mal|fatal|terrible|pésim/i, mood: 'bad' },
];

/** Parse one answer into a partial check-in patch. Returns {} when nothing could be extracted. */
export function parseAnswer(step: DailyStepId, text: string): CheckinPatch {
  const t = text.trim();
  if (step === 'mood') {
    if (isMinimal(t)) return {};
    // most specific first: check "muy mal" before "mal", etc.
    const ordered = [MOOD_MAP[4], MOOD_MAP[0], MOOD_MAP[2], MOOD_MAP[3], MOOD_MAP[1]];
    for (const { re, mood } of ordered) if (re.test(t)) return { mood };
    return {};
  }
  if (step === 'sleep') {
    const m = t.match(/(\d{1,2})(?:[.,]5)?\s*(?:h|hs|horas)?/i);
    if (m) {
      const hours = Math.min(24, Math.max(0, parseFloat(m[0].replace(',', '.'))));
      if (!Number.isNaN(hours)) return { sleepHours: hours };
    }
    return {};
  }
  if (step === 'energy') {
    const m = t.match(/\b([1-5])\b/);
    if (m) return { energy: parseInt(m[1], 10) };
    return {};
  }
  if (step === 'symptoms') {
    if (isMinimal(t)) return { symptoms: [] };
    const symptoms = t
      .split(/,|\by\b|;/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    return { symptoms };
  }
  // notes
  if (isMinimal(t)) return {};
  return { notes: t.slice(0, 1000) };
}
