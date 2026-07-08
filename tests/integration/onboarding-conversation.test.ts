/**
 * T024 [US1] — full onboarding conversation → populated Living Record, driven end-to-end
 * against the Mock repositories. Consent is seeded programmatically (the C1 note: real consent
 * capture is US2). Also covers the SC-004 safety-first behavior and FR-016 consent gating.
 */
import { memoryStore } from '@/lib/storage/store';
import {
  Conversation,
  ConversationTurn,
  LivingRecordEntry,
} from '@/repositories/contracts/schemas';
import { MockLivingRecordRepository } from '@/repositories/mock/living-record.repository';
import { MockConversationRepository } from '@/repositories/mock/conversation.repository';
import { setConsentChecker } from '@/services/consent-gate';
import { uuid } from '@/lib/ids';

function build(consent: boolean) {
  setConsentChecker({ async isGranted() { return consent; } });
  const living = new MockLivingRecordRepository(memoryStore<LivingRecordEntry>());
  const convo = new MockConversationRepository(
    memoryStore<Conversation>(),
    memoryStore<ConversationTurn>(),
    living,
  );
  return { living, convo };
}

const PATIENT = 'local-patient';

afterEach(() => setConsentChecker(null));

it('completes a conversation and seeds a categorized Living Record (SC-001)', async () => {
  const { living, convo } = build(true);
  const c = await convo.startOrResume(PATIENT);
  expect(c.status).toBe('in_progress');

  await convo.sendPatientMessage({ conversationId: c.id, text: 'me preocupa mi presión', clientMutationId: uuid() });
  await convo.sendPatientMessage({ conversationId: c.id, text: 'he dormido mal', clientMutationId: uuid() });
  await convo.sendPatientMessage({ conversationId: c.id, text: 'quiero caminar más', clientMutationId: uuid() });
  await convo.sendPatientMessage({ conversationId: c.id, text: 'recordatorios suaves', clientMutationId: uuid() });
  const last = await convo.sendPatientMessage({ conversationId: c.id, text: 'nada más', clientMutationId: uuid() });

  const entries = await living.list(PATIENT);
  expect(entries.length).toBeGreaterThanOrEqual(4);
  expect(entries.map((e) => e.category)).toEqual(
    expect.arrayContaining(['concern', 'health_context', 'goal', 'preference']),
  );
  expect(last.safetyEvent).toBeUndefined();

  const done = await convo.complete(c.id, uuid());
  expect(done.status).toBe('completed');
});

it('surfaces safety resources before advancing when a crisis signal appears (SC-004)', async () => {
  const { convo } = build(true);
  const c = await convo.startOrResume(PATIENT);
  const res = await convo.sendPatientMessage({
    conversationId: c.id,
    text: 'la verdad me quiero morir',
    clientMutationId: uuid(),
  });
  expect(res.safetyEvent).toBeDefined();
  expect(res.safetyEvent!.resources.length).toBeGreaterThan(0);
  expect(res.suggestedEntries).toHaveLength(0);
});

it('does not store health data without consent (FR-016) but still converses', async () => {
  const { living, convo } = build(false);
  const c = await convo.startOrResume(PATIENT);
  const res = await convo.sendPatientMessage({
    conversationId: c.id,
    text: 'me preocupa mi presión',
    clientMutationId: uuid(),
  });
  expect(res.companionTurn.text.length).toBeGreaterThan(0);
  expect(await living.list(PATIENT)).toHaveLength(0);
});

it('corrects an entry by superseding the prior value (FR-008)', async () => {
  const { living } = build(true);
  const added = await living.add({ patientId: PATIENT, category: 'goal', content: 'caminar' }, uuid());
  const corrected = await living.correct(added.id, { content: 'caminar 30 min' }, uuid());
  const active = await living.list(PATIENT);
  expect(active).toHaveLength(1);
  expect(active[0].content).toBe('caminar 30 min');
  expect(corrected.supersedesId).toBe(added.id);
});
