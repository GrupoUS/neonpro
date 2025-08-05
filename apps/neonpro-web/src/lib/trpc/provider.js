'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRPCProvider = TRPCProvider;
var react_query_1 = require("@tanstack/react-query");
var react_query_devtools_1 = require("@tanstack/react-query-devtools");
var react_1 = require("react");
var client_1 = require("./client");
function TRPCProvider(_a) {
    var children = _a.children;
    var queryClient = (0, react_1.useState)(function () {
        return new react_query_1.QueryClient({
            defaultOptions: {
                queries: {
                    // Healthcare data caching strategy
                    staleTime: 1000 * 60 * 5, // 5 minutes for most healthcare data
                    cacheTime: 1000 * 60 * 10, // 10 minutes cache retention
                    retry: function (failureCount, error) {
                        var _a, _b;
                        // Don't retry on healthcare authentication errors
                        if (((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.code) === 'UNAUTHORIZED' ||
                            ((_b = error === null || error === void 0 ? void 0 : error.data) === null || _b === void 0 ? void 0 : _b.code) === 'FORBIDDEN') {
                            return false;
                        }
                        // Retry network errors up to 3 times
                        return failureCount < 3;
                    },
                    refetchOnWindowFocus: true, // Refetch on focus for data freshness
                },
                mutations: {
                    // Healthcare mutations error handling
                    retry: false, // Don't retry mutations to avoid duplicate medical records
                    onError: function (error) {
                        var _a;
                        console.error('Healthcare mutation error:', {
                            error: error.message,
                            code: (_a = error.data) === null || _a === void 0 ? void 0 : _a.code,
                            timestamp: new Date().toISOString(),
                        });
                    },
                },
            },
        });
    })[0];
    return (<client_1.trpc.Provider client={client_1.trpcClient} queryClient={queryClient}>
      <react_query_1.QueryClientProvider client={queryClient}>
        {children}
        {/* Show React Query devtools in development */}
        {process.env.NODE_ENV === 'development' && (<react_query_devtools_1.ReactQueryDevtools initialIsOpen={false} position="bottom-right"/>)}
      </react_query_1.QueryClientProvider>
    </client_1.trpc.Provider>);
}
