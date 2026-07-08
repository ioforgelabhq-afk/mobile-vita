/**
 * Fail-closed consent gate (Constitution Principles II & VII; spec FR-012/FR-016).
 *
 * Any health-data write MUST call requireConsent() first. The gate DENIES by default:
 * if no ConsentRepository is wired, or the purpose was not granted, it throws. This holds
 * from the very first increment (analysis finding C1) — US1's Living Record writes are gated
 * before US2's consent UI exists (US1 tests seed consent programmatically).
 */
import type { ConsentPurpose } from '@/repositories/contracts/schemas';
import { ConsentRequiredError } from '@/repositories/contracts/errors';

export interface ConsentChecker {
  isGranted(patientId: string, purpose: ConsentPurpose): Promise<boolean>;
}

let checker: ConsentChecker | null = null;

/** Wire the real ConsentRepository (US2). Until then the gate stays default-deny. */
export function setConsentChecker(c: ConsentChecker | null): void {
  checker = c;
}

/** Throws ConsentRequiredError unless the purpose is explicitly granted for the patient. */
export async function requireConsent(
  patientId: string,
  purpose: ConsentPurpose,
): Promise<void> {
  const granted = checker ? await checker.isGranted(patientId, purpose) : false;
  if (!granted) throw new ConsentRequiredError(purpose);
}

export async function hasConsent(
  patientId: string,
  purpose: ConsentPurpose,
): Promise<boolean> {
  return checker ? checker.isGranted(patientId, purpose) : false;
}
