// ============================================================================
// Session Management System - Implementation Example
// NeonPro - Session Management & Security
// ============================================================================
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
exports.authMiddleware = authMiddleware;
exports.createUserSession = createUserSession;
exports.terminateUserSession = terminateUserSession;
exports.getCurrentSession = getCurrentSession;
exports.useSession = useSession;
exports.loginApiExample = loginApiExample;
exports.logoutApiExample = logoutApiExample;
exports.sessionApiExample = sessionApiExample;
exports.generateClientFingerprint = generateClientFingerprint;
var index_1 = require("../index");
var supabase_js_1 = require("@supabase/supabase-js");
var ioredis_1 = require("ioredis");
var server_1 = require("next/server");
// ============================================================================
// CONFIGURATION SETUP
// ============================================================================
/**
 * Configuração do sistema de sessões para diferentes ambientes
 */
var getSessionConfig = (environment) => {
  var baseConfig = {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    renewalThreshold: 0.25,
    maxConcurrentSessions: 3,
    requireDeviceVerification: false,
    enableLocationTracking: true,
    enableDeviceFingerprinting: true,
    tokenRotationInterval: 15 * 60 * 1000,
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
    maxSessionDuration: 8 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000,
    retainExpiredSessions: 24 * 60 * 60 * 1000,
    redis: {
      enabled: true,
      keyPrefix: "neonpro:session:",
      ttl: 1800,
    },
    lgpd: {
      enabled: true,
      consentRequired: true,
      dataRetentionDays: 365,
      anonymizeAfterDays: 1095,
    },
  };
  if (environment === "production") {
    return __assign(__assign({}, baseConfig), {
      sessionTimeout: 15 * 60 * 1000,
      requireDeviceVerification: true,
      maxConcurrentSessions: 2,
    });
  }
  return baseConfig;
};
// ============================================================================
// SESSION SYSTEM INITIALIZATION
// ============================================================================
/**
 * Inicializa o sistema de sessões com configurações apropriadas
 */
var SessionService = /** @class */ (() => {
  function SessionService() {
    this.initialized = false;
    this.sessionSystem = new index_1.SessionSystem();
  }
  SessionService.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, redis, config;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.initialized) return [2 /*return*/];
            supabase = (0, supabase_js_1.createClient)(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
              {
                auth: {
                  autoRefreshToken: false,
                  persistSession: false,
                },
              },
            );
            redis = process.env.REDIS_URL
              ? new ioredis_1.default(process.env.REDIS_URL, {
                  retryDelayOnFailover: 100,
                  maxRetriesPerRequest: 3,
                })
              : undefined;
            config = getSessionConfig(
              process.env.NODE_ENV === "production" ? "production" : "development",
            );
            return [
              4 /*yield*/,
              this.sessionSystem.initialize({
                supabase: supabase,
                redis: redis,
                config: config,
              }),
            ];
          case 1:
            _a.sent();
            // Configurar event listeners
            this.setupEventListeners();
            this.initialized = true;
            return [2 /*return*/];
        }
      });
    });
  };
  SessionService.prototype.setupEventListeners = function () {
    // Eventos de segurança
    this.sessionSystem.on("security_event", (event) => {
      console.log("🚨 Security Event:", event);
      if (event.threatLevel === "high") {
        // Notificar equipe de segurança
        this.notifySecurityTeam(event);
      }
    });
    // Atividade suspeita
    this.sessionSystem.on("suspicious_activity", (activity) => {
      console.log("⚠️ Suspicious Activity:", activity);
      if (activity.riskScore > 80) {
        // Terminar sessão automaticamente
        this.sessionSystem.terminateSession(activity.sessionId, "high_risk_activity");
      }
    });
    // Criação de sessão
    this.sessionSystem.on("session_created", (session) => {
      var _a;
      console.log("✅ Session Created:", {
        sessionId: session.id,
        userId: session.userId,
        deviceType:
          (_a = session.deviceFingerprint) === null || _a === void 0 ? void 0 : _a.platform,
      });
    });
    // Término de sessão
    this.sessionSystem.on("session_terminated", (data) => {
      console.log("🔚 Session Terminated:", {
        sessionId: data.sessionId,
        reason: data.reason,
      });
    });
  };
  SessionService.prototype.notifySecurityTeam = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar notificação (email, Slack, etc.)
        console.log("📧 Notifying security team about:", event);
        return [2 /*return*/];
      });
    });
  };
  SessionService.prototype.getSessionSystem = function () {
    if (!this.initialized) {
      throw new Error("SessionService not initialized. Call initialize() first.");
    }
    return this.sessionSystem;
  };
  return SessionService;
})();
exports.SessionService = SessionService;
// Instância singleton
var sessionService = new SessionService();
exports.sessionService = sessionService;
// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
/**
 * Middleware para autenticação de sessões em Next.js
 */
