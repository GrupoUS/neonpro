"use strict";
/**
 * Authentication Middleware for NeonPro API Routes
 * Handles JWT token verification and user role validation
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = verifyAuthToken;
exports.getSupabaseUser = getSupabaseUser;
exports.authenticateRequest = authenticateRequest;
exports.hasRole = hasRole;
exports.hasPermission = hasPermission;
exports.hasRoleLevel = hasRoleLevel;
exports.canAccessClinic = canAccessClinic;
exports.requireAuth = requireAuth;
var jose_1 = require("jose");
var client_1 = require("@/lib/supabase/client");
/**
 * JWT secret key for token verification
 */
var JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
);
/**
 * Extract JWT token from request headers
 */
function extractToken(request) {
  var authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return null;
  }
  // Check for Bearer token format
  var bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (bearerMatch) {
    return bearerMatch[1];
  }
  return null;
}
/**
 * Verify JWT token and extract user information
 */
function verifyAuthToken(token) {
  return __awaiter(this, void 0, void 0, function () {
    var payload, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, (0, jose_1.jwtVerify)(token, JWT_SECRET)];
        case 1:
          payload = _a.sent().payload;
          // Validate required fields
          if (!payload.sub || !payload.email) {
            return [2 /*return*/, null];
          }
          return [
            2 /*return*/,
            {
              id: payload.sub,
              email: payload.email,
              role: payload.role || "patient",
              clinicId: payload.clinicId,
              permissions: payload.permissions || [],
            },
          ];
        case 2:
          error_1 = _a.sent();
          console.error("JWT verification failed:", error_1);
          return [2 /*return*/, null];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get user session from Supabase
 */
function getSupabaseUser(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, profile, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [2 /*return*/, null];
          }
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .select("role, clinic_id, permissions")
              .eq("id", user.id)
              .single(),
          ];
        case 3:
          profile = _a.sent().data;
          return [
            2 /*return*/,
            {
              id: user.id,
              email: user.email || "",
              role: (profile === null || profile === void 0 ? void 0 : profile.role) || "patient",
              clinicId: profile === null || profile === void 0 ? void 0 : profile.clinic_id,
              permissions:
                (profile === null || profile === void 0 ? void 0 : profile.permissions) || [],
            },
          ];
        case 4:
          error_2 = _a.sent();
          console.error("Supabase user verification failed:", error_2);
          return [2 /*return*/, null];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Authenticate request using multiple methods
 */
function authenticateRequest(request) {
  return __awaiter(this, void 0, void 0, function () {
    var token, user, supabaseUser;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          token = extractToken(request);
          if (!token) return [3 /*break*/, 2];
          return [4 /*yield*/, verifyAuthToken(token)];
        case 1:
          user = _a.sent();
          if (user) {
            return [2 /*return*/, { success: true, user: user }];
          }
          _a.label = 2;
        case 2:
          return [4 /*yield*/, getSupabaseUser(request)];
        case 3:
          supabaseUser = _a.sent();
          if (supabaseUser) {
            return [2 /*return*/, { success: true, user: supabaseUser }];
          }
          return [2 /*return*/, { success: false, error: "Authentication required" }];
      }
    });
  });
}
/**
 * Check if user has required role
 */
function hasRole(user, requiredRole) {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  return user.role === requiredRole;
}
/**
 * Check if user has required permission
 */
function hasPermission(user, permission) {
  if (!user.permissions) {
    return false;
  }
  return user.permissions.includes(permission) || user.permissions.includes("*");
}
/**
 * Role hierarchy for permission checking
 */
var ROLE_HIERARCHY = {
  admin: 5,
  clinic_owner: 4,
  manager: 3,
  staff: 2,
  patient: 1,
  trial_user: 0,
};
/**
 * Check if user role has sufficient level
 */
function hasRoleLevel(user, minimumRole) {
  var _a, _b;
  var userLevel = (_a = ROLE_HIERARCHY[user.role]) !== null && _a !== void 0 ? _a : 0;
  var requiredLevel = (_b = ROLE_HIERARCHY[minimumRole]) !== null && _b !== void 0 ? _b : 0;
  return userLevel >= requiredLevel;
}
/**
 * Check if user can access clinic data
 */
function canAccessClinic(user, clinicId) {
  // Admin can access all clinics
  if (user.role === "admin") {
    return true;
  }
  // User must belong to the clinic
  return user.clinicId === clinicId;
}
/**
 * Middleware function to authenticate API routes
 */
function requireAuth(requiredRole, requiredPermission) {
  var _this = this;
  return function (request) {
    return __awaiter(_this, void 0, void 0, function () {
      var authResult, user;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, authenticateRequest(request)];
          case 1:
            authResult = _a.sent();
            if (!authResult.success || !authResult.user) {
              return [
                2 /*return*/,
                {
                  authenticated: false,
                  error: authResult.error || "Authentication failed",
                  status: 401,
                },
              ];
            }
            user = authResult.user;
            // Check role requirement
            if (requiredRole && !hasRole(user, requiredRole)) {
              return [
                2 /*return*/,
                {
                  authenticated: false,
                  error: "Insufficient permissions",
                  status: 403,
                },
              ];
            }
            // Check permission requirement
            if (requiredPermission && !hasPermission(user, requiredPermission)) {
              return [
                2 /*return*/,
                {
                  authenticated: false,
                  error: "Required permission not found",
                  status: 403,
                },
              ];
            }
            return [
              2 /*return*/,
              {
                authenticated: true,
                user: user,
              },
            ];
        }
      });
    });
  };
}
