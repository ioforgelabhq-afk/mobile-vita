import { GuardrailsService } from '@/services/guardrails';

// T062 — guardrails: informational, never diagnostic (Principle III; FR-010/FR-011).
describe('GuardrailsService', () => {
  const g = new GuardrailsService();

  it('flags companion copy that asserts a diagnosis or treatment instruction', () => {
    expect(g.inspect('creo que tienes diabetes').ok).toBe(false);
    expect(g.inspect('deja de tomar tu medicamento').ok).toBe(false);
  });

  it('passes ordinary informational companion copy', () => {
    expect(g.inspect('Gracias por contarme. ¿Cómo has dormido esta semana?').ok).toBe(true);
  });

  it('detects when the patient asks for a diagnosis', () => {
    expect(g.detectDiagnosisRequest('¿qué tengo?')).toBe(true);
    expect(g.detectDiagnosisRequest('¿me puedes diagnosticar?')).toBe(true);
    expect(g.detectDiagnosisRequest('quiero caminar más')).toBe(false);
  });

  it('reframes toward information + a licensed provider', () => {
    const r = g.reframe();
    expect(r).toMatch(/no puedo darte un diagnóstico/i);
    expect(r).toMatch(/profesional de la salud/i);
  });
});
