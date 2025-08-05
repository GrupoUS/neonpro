"use strict";
/**
 * Production-Ready Clerk Middleware
 * Optimized for healthcare applications with LGPD compliance
 * Based on Next.js 14+ App Router best practices
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var server_1 = require("@clerk/nextjs/server");
var server_2 = require("next/server");
var clerk_config_1 = require("@/lib/auth/clerk-config");
// Define protected routes
var isProtectedRoute = (0, server_1.createRouteMatcher)(clerk_config_1.clerkConfig.protectedRoutes);
// Define public routes that should never be protected
var isPublicRoute = (0, server_1.createRouteMatcher)(clerk_config_1.clerkConfig.publicRoutes);
// Define API routes that need authentication
var isProtectedApiRoute = (0, server_1.createRouteMatcher)([
    '/api/protected/(.*)',
    '/api/patients/(.*)',
    '/api/appointments/(.*)',
    '/api/admin/(.*)'
]);
exports.default = (0, server_1.clerkMiddleware)(function (auth, req) { return __awaiter(void 0, void 0, void 0, function () {
    var pathname, _a, userId, sessionId, response;
    return __generator(this, function (_b) {
        pathname = req.nextUrl.pathname;
        // Always allow public routes
        if (isPublicRoute(req)) {
            return [2 /*return*/, server_2.NextResponse.next()];
        }
        // Check authentication for protected routes
        if (isProtectedRoute(req) || isProtectedApiRoute(req)) {
            _a = auth(), userId = _a.userId, sessionId = _a.sessionId;
            // Redirect to sign-in if not authenticated
            if (!userId || !sessionId) {
                return [2 /*return*/, auth().redirectToSignIn({
                        returnBackUrl: req.url
                    })];
            }
            response = server_2.NextResponse.next();
            // LGPD and healthcare security headers
            response.headers.set('X-Content-Type-Options', 'nosniff');
            response.headers.set('X-Frame-Options', 'DENY');
            response.headers.set('X-XSS-Protection', '1; mode=block');
            response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
            // Healthcare data protection headers
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
            // Session and user context headers (for client-side usage)
            response.headers.set('X-User-ID', userId);
            response.headers.set('X-Session-ID', sessionId);
            return [2 /*return*/, response];
        }
        // Allow all other routes
        return [2 /*return*/, server_2.NextResponse.next()];
    });
}); });
exports.config = {
    matcher: [
        // Skip Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
