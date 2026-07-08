# Contract: AuthRepository

Mocked for the MVP (FR-020a/b, D4). Provides a local anonymous identity immediately and an
optional account link later. No real credentials are handled while mocked.

```ts
interface AuthRepository {
  /** Returns the existing local identity or creates a new anonymous one. Never blocks onboarding. */
  getOrCreateLocalIdentity(): Promise<Patient>;

  /** Optional, post-onboarding. Links the local identity to an account to enable future sync. */
  linkAccount(input: LinkAccountInput): Promise<Patient>;

  /** True once an account is linked. */
  isAccountLinked(): Promise<boolean>;
}

// LinkAccountInput (mocked): { email?: string; phone?: string }  — validated by Zod
```

**Behavioral guarantees**

- `getOrCreateLocalIdentity` MUST succeed offline and without any account (FR-020a).
- Until `linkAccount` is called, the local Living Record remains fully usable (FR-020b).
- Mock: persists identity in encrypted local storage; `linkAccount` flips `accountLinked` only.
- API (future): same signatures; backend must not require account before identity exists.
