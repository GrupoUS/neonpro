"use strict";
/**
 * API Route: Permission Check Endpoint
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Provides REST API for frontend permission validation
 * Integrates with RBAC permission system
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.POST = POST;
exports.GET = GET;
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var auth_1 = require("@/lib/middleware/auth");
var permissions_1 = require("@/lib/auth/rbac/permissions");
var zod_1 = require("zod");
/**
 * Request validation schemas
 */
var SinglePermissionSchema = zod_1.z.object({
  permission: zod_1.z.string(),
  resourceId: zod_1.z.string().optional(),
  context: zod_1.z
    .object({
      clinicId: zod_1.z.string().optional(),
      departmentId: zod_1.z.string().optional(),
      metadata: zod_1.z.record(zod_1.z.any()).optional(),
    })
    .optional(),
});
var MultiplePermissionsSchema = zod_1.z.object({
  permissions: zod_1.z.array(zod_1.z.string()),
  resourceId: zod_1.z.string().optional(),
  context: zod_1.z
    .object({
      clinicId: zod_1.z.string().optional(),
      departmentId: zod_1.z.string().optional(),
      metadata: zod_1.z.record(zod_1.z.any()).optional(),
    })
    .optional(),
  requireAll: zod_1.z.boolean().default(false),
});
var PermissionCheckSchema = zod_1.z.union([SinglePermissionSchema, MultiplePermissionsSchema]);
/**
 * POST /api/auth/permissions/check
 *
 * Check user permissions against RBAC system
 *
 * @param request - NextRequest containing permission check data
 * @returns Permission check result with granted status and metadata
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult,
      requestBody,
      error_1,
      validationResult,
      data,
      user,
      result,
      permissions,
      result,
      error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 13, , 14]);
          return [4 /*yield*/, (0, auth_1.authenticateRequest)(request)];
        case 1:
          authResult = _a.sent();
          if (!authResult.success || !authResult.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Authentication required",
                  granted: false,
                  reason: authResult.error || "Invalid authentication",
                },
                { status: 401 },
              ),
            ];
          }
          requestBody = void 0;
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, , 5]);
          return [4 /*yield*/, request.json()];
        case 3:
          requestBody = _a.sent();
          return [3 /*break*/, 5];
        case 4:
          error_1 = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Invalid JSON in request body",
                granted: false,
                reason: "Malformed request data",
              },
              { status: 400 },
            ),
          ];
        case 5:
          validationResult = PermissionCheckSchema.safeParse(requestBody);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request format",
                  granted: false,
                  reason: "Request validation failed",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          data = validationResult.data;
          user = authResult.user;
          if (!("permission" in data)) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            (0, permissions_1.hasPermission)(user, data.permission, data.resourceId, data.context),
          ];
        case 6:
          result = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              granted: result.granted,
              reason: result.reason,
              roleUsed: result.roleUsed,
              permission: data.permission,
              resourceId: data.resourceId,
              context: data.context,
              timestamp: new Date().toISOString(),
              userId: user.id,
            }),
          ];
        case 7:
          if (!("permissions" in data)) return [3 /*break*/, 12];
          permissions = data.permissions;
          result = void 0;
          if (!data.requireAll) return [3 /*break*/, 9];
          return [4 /*yield*/, (0, permissions_1.hasAllPermissions)(user, permissions)];
        case 8:
          result = _a.sent();
          return [3 /*break*/, 11];
        case 9:
          return [4 /*yield*/, (0, permissions_1.hasAnyPermission)(user, permissions)];
        case 10:
          result = _a.sent();
          _a.label = 11;
        case 11:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              granted: result.granted,
              reason: result.reason,
              roleUsed: result.roleUsed,
              permissions: data.permissions,
              requireAll: data.requireAll,
              resourceId: data.resourceId,
              context: data.context,
              timestamp: new Date().toISOString(),
              userId: user.id,
            }),
          ];
        case 12:
          // Should not reach here due to schema validation
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Invalid request type",
                granted: false,
                reason: "Unknown permission check format",
              },
              { status: 400 },
            ),
          ];
        case 13:
          error_2 = _a.sent();
          console.error("Permission check API error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                granted: false,
                reason: "Permission validation failed due to server error",
                timestamp: new Date().toISOString(),
              },
              { status: 500 },
            ),
          ];
        case 14:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET /api/auth/permissions/check
 *
 * Get current user's role and basic permission info
 * Useful for frontend initialization and caching
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, user, userInfo, roleCapabilities, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, (0, auth_1.authenticateRequest)(request)];
        case 1:
          authResult = _a.sent();
          if (!authResult.success || !authResult.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Authentication required",
                  authenticated: false,
                },
                { status: 401 },
              ),
            ];
          }
          user = authResult.user;
          userInfo = {
            userId: user.id,
            email: user.email,
            role: user.role,
            clinicId: user.clinicId,
            authenticated: true,
            timestamp: new Date().toISOString(),
          };
          roleCapabilities = getRoleCapabilities(user.role);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              __assign(__assign({}, userInfo), { capabilities: roleCapabilities }),
            ),
          ];
        case 2:
          error_3 = _a.sent();
          console.error("Permission info API error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                authenticated: false,
                timestamp: new Date().toISOString(),
              },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get general role capabilities without specific permission checks
 * Used for frontend optimization and caching
 */
function getRoleCapabilities(role) {
  var capabilities = {
    canManageUsers: false,
    canManagePatients: false,
    canManageAppointments: false,
    canViewBilling: false,
    canManageBilling: false,
    canManageClinic: false,
    canViewReports: false,
    canManageSystem: false,
  };
  switch (role) {
    case "owner":
      return __assign(__assign({}, capabilities), {
        canManageUsers: true,
        canManagePatients: true,
        canManageAppointments: true,
        canViewBilling: true,
        canManageBilling: true,
        canManageClinic: true,
        canViewReports: true,
        canManageSystem: true,
      });
    case "manager":
      return __assign(__assign({}, capabilities), {
        canManageUsers: true,
        canManagePatients: true,
        canManageAppointments: true,
        canViewBilling: true,
        canManageBilling: true,
        canViewReports: true,
      });
    case "staff":
      return __assign(__assign({}, capabilities), {
        canManagePatients: true,
        canManageAppointments: true,
      });
    case "patient":
      return __assign(
        {},
        capabilities,
        // Patients have very limited capabilities
      );
    default:
      return capabilities;
  }
}
/**
 * OPTIONS handler for CORS preflight requests
 */
function OPTIONS(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        new server_1.NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        }),
      ];
    });
  });
}
