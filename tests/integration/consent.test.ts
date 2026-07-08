/**
 * T036 [US2] — granular consent grant/decline gates health writes (FR-012/013/014/016).
 * Drives the MockConsentRepository + the fail-closed gate together.
 */
import { memoryStore } from '@/lib/storage/store';
import { ConsentRecord } from '@/repositories/contracts/schemas';
import { MockConsentRepository } from '@/repositories/mock/consent.repository';
import { requireConsent, setConsentChecker } from '@/services/consent-gate';
import { ConsentRequiredError } from '@/repositories/contracts/errors';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';

function build() {
  const repo = new MockConsentRepository(memoryStore<ConsentRecord>());
  setConsentChecker({ isGranted: (p, purpose) => repo.isGranted(p, purpose) });
  return repo;
}

afterEach(() => setConsentChecker(null));

it('exposes the consent definition purposes', async () => {
  const repo = build();
  const def = await repo.getConsentDefinition();
  expect(def.version).toBeTruthy();
  expect(def.purposes.map((p) => p.purpose)).toContain('store_health_data');
});

it('grants only the purposes the patient accepted (FR-013/014)', async () => {
  const repo = build();
  await repo.capture(
    {
      patientId: PATIENT,
      version: 'v',
      grants: [
        { purpose: 'store_health_data', granted: true },
        { purpose: 'improve_service', granted: false },
      ],
    },
    uuid(),
  );
  expect(await repo.isGranted(PATIENT, 'store_health_data')).toBe(true);
  expect(await repo.isGranted(PATIENT, 'improve_service')).toBe(false);
});

it('gate allows a write after consent and denies after revoke (FR-015/016)', async () => {
  const repo = build();
  await repo.capture(
    { patientId: PATIENT, version: 'v', grants: [{ purpose: 'store_health_data', granted: true }] },
    uuid(),
  );
  await expect(requireConsent(PATIENT, 'store_health_data')).resolves.toBeUndefined();

  await repo.revoke({ patientId: PATIENT }, uuid());
  await expect(requireConsent(PATIENT, 'store_health_data')).rejects.toBeInstanceOf(
    ConsentRequiredError,
  );
});

it('decline-all leaves every purpose ungranted (FR-014)', async () => {
  const repo = build();
  const def = await repo.getConsentDefinition();
  await repo.capture(
    { patientId: PATIENT, version: def.version, grants: def.purposes.map((p) => ({ purpose: p.purpose, granted: false })) },
    uuid(),
  );
  for (const p of def.purposes) expect(await repo.isGranted(PATIENT, p.purpose)).toBe(false);
});