function authMiddleware(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionToken,
      pathname,
      publicRoutes,
      isPublicRoute,
      sessionSystem,
      validation,
      response,
      clientIP,
      userAgent,
      renewal,
      response,
      requestHeaders,
      error_1;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          sessionToken =
            (_a = request.cookies.get("session_token")) === null || _a === void 0
              ? void 0
              : _a.value;
          pathname = request.nextUrl.pathname;
          publicRoutes = ["/login", "/register", "/forgot-password", "/api/auth"];
          isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
          if (isPublicRoute) {
            return [2 /*return*/, server_1.NextResponse.next()];
          }
          // Verificar se há token de sessão
          if (!sessionToken) {
            return [2 /*return*/, server_1.NextResponse.redirect(new URL("/login", request.url))];
          }
          _b.label = 1;
        case 1:
          _b.trys.push([1, 7, , 8]);
          // Inicializar sistema se necessário
          return [4 /*yield*/, sessionService.initialize()];
        case 2:
          // Inicializar sistema se necessário
          _b.sent();
          sessionSystem = sessionService.getSessionSystem();
          return [4 /*yield*/, sessionSystem.validateSession(sessionToken)];
        case 3:
          validation = _b.sent();
          if (!validation.valid) {
            response = server_1.NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("session_token");
            return [2 /*return*/, response];
          }
          clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown";
          userAgent = request.headers.get("user-agent") || "unknown";
          return [
            4 /*yield*/,
            sessionSystem.updateActivity(sessionToken, {
              ipAddress: clientIP,
              userAgent: userAgent,
            }),
          ];
        case 4:
          _b.sent();
          if (!validation.needsRenewal) return [3 /*break*/, 6];
          return [4 /*yield*/, sessionSystem.renewSession(sessionToken)];
        case 5:
          renewal = _b.sent();
          if (renewal.success && renewal.session) {
            response = server_1.NextResponse.next();
            response.cookies.set("session_token", renewal.session.sessionToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 30 * 60, // 30 minutes
            });
            return [2 /*return*/, response];
          }
          _b.label = 6;
        case 6:
          requestHeaders = new Headers(request.headers);
          requestHeaders.set("x-user-id", validation.session.userId);
          requestHeaders.set("x-clinic-id", validation.session.clinicId);
          requestHeaders.set("x-session-id", validation.session.id);
          return [
            2 /*return*/,
            server_1.NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            }),
          ];
        case 7:
          error_1 = _b.sent();
          console.error("Auth middleware error:", error_1);
          return [2 /*return*/, server_1.NextResponse.redirect(new URL("/login", request.url))];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// ============================================================================
// API ROUTE HELPERS
// ============================================================================
/**
 * Helper para criar sessão em API routes
 */
