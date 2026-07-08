import type { Patient } from './schemas';

export interface LinkAccountInput {
  email?: string;
  phone?: string;
}

/**
 * AuthRepository — mocked local-first identity (spec FR-020a/b; contracts/auth.contract.md).
 * getOrCreateLocalIdentity never blocks onboarding and never requires an account.
 */
export interface AuthRepository {
  getOrCreateLocalIdentity(): Promise<Patient>;
  linkAccount(input: LinkAccountInput): Promise<Patient>;
  isAccountLinked(): Promise<boolean>;
}
