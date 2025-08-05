"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionSecurityDemo;
var react_1 = require("react");
var useSessionSecurity_1 = require("@/lib/security/hooks/useSessionSecurity");
var csrf_protection_hooks_1 = require("@/lib/security/csrf-protection-hooks");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
/**
 * SessionSecurityDemo Component
 * Demonstrates the session security features implemented in Story 1.5
 */
function SessionSecurityDemo() {
  var sessionId = (0, react_1.useState)(() =>
    "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
  )[0];
  var _a = (0, react_1.useState)(0),
    activityCount = _a[0],
    setActivityCount = _a[1];
  // Use session security hooks
  var _b = (0, useSessionSecurity_1.useSessionSecurity)(sessionId),
    isSecurityActive = _b.isSecurityActive,
    securityStatus = _b.securityStatus,
    updateActivity = _b.updateActivity,
    extendSession = _b.extendSession,
    terminateSession = _b.terminateSession,
    securityError = _b.error;
  var _c = (0, csrf_protection_hooks_1.useCSRFToken)(sessionId),
    csrfToken = _c.csrfToken,
    csrfLoading = _c.isLoading,
    csrfError = _c.error,
    refreshToken = _c.refreshToken;
  var _d = (0, useSessionSecurity_1.useSessionTimeout)(sessionId),
    timeRemaining = _d.timeRemaining,
    warningLevel = _d.warningLevel,
    isExpired = _d.isExpired,
    extendTimeout = _d.extendTimeout,
    timeoutError = _d.error;
  // Simulate user activity
  var simulateActivity = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              updateActivity("user_interaction", {
                action: "demo_activity",
                timestamp: new Date().toISOString(),
                count: activityCount + 1,
              }),
            ];
          case 1:
            _a.sent();
            setActivityCount((prev) => prev + 1);
            return [2 /*return*/];
        }
      });
    });
  // Format time remaining
  var formatTimeRemaining = (seconds) => {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return "".concat(minutes, ":").concat(remainingSeconds.toString().padStart(2, "0"));
  };
  // Get warning color based on level
  var getWarningColor = (level) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Security Demo</h1>
        <p className="text-gray-600">
          Demonstração das funcionalidades de segurança de sessão implementadas na Story 1.5
        </p>
        <badge_1.Badge variant="outline" className="mt-2">
          Session ID: {sessionId.slice(-12)}
        </badge_1.Badge>
      </div>

      {/* Security Status Overview */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5" />
            Status de Segurança da Sessão
          </card_1.CardTitle>
          <card_1.CardDescription>
            Monitoramento em tempo real da segurança da sessão
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {isSecurityActive
                ? <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500" />
                : <lucide_react_1.XCircle className="h-5 w-5 text-red-500" />}
              <span className="font-medium">
                Segurança: {isSecurityActive ? "Ativa" : "Inativa"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">
                Tempo Restante: {timeRemaining ? formatTimeRemaining(timeRemaining) : "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Atividades: {activityCount}</span>
            </div>
          </div>

          {securityStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Detalhes de Segurança:</h4>
              <div className="text-sm space-y-1">
                <p>
                  Risk Score:{" "}
                  <badge_1.Badge variant="outline">
                    {securityStatus.riskScore || "N/A"}
                  </badge_1.Badge>
                </p>
                <p>Última Atividade: {securityStatus.lastActivity || "N/A"}</p>
                <p>Fingerprint Válido: {securityStatus.fingerprintValid ? "✅" : "❌"}</p>
              </div>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* CSRF Token Management */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Gerenciamento de Token CSRF</card_1.CardTitle>
          <card_1.CardDescription>
            Proteção contra ataques Cross-Site Request Forgery
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Token CSRF:</span>
              <div className="flex items-center gap-2">
                {csrfLoading
                  ? <badge_1.Badge variant="secondary">Carregando...</badge_1.Badge>
                  : csrfToken
                    ? <badge_1.Badge variant="default">{csrfToken.slice(0, 16)}...</badge_1.Badge>
                    : <badge_1.Badge variant="destructive">Não disponível</badge_1.Badge>}
                <button_1.Button size="sm" onClick={refreshToken} disabled={csrfLoading}>
                  Renovar
                </button_1.Button>
              </div>
            </div>

            {csrfError && (
              <alert_1.Alert>
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>Erro no CSRF: {csrfError}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Session Timeout Management */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Gerenciamento de Timeout</card_1.CardTitle>
          <card_1.CardDescription>
            Controle automático de expiração de sessão
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {warningLevel && (
              <alert_1.Alert>
                <lucide_react_1.Clock className="h-4 w-4" />
                <alert_1.AlertDescription>
                  <badge_1.Badge variant={getWarningColor(warningLevel)} className="mr-2">
                    {warningLevel.toUpperCase()}
                  </badge_1.Badge>
                  {warningLevel === "critical" && "Sessão expirará em breve!"}
                  {warningLevel === "warning" && "Sessão próxima do timeout."}
                  {warningLevel === "info" && "Sessão ativa."}
                </alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            {isExpired && (
              <alert_1.Alert>
                <lucide_react_1.XCircle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  Sessão expirada! Faça login novamente.
                </alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            <div className="flex gap-2">
              <button_1.Button
                onClick={() => extendTimeout(30)}
                disabled={isExpired}
                variant="outline"
              >
                Estender 30min
              </button_1.Button>
              <button_1.Button
                onClick={() => extendSession(60)}
                disabled={isExpired}
                variant="outline"
              >
                Estender 1h
              </button_1.Button>
            </div>

            {timeoutError && (
              <alert_1.Alert>
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>Erro no timeout: {timeoutError}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Activity Simulation */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Simulação de Atividade</card_1.CardTitle>
          <card_1.CardDescription>
            Teste as funcionalidades de rastreamento de atividade
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button_1.Button onClick={simulateActivity}>Simular Atividade</button_1.Button>
              <button_1.Button onClick={terminateSession} variant="destructive">
                Terminar Sessão
              </button_1.Button>
            </div>

            {securityError && (
              <alert_1.Alert>
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  Erro de segurança: {securityError}
                </alert_1.AlertDescription>
              </alert_1.Alert>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Implementation Notes */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Notas de Implementação</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-sm space-y-2">
            <p>
              ✅ <strong>CSRF Protection:</strong> Tokens gerados automaticamente e validados em
              todas as requisições
            </p>
            <p>
              ✅ <strong>Session Hijacking Protection:</strong> Fingerprinting de sessão e detecção
              de anomalias
            </p>
            <p>
              ✅ <strong>Session Timeout:</strong> Timeout automático com avisos progressivos
            </p>
            <p>
              ✅ <strong>Concurrent Session Management:</strong> Controle de sessões simultâneas
            </p>
            <p>
              ✅ <strong>Security Middleware:</strong> Middleware integrado para proteção global
            </p>
            <p>
              ✅ <strong>Database Security:</strong> Tabelas com RLS e triggers de limpeza
              automática
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
