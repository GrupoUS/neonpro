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
exports.SSOLogin = SSOLogin;
// SSO Login Component
// Story 1.3: SSO Integration - Frontend Login Interface
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var use_sso_1 = require("@/hooks/use-sso");
var utils_1 = require("@/lib/utils");
function ProviderButton(_a) {
  var _b, _c, _d;
  var provider = _a.provider,
    isLoading = _a.isLoading,
    onClick = _a.onClick,
    disabled = _a.disabled;
  var getProviderIcon = (providerId) => {
    switch (providerId) {
      case "google":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case "microsoft":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#f25022" d="M1 1h10v10H1z" />
            <path fill="#00a4ef" d="M13 1h10v10H13z" />
            <path fill="#7fba00" d="M1 13h10v10H1z" />
            <path fill="#ffb900" d="M13 13h10v10H13z" />
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
        );
      case "apple":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
            />
          </svg>
        );
      default:
        return <lucide_react_1.ExternalLink className="w-5 h-5" />;
    }
  };
  var buttonStyle = {
    backgroundColor:
      ((_b = provider.metadata) === null || _b === void 0 ? void 0 : _b.buttonColor) || "#ffffff",
    color:
      ((_c = provider.metadata) === null || _c === void 0 ? void 0 : _c.textColor) || "#000000",
    borderColor:
      ((_d = provider.metadata) === null || _d === void 0 ? void 0 : _d.buttonColor) || "#e5e7eb",
  };
  return (
    <button_1.Button
      variant="outline"
      className={(0, utils_1.cn)(
        "w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading
        ? <lucide_react_1.Loader2 className="w-5 h-5 animate-spin" />
        : getProviderIcon(provider.id)}
      <span className="flex-1">
        {isLoading
          ? "Connecting..."
          : "Continue with ".concat(provider.displayName || provider.name)}
      </span>
    </button_1.Button>
  );
}
function SSOLogin(_a) {
  var redirectTo = _a.redirectTo,
    className = _a.className,
    _b = _a.showTitle,
    showTitle = _b === void 0 ? true : _b,
    showDescription = _a.showDescription,
    onSuccess = _a.onSuccess,
    onError = _a.onError;
  var _c = (0, use_sso_1.useSSO)(),
    providers = _c.providers,
    ssoLoading = _c.isLoading,
    ssoError = _c.error,
    login = _c.login,
    getProviders = _c.getProviders;
  var _d = (0, react_1.useState)(null),
    loadingProvider = _d[0],
    setLoadingProvider = _d[1];
  var _e = (0, react_1.useState)(null),
    localError = _e[0],
    setLocalError = _e[1];
  (0, react_1.useEffect)(() => {
    getProviders();
  }, [getProviders]);
  (0, react_1.useEffect)(() => {
    if (ssoError) {
      setLocalError(ssoError);
      onError === null || onError === void 0 ? void 0 : onError(ssoError);
    }
  }, [ssoError, onError]);
  var handleProviderLogin = (provider) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1, errorMessage;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLocalError(null);
            setLoadingProvider(provider.id);
            return [
              4 /*yield*/,
              login(provider.id, {
                redirectTo: redirectTo,
                prompt: "select_account", // Always show account selection
              }),
            ];
          case 1:
            _a.sent();
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(provider.id, null); // User info will be available after redirect
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            errorMessage = error_1 instanceof Error ? error_1.message : "Login failed";
            setLocalError(errorMessage);
            onError === null || onError === void 0 ? void 0 : onError(errorMessage, provider.id);
            return [3 /*break*/, 4];
          case 3:
            setLoadingProvider(null);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var enabledProviders = providers.filter((p) => p.enabled);
  var hasProviders = enabledProviders.length > 0;
  var isLoading = ssoLoading || loadingProvider !== null;
  var error = localError || ssoError;
  return (
    <card_1.Card className={(0, utils_1.cn)("w-full max-w-md mx-auto", className)}>
      <card_1.CardHeader className="space-y-1">
        {showTitle && (
          <card_1.CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </card_1.CardTitle>
        )}
        {showDescription && (
          <card_1.CardDescription className="text-center">{showDescription}</card_1.CardDescription>
        )}
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {error && (
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertCircle className="h-4 w-4" />
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>
        )}

        {ssoLoading && !hasProviders
          ? <div className="flex items-center justify-center py-8">
              <lucide_react_1.Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading authentication options...
              </span>
            </div>
          : !hasProviders
            ? <alert_1.Alert>
                <lucide_react_1.AlertCircle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  No authentication providers are currently available. Please contact support.
                </alert_1.AlertDescription>
              </alert_1.Alert>
            : <div className="space-y-3">
                {enabledProviders.map((provider) => (
                  <ProviderButton
                    key={provider.id}
                    provider={provider}
                    isLoading={loadingProvider === provider.id}
                    onClick={() => handleProviderLogin(provider)}
                    disabled={isLoading}
                  />
                ))}
              </div>}

        {hasProviders && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
exports.default = SSOLogin;
