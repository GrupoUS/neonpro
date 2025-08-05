Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
var util_1 = require("node:util");
// Set timezone to UTC for consistent date testing across all environments
process.env.TZ = "UTC";
// Add global polyfills for WebAuthn dependencies
global.TextDecoder = util_1.TextDecoder;
global.TextEncoder = util_1.TextEncoder;
// Mock IntersectionObserver
global.IntersectionObserver = /** @class */ (() => {
  function IntersectionObserver() {}
  IntersectionObserver.prototype.observe = () => null;
  IntersectionObserver.prototype.disconnect = () => null;
  IntersectionObserver.prototype.unobserve = () => null;
  return IntersectionObserver;
})();
// Mock ResizeObserver for Recharts
global.ResizeObserver = /** @class */ (() => {
  function ResizeObserver(_callback) {}
  ResizeObserver.prototype.observe = () => null;
  ResizeObserver.prototype.disconnect = () => null;
  ResizeObserver.prototype.unobserve = () => null;
  return ResizeObserver;
})();
// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    push: jest.fn(),
    pop: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
}));
// Mock next/navigation for App Router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));
// Custom Jest matchers
expect.extend({
  toHaveErrorMessage: (received, message) => {
    var pass = (received === null || received === void 0 ? void 0 : received.message) === message;
    return {
      pass: pass,
      message: () =>
        pass
          ? "Expected error not to have message: ".concat(message)
          : "Expected error to have message: "
              .concat(message, ", but received: ")
              .concat(received === null || received === void 0 ? void 0 : received.message),
    };
  },
});
