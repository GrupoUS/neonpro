"use client";
"use strict";
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
exports.useAuth = exports.supabase = void 0;
exports.AuthProvider = AuthProvider;
var client_1 = require("@/app/utils/supabase/client");
var react_1 = require("react");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
var oauth_error_handler_1 = require("@/lib/auth/oauth-error-handler");
var security_audit_logger_1 = require("@/lib/auth/security-audit-logger");
var permission_validator_1 = require("@/lib/auth/permission-validator");
exports.supabase = (0, client_1.createClient)();
var AuthContext = (0, react_1.createContext)({
    user: null,
    session: null,
    loading: true,
    signIn: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ error: null })];
    }); }); },
    signUp: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ error: null })];
    }); }); },
    signOut: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    signInWithGoogle: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ error: null })];
    }); }); },
    refreshSession: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ error: null })];
    }); }); },
    getValidSession: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ session: null, error: null })];
    }); }); },
    checkPermission: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
    getUserPermissions: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); }); },
    hasRole: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
});
function AuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = (0, react_1.useState)(null), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)(null), session = _c[0], setSession = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    (0, react_1.useEffect)(function () {
        // Real auth state setup
        var initializeAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var session_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        console.log("🔄 Initializing auth context...");
                        return [4 /*yield*/, exports.supabase.auth.getSession()];
                    case 1:
                        session_1 = (_a.sent()).data.session;
                        console.log("📊 Initial session check:", !!session_1);
                        if (session_1) {
                            console.log("✅ Initial session found, setting user");
                            setSession(session_1);
                            setUser(session_1.user);
                        }
                        else {
                            console.log("❌ No initial session found");
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error("❌ Auth initialization error:", error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        initializeAuth();
        // Set up real auth state listener
        var subscription = exports.supabase.auth.onAuthStateChange(function (event, session) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                console.log("🔄 Auth state change:", event, !!session);
                if (session) {
                    console.log("✅ Session detected, setting user:", (_a = session.user) === null || _a === void 0 ? void 0 : _a.email);
                    setSession(session);
                    setUser(session.user);
                }
                else {
                    console.log("❌ No session, clearing user");
                    setSession(null);
                    setUser(null);
                }
                setLoading(false);
                return [2 /*return*/];
            });
        }); }).data.subscription;
        return function () { return subscription.unsubscribe(); };
    }, []);
    var signIn = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    })];
                case 1:
                    error = (_a.sent()).error;
                    // Auth state will be updated by the onAuthStateChange listener
                    return [2 /*return*/, { error: error }];
            }
        });
    }); };
    var signUp = function (email, password, name) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, err_1, authError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("=== Starting Sign Up ===");
                    console.log("Email:", email);
                    console.log("Redirect URL:", "".concat(window.location.origin, "/auth/callback"));
                    return [4 /*yield*/, exports.supabase.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                                emailRedirectTo: "".concat(window.location.origin, "/auth/callback"),
                                data: name
                                    ? {
                                        full_name: name,
                                        name: name, // Fallback para compatibilidade
                                    }
                                    : undefined,
                            },
                        })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    console.log("=== Sign Up Results ===");
                    console.log("Success:", !error);
                    console.log("User created:", !!data.user);
                    console.log("Session created:", !!data.session);
                    if (error) {
                        console.error("Sign up error:", error);
                    }
                    // Auth state will be updated by the onAuthStateChange listener
                    return [2 /*return*/, { error: error }];
                case 2:
                    err_1 = _b.sent();
                    console.error("Unexpected sign up error:", err_1);
                    authError = {
                        message: err_1 instanceof Error ? err_1.message : "Unknown error occurred",
                        __isAuthError: true,
                    };
                    return [2 /*return*/, { error: authError }];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 8]);
                    if (!user) return [3 /*break*/, 2];
                    return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logSessionEvent('session_logout', user.id, { method: 'manual' })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!session) return [3 /*break*/, 4];
                    return [4 /*yield*/, SessionManager_1.sessionManager.terminateSession(session.access_token, 'user_logout')];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, exports.supabase.auth.signOut()];
                case 5:
                    _a.sent();
                    setSession(null);
                    setUser(null);
                    return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error during logout:', error_2);
                    // Force logout even if enhanced logout fails
                    return [4 /*yield*/, exports.supabase.auth.signOut()];
                case 7:
                    // Force logout even if enhanced logout fails
                    _a.sent();
                    setSession(null);
                    setUser(null);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var signInWithGoogle = function () { return __awaiter(_this, void 0, void 0, function () {
        var startTime_1, _a, data, error, handledError, width, height, left, top_1, popup_1, authError_1, authError, error_3, authError;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    console.log("=== Initiating Enhanced Google OAuth (Popup) ===");
                    startTime_1 = Date.now();
                    // Log OAuth attempt
                    return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logOAuthEvent('oauth_attempt', 'google', null, { method: 'popup', userAgent: navigator.userAgent })];
                case 1:
                    // Log OAuth attempt
                    _b.sent();
                    return [4 /*yield*/, exports.supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                                redirectTo: "".concat(window.location.origin, "/auth/popup-callback"),
                                queryParams: {
                                    access_type: "offline",
                                    prompt: "select_account", // Faster than 'consent' for returning users
                                },
                                skipBrowserRedirect: true,
                            },
                        })];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (!error) return [3 /*break*/, 5];
                    console.error("Error initiating OAuth:", error);
                    // Log OAuth error
                    return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logOAuthEvent('oauth_error', 'google', null, { error: error.message, step: 'initiation' })];
                case 3:
                    // Log OAuth error
                    _b.sent();
                    return [4 /*yield*/, oauth_error_handler_1.oauthErrorHandler.handleOAuthError(error, {
                            provider: 'google',
                            method: 'popup',
                            step: 'initiation'
                        })];
                case 4:
                    handledError = _b.sent();
                    return [2 /*return*/, { error: handledError }];
                case 5:
                    if (data === null || data === void 0 ? void 0 : data.url) {
                        width = 480;
                        height = 600;
                        left = window.screen.width / 2 - width / 2;
                        top_1 = window.screen.height / 2 - height / 2;
                        popup_1 = window.open(data.url, "neonpro-google-oauth", "popup=yes,width=".concat(width, ",height=").concat(height, ",left=").concat(left, ",top=").concat(top_1, ",scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no"));
                        if (!popup_1) {
                            console.error("Popup blocked by browser");
                            authError_1 = {
                                message: "Por favor, permita popups para este site fazer login com Google",
                                __isAuthError: true,
                            };
                            return [2 /*return*/, { error: authError_1 }];
                        }
                        // Faster monitoring with aggressive timeout for ≤3s requirement
                        return [2 /*return*/, new Promise(function (resolve) {
                                var resolved = false;
                                var checkInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var session_2, totalTime, authError_2, session_3, totalTime, err_2;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 7, , 8]);
                                                if (!popup_1.closed) return [3 /*break*/, 4];
                                                clearInterval(checkInterval);
                                                if (!!resolved) return [3 /*break*/, 3];
                                                // Shorter wait time for faster response
                                                console.log("🔄 Popup closed, checking session...");
                                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, exports.supabase.auth.getSession()];
                                            case 2:
                                                session_2 = (_a.sent()).data.session;
                                                totalTime = Date.now() - startTime_1;
                                                if (session_2) {
                                                    console.log("\u2705 Auth successful in ".concat(totalTime, "ms"));
                                                    resolved = true;
                                                    resolve({ error: null });
                                                }
                                                else {
                                                    console.log("❌ Popup closed without authentication");
                                                    resolved = true;
                                                    authError_2 = {
                                                        message: "Authentication cancelled",
                                                        __isAuthError: true,
                                                    };
                                                    resolve({ error: authError_2 });
                                                }
                                                _a.label = 3;
                                            case 3: return [3 /*break*/, 6];
                                            case 4: return [4 /*yield*/, exports.supabase.auth.getSession()];
                                            case 5:
                                                session_3 = (_a.sent()).data.session;
                                                if (session_3 && !resolved) {
                                                    clearInterval(checkInterval);
                                                    totalTime = Date.now() - startTime_1;
                                                    console.log("\u2705 Auth successful in ".concat(totalTime, "ms, closing popup"));
                                                    // Immediate close for faster completion
                                                    popup_1.close();
                                                    resolved = true;
                                                    resolve({ error: null });
                                                }
                                                _a.label = 6;
                                            case 6: return [3 /*break*/, 8];
                                            case 7:
                                                err_2 = _a.sent();
                                                console.error("❌ Error checking popup status:", err_2);
                                                return [3 /*break*/, 8];
                                            case 8: return [2 /*return*/];
                                        }
                                    });
                                }); }, 300); // Faster polling for quicker response
                                // Aggressive timeout for ≤3s requirement (3.5s total)
                                setTimeout(function () {
                                    clearInterval(checkInterval);
                                    if (popup_1 && !popup_1.closed) {
                                        popup_1.close();
                                    }
                                    if (!resolved) {
                                        var totalTime = Date.now() - startTime_1;
                                        console.warn("\u26A0\uFE0F OAuth timeout after ".concat(totalTime, "ms"));
                                        resolved = true;
                                        var authError_3 = {
                                            message: "Authentication timeout - try again",
                                            __isAuthError: true,
                                        };
                                        resolve({ error: authError_3 });
                                    }
                                }, 3500);
                            })];
                    }
                    authError = {
                        message: "No authentication URL received",
                        __isAuthError: true,
                    };
                    return [2 /*return*/, { error: authError }];
                case 6:
                    error_3 = _b.sent();
                    console.error("Unexpected Google OAuth error:", error_3);
                    authError = {
                        message: error_3 instanceof Error ? error_3.message : "Unknown Google OAuth error",
                        __isAuthError: true,
                    };
                    return [2 /*return*/, { error: authError }];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Manual refresh session method for critical operations
    var refreshSession = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_4, authError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("🔄 Manual session refresh requested");
                    return [4 /*yield*/, exports.supabase.auth.refreshSession()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("❌ Session refresh failed:", error);
                        return [2 /*return*/, { error: error }];
                    }
                    if (data === null || data === void 0 ? void 0 : data.session) {
                        console.log("✅ Session refreshed successfully");
                        setSession(data.session);
                        setUser(data.session.user);
                        return [2 /*return*/, { error: null }];
                    }
                    return [2 /*return*/, { error: null }];
                case 2:
                    error_4 = _b.sent();
                    console.error("Unexpected session refresh error:", error_4);
                    authError = {
                        message: error_4 instanceof Error
                            ? error_4.message
                            : "Unknown session refresh error",
                        __isAuthError: true,
                    };
                    return [2 /*return*/, { error: authError }];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Get valid session with automatic refresh if needed (for critical operations)
    var getValidSession = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, session_4, error, expiresAt, now, timeUntilExpiry, refreshResult, newSession, error_5, authError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    console.log("🔍 Checking for valid session");
                    return [4 /*yield*/, exports.supabase.auth.getSession()];
                case 1:
                    _a = _b.sent(), session_4 = _a.data.session, error = _a.error;
                    if (error) {
                        console.error("❌ Error getting session:", error);
                        return [2 /*return*/, { session: null, error: error }];
                    }
                    if (!session_4) {
                        console.log("❌ No session found");
                        return [2 /*return*/, { session: null, error: null }];
                    }
                    expiresAt = session_4.expires_at;
                    now = Math.floor(Date.now() / 1000);
                    timeUntilExpiry = expiresAt ? expiresAt - now : 0;
                    if (!(timeUntilExpiry < 300)) return [3 /*break*/, 4];
                    // Less than 5 minutes
                    console.log("⚠️ Token expires soon, refreshing...");
                    return [4 /*yield*/, refreshSession()];
                case 2:
                    refreshResult = _b.sent();
                    if (refreshResult.error) {
                        return [2 /*return*/, { session: null, error: refreshResult.error }];
                    }
                    return [4 /*yield*/, exports.supabase.auth.getSession()];
                case 3:
                    newSession = (_b.sent()).data.session;
                    return [2 /*return*/, { session: newSession, error: null }];
                case 4:
                    console.log("✅ Session is valid");
                    return [2 /*return*/, { session: session_4, error: null }];
                case 5:
                    error_5 = _b.sent();
                    console.error("Unexpected error checking session validity:", error_5);
                    authError = {
                        message: error_5 instanceof Error
                            ? error_5.message
                            : "Unknown session validation error",
                        __isAuthError: true,
                    };
                    return [2 /*return*/, { session: null, error: authError }];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Permission validation methods
    var checkPermission = function (resource, action) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/, false];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, permission_validator_1.permissionValidator.checkPermission(user.id, resource, action)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.granted];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error checking permission:', error_6);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getUserPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, permission_validator_1.permissionValidator.getUserPermissions(user.id)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error getting user permissions:', error_7);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var hasRole = function (role) { return __awaiter(_this, void 0, void 0, function () {
        var permissions, error_8;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/, false];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, permission_validator_1.permissionValidator.getUserPermissions(user.id)];
                case 2:
                    permissions = _b.sent();
                    return [2 /*return*/, ((_a = permissions === null || permissions === void 0 ? void 0 : permissions.roles) === null || _a === void 0 ? void 0 : _a.some(function (r) { return r.name === role; })) || false];
                case 3:
                    error_8 = _b.sent();
                    console.error('Error checking role:', error_8);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var value = {
        user: user,
        session: session,
        loading: loading,
        signIn: signIn,
        signUp: signUp,
        signOut: signOut,
        signInWithGoogle: signInWithGoogle,
        refreshSession: refreshSession,
        getValidSession: getValidSession,
        checkPermission: checkPermission,
        getUserPermissions: getUserPermissions,
        hasRole: hasRole,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
var useAuth = function () {
    return (0, react_1.useContext)(AuthContext);
};
exports.useAuth = useAuth;
