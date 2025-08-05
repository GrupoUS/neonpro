/**
 * Multi-Factor Authentication Verification Component
 *
 * Comprehensive MFA verification interface for login and sensitive operations
 * with healthcare compliance and emergency bypass features.
 *
 * Features:
 * - TOTP token verification
 * - SMS fallback with resend capability
 * - Backup code recovery
 * - Emergency bypass for clinical emergencies
 * - Device trust management
 * - Rate limiting and account lockout handling
 * - Accessibility (WCAG 2.1 AA+)
 * - Multi-language support (PT/EN)
 * - Real-time validation and feedback
 *
 * @version 1.0.0
 * @author NeonPro Development Team
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
exports.MFAVerify = MFAVerify;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var checkbox_1 = require("@/components/ui/checkbox");
var use_toast_1 = require("@/components/ui/use-toast");
var use_mfa_1 = require("@/hooks/use-mfa");
var auth_1 = require("@/types/auth");
var utils_1 = require("@/lib/utils");
// Timer intervals
var SMS_RESEND_COOLDOWN = 60; // seconds
var LOCKOUT_CHECK_INTERVAL = 1000; // 1 second
/**
 * MFA Verification Component with comprehensive security features
 */
function MFAVerify(_a) {
  var userId = _a.userId,
    methods = _a.methods,
    onVerificationSuccess = _a.onVerificationSuccess,
    onVerificationError = _a.onVerificationError,
    _b = _a.allowEmergencyBypass,
    allowEmergencyBypass = _b === void 0 ? false : _b,
    _c = _a.showTrustedDeviceOption,
    showTrustedDeviceOption = _c === void 0 ? true : _c,
    className = _a.className,
    _d = _a.theme,
    theme = _d === void 0 ? "light" : _d,
    _e = _a.locale,
    locale = _e === void 0 ? "pt-BR" : _e;
  // Translations
  var t = useTranslations(locale);
  // MFA hook
  var _f = (0, use_mfa_1.useMFA)({ userId: userId }),
    mfaSettings = _f.mfaSettings,
    verifyMFA = _f.verifyMFA,
    sendSMSOTP = _f.sendSMSOTP,
    isLoading = _f.isLoading,
    error = _f.error;
  // Component state
  var _g = (0, react_1.useState)({
      selectedMethod: methods.includes("totp") ? "totp" : methods[0] || "totp",
      token: "",
      isVerifying: false,
      remainingAttempts: 5,
      smsCountdown: 0,
      canResendSMS: true,
      showEmergencyBypass: false,
      emergencyReason: "",
      trustDevice: false,
      showBackupCodeInput: false,
    }),
    state = _g[0],
    setState = _g[1];
  // Refs for cleanup
  var smsTimerRef = (0, react_1.useRef)();
  var lockoutTimerRef = (0, react_1.useRef)();
  /**
   * Handle method selection
   */
  var handleMethodChange = (0, react_1.useCallback)((method) => {
    setState((prev) =>
      __assign(__assign({}, prev), {
        selectedMethod: method,
        token: "",
        showBackupCodeInput: method === "backup",
      }),
    );
  }, []);
  /**
   * Handle token input change with validation
   */
  var handleTokenChange = (0, react_1.useCallback)(
    (value) => {
      // Format token based on method
      var formattedValue = value;
      if (state.selectedMethod === "backup") {
        // Backup codes: allow alphanumeric, format as XXXX-XXXX-XX
        formattedValue = value.toUpperCase().replace(/[^A-F0-9]/g, "");
        if (formattedValue.length > 10) {
          formattedValue = formattedValue.slice(0, 10);
        }
        // Add hyphens for readability
        if (formattedValue.length > 4 && formattedValue.length <= 8) {
          formattedValue = formattedValue.slice(0, 4) + "-" + formattedValue.slice(4);
        } else if (formattedValue.length > 8) {
          formattedValue =
            formattedValue.slice(0, 4) +
            "-" +
            formattedValue.slice(4, 8) +
            "-" +
            formattedValue.slice(8);
        }
      } else {
        // TOTP/SMS: only digits, max 6 characters
        formattedValue = value.replace(/\D/g, "").slice(0, 6);
      }
      setState((prev) => __assign(__assign({}, prev), { token: formattedValue }));
    },
    [state.selectedMethod],
  );
  /**
   * Send SMS OTP
   */
  var handleSendSMS = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var err_1, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, sendSMSOTP()];
            case 1:
              _a.sent();
              // Start countdown
              setState((prev) =>
                __assign(__assign({}, prev), {
                  smsCountdown: SMS_RESEND_COOLDOWN,
                  canResendSMS: false,
                }),
              );
              // Start countdown timer
              smsTimerRef.current = setInterval(() => {
                setState((prev) => {
                  if (prev.smsCountdown <= 1) {
                    return __assign(__assign({}, prev), { smsCountdown: 0, canResendSMS: true });
                  }
                  return __assign(__assign({}, prev), { smsCountdown: prev.smsCountdown - 1 });
                });
              }, 1000);
              (0, use_toast_1.toast)({
                title: t.success.smsSent,
                description: t.success.smsSentDescription,
              });
              return [3 /*break*/, 3];
            case 2:
              err_1 = _a.sent();
              error_1 = err_1 instanceof auth_1.MFAError ? err_1 : new Error(t.errors.smsFailure);
              (0, use_toast_1.toast)({
                title: t.errors.smsFailure,
                description: error_1.message,
                variant: "destructive",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [sendSMSOTP, t],
  );
  /**
   * Verify MFA token
   */
  var handleVerify = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var cleanToken, result_1, _a, _b, err_2, error_2;
        var _c;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              if (!state.token.trim()) {
                (0, use_toast_1.toast)({
                  title: t.errors.tokenRequired,
                  description: t.errors.tokenRequiredDescription,
                  variant: "destructive",
                });
                return [2 /*return*/];
              }
              setState((prev) => __assign(__assign({}, prev), { isVerifying: true }));
              _d.label = 1;
            case 1:
              _d.trys.push([1, 7, 8, 9]);
              cleanToken =
                state.selectedMethod === "backup" ? state.token.replace(/-/g, "") : state.token;
              _a = verifyMFA;
              _c = {
                userId: userId,
                token: cleanToken,
                method: state.selectedMethod,
                userAgent: navigator.userAgent,
              };
              return [4 /*yield*/, getUserIpAddress()];
            case 2:
              _c.ipAddress = _d.sent();
              if (!state.trustDevice) return [3 /*break*/, 4];
              return [4 /*yield*/, getDeviceFingerprint()];
            case 3:
              _b = _d.sent();
              return [3 /*break*/, 5];
            case 4:
              _b = undefined;
              _d.label = 5;
            case 5:
              return [4 /*yield*/, _a.apply(void 0, [((_c.deviceFingerprint = _b), _c)])];
            case 6:
              result_1 = _d.sent();
              // Update remaining attempts
              setState((prev) =>
                __assign(__assign({}, prev), {
                  remainingAttempts: result_1.remainingAttempts,
                  lockedUntil: result_1.lockedUntil,
                }),
              );
              if (result_1.isValid) {
                onVerificationSuccess(result_1);
                (0, use_toast_1.toast)({
                  title: t.success.verificationSuccess,
                  description: result_1.isEmergencyBypass
                    ? t.success.emergencyBypassSuccess
                    : t.success.verificationSuccessDescription,
                });
              } else if (result_1.lockedUntil) {
                // Handle account lockout
                setState((prev) =>
                  __assign(__assign({}, prev), { lockedUntil: result_1.lockedUntil }),
                );
                (0, use_toast_1.toast)({
                  title: t.errors.accountLocked,
                  description: t.errors.accountLockedDescription.replace(
                    "{time}",
                    result_1.lockedUntil.toLocaleTimeString(locale),
                  ),
                  variant: "destructive",
                });
              } else {
                (0, use_toast_1.toast)({
                  title: t.errors.invalidToken,
                  description: t.errors.invalidTokenDescription.replace(
                    "{attempts}",
                    result_1.remainingAttempts.toString(),
                  ),
                  variant: "destructive",
                });
              }
              return [3 /*break*/, 9];
            case 7:
              err_2 = _d.sent();
              error_2 =
                err_2 instanceof auth_1.MFAError ? err_2 : new Error(t.errors.verificationFailed);
              onVerificationError(error_2);
              (0, use_toast_1.toast)({
                title: t.errors.verificationFailed,
                description: error_2.message,
                variant: "destructive",
              });
              return [3 /*break*/, 9];
            case 8:
              setState((prev) => __assign(__assign({}, prev), { isVerifying: false }));
              return [7 /*endfinally*/];
            case 9:
              return [2 /*return*/];
          }
        });
      }),
    [
      state.token,
      state.selectedMethod,
      state.trustDevice,
      userId,
      verifyMFA,
      onVerificationSuccess,
      onVerificationError,
      locale,
      t,
    ],
  );
  /**
   * Handle emergency bypass request
   */
  var handleEmergencyBypass = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var result, _a, err_3, error_3;
        var _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              if (!state.emergencyReason.trim()) {
                (0, use_toast_1.toast)({
                  title: t.errors.emergencyReasonRequired,
                  description: t.errors.emergencyReasonRequiredDescription,
                  variant: "destructive",
                });
                return [2 /*return*/];
              }
              setState((prev) => __assign(__assign({}, prev), { isVerifying: true }));
              _c.label = 1;
            case 1:
              _c.trys.push([1, 4, 5, 6]);
              _a = verifyMFA;
              _b = {
                userId: userId,
                token: "000000", // Placeholder for emergency bypass
                method: "emergency",
                userAgent: navigator.userAgent,
              };
              return [4 /*yield*/, getUserIpAddress()];
            case 2:
              return [
                4 /*yield*/,
                _a.apply(void 0, [
                  ((_b.ipAddress = _c.sent()),
                  (_b.emergencyBypass = true),
                  (_b.emergencyReason = state.emergencyReason),
                  _b),
                ]),
              ];
            case 3:
              result = _c.sent();
              if (result.isValid && result.isEmergencyBypass) {
                onVerificationSuccess(result);
                (0, use_toast_1.toast)({
                  title: t.success.emergencyBypassSuccess,
                  description: t.success.emergencyBypassSuccessDescription,
                  variant: "default",
                });
              }
              return [3 /*break*/, 6];
            case 4:
              err_3 = _c.sent();
              error_3 =
                err_3 instanceof auth_1.MFAError
                  ? err_3
                  : new Error(t.errors.emergencyBypassFailed);
              (0, use_toast_1.toast)({
                title: t.errors.emergencyBypassFailed,
                description: error_3.message,
                variant: "destructive",
              });
              return [3 /*break*/, 6];
            case 5:
              setState((prev) => __assign(__assign({}, prev), { isVerifying: false }));
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [state.emergencyReason, userId, verifyMFA, onVerificationSuccess, t],
  );
  /**
   * Check if token is valid format
   */
  var isValidTokenFormat = (0, react_1.useCallback)(() => {
    if (state.selectedMethod === "backup") {
      return state.token.replace(/-/g, "").length === 10;
    }
    return state.token.length === 6;
  }, [state.token, state.selectedMethod]);
  /**
   * Check if account is currently locked
   */
  var isAccountLocked = state.lockedUntil && new Date() < state.lockedUntil;
  /**
   * Calculate lockout countdown
   */
  var lockoutSecondsRemaining = state.lockedUntil
    ? Math.max(0, Math.ceil((state.lockedUntil.getTime() - Date.now()) / 1000))
    : 0;
  // Setup lockout timer
  (0, react_1.useEffect)(() => {
    if (state.lockedUntil && new Date() < state.lockedUntil) {
      lockoutTimerRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev.lockedUntil || new Date() >= prev.lockedUntil) {
            return __assign(__assign({}, prev), { lockedUntil: undefined });
          }
          return prev;
        });
      }, LOCKOUT_CHECK_INTERVAL);
      return () => {
        if (lockoutTimerRef.current) {
          clearInterval(lockoutTimerRef.current);
        }
      };
    }
  }, [state.lockedUntil]);
  // Cleanup timers on unmount
  (0, react_1.useEffect)(
    () => () => {
      if (smsTimerRef.current) {
        clearInterval(smsTimerRef.current);
      }
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
      }
    },
    [],
  );
  // Auto-send SMS if it's the only method available
  (0, react_1.useEffect)(() => {
    if (methods.length === 1 && methods[0] === "sms" && state.canResendSMS) {
      handleSendSMS();
    }
  }, [methods, state.canResendSMS, handleSendSMS]);
  return (
    <div className={(0, utils_1.cn)("w-full max-w-md mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <lucide_react_1.Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.description}</p>
      </div>

      {/* Account Lockout Warning */}
      {isAccountLocked && (
        <alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.Lock className="h-4 w-4" />
          <alert_1.AlertDescription>
            <div className="space-y-2">
              <p>{t.warnings.accountLocked}</p>
              <div className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4" />
                <span className="font-mono">
                  {Math.floor(lockoutSecondsRemaining / 60)}:
                  {(lockoutSecondsRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Error Display */}
      {error && !isAccountLocked && (
        <alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>{error.message}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Remaining Attempts Warning */}
      {state.remainingAttempts <= 2 && state.remainingAttempts > 0 && !isAccountLocked && (
        <alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>
            {t.warnings.fewAttemptsLeft.replace("{count}", state.remainingAttempts.toString())}
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      <card_1.Card>
        <card_1.CardContent className="p-6">
          {/* Method Selection */}
          {methods.length > 1 && (
            <div className="mb-6">
              <label_1.Label className="text-sm font-medium mb-3 block">
                {t.methodSelection}
              </label_1.Label>
              <tabs_1.Tabs value={state.selectedMethod} onValueChange={handleMethodChange}>
                <tabs_1.TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                  {methods.includes("totp") && (
                    <tabs_1.TabsTrigger value="totp" className="flex items-center gap-1 text-xs">
                      <lucide_react_1.Smartphone className="h-3 w-3" />
                      {t.methods.totp}
                    </tabs_1.TabsTrigger>
                  )}
                  {methods.includes("sms") && (
                    <tabs_1.TabsTrigger value="sms" className="flex items-center gap-1 text-xs">
                      <lucide_react_1.Phone className="h-3 w-3" />
                      {t.methods.sms}
                    </tabs_1.TabsTrigger>
                  )}
                  {methods.includes("backup") && (
                    <tabs_1.TabsTrigger value="backup" className="flex items-center gap-1 text-xs">
                      <lucide_react_1.Key className="h-3 w-3" />
                      {t.methods.backup}
                    </tabs_1.TabsTrigger>
                  )}
                </tabs_1.TabsList>
              </tabs_1.Tabs>
            </div>
          )}

          {/* Token Input Section */}
          <div className="space-y-4">
            {/* TOTP Method */}
            {state.selectedMethod === "totp" && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <lucide_react_1.Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{t.instructions.totp}</p>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="totp-token">{t.tokenLabel}</label_1.Label>
                  <input_1.Input
                    id="totp-token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="123456"
                    value={state.token}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    disabled={isAccountLocked || state.isVerifying}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* SMS Method */}
            {state.selectedMethod === "sms" && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <lucide_react_1.Phone className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-green-700 dark:text-green-300">{t.instructions.sms}</p>
                </div>

                {/* SMS Resend */}
                <div className="flex justify-center">
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendSMS}
                    disabled={!state.canResendSMS || isAccountLocked}
                    className="flex items-center gap-2"
                  >
                    <lucide_react_1.RefreshCw className="h-4 w-4" />
                    {state.canResendSMS
                      ? t.buttons.resendSMS
                      : "".concat(t.buttons.resendIn, " ").concat(state.smsCountdown, "s")}
                  </button_1.Button>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="sms-token">{t.tokenLabel}</label_1.Label>
                  <input_1.Input
                    id="sms-token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="123456"
                    value={state.token}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    disabled={isAccountLocked || state.isVerifying}
                  />
                </div>
              </div>
            )}

            {/* Backup Code Method */}
            {state.selectedMethod === "backup" && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <lucide_react_1.Key className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t.instructions.backup}
                  </p>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="backup-token">{t.backupCodeLabel}</label_1.Label>
                  <input_1.Input
                    id="backup-token"
                    type="text"
                    placeholder="XXXX-XXXX-XX"
                    value={state.token}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    className="text-center text-xl font-mono tracking-widest"
                    disabled={isAccountLocked || state.isVerifying}
                  />
                  <p className="text-xs text-gray-500">{t.backupCodeHelp}</p>
                </div>
              </div>
            )}

            {/* Trust Device Option */}
            {showTrustedDeviceOption && !isAccountLocked && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <checkbox_1.Checkbox
                  id="trustDevice"
                  checked={state.trustDevice}
                  onCheckedChange={(checked) =>
                    setState((prev) => __assign(__assign({}, prev), { trustDevice: !!checked }))
                  }
                />
                <div className="space-y-1">
                  <label_1.Label htmlFor="trustDevice" className="text-sm font-medium">
                    {t.trustDevice.label}
                  </label_1.Label>
                  <p className="text-xs text-gray-500">{t.trustDevice.description}</p>
                </div>
              </div>
            )}

            {/* Verify Button */}
            <button_1.Button
              onClick={handleVerify}
              disabled={!isValidTokenFormat() || state.isVerifying || isAccountLocked}
              className="w-full"
              size="lg"
            >
              {state.isVerifying
                ? <>
                    <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t.buttons.verifying}
                  </>
                : <>
                    <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
                    {t.buttons.verify}
                  </>}
            </button_1.Button>

            {/* Emergency Bypass Section */}
            {allowEmergencyBypass && !isAccountLocked && (
              <div className="mt-6 pt-6 border-t">
                {!state.showEmergencyBypass
                  ? <button_1.Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setState((prev) =>
                          __assign(__assign({}, prev), { showEmergencyBypass: true }),
                        )
                      }
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <lucide_react_1.Zap className="h-4 w-4 mr-2" />
                      {t.emergency.access}
                    </button_1.Button>
                  : <div className="space-y-4">
                      <alert_1.Alert variant="destructive">
                        <lucide_react_1.AlertTriangle className="h-4 w-4" />
                        <alert_1.AlertDescription>{t.emergency.warning}</alert_1.AlertDescription>
                      </alert_1.Alert>

                      <div className="space-y-2">
                        <label_1.Label htmlFor="emergencyReason">
                          {t.emergency.reasonLabel}
                        </label_1.Label>
                        <input_1.Input
                          id="emergencyReason"
                          type="text"
                          placeholder={t.emergency.reasonPlaceholder}
                          value={state.emergencyReason}
                          onChange={(e) =>
                            setState((prev) =>
                              __assign(__assign({}, prev), {
                                emergencyReason: e.target.value,
                              }),
                            )
                          }
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500">{t.emergency.reasonHelp}</p>
                      </div>

                      <div className="flex gap-2">
                        <button_1.Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setState((prev) =>
                              __assign(__assign({}, prev), {
                                showEmergencyBypass: false,
                                emergencyReason: "",
                              }),
                            )
                          }
                          className="flex-1"
                        >
                          {t.buttons.cancel}
                        </button_1.Button>
                        <button_1.Button
                          variant="destructive"
                          size="sm"
                          onClick={handleEmergencyBypass}
                          disabled={!state.emergencyReason.trim() || state.isVerifying}
                          className="flex-1"
                        >
                          <lucide_react_1.Zap className="h-4 w-4 mr-2" />
                          {t.emergency.request}
                        </button_1.Button>
                      </div>
                    </div>}
              </div>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Healthcare Compliance Footer */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <lucide_react_1.Shield className="h-4 w-4" />
          <span>{t.compliance.footer}</span>
        </div>
      </div>
    </div>
  );
}
/**
 * Utility functions
 */
function getUserIpAddress() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      try {
        return [2 /*return*/, "0.0.0.0"];
      } catch (_b) {
        return [2 /*return*/, "0.0.0.0"];
      }
      return [2 /*return*/];
    });
  });
}
function getDeviceFingerprint() {
  return __awaiter(this, void 0, void 0, function () {
    var fingerprint, encoder, data, hashBuffer, hashArray;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: "".concat(screen.width, "x").concat(screen.height),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          encoder = new TextEncoder();
          data = encoder.encode(JSON.stringify(fingerprint));
          return [4 /*yield*/, crypto.subtle.digest("SHA-256", data)];
        case 1:
          hashBuffer = _a.sent();
          hashArray = Array.from(new Uint8Array(hashBuffer));
          return [2 /*return*/, hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")];
      }
    });
  });
}
/**
 * Translations hook
 */
