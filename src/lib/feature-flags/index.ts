/**
 * Feature flags — choose the active implementation per repository.
 * All default to `mock` until the backend exists (Constitution Principle IX + "no backend").
 * A runtime override lets tests / a future settings screen flip a repo to `api`.
 */
export type RepoImpl = 'mock' | 'api';

export type RepoKey =
  | 'auth'
  | 'patient'
  | 'conversation'
  | 'livingRecord'
  | 'consent';

const DEFAULTS: Record<RepoKey, RepoImpl> = {
  auth: 'mock',
  patient: 'mock',
  conversation: 'mock',
  livingRecord: 'mock',
  consent: 'mock',
};

const overrides: Partial<Record<RepoKey, RepoImpl>> = {};

export function getFlag(key: RepoKey): RepoImpl {
  return overrides[key] ?? DEFAULTS[key];
}

/** Test/settings hook. Not persisted; call at startup or in tests. */
export function setFlag(key: RepoKey, impl: RepoImpl): void {
  overrides[key] = impl;
}

export function resetFlags(): void {
  for (const k of Object.keys(overrides) as RepoKey[]) delete overrides[k];
}
