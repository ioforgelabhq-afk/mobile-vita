/**
 * On-device Daily Score (spec FR-006/007/009; research D2).
 *
 * A transparent, deterministic weighted heuristic — NOT a clinical instrument (Principle III).
 * Each available input contributes a normalized 0–1 sub-score; missing inputs are skipped and the
 * remaining weights are renormalized so sparse check-ins still yield a score (FR-003). Returns the
 * 0–100 score, a band, and an explainable component breakdown (FR-007). Weights are tunable
 * constants, documented here; they encode no medical claim.
 */
import type { Mood, ScoreBand, ScoreComponent } from '@/repositories/contracts/schemas';

export interface ScoreInputs {
  mood?: Mood | null;
  energy?: number | null; // 1–5
  sleepHours?: number | null; // 0–24
  symptomCount?: number | null; // number of reported symptoms
}

export interface ScoreResult {
  score: number; // 0–100
  band: ScoreBand;
  components: ScoreComponent[];
}

const WEIGHTS = { mood: 0.4, sleep: 0.25, energy: 0.2, symptoms: 0.15 } as const;

const MOOD_VALUE: Record<Mood, number> = { great: 1, good: 0.8, ok: 0.6, low: 0.35, bad: 0.15 };

/** Ideal sleep ~8h; falls off with distance from it (0–1). */
function sleepValue(hours: number): number {
  const diff = Math.abs(hours - 8);
  return Math.max(0, 1 - diff / 8);
}

/** More reported symptoms → lower sub-score (0–1); 0 symptoms = 1, ≥4 ≈ 0. */
function symptomValue(count: number): number {
  return Math.max(0, 1 - count / 4);
}

export function bandFor(score: number): ScoreBand {
  if (score >= 85) return 'great';
  if (score >= 65) return 'good';
  if (score >= 40) return 'moderate';
  return 'low';
}

export function computeScore(inputs: ScoreInputs): ScoreResult {
  const parts: { key: keyof typeof WEIGHTS; label: string; value: number }[] = [];

  if (inputs.mood != null) parts.push({ key: 'mood', label: 'Ánimo', value: MOOD_VALUE[inputs.mood] });
  if (inputs.sleepHours != null)
    parts.push({ key: 'sleep', label: 'Sueño', value: sleepValue(inputs.sleepHours) });
  if (inputs.energy != null)
    parts.push({ key: 'energy', label: 'Energía', value: (inputs.energy - 1) / 4 });
  if (inputs.symptomCount != null)
    parts.push({ key: 'symptoms', label: 'Síntomas', value: symptomValue(inputs.symptomCount) });

  // Neutral default when nothing was shared (FR-003): a mid score rather than 0.
  if (parts.length === 0) {
    return { score: 60, band: bandFor(60), components: [] };
  }

  const totalWeight = parts.reduce((s, p) => s + WEIGHTS[p.key], 0);
  let acc = 0;
  const components: ScoreComponent[] = parts.map((p) => {
    const weight = WEIGHTS[p.key] / totalWeight; // renormalized
    acc += weight * p.value;
    return { key: p.key, label: p.label, weight: Math.round(weight * 100) / 100, value: p.value };
  });

  const score = Math.round(acc * 100);
  return { score, band: bandFor(score), components };
}