function createUserSession(userId, clinicId, request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionSystem, clientIP, userAgent, deviceFingerprint, result;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, sessionService.initialize()];
        case 1:
          _a.sent();
          sessionSystem = sessionService.getSessionSystem();
          clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown";
          userAgent = request.headers.get("user-agent") || "unknown";
          deviceFingerprint = {
            userAgent: userAgent,
            screen: { width: 1920, height: 1080 }, // Valores padrão
            timezone: "America/Sao_Paulo",
            language: "pt-BR",
            platform: "Web",
            plugins: [],
            canvas: "",
            webgl: "",
          };
          return [
            4 /*yield*/,
            sessionSystem.createSession({
              userId: userId,
              clinicId: clinicId,
              deviceFingerprint: deviceFingerprint,
              ipAddress: clientIP,
              userAgent: userAgent,
            }),
          ];
        case 2:
          result = _a.sent();
          if (result.success && result.session) {
            return [
              2 /*return*/,
              {
                success: true,
                sessionToken: result.session.sessionToken,
                expiresAt: result.session.expiresAt,
                deviceRegistered: result.deviceRegistered,
              },
            ];
          }
          return [
            2 /*return*/,
            {
              success: false,
              error: result.error,
            },
          ];
      }
    });
  });
}
/**
 * Helper para terminar sessão em API routes
 */
function terminateUserSession(sessionToken_1) {
  return __awaiter(this, arguments, void 0, function (sessionToken, reason) {
    var sessionSystem;
    if (reason === void 0) {
      reason = "user_logout";
    }
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, sessionService.initialize()];
        case 1:
          _a.sent();
          sessionSystem = sessionService.getSessionSystem();
          return [4 /*yield*/, sessionSystem.terminateSession(sessionToken, reason)];
        case 2:
          return [2 /*return*/, _a.sent()];
      }
    });
  });
}
/**
 * Helper para obter dados da sessão atual
 */
function getCurrentSession(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionToken, sessionSystem, validation;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          sessionToken =
            (_a = request.cookies.get("session_token")) === null || _a === void 0
              ? void 0
              : _a.value;
          if (!sessionToken) {
            return [2 /*return*/, null];
          }
          return [4 /*yield*/, sessionService.initialize()];
        case 1:
          _b.sent();
          sessionSystem = sessionService.getSessionSystem();
          return [4 /*yield*/, sessionSystem.validateSession(sessionToken)];
        case 2:
          validation = _b.sent();
          return [2 /*return*/, validation.valid ? validation.session : null];
      }
    });
  });
}
// ============================================================================
// REACT HOOKS
// ============================================================================
/**
 * Hook React para gerenciar sessão no cliente
 */
