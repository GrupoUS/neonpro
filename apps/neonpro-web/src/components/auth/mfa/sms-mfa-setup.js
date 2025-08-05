// components/auth/mfa/sms-mfa-setup.tsx
"use client";
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
exports.SMSMFASetup = SMSMFASetup;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var mfa_1 = require("@/lib/auth/mfa");
var sonner_1 = require("sonner");
var phoneSchema = zod_2.z.object({
  phoneNumber: zod_2.z
    .string()
    .min(10, "Phone number must have at least 10 digits")
    .max(15, "Phone number must have at most 15 digits")
    .refine(mfa_1.validatePhoneNumber, "Please enter a valid phone number"),
});
var verificationSchema = zod_2.z.object({
  code: zod_2.z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});
function SMSMFASetup(_a) {
  var userId = _a.userId,
    onSuccess = _a.onSuccess,
    onCancel = _a.onCancel;
  var _b = (0, react_1.useState)("phone"),
    step = _b[0],
    setStep = _b[1];
  var _c = (0, react_1.useState)(""),
    phoneNumber = _c[0],
    setPhoneNumber = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(""),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)(0),
    resendCount = _f[0],
    setResendCount = _f[1];
  var _g = (0, react_1.useState)(true),
    canResend = _g[0],
    setCanResend = _g[1];
  var phoneForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });
  var verificationForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(verificationSchema),
    defaultValues: {
      code: "",
    },
  });
  var smsService = mfa_1.SMSMFAService.getInstance();
  var handlePhoneSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var formattedPhone, result, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError("");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            formattedPhone = (0, mfa_1.formatPhoneNumber)(data.phoneNumber);
            return [4 /*yield*/, smsService.sendSMSCode(formattedPhone, userId)];
          case 2:
            result = _a.sent();
            if (result.success) {
              setPhoneNumber(formattedPhone);
              setStep("verification");
              sonner_1.toast.success("Verification code sent to your phone");
            } else {
              setError(result.error || "Failed to send verification code");
            }
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            setError("Failed to send verification code");
            console.error("SMS sending error:", err_1);
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleVerificationSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var verifyResult, enableResult, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError("");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            return [4 /*yield*/, smsService.verifySMSCode(phoneNumber, data.code, userId)];
          case 2:
            verifyResult = _a.sent();
            if (!verifyResult.success) return [3 /*break*/, 4];
            return [4 /*yield*/, smsService.enableSMSMFA(userId, phoneNumber)];
          case 3:
            enableResult = _a.sent();
            if (enableResult.success) {
              sonner_1.toast.success("SMS MFA enabled successfully");
              onSuccess();
            } else {
              setError(enableResult.error || "Failed to enable SMS MFA");
            }
            return [3 /*break*/, 5];
          case 4:
            setError(verifyResult.error || "Invalid verification code");
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            err_2 = _a.sent();
            setError("Verification failed");
            console.error("SMS verification error:", err_2);
            return [3 /*break*/, 8];
          case 7:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var handleResendCode = () =>
    __awaiter(this, void 0, void 0, function () {
      var result, err_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!canResend || resendCount >= 3) {
              return [2 /*return*/];
            }
            setIsLoading(true);
            setError("");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, smsService.sendSMSCode(phoneNumber, userId)];
          case 2:
            result = _a.sent();
            if (result.success) {
              setResendCount((prev) => prev + 1);
              setCanResend(false);
              // Allow resend after 60 seconds
              setTimeout(() => setCanResend(true), 60000);
              sonner_1.toast.success("New verification code sent");
            } else {
              setError(result.error || "Failed to resend code");
            }
            return [3 /*break*/, 5];
          case 3:
            err_3 = _a.sent();
            setError("Failed to resend code");
            console.error("SMS resend error:", err_3);
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  if (step === "phone") {
    return (
      <card_1.Card className="w-full max-w-md">
        <card_1.CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <lucide_react_1.Phone className="w-6 h-6 text-blue-600" />
          </div>
          <card_1.CardTitle>Setup SMS Authentication</card_1.CardTitle>
          <card_1.CardDescription>
            Enter your phone number to receive verification codes
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="phoneNumber">Phone Number</label_1.Label>
              <input_1.Input
                id="phoneNumber"
                type="tel"
                placeholder="+55 11 99999-9999"
                {...phoneForm.register("phoneNumber")}
                className={phoneForm.formState.errors.phoneNumber ? "border-red-500" : ""}
              />
              {phoneForm.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {phoneForm.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            {error && (
              <alert_1.Alert variant="destructive">
                <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            <div className="flex gap-2">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </button_1.Button>
              <button_1.Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Code
              </button_1.Button>
            </div>
          </form>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className="w-full max-w-md">
      <card_1.CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <lucide_react_1.MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <card_1.CardTitle>Enter Verification Code</card_1.CardTitle>
        <card_1.CardDescription>We sent a 6-digit code to {phoneNumber}</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form
          onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label_1.Label htmlFor="code">Verification Code</label_1.Label>
            <input_1.Input
              id="code"
              type="text"
              placeholder="123456"
              maxLength={6}
              className={"text-center text-lg tracking-widest ".concat(
                verificationForm.formState.errors.code ? "border-red-500" : "",
              )}
              {...verificationForm.register("code")}
            />
            {verificationForm.formState.errors.code && (
              <p className="text-sm text-red-500">
                {verificationForm.formState.errors.code.message}
              </p>
            )}
          </div>

          {error && (
            <alert_1.Alert variant="destructive">
              <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
            </alert_1.Alert>
          )}

          <div className="text-center">
            <button_1.Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={!canResend || resendCount >= 3 || isLoading}
              className="text-sm"
            >
              {resendCount >= 3
                ? "Maximum resend attempts reached"
                : canResend
                  ? "Resend code (".concat(3 - resendCount, " left)")
                  : "Resend available in 60s"}
            </button_1.Button>
          </div>

          <div className="flex gap-2">
            <button_1.Button
              type="button"
              variant="outline"
              onClick={() => setStep("phone")}
              className="flex-1"
            >
              Back
            </button_1.Button>
            <button_1.Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify
            </button_1.Button>
          </div>
        </form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
