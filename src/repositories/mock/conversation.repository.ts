import type {
  ConversationRepository,
  SendMessageInput,
} from '@/repositories/contracts/conversation.repository';
import type { LivingRecordRepository } from '@/repositories/contracts/living-record.repository';
import {
  Conversation,
  ConversationTurn,
  SafetyEvent,
  LivingRecordEntry,
  type CompanionResponse,
} from '@/repositories/contracts/schemas';
import type { CollectionStore } from '@/lib/storage/store';
import { uuid, nowIso } from '@/lib/ids';
import { syncQueue } from '@/lib/sync/queue';
import { RepositoryError, ConsentRequiredError } from '@/repositories/contracts/errors';
import { safetyService } from '@/services/safety';
import { guardrails } from '@/services/guardrails';
import { advance, firstPrompt } from '@/features/onboarding/flow/engine';
import { safetyIntro } from '@/features/onboarding/content';

/**
 * Mock ConversationRepository (the MVP "companion").
 *
 * Order of operations for a patient message (Principle IV is absolute):
 *   1. record the patient turn (flagged if safety matched)
 *   2. SAFETY FIRST — if a crisis signal is detected, surface resources and DO NOT advance
 *   3. diagnosis/treatment request → decline + reframe (guardrails, FR-011), DO NOT advance
 *   4. otherwise advance the adaptive flow and persist confirmed entries (consent-gated)
 */
export class MockConversationRepository implements ConversationRepository {
  constructor(
    private readonly conversations: CollectionStore<Conversation>,
    private readonly turns: CollectionStore<ConversationTurn>,
    private readonly livingRecord: LivingRecordRepository,
    private readonly safetyEvents?: CollectionStore<SafetyEvent>,
  ) {}

  async startOrResume(patientId: string): Promise<Conversation> {
    const existing = (await this.conversations.list()).find(
      (c) => c.patientId === patientId && c.type === 'onboarding' && c.status !== 'completed',
    );
    if (existing) return existing;

    const now = nowIso();
    const convo = Conversation.parse({
      id: uuid(),
      patientId,
      type: 'onboarding',
      status: 'in_progress',
      currentStepId: null,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      clientMutationId: uuid(),
    });
    await this.conversations.put(convo);
    syncQueue.enqueue({
      clientMutationId: convo.clientMutationId,
      collection: 'conversations',
      op: 'create',
      payload: { id: convo.id, type: convo.type },
      enqueuedAt: nowIso(),
    });

    // Seed the opening companion turn.
    const first = firstPrompt();
    await this.appendTurn(convo.id, 'companion', first.companionText, first.promptId, false);
    await this.conversations.put({ ...convo, currentStepId: first.stepId, updatedAt: nowIso() });
    return (await this.conversations.get(convo.id))!;
  }

  async sendPatientMessage(input: SendMessageInput): Promise<CompanionResponse> {
    const convo = await this.conversations.get(input.conversationId);
    if (!convo) throw new RepositoryError('not_found', 'Conversation not found');

    const safety = safetyService.screen(input.text);
    await this.appendTurn(convo.id, 'patient', input.text, null, safety.matched, input.clientMutationId);

    // 2 — Safety first: surface resources, do not advance the flow (FR-017/018/019).
    if (safety.matched) {
      const now = nowIso();
      const event = SafetyEvent.parse({
        id: uuid(),
        conversationId: convo.id,
        turnId: null,
        matchType: safety.matchType!,
        resources: safetyService.resourcesFor(safety.category),
        surfacedAt: now,
        createdAt: now,
      });
      await this.safetyEvents?.put(event); // persist for the Living Record / audit (T048)
      const companionTurn = await this.appendTurn(
        convo.id,
        'companion',
        `${safetyIntro.title}. ${safetyIntro.body}`,
        'safety',
        true,
      );
      return { companionTurn, suggestedEntries: [], safetyEvent: event };
    }

    // 3 — Diagnosis/treatment request: decline + reframe, do not advance (FR-011).
    if (guardrails.detectDiagnosisRequest(input.text)) {
      const companionTurn = await this.appendTurn(convo.id, 'companion', guardrails.reframe(), 'reframe', false);
      return { companionTurn, suggestedEntries: [] };
    }

    // 4 — Advance the adaptive flow.
    const result = advance(convo.currentStepId ?? 'why', input.text);

    // Persist confirmed entries — consent-gated. Without consent, skip gracefully (FR-016).
    const persisted: LivingRecordEntry[] = [];
    for (const e of result.entries) {
      try {
        const entry = await this.livingRecord.add(
          { patientId: convo.patientId, category: e.category, content: e.content },
          uuid(),
        );
        persisted.push(entry);
      } catch (err) {
        if (!(err instanceof ConsentRequiredError)) throw err;
      }
    }

    // Guardrail the companion copy before showing it (Principle III).
    const safeText = guardrails.inspect(result.companionText).ok
      ? result.companionText
      : 'Gracias por compartirlo.';

    const companionTurn = await this.appendTurn(convo.id, 'companion', safeText, result.promptId, false);
    await this.conversations.put({
      ...convo,
      currentStepId: result.nextStepId,
      updatedAt: nowIso(),
    });

    return { companionTurn, suggestedEntries: persisted };
  }

  async complete(conversationId: string, clientMutationId: string): Promise<Conversation> {
    const convo = await this.conversations.get(conversationId);
    if (!convo) throw new RepositoryError('not_found', 'Conversation not found');
    const completed: Conversation = {
      ...convo,
      status: 'completed',
      completedAt: nowIso(),
      updatedAt: nowIso(),
      version: convo.version + 1,
      clientMutationId,
    };
    syncQueue.enqueue({ clientMutationId, collection: 'conversations', op: 'update', payload: { id: conversationId, status: 'completed' }, enqueuedAt: nowIso() });
    return this.conversations.put(completed);
  }

  async getTurns(conversationId: string): Promise<ConversationTurn[]> {
    const all = await this.turns.list();
    return all
      .filter((t) => t.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  private async appendTurn(
    conversationId: string,
    role: 'companion' | 'patient',
    text: string,
    promptId: string | null,
    safetyFlagged: boolean,
    clientMutationId?: string,
  ): Promise<ConversationTurn> {
    const now = nowIso();
    const cmid = clientMutationId ?? uuid();
    const turn = ConversationTurn.parse({
      id: uuid(),
      conversationId,
      role,
      text,
      promptId,
      safetyFlagged,
      createdAt: now,
      updatedAt: now,
      clientMutationId: cmid,
    });
    // Patient turns are user-authored mutations → sync-queued (companion turns are derived).
    if (role === 'patient') {
      syncQueue.enqueue({ clientMutationId: cmid, collection: 'turns', op: 'create', payload: { conversationId }, enqueuedAt: now });
    }
    return this.turns.put(turn);
  }
}
