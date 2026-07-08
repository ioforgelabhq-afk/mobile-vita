/**
 * Adaptive onboarding flow engine (spec FR-001/FR-002/FR-003/FR-004).
 *
 * The MVP "companion" is a deterministic flow: it asks one open question at a time, adapts the
 * next prompt to what the patient just said, and extracts categorized Living Record entries.
 * It accepts sparse/skipped answers without coercion and still reaches a graceful conclusion
 * (FR-004). Exposed behind ConversationRepository so a real LLM service can replace it later
 * with no screen changes (Principle IX).
 */
import type { EntryCategory } from '@/repositories/contracts/schemas';

export interface SuggestedEntry {
  category: EntryCategory;
  content: string;
}

export interface AdvanceResult {
  nextStepId: string | null; // null → conversation is complete
  companionText: string;
  entries: SuggestedEntry[];
  promptId: string;
}

interface Step {
  id: string;
  category: EntryCategory;
  prompt: string;
  next: string | null;
}

/** Curated, ordered steps. `category` is what a substantive answer contributes to the record. */
const STEPS: Record<string, Step> = {
  why: {
    id: 'why',
    category: 'concern',
    prompt:
      '¿Qué te trae a VITA hoy? Cuéntame con tus palabras qué te gustaría cuidar o mejorar.',
    next: 'context',
  },
  context: {
    id: 'context',
    category: 'health_context',
    prompt:
      'Gracias por contarme. Para conocerte mejor, ¿hay algo de tu salud que sea importante que yo sepa? (por ejemplo, cómo te has sentido últimamente)',
    next: 'goals',
  },
  goals: {
    id: 'goals',
    category: 'goal',
    prompt: 'Si pudieras lograr una cosa para tu bienestar en las próximas semanas, ¿cuál sería?',
    next: 'preferences',
  },
  preferences: {
    id: 'preferences',
    category: 'preference',
    prompt:
      '¿Cómo te gustaría que te acompañe? Por ejemplo, recordatorios suaves, ánimo diario, o solo cuando tú me busques.',
    next: 'wrap',
  },
  wrap: {
    id: 'wrap',
    category: 'other',
    prompt: '¿Hay algo más que quieras que tenga presente?',
    next: null,
  },
};

export const FIRST_STEP_ID = 'why';

/** A reluctant / minimal / skip answer — accepted without pressure (FR-004). */
export function isMinimalAnswer(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length <= 2) return true;
  return [
    'no',
    'no sé',
    'no se',
    'nada',
    'paso',
    'ninguno',
    'ninguna',
    'na',
    'nel',
    'skip',
    'no quiero',
    'prefiero no',
  ].some((s) => t === s || t.startsWith(s + ' ') || t.startsWith(s + ','));
}

export function firstPrompt(): { companionText: string; promptId: string; stepId: string } {
  return { companionText: STEPS[FIRST_STEP_ID].prompt, promptId: FIRST_STEP_ID, stepId: FIRST_STEP_ID };
}

/**
 * Given the current step and the patient's answer, produce the next companion turn + any
 * suggested entries. Adaptive: the acknowledgement reflects what was said; minimal answers
 * are accepted and skipped.
 */
export function advance(currentStepId: string, patientText: string): AdvanceResult {
  const step = STEPS[currentStepId] ?? STEPS[FIRST_STEP_ID];
  const minimal = isMinimalAnswer(patientText);
  const entries: SuggestedEntry[] = [];

  if (!minimal) {
    entries.push({ category: step.category, content: patientText.trim() });
  }

  const nextStepId = step.next;
  const ack = minimal
    ? 'Está bien, no tenemos que hablar de eso ahora. '
    : 'Gracias por compartirlo. ';

  if (nextStepId === null) {
    // Graceful conclusion regardless of how much was shared.
    return {
      nextStepId: null,
      companionText: minimal
        ? 'Perfecto. Con esto es suficiente para empezar. '
        : 'Lo tomo en cuenta. Con esto es suficiente para empezar. ',
      entries,
      promptId: 'complete',
    };
  }

  const next = STEPS[nextStepId];
  return {
    nextStepId,
    companionText: ack + next.prompt,
    entries,
    promptId: nextStepId,
  };
}
