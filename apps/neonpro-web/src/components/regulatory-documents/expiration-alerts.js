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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpirationAlerts = ExpirationAlerts;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var skeleton_1 = require("@/components/ui/skeleton");
function ExpirationAlerts(_a) {
  var onViewDocument = _a.onViewDocument,
    onEditDocument = _a.onEditDocument,
    _b = _a.compact,
    compact = _b === void 0 ? false : _b,
    _c = _a.showSettings,
    showSettings = _c === void 0 ? true : _c;
  var _d = (0, react_1.useState)([]),
    alerts = _d[0],
    setAlerts = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)(false),
    showAcknowledged = _g[0],
    setShowAcknowledged = _g[1];
  (0, react_1.useEffect)(() => {
    fetchAlerts();
  }, []);
  var fetchAlerts = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, result, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            setError(null);
            return [4 /*yield*/, fetch("/api/regulatory-documents/alerts")];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch alerts");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            setAlerts(result.alerts || []);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching alerts:", error_1);
            setError("Erro ao carregar alertas");
            sonner_1.toast.error("Erro ao carregar alertas");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var acknowledgeAlert = (alertId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/regulatory-documents/alerts/".concat(alertId, "/acknowledge"), {
                method: "PATCH",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to acknowledge alert");
            }
            // Update local state
            setAlerts((prev) =>
              prev.map((alert) =>
                alert.id === alertId
                  ? __assign(__assign({}, alert), { acknowledged: true })
                  : alert,
              ),
            );
            sonner_1.toast.success("Alerta reconhecido");
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error acknowledging alert:", error_2);
            sonner_1.toast.error("Erro ao reconhecer alerta");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
      case "high":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "low":
        return <lucide_react_1.Bell className="h-4 w-4" />;
      default:
        return <lucide_react_1.FileText className="h-4 w-4" />;
    }
  };
  var getAlertTypeLabel = (type) => {
    switch (type) {
      case "expiring":
        return "Expirando";
      case "expired":
        return "Expirado";
      case "renewal_required":
        return "Renovação Necessária";
      case "review_due":
        return "Revisão Pendente";
      default:
        return type;
    }
  };
  var filteredAlerts = showAcknowledged ? alerts : alerts.filter((alert) => !alert.acknowledged);
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5" />
            Alertas de Compliance
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <skeleton_1.Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <skeleton_1.Skeleton className="h-4 w-3/4" />
                <skeleton_1.Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>
          {error}
          <button_1.Button variant="outline" size="sm" className="ml-2" onClick={fetchAlerts}>
            Tentar novamente
          </button_1.Button>
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  if (filteredAlerts.length === 0) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5" />
            Alertas de Compliance
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center py-8">
            <lucide_react_1.Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {showAcknowledged ? "Nenhum alerta encontrado" : "Nenhum alerta pendente"}
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5" />
            Alertas de Compliance
            {filteredAlerts.length > 0 && (
              <badge_1.Badge variant="secondary">{filteredAlerts.length}</badge_1.Badge>
            )}
          </card_1.CardTitle>

          {showSettings && (
            <div className="flex items-center gap-2">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={() => setShowAcknowledged(!showAcknowledged)}
              >
                {showAcknowledged ? "Ocultar reconhecidos" : "Mostrar reconhecidos"}
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={fetchAlerts}>
                <lucide_react_1.Settings className="h-4 w-4" />
              </button_1.Button>
            </div>
          )}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-3">
        {filteredAlerts.map((alert) => {
          var _a, _b, _c;
          return (
            <card_1.Card
              key={alert.id}
              className={""
                .concat(getSeverityColor(alert.severity), " ")
                .concat(alert.acknowledged ? "opacity-60" : "")}
            >
              <card_1.CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <badge_1.Badge variant="outline" className="text-xs">
                          {getAlertTypeLabel(alert.alert_type)}
                        </badge_1.Badge>
                        <badge_1.Badge variant="outline" className="text-xs">
                          {alert.severity.toUpperCase()}
                        </badge_1.Badge>
                        {alert.acknowledged && (
                          <badge_1.Badge variant="secondary" className="text-xs">
                            Reconhecido
                          </badge_1.Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium mb-1">
                        {(_a = alert.document) === null || _a === void 0
                          ? void 0
                          : _a.document_type}
                        {((_b = alert.document) === null || _b === void 0
                          ? void 0
                          : _b.document_number) && " (".concat(alert.document.document_number, ")")}
                      </p>

                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <lucide_react_1.Calendar className="h-3 w-3" />
                          Vence: {new Date(alert.due_date).toLocaleDateString("pt-BR")}
                        </span>
                        <span>
                          {(_c = alert.document) === null || _c === void 0 ? void 0 : _c.authority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-3">
                    {onViewDocument && (
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDocument(alert.document_id)}
                        title="Visualizar documento"
                      >
                        <lucide_react_1.Eye className="h-4 w-4" />
                      </button_1.Button>
                    )}

                    {onEditDocument && (
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditDocument(alert.document_id)}
                        title="Editar documento"
                      >
                        <lucide_react_1.Edit className="h-4 w-4" />
                      </button_1.Button>
                    )}

                    {!alert.acknowledged && (
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        title="Reconhecer alerta"
                      >
                        <lucide_react_1.X className="h-4 w-4" />
                      </button_1.Button>
                    )}
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </card_1.CardContent>
    </card_1.Card>
  );
}
