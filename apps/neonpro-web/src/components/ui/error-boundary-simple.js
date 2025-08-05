"use client";
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
exports.CriticalErrorBoundary = CriticalErrorBoundary;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.handleReset = function () {
            _this.setState({ hasError: false, error: undefined });
        };
        _this.state = { hasError: false };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        return { hasError: true, error: error };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
        this.setState({
            error: error,
        });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (<div className="flex items-center justify-center p-8">
          <card_1.Card className="w-full max-w-md">
            <card_1.CardHeader>
              <div className="flex items-center gap-2">
                <lucide_react_1.AlertTriangle className="h-5 w-5 text-destructive"/>
                <card_1.CardTitle>Algo deu errado</card_1.CardTitle>
              </div>
              <card_1.CardDescription>
                Ocorreu um erro inesperado. Tente recarregar a página.
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {this.state.error && (<details className="text-sm text-muted-foreground">
                  <summary className="cursor-pointer">Detalhes do erro</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.error.message}
                  </pre>
                </details>)}
              <button_1.Button onClick={this.handleReset} className="w-full">
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
                Tentar novamente
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </div>);
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.Component));
exports.ErrorBoundary = ErrorBoundary;
exports.default = ErrorBoundary;
// Wrapper for critical errors
function CriticalErrorBoundary(_a) {
    var children = _a.children;
    return <ErrorBoundary>{children}</ErrorBoundary>;
}
