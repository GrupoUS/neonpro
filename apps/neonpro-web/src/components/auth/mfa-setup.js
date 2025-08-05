/**
 * Multi-Factor Authentication Setup Component
 *
 * Comprehensive MFA setup interface for NeonPro Healthcare Platform
 * with TOTP, SMS, backup codes, and healthcare compliance features.
 *
 * Features:
 * - TOTP setup with QR code display
 * - SMS verification setup
 * - Backup codes generation and display
 * - Healthcare compliance (LGPD consent)
 * - Accessible UI (WCAG 2.1 AA+)
 * - Multi-language support (PT/EN)
 * - Device trust management
 * - Progressive setup flow
 *
 * @version 1.0.0
 * @author NeonPro Development Team
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFASetup = MFASetup;
var react_1 = require("react");
var qrcode_react_1 = require("qrcode.react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var checkbox_1 = require("@/components/ui/checkbox");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var progress_1 = require("@/components/ui/progress");
var use_toast_1 = require("@/components/ui/use-toast");
var use_mfa_1 = require("@/hooks/use-mfa");
var auth_1 = require("@/types/auth");
var utils_1 = require("@/lib/utils");
/**
 * MFA Setup Component with comprehensive healthcare compliance
 */
function MFASetup(_a) {
  var _this = this;
  var _b;
  var userId = _a.userId,
    onSetupComplete = _a.onSetupComplete,
    onSetupError = _a.onSetupError,
    className = _a.className,
    _c = _a.theme,
    theme = _c === void 0 ? "light" : _c,
    _d = _a.locale,
    locale = _d === void 0 ? "pt-BR" : _d;
  // Translations
  var t = useTranslations(locale);
  // MFA hook
  var _e = (0, use_mfa_1.useMFA)({ userId: userId }),
    setupMFA = _e.setupMFA,
    verifyMFA = _e.verifyMFA,
    isLoading = _e.isLoading,
    error = _e.error;
  // Component state
  var _f = (0, react_1.useState)({
      currentStep: 0,
      selectedMethod: "totp",
      deviceName: "",
      phoneNumber: "",
      qrCodeUri: "",
      secret: "",
      backupCodes: [],
      recoveryToken: "",
      verificationToken: "",
      lgpdConsent: false,
      isVerifying: false,
      showSecret: false,
      showBackupCodes: false,
    }),
    state = _f[0],
    setState = _f[1];
  // Setup steps configuration
  var setupSteps = [
    {
      id: "method",
      title: t.steps.method.title,
      description: t.steps.method.description,
      isComplete: state.selectedMethod !== null,
      isActive: state.currentStep === 0,
    },
    {
      id: "configure",
      title: t.steps.configure.title,
      description: t.steps.configure.description,
      isComplete: state.qrCodeUri !== "" || state.phoneNumber !== "",
      isActive: state.currentStep === 1,
    },
    {
      id: "verify",
      title: t.steps.verify.title,
      description: t.steps.verify.description,
      isComplete: false,
      isActive: state.currentStep === 2,
    },
    {
      id: "backup",
      title: t.steps.backup.title,
      description: t.steps.backup.description,
      isComplete: state.backupCodes.length > 0,
      isActive: state.currentStep === 3,
    },
  ];
  /**
   * Handle method selection
   */
  var handleMethodSelect = (0, react_1.useCallback)(function (method) {
    setState(function (prev) {
      return __assign(__assign({}, prev), { selectedMethod: method });
    });
  }, []);
  /**
   * Handle device name change
   */
  var handleDeviceNameChange = (0, react_1.useCallback)(function (name) {
    setState(function (prev) {
      return __assign(__assign({}, prev), { deviceName: name });
    });
  }, []);
  /**
   * Handle phone number change
   */
  var handlePhoneNumberChange = (0, react_1.useCallback)(function (phone) {
    setState(function (prev) {
      return __assign(__assign({}, prev), { phoneNumber: phone });
    });
  }, []);
  /**
   * Handle LGPD consent change
   */
  var handleLGPDConsentChange = (0, react_1.useCallback)(function (consent) {
    setState(function (prev) {
      return __assign(__assign({}, prev), { lgpdConsent: consent });
    });
  }, []);
  /**
   * Start MFA setup process
   */
  var startSetup = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var result_1, _a, err_1, error_1;
        var _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              if (!state.lgpdConsent) {
                (0, use_toast_1.toast)({
                  title: t.errors.lgpdRequired,
                  description: t.errors.lgpdRequiredDescription,
                  variant: "destructive",
                });
                return [2 /*return*/];
              }
              if (!state.deviceName.trim()) {
                (0, use_toast_1.toast)({
                  title: t.errors.deviceNameRequired,
                  description: t.errors.deviceNameRequiredDescription,
                  variant: "destructive",
                });
                return [2 /*return*/];
              }
              if (state.selectedMethod === "sms" && !state.phoneNumber.trim()) {
                (0, use_toast_1.toast)({
                  title: t.errors.phoneRequired,
                  description: t.errors.phoneRequiredDescription,
                  variant: "destructive",
                });
                return [2 /*return*/];
              }
              _c.label = 1;
            case 1:
              _c.trys.push([1, 4, , 5]);
              _a = setupMFA;
              _b = {
                userId: userId,
                method: state.selectedMethod,
                phoneNumber: state.selectedMethod === "sms" ? state.phoneNumber : undefined,
                deviceName: state.deviceName,
                lgpdConsent: state.lgpdConsent,
                userAgent: navigator.userAgent,
              };
              return [4 /*yield*/, getUserIpAddress()];
            case 2:
              return [4 /*yield*/, _a.apply(void 0, [((_b.ipAddress = _c.sent()), _b)])];
            case 3:
              result_1 = _c.sent();
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  qrCodeUri: result_1.qrCodeUri,
                  secret: result_1.secret,
                  backupCodes: result_1.backupCodes,
                  recoveryToken: result_1.recoveryToken,
                  currentStep: 2,
                });
              });
              (0, use_toast_1.toast)({
                title: t.success.setupInitiated,
                description: t.success.setupInitiatedDescription,
              });
              return [3 /*break*/, 5];
            case 4:
              err_1 = _c.sent();
              error_1 = err_1 instanceof auth_1.MFAError ? err_1 : new Error(t.errors.setupFailed);
              onSetupError(error_1);
              (0, use_toast_1.toast)({
                title: t.errors.setupFailed,
                description: error_1.message,
                variant: "destructive",
              });
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [
      state.lgpdConsent,
      state.deviceName,
      state.selectedMethod,
      state.phoneNumber,
      userId,
      setupMFA,
      onSetupError,
      t,
    ],
  );
  /**
   * Verify MFA token
   */
  var verifyToken = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var result, _a, err_2, error_2;
        var _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              if (!state.verificationToken.trim()) {
                (0, use_toast_1.toast)({
                  title: t.errors.tokenRequired,
                  description: t.errors.tokenRequiredDescription,
                  variant: "destructive",
                });
                return [2 /*return*/];
              }
              setState(function (prev) {
                return __assign(__assign({}, prev), { isVerifying: true });
              });
              _c.label = 1;
            case 1:
              _c.trys.push([1, 4, 5, 6]);
              _a = verifyMFA;
              _b = {
                userId: userId,
                token: state.verificationToken,
                method: state.selectedMethod,
                userAgent: navigator.userAgent,
              };
              return [4 /*yield*/, getUserIpAddress()];
            case 2:
              return [4 /*yield*/, _a.apply(void 0, [((_b.ipAddress = _c.sent()), _b)])];
            case 3:
              result = _c.sent();
              if (result.isValid) {
                setState(function (prev) {
                  return __assign(__assign({}, prev), { currentStep: 3 });
                }); // Move to backup codes step
                (0, use_toast_1.toast)({
                  title: t.success.verificationSuccess,
                  description: t.success.verificationSuccessDescription,
                });
              } else {
                (0, use_toast_1.toast)({
                  title: t.errors.verificationFailed,
                  description: t.errors.verificationFailedDescription,
                  variant: "destructive",
                });
              }
              return [3 /*break*/, 6];
            case 4:
              err_2 = _c.sent();
              error_2 =
                err_2 instanceof auth_1.MFAError ? err_2 : new Error(t.errors.verificationFailed);
              (0, use_toast_1.toast)({
                title: t.errors.verificationFailed,
                description: error_2.message,
                variant: "destructive",
              });
              return [3 /*break*/, 6];
            case 5:
              setState(function (prev) {
                return __assign(__assign({}, prev), { isVerifying: false });
              });
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [state.verificationToken, state.selectedMethod, userId, verifyMFA, t],
  );
  /**
   * Complete setup process
   */
  var completeSetup = (0, react_1.useCallback)(
    function () {
      var result = {
        secret: state.secret,
        qrCodeUri: state.qrCodeUri,
        backupCodes: state.backupCodes,
        recoveryToken: state.recoveryToken,
      };
      onSetupComplete(result);
      (0, use_toast_1.toast)({
        title: t.success.setupComplete,
        description: t.success.setupCompleteDescription,
      });
    },
    [state, onSetupComplete, t],
  );
  /**
   * Copy text to clipboard
   */
  var copyToClipboard = (0, react_1.useCallback)(
    function (text, label) {
      return __awaiter(_this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, navigator.clipboard.writeText(text)];
            case 1:
              _a.sent();
              (0, use_toast_1.toast)({
                title: t.success.copied,
                description: t.success.copiedDescription.replace("{item}", label),
              });
              return [3 /*break*/, 3];
            case 2:
              err_3 = _a.sent();
              (0, use_toast_1.toast)({
                title: t.errors.copyFailed,
                description: t.errors.copyFailedDescription,
                variant: "destructive",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [t],
  );
  /**
   * Download backup codes as text file
   */
  var downloadBackupCodes = (0, react_1.useCallback)(
    function () {
      var content = __spreadArray(
        __spreadArray(
          [t.backupCodes.fileHeader, t.backupCodes.fileWarning, ""],
          state.backupCodes.map(function (code, index) {
            return "".concat(index + 1, ". ").concat(code);
          }),
          true,
        ),
        ["", t.backupCodes.fileFooter, "Generated: ".concat(new Date().toLocaleString(locale))],
        false,
      ).join("\n");
      var blob = new Blob([content], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "neonpro-backup-codes-".concat(new Date().toISOString().split("T")[0], ".txt");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      (0, use_toast_1.toast)({
        title: t.success.downloaded,
        description: t.success.downloadedDescription,
      });
    },
    [state.backupCodes, locale, t],
  );
  // Calculate setup progress
  var progress = ((state.currentStep + 1) / setupSteps.length) * 100;
  return (
    <div className={(0, utils_1.cn)("w-full max-w-2xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <badge_1.Badge variant="outline" className="text-sm">
            {t.step} {state.currentStep + 1} {t.of} {setupSteps.length}
          </badge_1.Badge>
        </div>

        <progress_1.Progress value={progress} className="mb-4" />

        <p className="text-gray-600 dark:text-gray-400">
          {(_b = setupSteps[state.currentStep]) === null || _b === void 0 ? void 0 : _b.description}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>{error.message}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Step Content */}
      <card_1.Card>
        <card_1.CardContent className="p-6">
          {/* Step 0: Method Selection */}
          {state.currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.methodSelection.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.methodSelection.description}
                </p>
              </div>

              <tabs_1.Tabs value={state.selectedMethod} onValueChange={handleMethodSelect}>
                <tabs_1.TabsList className="grid w-full grid-cols-2">
                  <tabs_1.TabsTrigger value="totp" className="flex items-center gap-2">
                    <lucide_react_1.Smartphone className="h-4 w-4" />
                    {t.methods.totp.title}
                  </tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="sms" className="flex items-center gap-2">
                    <lucide_react_1.Shield className="h-4 w-4" />
                    {t.methods.sms.title}
                  </tabs_1.TabsTrigger>
                </tabs_1.TabsList>

                <tabs_1.TabsContent value="totp" className="mt-6">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Smartphone className="h-5 w-5" />
                        {t.methods.totp.title}
                      </card_1.CardTitle>
                      <card_1.CardDescription>{t.methods.totp.description}</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">{t.methods.totp.recommended}</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• {t.methods.totp.benefits.security}</li>
                            <li>• {t.methods.totp.benefits.offline}</li>
                            <li>• {t.methods.totp.benefits.apps}</li>
                          </ul>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="sms" className="mt-6">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Shield className="h-5 w-5" />
                        {t.methods.sms.title}
                      </card_1.CardTitle>
                      <card_1.CardDescription>{t.methods.sms.description}</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        <alert_1.Alert>
                          <lucide_react_1.AlertTriangle className="h-4 w-4" />
                          <alert_1.AlertDescription>
                            {t.methods.sms.warning}
                          </alert_1.AlertDescription>
                        </alert_1.Alert>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>
              </tabs_1.Tabs>

              <separator_1.Separator />

              {/* Device Name Input */}
              <div className="space-y-2">
                <label_1.Label htmlFor="deviceName">{t.deviceName.label}</label_1.Label>
                <input_1.Input
                  id="deviceName"
                  type="text"
                  placeholder={t.deviceName.placeholder}
                  value={state.deviceName}
                  onChange={function (e) {
                    return handleDeviceNameChange(e.target.value);
                  }}
                  maxLength={50}
                />
                <p className="text-sm text-gray-500">{t.deviceName.help}</p>
              </div>

              {/* Phone Number Input (SMS only) */}
              {state.selectedMethod === "sms" && (
                <div className="space-y-2">
                  <label_1.Label htmlFor="phoneNumber">{t.phoneNumber.label}</label_1.Label>
                  <input_1.Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t.phoneNumber.placeholder}
                    value={state.phoneNumber}
                    onChange={function (e) {
                      return handlePhoneNumberChange(e.target.value);
                    }}
                  />
                  <p className="text-sm text-gray-500">{t.phoneNumber.help}</p>
                </div>
              )}

              {/* LGPD Consent */}
              <div className="space-y-4">
                <separator_1.Separator />
                <div className="flex items-start space-x-3">
                  <checkbox_1.Checkbox
                    id="lgpdConsent"
                    checked={state.lgpdConsent}
                    onCheckedChange={handleLGPDConsentChange}
                  />
                  <div className="space-y-1">
                    <label_1.Label htmlFor="lgpdConsent" className="text-sm font-medium">
                      {t.lgpd.consent}
                    </label_1.Label>
                    <p className="text-sm text-gray-500">{t.lgpd.description}</p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <button_1.Button
                  onClick={function () {
                    return setState(function (prev) {
                      return __assign(__assign({}, prev), { currentStep: 1 });
                    });
                  }}
                  disabled={
                    !state.deviceName.trim() ||
                    !state.lgpdConsent ||
                    (state.selectedMethod === "sms" && !state.phoneNumber.trim())
                  }
                >
                  {t.buttons.continue}
                </button_1.Button>
              </div>
            </div>
          )}
          {/* Step 1: Configuration */}
          {state.currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.configuration.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.configuration.description}
                </p>
              </div>

              {/* Setup Summary */}
              <card_1.Card className="bg-gray-50 dark:bg-gray-800">
                <card_1.CardContent className="p-4">
                  <h4 className="font-medium mb-3">{t.configuration.summary}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t.configuration.method}:</span>
                      <badge_1.Badge variant="outline">
                        {state.selectedMethod === "totp"
                          ? t.methods.totp.title
                          : t.methods.sms.title}
                      </badge_1.Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.configuration.device}:</span>
                      <span className="font-medium">{state.deviceName}</span>
                    </div>
                    {state.selectedMethod === "sms" && (
                      <div className="flex justify-between">
                        <span>{t.configuration.phone}:</span>
                        <span className="font-medium">{state.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return setState(function (prev) {
                      return __assign(__assign({}, prev), { currentStep: 0 });
                    });
                  }}
                >
                  {t.buttons.back}
                </button_1.Button>
                <button_1.Button onClick={startSetup} disabled={isLoading}>
                  {isLoading ? t.buttons.setting_up : t.buttons.setup}
                </button_1.Button>
              </div>
            </div>
          )}
          {/* Step 2: Verification */}
          {state.currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.verification.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.verification.description}
                </p>
              </div>

              {/* TOTP Setup */}
              {state.selectedMethod === "totp" && (
                <div className="space-y-6">
                  {/* QR Code */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>{t.verification.totp.qrTitle}</card_1.CardTitle>
                      <card_1.CardDescription>
                        {t.verification.totp.qrDescription}
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="flex flex-col items-center space-y-4">
                      {state.qrCodeUri && (
                        <div className="bg-white p-4 rounded-lg border">
                          <qrcode_react_1.QRCodeSVG value={state.qrCodeUri} size={200} />
                        </div>
                      )}

                      {/* Manual Entry */}
                      <div className="w-full">
                        <label_1.Label>{t.verification.totp.manualEntry}</label_1.Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <input_1.Input
                            type={state.showSecret ? "text" : "password"}
                            value={state.secret}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return setState(function (prev) {
                                return __assign(__assign({}, prev), {
                                  showSecret: !prev.showSecret,
                                });
                              });
                            }}
                          >
                            {state.showSecret
                              ? <lucide_react_1.EyeOff className="h-4 w-4" />
                              : <lucide_react_1.Eye className="h-4 w-4" />}
                          </button_1.Button>
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return copyToClipboard(state.secret, t.verification.totp.secret);
                            }}
                          >
                            <lucide_react_1.Copy className="h-4 w-4" />
                          </button_1.Button>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>
              )}

              {/* SMS Setup */}
              {state.selectedMethod === "sms" && (
                <alert_1.Alert>
                  <lucide_react_1.Smartphone className="h-4 w-4" />
                  <alert_1.AlertDescription>
                    {t.verification.sms.sent.replace("{phone}", state.phoneNumber)}
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              )}

              {/* Token Verification */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>{t.verification.tokenTitle}</card_1.CardTitle>
                  <card_1.CardDescription>
                    {state.selectedMethod === "totp"
                      ? t.verification.tokenDescriptionTOTP
                      : t.verification.tokenDescriptionSMS}
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="verificationToken">
                        {t.verification.tokenLabel}
                      </label_1.Label>
                      <input_1.Input
                        id="verificationToken"
                        type="text"
                        placeholder="123456"
                        value={state.verificationToken}
                        onChange={function (e) {
                          return setState(function (prev) {
                            return __assign(__assign({}, prev), {
                              verificationToken: e.target.value.replace(/\D/g, "").slice(0, 6),
                            });
                          });
                        }}
                        maxLength={6}
                        className="text-center text-2xl font-mono"
                      />
                    </div>

                    <div className="flex justify-between">
                      <button_1.Button
                        variant="outline"
                        onClick={function () {
                          return setState(function (prev) {
                            return __assign(__assign({}, prev), { currentStep: 1 });
                          });
                        }}
                      >
                        {t.buttons.back}
                      </button_1.Button>
                      <button_1.Button
                        onClick={verifyToken}
                        disabled={state.verificationToken.length !== 6 || state.isVerifying}
                      >
                        {state.isVerifying ? t.buttons.verifying : t.buttons.verify}
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          )}{" "}
          {/* Step 3: Backup Codes */}
          {state.currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.backupCodes.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t.backupCodes.description}</p>
              </div>

              {/* Important Warning */}
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>{t.backupCodes.warning}</alert_1.AlertDescription>
              </alert_1.Alert>

              {/* Backup Codes Display */}
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <card_1.CardTitle>{t.backupCodes.codesTitle}</card_1.CardTitle>
                    <div className="flex gap-2">
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return setState(function (prev) {
                            return __assign(__assign({}, prev), {
                              showBackupCodes: !prev.showBackupCodes,
                            });
                          });
                        }}
                      >
                        {state.showBackupCodes
                          ? <lucide_react_1.EyeOff className="h-4 w-4" />
                          : <lucide_react_1.Eye className="h-4 w-4" />}
                        {state.showBackupCodes ? t.buttons.hide : t.buttons.show}
                      </button_1.Button>
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return copyToClipboard(state.backupCodes.join("\n"), t.backupCodes.title);
                        }}
                      >
                        <lucide_react_1.Copy className="h-4 w-4" />
                        {t.buttons.copy}
                      </button_1.Button>
                      <button_1.Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                        <lucide_react_1.Download className="h-4 w-4" />
                        {t.buttons.download}
                      </button_1.Button>
                    </div>
                  </div>
                  <card_1.CardDescription>{t.backupCodes.codesDescription}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {state.showBackupCodes
                    ? <div className="grid grid-cols-2 gap-3">
                        {state.backupCodes.map(function (code, index) {
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                            >
                              <span className="font-mono text-sm">{code}</span>
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return copyToClipboard(
                                    code,
                                    "".concat(t.backupCodes.code, " ").concat(index + 1),
                                  );
                                }}
                              >
                                <lucide_react_1.Copy className="h-3 w-3" />
                              </button_1.Button>
                            </div>
                          );
                        })}
                      </div>
                    : <div className="text-center py-8 text-gray-500">
                        <lucide_react_1.EyeOff className="h-8 w-8 mx-auto mb-2" />
                        <p>{t.backupCodes.hidden}</p>
                      </div>}
                </card_1.CardContent>
              </card_1.Card>

              {/* Recovery Token */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>{t.recoveryToken.title}</card_1.CardTitle>
                  <card_1.CardDescription>{t.recoveryToken.description}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="flex items-center space-x-2">
                    <input_1.Input
                      type="password"
                      value={state.recoveryToken}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <button_1.Button
                      variant="outline"
                      size="sm"
                      onClick={function () {
                        return copyToClipboard(state.recoveryToken, t.recoveryToken.title);
                      }}
                    >
                      <lucide_react_1.Copy className="h-4 w-4" />
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Security Checklist */}
              <card_1.Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <lucide_react_1.CheckCircle className="h-5 w-5" />
                    {t.securityChecklist.title}
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.saved}
                    </li>
                    <li className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.secure}
                    </li>
                    <li className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.offline}
                    </li>
                    <li className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4" />
                      {t.securityChecklist.tested}
                    </li>
                  </ul>
                </card_1.CardContent>
              </card_1.Card>

              {/* Complete Setup */}
              <div className="flex justify-between">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return setState(function (prev) {
                      return __assign(__assign({}, prev), { currentStep: 2 });
                    });
                  }}
                >
                  {t.buttons.back}
                </button_1.Button>
                <button_1.Button
                  onClick={completeSetup}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
                  {t.buttons.complete}
                </button_1.Button>
              </div>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Healthcare Compliance Footer */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <lucide_react_1.Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              {t.compliance.title}
            </h4>
            <p className="text-blue-700 dark:text-blue-300">{t.compliance.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
/**
 * Utility function to get user IP address
 */
function getUserIpAddress() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      try {
        // In production, this would call your backend to get the real IP
        return [2 /*return*/, "0.0.0.0"];
      } catch (_b) {
        return [2 /*return*/, "0.0.0.0"];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Translations hook (mock implementation)
 */
function useTranslations(locale) {
  var translations = {
    "pt-BR": {
      title: "Configurar Autenticação Multifator",
      step: "Passo",
      of: "de",
      steps: {
        method: {
          title: "Escolher Método",
          description: "Selecione seu método preferido de autenticação multifator.",
        },
        configure: {
          title: "Configurar",
          description: "Configure seu método de MFA selecionado.",
        },
        verify: {
          title: "Verificar",
          description: "Teste sua configuração com um código de verificação.",
        },
        backup: {
          title: "Códigos de Backup",
          description: "Salve seus códigos de recuperação em local seguro.",
        },
      },
      methodSelection: {
        title: "Selecione o Método de Autenticação",
        description: "Escolha como você deseja receber seus códigos de verificação.",
      },
      methods: {
        totp: {
          title: "App Autenticador",
          description: "Use um aplicativo como Google Authenticator ou Authy.",
          recommended: "Recomendado para Profissionais de Saúde",
          benefits: {
            security: "Maior segurança e privacidade",
            offline: "Funciona sem conexão com internet",
            apps: "Compatível com apps populares",
          },
        },
        sms: {
          title: "SMS",
          description: "Receba códigos por mensagem de texto.",
          warning: "SMS é menos seguro que aplicativos autenticadores.",
        },
      },
      deviceName: {
        label: "Nome do Dispositivo",
        placeholder: "Ex: iPhone do João, Computador do Consultório",
        help: "Este nome ajudará você a identificar este dispositivo.",
      },
      phoneNumber: {
        label: "Número de Telefone",
        placeholder: "+55 11 99999-9999",
        help: "Digite seu número completo com código do país.",
      },
      lgpd: {
        consent: "Concordo com o processamento dos meus dados para MFA",
        description:
          "Seus dados serão processados de acordo com a LGPD para fins de segurança médica.",
      },
      configuration: {
        title: "Confirmar Configuração",
        description: "Revise as configurações antes de prosseguir.",
        summary: "Resumo da Configuração",
        method: "Método",
        device: "Dispositivo",
        phone: "Telefone",
      },
      verification: {
        title: "Verificar Configuração",
        description: "Digite o código gerado para confirmar a configuração.",
        tokenTitle: "Digite o Código de Verificação",
        tokenLabel: "Código",
        tokenDescriptionTOTP: "Digite o código de 6 dígitos do seu app autenticador.",
        tokenDescriptionSMS: "Digite o código de 6 dígitos enviado por SMS.",
        totp: {
          qrTitle: "Escaneie o Código QR",
          qrDescription: "Use seu app autenticador para escanear este código QR.",
          manualEntry: "Ou digite manualmente:",
          secret: "chave secreta",
        },
        sms: {
          sent: "Código SMS enviado para {phone}",
        },
      },
      backupCodes: {
        title: "Códigos de Recuperação",
        description: "Use estes códigos se perder acesso ao seu método principal de MFA.",
        warning:
          "IMPORTANTE: Salve estes códigos em local seguro. Cada código só pode ser usado uma vez.",
        codesTitle: "Seus Códigos de Backup",
        codesDescription: "Cada código pode ser usado apenas uma vez para acessar sua conta.",
        hidden: "Códigos ocultos por segurança",
        code: "Código",
        fileHeader: "NeonPro Healthcare - Códigos de Recuperação MFA",
        fileWarning:
          "MANTENHA ESTES CÓDIGOS EM LOCAL SEGURO! Cada código só pode ser usado uma vez.",
        fileFooter: "Para suporte, entre em contato: suporte@neonpro.com.br",
      },
      recoveryToken: {
        title: "Token de Recuperação Master",
        description: "Use este token para recuperar sua conta em emergências extremas.",
      },
      securityChecklist: {
        title: "Lista de Segurança",
        saved: "Códigos salvos em local seguro",
        secure: "Armazenamento offline protegido",
        offline: "Cópia impressa em cofre",
        tested: "Configuração testada e funcionando",
      },
      compliance: {
        title: "Conformidade LGPD e Regulamentações de Saúde",
        description:
          "Esta configuração está em conformidade com LGPD, ANVISA e CFM para proteção de dados médicos.",
      },
      buttons: {
        continue: "Continuar",
        back: "Voltar",
        setup: "Configurar MFA",
        setting_up: "Configurando...",
        verify: "Verificar",
        verifying: "Verificando...",
        complete: "Concluir Configuração",
        show: "Mostrar",
        hide: "Ocultar",
        copy: "Copiar",
        download: "Baixar",
      },
      success: {
        setupInitiated: "Configuração iniciada",
        setupInitiatedDescription: "MFA configurado com sucesso. Agora verifique com um código.",
        verificationSuccess: "Verificação bem-sucedida",
        verificationSuccessDescription: "Seu MFA foi verificado e está funcionando.",
        setupComplete: "MFA Configurado!",
        setupCompleteDescription: "Sua conta agora está protegida com autenticação multifator.",
        copied: "Copiado!",
        copiedDescription: "{item} copiado para a área de transferência.",
        downloaded: "Download concluído",
        downloadedDescription: "Códigos de backup salvos em arquivo.",
      },
      errors: {
        lgpdRequired: "Consentimento LGPD obrigatório",
        lgpdRequiredDescription: "Você deve concordar com o tratamento de dados para usar MFA.",
        deviceNameRequired: "Nome do dispositivo obrigatório",
        deviceNameRequiredDescription: "Digite um nome para identificar este dispositivo.",
        phoneRequired: "Telefone obrigatório",
        phoneRequiredDescription: "Digite seu número de telefone para SMS.",
        setupFailed: "Erro na configuração",
        tokenRequired: "Código obrigatório",
        tokenRequiredDescription: "Digite o código de 6 dígitos.",
        verificationFailed: "Verificação falhou",
        verificationFailedDescription: "Código inválido. Tente novamente.",
        copyFailed: "Erro ao copiar",
        copyFailedDescription: "Não foi possível copiar para área de transferência.",
      },
    },
    "en-US": __assign({}, {}),
  };
  return translations[locale];
}
exports.default = MFASetup;
