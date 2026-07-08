/**
 * Jest config for VITA.
 *
 * The `logic` project runs pure-TS domain tests (safety, guardrails, consent-gate,
 * flow engine, sync queue, schemas, repository contracts) with ts-jest — no React
 * Native runtime required, so these run fast in CI and locally. UI/component tests
 * (jest-expo preset) are added alongside once the RN test env is wired.
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
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json', isolatedModules: true }],
      },
    },
  ],
};