function useTranslations(locale) {
  var translations = {
    "pt-BR": {
      title: "Verificação de Segurança",
      description: "Digite seu código de verificação para continuar.",
      methodSelection: "Escolha o método de verificação:",
      methods: {
        totp: "App",
        sms: "SMS",
        backup: "Backup",
      },
      instructions: {
        totp: "Abra seu app autenticador e digite o código de 6 dígitos.",
        sms: "Digite o código de 6 dígitos enviado por SMS.",
        backup: "Digite um dos seus códigos de backup salvos.",
      },
      tokenLabel: "Código de Verificação",
      backupCodeLabel: "Código de Backup",
      backupCodeHelp: "Cada código só pode ser usado uma vez.",
      trustDevice: {
        label: "Confiar neste dispositivo por 30 dias",
        description: "Você não precisará inserir MFA neste dispositivo pelos próximos 30 dias.",
      },
      emergency: {
        access: "Acesso de Emergência Clínica",
        warning: "EMERGÊNCIA: Use apenas para situações clínicas críticas.",
        reasonLabel: "Motivo da Emergência",
        reasonPlaceholder: "Ex: Emergência médica - paciente crítico",
        reasonHelp: "Descreva brevemente a situação de emergência clínica.",
        request: "Solicitar Acesso",
      },
      buttons: {
        verify: "Verificar",
        verifying: "Verificando...",
        resendSMS: "Reenviar SMS",
        resendIn: "Reenviar em",
        cancel: "Cancelar",
      },
      warnings: {
        accountLocked: "Conta temporariamente bloqueada por segurança.",
        fewAttemptsLeft: "Atenção: Restam apenas {count} tentativas.",
      },
      success: {
        verificationSuccess: "Verificação bem-sucedida!",
        verificationSuccessDescription: "Acesso autorizado com segurança.",
        emergencyBypassSuccess: "Acesso de emergência autorizado",
        emergencyBypassSuccessDescription: "Acesso liberado para emergência clínica.",
        smsSent: "SMS enviado",
        smsSentDescription: "Código de verificação enviado por SMS.",
      },
      errors: {
        tokenRequired: "Código obrigatório",
        tokenRequiredDescription: "Digite o código de verificação.",
        invalidToken: "Código inválido",
        invalidTokenDescription: "Código incorreto. Restam {attempts} tentativas.",
        verificationFailed: "Verificação falhou",
        accountLocked: "Conta bloqueada",
        accountLockedDescription: "Muitas tentativas incorretas. Tente novamente às {time}.",
        smsFailure: "Erro ao enviar SMS",
        emergencyReasonRequired: "Motivo obrigatório",
        emergencyReasonRequiredDescription: "Descreva o motivo da emergência clínica.",
        emergencyBypassFailed: "Acesso de emergência negado",
      },
      compliance: {
        footer: "Protocolo de segurança conforme LGPD, ANVISA e CFM",
      },
    },
    "en-US": __assign({}, {}),
  };
  return translations[locale];
}
exports.default = MFAVerify;
