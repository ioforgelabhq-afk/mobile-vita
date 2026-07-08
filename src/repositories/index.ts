/**
 * Repository registry — the ONLY place implementations are chosen.
 *
 * Screens/hooks import repositories from here (or from `contracts/`), never from `mock/`
 * or `api/` directly. Flipping a feature flag (src/lib/feature-flags) swaps Mock ↔ API with
 * zero screen changes (Constitution Principle IX). Mock is the default until the backend ships.
 */
import { getFlag } from '@/lib/feature-flags';

import type { AuthRepository } from '@/repositories/contracts/auth.repository';
import type { PatientRepository } from '@/repositories/contracts/patient.repository';
import type { ConversationRepository } from '@/repositories/contracts/conversation.repository';
import type { LivingRecordRepository } from '@/repositories/contracts/living-record.repository';
import type { ConsentRepository } from '@/repositories/contracts/consent.repository';
import type { DailyCheckinRepository } from '@/repositories/contracts/daily-checkin.repository';
import type { DailyScoreRepository } from '@/repositories/contracts/daily-score.repository';
import type { HealthEventRepository } from '@/repositories/contracts/health-event.repository';
import type { InsightRepository } from '@/repositories/contracts/insight.repository';

import { MockAuthRepository } from '@/repositories/mock/auth.repository';
import { MockPatientRepository } from '@/repositories/mock/patient.repository';
import { MockConversationRepository } from '@/repositories/mock/conversation.repository';
import { MockLivingRecordRepository } from '@/repositories/mock/living-record.repository';
import { MockConsentRepository } from '@/repositories/mock/consent.repository';
import { stores } from '@/repositories/mock/stores';

import { ApiAuthRepository } from '@/repositories/api/auth.repository';
import { ApiPatientRepository } from '@/repositories/api/patient.repository';
import { ApiConversationRepository } from '@/repositories/api/conversation.repository';
import { ApiLivingRecordRepository } from '@/repositories/api/living-record.repository';
import { ApiConsentRepository } from '@/repositories/api/consent.repository';
import { MockDailyCheckinRepository } from '@/repositories/mock/daily-checkin.repository';
import { MockDailyScoreRepository } from '@/repositories/mock/daily-score.repository';
import { MockHealthEventRepository } from '@/repositories/mock/health-event.repository';
import { MockInsightRepository } from '@/repositories/mock/insight.repository';
import {
  ApiDailyCheckinRepository,
  ApiDailyScoreRepository,
  ApiHealthEventRepository,
  ApiInsightRepository,
} from '@/repositories/api/daily.repositories';

import { setConsentChecker } from '@/services/consent-gate';

// Mock singletons share one local dataset.
const mockAuth = new MockAuthRepository(stores.patients);
const mockPatient = new MockPatientRepository(stores.patients);
const mockLivingRecord = new MockLivingRecordRepository(stores.entries);
const mockConversation = new MockConversationRepository(
  stores.conversations,
  stores.turns,
  mockLivingRecord,
  stores.safetyEvents,
);
const mockConsent = new MockConsentRepository(stores.consents);

const apiAuth = new ApiAuthRepository();
const apiPatient = new ApiPatientRepository();
const apiLivingRecord = new ApiLivingRecordRepository();
const apiConversation = new ApiConversationRepository();
const apiConsent = new ApiConsentRepository();

const mockDailyCheckin = new MockDailyCheckinRepository(stores.dailyCheckins);
const mockDailyScore = new MockDailyScoreRepository(stores.dailyScores);
const mockHealthEvent = new MockHealthEventRepository(stores.healthEvents);
const mockInsight = new MockInsightRepository(stores.insights);

const apiDailyCheckin = new ApiDailyCheckinRepository();
const apiDailyScore = new ApiDailyScoreRepository();
const apiHealthEvent = new ApiHealthEventRepository();
const apiInsight = new ApiInsightRepository();

export function authRepository(): AuthRepository {
  return getFlag('auth') === 'api' ? apiAuth : mockAuth;
}
export function patientRepository(): PatientRepository {
  return getFlag('patient') === 'api' ? apiPatient : mockPatient;
}
export function conversationRepository(): ConversationRepository {
  return getFlag('conversation') === 'api' ? apiConversation : mockConversation;
}
export function livingRecordRepository(): LivingRecordRepository {
  return getFlag('livingRecord') === 'api' ? apiLivingRecord : mockLivingRecord;
}
export function consentRepository(): ConsentRepository {
  return getFlag('consent') === 'api' ? apiConsent : mockConsent;
}
export function dailyCheckinRepository(): DailyCheckinRepository {
  return getFlag('dailyCheckin') === 'api' ? apiDailyCheckin : mockDailyCheckin;
}
export function dailyScoreRepository(): DailyScoreRepository {
  return getFlag('dailyScore') === 'api' ? apiDailyScore : mockDailyScore;
}
export function healthEventRepository(): HealthEventRepository {
  return getFlag('healthEvent') === 'api' ? apiHealthEvent : mockHealthEvent;
}
export function insightRepository(): InsightRepository {
  return getFlag('insight') === 'api' ? apiInsight : mockInsight;
}

// Wire the fail-closed consent gate to the active ConsentRepository (US2). Until a record is
// captured, isGranted returns false and the gate stays default-deny (FR-016).
setConsentChecker({
  isGranted: (patientId, purpose) => consentRepository().isGranted(patientId, purpose),
});

/** Handy for tests that build isolated instances. */
export const __mocks = { mockAuth, mockPatient, mockConversation, mockLivingRecord, mockConsent };
