"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInWithGooglePopupButton = SignInWithGooglePopupButton;
var button_1 = require("@/components/ui/button");
var auth_context_1 = require("@/contexts/auth-context");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function SignInWithGooglePopupButton(_a) {
    var _this = this;
    var _b = _a.text, text = _b === void 0 ? "Entrar com Google" : _b, _c = _a.loadingText, loadingText = _c === void 0 ? "Autenticando..." : _c, className = _a.className, disabled = _a.disabled, onSuccess = _a.onSuccess, onError = _a.onError;
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)("idle"), authState = _e[0], setAuthState = _e[1];
    var signInWithGoogle = (0, auth_context_1.useAuth)().signInWithGoogle;
    // Performance monitoring
    var _f = (0, react_1.useState)({
        startTime: 0,
        popupOpenTime: 0,
        authCompleteTime: 0,
        totalTime: 0,
    }), metrics = _f[0], setMetrics = _f[1];
    // Enhanced error handling with specific error types
    var handleOAuthError = (0, react_1.useCallback)(function (error, context) {
        var _a, _b, _c, _d;
        console.error("\uD83D\uDD25 OAuth Error [".concat(context, "]:"), error);
        var userMessage = "Falha na autenticação com Google.";
        // Specific error handling
        if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes("popup")) {
            userMessage = "Por favor, permita popups para fazer login com Google.";
        }
        else if ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes("cancelled")) {
            userMessage = "Login cancelado. Tente novamente.";
        }
        else if ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0 ? void 0 : _c.includes("network")) {
            userMessage = "Erro de conexão. Verifique sua internet.";
        }
        else if ((_d = error === null || error === void 0 ? void 0 : error.message) === null || _d === void 0 ? void 0 : _d.includes("timeout")) {
            userMessage = "Login demorou muito. Tente novamente.";
        }
        sonner_1.toast.error(userMessage);
        onError === null || onError === void 0 ? void 0 : onError(userMessage);
        setAuthState("error");
    }, [onError]);
    // Optimized sign in with timeout and retry logic
    var handleSignIn = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var startTime, timeoutPromise, popupTime_1, error, authCompleteTime_1, totalTime_1, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    setMetrics(function (prev) { return (__assign(__assign({}, prev), { startTime: startTime })); });
                    setIsLoading(true);
                    setAuthState("connecting");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    timeoutPromise = new Promise(function (_, reject) {
                        setTimeout(function () { return reject(new Error("OAuth timeout after 4 seconds")); }, 4000);
                    });
                    setAuthState("authenticating");
                    popupTime_1 = Date.now();
                    setMetrics(function (prev) { return (__assign(__assign({}, prev), { popupOpenTime: popupTime_1 })); });
                    return [4 /*yield*/, Promise.race([
                            signInWithGoogle(),
                            timeoutPromise,
                        ])];
                case 2:
                    error = (_a.sent()).error;
                    authCompleteTime_1 = Date.now();
                    totalTime_1 = authCompleteTime_1 - startTime;
                    setMetrics(function (prev) { return (__assign(__assign({}, prev), { authCompleteTime: authCompleteTime_1, totalTime: totalTime_1 })); });
                    if (error) {
                        handleOAuthError(error, "signInWithGoogle");
                        return [2 /*return*/];
                    }
                    // Success
                    setAuthState("success");
                    // Performance feedback
                    if (totalTime_1 <= 3000) {
                        console.log("\u2705 OAuth completed in ".concat(totalTime_1, "ms (\u22643s requirement met)"));
                    }
                    else {
                        console.warn("\u26A0\uFE0F OAuth took ".concat(totalTime_1, "ms (exceeds 3s requirement)"));
                    }
                    sonner_1.toast.success("Login realizado com sucesso!");
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : "Erro inesperado no OAuth";
                    handleOAuthError(err_1, "handleSignIn");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    // Reset state after a delay
                    setTimeout(function () { return setAuthState("idle"); }, 2000);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [signInWithGoogle, handleOAuthError, onSuccess]);
    // Keyboard accessibility
    var handleKeyDown = (0, react_1.useCallback)(function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSignIn();
        }
    }, [handleSignIn]);
    // Preload popup optimization
    (0, react_1.useEffect)(function () {
        // Preload Google's OAuth endpoints for faster connection
        var preloadLink = document.createElement("link");
        preloadLink.rel = "dns-prefetch";
        preloadLink.href = "https://accounts.google.com";
        document.head.appendChild(preloadLink);
        return function () {
            document.head.removeChild(preloadLink);
        };
    }, []);
    // Dynamic button content based on state
    var getButtonContent = function () {
        switch (authState) {
            case "connecting":
                return (<>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Conectando...
          </>);
            case "authenticating":
                return (<>
            <div className="animate-pulse h-4 w-4 bg-blue-500 rounded-full mr-2"></div>
            Autenticando...
          </>);
            case "success":
                return (<>
            <lucide_react_1.CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
            Sucesso!
          </>);
            case "error":
                return (<>
            <lucide_react_1.AlertCircle className="mr-2 h-4 w-4 text-red-500"/>
            Tentar novamente
          </>);
            default:
                return (<>
            <lucide_react_1.Chrome className="mr-2 h-4 w-4"/>
            {text}
          </>);
        }
    };
    return (<button_1.Button variant="outline" className={"\n        ".concat(className, " \n        transition-all duration-200 \n        hover:shadow-md \n        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2\n        ").concat(authState === "error" ? "border-red-300 hover:border-red-400" : "", "\n        ").concat(authState === "success"
            ? "border-green-300 hover:border-green-400"
            : "", "\n      ")} onClick={handleSignIn} onKeyDown={handleKeyDown} disabled={isLoading || disabled} aria-label={"".concat(text, " - Login com Google OAuth")} role="button" tabIndex={0}>
      {getButtonContent()}
    </button_1.Button>);
}
