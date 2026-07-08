import type { ConsentDefinition } from '@/repositories/contracts/consent.repository';

/**
 * The consent purposes presented during onboarding (Spanish-first). `version` is recorded on
 * the ConsentRecord for auditability (FR-016a). `store_health_data` is required to build the
 * Living Record; the patient may still decline it and continue (decline-all flow, FR-014).
 */
export const CONSENT_DEFINITION: ConsentDefinition = {
  version: '2026-07-07',
  purposes: [
    {
      purpose: 'store_health_data',
      label: 'Guardar mi información de salud',
      description:
        'Permitir que VITA guarde en tu dispositivo lo que compartas para construir tu Registro Vivo.',
      required: false,
    },
    {
      purpose: 'personalize_guidance',
      label: 'Personalizar mi acompañamiento',
      description: 'Usar tu información para adaptar la orientación diaria a ti.',
      required: false,
    },
    {
      purpose: 'improve_service',
      label: 'Ayudar a mejorar VITA',
      description: 'Usar datos de forma agregada y privada para mejorar el servicio.',
      required: false,
    },
  ],
};
