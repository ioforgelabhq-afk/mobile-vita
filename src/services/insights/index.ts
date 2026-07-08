/**
 * Insights service (spec FR-010–014; research D3).
 *
 * Deterministic, rule-based generation of informational Insights from the current Daily Score and
 * recent history. Every candidate body is passed through the shared `guardrails` check so nothing
 * diagnostic can be surfaced (Principle III). When history is thin, trend rules are skipped in
 * favor of an education/encouragement Insight (FR-014). Always returns ≥1 Insight (FR-010).
 */
import type { InsightCategory, ScoreBand } from '@/repositories/contracts/schemas';
import { guardrails } from '@/services/guardrails';

export interface InsightCandidate {
  title: string;
  body: string;
  category: InsightCategory;
}

export interface InsightContext {
  band: ScoreBand;
  score: number;
  /** Prior scores, most-recent-last; used for trend detection. */
  history: number[];
}

function trend(history: number[], score: number): InsightCandidate | null {
  if (history.length < 2) return null; // needs history (FR-014)
  const prev = history[history.length - 1];
  const delta = score - prev;
  if (delta >= 8) {
    return {
      title: 'Vas en subida',
      body: 'Tu indicador de hoy está mejor que el de tu último registro. Sigue con lo que te ha funcionado.',
      category: 'trend',
    };
  }
  if (delta <= -8) {
    return {
      title: 'Un día más bajo',
      body: 'Hoy tu indicador bajó un poco respecto a tu último registro. Es información para observar cómo te sientes, no un diagnóstico.',
      category: 'trend',
    };
  }
  return null;
}

function bandInsight(band: ScoreBand): InsightCandidate {
  switch (band) {
    case 'great':
    case 'good':
      return {
        title: 'Buen momento',
        body: 'Tu indicador de bienestar de hoy se ve bien. Buen momento para reforzar un hábito que te cuide.',
        category: 'encouragement',
      };
    case 'moderate':
      return {
        title: 'Un pequeño paso',
        body: 'Un descanso corto o una caminata suave pueden ayudarte hoy. Tú decides a tu ritmo.',
        category: 'education',
      };
    case 'low':
      return {
        title: 'Sé amable contigo',
        body: 'Los días bajos son normales. Si algo te preocupa de tu salud, conviene comentarlo con un profesional.',
        category: 'encouragement',
      };
  }
}

export class InsightsService {
  /** Returns 1–2 guardrail-passing Insights, most relevant first. */
  generate(ctx: InsightContext): InsightCandidate[] {
    const candidates: InsightCandidate[] = [];
    const t = trend(ctx.history, ctx.score);
    if (t) candidates.push(t);
    candidates.push(bandInsight(ctx.band)); // always at least one (FR-010/014)

    const safe = candidates.filter((c) => guardrails.inspect(c.body).ok); // FR-011
    // Guaranteed non-empty: bandInsight bodies are non-diagnostic by construction.
    return safe.slice(0, 2);
  }
}

export const insightsService = new InsightsService();
