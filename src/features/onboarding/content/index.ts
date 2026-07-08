/**
 * Onboarding copy (Spanish-first per the brand kit). Centralized so the companion-not-provider
 * (Principle I) and informational-not-diagnostic (Principle III) framing is reviewable in one
 * place rather than scattered across screens.
 */
export const roleDisclosure = {
  title: 'Hola, soy VITA',
  companionLine:
    'Soy tu compañero de salud. No soy un médico ni sustituyo a uno: te acompaño, te escucho y organizo tu información.',
  informationalLine:
    'Lo que comparto es información para orientarte, nunca un diagnóstico. Para decisiones médicas, siempre acude con un profesional de la salud.',
  cta: 'Continuar',
};

export const consentIntro = {
  title: 'Tú eres dueño de tus datos',
  body:
    'Antes de empezar, decides para qué puedo usar tu información. Puedes aceptar o rechazar cada punto por separado, y cambiar de opinión cuando quieras.',
  ownershipNote:
    'Puedes ver, exportar o eliminar tus datos y revocar tu consentimiento en cualquier momento.',
};

export const completion = {
  title: 'Tu registro ha comenzado',
  body:
    'Gracias por compartir. Empecé tu Registro Vivo con lo que me contaste; podrás revisarlo y ajustarlo cuando quieras. A partir de aquí puedo acompañarte día con día.',
  cta: 'Empezar',
};

/** Safety banner shown ahead of onboarding when a crisis signal is detected (Principle IV). */
export const safetyIntro = {
  title: 'Antes de seguir, tu bienestar es lo más importante',
  body:
    'Lo que me cuentas es importante. Si estás pasando por un momento difícil o de emergencia, aquí tienes ayuda disponible ahora mismo.',
  resume: 'Estoy a salvo, continuar',
};
