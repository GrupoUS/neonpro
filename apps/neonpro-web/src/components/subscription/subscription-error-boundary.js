/**
 * Subscription Error Boundary Component
 *
 * React Error Boundary specifically designed for subscription-related components:
 * - Catches JavaScript errors in subscription components
 * - Provides user-friendly error messages
 * - Integrates with centralized error handling
 * - Supports error recovery and retry mechanisms
 * - Performance monitoring integration
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
 */
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
exports.SubscriptionPaymentErrorBoundary =
  exports.SubscriptionStatusErrorBoundary =
  exports.SubscriptionErrorBoundary =
    void 0;
exports.withSubscriptionErrorBoundary = withSubscriptionErrorBoundary;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var subscription_error_handler_1 = require("@/lib/subscription-error-handler");
var subscription_errors_1 = require("@/types/subscription-errors");
var SubscriptionErrorBoundary = /** @class */ (function (_super) {
  __extends(SubscriptionErrorBoundary, _super);
  function SubscriptionErrorBoundary(props) {
    var _this = _super.call(this, props) || this;
    _this.retryTimeouts = [];
    _this.handleRetry = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var retryError_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!this.state.canRetry || this.state.isRecovering) {
                return [2 /*return*/];
              }
              this.setState({ isRecovering: true });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              // Wait a bit before retrying
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 1000);
                }),
                // Reset error state to trigger re-render
              ];
            case 2:
              // Wait a bit before retrying
              _a.sent();
              // Reset error state to trigger re-render
              this.setState({
                hasError: false,
                error: undefined,
                errorInfo: undefined,
                retryCount: this.state.retryCount + 1,
                isRecovering: false,
                userMessage: "",
                canRetry: true,
              });
              return [3 /*break*/, 4];
            case 3:
              retryError_1 = _a.sent();
              this.setState({
                isRecovering: false,
                userMessage: "Retry failed. Please refresh the page.",
                canRetry: false,
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    };
    _this.handleRefresh = function () {
      window.location.reload();
    };
    _this.state = {
      hasError: false,
      retryCount: 0,
      isRecovering: false,
      userMessage: "",
      canRetry: true,
    };
    return _this;
  }
  SubscriptionErrorBoundary.getDerivedStateFromError = function (error) {
    return {
      hasError: true,
      error: error,
      userMessage: "Something went wrong with the subscription system.",
      canRetry: true,
    };
  };
  SubscriptionErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
    var _this = this;
    // Log error using centralized error handler
    var subscriptionError = subscription_errors_1.SubscriptionErrorFactory.createError(
      "validation",
      "React Error Boundary: ".concat(error.message),
      {
        additionalContext: {
          componentName: this.props.componentName || "SubscriptionComponent",
          errorInfo: errorInfo.componentStack,
          retryCount: this.state.retryCount,
        },
      },
    );
    // Handle error through centralized system
    subscription_error_handler_1.subscriptionErrorHandler.handleError(
      subscriptionError,
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            // This is just for logging, no recovery operation
            return [2 /*return*/, Promise.resolve()];
          });
        });
      },
    );
    // Update state
    this.setState({
      error: error,
      errorInfo: errorInfo,
      userMessage: this.getUserFriendlyMessage(error),
      canRetry: this.canRetryError(error),
    });
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  };
  SubscriptionErrorBoundary.prototype.getUserFriendlyMessage = function (error) {
    var message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch")) {
      return "Connection issue detected. Please check your internet connection.";
    }
    if (message.includes("auth") || message.includes("unauthorized")) {
      return "Authentication required. Please log in to continue.";
    }
    if (message.includes("subscription") || message.includes("payment")) {
      return "Issue with subscription service. Please try again shortly.";
    }
    return this.props.customErrorMessage || "An unexpected error occurred. Please try again.";
  };
  SubscriptionErrorBoundary.prototype.canRetryError = function (error) {
    var message = error.message.toLowerCase();
    // Don't retry auth errors or critical system errors
    if (message.includes("auth") || message.includes("critical")) {
      return false;
    }
    return this.state.retryCount < (this.props.maxRetries || 3);
  };
  SubscriptionErrorBoundary.prototype.render = function () {
    var _a;
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default error UI
      return (
        <card_1.Card className="w-full max-w-md mx-auto">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2 text-destructive">
              <lucide_react_1.AlertTriangle size={20} />
              Subscription System Error
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <alert_1.Alert>
              <lucide_react_1.AlertCircle className="h-4 w-4" />
              <alert_1.AlertTitle>Something went wrong</alert_1.AlertTitle>
              <alert_1.AlertDescription className="mt-2">
                {this.state.userMessage}
              </alert_1.AlertDescription>
            </alert_1.Alert>
            {this.props.showDetails && this.state.error && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {(_a = this.state.errorInfo) === null || _a === void 0
                    ? void 0
                    : _a.componentStack}
                </pre>
              </details>
            )}{" "}
            <div className="flex flex-col gap-2">
              {this.state.canRetry && (
                <button_1.Button
                  onClick={this.handleRetry}
                  disabled={this.state.isRecovering}
                  variant="default"
                  className="w-full"
                >
                  {this.state.isRecovering
                    ? <>
                        <lucide_react_1.RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    : <>
                        <lucide_react_1.RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </>}
                </button_1.Button>
              )}

              <button_1.Button onClick={this.handleRefresh} variant="outline" className="w-full">
                Refresh Page
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      );
    }
    return this.props.children;
  };
  SubscriptionErrorBoundary.prototype.componentWillUnmount = function () {
    // Clean up any retry timeouts
    this.retryTimeouts.forEach(function (timeout) {
      return clearTimeout(timeout);
    });
  };
  return SubscriptionErrorBoundary;
})(react_1.Component); // Specialized Error Boundary for different subscription contexts
exports.SubscriptionErrorBoundary = SubscriptionErrorBoundary;
var SubscriptionStatusErrorBoundary = function (_a) {
  var children = _a.children;
  return (
    <SubscriptionErrorBoundary
      componentName="SubscriptionStatus"
      maxRetries={2}
      customErrorMessage="Unable to load subscription status. Please try again."
      enableRecovery={true}
    >
      {children}
    </SubscriptionErrorBoundary>
  );
};
exports.SubscriptionStatusErrorBoundary = SubscriptionStatusErrorBoundary;
var SubscriptionPaymentErrorBoundary = function (_a) {
  var children = _a.children;
  return (
    <SubscriptionErrorBoundary
      componentName="SubscriptionPayment"
      maxRetries={1}
      customErrorMessage="Payment processing error. Please try again or contact support."
      enableRecovery={false}
      showDetails={false}
    >
      {children}
    </SubscriptionErrorBoundary>
  );
};
exports.SubscriptionPaymentErrorBoundary = SubscriptionPaymentErrorBoundary;
// Higher-order component for easy wrapping
function withSubscriptionErrorBoundary(WrappedComponent, options) {
  var ComponentWithErrorBoundary = function (props) {
    return (
      <SubscriptionErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </SubscriptionErrorBoundary>
    );
  };
  ComponentWithErrorBoundary.displayName = "withSubscriptionErrorBoundary(".concat(
    WrappedComponent.displayName || WrappedComponent.name,
    ")",
  );
  return ComponentWithErrorBoundary;
}
