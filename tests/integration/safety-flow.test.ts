/**
 * T047 [US3] — a crisis signal interrupts onboarding: safety resources surface and the flow
 * does NOT advance until the patient acknowledges (Principle IV; FR-017/018). Also verifies the
 * SafetyEvent is persisted (T048) and that ambiguous signals still surface (FR-019).
 */
import { memoryStore } from '@/lib/storage/store';
import {
  Conversation,
  ConversationTurn,
  LivingRecordEntry,
  SafetyEvent,
} from '@/repositories/contracts/schemas';
import { MockLivingRecordRepository } from '@/repositories/mock/living-record.repository';
import { MockConversationRepository } from '@/repositories/mock/conversation.repository';
import { setConsentChecker } from '@/services/consent-gate';
import { uuid } from '@/lib/ids';

function build() {
  setConsentChecker({ async isGranted() { return true; } });
  const events = memoryStore<SafetyEvent>();
  const convo = new MockConversationRepository(
    memoryStore<Conversation>(),
    memoryStore<ConversationTurn>(),
    new MockLivingRecordRepository(memoryStore<LivingRecordEntry>()),
    events,
  );
  return { convo, events };
}

const PATIENT = 'local-patient';
afterEach(() => setConsentChecker(null));

it('does not advance the flow while a crisis is active, then resumes after acknowledgement', async () => {
  const { convo, events } = build();
  const c = await convo.startOrResume(PATIENT);
  const stepBefore = (await convo.startOrResume(PATIENT)).currentStepId;

  const crisis = await convo.sendPatientMessage({
    conversationId: c.id,
    text: 'ya no quiero vivir',
    clientMutationId: uuid(),
  });

  // Safety surfaced, no entries, and the flow step is unchanged (did not advance — FR-018).
  expect(crisis.safetyEvent).toBeDefined();
  expect(crisis.suggestedEntries).toHaveLength(0);
  const stepAfterCrisis = (await convo.startOrResume(PATIENT)).currentStepId;
  expect(stepAfterCrisis).toBe(stepBefore);

  // SafetyEvent persisted (T048).
  expect(await events.list()).toHaveLength(1);

  // The patient acknowledges (UI clears the banner) and continues; the flow now advances.
  const resumed = await convo.sendPatientMessage({
    conversationId: c.id,
    text: 'me preocupa mi presión',
    clientMutationId: uuid(),
  });
  expect(resumed.safetyEvent).toBeUndefined();
  expect(resumed.suggestedEntries.length).toBeGreaterThan(0);
});

it('surfaces resources on an ambiguous-but-concerning signal (FR-019)', async () => {
  const { convo } = build();
  const c = await convo.startOrResume(PATIENT);
  const res = await convo.sendPatientMessage({
    conversationId: c.id,
    text: 'ya no aguanto',
    clientMutationId: uuid(),
  });
  expect(res.safetyEvent).toBeDefined();
});
