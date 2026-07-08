/**
 * Jest config for VITA.
 *
 * `logic` runs the pure-TS domain suite (ts-jest, node) — fast, no RN runtime. This is the
 * primary, always-green suite (safety, guardrails, consent, flow, sync/offline, contract
 * parity, architecture invariant, and the onboarding + safety integration flows).
 *
 * A `components` project (jest-expo + React Native Testing Library) is intended for rendering
 * UI components. It is temporarily disabled: on the current bleeding-edge stack (Expo SDK 57 /
 * RN 0.86 / React 19.2 / RNTL 14 / jest-expo 57) there is a transitive Jest 29/30 mismatch
 * inside jest-expo's preset (`clearMocksOnScope`). Re-enable once those versions align.
 */
module.exports = {
  projects: [
    {
      displayName: 'logic',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.ts',
        '<rootDir>/tests/contract/**/*.test.ts',
        '<rootDir>/tests/integration/**/*.test.ts',
      ],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
      },
    },
  ],
};
