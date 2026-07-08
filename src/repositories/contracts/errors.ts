/**
 * Typed repository errors + a small id/timestamp helper surface.
 * `code` values mirror docs/api/openapi.yaml so Mock and API layers report identically.
 */
export type RepositoryErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'consent_required'
  | 'rate_limited'
  | 'safety_intervention_required'
  | 'internal_error';

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  readonly details?: unknown;
  constructor(code: RepositoryErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    this.details = details;
  }
}

/** Raised when a health-data write is attempted without the governing consent (FR-016). */
export class ConsentRequiredError extends RepositoryError {
  constructor(purpose: string) {
    super('consent_required', `Consent required for purpose "${purpose}"`, { purpose });
  }
}
