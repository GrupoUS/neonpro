"use strict";
/**
 * Jest Test Setup Configuration
 * Configures global test environment for subscription middleware testing
 *
 * @description Comprehensive test setup with error handling, DOM matchers,
 *              and subscription system mocks
 * @version 1.0.0
 * @created 2025-07-22
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
var react_1 = require("@testing-library/react");
var util_1 = require("util");
// ============================================================================
// Global Test Configuration
// ============================================================================
// Configure Testing Library behavior
(0, react_1.configure)({
    throwSuggestions: true,
    testIdAttribute: 'data-testid',
});
// ============================================================================
// Global Polyfills for Node.js Environment
// ============================================================================
// Fix for TextEncoder/TextDecoder in Node.js
global.TextEncoder = util_1.TextEncoder;
global.TextDecoder = util_1.TextDecoder;
// Mock fetch for testing environment
global.fetch = jest.fn();
// Mock ResizeObserver for UI components
global.ResizeObserver = jest.fn().mockImplementation(function () { return ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}); });
// Mock IntersectionObserver for UI components
global.IntersectionObserver = jest.fn().mockImplementation(function () { return ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}); });
