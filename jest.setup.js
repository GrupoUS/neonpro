// Jest setup file - runs before each test
// Ensures consistent testing environment

import '@testing-library/jest-dom';

// Set timezone to UTC for consistent date testing across all environments
process.env.TZ = 'UTC';

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};