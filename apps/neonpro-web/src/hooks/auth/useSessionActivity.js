// =====================================================
// useSessionActivity Hook - Automatic Activity Tracking
// Story 1.4: Session Management & Security
// =====================================================
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
exports.useSessionActivity = useSessionActivity;
exports.dispatchCustomActivity = dispatchCustomActivity;
exports.withActivityTracking = withActivityTracking;
exports.useBusinessActivityTracking = useBusinessActivityTracking;
var react_1 = require("react");
var useSession_1 = require("./useSession");
var navigation_1 = require("next/navigation");
var navigation_2 = require("next/navigation");
// =====================================================
// DEFAULT OPTIONS
// =====================================================
var DEFAULT_OPTIONS = {
  trackPageViews: true,
  trackClicks: true,
  trackFormSubmissions: true,
  trackScrolling: false,
  trackIdleTime: true,
  idleThresholdMs: 5 * 60 * 1000, // 5 minutes
  debounceMs: 1000, // 1 second
  excludePaths: ["/api", "/health", "/favicon.ico"],
  customActivities: [],
};
// =====================================================
// MAIN HOOK
// =====================================================
function useSessionActivity(options) {
  if (options === void 0) {
    options = {};
  }
  var config = __assign(__assign({}, DEFAULT_OPTIONS), options);
  var _a = (0, useSession_1.useSession)(),
    updateActivity = _a.updateActivity,
    isAuthenticated = _a.isAuthenticated;
  var router = (0, navigation_1.useRouter)();
  var pathname = (0, navigation_2.usePathname)();
  // State refs
  var activityHistoryRef = (0, react_1.useRef)([]);
  var lastActivityRef = (0, react_1.useRef)(null);
  var isIdleRef = (0, react_1.useRef)(false);
  var idleTimerRef = (0, react_1.useRef)(null);
  var debounceTimerRef = (0, react_1.useRef)(null);
  var scrollDebounceRef = (0, react_1.useRef)(null);
  // =====================================================
  // ACTIVITY TRACKING FUNCTIONS
  // =====================================================
  var trackActivity = (0, react_1.useCallback)(
    (activityType, metadata) =>
      __awaiter(this, void 0, void 0, function () {
        var now, activityEvent, error_1;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              if (!isAuthenticated) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 5, , 6]);
              now = new Date();
              activityEvent = {
                type: activityType,
                timestamp: now,
                metadata: metadata,
              };
              activityHistoryRef.current.push(activityEvent);
              // Keep only last 100 activities
              if (activityHistoryRef.current.length > 100) {
                activityHistoryRef.current = activityHistoryRef.current.slice(-100);
              }
              // Update last activity
              lastActivityRef.current = now;
              if (!isIdleRef.current) return [3 /*break*/, 3];
              isIdleRef.current = false;
              return [
                4 /*yield*/,
                updateActivity("idle_end", {
                  duration:
                    Date.now() -
                    (((_a = lastActivityRef.current) === null || _a === void 0
                      ? void 0
                      : _a.getTime()) || 0),
                }),
              ];
            case 2:
              _b.sent();
              _b.label = 3;
            case 3:
              // Reset idle timer
              resetIdleTimer();
              // Send to session manager
              return [
                4 /*yield*/,
                updateActivity(
                  activityType,
                  __assign(__assign({}, metadata), {
                    pathname: pathname,
                    timestamp: now.toISOString(),
                    userAgent: navigator.userAgent,
                  }),
                ),
              ];
            case 4:
              // Send to session manager
              _b.sent();
              return [3 /*break*/, 6];
            case 5:
              error_1 = _b.sent();
              console.error("Activity tracking error:", error_1);
              return [3 /*break*/, 6];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [isAuthenticated, updateActivity, pathname],
  );
  var debouncedTrackActivity = (0, react_1.useCallback)(
    (activityType, metadata) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        trackActivity(activityType, metadata);
      }, config.debounceMs);
    },
    [trackActivity, config.debounceMs],
  );
  // =====================================================
  // IDLE DETECTION
  // =====================================================
  var resetIdleTimer = (0, react_1.useCallback)(() => {
    if (!config.trackIdleTime) return;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var _a;
          return __generator(this, (_b) => {
            switch (_b.label) {
              case 0:
                if (isIdleRef.current) return [3 /*break*/, 2];
                isIdleRef.current = true;
                return [
                  4 /*yield*/,
                  trackActivity("idle_start", {
                    lastActivity:
                      (_a = lastActivityRef.current) === null || _a === void 0
                        ? void 0
                        : _a.toISOString(),
                  }),
                ];
              case 1:
                _b.sent();
                _b.label = 2;
              case 2:
                return [2 /*return*/];
            }
          });
        }),
      config.idleThresholdMs,
    );
  }, [config.trackIdleTime, config.idleThresholdMs, trackActivity]);
  // =====================================================
  // EVENT HANDLERS
  // =====================================================
  var handlePageView = (0, react_1.useCallback)(() => {
    if (!config.trackPageViews) return;
    if (config.excludePaths.some((path) => pathname.startsWith(path))) return;
    trackActivity("page_view", {
      path: pathname,
      referrer: document.referrer,
      title: document.title,
    });
  }, [config.trackPageViews, config.excludePaths, pathname, trackActivity]);
  var handleClick = (0, react_1.useCallback)(
    (event) => {
      var _a;
      if (!config.trackClicks) return;
      var target = event.target;
      var tagName = target.tagName.toLowerCase();
      var className = target.className;
      var id = target.id;
      var text =
        ((_a = target.textContent) === null || _a === void 0 ? void 0 : _a.slice(0, 100)) || "";
      debouncedTrackActivity("click", {
        tagName: tagName,
        className: className,
        id: id,
        text: text,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [config.trackClicks, debouncedTrackActivity],
  );
  var handleFormSubmit = (0, react_1.useCallback)(
    (event) => {
      if (!config.trackFormSubmissions) return;
      var form = event.target;
      var formData = new FormData(form);
      var fields = Array.from(formData.keys());
      trackActivity("form_submit", {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: fields.length,
        fields: fields.filter((field) => !field.toLowerCase().includes("password")),
      });
    },
    [config.trackFormSubmissions, trackActivity],
  );
  var handleScroll = (0, react_1.useCallback)(() => {
    if (!config.trackScrolling) return;
    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
    }
    scrollDebounceRef.current = setTimeout(() => {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight;
      var clientHeight = document.documentElement.clientHeight;
      var scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      debouncedTrackActivity("scroll", {
        scrollTop: scrollTop,
        scrollPercentage: scrollPercentage,
        scrollHeight: scrollHeight,
        clientHeight: clientHeight,
      });
    }, 500);
  }, [config.trackScrolling, debouncedTrackActivity]);
  var handleKeyPress = (0, react_1.useCallback)(
    (event) => {
      // Track specific key combinations
      if (event.ctrlKey || event.metaKey) {
        debouncedTrackActivity("keyboard_shortcut", {
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        });
      }
    },
    [debouncedTrackActivity],
  );
  var handleVisibilityChange = (0, react_1.useCallback)(() => {
    if (document.hidden) {
      trackActivity("page_hidden", {
        timestamp: new Date().toISOString(),
      });
    } else {
      trackActivity("page_visible", {
        timestamp: new Date().toISOString(),
      });
    }
  }, [trackActivity]);
  var handleBeforeUnload = (0, react_1.useCallback)(() => {
    trackActivity("page_unload", {
      timestamp: new Date().toISOString(),
      sessionDuration: lastActivityRef.current ? Date.now() - lastActivityRef.current.getTime() : 0,
    });
  }, [trackActivity]);
  // =====================================================
  // EFFECTS
  // =====================================================
  // Track page view on pathname change
  (0, react_1.useEffect)(() => {
    if (isAuthenticated) {
      handlePageView();
    }
  }, [pathname, isAuthenticated, handlePageView]);
  // Set up event listeners
  (0, react_1.useEffect)(() => {
    if (!isAuthenticated) return;
    // Add event listeners
    if (config.trackClicks) {
      document.addEventListener("click", handleClick, { passive: true });
    }
    if (config.trackFormSubmissions) {
      document.addEventListener("submit", handleFormSubmit);
    }
    if (config.trackScrolling) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    // Mouse movement for idle detection
    var handleMouseMove = () => resetIdleTimer();
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    // Initial idle timer
    resetIdleTimer();
    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleFormSubmit);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, [
    isAuthenticated,
    config,
    handleClick,
    handleFormSubmit,
    handleScroll,
    handleKeyPress,
    handleVisibilityChange,
    handleBeforeUnload,
    resetIdleTimer,
  ]);
  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================
  var getActivityHistory = (0, react_1.useCallback)(
    () => __spreadArray([], activityHistoryRef.current, true),
    [],
  );
  var clearActivityHistory = (0, react_1.useCallback)(() => {
    activityHistoryRef.current = [];
  }, []);
  // =====================================================
  // CUSTOM ACTIVITY TRACKING
  // =====================================================
  // Track custom activities defined in options
  (0, react_1.useEffect)(() => {
    if (!isAuthenticated || config.customActivities.length === 0) return;
    var handleCustomActivity = (event) => {
      if (config.customActivities.includes(event.type)) {
        trackActivity(event.type, event.detail);
      }
    };
    // Listen for custom events
    config.customActivities.forEach((activityType) => {
      document.addEventListener(activityType, handleCustomActivity);
    });
    return () => {
      config.customActivities.forEach((activityType) => {
        document.removeEventListener(activityType, handleCustomActivity);
      });
    };
  }, [isAuthenticated, config.customActivities, trackActivity]);
  // =====================================================
  // RETURN HOOK INTERFACE
  // =====================================================
  return {
    trackActivity: trackActivity,
    getActivityHistory: getActivityHistory,
    isIdle: isIdleRef.current,
    lastActivity: lastActivityRef.current,
    clearActivityHistory: clearActivityHistory,
  };
}
// =====================================================
// UTILITY FUNCTIONS FOR CUSTOM EVENTS
// =====================================================
/**
 * Dispatch a custom activity event
 */
function dispatchCustomActivity(activityType, metadata) {
  var event = new CustomEvent(activityType, {
    detail: metadata,
  });
  document.dispatchEvent(event);
}
/**
 * Higher-order component to automatically track component interactions
 */
function withActivityTracking(Component, activityType) {
  return function TrackedComponent(props) {
    var trackActivity = useSessionActivity().trackActivity;
    (0, react_1.useEffect)(() => {
      trackActivity("component_mount_".concat(activityType), {
        componentName: Component.displayName || Component.name,
      });
      return () => {
        trackActivity("component_unmount_".concat(activityType), {
          componentName: Component.displayName || Component.name,
        });
      };
    }, [trackActivity]);
    return __assign({}, props) /  >
        ;
  };
}
/**
 * Hook for tracking specific business actions
 */
function useBusinessActivityTracking() {
  var trackActivity = useSessionActivity().trackActivity;
  return {
    trackPurchase: (metadata) => trackActivity("purchase", metadata),
    trackSearch: (query, results) => trackActivity("search", { query: query, results: results }),
    trackDownload: (filename, fileType) =>
      trackActivity("download", { filename: filename, fileType: fileType }),
    trackShare: (content, platform) =>
      trackActivity("share", { content: content, platform: platform }),
    trackError: (error, context) => trackActivity("error", { error: error, context: context }),
    trackFeatureUsage: (feature, metadata) =>
      trackActivity("feature_usage", __assign({ feature: feature }, metadata)),
  };
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = useSessionActivity;
