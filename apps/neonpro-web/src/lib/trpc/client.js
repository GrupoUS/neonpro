"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcClient = exports.trpc = void 0;
var react_query_1 = require("@trpc/react-query");
var client_1 = require("@trpc/client");
var superjson_1 = require("superjson");
/**
 * tRPC React Client for NeonPro Healthcare
 *
 * Type-safe client with:
 * - Batch requests for performance
 * - SuperJSON for date/BigInt serialization
 * - Healthcare-compliant error handling
 * - Development logging
 * - Automatic request/response transformation
 */
// Create tRPC React hooks
exports.trpc = (0, react_query_1.createTRPCReact)();
// Get base URL for tRPC endpoints
function getBaseUrl() {
    var _a;
    if (typeof window !== 'undefined') {
        // Browser should use relative url
        return '';
    }
    if (process.env.VERCEL_URL) {
        // SSR should use vercel url
        return "https://".concat(process.env.VERCEL_URL);
    }
    // Dev SSR should use localhost
    return "http://localhost:".concat((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
}
// tRPC client configuration
exports.trpcClient = exports.trpc.createClient({
    transformer: superjson_1.default,
    links: [
        // Logger for development
        (0, client_1.loggerLink)({
            enabled: function (opts) {
                return process.env.NODE_ENV === 'development' ||
                    (opts.direction === 'down' && opts.result instanceof Error);
            },
        }),
        // HTTP batch link for performance
        (0, client_1.httpBatchLink)({
            url: "".concat(getBaseUrl(), "/api/trpc"),
            // Healthcare-specific headers
            headers: function () {
                return {
                    'Content-Type': 'application/json',
                    'X-Healthcare-Client': 'neonpro-web',
                    'X-API-Version': '1.0',
                };
            },
            // Error handling for healthcare compliance
            fetch: function (url, options) {
                return fetch(url, __assign(__assign({}, options), { credentials: 'include' })).catch(function (error) {
                    console.error('tRPC Healthcare API Request Failed:', {
                        url: url,
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    });
                    throw error;
                });
            },
        }),
    ],
});
