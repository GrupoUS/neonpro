/** @type {import('jest').Config} */
module.exports = {
  displayName: '@neonpro/ai',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.ts', '!**/*.d.ts', '!**/__tests__/**', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@neonpro/(.*)$': '<rootDir>/../../$1/src',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '../tsconfig.json',
      },
    ],
  },
};
