/**
 * Daily check-in copy (Spanish-first). Companion-voiced, informational framing (Principles I, III).
 */
export const dailyIntro = {
  greeting: 'Hola de nuevo',
  subtitle: 'Un momento breve para ver cómo estás hoy.',
  start: 'Empezar',
};

export const scoreCopy = {
  title: 'Tu indicador de hoy',
  disclaimer:
    'Es un indicador de bienestar informativo, no un diagnóstico. Si algo te preocupa, consúltalo con un profesional de la salud.',
  bandLabel: {
    low: 'Bajo',
    moderate: 'Moderado',
    good: 'Bien',
    great: 'Muy bien',
  } as const,
};

/** Shown when the patient already checked in today (one-per-day). */
export const alreadyToday = {
  title: 'Ya registraste tu día',
  body: 'Aquí está tu indicador de hoy. Nos vemos mañana para el siguiente registro.',
};
