import type { Href } from 'expo-router';

/**
 * Onboarding wizard — one screen at a time. Each step is a full-screen route in the
 * (onboarding) group; the patient advances step by step. The `conversation` step stays
 * conversational inside the wizard (Principle V); the others are focused single-purpose screens.
 */
export interface WizardStep {
  key: string;
  label: string;
  route: Href;
}

export const WIZARD_STEPS: WizardStep[] = [
  { key: 'welcome', label: 'Bienvenida', route: '/(onboarding)/welcome' },
  { key: 'consent', label: 'Consentimiento', route: '/(onboarding)/consent' },
  { key: 'conversation', label: 'Conversación', route: '/(onboarding)/conversation' },
  { key: 'review', label: 'Tu registro', route: '/(onboarding)/review' },
  { key: 'complete', label: 'Listo', route: '/(onboarding)/complete' },
];

export function stepIndex(key: string): number {
  return WIZARD_STEPS.findIndex((s) => s.key === key);
}

export function nextRoute(key: string): Href | null {
  const i = stepIndex(key);
  return i >= 0 && i < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[i + 1].route : null;
}
