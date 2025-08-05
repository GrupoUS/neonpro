/**
 * NeonPro Healthcare Permissions Hook
 * AUTH-02 Implementation - React Hook for Permission Management
 *
 * Features:
 * - React hook for permission checking with healthcare context
 * - Real-time permission updates via Supabase subscriptions
 * - Emergency override capabilities
 * - Medical license and CFM compliance validation
 * - Context-aware permission evaluation
 * - Performance optimized with caching
 */
"use client";
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
exports.usePermissions = usePermissions;
exports.useClinicalPermissions = useClinicalPermissions;
exports.useAdministrativePermissions = useAdministrativePermissions;
exports.useCompliancePermissions = useCompliancePermissions;
var react_1 = require("react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var rbac_1 = require("@/lib/auth/rbac");
var permissions_1 = require("@/lib/auth/permissions");
var use_session_1 = require("@/hooks/use-session");
var use_toast_1 = require("@/hooks/use-toast");
// ============================================================================
// PERMISSIONS HOOK
// ============================================================================
/**
 * Healthcare Permissions Hook with CFM Compliance
 */
function usePermissions(options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.realtime,
    realtime = _a === void 0 ? true : _a,
    _b = options.cacheDuration,
    cacheDuration = _b === void 0 ? 5 * 60 * 1000 : _b, // 5 minutes
    _c = options.refreshInterval, // 5 minutes
    refreshInterval = _c === void 0 ? 30 * 60 * 1000 : _c, // 30 minutes
    _d = options.allowEmergencyOverride, // 30 minutes
    allowEmergencyOverride = _d === void 0 ? false : _d;
  // Dependencies
  var _e = (0, use_session_1.useSession)(),
    user = _e.user,
    session = _e.session;
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  // State
  var _f = (0, react_1.useState)(true),
    isLoading = _f[0],
    setIsLoading = _f[1];
  var _g = (0, react_1.useState)(null),
    error = _g[0],
    setError = _g[1];
  var _h = (0, react_1.useState)(null),
    userContext = _h[0],
    setUserContext = _h[1];
  var _j = (0, react_1.useState)([]),
    effectivePermissions = _j[0],
    setEffectivePermissions = _j[1];
  var _k = (0, react_1.useState)(null),
    lastUpdated = _k[0],
    setLastUpdated = _k[1];
  // Cache and refs
  var permissionCache = (0, react_1.useRef)({});
  var rbacEngine = (0, react_1.useRef)();
  var refreshTimer = (0, react_1.useRef)();
  var subscriptionRef = (0, react_1.useRef)();
  // Initialize RBAC engine
  (0, react_1.useEffect)(() => {
    if (supabase && !rbacEngine.current) {
      rbacEngine.current = new rbac_1.HealthcareRBACEngine(supabase);
    }
  }, [supabase]);
  // Load user permissions on session change
  (0, react_1.useEffect)(() => {
    if (user === null || user === void 0 ? void 0 : user.id) {
      loadUserPermissions();
    } else {
      resetPermissions();
    }
  }, [user === null || user === void 0 ? void 0 : user.id]);
  // Setup real-time subscriptions
  (0, react_1.useEffect)(() => {
    if (realtime && (user === null || user === void 0 ? void 0 : user.id)) {
      var unsubscribe = subscribeToUpdates();
      return unsubscribe;
    }
  }, [realtime, user === null || user === void 0 ? void 0 : user.id]);
  // Setup auto-refresh
  (0, react_1.useEffect)(() => {
    if (refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        refreshPermissions();
      }, refreshInterval);
      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [refreshInterval]);
  // ============================================================================
  // CORE PERMISSION FUNCTIONS
  // ============================================================================
  /**
   * Load user permissions and context
   */
  var loadUserPermissions = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, roleData, roleError, context, permissions, err_1;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, (_h) => {
          switch (_h.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id) || !rbacEngine.current)
                return [2 /*return*/];
              _h.label = 1;
            case 1:
              _h.trys.push([1, 4, 5, 6]);
              setIsLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase
                  .from("user_roles")
                  .select(
                    "\n          *,\n          medical_licenses (\n            license_number,\n            cfm_number,\n            specialty,\n            additional_specialties,\n            active,\n            expires_at\n          )\n        ",
                  )
                  .eq("user_id", user.id)
                  .eq("active", true)
                  .single(),
              ];
            case 2:
              (_a = _h.sent()), (roleData = _a.data), (roleError = _a.error);
              if (roleError || !roleData) {
                throw new Error("Failed to load user role context");
              }
              context = {
                user_id: roleData.user_id,
                role: roleData.role,
                clinic_id: roleData.clinic_id,
                franchise_id: roleData.franchise_id,
                medical_license:
                  ((_b = roleData.medical_licenses) === null || _b === void 0
                    ? void 0
                    : _b.license_number) || null,
                cfm_number:
                  ((_c = roleData.medical_licenses) === null || _c === void 0
                    ? void 0
                    : _c.cfm_number) || null,
                medical_specialty:
                  ((_d = roleData.medical_licenses) === null || _d === void 0
                    ? void 0
                    : _d.specialty) || null,
                license_expiry: (
                  (_e = roleData.medical_licenses) === null || _e === void 0
                    ? void 0
                    : _e.expires_at
                )
                  ? new Date(roleData.medical_licenses.expires_at)
                  : null,
                license_active:
                  ((_f = roleData.medical_licenses) === null || _f === void 0
                    ? void 0
                    : _f.active) || false,
                additional_specialties:
                  ((_g = roleData.medical_licenses) === null || _g === void 0
                    ? void 0
                    : _g.additional_specialties) || [],
                certifications: roleData.certifications || [],
                active: roleData.active,
                temporary_access: roleData.temporary_access || false,
                emergency_access: roleData.emergency_access || false,
                access_granted_at: new Date(roleData.access_granted_at),
                access_expires_at: roleData.access_expires_at
                  ? new Date(roleData.access_expires_at)
                  : undefined,
                granted_by: roleData.granted_by,
                last_validated: new Date(roleData.last_validated),
                validation_required: roleData.validation_required || false,
                created_at: new Date(roleData.created_at),
                updated_at: new Date(roleData.updated_at),
              };
              setUserContext(context);
              return [4 /*yield*/, rbacEngine.current.getUserEffectivePermissions(user.id)];
            case 3:
              permissions = _h.sent();
              setEffectivePermissions(permissions);
              setLastUpdated(new Date());
              return [3 /*break*/, 6];
            case 4:
              err_1 = _h.sent();
              console.error("Load user permissions error:", err_1);
              setError(err_1 instanceof Error ? err_1.message : "Failed to load permissions");
              return [3 /*break*/, 6];
            case 5:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [user === null || user === void 0 ? void 0 : user.id, supabase],
  );
  /**
   * Check single permission
   */
  var checkPermission = (0, react_1.useCallback)(
    (permission, context) =>
      __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, result, err_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id) || !rbacEngine.current) {
                return [
                  2 /*return*/,
                  {
                    granted: false,
                    permission: permission,
                    user_id: (user === null || user === void 0 ? void 0 : user.id) || "",
                    role: permissions_1.HealthcareRole.GUEST,
                    reason: "User not authenticated",
                    requires_validation: false,
                    emergency_override: false,
                    license_valid: false,
                    specialty_match: false,
                    cfm_compliant: false,
                    lgpd_compliant: false,
                    checked_at: new Date(),
                  },
                ];
              }
              cacheKey = ""
                .concat(user.id, ":")
                .concat(permission, ":")
                .concat(JSON.stringify(context));
              cached = permissionCache.current[cacheKey];
              if (cached && Date.now() - cached.timestamp < cacheDuration) {
                return [2 /*return*/, cached.result];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                rbacEngine.current.checkPermission(user.id, permission, context),
              ];
            case 2:
              result = _a.sent();
              // Cache result
              permissionCache.current[cacheKey] = {
                result: result,
                timestamp: Date.now(),
              };
              return [2 /*return*/, result];
            case 3:
              err_2 = _a.sent();
              console.error("Permission check error:", err_2);
              return [
                2 /*return*/,
                {
                  granted: false,
                  permission: permission,
                  user_id: user.id,
                  role:
                    (userContext === null || userContext === void 0 ? void 0 : userContext.role) ||
                    permissions_1.HealthcareRole.GUEST,
                  reason: "Permission check failed",
                  requires_validation: false,
                  emergency_override: false,
                  license_valid: false,
                  specialty_match: false,
                  cfm_compliant: false,
                  lgpd_compliant: false,
                  checked_at: new Date(),
                },
              ];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [
      user === null || user === void 0 ? void 0 : user.id,
      userContext === null || userContext === void 0 ? void 0 : userContext.role,
      cacheDuration,
    ],
  );
  /**
   * Check multiple permissions
   */
  var checkPermissions = (0, react_1.useCallback)(
    (permissions, context) =>
      __awaiter(this, void 0, void 0, function () {
        var results;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.all(permissions.map((permission) => checkPermission(permission, context))),
              ];
            case 1:
              results = _a.sent();
              return [2 /*return*/, results];
          }
        });
      }),
    [checkPermission],
  );
  /**
   * Check if user has permission (sync)
   */
  var hasPermission = (0, react_1.useCallback)(
    (permission, context) => {
      // For sync checks, use effective permissions as baseline
      return effectivePermissions.includes(permission);
    },
    [effectivePermissions],
  );
  /**
   * Check if user has any of the permissions (sync)
   */
  var hasAnyPermission = (0, react_1.useCallback)(
    (permissions, context) => permissions.some((permission) => hasPermission(permission, context)),
    [hasPermission],
  );
  /**
   * Check if user has all permissions (sync)
   */
  var hasAllPermissions = (0, react_1.useCallback)(
    (permissions, context) => permissions.every((permission) => hasPermission(permission, context)),
    [hasPermission],
  );
  // ============================================================================
  // EMERGENCY OVERRIDE FUNCTIONS
  // ============================================================================
  /**
   * Request emergency override for permission
   */
  var requestEmergencyOverride = (0, react_1.useCallback)(
    (permission, reason) =>
      __awaiter(this, void 0, void 0, function () {
        var logError, err_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (
                !(user === null || user === void 0 ? void 0 : user.id) ||
                !allowEmergencyOverride ||
                !userContext
              ) {
                return [2 /*return*/, false];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              // Check if user can request emergency override
              if (!userContext.emergency_access) {
                toast({
                  title: "Acesso de Emergência Negado",
                  description: "Seu papel não permite solicitações de acesso de emergência",
                  variant: "destructive",
                });
                return [2 /*return*/, false];
              }
              return [
                4 /*yield*/,
                supabase.from("emergency_override_logs").insert({
                  user_id: user.id,
                  permission: permission,
                  reason: reason,
                  clinic_id: userContext.clinic_id,
                  medical_license: userContext.medical_license,
                  cfm_number: userContext.cfm_number,
                  requested_at: new Date().toISOString(),
                  status: "approved", // Auto-approve for emergency scenarios
                }),
              ];
            case 2:
              logError = _a.sent().error;
              if (logError) {
                throw new Error("Failed to log emergency override");
              }
              // Clear cache to force permission recheck
              clearCache();
              // Show success toast
              toast({
                title: "Acesso de Emergência Concedido",
                description: "Acesso tempor\u00E1rio concedido para: ".concat(permission),
                variant: "success",
              });
              // Refresh permissions
              return [4 /*yield*/, refreshPermissions()];
            case 3:
              // Refresh permissions
              _a.sent();
              return [2 /*return*/, true];
            case 4:
              err_3 = _a.sent();
              console.error("Emergency override error:", err_3);
              toast({
                title: "Erro no Acesso de Emergência",
                description: "Falha ao processar solicitação de acesso de emergência",
                variant: "destructive",
              });
              return [2 /*return*/, false];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [
      user === null || user === void 0 ? void 0 : user.id,
      allowEmergencyOverride,
      userContext,
      supabase,
      toast,
    ],
  );
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  /**
   * Refresh permissions from server
   */
  var refreshPermissions = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              clearCache();
              return [4 /*yield*/, loadUserPermissions()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [loadUserPermissions],
  );
  /**
   * Clear permission cache
   */
  var clearCache = (0, react_1.useCallback)(() => {
    permissionCache.current = {};
  }, []);
  /**
   * Reset permissions state
   */
  var resetPermissions = (0, react_1.useCallback)(() => {
    setUserContext(null);
    setEffectivePermissions([]);
    setLastUpdated(null);
    clearCache();
  }, [clearCache]);
  /**
   * Subscribe to real-time permission updates
   */
  var subscribeToUpdates = (0, react_1.useCallback)(() => {
    if (!(user === null || user === void 0 ? void 0 : user.id) || subscriptionRef.current)
      return () => {};
    var subscription = supabase
      .channel("permissions-".concat(user.id))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
          filter: "user_id=eq.".concat(user.id),
        },
        (payload) => {
          console.log("Permission update received:", payload);
          refreshPermissions();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "medical_licenses",
          filter: "user_id=eq.".concat(user.id),
        },
        (payload) => {
          console.log("Medical license update received:", payload);
          refreshPermissions();
        },
      )
      .subscribe();
    subscriptionRef.current = subscription;
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user === null || user === void 0 ? void 0 : user.id, supabase, refreshPermissions]);
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  var userRole =
    (userContext === null || userContext === void 0 ? void 0 : userContext.role) ||
    permissions_1.HealthcareRole.GUEST;
  var medicalLicense =
    (userContext === null || userContext === void 0 ? void 0 : userContext.medical_license) || null;
  var cfmNumber =
    (userContext === null || userContext === void 0 ? void 0 : userContext.cfm_number) || null;
  var medicalSpecialty =
    (userContext === null || userContext === void 0 ? void 0 : userContext.medical_specialty) ||
    null;
  var additionalSpecialties =
    (userContext === null || userContext === void 0
      ? void 0
      : userContext.additional_specialties) || [];
  var licenseActive =
    (userContext === null || userContext === void 0 ? void 0 : userContext.license_active) || false;
  var licenseExpiry =
    (userContext === null || userContext === void 0 ? void 0 : userContext.license_expiry) || null;
  var hasEmergencyOverride =
    allowEmergencyOverride &&
    ((userContext === null || userContext === void 0 ? void 0 : userContext.emergency_access) ||
      false);
  return {
    // Permission checking
    checkPermission: checkPermission,
    checkPermissions: checkPermissions,
    hasPermission: hasPermission,
    hasAnyPermission: hasAnyPermission,
    hasAllPermissions: hasAllPermissions,
    // User context
    userRole: userRole,
    userContext: userContext,
    effectivePermissions: effectivePermissions,
    // Medical context
    medicalLicense: medicalLicense,
    cfmNumber: cfmNumber,
    medicalSpecialty: medicalSpecialty,
    additionalSpecialties: additionalSpecialties,
    licenseActive: licenseActive,
    licenseExpiry: licenseExpiry,
    // Emergency capabilities
    hasEmergencyOverride: hasEmergencyOverride,
    requestEmergencyOverride: requestEmergencyOverride,
    // State management
    isLoading: isLoading,
    error: error,
    lastUpdated: lastUpdated,
    // Cache management
    refreshPermissions: refreshPermissions,
    clearCache: clearCache,
    // Real-time updates
    subscribeToUpdates: subscribeToUpdates,
  };
}
// ============================================================================
// SPECIALIZED PERMISSION HOOKS
// ============================================================================
/**
 * Clinical Permissions Hook - For medical procedures and patient care
 */
