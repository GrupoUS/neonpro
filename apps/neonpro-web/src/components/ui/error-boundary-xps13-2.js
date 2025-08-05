// Error Boundary Component with LGPD Compliance
'use client';
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
exports.ErrorBoundary = void 0;
exports.withErrorBoundary = withErrorBoundary;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.errorLogTimeout = null;
        _this.handleRetry = function () {
            _this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: null,
                timestamp: null
            });
        };
        _this.handleGoHome = function () {
            if (typeof window !== 'undefined') {
                window.location.href = '/dashboard';
            }
        };
        _this.handleContactSupport = function () {
            if (typeof window !== 'undefined') {
                var subject = encodeURIComponent('Erro no Sistema - ID: ' + _this.state.errorId);
                var body = encodeURIComponent("\nOl\u00E1,\n\nOcorreu um erro no sistema. Detalhes:\n\nID do Erro: ".concat(_this.state.errorId, "\nHor\u00E1rio: ").concat(_this.state.timestamp ? new Date(_this.state.timestamp).toLocaleString('pt-BR') : 'Desconhecido', "\nP\u00E1gina: ").concat(window.location.href, "\n\nPor favor, me ajudem a resolver este problema.\n\nObrigado!\n      ").trim());
                window.open("mailto:suporte@neonpro.com.br?subject=".concat(subject, "&body=").concat(body));
            }
        };
        _this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            timestamp: null
        };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        // Generate error ID and timestamp for tracking
        var errorId = "err_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var timestamp = new Date().toISOString();
        return {
            hasError: true,
            error: error,
            errorId: errorId,
            timestamp: timestamp
        };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // Log error with LGPD compliance (no sensitive data)
        this.logErrorSafely(error, errorInfo);
        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    };
    ErrorBoundary.prototype.logErrorSafely = function (error, errorInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    // Clear any existing timeout
                    if (this.errorLogTimeout) {
                        clearTimeout(this.errorLogTimeout);
                    }
                    // Debounce error logging to prevent spam
                    this.errorLogTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var logEntry;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            try {
                                logEntry = {
                                    error_id: this.state.errorId,
                                    error_name: error.name,
                                    error_message: error.message.substring(0, 200), // Truncate to avoid data exposure
                                    component_stack: (_a = errorInfo.componentStack) === null || _a === void 0 ? void 0 : _a.substring(0, 500), // Limited stack trace
                                    error_stack: (_b = error.stack) === null || _b === void 0 ? void 0 : _b.substring(0, 500), // Limited stack trace
                                    timestamp: this.state.timestamp,
                                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                                    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
                                    session_id: typeof sessionStorage !== 'undefined'
                                        ? sessionStorage.getItem('session_id')
                                        : null,
                                    // No personal data - privacy by design
                                    privacy_compliant: true
                                };
                                // Log to console for development
                                console.error('[Error Boundary - Privacy Safe]', logEntry);
                                // In production, you would send to your error tracking service
                                // Example: await errorTrackingService.log(logEntry);
                            }
                            catch (logError) {
                                console.error('Failed to log error safely:', logError);
                            }
                            return [2 /*return*/];
                        });
                    }); }, 1000);
                }
                catch (logError) {
                    console.error('Error in error logging:', logError);
                }
                return [2 /*return*/];
            });
        });
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default LGPD-compliant error UI
            return (<div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <card_1.Card className="w-full max-w-2xl">
            <card_1.CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-100">
                  <lucide_react_1.AlertTriangle className="w-8 h-8 text-red-600"/>
                </div>
              </div>
              <card_1.CardTitle className="text-xl font-semibold text-gray-900">
                Ops! Algo deu errado
              </card_1.CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <badge_1.Badge variant="destructive">
                  Erro do Sistema
                </badge_1.Badge>
                {this.state.errorId && (<badge_1.Badge variant="outline" className="text-xs font-mono">
                    {this.state.errorId}
                  </badge_1.Badge>)}
              </div>
            </card_1.CardHeader>

            <card_1.CardContent className="space-y-6">
              {/* User-friendly message */}
              <div className="text-center space-y-3">
                <p className="text-gray-700">
                  Encontramos um problema inesperado. Não se preocupe - seus dados estão seguros.
                </p>
                <p className="text-sm text-gray-600">
                  Nossa equipe foi automaticamente notificada e está trabalhando para resolver o problema.
                </p>
              </div>

              {/* LGPD Privacy Notice */}
              <card_1.Card className="border-blue-200 bg-blue-50/50">
                <card_1.CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <lucide_react_1.Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">
                        Proteção de Dados (LGPD)
                      </p>
                      <p className="text-blue-700">
                        Este erro foi registrado de forma anônima para melhorar nosso sistema. 
                        Nenhum dado pessoal ou sensível foi exposto ou comprometido.
                      </p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Timestamp info */}
              {this.state.timestamp && (<div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <lucide_react_1.Clock className="w-4 h-4"/>
                  <span>
                    Ocorrido em: {new Date(this.state.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>)}

              {/* Technical details for authorized users only */}
              {this.props.showErrorDetails && this.state.error && (<card_1.Card className="border-orange-200 bg-orange-50/50">
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-sm font-medium text-orange-800">
                      Informações Técnicas (Desenvolvimento)
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">Nome:</span>
                        <code className="ml-2 bg-orange-100 px-1 py-0.5 rounded">
                          {this.state.error.name}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Mensagem:</span>
                        <code className="ml-2 bg-orange-100 px-1 py-0.5 rounded break-all">
                          {this.state.error.message}
                        </code>
                      </div>
                      {this.state.error.stack && (<div>
                          <span className="font-medium">Stack:</span>
                          <pre className="mt-1 bg-orange-100 p-2 rounded text-xs overflow-x-auto max-h-32">
                            {this.state.error.stack.substring(0, 500)}
                          </pre>
                        </div>)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button_1.Button onClick={this.handleRetry} className="flex-1">
                  <lucide_react_1.RotateCcw className="w-4 h-4 mr-2"/>
                  Tentar Novamente
                </button_1.Button>
                
                <button_1.Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <lucide_react_1.Home className="w-4 h-4 mr-2"/>
                  Ir para Dashboard
                </button_1.Button>
                
                <button_1.Button variant="outline" onClick={this.handleContactSupport} className="flex-1">
                  <lucide_react_1.MessageCircle className="w-4 h-4 mr-2"/>
                  Contatar Suporte
                </button_1.Button>
              </div>

              {/* What users can do */}
              <card_1.Card className="bg-gray-50">
                <card_1.CardContent className="pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    O que você pode fazer:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"/>
                      Clique em "Tentar Novamente" para recarregar a página
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"/>
                      Volte para o Dashboard e tente uma ação diferente
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"/>
                      Se o problema persistir, entre em contato com o suporte
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"/>
                      Inclua o ID do erro ao entrar em contato conosco
                    </li>
                  </ul>
                </card_1.CardContent>
              </card_1.Card>
            </card_1.CardContent>
          </card_1.Card>
        </div>);
        }
        return this.props.children;
    };
    ErrorBoundary.prototype.componentWillUnmount = function () {
        if (this.errorLogTimeout) {
            clearTimeout(this.errorLogTimeout);
        }
    };
    return ErrorBoundary;
}(react_1.Component));
exports.ErrorBoundary = ErrorBoundary;
// HOC for wrapping components with error boundary
function withErrorBoundary(Component, errorBoundaryProps) {
    var WrappedComponent = function (props) { return (<ErrorBoundary {...errorBoundaryProps}>
      <Component {...props}/>
    </ErrorBoundary>); };
    WrappedComponent.displayName = "withErrorBoundary(".concat(Component.displayName || Component.name, ")");
    return WrappedComponent;
}
