"use strict";
/**
 * Test utilities and helper functions
 * For mocking Supabase and other services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockFetch = exports.mockSession = exports.mockUser = exports.createMockSupabaseClient = void 0;
var createMockSupabaseClient = function () { return ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
        signOut: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn()
    },
    storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn()
    }
}); };
exports.createMockSupabaseClient = createMockSupabaseClient;
exports.mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
        full_name: 'Test User'
    }
};
exports.mockSession = {
    user: exports.mockUser,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token'
};
var createMockFetch = function (responses) {
    if (responses === void 0) { responses = {}; }
    return jest.fn().mockImplementation(function (url) {
        var response = responses[url] || { success: true, data: [] };
        return Promise.resolve({
            ok: true,
            json: function () { return Promise.resolve(response); }
        });
    });
};
exports.createMockFetch = createMockFetch;
