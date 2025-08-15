/** @type {import('jest').Config} */
const config = {
  displayName: 'NeonPro Web App Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/test-env.ts',
    '<rootDir>/jest.setup.js',
  ],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '^@/types/(.*)$': '<rootDir>/lib/types/$1',
    '^@/utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/lib/hooks/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$':
      '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup/test-env.ts',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
  testTimeout: 10_000,
};

module.exports = config;
