import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authRepository, consentRepository } from '@/repositories';
import { canGenerate, generate } from '@/services/briefing';
import type { BriefingDocument, BriefingScope } from '@/services/briefing/types';
import { uuid } from '@/lib/ids';

/**
 * Consent status + on-demand generation for the physician briefing (US2/US3). Consent is
 * re-checked (not cached optimistically) so a revoke elsewhere is reflected immediately
 * (FR-011, fail-closed).
 */
export function useBriefing() {
  const [doc, setDoc] = useState<BriefingDocument | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: patientId } = useQuery({
    queryKey: ['patientId'],
    queryFn: async () => (await authRepository().getOrCreateLocalIdentity()).id,
  });

  const { data: consented = false, refetch: refetchConsent } = useQuery({
    queryKey: ['briefing-consent', patientId],
    queryFn: () => canGenerate(patientId!),
    enabled: !!patientId,
  });

  const grantConsent = async () => {
    if (!patientId) return;
    const [definition, existing] = await Promise.all([
      consentRepository().getConsentDefinition(),
      consentRepository().get(patientId),
    ]);
    const grants = definition.purposes.map((p) => ({
      purpose: p.purpose,
      granted:
        p.purpose === 'share_with_physician'
          ? true
          : (existing?.grants.find((g) => g.purpose === p.purpose)?.granted ?? false),
    }));
    await consentRepository().capture({ patientId, version: definition.version, grants }, uuid());
    await refetchConsent();
  };

  const run = async (scope: BriefingScope = {}) => {
    if (!patientId) return;
    setGenerating(true);
    try {
      setDoc(await generate(patientId, scope));
    } finally {
      setGenerating(false);
    }
  };

  return { consented, grantConsent, doc, generating, run };
}
