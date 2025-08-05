"use client";
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
exports.useErrorHandler = useErrorHandler;
exports.DashboardErrorBoundary = DashboardErrorBoundary;
exports.FormErrorBoundary = FormErrorBoundary;
exports.APIErrorBoundary = APIErrorBoundary;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var ErrorBoundary = /** @class */ ((_super) => {
  __extends(ErrorBoundary, _super);
  function ErrorBoundary(props) {
    var _this = _super.call(this, props) || this;
    _this.handleRetry = () => {
      _this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    };
    _this.handleGoHome = () => {
      window.location.href = "/dashboard";
    };
    _this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    return _this;
  }
  ErrorBoundary.getDerivedStateFromError = (error) => {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error,
      errorInfo: null,
    };
  };
  ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
    var _a, _b;
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Update state with error info
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // Call custom error handler if provided
    (_b = (_a = this.props).onError) === null || _b === void 0
      ? void 0
      : _b.call(_a, error, errorInfo);
    // Report to error tracking service (e.g., Sentry)
    // reportError(error, errorInfo);
  };
  ErrorBoundary.prototype.render = function () {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <card_1.Card className="w-full max-w-2xl">
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center text-red-600">
                <lucide_react_1.AlertTriangle className="h-6 w-6 mr-2" />
                Oops! Algo deu errado
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <alert_1.Alert>
                <lucide_react_1.Bug className="h-4 w-4" />
                <alert_1.AlertDescription>
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para
                  resolver o problema.
                </alert_1.AlertDescription>
              </alert_1.Alert>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Detalhes do Erro (Desenvolvimento):</h4>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Stack Trace</summary>
                      <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button_1.Button onClick={this.handleRetry} className="flex-1">
                  <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </button_1.Button>
                <button_1.Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <lucide_react_1.Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      );
    }
    return this.props.children;
  };
  return ErrorBoundary;
})(react_1.Component);
exports.ErrorBoundary = ErrorBoundary;
// =====================================================================================
// HOOK-BASED ERROR BOUNDARY (for functional components)
// =====================================================================================
function useErrorHandler() {
  return (error, errorInfo) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo);
    // Report to error tracking service
    // reportError(error, errorInfo);
    // You could also trigger a toast notification here
    // toast.error('Ocorreu um erro inesperado');
  };
}
// =====================================================================================
// SPECIALIZED ERROR BOUNDARIES
// =====================================================================================
// Dashboard Error Boundary
function DashboardErrorBoundary(_a) {
  var children = _a.children;
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <alert_1.Alert>
            <lucide_react_1.AlertTriangle className="h-4 w-4" />
            <alert_1.AlertDescription>
              Erro no dashboard. Recarregue a página ou tente novamente.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error("Dashboard Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
// Form Error Boundary
function FormErrorBoundary(_a) {
  var children = _a.children;
  return (
    <ErrorBoundary
      fallback={
        <alert_1.Alert>
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            Erro no formulário. Verifique os dados e tente novamente.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      }
      onError={(error, errorInfo) => {
        console.error("Form Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
// API Error Boundary
function APIErrorBoundary(_a) {
  var children = _a.children;
  return (
    <ErrorBoundary
      fallback={
        <alert_1.Alert>
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            Erro de conexão. Verifique sua internet e tente novamente.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      }
      onError={(error, errorInfo) => {
        console.error("API Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
exports.default = ErrorBoundary;
