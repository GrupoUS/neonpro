/**
 * NeonPro Healthcare Permission Guard Component
 * AUTH-02 Implementation - React Permission Guard with Healthcare Context
 *
 * Features:
 * - React component for UI permission enforcement
 * - Healthcare-specific permission validation
 * - Emergency override capabilities
 * - Loading states and fallbacks
 * - Accessibility compliance
 * - Real-time permission updates
 */
"use client";
"use strict";
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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = PermissionGuard;
exports.ClinicalPermissionGuard = ClinicalPermissionGuard;
exports.AdministrativePermissionGuard = AdministrativePermissionGuard;
exports.CompliancePermissionGuard = CompliancePermissionGuard;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var use_permissions_1 = require("@/hooks/use-permissions");
var permissions_1 = require("@/lib/auth/permissions");
var utils_1 = require("@/lib/utils");
// ============================================================================
// PERMISSION GUARD COMPONENT
// ============================================================================
/**
 * Permission Guard Component with Healthcare Context
 */
function PermissionGuard(_a) {
  var _this = this;
  var permissions = _a.permissions,
    children = _a.children,
    fallback = _a.fallback,
    _b = _a.showLoading,
    showLoading = _b === void 0 ? true : _b,
    _c = _a.allowEmergencyOverride,
    allowEmergencyOverride = _c === void 0 ? false : _c,
    context = _a.context,
    ariaLabel = _a["aria-label"],
    ariaDescribedby = _a["aria-describedby"],
    className = _a.className,
    _d = _a.showDetails,
    showDetails = _d === void 0 ? false : _d,
    _e = _a.requireAll,
    requireAll = _e === void 0 ? true : _e,
    _f = _a.errorMessages,
    errorMessages = _f === void 0 ? {} : _f,
    onPermissionCheck = _a.onPermissionCheck,
    onEmergencyOverride = _a.onEmergencyOverride;
  var _g = (0, react_1.useState)(false),
    showEmergencyDialog = _g[0],
    setShowEmergencyDialog = _g[1];
  var _h = (0, react_1.useState)(""),
    emergencyPermission = _h[0],
    setEmergencyPermission = _h[1];
  // Normalize permissions to array
  var permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  // Use permissions hook
  var _j = (0, use_permissions_1.usePermissions)(),
    checkPermissions = _j.checkPermissions,
    userRole = _j.userRole,
    isLoading = _j.isLoading,
    hasEmergencyOverride = _j.hasEmergencyOverride,
    requestEmergencyOverride = _j.requestEmergencyOverride;
  var _k = (0, react_1.useState)([]),
    permissionResults = _k[0],
    setPermissionResults = _k[1];
  var _l = (0, react_1.useState)(true),
    isCheckingPermissions = _l[0],
    setIsCheckingPermissions = _l[1];
  // Check permissions on mount and when dependencies change
  var checkPermissionsAsync = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var results, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!permissionArray.length) {
                setIsCheckingPermissions(false);
                return [2 /*return*/];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsCheckingPermissions(true);
              return [4 /*yield*/, checkPermissions(permissionArray, context)];
            case 2:
              results = _a.sent();
              setPermissionResults(results);
              onPermissionCheck === null || onPermissionCheck === void 0
                ? void 0
                : onPermissionCheck(results);
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.error("Permission check error:", error_1);
              setPermissionResults([]);
              return [3 /*break*/, 5];
            case 4:
              setIsCheckingPermissions(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [permissionArray, context, checkPermissions, onPermissionCheck],
  );
  (0, react_1.useEffect)(
    function () {
      checkPermissionsAsync();
    },
    [checkPermissionsAsync],
  );
  // Determine if access is granted
  var isAccessGranted = (0, react_1.useCallback)(
    function () {
      if (permissionResults.length === 0) return false;
      return requireAll
        ? permissionResults.every(function (result) {
            return result.granted;
          })
        : permissionResults.some(function (result) {
            return result.granted;
          });
    },
    [permissionResults, requireAll],
  );
  // Handle emergency override request
  var handleEmergencyOverrideRequest = (0, react_1.useCallback)(
    function (permission) {
      if (!allowEmergencyOverride || !hasEmergencyOverride) return;
      setEmergencyPermission(permission);
      setShowEmergencyDialog(true);
    },
    [allowEmergencyOverride, hasEmergencyOverride],
  );
  // Handle emergency override confirmation
  var handleEmergencyOverrideConfirm = (0, react_1.useCallback)(
    function (reason) {
      return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [4 /*yield*/, requestEmergencyOverride(emergencyPermission, reason)];
            case 1:
              _a.sent();
              setShowEmergencyDialog(false);
              setEmergencyPermission("");
              onEmergencyOverride === null || onEmergencyOverride === void 0
                ? void 0
                : onEmergencyOverride(emergencyPermission);
              // Recheck permissions after override
              return [4 /*yield*/, checkPermissionsAsync()];
            case 2:
              // Recheck permissions after override
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_2 = _a.sent();
              console.error("Emergency override error:", error_2);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [emergencyPermission, requestEmergencyOverride, onEmergencyOverride, checkPermissionsAsync],
  );
  // Loading state
  if (isLoading || isCheckingPermissions) {
    return showLoading
      ? <div
          className={(0, utils_1.cn)("space-y-3", className)}
          aria-label={ariaLabel || "Checking permissions"}
          aria-describedby={ariaDescribedby}
        >
          <skeleton_1.Skeleton className="h-4 w-full" />
          <skeleton_1.Skeleton className="h-4 w-3/4" />
          <skeleton_1.Skeleton className="h-8 w-1/2" />
        </div>
      : null;
  }
  // Permission granted - show content
  if (isAccessGranted()) {
    return (
      <div className={className} aria-label={ariaLabel} aria-describedby={ariaDescribedby}>
        {children}
        {showDetails && (
          <PermissionDetails results={permissionResults} userRole={userRole} className="mt-4" />
        )}
      </div>
    );
  }
  // Permission denied - show fallback or default error
  var deniedResults = permissionResults.filter(function (result) {
    return !result.granted;
  });
  var hasLicenseIssue = deniedResults.some(function (result) {
    return !result.license_valid;
  });
  var hasSpecialtyIssue = deniedResults.some(function (result) {
    return !result.specialty_match;
  });
  var hasCFMIssue = deniedResults.some(function (result) {
    return !result.cfm_compliant;
  });
  // Custom fallback provided
  if (fallback) {
    return (
      <div
        className={className}
        aria-label={ariaLabel || "Access denied"}
        aria-describedby={ariaDescribedby}
      >
        {fallback}
        {showDetails && (
          <PermissionDetails results={permissionResults} userRole={userRole} className="mt-4" />
        )}
      </div>
    );
  }
  // Default permission denied UI
  return (
    <div
      className={(0, utils_1.cn)("max-w-md mx-auto", className)}
      aria-label={ariaLabel || "Access denied"}
      aria-describedby={ariaDescribedby}
    >
      <card_1.Card className="border-destructive/50">
        <card_1.CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <lucide_react_1.ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <card_1.CardTitle className="text-destructive">Acesso Negado</card_1.CardTitle>
          <card_1.CardDescription>
            {hasLicenseIssue && (errorMessages.license || "Licença médica requerida ou inválida")}
            {hasSpecialtyIssue &&
              (errorMessages.specialty || "Especialidade médica não autorizada")}
            {hasCFMIssue && "Registro CFM requerido"}
            {!hasLicenseIssue &&
              !hasSpecialtyIssue &&
              !hasCFMIssue &&
              (errorMessages.denied || "Você não tem permissão para acessar este recurso")}
          </card_1.CardDescription>
        </card_1.CardHeader>

        <card_1.CardContent className="space-y-4">
          {/* User context information */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <lucide_react_1.User className="w-4 h-4" />
            <span>Seu papel: {getRoleDisplayName(userRole)}</span>
          </div>

          {(context === null || context === void 0 ? void 0 : context.clinicId) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <lucide_react_1.Building className="w-4 h-4" />
              <span>Clínica: {context.clinicId}</span>
            </div>
          )}

          {/* Required permissions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Permissões necessárias:</p>
            <div className="flex flex-wrap gap-1">
              {deniedResults.map(function (result, index) {
                return (
                  <badge_1.Badge key={index} variant="destructive" className="text-xs">
                    {result.permission}
                  </badge_1.Badge>
                );
              })}
            </div>
          </div>

          {/* Emergency override option */}
          {allowEmergencyOverride && hasEmergencyOverride && (
            <alert_1.Alert className="border-warning">
              <lucide_react_1.AlertTriangle className="h-4 w-4" />
              <alert_1.AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm">
                    {errorMessages.emergency ||
                      "Em caso de emergência médica, você pode solicitar acesso temporário."}
                  </p>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={function () {
                      return handleEmergencyOverrideRequest(permissionArray[0]);
                    }}
                    className="w-full"
                  >
                    <lucide_react_1.Clock className="w-4 h-4 mr-2" />
                    Solicitar Acesso de Emergência
                  </button_1.Button>
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}

          {/* Permission details for debugging */}
          {showDetails && <PermissionDetails results={permissionResults} userRole={userRole} />}
        </card_1.CardContent>
      </card_1.Card>

      {/* Emergency Override Dialog */}
      <EmergencyOverrideDialog
        isOpen={showEmergencyDialog}
        onClose={function () {
          return setShowEmergencyDialog(false);
        }}
        onConfirm={handleEmergencyOverrideConfirm}
        permission={emergencyPermission}
        userRole={userRole}
      />
    </div>
  );
}
// ============================================================================
// EMERGENCY OVERRIDE DIALOG
// ============================================================================
function EmergencyOverrideDialog(_a) {
  var _this = this;
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    onConfirm = _a.onConfirm,
    permission = _a.permission,
    userRole = _a.userRole;
  var _b = (0, react_1.useState)(""),
    reason = _b[0],
    setReason = _b[1];
  var _c = (0, react_1.useState)(false),
    isConfirming = _c[0],
    setIsConfirming = _c[1];
  var handleConfirm = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!reason.trim()) return [2 /*return*/];
            setIsConfirming(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, , 3, 4]);
            return [4 /*yield*/, onConfirm(reason)];
          case 2:
            _a.sent();
            setReason("");
            return [3 /*break*/, 4];
          case 3:
            setIsConfirming(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <card_1.Card className="w-full max-w-md">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-warning">
            <lucide_react_1.AlertTriangle className="w-5 h-5" />
            Acesso de Emergência
          </card_1.CardTitle>
          <card_1.CardDescription>
            Você está solicitando acesso de emergência para: <strong>{permission}</strong>
          </card_1.CardDescription>
        </card_1.CardHeader>

        <card_1.CardContent className="space-y-4">
          <div>
            <label htmlFor="emergency-reason" className="block text-sm font-medium mb-2">
              Justificativa da Emergência *
            </label>
            <textarea
              id="emergency-reason"
              value={reason}
              onChange={function (e) {
                return setReason(e.target.value);
              }}
              placeholder="Descreva a situação de emergência que justifica este acesso..."
              className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <alert_1.Alert className="border-warning bg-warning/5">
            <lucide_react_1.Shield className="h-4 w-4" />
            <alert_1.AlertDescription>
              <strong>Aviso:</strong> Este acesso será registrado em auditoria e notificará
              automaticamente a supervisão médica e o setor de compliance.
            </alert_1.AlertDescription>
          </alert_1.Alert>

          <div className="flex gap-2 justify-end">
            <button_1.Button variant="outline" onClick={onClose} disabled={isConfirming}>
              Cancelar
            </button_1.Button>
            <button_1.Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!reason.trim() || isConfirming}
            >
              {isConfirming ? "Processando..." : "Confirmar Emergência"}
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
// ============================================================================
// PERMISSION DETAILS COMPONENT
// ============================================================================
function PermissionDetails(_a) {
  var results = _a.results,
    userRole = _a.userRole,
    className = _a.className;
  return (
    <card_1.Card className={(0, utils_1.cn)("border-muted", className)}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-sm">Detalhes das Permissões</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        <div className="text-xs space-y-1">
          <p>
            <strong>Papel do Usuário:</strong> {getRoleDisplayName(userRole)}
          </p>
          <p>
            <strong>Verificações Realizadas:</strong> {results.length}
          </p>
        </div>

        <div className="space-y-2">
          {results.map(function (result, index) {
            return (
              <div key={index} className="border rounded p-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.permission}</span>
                  <badge_1.Badge variant={result.granted ? "success" : "destructive"}>
                    {result.granted ? "Concedida" : "Negada"}
                  </badge_1.Badge>
                </div>

                <p className="text-muted-foreground">{result.reason}</p>

                <div className="flex gap-2 flex-wrap">
                  <badge_1.Badge
                    variant={result.license_valid ? "success" : "destructive"}
                    className="text-xs"
                  >
                    Licença: {result.license_valid ? "Válida" : "Inválida"}
                  </badge_1.Badge>
                  <badge_1.Badge
                    variant={result.specialty_match ? "success" : "destructive"}
                    className="text-xs"
                  >
                    Especialidade: {result.specialty_match ? "OK" : "Incompatível"}
                  </badge_1.Badge>
                  <badge_1.Badge
                    variant={result.cfm_compliant ? "success" : "destructive"}
                    className="text-xs"
                  >
                    CFM: {result.cfm_compliant ? "Conforme" : "Não conforme"}
                  </badge_1.Badge>
                </div>

                {result.emergency_override && (
                  <badge_1.Badge variant="warning" className="text-xs">
                    Acesso de Emergência Ativo
                  </badge_1.Badge>
                )}
              </div>
            );
          })}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getRoleDisplayName(role) {
  var _a;
  var roleNames =
    ((_a = {}),
    (_a[permissions_1.HealthcareRole.SUPER_ADMIN] = "Super Administrador"),
    (_a[permissions_1.HealthcareRole.SYSTEM_ADMIN] = "Administrador do Sistema"),
    (_a[permissions_1.HealthcareRole.MEDICAL_DIRECTOR] = "Diretor Médico"),
    (_a[permissions_1.HealthcareRole.CLINICAL_COORDINATOR] = "Coordenador Clínico"),
    (_a[permissions_1.HealthcareRole.DOCTOR_SPECIALIST] = "Médico Especialista"),
    (_a[permissions_1.HealthcareRole.DOCTOR_GENERAL] = "Médico Clínico Geral"),
    (_a[permissions_1.HealthcareRole.RESIDENT_DOCTOR] = "Médico Residente"),
    (_a[permissions_1.HealthcareRole.NURSE_MANAGER] = "Coordenador de Enfermagem"),
    (_a[permissions_1.HealthcareRole.REGISTERED_NURSE] = "Enfermeiro"),
    (_a[permissions_1.HealthcareRole.NURSING_TECHNICIAN] = "Técnico de Enfermagem"),
    (_a[permissions_1.HealthcareRole.PHYSIOTHERAPIST] = "Fisioterapeuta"),
    (_a[permissions_1.HealthcareRole.PSYCHOLOGIST] = "Psicólogo"),
    (_a[permissions_1.HealthcareRole.NUTRITIONIST] = "Nutricionista"),
    (_a[permissions_1.HealthcareRole.PHARMACIST] = "Farmacêutico"),
    (_a[permissions_1.HealthcareRole.RADIOLOGY_TECHNICIAN] = "Técnico em Radiologia"),
    (_a[permissions_1.HealthcareRole.LAB_TECHNICIAN] = "Técnico de Laboratório"),
    (_a[permissions_1.HealthcareRole.EQUIPMENT_TECHNICIAN] = "Técnico de Equipamentos"),
    (_a[permissions_1.HealthcareRole.ADMIN_MANAGER] = "Gerente Administrativo"),
    (_a[permissions_1.HealthcareRole.RECEPTIONIST] = "Recepcionista"),
    (_a[permissions_1.HealthcareRole.BILLING_SPECIALIST] = "Especialista em Faturamento"),
    (_a[permissions_1.HealthcareRole.SECRETARY] = "Secretária"),
    (_a[permissions_1.HealthcareRole.COMPLIANCE_OFFICER] = "Oficial de Compliance"),
    (_a[permissions_1.HealthcareRole.AUDITOR] = "Auditor"),
    (_a[permissions_1.HealthcareRole.QUALITY_MANAGER] = "Gerente de Qualidade"),
    (_a[permissions_1.HealthcareRole.PATIENT] = "Paciente"),
    (_a[permissions_1.HealthcareRole.PATIENT_FAMILY] = "Familiar do Paciente"),
    (_a[permissions_1.HealthcareRole.GUEST] = "Visitante"),
    (_a[permissions_1.HealthcareRole.VENDOR] = "Fornecedor"),
    _a);
  return roleNames[role] || role;
}
// ============================================================================
// SPECIALIZED PERMISSION GUARDS
// ============================================================================
/**
 * Clinical Permission Guard - For medical procedures and patient care
 */
function ClinicalPermissionGuard(_a) {
  var children = _a.children,
    patientId = _a.patientId,
    _b = _a.allowEmergencyOverride,
    allowEmergencyOverride = _b === void 0 ? true : _b,
    props = __rest(_a, ["children", "patientId", "allowEmergencyOverride"]);
  return (
    <PermissionGuard
      permissions={props.permissions || ["patient.read.own", "procedure.perform.general"]}
      allowEmergencyOverride={allowEmergencyOverride}
      context={__assign({ patientId: patientId }, props.context)}
      errorMessages={{
        denied: "Acesso negado para informações clínicas",
        license: "Licença médica válida requerida para acesso clínico",
        specialty: "Especialidade médica não autorizada para este procedimento",
        emergency: "Em emergências médicas, solicite acesso temporário para atendimento",
      }}
      {...props}
    >
      {children}
    </PermissionGuard>
  );
}
/**
 * Administrative Permission Guard - For non-clinical operations
 */
function AdministrativePermissionGuard(_a) {
  var children = _a.children,
    props = __rest(_a, ["children"]);
  return (
    <PermissionGuard
      permissions={props.permissions || ["scheduling.manage.clinic", "billing.process.standard"]}
      allowEmergencyOverride={false}
      errorMessages={{
        denied: "Acesso negado para operações administrativas",
        license: "Credenciais administrativas requeridas",
        specialty: "Papel administrativo não autorizado",
        emergency: "Contate seu supervisor para acesso administrativo",
      }}
      {...props}
    >
      {children}
    </PermissionGuard>
  );
}
/**
 * Compliance Permission Guard - For audit and compliance access
 */
function CompliancePermissionGuard(_a) {
  var children = _a.children,
    props = __rest(_a, ["children"]);
  return (
    <PermissionGuard
      permissions={props.permissions || ["audit.access.clinic", "compliance.report.cfm"]}
      allowEmergencyOverride={false}
      errorMessages={{
        denied: "Acesso negado para informações de compliance",
        license: "Autorização de compliance requerida",
        specialty: "Papel de compliance não autorizado",
        emergency: "Acesso de emergência não disponível para compliance",
      }}
      showDetails={true}
      {...props}
    >
      {children}
    </PermissionGuard>
  );
}
exports.default = PermissionGuard;
