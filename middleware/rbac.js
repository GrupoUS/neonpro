/**
 * NeonPro Healthcare RBAC Middleware
 * AUTH-02 Implementation - API Route Protection with Healthcare Context
 *
 * Features:
 * - API route protection with permission validation
 * - Healthcare-specific access control
 * - CFM compliance verification
 * - Emergency override support
 * - Comprehensive audit logging
 * - Multi-clinic/franchise support
 * - Performance optimized with caching
 */
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareRBACMiddleware = void 0;
exports.requirePermissions = requirePermissions;
exports.requireClinicalAccess = requireClinicalAccess;
exports.requireAdministrativeAccess = requireAdministrativeAccess;
exports.requireComplianceAccess = requireComplianceAccess;
exports.requireSystemAdminAccess = requireSystemAdminAccess;
exports.extractRBACContext = extractRBACContext;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
var rbac_1 = require("@/lib/auth/rbac");
// ============================================================================
// RBAC MIDDLEWARE CLASS
// ============================================================================
/**
 * Healthcare RBAC Middleware for API Protection
 */
var HealthcareRBACMiddleware = /** @class */ (() => {
  function HealthcareRBACMiddleware() {
    // Initialize Supabase client
    this.supabase = (0, ssr_1.createServerClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get: (_name) => undefined,
          set: (_name, _value, _options) => {},
          remove: (_name, _options) => {},
        },
      },
    );
    this.rbacEngine = new rbac_1.HealthcareRBACEngine(this.supabase);
  }
  /**
   * Create RBAC middleware for API route protection
   */
  HealthcareRBACMiddleware.prototype.protect = function (options) {
    return (request) =>
      __awaiter(this, void 0, void 0, function () {
        var authResult,
          user,
          userContext,
          requestContext,
          _a,
          emergencyOverride,
          healthcareValidation,
          permissionResults,
          hasRequiredPermissions,
          hasAlternativePermissions,
          _b,
          failedPermissions,
          rbacContext,
          requestWithContext,
          error_1;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 15, undefined, 16]);
              return [4 /*yield*/, this.extractAuthentication(request)];
            case 1:
              authResult = _c.sent();
              if (!authResult.success) {
                return [2 /*return*/, this.createErrorResponse(authResult.error, request)];
              }
              user = authResult.user;
              return [4 /*yield*/, this.getUserRoleContext(user.id)];
            case 2:
              userContext = _c.sent();
              if (!userContext) {
                return [
                  2 /*return*/,
                  this.createErrorResponse(
                    {
                      code: "USER_CONTEXT_NOT_FOUND",
                      message: "User role context not found",
                      statusCode: 403,
                      details: { userId: user.id },
                    },
                    request,
                  ),
                ];
              }
              if (!options.contextExtractor) return [3 /*break*/, 4];
              return [4 /*yield*/, options.contextExtractor(request)];
            case 3:
              _a = _c.sent();
              return [3 /*break*/, 6];
            case 4:
              return [4 /*yield*/, this.extractDefaultContext(request)];
            case 5:
              _a = _c.sent();
              _c.label = 6;
            case 6:
              requestContext = _a;
              emergencyOverride = this.checkEmergencyOverride(request);
              if (!(emergencyOverride && options.allowEmergencyOverride)) return [3 /*break*/, 8];
              return [
                4 /*yield*/,
                this.logEmergencyOverride(user.id, options.permissions, requestContext, request),
              ];
            case 7:
              _c.sent();
              _c.label = 8;
            case 8:
              return [4 /*yield*/, this.validateHealthcareRequirements(userContext, options)];
            case 9:
              healthcareValidation = _c.sent();
              if (!healthcareValidation.valid) {
                return [
                  2 /*return*/,
                  this.createErrorResponse(healthcareValidation.error, request),
                ];
              }
              return [
                4 /*yield*/,
                this.checkPermissions(
                  user.id,
                  options,
                  __assign(__assign({}, requestContext), { emergencyOverride: emergencyOverride }),
                ),
              ];
            case 10:
              permissionResults = _c.sent();
              hasRequiredPermissions = permissionResults.every((result) => result.granted);
              if (!options.alternativePermissions) return [3 /*break*/, 12];
              return [
                4 /*yield*/,
                this.checkAlternativePermissions(
                  user.id,
                  options.alternativePermissions,
                  __assign(__assign({}, requestContext), { emergencyOverride: emergencyOverride }),
                ),
              ];
            case 11:
              _b = _c.sent();
              return [3 /*break*/, 13];
            case 12:
              _b = false;
              _c.label = 13;
            case 13:
              hasAlternativePermissions = _b;
              if (!hasRequiredPermissions && !hasAlternativePermissions) {
                failedPermissions = permissionResults
                  .filter((result) => !result.granted)
                  .map((result) => result.permission);
                return [
                  2 /*return*/,
                  this.createErrorResponse(
                    {
                      code: "INSUFFICIENT_PERMISSIONS",
                      message: "Insufficient permissions for this operation",
                      statusCode: 403,
                      userRole: userContext.role,
                      requiredPermissions: options.permissions,
                      failedChecks: failedPermissions,
                      details: {
                        userId: user.id,
                        userRole: userContext.role,
                        requiredPermissions: options.permissions,
                        failedPermissions: failedPermissions,
                        context: requestContext,
                      },
                    },
                    request,
                  ),
                ];
              }
              // Log successful access
              return [
                4 /*yield*/,
                this.logSuccessfulAccess(
                  user.id,
                  options.permissions,
                  requestContext,
                  request,
                  options.auditMetadata,
                ),
              ];
            case 14:
              // Log successful access
              _c.sent();
              rbacContext = __assign(
                __assign(
                  { user: user, userContext: userContext, permissions: permissionResults },
                  requestContext,
                ),
                { emergencyOverride: emergencyOverride },
              );
              requestWithContext = new server_1.NextRequest(
                request.url,
                __assign(__assign({}, request), { headers: new Headers(request.headers) }),
              );
              requestWithContext.headers.set(
                "x-rbac-context",
                Buffer.from(JSON.stringify(rbacContext)).toString("base64"),
              );
              return [2 /*return*/];
            case 15:
              error_1 = _c.sent();
              console.error("RBAC Middleware error:", error_1);
              return [
                2 /*return*/,
                this.createErrorResponse(
                  {
                    code: "RBAC_MIDDLEWARE_ERROR",
                    message: "Internal error during permission validation",
                    statusCode: 500,
                    details: {
                      error: error_1 instanceof Error ? error_1.message : "Unknown error",
                    },
                  },
                  request,
                ),
              ];
            case 16:
              return [2 /*return*/];
          }
        });
      });
  };
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  /**
   * Extract authentication from request
   */
  HealthcareRBACMiddleware.prototype.extractAuthentication = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, cookieHeader, token, cookies, _a, user, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, undefined, 3]);
            authHeader = request.headers.get("authorization");
            cookieHeader = request.headers.get("cookie");
            token = null;
            if (
              authHeader === null || authHeader === void 0
                ? void 0
                : authHeader.startsWith("Bearer ")
            ) {
              token = authHeader.substring(7);
            } else if (cookieHeader) {
              cookies = cookieHeader.split(";").reduce((acc, cookie) => {
                var _a = cookie.trim().split("="),
                  name = _a[0],
                  value = _a[1];
                acc[name] = value;
                return acc;
              }, {});
              token = cookies["sb-access-token"] || cookies["supabase-auth-token"];
            }
            if (!token) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "NO_AUTH_TOKEN",
                    message: "No authentication token provided",
                    statusCode: 401,
                  },
                },
              ];
            }
            return [4 /*yield*/, this.supabase.auth.getUser(token)];
          case 1:
            (_a = _b.sent()), (user = _a.data.user), (error = _a.error);
            if (error || !user) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_AUTH_TOKEN",
                    message: "Invalid or expired authentication token",
                    statusCode: 401,
                    details: { error: error === null || error === void 0 ? void 0 : error.message },
                  },
                },
              ];
            }
            return [2 /*return*/, { success: true, user: user }];
          case 2:
            error_2 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "AUTH_EXTRACTION_ERROR",
                  message: "Error extracting authentication",
                  statusCode: 500,
                  details: { error: error_2 instanceof Error ? error_2.message : "Unknown error" },
                },
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user role context from database
   */
  HealthcareRBACMiddleware.prototype.getUserRoleContext = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      var _b, _c, _d, _e, _f, _g;
      return __generator(this, function (_h) {
        switch (_h.label) {
          case 0:
            _h.trys.push([0, 2, undefined, 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_roles")
                .select(
                  "\n          *,\n          medical_licenses (\n            license_number,\n            cfm_number,\n            specialty,\n            additional_specialties,\n            active,\n            expires_at\n          )\n        ",
                )
                .eq("user_id", userId)
                .eq("active", true)
                .single(),
            ];
          case 1:
            (_a = _h.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            return [
              2 /*return*/,
              {
                user_id: data.user_id,
                role: data.role,
                clinic_id: data.clinic_id,
                franchise_id: data.franchise_id,
                medical_license:
                  ((_b = data.medical_licenses) === null || _b === void 0
                    ? void 0
                    : _b.license_number) || null,
                cfm_number:
                  ((_c = data.medical_licenses) === null || _c === void 0
                    ? void 0
                    : _c.cfm_number) || null,
                medical_specialty:
                  ((_d = data.medical_licenses) === null || _d === void 0
                    ? void 0
                    : _d.specialty) || null,
                license_expiry: (
                  (_e = data.medical_licenses) === null || _e === void 0
                    ? void 0
                    : _e.expires_at
                )
                  ? new Date(data.medical_licenses.expires_at)
                  : null,
                license_active:
                  ((_f = data.medical_licenses) === null || _f === void 0 ? void 0 : _f.active) ||
                  false,
                additional_specialties:
                  ((_g = data.medical_licenses) === null || _g === void 0
                    ? void 0
                    : _g.additional_specialties) || [],
                certifications: data.certifications || [],
                active: data.active,
                temporary_access: data.temporary_access || false,
                emergency_access: data.emergency_access || false,
                access_granted_at: new Date(data.access_granted_at),
                access_expires_at: data.access_expires_at
                  ? new Date(data.access_expires_at)
                  : undefined,
                granted_by: data.granted_by,
                last_validated: new Date(data.last_validated),
                validation_required: data.validation_required || false,
                created_at: new Date(data.created_at),
                updated_at: new Date(data.updated_at),
              },
            ];
          case 2:
            error_3 = _h.sent();
            console.error("Get user role context error:", error_3);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Extract default context from request
   */
  HealthcareRBACMiddleware.prototype.extractDefaultContext = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var url,
        searchParams,
        pathname,
        clinicId,
        patientId,
        resourceId,
        pathParts,
        clinicIndex,
        patientIndex;
      return __generator(this, (_a) => {
        url = new URL(request.url);
        (searchParams = url.searchParams), (pathname = url.pathname);
        clinicId = searchParams.get("clinicId") || request.headers.get("x-clinic-id") || undefined;
        patientId =
          searchParams.get("patientId") || request.headers.get("x-patient-id") || undefined;
        resourceId =
          searchParams.get("resourceId") || request.headers.get("x-resource-id") || undefined;
        pathParts = pathname.split("/");
        clinicIndex = pathParts.indexOf("clinics");
        patientIndex = pathParts.indexOf("patients");
        return [
          2 /*return*/,
          {
            clinicId: clinicId || (clinicIndex > -1 && pathParts[clinicIndex + 1]) || undefined,
            patientId: patientId || (patientIndex > -1 && pathParts[patientIndex + 1]) || undefined,
            resourceId: resourceId,
          },
        ];
      });
    });
  };
  /**
   * Check for emergency override flag
   */
  HealthcareRBACMiddleware.prototype.checkEmergencyOverride = (request) =>
    request.headers.get("x-emergency-override") === "true" ||
    new URL(request.url).searchParams.get("emergencyOverride") === "true";
  /**
   * Validate healthcare-specific requirements
   */
  HealthcareRBACMiddleware.prototype.validateHealthcareRequirements = function (
    userContext,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var userSpecialties;
      return __generator(this, (_a) => {
        // Check medical license requirement
        if (options.requireMedicalLicense && !userContext.medical_license) {
          return [
            2 /*return*/,
            {
              valid: false,
              error: {
                code: "MEDICAL_LICENSE_REQUIRED",
                message: "Active medical license required for this operation",
                statusCode: 403,
                userRole: userContext.role,
                details: { userId: userContext.user_id },
              },
            },
          ];
        }
        // Check license active status
        if (options.requireMedicalLicense && !userContext.license_active) {
          return [
            2 /*return*/,
            {
              valid: false,
              error: {
                code: "MEDICAL_LICENSE_INACTIVE",
                message: "Medical license is not active",
                statusCode: 403,
                userRole: userContext.role,
                details: {
                  userId: userContext.user_id,
                  licenseNumber: userContext.medical_license,
                },
              },
            },
          ];
        }
        // Check license expiry
        if (userContext.license_expiry && userContext.license_expiry < new Date()) {
          return [
            2 /*return*/,
            {
              valid: false,
              error: {
                code: "MEDICAL_LICENSE_EXPIRED",
                message: "Medical license has expired",
                statusCode: 403,
                userRole: userContext.role,
                details: {
                  userId: userContext.user_id,
                  licenseNumber: userContext.medical_license,
                  expiryDate: userContext.license_expiry,
                },
              },
            },
          ];
        }
        // Check CFM registration requirement
        if (options.requireCFMRegistration && !userContext.cfm_number) {
          return [
            2 /*return*/,
            {
              valid: false,
              error: {
                code: "CFM_REGISTRATION_REQUIRED",
                message: "CFM registration required for this operation",
                statusCode: 403,
                userRole: userContext.role,
                details: { userId: userContext.user_id },
              },
            },
          ];
        }
        // Check required specialty
        if (options.requiredSpecialty) {
          userSpecialties = __spreadArray(
            __spreadArray(
              [],
              userContext.medical_specialty ? [userContext.medical_specialty] : [],
              true,
            ),
            userContext.additional_specialties,
            true,
          );
          if (!userSpecialties.includes(options.requiredSpecialty)) {
            return [
              2 /*return*/,
              {
                valid: false,
                error: {
                  code: "MEDICAL_SPECIALTY_REQUIRED",
                  message: "Medical specialty '".concat(
                    options.requiredSpecialty,
                    "' required for this operation",
                  ),
                  statusCode: 403,
                  userRole: userContext.role,
                  details: {
                    userId: userContext.user_id,
                    requiredSpecialty: options.requiredSpecialty,
                    userSpecialties: userSpecialties,
                  },
                },
              },
            ];
          }
        }
        return [2 /*return*/, { valid: true }];
      });
    });
  };
  /**
   * Check permissions using RBAC engine
   */
  HealthcareRBACMiddleware.prototype.checkPermissions = function (userId, options, context) {
    return __awaiter(this, void 0, void 0, function () {
      var results;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all(
                options.permissions.map((permission) =>
                  this.rbacEngine.checkPermission(userId, permission, context),
                ),
              ),
            ];
          case 1:
            results = _a.sent();
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Check alternative permissions
   */
  HealthcareRBACMiddleware.prototype.checkAlternativePermissions = function (
    userId,
    permissions,
    context,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var results;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all(
                permissions.map((permission) =>
                  this.rbacEngine.checkPermission(userId, permission, context),
                ),
              ),
            ];
          case 1:
            results = _a.sent();
            return [2 /*return*/, results.some((result) => result.granted)];
        }
      });
    });
  };
  /**
   * Log emergency override usage
   */
  HealthcareRBACMiddleware.prototype.logEmergencyOverride = function (
    userId,
    permissions,
    context,
    request,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            return [
              4 /*yield*/,
              this.supabase.from("audit_logs").insert({
                user_id: userId,
                action: "emergency_override",
                resource: permissions.join(","),
                context: __assign(__assign({}, context), {
                  url: request.url,
                  method: request.method,
                  userAgent: request.headers.get("user-agent"),
                  ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
                }),
                result: "granted",
                reason: "Emergency override activated",
                emergency_override: true,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Emergency override logging error:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log successful access
   */
  HealthcareRBACMiddleware.prototype.logSuccessfulAccess = function (
    userId,
    permissions,
    context,
    request,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            return [
              4 /*yield*/,
              this.supabase.from("audit_logs").insert({
                user_id: userId,
                action: "api_access",
                resource: permissions.join(","),
                context: __assign(
                  __assign(__assign({}, context), {
                    url: request.url,
                    method: request.method,
                    userAgent: request.headers.get("user-agent"),
                    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
                  }),
                  metadata,
                ),
                result: "granted",
                reason: "Permission validation successful",
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Successful access logging error:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create error response
   */
  HealthcareRBACMiddleware.prototype.createErrorResponse = function (error, request) {
    return __awaiter(this, void 0, void 0, function () {
      var logError_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, undefined, 3]);
            return [
              4 /*yield*/,
              this.supabase.from("audit_logs").insert({
                action: "api_access_denied",
                resource:
                  ((_a = error.requiredPermissions) === null || _a === void 0
                    ? void 0
                    : _a.join(",")) || "unknown",
                context: {
                  url: request.url,
                  method: request.method,
                  userAgent: request.headers.get("user-agent"),
                  ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
                  errorCode: error.code,
                  errorMessage: error.message,
                },
                result: "denied",
                reason: error.message,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _b.sent();
            return [3 /*break*/, 3];
          case 2:
            logError_1 = _b.sent();
            console.error("Access denial logging error:", logError_1);
            return [3 /*break*/, 3];
          case 3:
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: error.code,
                  message: error.message,
                  details: error.details,
                  statusCode: error.statusCode,
                  timestamp: new Date().toISOString(),
                },
                { status: error.statusCode },
              ),
            ];
        }
      });
    });
  };
  return HealthcareRBACMiddleware;
})();
exports.HealthcareRBACMiddleware = HealthcareRBACMiddleware;
// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================
/**
 * Create RBAC middleware instance
 */
var rbacMiddleware = new HealthcareRBACMiddleware();
/**
 * Protect API route with specific permissions
 */
function requirePermissions(permissions, options) {
  if (options === void 0) {
    options = {};
  }
  return rbacMiddleware.protect(__assign({ permissions: permissions }, options));
}
/**
 * Protect clinical API routes
 */
function requireClinicalAccess(options) {
  if (options === void 0) {
    options = {};
  }
  return rbacMiddleware.protect(
    __assign(
      {
        permissions: ["patient.read.own", "procedure.perform.general"],
        requireMedicalLicense: true,
        allowEmergencyOverride: true,
      },
      options,
    ),
  );
}
/**
 * Protect administrative API routes
 */
function requireAdministrativeAccess(options) {
  if (options === void 0) {
    options = {};
  }
  return rbacMiddleware.protect(
    __assign(
      {
        permissions: ["scheduling.manage.clinic", "billing.process.standard"],
        allowEmergencyOverride: false,
      },
      options,
    ),
  );
}
/**
 * Protect compliance API routes
 */
function requireComplianceAccess(options) {
  if (options === void 0) {
    options = {};
  }
  return rbacMiddleware.protect(
    __assign(
      {
        permissions: ["audit.access.clinic", "compliance.report.cfm"],
        allowEmergencyOverride: false,
      },
      options,
    ),
  );
}
/**
 * Protect system administration routes
 */
function requireSystemAdminAccess(options) {
  if (options === void 0) {
    options = {};
  }
  return rbacMiddleware.protect(
    __assign(
      {
        permissions: ["system.manage.users", "system.configure.clinic"],
        allowEmergencyOverride: false,
      },
      options,
    ),
  );
}
/**
 * Extract RBAC context from request (for use in API handlers)
 */
function extractRBACContext(request) {
  try {
    var contextHeader = request.headers.get("x-rbac-context");
    if (!contextHeader) return null;
    var contextData = JSON.parse(Buffer.from(contextHeader, "base64").toString());
    return contextData;
  } catch (error) {
    console.error("Extract RBAC context error:", error);
    return null;
  }
}
exports.default = rbacMiddleware;
