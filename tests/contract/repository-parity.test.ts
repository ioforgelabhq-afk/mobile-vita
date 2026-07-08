/**
 * T023 — repository contract parity. Asserts each Mock and API implementation exposes the
 * same method surface, enforcing the Mock ≡ API guarantee behind Principle IX. (Type-level
 * conformance is enforced separately by `tsc`; this catches drift at runtime too.)
 */
import { MockAuthRepository } from '@/repositories/mock/auth.repository';
import { ApiAuthRepository } from '@/repositories/api/auth.repository';
import { MockPatientRepository } from '@/repositories/mock/patient.repository';
import { ApiPatientRepository } from '@/repositories/api/patient.repository';
import { MockConversationRepository } from '@/repositories/mock/conversation.repository';
import { ApiConversationRepository } from '@/repositories/api/conversation.repository';
import { MockLivingRecordRepository } from '@/repositories/mock/living-record.repository';
import { ApiLivingRecordRepository } from '@/repositories/api/living-record.repository';
import { MockConsentRepository } from '@/repositories/mock/consent.repository';
import { ApiConsentRepository } from '@/repositories/api/consent.repository';

function methods(obj: object): string[] {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    .filter((m) => m !== 'constructor')
    .sort();
}

describe('Mock ≡ API method parity', () => {
  it.each([
    ['Auth', new MockAuthRepository(), new ApiAuthRepository()],
    ['Patient', new MockPatientRepository({} as any), new ApiPatientRepository()],
    [
      'Conversation',
      new MockConversationRepository({} as any, {} as any, {} as any),
      new ApiConversationRepository(),
    ],
    ['LivingRecord', new MockLivingRecordRepository({} as any), new ApiLivingRecordRepository()],
    ['Consent', new MockConsentRepository({} as any), new ApiConsentRepository()],
  ])('%s: every contract (API) method exists on the Mock', (_name, mock, api) => {
    // The mock may add private helpers; the guarantee is that it implements at least the
    // full contract surface the API defines (Principle IX). tsc enforces exact type conformance.
    const mockMethods = new Set(methods(mock as object));
    for (const m of methods(api as object)) expect(mockMethods.has(m)).toBe(true);
  });
});
