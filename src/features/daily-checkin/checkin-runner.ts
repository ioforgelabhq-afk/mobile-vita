/**
 * Daily check-in orchestrator (pure, React-free) — testable in the logic suite and wrapped by the
 * `useDailyCheckin` hook. Safety is screened FIRST on every answer (Principle IV), diagnosis
 * requests are reframed (FR-021), answers are parsed + persisted (consent-gated inside the repo),
 * and on the final step: the Daily Score is computed on-device and saved (FR-006/009), each
 * reported symptom becomes an attributed Health Event (FR-015), and informational Insights are
 * generated and persisted (FR-010/012). Uses the repository registry, so Mock↔API swap needs no
 * changes here (Principle IX).
 */
import {
  dailyCheckinRepository,
  dailyScoreRepository,
  healthEventRepository,
  insightRepository,
} from '@/repositories';
import type { DailyCheckin, DailyScore, Insight, SafetyEvent } from '@/repositories/contracts/schemas';
import { SafetyEvent as SafetyEventSchema } from '@/repositories/contracts/schemas';
import { safetyService } from '@/services/safety';
import { guardrails } from '@/services/guardrails';
import { computeScore } from '@/services/scoring';
import { insightsService } from '@/services/insights';
import { ConsentRequiredError } from '@/repositories/contracts/errors';
import { uuid, nowIso } from '@/lib/ids';
import {
  FIRST_DAILY_STEP,
  dailyPrompt,
  nextDailyStep,
  parseAnswer,
  type DailyStepId,
} from './flow/engine';

export interface StartResult {
  checkin: DailyCheckin;
  alreadyDone: boolean;
  score: DailyScore | null;
  insights: Insight[];
  step: DailyStepId;
  prompt: string;
}

export interface SubmitResult {
  checkin: DailyCheckin;
  safetyEvent?: SafetyEvent; // present → surface resources, do not advance (FR-020)
  reframe?: string; // diagnosis request → informational reframe, do not advance (FR-021)
  nextStep?: DailyStepId;
  prompt?: string;
  done?: boolean;
  score?: DailyScore;
  insights?: Insight[];
}

export async function startCheckin(patientId: string, date: string): Promise<StartResult> {
  const checkin = await dailyCheckinRepository().startOrResume(patientId, date);
  if (checkin.completedAt) {
    const score = await dailyScoreRepository().forDate(patientId, date);
    const insights = score
      ? (await insightRepository().list(patientId)).filter((i) => i.relatedEntityId === score.id)
      : [];
    return { checkin, alreadyDone: true, score, insights, step: FIRST_DAILY_STEP, prompt: dailyPrompt(FIRST_DAILY_STEP) };
  }
  return { checkin, alreadyDone: false, score: null, insights: [], step: FIRST_DAILY_STEP, prompt: dailyPrompt(FIRST_DAILY_STEP) };
}

export async function submitAnswer(
  checkin: DailyCheckin,
  step: DailyStepId,
  text: string,
): Promise<SubmitResult> {
  // 1 — Safety first (IV): surface resources, do not advance.
  const safety = safetyService.screen(text);
  if (safety.matched) {
    const now = nowIso();
    const safetyEvent = SafetyEventSchema.parse({
      id: uuid(),
      conversationId: checkin.conversationId,
      turnId: null,
      matchType: safety.matchType!,
      resources: safetyService.resourcesFor(safety.category),
      surfacedAt: now,
      createdAt: now,
    });
    return { checkin, safetyEvent };
  }

  // 2 — Diagnosis/treatment request → decline + reframe, do not advance (FR-021).
  if (guardrails.detectDiagnosisRequest(text)) {
    return { checkin, reframe: guardrails.reframe() };
  }

  // 3 — Parse + persist (consent gate lives inside the repo for health fields).
  const patch = parseAnswer(step, text);
  const updated = await dailyCheckinRepository().update(checkin.id, patch, uuid());

  const next = nextDailyStep(step);
  if (next) {
    return { checkin: updated, nextStep: next, prompt: dailyPrompt(next) };
  }

  // 4 — Final step → compute the Daily Score on-device and persist (FR-006/009).
  const fresh = (await dailyCheckinRepository().forDate(updated.patientId, updated.date)) ?? updated;
  const result = computeScore({
    mood: fresh.mood,
    energy: fresh.energy,
    sleepHours: fresh.sleepHours,
    symptomCount: fresh.symptoms.length,
  });
  const score = await dailyScoreRepository().save(
    {
      patientId: fresh.patientId,
      date: fresh.date,
      score: result.score,
      band: result.band,
      components: result.components,
      checkInId: fresh.id,
    },
    uuid(),
  );
  const completed = await dailyCheckinRepository().complete(fresh.id, score.id, uuid());

  // 5 — Each reported symptom becomes an attributed Health Event (FR-015). Consent-gated inside
  // the repo (fail-closed); if declined, symptoms were already dropped by `update` so this is a
  // no-op, but we guard defensively against a race.
  for (const symptom of fresh.symptoms) {
    try {
      await healthEventRepository().add(
        {
          patientId: fresh.patientId,
          type: 'symptom',
          title: symptom,
          occurredAt: score.computedAt,
          relatedConversationId: fresh.conversationId,
          source: 'daily_checkin',
        },
        uuid(),
      );
    } catch (err) {
      if (!(err instanceof ConsentRequiredError)) throw err;
    }
  }

  // 6 — Generate informational Insights from the score + recent history (FR-010/011/014).
  const history = (await dailyScoreRepository().list(fresh.patientId))
    .filter((s) => s.date < fresh.date)
    .map((s) => s.score);
  const candidates = insightsService.generate({ band: score.band, score: score.score, history });
  const insights: Insight[] = [];
  for (const c of candidates) {
    const insight = await insightRepository().add(
      { patientId: fresh.patientId, title: c.title, body: c.body, category: c.category, relatedEntityType: 'daily_score', relatedEntityId: score.id },
      uuid(),
    );
    insights.push(insight);
  }

  return { checkin: completed, done: true, score, insights };
}
