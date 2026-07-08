import { requireConsent, hasConsent, setConsentChecker } from '@/services/consent-gate';
import { ConsentRequiredError } from '@/repositories/contracts/errors';

// Fail-closed consent gate (C1 remediation; FR-012/FR-016).
describe('consent gate (fail-closed)', () => {
  afterEach(() => setConsentChecker(null));

  it('denies by default when no checker is wired', async () => {
    setConsentChecker(null);
    await expect(requireConsent('p1', 'store_health_data')).rejects.toBeInstanceOf(
      ConsentRequiredError,
    );
    expect(await hasConsent('p1', 'store_health_data')).toBe(false);
  });

  it('allows only explicitly granted purposes', async () => {
    setConsentChecker({
      async isGranted(_patientId, purpose) {
        return purpose === 'store_health_data';
      },
    });
    await expect(requireConsent('p1', 'store_health_data')).resolves.toBeUndefined();
    await expect(requireConsent('p1', 'improve_service')).rejects.toBeInstanceOf(
      ConsentRequiredError,
    );
  });
});
