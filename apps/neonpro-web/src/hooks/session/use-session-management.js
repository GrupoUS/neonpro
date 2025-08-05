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
exports.useSessionManagement = useSessionManagement;
var react_1 = require("react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var session_config_1 = require("@/lib/auth/config/session-config");
function useSessionManagement() {
  var _a;
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var _b = (0, react_1.useState)({
      currentSession: null,
      devices: [],
      securityEvents: [],
      analytics: null,
      suspiciousActivities: [],
      isLoading: false,
      error: null,
    }),
    state = _b[0],
    setState = _b[1];
  // Initialize session management
  (0, react_1.useEffect)(() => {
    initializeSession();
    // Set up periodic session validation
    var interval = setInterval(() => {
      validateSession();
    }, session_config_1.SessionConfig.security.sessionValidationInterval);
    return () => clearInterval(interval);
  }, []);
  var initializeSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var session, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setState((prev) => __assign(__assign({}, prev), { isLoading: true, error: null }));
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              return [4 /*yield*/, supabase.auth.getSession()];
            case 2:
              session = _a.sent().data.session;
              if (!(session === null || session === void 0 ? void 0 : session.user))
                return [3 /*break*/, 4];
              // Load session data
              return [
                4 /*yield*/,
                Promise.all([
                  loadCurrentSession(session.user.id),
                  loadDevices(session.user.id),
                  loadSecurityEvents(session.user.id),
                  loadAnalytics(session.user.id),
                ]),
              ];
            case 3:
              // Load session data
              _a.sent();
              _a.label = 4;
            case 4:
              return [3 /*break*/, 7];
            case 5:
              error_1 = _a.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error:
                    error_1 instanceof Error ? error_1.message : "Failed to initialize session",
                }),
              );
              return [3 /*break*/, 7];
            case 6:
              setState((prev) => __assign(__assign({}, prev), { isLoading: false }));
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  var loadCurrentSession = (userId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data_1, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/auth/session", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data_1 = _a.sent();
            setState((prev) => __assign(__assign({}, prev), { currentSession: data_1.session }));
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to load current session:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadDevices = (userId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data_2, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/auth/session/devices", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data_2 = _a.sent();
            setState((prev) => __assign(__assign({}, prev), { devices: data_2.devices || [] }));
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Failed to load devices:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadSecurityEvents = (userId, filters) =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data_3, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            params = new URLSearchParams();
            if (filters === null || filters === void 0 ? void 0 : filters.eventType)
              params.append("eventType", filters.eventType);
            if (filters === null || filters === void 0 ? void 0 : filters.severity)
              params.append("severity", filters.severity);
            if (filters === null || filters === void 0 ? void 0 : filters.limit)
              params.append("limit", filters.limit.toString());
            if (filters === null || filters === void 0 ? void 0 : filters.offset)
              params.append("offset", filters.offset.toString());
            if (filters === null || filters === void 0 ? void 0 : filters.startDate)
              params.append("startDate", filters.startDate);
            if (filters === null || filters === void 0 ? void 0 : filters.endDate)
              params.append("endDate", filters.endDate);
            return [
              4 /*yield*/,
              fetch("/api/auth/session/security?".concat(params), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data_3 = _a.sent();
            setState((prev) =>
              __assign(__assign({}, prev), {
                securityEvents: data_3.events || [],
                suspiciousActivities: data_3.suspiciousActivities || [],
              }),
            );
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Failed to load security events:", error_4);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadAnalytics = (userId_1) => {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(
      this,
      __spreadArray([userId_1], args_1, true),
      void 0,
      function (userId, timeframe) {
        var response, data_4, error_5;
        if (timeframe === void 0) {
          timeframe = "7d";
        }
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/analytics?timeframe=".concat(timeframe), {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data_4 = _a.sent();
              setState((prev) => __assign(__assign({}, prev), { analytics: data_4.analytics }));
              _a.label = 3;
            case 3:
              return [3 /*break*/, 5];
            case 4:
              error_5 = _a.sent();
              console.error("Failed to load analytics:", error_5);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  // Session operations
  var refreshSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data_5, error_6;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setState((prev) => __assign(__assign({}, prev), { isLoading: true, error: null }));
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, 7, 8]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/refresh", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 4];
              return [4 /*yield*/, response.json()];
            case 3:
              data_5 = _a.sent();
              setState((prev) => __assign(__assign({}, prev), { currentSession: data_5.session }));
              // Update local storage
              session_utils_1.SessionStorage.updateSession(data_5.session);
              return [3 /*break*/, 5];
            case 4:
              throw new Error("Failed to refresh session");
            case 5:
              return [3 /*break*/, 8];
            case 6:
              error_6 = _a.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error: error_6 instanceof Error ? error_6.message : "Failed to refresh session",
                }),
              );
              return [3 /*break*/, 8];
            case 7:
              setState((prev) => __assign(__assign({}, prev), { isLoading: false }));
              return [7 /*endfinally*/];
            case 8:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var extendSession = (0, react_1.useCallback)(
    (minutes) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data_6, error_7;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/extend", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ extendMinutes: minutes }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data_6 = _a.sent();
              setState((prev) => __assign(__assign({}, prev), { currentSession: data_6.session }));
              return [2 /*return*/, true];
            case 3:
              return [2 /*return*/, false];
            case 4:
              error_7 = _a.sent();
              console.error("Failed to extend session:", error_7);
              return [2 /*return*/, false];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var terminateSession = (0, react_1.useCallback)(
    (sessionId) =>
      __awaiter(this, void 0, void 0, function () {
        var response, error_8;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/terminate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId: sessionId }),
                }),
              ];
            case 1:
              response = _b.sent();
              if (response.ok) {
                if (
                  !sessionId ||
                  sessionId ===
                    ((_a = state.currentSession) === null || _a === void 0 ? void 0 : _a.id)
                ) {
                  setState((prev) => __assign(__assign({}, prev), { currentSession: null }));
                  session_utils_1.SessionStorage.clearSession();
                }
                return [2 /*return*/, true];
              }
              return [2 /*return*/, false];
            case 2:
              error_8 = _b.sent();
              console.error("Failed to terminate session:", error_8);
              return [2 /*return*/, false];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [(_a = state.currentSession) === null || _a === void 0 ? void 0 : _a.id],
  );
  var validateSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, error_9;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/validate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              return [2 /*return*/, data.valid];
            case 3:
              return [2 /*return*/, false];
            case 4:
              error_9 = _a.sent();
              console.error("Failed to validate session:", error_9);
              return [2 /*return*/, false];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Device operations
  var registerDevice = (0, react_1.useCallback)(
    (deviceInfo) =>
      __awaiter(this, void 0, void 0, function () {
        var deviceFingerprint, deviceData, _a, response, data_7, error_10;
        var _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 5, , 6]);
              deviceFingerprint = session_utils_1.SessionUtils.generateDeviceFingerprint();
              _a = [__assign({}, deviceInfo)];
              _b = {
                fingerprint: deviceFingerprint,
                deviceType: session_utils_1.SessionUtils.getDeviceType(),
                deviceName: session_utils_1.SessionUtils.getDeviceName(),
                userAgent: navigator.userAgent,
              };
              return [4 /*yield*/, session_utils_1.SessionUtils.getClientIP()];
            case 1:
              deviceData = __assign.apply(void 0, _a.concat([((_b.ipAddress = _c.sent()), _b)]));
              return [
                4 /*yield*/,
                fetch("/api/auth/session/devices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(deviceData),
                }),
              ];
            case 2:
              response = _c.sent();
              if (!response.ok) return [3 /*break*/, 4];
              return [4 /*yield*/, response.json()];
            case 3:
              data_7 = _c.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  devices: __spreadArray(
                    __spreadArray([], prev.devices, true),
                    [data_7.device],
                    false,
                  ),
                }),
              );
              return [2 /*return*/, true];
            case 4:
              return [2 /*return*/, false];
            case 5:
              error_10 = _c.sent();
              console.error("Failed to register device:", error_10);
              return [2 /*return*/, false];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var updateDevice = (0, react_1.useCallback)(
    (deviceId, updates) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data_8, error_11;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/devices", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(__assign({ deviceId: deviceId }, updates)),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data_8 = _a.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  devices: prev.devices.map((device) =>
                    device.id === deviceId ? data_8.device : device,
                  ),
                }),
              );
              return [2 /*return*/, true];
            case 3:
              return [2 /*return*/, false];
            case 4:
              error_11 = _a.sent();
              console.error("Failed to update device:", error_11);
              return [2 /*return*/, false];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var removeDevice = (0, react_1.useCallback)(
    (deviceId) =>
      __awaiter(this, void 0, void 0, function () {
        var response, error_12;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/devices", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ deviceId: deviceId }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (response.ok) {
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    devices: prev.devices.filter((device) => device.id !== deviceId),
                  }),
                );
                return [2 /*return*/, true];
              }
              return [2 /*return*/, false];
            case 2:
              error_12 = _a.sent();
              console.error("Failed to remove device:", error_12);
              return [2 /*return*/, false];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var trustDevice = (0, react_1.useCallback)(
    (deviceId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => [
          2 /*return*/,
          updateDevice(deviceId, { isTrusted: true }),
        ]);
      }),
    [updateDevice],
  );
  var untrustDevice = (0, react_1.useCallback)(
    (deviceId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => [
          2 /*return*/,
          updateDevice(deviceId, { isTrusted: false }),
        ]);
      }),
    [updateDevice],
  );
  // Security operations
  var getSecurityEvents = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              user = _a.sent().data.user;
              if (!user) return [3 /*break*/, 3];
              return [4 /*yield*/, loadSecurityEvents(user.id, filters)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  var createSecurityEvent = (0, react_1.useCallback)(
    (event) =>
      __awaiter(this, void 0, void 0, function () {
        var response, error_13;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/auth/session/security", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(event),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              // Refresh security events
              return [4 /*yield*/, getSecurityEvents()];
            case 2:
              // Refresh security events
              _a.sent();
              return [2 /*return*/, true];
            case 3:
              return [2 /*return*/, false];
            case 4:
              error_13 = _a.sent();
              console.error("Failed to create security event:", error_13);
              return [2 /*return*/, false];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [getSecurityEvents],
  );
  var dismissAlert = (0, react_1.useCallback)(
    (eventId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          try {
            setState((prev) =>
              __assign(__assign({}, prev), {
                securityEvents: prev.securityEvents.map((event) =>
                  event.id === eventId ? __assign(__assign({}, event), { dismissed: true }) : event,
                ),
              }),
            );
            return [2 /*return*/, true];
          } catch (error) {
            console.error("Failed to dismiss alert:", error);
            return [2 /*return*/, false];
          }
          return [2 /*return*/];
        });
      }),
    [],
  );
  // Analytics operations
  var getAnalytics = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (timeframe) {
      var user;
      if (timeframe === void 0) {
        timeframe = "7d";
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _a.sent().data.user;
            if (!user) return [3 /*break*/, 3];
            return [4 /*yield*/, loadAnalytics(user.id, timeframe)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, [supabase]);
  var getSessionStatus = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var user, response, data_9, error_14;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              user = _a.sent().data.user;
              if (!user) return [2 /*return*/];
              return [
                4 /*yield*/,
                fetch("/api/auth/session/analytics", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user.id }),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 4];
              return [4 /*yield*/, response.json()];
            case 3:
              data_9 = _a.sent();
              setState((prev) => __assign(__assign({}, prev), { analytics: data_9.status }));
              _a.label = 4;
            case 4:
              return [3 /*break*/, 6];
            case 5:
              error_14 = _a.sent();
              console.error("Failed to get session status:", error_14);
              return [3 /*break*/, 6];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  // Utility operations
  var clearError = (0, react_1.useCallback)(() => {
    setState((prev) => __assign(__assign({}, prev), { error: null }));
  }, []);
  var refreshAll = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, initializeSession()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [initializeSession],
  );
  return __assign(__assign({}, state), {
    // Actions
    refreshSession: refreshSession,
    extendSession: extendSession,
    terminateSession: terminateSession,
    validateSession: validateSession,
    registerDevice: registerDevice,
    updateDevice: updateDevice,
    removeDevice: removeDevice,
    trustDevice: trustDevice,
    untrustDevice: untrustDevice,
    getSecurityEvents: getSecurityEvents,
    createSecurityEvent: createSecurityEvent,
    dismissAlert: dismissAlert,
    getAnalytics: getAnalytics,
    getSessionStatus: getSessionStatus,
    clearError: clearError,
    refreshAll: refreshAll,
  });
}
