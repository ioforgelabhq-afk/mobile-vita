/**
 * Physician Briefing — pure composition over feature 003's Living Record aggregation (spec 004;
 * research D1–D6). Introduces NO new aggregation logic and NO new persisted document (FR-015);
 * the one new persisted entity for this feature is `Physician`, handled by its own repository.
 *
 * Generation is fail-closed on the (pre-existing) `share_with_physician` consent purpose —
 * `canGenerate` must be checked before calling `generate`, which also re-checks and throws.
 */
import { loadItems, loadDailyHistory, filterItems } from '@/services/living-record-view';
import { hasConsent } from '@/services/consent-gate';
import { guardrails } from '@/services/guardrails';
import { ConsentRequiredError } from '@/repositories/contracts/errors';
import type { BriefingDocument, BriefingScope, BriefingSection } from './types';

const DISCLAIMER =
  'Este resumen contiene información reportada por el paciente a través de VITA. Es informativo, ' +
  'no constituye un diagnóstico ni una evaluación clínica.';

const BAND_LABEL: Record<string, string> = {
  great: 'Muy bien',
  good: 'Bien',
  moderate: 'Moderado',
  low: 'Bajo',
};

/** True only if the patient has granted the existing share_with_physician purpose (FR-010). */
export async function canGenerate(patientId: string): Promise<boolean> {
  return hasConsent(patientId, 'share_with_physician');
}

/**
 * Composes a BriefingDocument. Throws ConsentRequiredError if `share_with_physician` is not
 * granted — callers should check `canGenerate` first to show the consent-explanation UI (FR-011)
 * rather than relying on this throw for control flow.
 */
export async function generate(patientId: string, scope: BriefingScope = {}): Promise<BriefingDocument> {
  if (!(await canGenerate(patientId))) {
    throw new ConsentRequiredError('share_with_physician');
  }

  const excludedCategories = scope.excludedCategories ?? [];

  // Reuse feature 003's date filter; category exclusion is a thin client-side inversion (D5).
  const allItems = await loadItems(patientId);
  const dateFiltered = filterItems(allItems, { from: scope.from, to: scope.to });
  const items = dateFiltered.filter((i) => !excludedCategories.includes(i.category));

  const entryLines = items
    .filter((i) => i.kind === 'entry')
    .map((i) => `[${i.category}] ${i.content}`)
    .filter((line) => guardrails.inspect(line).ok); // FR-007/009 — omit anything that fails

  const eventLines = items
    .filter((i) => i.kind === 'health_event')
    .map((i) => `[${i.category}] ${i.content}`)
    .filter((line) => guardrails.inspect(line).ok);

  const history = (await loadDailyHistory(patientId)).filter((p) => {
    if (scope.from && p.date < scope.from) return false;
    if (scope.to && p.date > scope.to) return false;
    return true;
  });
  const historyLines = history.map(
    (p) => `${p.date}: ${p.score}/100 (${BAND_LABEL[p.band] ?? p.band}) — indicador informativo`,
  );

  const sections: BriefingSection[] = [
    { title: 'Metas y preocupaciones', items: entryLines },
    { title: 'Eventos de salud', items: eventLines },
    { title: 'Historial diario', items: historyLines },
  ];

  const isEmpty = sections.every((s) => s.items.length === 0);

  return {
    patientId,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    sections,
    scope: { from: scope.from, to: scope.to, excludedCategories },
    isEmpty,
  };
}
