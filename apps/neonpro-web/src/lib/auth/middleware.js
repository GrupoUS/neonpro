"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireAuth = requireAuth;
// lib/auth/middleware.ts
function authMiddleware() {
    return {
        isAuthenticated: true,
        userId: 'demo-user',
        roles: ['user']
    };
}
function requireAuth(request) {
    var authorization = request.headers.get('authorization');
    return {
        isAuthenticated: !!authorization,
        userId: 'demo-user'
    };
}
