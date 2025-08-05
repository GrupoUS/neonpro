/**
 * Jest Test Setup Configuration
 * Configures global test environment for subscription middleware testing
 *
 * @description Comprehensive test setup with error handling, DOM matchers,
 *              and subscription system mocks
 * @version 1.0.0
 * @created 2025-07-22
 */

import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
import { configure } from "@testing-library/react";

// ============================================================================
// Global Test Configuration
// ============================================================================

// Configure Testing Library behavior
configure({
  throwSuggestions: true,
  testIdAttribute: "data-testid",
});

// ============================================================================
// Global Polyfills for Node.js Environment
// ============================================================================

// Fix for TextEncoder/TextDecoder in Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for testing environment
global.fetch = jest.fn();

// Mock ResizeObserver for UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for UI components
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
