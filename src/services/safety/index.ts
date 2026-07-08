/**
 * SafetyService — client-side crisis detection (Constitution Principle IV; spec FR-017/017a/019).
 *
 * Runs on EVERY patient message before normal flow. Detects (a) explicit statements and
 * (b) concerning intent/keyword patterns (self-harm, medical emergency). It performs NO
 * clinical triage or diagnosis — it only decides whether to surface safety resources. On
 * ambiguous-but-concerning phrasing it errs toward surfacing (FR-019).
 *
 * Spanish-first per the brand kit; a few English cues are included defensively.
 * The rule set is versioned so it can be reviewed and expanded safely.
 */
import type { SafetyMatchType, SafetyResource } from '@/repositories/contracts/schemas';

export const SAFETY_RULESET_VERSION = '2026-07-07';

export interface SafetyMatch {
  matched: boolean;
  matchType?: SafetyMatchType;
  category?: 'self_harm' | 'medical_emergency';
  ambiguous?: boolean;
}

/** Explicit, high-confidence phrases (Spanish + a few English). */
const EXPLICIT: { re: RegExp; category: SafetyMatch['category'] }[] = [
  { re: /\bme quiero morir\b/i, category: 'self_harm' },
  { re: /\bquiero morir(me)?\b/i, category: 'self_harm' },
  { re: /\bme voy a (matar|suicidar)\b/i, category: 'self_harm' },
  { re: /\bsuicidarme\b/i, category: 'self_harm' },
  { re: /\bhacerme daño\b/i, category: 'self_harm' },
  { re: /\bkill myself\b/i, category: 'self_harm' },
  { re: /\bwant to die\b/i, category: 'self_harm' },
  { re: /\bno quiero (seguir )?vivir\b/i, category: 'self_harm' },
  { re: /\b(dolor en el pecho|chest pain)\b/i, category: 'medical_emergency' },
  { re: /\bno puedo respirar\b/i, category: 'medical_emergency' },
  { re: /\bcan'?t breathe\b/i, category: 'medical_emergency' },
];

/** Softer intent/keyword signals — matched pairs raise concern; single hits are ambiguous. */
// Note: no trailing \b after accented letters — JS word boundaries are ASCII-only.
const INTENT_SELF_HARM = [
  /\bno vale la pena\b/i,
  /\bmejor sin m[ií]/i,
  /\bestoy harto de todo\b/i,
  /\bya no aguanto\b/i,
  /\bacabar con todo\b/i,
  /\bdesaparecer\b/i,
];
const INTENT_EMERGENCY = [
  /\bemergencia\b/i,
  /\bme siento muy mal\b/i,
  /\bmareo (fuerte|intenso)\b/i,
  /\bsangrado\b/i,
  /\bdesmay(o|arme)\b/i,
];

export class SafetyService {
  screen(text: string): SafetyMatch {
    const t = text.normalize('NFC');

    for (const { re, category } of EXPLICIT) {
      if (re.test(t)) return { matched: true, matchType: 'explicit', category };
    }

    const selfHarmHits = INTENT_SELF_HARM.filter((re) => re.test(t)).length;
    const emergencyHits = INTENT_EMERGENCY.filter((re) => re.test(t)).length;

    if (selfHarmHits >= 2) {
      return { matched: true, matchType: 'intent_pattern', category: 'self_harm' };
    }
    if (emergencyHits >= 2) {
      return { matched: true, matchType: 'intent_pattern', category: 'medical_emergency' };
    }
    // FR-019: a single concerning signal is ambiguous — err toward surfacing resources.
    if (selfHarmHits === 1) {
      return { matched: true, matchType: 'intent_pattern', category: 'self_harm', ambiguous: true };
    }
    if (emergencyHits === 1) {
      return {
        matched: true,
        matchType: 'intent_pattern',
        category: 'medical_emergency',
        ambiguous: true,
      };
    }
    return { matched: false };
  }

  resourcesFor(category: SafetyMatch['category']): SafetyResource[] {
    if (category === 'self_harm') {
      return [
        {
          label: 'Línea de la Vida (México)',
          description: 'Apoyo emocional gratuito y confidencial, 24/7.',
          phone: '800 911 2000',
          url: null,
        },
        {
          label: 'Emergencias',
          description: 'Si estás en peligro inmediato, llama a emergencias.',
          phone: '911',
          url: null,
        },
      ];
    }
    return [
      {
        label: 'Emergencias médicas',
        description: 'Si es una emergencia, llama de inmediato.',
        phone: '911',
        url: null,
      },
    ];
  }
}

export const safetyService = new SafetyService();
