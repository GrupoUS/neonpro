"use client";
"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.SkeletonForm = exports.SkeletonTable = exports.SkeletonCard = void 0;
exports.LazyLoader = LazyLoader;
exports.createLazyComponent = createLazyComponent;
exports.IntersectionLazyLoader = IntersectionLazyLoader;
exports.useLazyPreload = useLazyPreload;
exports.useComponentVisibility = useComponentVisibility;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var utils_1 = require("@/lib/utils");
// =====================================================================================
// ENHANCED LAZY LOADER COMPONENT
// =====================================================================================
function LazyLoader(_a) {
  var children = _a.children,
    fallback = _a.fallback,
    errorFallback = _a.errorFallback,
    className = _a.className,
    _b = _a.minLoadingTime,
    minLoadingTime = _b === void 0 ? 200 : _b,
    _c = _a.retryable,
    retryable = _c === void 0 ? true : _c,
    onError = _a.onError,
    onLoad = _a.onLoad;
  var _d = (0, react_1.useState)(false),
    hasError = _d[0],
    setHasError = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(0),
    retryCount = _f[0],
    setRetryCount = _f[1];
  var loadingStartTime = (0, react_1.useRef)(Date.now());
  var mounted = (0, react_1.useRef)(true);
  (0, react_1.useEffect)(function () {
    return function () {
      mounted.current = false;
    };
  }, []);
  var handleLoad = (0, react_1.useCallback)(
    function () {
      var elapsed = Date.now() - loadingStartTime.current;
      var remainingTime = Math.max(0, minLoadingTime - elapsed);
      setTimeout(function () {
        if (mounted.current) {
          setIsLoading(false);
          onLoad === null || onLoad === void 0 ? void 0 : onLoad();
        }
      }, remainingTime);
    },
    [minLoadingTime, onLoad],
  );
  var handleError = (0, react_1.useCallback)(
    function (error) {
      if (mounted.current) {
        setHasError(true);
        setIsLoading(false);
        onError === null || onError === void 0 ? void 0 : onError(error);
      }
    },
    [onError],
  );
  var handleRetry = (0, react_1.useCallback)(function () {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(function (prev) {
      return prev + 1;
    });
    loadingStartTime.current = Date.now();
  }, []);
  (0, react_1.useEffect)(
    function () {
      if (!hasError && !isLoading) {
        handleLoad();
      }
    },
    [hasError, isLoading, handleLoad],
  );
  if (hasError) {
    return (
      <ErrorFallback
        error={new Error("Component failed to load")}
        onRetry={retryable ? handleRetry : undefined}
        retryCount={retryCount}
        customFallback={errorFallback}
        className={className}
      />
    );
  }
  return (
    <div className={className}>
      <ErrorBoundary onError={handleError}>
        <react_1.Suspense
          fallback={
            fallback || (
              <LoadingFallback minLoadingTime={minLoadingTime} onLoadComplete={handleLoad} />
            )
          }
        >
          {children}
        </react_1.Suspense>
      </ErrorBoundary>
    </div>
  );
}
var ErrorBoundary = /** @class */ (function (_super) {
  __extends(ErrorBoundary, _super);
  function ErrorBoundary(props) {
    var _this = _super.call(this, props) || this;
    _this.state = { hasError: false };
    return _this;
  }
  ErrorBoundary.getDerivedStateFromError = function (error) {
    return { hasError: true, error: error };
  };
  ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
    var _a, _b;
    console.error("LazyLoader Error:", error, errorInfo);
    (_b = (_a = this.props).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
  };
  ErrorBoundary.prototype.render = function () {
    if (this.state.hasError) {
      throw this.state.error;
    }
    return this.props.children;
  };
  return ErrorBoundary;
})(react_1.default.Component);
function LoadingFallback(_a) {
  var _b = _a.minLoadingTime,
    minLoadingTime = _b === void 0 ? 200 : _b,
    onLoadComplete = _a.onLoadComplete,
    _c = _a.message,
    message = _c === void 0 ? "Loading component..." : _c,
    _d = _a.showProgress,
    showProgress = _d === void 0 ? false : _d;
  var _e = (0, react_1.useState)(0),
    progress = _e[0],
    setProgress = _e[1];
  var startTime = (0, react_1.useRef)(Date.now());
  (0, react_1.useEffect)(
    function () {
      if (!showProgress) return;
      var interval = setInterval(function () {
        var elapsed = Date.now() - startTime.current;
        var newProgress = Math.min(90, (elapsed / minLoadingTime) * 100);
        setProgress(newProgress);
      }, 50);
      return function () {
        return clearInterval(interval);
      };
    },
    [minLoadingTime, showProgress],
  );
  (0, react_1.useEffect)(
    function () {
      var timer = setTimeout(function () {
        onLoadComplete === null || onLoadComplete === void 0 ? void 0 : onLoadComplete();
      }, minLoadingTime);
      return function () {
        return clearTimeout(timer);
      };
    },
    [minLoadingTime, onLoadComplete],
  );
  return (
    <card_1.Card className="animate-pulse">
      <card_1.CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            {showProgress && (
              <div className="mt-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: "".concat(progress, "%") }}
                />
              </div>
            )}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function ErrorFallback(_a) {
  var error = _a.error,
    onRetry = _a.onRetry,
    _b = _a.retryCount,
    retryCount = _b === void 0 ? 0 : _b,
    customFallback = _a.customFallback,
    className = _a.className;
  if (customFallback) {
    return <div className={className}>{customFallback}</div>;
  }
  return (
    <card_1.Card className={(0, utils_1.cn)("border-red-200 bg-red-50", className)}>
      <card_1.CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <lucide_react_1.AlertCircle className="h-8 w-8 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load component</h3>
            <p className="text-sm text-red-700 mb-4">
              {error.message || "An unexpected error occurred"}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-red-600 mb-4">Retry attempts: {retryCount}</p>
            )}
            {onRetry && (
              <button_1.Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button_1.Button>
            )}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// =====================================================================================
// ENHANCED LAZY COMPONENT FACTORY
// =====================================================================================
function createLazyComponent(importFn, options) {
  if (options === void 0) {
    options = {};
  }
  var fallback = options.fallback,
    errorFallback = options.errorFallback,
    _a = options.minLoadingTime,
    minLoadingTime = _a === void 0 ? 200 : _a,
    _b = options.retryable,
    retryable = _b === void 0 ? true : _b,
    _c = options.preload,
    preload = _c === void 0 ? false : _c,
    chunkName = options.chunkName;
  // Create the lazy component
  var LazyComponent = (0, react_1.lazy)(function () {
    // Add artificial delay for minimum loading time
    var loadPromise = importFn();
    if (minLoadingTime > 0) {
      var delayPromise = new Promise(function (resolve) {
        return setTimeout(resolve, minLoadingTime);
      });
      return Promise.all([loadPromise, delayPromise]).then(function (_a) {
        var module = _a[0];
        return module;
      });
    }
    return loadPromise;
  });
  // Enhanced component with preloading
  var EnhancedComponent = react_1.default.forwardRef(function (props, ref) {
    var _a = (0, react_1.useState)(false),
      shouldPreload = _a[0],
      setShouldPreload = _a[1];
    var preloadTriggered = (0, react_1.useRef)(false);
    var handlePreload = (0, react_1.useCallback)(function () {
      if (preload && !preloadTriggered.current) {
        preloadTriggered.current = true;
        importFn().catch(console.warn); // Preload silently
      }
    }, []);
    var containerProps = preload
      ? {
          onMouseEnter: handlePreload,
          onFocus: handlePreload,
        }
      : {};
    return (
      <div {...containerProps}>
        <LazyLoader
          fallback={fallback}
          errorFallback={errorFallback}
          minLoadingTime={minLoadingTime}
          retryable={retryable}
        >
          <LazyComponent {...props} ref={ref} />
        </LazyLoader>
      </div>
    );
  });
  // Add display name for debugging
  EnhancedComponent.displayName = "LazyComponent(".concat(chunkName || "Unknown", ")");
  // Add preload method
  EnhancedComponent.preload = function () {
    return importFn();
  };
  return EnhancedComponent;
}
function IntersectionLazyLoader(_a) {
  var children = _a.children,
    fallback = _a.fallback,
    _b = _a.rootMargin,
    rootMargin = _b === void 0 ? "50px" : _b,
    _c = _a.threshold,
    threshold = _c === void 0 ? 0.1 : _c,
    _d = _a.triggerOnce,
    triggerOnce = _d === void 0 ? true : _d,
    className = _a.className;
  var _e = (0, react_1.useState)(false),
    isVisible = _e[0],
    setIsVisible = _e[1];
  var _f = (0, react_1.useState)(false),
    hasTriggered = _f[0],
    setHasTriggered = _f[1];
  var elementRef = (0, react_1.useRef)(null);
  (0, react_1.useEffect)(
    function () {
      var element = elementRef.current;
      if (!element) return;
      var observer = new IntersectionObserver(
        function (_a) {
          var entry = _a[0];
          if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
            setIsVisible(true);
            if (triggerOnce) {
              setHasTriggered(true);
              observer.unobserve(element);
            }
          } else if (!triggerOnce && !entry.isIntersecting) {
            setIsVisible(false);
          }
        },
        {
          rootMargin: rootMargin,
          threshold: threshold,
        },
      );
      observer.observe(element);
      return function () {
        observer.unobserve(element);
      };
    },
    [rootMargin, threshold, triggerOnce, hasTriggered],
  );
  return (
    <div ref={elementRef} className={className}>
      {isVisible
        ? children
        : fallback || (
            <div className="h-32 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          )}
    </div>
  );
}
// =====================================================================================
// UTILITY HOOKS
// =====================================================================================
function useLazyPreload(importFn) {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    isPreloaded = _a[0],
    setIsPreloaded = _a[1];
  var _b = (0, react_1.useState)(false),
    isPreloading = _b[0],
    setIsPreloading = _b[1];
  var preload = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (isPreloaded || isPreloading) return [2 /*return*/];
              setIsPreloading(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              return [4 /*yield*/, importFn()];
            case 2:
              _a.sent();
              setIsPreloaded(true);
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.warn("Preload failed:", error_1);
              return [3 /*break*/, 5];
            case 4:
              setIsPreloading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [importFn, isPreloaded, isPreloading],
  );
  return {
    preload: preload,
    isPreloaded: isPreloaded,
    isPreloading: isPreloading,
  };
}
function useComponentVisibility(threshold) {
  if (threshold === void 0) {
    threshold = 0.1;
  }
  var _a = (0, react_1.useState)(false),
    isVisible = _a[0],
    setIsVisible = _a[1];
  var elementRef = (0, react_1.useRef)(null);
  (0, react_1.useEffect)(
    function () {
      var element = elementRef.current;
      if (!element) return;
      var observer = new IntersectionObserver(
        function (_a) {
          var entry = _a[0];
          setIsVisible(entry.isIntersecting);
        },
        { threshold: threshold },
      );
      observer.observe(element);
      return function () {
        observer.unobserve(element);
      };
    },
    [threshold],
  );
  return [elementRef, isVisible];
}
// =====================================================================================
// PREBUILT LAZY COMPONENTS
// =====================================================================================
// Common loading fallbacks
var SkeletonCard = function () {
  return (
    <card_1.Card className="animate-pulse">
      <card_1.CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
};
exports.SkeletonCard = SkeletonCard;
var SkeletonTable = function () {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map(function (_, i) {
        return (
          <div key={i} className="flex space-x-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        );
      })}
    </div>
  );
};
exports.SkeletonTable = SkeletonTable;
var SkeletonForm = function () {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map(function (_, i) {
        return (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        );
      })}
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  );
};
exports.SkeletonForm = SkeletonForm;
exports.default = LazyLoader;