function useClinicalPermissions(patientId) {
  var permissions = usePermissions({
    allowEmergencyOverride: true,
    realtime: true,
  });
  var checkClinicalPermission = (0, react_1.useCallback)(
    (permission) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => [
          2 /*return*/,
          permissions.checkPermission(permission, { patientId: patientId }),
        ]);
      }),
    [permissions.checkPermission, patientId],
  );
  var canAccessPatient = (0, react_1.useCallback)(
    (targetPatientId) => {
      var id = targetPatientId || patientId;
      return permissions.hasAnyPermission(["patient.read.own", "patient.read.clinic"], {
        patientId: id,
      });
    },
    [permissions.hasAnyPermission, patientId],
  );
  var canPerformProcedure = (0, react_1.useCallback)(
    (procedureType) => {
      if (procedureType === void 0) {
        procedureType = "general";
      }
      return permissions.hasPermission("procedure.perform.".concat(procedureType));
    },
    [permissions.hasPermission],
  );
  var canPrescribe = (0, react_1.useCallback)(
    (type) => {
      if (type === void 0) {
        type = "standard";
      }
      return permissions.hasPermission("prescription.create.".concat(type));
    },
    [permissions.hasPermission],
  );
  return __assign(__assign({}, permissions), {
    checkClinicalPermission: checkClinicalPermission,
    canAccessPatient: canAccessPatient,
    canPerformProcedure: canPerformProcedure,
    canPrescribe: canPrescribe,
  });
}
/**
 * Administrative Permissions Hook - For non-clinical operations
 */
