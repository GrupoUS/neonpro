"use strict";
/**
 * Auth Module Entry Point
 * Clean exports for production-ready Clerk integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUser = exports.auth = exports.RedirectToSignUp = exports.RedirectToSignIn = exports.SignedOut = exports.SignedIn = exports.UserButton = exports.SignOutButton = exports.SignUp = exports.SignIn = exports.useClerk = exports.useSession = exports.useUser = exports.useAuth = exports.HealthcarePermissions = exports.HealthcareRoles = exports.isPublicRoute = exports.isProtectedRoute = exports.getUserMetadata = exports.requireRole = exports.requirePermission = exports.hasRole = exports.hasPermission = exports.requireAuth = exports.getAuth = exports.ClerkSessionManager = exports.sessionManager = exports.validateClerkConfig = exports.healthcareAppearance = exports.clerkConfig = void 0;
// Configuration
var clerk_config_1 = require("./clerk-config");
Object.defineProperty(exports, "clerkConfig", { enumerable: true, get: function () { return clerk_config_1.clerkConfig; } });
Object.defineProperty(exports, "healthcareAppearance", { enumerable: true, get: function () { return clerk_config_1.healthcareAppearance; } });
Object.defineProperty(exports, "validateClerkConfig", { enumerable: true, get: function () { return clerk_config_1.validateClerkConfig; } });
// Session Management
var simple_session_manager_1 = require("./simple-session-manager");
Object.defineProperty(exports, "sessionManager", { enumerable: true, get: function () { return simple_session_manager_1.sessionManager; } });
Object.defineProperty(exports, "ClerkSessionManager", { enumerable: true, get: function () { return simple_session_manager_1.ClerkSessionManager; } });
// Utilities and Helpers
var utils_1 = require("./utils");
Object.defineProperty(exports, "getAuth", { enumerable: true, get: function () { return utils_1.getAuth; } });
Object.defineProperty(exports, "requireAuth", { enumerable: true, get: function () { return utils_1.requireAuth; } });
Object.defineProperty(exports, "hasPermission", { enumerable: true, get: function () { return utils_1.hasPermission; } });
Object.defineProperty(exports, "hasRole", { enumerable: true, get: function () { return utils_1.hasRole; } });
Object.defineProperty(exports, "requirePermission", { enumerable: true, get: function () { return utils_1.requirePermission; } });
Object.defineProperty(exports, "requireRole", { enumerable: true, get: function () { return utils_1.requireRole; } });
Object.defineProperty(exports, "getUserMetadata", { enumerable: true, get: function () { return utils_1.getUserMetadata; } });
Object.defineProperty(exports, "isProtectedRoute", { enumerable: true, get: function () { return utils_1.isProtectedRoute; } });
Object.defineProperty(exports, "isPublicRoute", { enumerable: true, get: function () { return utils_1.isPublicRoute; } });
Object.defineProperty(exports, "HealthcareRoles", { enumerable: true, get: function () { return utils_1.HealthcareRoles; } });
Object.defineProperty(exports, "HealthcarePermissions", { enumerable: true, get: function () { return utils_1.HealthcarePermissions; } });
// Re-export essential Clerk hooks and components for convenience
var nextjs_1 = require("@clerk/nextjs");
Object.defineProperty(exports, "useAuth", { enumerable: true, get: function () { return nextjs_1.useAuth; } });
Object.defineProperty(exports, "useUser", { enumerable: true, get: function () { return nextjs_1.useUser; } });
Object.defineProperty(exports, "useSession", { enumerable: true, get: function () { return nextjs_1.useSession; } });
Object.defineProperty(exports, "useClerk", { enumerable: true, get: function () { return nextjs_1.useClerk; } });
Object.defineProperty(exports, "SignIn", { enumerable: true, get: function () { return nextjs_1.SignIn; } });
Object.defineProperty(exports, "SignUp", { enumerable: true, get: function () { return nextjs_1.SignUp; } });
Object.defineProperty(exports, "SignOutButton", { enumerable: true, get: function () { return nextjs_1.SignOutButton; } });
Object.defineProperty(exports, "UserButton", { enumerable: true, get: function () { return nextjs_1.UserButton; } });
Object.defineProperty(exports, "SignedIn", { enumerable: true, get: function () { return nextjs_1.SignedIn; } });
Object.defineProperty(exports, "SignedOut", { enumerable: true, get: function () { return nextjs_1.SignedOut; } });
Object.defineProperty(exports, "RedirectToSignIn", { enumerable: true, get: function () { return nextjs_1.RedirectToSignIn; } });
Object.defineProperty(exports, "RedirectToSignUp", { enumerable: true, get: function () { return nextjs_1.RedirectToSignUp; } });
// Re-export server utilities
var server_1 = require("@clerk/nextjs/server");
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return server_1.auth; } });
Object.defineProperty(exports, "currentUser", { enumerable: true, get: function () { return server_1.currentUser; } });
