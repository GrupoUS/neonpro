/**
 * WebAuthn Manager Component
 * TASK-002: Multi-Factor Authentication Enhancement
 *
 * Provides UI for WebAuthn credential management including:
 * - Registration of new credentials
 * - Viewing existing credentials
 * - Removing credentials
 * - Testing browser compatibility
 */
"use client";
"use strict";
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
exports.WebAuthnManager = WebAuthnManager;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var webauthn_client_1 = require("@/lib/auth/webauthn-client");
function WebAuthnManager() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    credentials = _a[0],
    setCredentials = _a[1];
  var _b = (0, react_1.useState)(null),
    capabilities = _b[0],
    setCapabilities = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(false),
    registering = _d[0],
    setRegistering = _d[1];
  var _e = (0, react_1.useState)(""),
    deviceName = _e[0],
    setDeviceName = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)(null),
    success = _g[0],
    setSuccess = _g[1];
  (0, react_1.useEffect)(function () {
    checkCapabilities();
    loadCredentials();
  }, []);
  var checkCapabilities = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var caps, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, webauthn_client_1.webAuthnClient.checkCapabilities()];
          case 1:
            caps = _a.sent();
            setCapabilities(caps);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to check WebAuthn capabilities:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadCredentials = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            return [4 /*yield*/, fetch("/api/auth/webauthn/credentials")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setCredentials(data.credentials || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to load credentials:", error_2);
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRegister = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (
              !(capabilities === null || capabilities === void 0 ? void 0 : capabilities.supported)
            ) {
              setError("WebAuthn is not supported in this browser");
              return [2 /*return*/];
            }
            setRegistering(true);
            setError(null);
            setSuccess(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            return [
              4 /*yield*/,
              webauthn_client_1.webAuthnClient.registerCredential(deviceName || undefined),
            ];
          case 2:
            result = _a.sent();
            if (!result.success) return [3 /*break*/, 4];
            setSuccess("WebAuthn credential registered successfully!");
            setDeviceName("");
            return [4 /*yield*/, loadCredentials()];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            setError(result.error || "Registration failed");
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_3 = _a.sent();
            setError(error_3 instanceof Error ? error_3.message : "Registration failed");
            return [3 /*break*/, 8];
          case 7:
            setRegistering(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRemove = function (credentialId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/auth/webauthn/credentials/".concat(credentialId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            setSuccess("Credential removed successfully");
            return [4 /*yield*/, loadCredentials()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            setError("Failed to remove credential");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_4 = _a.sent();
            setError("Failed to remove credential");
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var getDeviceIcon = function (deviceType) {
    switch (deviceType) {
      case "platform":
        return <lucide_react_1.Fingerprint className="h-4 w-4" />;
      case "cross-platform":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      default:
        return <lucide_react_1.Smartphone className="h-4 w-4" />;
    }
  };
  var getDeviceTypeLabel = function (deviceType) {
    switch (deviceType) {
      case "platform":
        return "Built-in (Touch ID, Face ID, Windows Hello)";
      case "cross-platform":
        return "Security Key";
      default:
        return "Unknown";
    }
  };
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="flex items-center justify-center p-6">
          <lucide_react_1.Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading WebAuthn settings...</span>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Browser Compatibility Status */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5" />
            WebAuthn Security
          </card_1.CardTitle>
          <card_1.CardDescription>
            Passwordless authentication using biometrics or security keys
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {capabilities && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {capabilities.supported
                  ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
                  : <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500" />}
                <span className="text-sm">
                  WebAuthn Support: {capabilities.supported ? "Available" : "Not Available"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {capabilities.platformAuthenticatorAvailable
                  ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
                  : <lucide_react_1.AlertCircle className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm">
                  Platform Authenticator:{" "}
                  {capabilities.platformAuthenticatorAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          )}

          {!(capabilities === null || capabilities === void 0
            ? void 0
            : capabilities.supported) && (
            <alert_1.Alert>
              <lucide_react_1.AlertCircle className="h-4 w-4" />
              <alert_1.AlertDescription>
                Your browser does not support WebAuthn. Please use a modern browser like Chrome,
                Firefox, Safari, or Edge.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Add New Credential */}
      {(capabilities === null || capabilities === void 0 ? void 0 : capabilities.supported) && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Plus className="h-5 w-5" />
              Add New Authenticator
            </card_1.CardTitle>
            <card_1.CardDescription>
              Register a new biometric authenticator or security key
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="deviceName">Device Name (Optional)</label_1.Label>
              <input_1.Input
                id="deviceName"
                placeholder="e.g., iPhone Touch ID, YubiKey 5"
                value={deviceName}
                onChange={function (e) {
                  return setDeviceName(e.target.value);
                }}
                disabled={registering}
              />
            </div>

            <button_1.Button onClick={handleRegister} disabled={registering} className="w-full">
              {registering
                ? <>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                : <>
                    <lucide_react_1.Fingerprint className="mr-2 h-4 w-4" />
                    Register New Authenticator
                  </>}
            </button_1.Button>

            {error && (
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertCircle className="h-4 w-4" />
                <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            {success && (
              <alert_1.Alert>
                <lucide_react_1.CheckCircle className="h-4 w-4" />
                <alert_1.AlertDescription>{success}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Existing Credentials */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Your Authenticators</card_1.CardTitle>
          <card_1.CardDescription>
            Manage your registered biometric authenticators and security keys
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {credentials.length === 0
            ? <div className="text-center py-6 text-muted-foreground">
                No authenticators registered yet.
              </div>
            : <div className="space-y-3">
                {credentials.map(function (credential) {
                  return (
                    <div
                      key={credential.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(credential.device_type)}
                        <div>
                          <div className="font-medium">
                            {credential.device_name || "Unnamed Device"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getDeviceTypeLabel(credential.device_type)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Added: {new Date(credential.created_at).toLocaleDateString()}
                            {credential.last_used_at && (
                              <span className="ml-2">
                                Last used: {new Date(credential.last_used_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <badge_1.Badge variant={credential.is_active ? "default" : "secondary"}>
                          {credential.is_active ? "Active" : "Inactive"}
                        </badge_1.Badge>
                        <button_1.Button
                          variant="ghost"
                          size="sm"
                          onClick={function () {
                            return handleRemove(credential.credential_id);
                          }}
                        >
                          <lucide_react_1.Trash2 className="h-4 w-4" />
                        </button_1.Button>
                      </div>
                    </div>
                  );
                })}
              </div>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
