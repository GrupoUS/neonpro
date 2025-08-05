"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
var util_1 = require("util");
// Set timezone to UTC for consistent date testing across all environments
process.env.TZ = 'UTC';
// Add global polyfills for WebAuthn dependencies
global.TextDecoder = util_1.TextDecoder;
global.TextEncoder = util_1.TextEncoder;
// Mock IntersectionObserver
global.IntersectionObserver = /** @class */ (function () {
    function IntersectionObserver() {
    }
    IntersectionObserver.prototype.observe = function () { return null; };
    IntersectionObserver.prototype.disconnect = function () { return null; };
    IntersectionObserver.prototype.unobserve = function () { return null; };
    return IntersectionObserver;
}());
// Mock ResizeObserver for Recharts
global.ResizeObserver = /** @class */ (function () {
    function ResizeObserver(callback) {
    }
    ResizeObserver.prototype.observe = function () { return null; };
    ResizeObserver.prototype.disconnect = function () { return null; };
    ResizeObserver.prototype.unobserve = function () { return null; };
    return ResizeObserver;
}());
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(function (query) { return ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }); }),
});
// Mock next/router
jest.mock('next/router', function () { return ({
    useRouter: function () {
        return {
            route: '/',
            pathname: '/',
            query: {},
            asPath: '/',
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
        };
    },
}); });
// Mock next/navigation for App Router
jest.mock('next/navigation', function () { return ({
    useRouter: function () {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            refresh: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            prefetch: jest.fn(),
        };
    },
    useSearchParams: function () {
        return new URLSearchParams();
    },
    usePathname: function () {
        return '/';
    },
}); });
// Custom Jest matchers
expect.extend({
    toHaveErrorMessage: function (received, message) {
        var pass = (received === null || received === void 0 ? void 0 : received.message) === message;
        return {
            pass: pass,
            message: function () {
                return pass
                    ? "Expected error not to have message: ".concat(message)
                    : "Expected error to have message: ".concat(message, ", but received: ").concat(received === null || received === void 0 ? void 0 : received.message);
            },
        };
    },
});
