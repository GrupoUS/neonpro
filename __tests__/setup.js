"use strict";
/**
 * Test Setup Configuration
 * Configures testing environment for React Testing Library and Jest
 */
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
require("@testing-library/jest-dom");
// Mock Next.js headers (cookies, headers)
var mockCookies = jest.fn(function () { return ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(function () { return []; }),
    toString: jest.fn(function () { return ''; }),
}); });
jest.mock('next/headers', function () { return ({
    cookies: mockCookies,
    headers: jest.fn(function () { return ({
        get: jest.fn(),
        has: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        values: jest.fn(),
    }); }),
}); });
// Mock Next.js router
var mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
};
jest.mock('next/navigation', function () { return ({
    useRouter: function () { return mockRouter; },
    usePathname: function () { return '/'; },
    useSearchParams: function () { return new URLSearchParams(); },
}); });
// Mock Supabase client with correct structure and all necessary methods
var createMockQueryBuilder = function () { return ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
}); };
var mockSupabaseClient = {
    from: jest.fn(function () { return createMockQueryBuilder(); }),
    auth: {
        getUser: jest.fn(function () { return Promise.resolve({ data: { user: null }, error: null }); }),
        getSession: jest.fn(function () { return Promise.resolve({ data: { session: null }, error: null }); }),
    },
    rpc: jest.fn(function () { return Promise.resolve({ data: null, error: null }); }),
    raw: jest.fn(function () { return Promise.resolve({ data: null, error: null }); }),
};
jest.mock('../app/utils/supabase/client', function () { return ({
    createClient: jest.fn(function () { return mockSupabaseClient; }),
    createLegacyClient: jest.fn(function () { return mockSupabaseClient; }),
    createOptimizedClient: jest.fn(function () { return mockSupabaseClient; }),
}); });
// Mock server-side Supabase client
jest.mock('../app/utils/supabase/server', function () { return ({
    createClient: jest.fn(function () { return Promise.resolve(mockSupabaseClient); }),
}); });
// Mock @supabase/supabase-js directly
jest.mock('@supabase/supabase-js', function () { return ({
    createClient: jest.fn(function () { return mockSupabaseClient; }),
}); });
// Mock AuditLogger to prevent audit log warnings
var mockAuditLog = jest.fn().mockResolvedValue(undefined);
jest.mock('../lib/auth/audit/audit-logger', function () { return ({
    AuditLogger: jest.fn().mockImplementation(function () { return ({
        log: mockAuditLog,
    }); }),
}); });
// Export mock for test access
global.mockAuditLog = mockAuditLog;
// Mock React Query client
jest.mock('@tanstack/react-query', function () { return ({
    useQuery: jest.fn(function () { return ({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
    }); }),
    useMutation: jest.fn(function () { return ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
    }); }),
    QueryClient: jest.fn(function () { return ({}); }),
    QueryClientProvider: function (_a) {
        var children = _a.children;
        return children;
    },
}); });
// Mock date-fns
jest.mock('date-fns', function () { return ({
    format: jest.fn(function (date) { return date.toISOString(); }),
    parseISO: jest.fn(function (str) { return new Date(str); }),
    isValid: jest.fn(function () { return true; }),
    addDays: jest.fn(function (date, days) { return new Date(date.getTime() + days * 24 * 60 * 60 * 1000); }),
    subDays: jest.fn(function (date, days) { return new Date(date.getTime() - days * 24 * 60 * 60 * 1000); }),
    startOfMonth: jest.fn(function (date) { return new Date(date.getFullYear(), date.getMonth(), 1); }),
    endOfMonth: jest.fn(function (date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }),
}); });
// Mock react-hot-toast
jest.mock('react-hot-toast', function () { return ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
    },
    Toaster: function () { return null; },
}); });
// Mock recharts components
jest.mock('recharts', function () { return ({
    ResponsiveContainer: function (_a) {
        var children = _a.children;
        return children;
    },
    BarChart: function (_a) {
        var children = _a.children;
        return ({ type: 'div', props: { 'data-testid': 'bar-chart', children: children } });
    },
    LineChart: function (_a) {
        var children = _a.children;
        return ({ type: 'div', props: { 'data-testid': 'line-chart', children: children } });
    },
    PieChart: function (_a) {
        var children = _a.children;
        return ({ type: 'div', props: { 'data-testid': 'pie-chart', children: children } });
    },
    Bar: function () { return ({ type: 'div', props: { 'data-testid': 'bar' } }); },
    Line: function () { return ({ type: 'div', props: { 'data-testid': 'line' } }); },
    Pie: function () { return ({ type: 'div', props: { 'data-testid': 'pie' } }); },
    XAxis: function () { return ({ type: 'div', props: { 'data-testid': 'x-axis' } }); },
    YAxis: function () { return ({ type: 'div', props: { 'data-testid': 'y-axis' } }); },
    CartesianGrid: function () { return ({ type: 'div', props: { 'data-testid': 'cartesian-grid' } }); },
    Tooltip: function () { return ({ type: 'div', props: { 'data-testid': 'tooltip' } }); },
    Legend: function () { return ({ type: 'div', props: { 'data-testid': 'legend' } }); },
    Cell: function () { return ({ type: 'div', props: { 'data-testid': 'cell' } }); },
}); });
// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(function () { return ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}); });
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(function (query) { return ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }); }),
});
// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();
// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn();
// Mock Next.js Request/Response for server tests
global.Request = /** @class */ (function () {
    function MockRequest(input, init) {
        this._url = input;
        this.method = (init === null || init === void 0 ? void 0 : init.method) || 'GET';
        this.headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
        this.body = init === null || init === void 0 ? void 0 : init.body;
    }
    Object.defineProperty(MockRequest.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: false,
        configurable: true
    });
    MockRequest.prototype.json = function () {
        return Promise.resolve(this.body ? JSON.parse(this.body) : {});
    };
    MockRequest.prototype.text = function () {
        return Promise.resolve(this.body || '');
    };
    MockRequest.prototype.clone = function () {
        return new MockRequest(this.url, {
            method: this.method,
            headers: this.headers,
            body: this.body
        });
    };
    return MockRequest;
}());
global.Response = /** @class */ (function () {
    function MockResponse(body, init) {
        Object.assign(this, __assign({ body: body, status: 200, headers: new Headers() }, init));
    }
    MockResponse.json = function (object, init) {
        return new MockResponse(JSON.stringify(object), __assign(__assign({}, init), { headers: __assign({ 'Content-Type': 'application/json' }, ((init === null || init === void 0 ? void 0 : init.headers) || {})) }));
    };
    return MockResponse;
}());
// Mock NextResponse more completely
global.NextResponse = {
    json: jest.fn(function (object, init) { return ({
        json: function () { return Promise.resolve(object); },
        status: (init === null || init === void 0 ? void 0 : init.status) || 200,
        headers: new Headers((init === null || init === void 0 ? void 0 : init.headers) || {}),
        ok: ((init === null || init === void 0 ? void 0 : init.status) || 200) >= 200 && ((init === null || init === void 0 ? void 0 : init.status) || 200) < 300
    }); })
};
