/**
 * Guardrails — informational, never diagnostic (Constitution Principle III; spec FR-010/FR-011).
 *
 * Two jobs:
 *  1. inspect() flags companion copy that asserts a diagnosis or directs treatment changes,
 *     so such text is never shown to the patient.
 *  2. detectDiagnosisRequest() spots when the PATIENT asks for a diagnosis/treatment decision,
 *     so the flow can decline, reframe as informational, and point to a licensed provider.
 */
const DIAGNOSTIC_ASSERTIONS = [
  /\btienes\s+(cáncer|diabetes|covid|una infección|un tumor)\b/i,
  /\bes(to)?\s+es\s+(cáncer|un infarto|un tumor)\b/i,
  /\bte diagnostico\b/i,
  /\bpadeces\b/i,
  /\bdeja de tomar\b/i,
  /\bsuspende (tu|el) (medicamento|tratamiento)\b/i,
  /\baumenta la dosis\b/i,
  /\byou have\s+(cancer|diabetes)\b/i,
];

const DIAGNOSIS_REQUESTS = [
  /\b(qué|que) tengo\b/i,
  /\bme puedes? diagnosticar\b/i,
  /\bes grave\b/i,
  /\btengo (cáncer|diabetes|covid)\b\??/i,
  /\bqué medicamento (tomo|debo tomar)\b/i,
  /\bdiagnóstic/i,
  /\bwhat do i have\b/i,
];

export interface GuardrailResult {
  ok: boolean;
  reason?: string;
}

export class GuardrailsService {
  /** Returns ok:false if companion-authored text reads as a diagnosis/clinical instruction. */
  inspect(companionText: string): GuardrailResult {
    for (const re of DIAGNOSTIC_ASSERTIONS) {
      if (re.test(companionText)) {
        return { ok: false, reason: 'diagnostic_or_treatment_instruction' };
      }
    }
    return { ok: true };
  }

  /** True when the patient is asking VITA to diagnose or prescribe. */
  detectDiagnosisRequest(patientText: string): boolean {
    return DIAGNOSIS_REQUESTS.some((re) => re.test(patientText));
  }

  /** Standard informational reframe pointing to a licensed provider (FR-011). */
  reframe(): string {
    return (
      'Como tu compañero de salud, no puedo darte un diagnóstico ni indicarte un tratamiento. ' +
      'Puedo compartir información general y ayudarte a organizar lo que sientes, pero para una ' +
      'valoración conviene consultarlo con un profesional de la salud. ¿Quieres que lo anotemos ' +
      'en tu registro para tenerlo a la mano?'
    );
  }
}

export const guardrails = new GuardrailsService();
