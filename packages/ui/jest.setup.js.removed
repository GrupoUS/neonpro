// Jest setup for @neonpro/ui package
import '@testing-library/jest-dom';

// Mock CSS modules
const _mockCSSModules = new Proxy(
  {},
  {
    get: () => 'mock-css-class',
  }
);

// Mock CSS imports
require.extensions = require.extensions || {};
require.extensions['.css'] = () => {};
require.extensions['.scss'] = () => {};
require.extensions['.sass'] = () => {};

// Mock static assets
global.fetch = global.fetch || jest.fn();

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