function useAdministrativePermissions() {
  var permissions = usePermissions({
    allowEmergencyOverride: false,
    realtime: true,
  });
  var canManageScheduling = (0, react_1.useCallback)(
    (scope) => {
      if (scope === void 0) {
        scope = "own";
      }
      return permissions.hasPermission("scheduling.manage.".concat(scope));
    },
    [permissions.hasPermission],
  );
  var canProcessBilling = (0, react_1.useCallback)(),
    boolean;
  return permissions.hasPermission("billing.process.standard");
  [permissions.hasPermission];
  var canManageUsers = (0, react_1.useCallback)(),
    boolean;
  return permissions.hasPermission("system.manage.users");
  [permissions.hasPermission];
  var canConfigureClinic = (0, react_1.useCallback)(),
    boolean;
  return permissions.hasPermission("system.configure.clinic");
  [permissions.hasPermission];
  return __assign(__assign({}, permissions), {
    canManageScheduling: canManageScheduling,
    canProcessBilling: canProcessBilling,
    canManageUsers: canManageUsers,
    canConfigureClinic: canConfigureClinic,
  });
}
/**
 * Compliance Permissions Hook - For audit and compliance access
 */
function useCompliancePermissions() {
  var permissions = usePermissions({
    allowEmergencyOverride: false,
    realtime: true,
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache for compliance
  });
  var canAccessAuditLogs = (0, react_1.useCallback)(),
    boolean;
  return permissions.hasPermission("audit.access.clinic");
  [permissions.hasPermission];
  var canGenerateReports = (0, react_1.useCallback)(
    (type) => permissions.hasPermission("compliance.report.".concat(type)),
    [permissions.hasPermission],
  );
  var canValidateLicenses = (0, react_1.useCallback)(),
    boolean;
  return permissions.hasPermission("license.validate.cfm");
  [permissions.hasPermission];
  var canMonitorLicenses = (0, react_1.useCallback)(),
    boolean;
  return permissions.hasPermission("license.monitor.expiration");
  [permissions.hasPermission];
  return __assign(__assign({}, permissions), {
    canAccessAuditLogs: canAccessAuditLogs,
    canGenerateReports: canGenerateReports,
    canValidateLicenses: canValidateLicenses,
    canMonitorLicenses: canMonitorLicenses,
  });
}
exports.default = usePermissions;