function useSession() {
  var _a = useState(null),
    session = _a[0],
    setSession = _a[1];
  var _b = useState(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = useState(null),
    error = _c[0],
    setError = _c[1];
  useEffect(() => {
    checkSession();
  }, []);
  var checkSession = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            return [4 /*yield*/, fetch("/api/auth/session")];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setSession(data.session);
            } else {
              setSession(null);
            }
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            setError("Failed to check session");
            setSession(null);
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var login = (email, password) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_2, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [
              4 /*yield*/,
              fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password }),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setSession(data.session);
              return [2 /*return*/, { success: true }];
            } else {
              setError(data.error);
              return [2 /*return*/, { success: false, error: data.error }];
            }
            return [3 /*break*/, 5];
          case 3:
            err_2 = _a.sent();
            error_2 = "Login failed";
            setError(error_2);
            return [2 /*return*/, { success: false, error: error_2 }];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var logout = () =>
    __awaiter(this, void 0, void 0, function () {
      var err_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            return [4 /*yield*/, fetch("/api/auth/logout", { method: "POST" })];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            err_3 = _a.sent();
            console.error("Logout error:", err_3);
            return [3 /*break*/, 4];
          case 3:
            setSession(null);
            window.location.href = "/login";
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  return {
    session: session,
    loading: loading,
    error: error,
    login: login,
    logout: logout,
    checkSession: checkSession,
  };
}
// ============================================================================
// EXAMPLE API ROUTES
// ============================================================================
/**
 * Exemplo de API route para login
 * Arquivo: app/api/auth/login/route.ts
 */
function loginApiExample(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, email, password, user, sessionResult, response, error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, request.json()];
        case 1:
          (_a = _b.sent()), (email = _a.email), (password = _a.password);
          return [4 /*yield*/, validateUserCredentials(email, password)];
        case 2:
          user = _b.sent();
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, createUserSession(user.id, user.clinicId, request)];
        case 3:
          sessionResult = _b.sent();
          if (!sessionResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Failed to create session" },
                { status: 500 },
              ),
            ];
          }
          response = server_1.NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          });
          response.cookies.set("session_token", sessionResult.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 60, // 30 minutes
          });
          return [2 /*return*/, response];
        case 4:
          error_3 = _b.sent();
          console.error("Login API error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Exemplo de API route para logout
 * Arquivo: app/api/auth/logout/route.ts
 */
function logoutApiExample(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionToken, response, error_4;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          sessionToken =
            (_a = request.cookies.get("session_token")) === null || _a === void 0
              ? void 0
              : _a.value;
          if (!sessionToken) return [3 /*break*/, 2];
          return [4 /*yield*/, terminateUserSession(sessionToken, "user_logout")];
        case 1:
          _b.sent();
          _b.label = 2;
        case 2:
          response = server_1.NextResponse.json({ success: true });
          response.cookies.delete("session_token");
          return [2 /*return*/, response];
        case 3:
          error_4 = _b.sent();
          console.error("Logout API error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Exemplo de API route para verificar sessão
 * Arquivo: app/api/auth/session/route.ts
 */
function sessionApiExample(request) {
  return __awaiter(this, void 0, void 0, function () {
    var session, error_5;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, getCurrentSession(request)];
        case 1:
          session = _a.sent();
          if (session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                session: {
                  id: session.id,
                  userId: session.userId,
                  clinicId: session.clinicId,
                  expiresAt: session.expiresAt,
                  securityScore: session.securityScore,
                },
              }),
            ];
          } else {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "No valid session" },
                { status: 401 },
              ),
            ];
          }
          return [3 /*break*/, 3];
        case 2:
          error_5 = _a.sent();
          console.error("Session API error:", error_5);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Função placeholder para validação de credenciais
 * Implementar com sua lógica de autenticação
 */
function validateUserCredentials(email, password) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      // Implementar validação real
      // Exemplo: verificar no banco de dados, hash de senha, etc.
      return [2 /*return*/, null];
    });
  });
}
/**
 * Função para obter localização do IP (opcional)
 */
function getLocationFromIP(ipAddress) {
  return __awaiter(this, void 0, void 0, function () {
    var response, data, error_6;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, fetch("https://ipapi.co/".concat(ipAddress, "/json/"))];
        case 1:
          response = _a.sent();
          return [4 /*yield*/, response.json()];
        case 2:
          data = _a.sent();
          if (data.latitude && data.longitude) {
            return [
              2 /*return*/,
              {
                latitude: data.latitude,
                longitude: data.longitude,
                city: data.city,
                country: data.country_name,
                timestamp: new Date(),
              },
            ];
          }
          return [3 /*break*/, 4];
        case 3:
          error_6 = _a.sent();
          console.error("Failed to get location from IP:", error_6);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/, undefined];
      }
    });
  });
}
/**
 * Função para gerar fingerprint mais detalhado no cliente
 */
function generateClientFingerprint() {
  if (typeof window === "undefined") {
    // Server-side fallback
    return {
      userAgent: "server",
      screen: { width: 0, height: 0 },
      timezone: "UTC",
      language: "en",
      platform: "server",
      plugins: [],
      canvas: "",
      webgl: "",
    };
  }
  // Client-side fingerprinting
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  ctx === null || ctx === void 0 ? void 0 : ctx.fillText("fingerprint", 10, 10);
  var canvasFingerprint = canvas.toDataURL();
  return {
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    plugins: Array.from(navigator.plugins).map((p) => p.name),
    canvas: canvasFingerprint,
    webgl: getWebGLFingerprint(),
  };
}
function getWebGLFingerprint() {
  try {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "";
    var debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "";
    var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return "".concat(vendor, "~").concat(renderer);
  } catch (error) {
    return "";
  }
}
exports.default = sessionService;
