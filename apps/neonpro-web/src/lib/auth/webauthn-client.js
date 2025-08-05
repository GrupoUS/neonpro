"use strict";
/**
 * WebAuthn Client Utilities for TASK-002: Multi-Factor Authentication Enhancement
 *
 * Provides client-side WebAuthn/FIDO2 functionality including:
 * - Registration flow
 * - Authentication flow
 * - Browser compatibility checking
 * - Error handling
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
exports.getWebAuthnErrorMessage = exports.useWebAuthnCapabilities = exports.webAuthnClient = void 0;
var browser_1 = require("@simplewebauthn/browser");
var WebAuthnClient = /** @class */ (function () {
  function WebAuthnClient() {}
  /**
   * Check browser WebAuthn capabilities
   */
  WebAuthnClient.prototype.checkCapabilities = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supported, platformAuthenticatorAvailable, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            supported = (0, browser_1.browserSupportsWebAuthn)();
            platformAuthenticatorAvailable = false;
            if (!supported) return [3 /*break*/, 4];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, (0, browser_1.platformAuthenticatorIsAvailable)()];
          case 2:
            platformAuthenticatorAvailable = _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.warn("Could not check platform authenticator availability:", error_1);
            return [3 /*break*/, 4];
          case 4:
            return [
              2 /*return*/,
              {
                supported: supported,
                platformAuthenticatorAvailable: platformAuthenticatorAvailable,
                userAgent: navigator.userAgent,
              },
            ];
        }
      });
    });
  };
  /**
   * Register a new WebAuthn credential
   */
  WebAuthnClient.prototype.registerCredential = function (deviceName) {
    return __awaiter(this, void 0, void 0, function () {
      var capabilities,
        optionsResponse,
        error,
        options,
        registrationResponse,
        verificationResponse,
        error,
        error_2,
        errorMessage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            return [4 /*yield*/, this.checkCapabilities()];
          case 1:
            capabilities = _a.sent();
            if (!capabilities.supported) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "WebAuthn is not supported in this browser",
                },
              ];
            }
            return [
              4 /*yield*/,
              fetch("/api/auth/webauthn/register/options", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ deviceName: deviceName }),
              }),
            ];
          case 2:
            optionsResponse = _a.sent();
            if (!!optionsResponse.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, optionsResponse.text()];
          case 3:
            error = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: "Failed to get registration options: ".concat(error),
              },
            ];
          case 4:
            return [4 /*yield*/, optionsResponse.json()];
          case 5:
            options = _a.sent();
            return [4 /*yield*/, (0, browser_1.startRegistration)(options)];
          case 6:
            registrationResponse = _a.sent();
            return [
              4 /*yield*/,
              fetch("/api/auth/webauthn/register/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  response: registrationResponse,
                  deviceName: deviceName,
                }),
              }),
            ];
          case 7:
            verificationResponse = _a.sent();
            if (!!verificationResponse.ok) return [3 /*break*/, 9];
            return [4 /*yield*/, verificationResponse.text()];
          case 8:
            error = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: "Registration verification failed: ".concat(error),
              },
            ];
          case 9:
            return [
              2 /*return*/,
              {
                success: true,
                response: registrationResponse,
              },
            ];
          case 10:
            error_2 = _a.sent();
            console.error("WebAuthn registration error:", error_2);
            errorMessage = "Unknown error occurred";
            if (error_2 instanceof Error) {
              // Handle common WebAuthn errors
              if (error_2.name === "NotAllowedError") {
                errorMessage = "Operation was cancelled or timed out";
              } else if (error_2.name === "SecurityError") {
                errorMessage = "Security error - ensure you are on a secure connection";
              } else if (error_2.name === "NotSupportedError") {
                errorMessage = "This authenticator is not supported";
              } else if (error_2.name === "InvalidStateError") {
                errorMessage = "Authenticator already registered for this account";
              } else {
                errorMessage = error_2.message;
              }
            }
            return [
              2 /*return*/,
              {
                success: false,
                error: errorMessage,
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Authenticate with WebAuthn credential
   */
  WebAuthnClient.prototype.authenticateWithCredential = function (userIdentifier) {
    return __awaiter(this, void 0, void 0, function () {
      var capabilities,
        optionsResponse,
        error,
        options,
        authenticationResponse,
        verificationResponse,
        error,
        error_3,
        errorMessage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            return [4 /*yield*/, this.checkCapabilities()];
          case 1:
            capabilities = _a.sent();
            if (!capabilities.supported) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "WebAuthn is not supported in this browser",
                },
              ];
            }
            return [
              4 /*yield*/,
              fetch("/api/auth/webauthn/authenticate/options", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ userIdentifier: userIdentifier }),
              }),
            ];
          case 2:
            optionsResponse = _a.sent();
            if (!!optionsResponse.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, optionsResponse.text()];
          case 3:
            error = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: "Failed to get authentication options: ".concat(error),
              },
            ];
          case 4:
            return [4 /*yield*/, optionsResponse.json()];
          case 5:
            options = _a.sent();
            return [4 /*yield*/, (0, browser_1.startAuthentication)(options)];
          case 6:
            authenticationResponse = _a.sent();
            return [
              4 /*yield*/,
              fetch("/api/auth/webauthn/authenticate/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  response: authenticationResponse,
                  userIdentifier: userIdentifier,
                }),
              }),
            ];
          case 7:
            verificationResponse = _a.sent();
            if (!!verificationResponse.ok) return [3 /*break*/, 9];
            return [4 /*yield*/, verificationResponse.text()];
          case 8:
            error = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: "Authentication verification failed: ".concat(error),
              },
            ];
          case 9:
            return [
              2 /*return*/,
              {
                success: true,
                response: authenticationResponse,
              },
            ];
          case 10:
            error_3 = _a.sent();
            console.error("WebAuthn authentication error:", error_3);
            errorMessage = "Unknown error occurred";
            if (error_3 instanceof Error) {
              // Handle common WebAuthn errors
              if (error_3.name === "NotAllowedError") {
                errorMessage = "Operation was cancelled or timed out";
              } else if (error_3.name === "SecurityError") {
                errorMessage = "Security error - ensure you are on a secure connection";
              } else if (error_3.name === "InvalidStateError") {
                errorMessage = "No valid authenticator found";
              } else if (error_3.name === "UnknownError") {
                errorMessage = "Authentication failed - please try again";
              } else {
                errorMessage = error_3.message;
              }
            }
            return [
              2 /*return*/,
              {
                success: false,
                error: errorMessage,
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if WebAuthn is available and suggest best flow
   */
  WebAuthnClient.prototype.getSuggestedAuthFlow = function () {
    return __awaiter(this, void 0, void 0, function () {
      var capabilities, reasons;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.checkCapabilities()];
          case 1:
            capabilities = _a.sent();
            reasons = [];
            if (!capabilities.supported) {
              reasons.push("WebAuthn not supported in this browser");
              return [
                2 /*return*/,
                {
                  recommended: "password",
                  capabilities: capabilities,
                  reasons: reasons,
                },
              ];
            }
            if (capabilities.platformAuthenticatorAvailable) {
              reasons.push("Platform authenticator (Touch ID, Face ID, Windows Hello) available");
              return [
                2 /*return*/,
                {
                  recommended: "webauthn",
                  capabilities: capabilities,
                  reasons: reasons,
                },
              ];
            }
            // Check for security keys or external authenticators
            try {
              // This is a rough check - in a real implementation you might want to check
              // for registered credentials or use conditional mediation
              reasons.push("WebAuthn supported but no platform authenticator detected");
              return [
                2 /*return*/,
                {
                  recommended: "hybrid",
                  capabilities: capabilities,
                  reasons: reasons,
                },
              ];
            } catch (error) {
              reasons.push("WebAuthn available but limited support detected");
              return [
                2 /*return*/,
                {
                  recommended: "password",
                  capabilities: capabilities,
                  reasons: reasons,
                },
              ];
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Test WebAuthn functionality (for debugging)
   */
  WebAuthnClient.prototype.testWebAuthnSupport = function () {
    return __awaiter(this, void 0, void 0, function () {
      var errors, browserSupport, platformAuthenticator, error_4, conditionalMediation, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            errors = [];
            browserSupport = (0, browser_1.browserSupportsWebAuthn)();
            if (!browserSupport) {
              errors.push("Browser does not support WebAuthn");
            }
            platformAuthenticator = false;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, (0, browser_1.platformAuthenticatorIsAvailable)()];
          case 2:
            platformAuthenticator = _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            errors.push("Platform authenticator check failed: ".concat(error_4));
            return [3 /*break*/, 4];
          case 4:
            conditionalMediation = false;
            _a.label = 5;
          case 5:
            _a.trys.push([5, 7, , 8]);
            return [4 /*yield*/, PublicKeyCredential.isConditionalMediationAvailable()];
          case 6:
            conditionalMediation = _a.sent();
            return [3 /*break*/, 8];
          case 7:
            error_5 = _a.sent();
            errors.push("Conditional mediation check failed: ".concat(error_5));
            return [3 /*break*/, 8];
          case 8:
            return [
              2 /*return*/,
              {
                browserSupport: browserSupport,
                platformAuthenticator: platformAuthenticator,
                conditionalMediation: conditionalMediation,
                userAgent: navigator.userAgent,
                errors: errors,
              },
            ];
        }
      });
    });
  };
  return WebAuthnClient;
})();
// Export singleton instance
exports.webAuthnClient = new WebAuthnClient();
// Helper function for React components
var useWebAuthnCapabilities = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, exports.webAuthnClient.checkCapabilities()];
        case 1:
          return [2 /*return*/, _a.sent()];
      }
    });
  });
};
exports.useWebAuthnCapabilities = useWebAuthnCapabilities;
// Helper function to get user-friendly error messages
var getWebAuthnErrorMessage = function (error) {
  var errorMap = {
    NotAllowedError: "Authentication was cancelled or timed out. Please try again.",
    SecurityError: "Security error occurred. Make sure you are on a secure connection (HTTPS).",
    NotSupportedError: "This authenticator is not supported. Try a different device or method.",
    InvalidStateError: "Invalid state. The authenticator may already be registered or not found.",
    UnknownError: "An unexpected error occurred. Please try again.",
    AbortError: "Operation was aborted. Please try again.",
  };
  // Check if error starts with any known error type
  for (var _i = 0, _a = Object.entries(errorMap); _i < _a.length; _i++) {
    var _b = _a[_i],
      errorType = _b[0],
      message = _b[1];
    if (error.includes(errorType)) {
      return message;
    }
  }
  return error || "An unknown error occurred. Please try again.";
};
exports.getWebAuthnErrorMessage = getWebAuthnErrorMessage;
