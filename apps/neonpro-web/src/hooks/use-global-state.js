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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalStateProvider = GlobalStateProvider;
exports.useGlobalState = useGlobalState;
exports.useUserPreferences = useUserPreferences;
exports.useAppSettings = useAppSettings;
exports.useCurrentUser = useCurrentUser;
exports.useLoadingStates = useLoadingStates;
exports.useErrorStates = useErrorStates;
exports.useOperationState = useOperationState;
exports.useTemporaryState = useTemporaryState;
var react_1 = require("react");
var react_2 = require("react");
var GlobalStateContext = (0, react_2.createContext)(null);
function GlobalStateProvider(_a) {
  var children = _a.children,
    _b = _a.persistKeys,
    persistKeys = _b === void 0 ? [] : _b;
  var stateRef = (0, react_1.useRef)(new Map());
  var subscribersRef = (0, react_1.useRef)(new Map());
  var _c = (0, react_1.useState)({}),
    forceUpdate = _c[1];
  // Initialize persisted state
  (0, react_1.useEffect)(
    function () {
      if (typeof window !== "undefined") {
        persistKeys.forEach(function (key) {
          try {
            var stored = localStorage.getItem("neonpro_state_".concat(key));
            if (stored) {
              stateRef.current.set(key, JSON.parse(stored));
            }
          } catch (error) {
            console.warn("Failed to load persisted state for key: ".concat(key), error);
          }
        });
      }
    },
    [persistKeys],
  );
  var getState = (0, react_1.useCallback)(function (key) {
    return stateRef.current.get(key);
  }, []);
  var setState = (0, react_1.useCallback)(
    function (key, value) {
      var currentValue = stateRef.current.get(key);
      var newValue = typeof value === "function" ? value(currentValue) : value;
      stateRef.current.set(key, newValue);
      // Persist if key is in persistKeys
      if (persistKeys.includes(key) && typeof window !== "undefined") {
        try {
          localStorage.setItem("neonpro_state_".concat(key), JSON.stringify(newValue));
        } catch (error) {
          console.warn("Failed to persist state for key: ".concat(key), error);
        }
      }
      // Notify subscribers
      var subscribers = subscribersRef.current.get(key);
      if (subscribers) {
        subscribers.forEach(function (callback) {
          try {
            callback(newValue);
          } catch (error) {
            console.error("Error in state subscriber for key: ".concat(key), error);
          }
        });
      }
    },
    [persistKeys],
  );
  var subscribe = (0, react_1.useCallback)(function (key, callback) {
    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set());
    }
    var subscribers = subscribersRef.current.get(key);
    subscribers.add(callback);
    // Return unsubscribe function
    return function () {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        subscribersRef.current.delete(key);
      }
    };
  }, []);
  var clearState = (0, react_1.useCallback)(
    function (key) {
      stateRef.current.delete(key);
      if (persistKeys.includes(key) && typeof window !== "undefined") {
        localStorage.removeItem("neonpro_state_".concat(key));
      }
      // Notify subscribers
      var subscribers = subscribersRef.current.get(key);
      if (subscribers) {
        subscribers.forEach(function (callback) {
          return callback(undefined);
        });
      }
    },
    [persistKeys],
  );
  var clearAllState = (0, react_1.useCallback)(
    function () {
      var keys = Array.from(stateRef.current.keys());
      stateRef.current.clear();
      if (typeof window !== "undefined") {
        persistKeys.forEach(function (key) {
          localStorage.removeItem("neonpro_state_".concat(key));
        });
      }
      // Notify all subscribers
      keys.forEach(function (key) {
        var subscribers = subscribersRef.current.get(key);
        if (subscribers) {
          subscribers.forEach(function (callback) {
            return callback(undefined);
          });
        }
      });
    },
    [persistKeys],
  );
  var contextValue = {
    getState: getState,
    setState: setState,
    subscribe: subscribe,
    clearState: clearState,
    clearAllState: clearAllState,
  };
  return (value =
    { contextValue: contextValue } > { children: children } < /.;>CGPSaabdeeeillnooorrttttvx);
}
// =====================================================================================
// GLOBAL STATE HOOK
// =====================================================================================
function useGlobalState(key, initialValue) {
  var context = (0, react_2.useContext)(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  var getState = context.getState,
    setState = context.setState,
    subscribe = context.subscribe;
  var _a = (0, react_1.useState)(function () {
      var existing = getState(key);
      return existing !== undefined ? existing : initialValue;
    }),
    localState = _a[0],
    setLocalState = _a[1];
  // Subscribe to state changes
  (0, react_1.useEffect)(
    function () {
      var unsubscribe = subscribe(key, function (newValue) {
        setLocalState(newValue);
      });
      return unsubscribe;
    },
    [key, subscribe],
  );
  // Initialize state if it doesn't exist
  (0, react_1.useEffect)(
    function () {
      if (initialValue !== undefined && getState(key) === undefined) {
        setState(key, initialValue);
      }
    },
    [key, initialValue, getState, setState],
  );
  var setGlobalState = (0, react_1.useCallback)(
    function (value) {
      setState(key, value);
    },
    [key, setState],
  );
  return [localState, setGlobalState];
}
// =====================================================================================
// SPECIALIZED HOOKS
// =====================================================================================
// User preferences hook
function useUserPreferences() {
  return useGlobalState("userPreferences", {
    theme: "light",
    language: "pt-BR",
    notifications: true,
    autoSave: true,
    compactMode: false,
  });
}
// App settings hook
function useAppSettings() {
  return useGlobalState("appSettings", {
    sidebarCollapsed: false,
    defaultView: "dashboard",
    refreshInterval: 30000,
    maxRetries: 3,
    timeout: 10000,
  });
}
// Current user hook
function useCurrentUser() {
  return useGlobalState("currentUser", null);
}
// Loading states hook
function useLoadingStates() {
  return useGlobalState("loadingStates", {});
}
// Error states hook
function useErrorStates() {
  return useGlobalState("errorStates", {});
}
// =====================================================================================
// UTILITY HOOKS
// =====================================================================================
// Hook for managing loading state of specific operations
function useOperationState(operationKey) {
  var _a = useLoadingStates(),
    loadingStates = _a[0],
    setLoadingStates = _a[1];
  var _b = useErrorStates(),
    errorStates = _b[0],
    setErrorStates = _b[1];
  var setLoading = (0, react_1.useCallback)(
    function (loading) {
      setLoadingStates(function (prev) {
        var _a;
        return __assign(__assign({}, prev), ((_a = {}), (_a[operationKey] = loading), _a));
      });
    },
    [operationKey, setLoadingStates],
  );
  var setError = (0, react_1.useCallback)(
    function (error) {
      setErrorStates(function (prev) {
        var _a;
        return __assign(__assign({}, prev), ((_a = {}), (_a[operationKey] = error), _a));
      });
    },
    [operationKey, setErrorStates],
  );
  var clearError = (0, react_1.useCallback)(
    function () {
      setError(null);
    },
    [setError],
  );
  return {
    isLoading:
      (loadingStates === null || loadingStates === void 0 ? void 0 : loadingStates[operationKey]) ||
      false,
    error:
      (errorStates === null || errorStates === void 0 ? void 0 : errorStates[operationKey]) || null,
    setLoading: setLoading,
    setError: setError,
    clearError: clearError,
  };
}
// Hook for temporary state that auto-clears
function useTemporaryState(key, initialValue, timeoutMs) {
  if (timeoutMs === void 0) {
    timeoutMs = 5000;
  }
  var _a = useGlobalState(key, initialValue),
    state = _a[0],
    setState = _a[1];
  var timeoutRef = (0, react_1.useRef)();
  var setTemporaryState = (0, react_1.useCallback)(
    function (value) {
      setState(value);
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set new timeout to reset state
      timeoutRef.current = setTimeout(function () {
        setState(initialValue);
      }, timeoutMs);
    },
    [setState, initialValue, timeoutMs],
  );
  // Cleanup timeout on unmount
  (0, react_1.useEffect)(function () {
    return function () {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return [state, setTemporaryState];
}
exports.default = useGlobalState;
