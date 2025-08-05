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
exports.ConsentManager = ConsentManager;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var CONSENT_TYPES = [
  {
    key: "email",
    label: "Comunicação por Email",
    description: "Receber lembretes de consultas, resultados e informações importantes por email",
    required: true,
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    category: "communication",
  },
  {
    key: "sms",
    label: "Mensagens SMS",
    description: "Receber notificações urgentes e lembretes por SMS",
    required: true,
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    category: "communication",
  },
  {
    key: "push",
    label: "Notificações Push",
    description: "Receber notificações no aplicativo e navegador",
    required: false,
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    category: "communication",
  },
  {
    key: "marketing",
    label: "Marketing e Promoções",
    description: "Receber informações sobre novos tratamentos, promoções e eventos",
    required: false,
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    category: "marketing",
  },
  {
    key: "analytics",
    label: "Análise de Comportamento",
    description: "Permitir análise anônima para melhorar nossos serviços",
    required: false,
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    category: "analytics",
  },
];
function ConsentManager(_a) {
  var patientId = _a.patientId,
    consents = _a.consents,
    onConsentUpdate = _a.onConsentUpdate,
    className = _a.className;
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    showRevokeDialog = _c[0],
    setShowRevokeDialog = _c[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = (0, client_1.createClient)();
  // Obter status de consentimento para um tipo específico
  var getConsentStatus = (consentType) => consents.find((c) => c.consent_type === consentType);
  // Atualizar consentimento
  var updateConsent = (consentType, consented, reason) =>
    __awaiter(this, void 0, void 0, function () {
      var existingConsent, now, consentData, response, _a, _b, error_1;
      var _c, _d;
      var _e;
      return __generator(this, (_f) => {
        switch (_f.label) {
          case 0:
            setLoading(true);
            _f.label = 1;
          case 1:
            _f.trys.push([1, 9, 10, 11]);
            existingConsent = getConsentStatus(consentType);
            now = new Date().toISOString();
            _c = {
              patient_id: patientId,
              consent_type: consentType,
              consented: consented,
              consented_at: consented ? now : null,
              revoked_at: !consented ? now : null,
            };
            return [4 /*yield*/, getClientIP()];
          case 2:
            consentData =
              ((_c.ip_address = _f.sent()),
              (_c.user_agent = navigator.userAgent),
              (_c.metadata = {
                reason: reason,
                updated_by: "patient_portal",
                timestamp: now,
              }),
              _c);
            response = void 0;
            if (!existingConsent) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              supabase
                .from("communication_consents")
                .update(__assign(__assign({}, consentData), { updated_at: now }))
                .eq("id", existingConsent.id)
                .select()
                .single(),
            ];
          case 3:
            // Atualizar consentimento existente
            response = _f.sent();
            return [3 /*break*/, 6];
          case 4:
            return [
              4 /*yield*/,
              supabase.from("communication_consents").insert(consentData).select().single(),
            ];
          case 5:
            // Criar novo consentimento
            response = _f.sent();
            _f.label = 6;
          case 6:
            if (response.error) throw response.error;
            _b = (_a = supabase.from("communication_audit_logs")).insert;
            _d = {
              entity_type: "consent",
              entity_id: response.data.id,
              action: consented ? "consent_granted" : "consent_revoked",
              user_id: patientId,
            };
            return [4 /*yield*/, getClientIP()];
          case 7:
            // Log de auditoria
            return [
              4 /*yield*/,
              _b.apply(_a, [
                ((_d.ip_address = _f.sent()),
                (_d.user_agent = navigator.userAgent),
                (_d.details = {
                  consent_type: consentType,
                  previous_status:
                    existingConsent === null || existingConsent === void 0
                      ? void 0
                      : existingConsent.consented,
                  new_status: consented,
                  reason: reason,
                }),
                _d),
              ]),
            ];
          case 8:
            // Log de auditoria
            _f.sent();
            onConsentUpdate(response.data);
            toast({
              title: consented ? "Consentimento concedido" : "Consentimento revogado",
              description: ""
                .concat(
                  (_e = CONSENT_TYPES.find((t) => t.key === consentType)) === null || _e === void 0
                    ? void 0
                    : _e.label,
                  " ",
                )
                .concat(consented ? "ativado" : "desativado", " com sucesso."),
            });
            return [3 /*break*/, 11];
          case 9:
            error_1 = _f.sent();
            toast({
              title: "Erro ao atualizar consentimento",
              description: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              variant: "destructive",
            });
            return [3 /*break*/, 11];
          case 10:
            setLoading(false);
            setShowRevokeDialog(null);
            return [7 /*endfinally*/];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  // Obter IP do cliente (simulado - em produção usar serviço real)
  var getClientIP = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("https://api.ipify.org?format=json")];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            return [2 /*return*/, data.ip];
          case 3:
            _a = _b.sent();
            return [2 /*return*/, "0.0.0.0"];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Renderizar item de consentimento
  var renderConsentItem = (consentType) => {
    var consent = getConsentStatus(consentType.key);
    var isConsented =
      (consent === null || consent === void 0 ? void 0 : consent.consented) || false;
    var isRequired = consentType.required;
    return (
      <div key={consentType.key} className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {consentType.icon}
              <h4 className="font-medium">{consentType.label}</h4>
              {isRequired && (
                <badge_1.Badge variant="destructive" className="text-xs">
                  Obrigatório
                </badge_1.Badge>
              )}
              <badge_1.Badge variant={isConsented ? "default" : "secondary"} className="text-xs">
                {isConsented ? "Ativo" : "Inativo"}
              </badge_1.Badge>
            </div>
            <p className="text-sm text-muted-foreground">{consentType.description}</p>

            {consent && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <lucide_react_1.Clock className="w-3 h-3" />
                  {isConsented ? "Concedido" : "Revogado"}{" "}
                  {(0, date_fns_1.formatDistanceToNow)(
                    new Date(isConsented ? consent.consented_at : consent.revoked_at),
                    { addSuffix: true, locale: locale_1.ptBR },
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isRequired && !isConsented && (
              <lucide_react_1.AlertCircle className="w-4 h-4 text-destructive" />
            )}

            {isConsented
              ? <dialog_1.Dialog
                  open={showRevokeDialog === consentType.key}
                  onOpenChange={(open) => setShowRevokeDialog(open ? consentType.key : null)}
                >
                  <dialog_1.DialogTrigger asChild>
                    <button_1.Button variant="outline" size="sm" disabled={loading}>
                      <lucide_react_1.X className="w-3 h-3 mr-1" />
                      Revogar
                    </button_1.Button>
                  </dialog_1.DialogTrigger>
                  <dialog_1.DialogContent>
                    <dialog_1.DialogHeader>
                      <dialog_1.DialogTitle>Revogar Consentimento</dialog_1.DialogTitle>
                      <dialog_1.DialogDescription>
                        Você está prestes a revogar o consentimento para{" "}
                        <strong>{consentType.label}</strong>.
                        {isRequired && (
                          <alert_1.Alert className="mt-3">
                            <lucide_react_1.AlertCircle className="w-4 h-4" />
                            <alert_1.AlertDescription>
                              <strong>Atenção:</strong> Este consentimento é obrigatório para o
                              funcionamento adequado dos nossos serviços. Revogar pode afetar sua
                              experiência.
                            </alert_1.AlertDescription>
                          </alert_1.Alert>
                        )}
                      </dialog_1.DialogDescription>
                    </dialog_1.DialogHeader>
                    <dialog_1.DialogFooter>
                      <button_1.Button variant="outline" onClick={() => setShowRevokeDialog(null)}>
                        Cancelar
                      </button_1.Button>
                      <button_1.Button
                        variant="destructive"
                        onClick={() => updateConsent(consentType.key, false)}
                        disabled={loading}
                      >
                        Confirmar Revogação
                      </button_1.Button>
                    </dialog_1.DialogFooter>
                  </dialog_1.DialogContent>
                </dialog_1.Dialog>
              : <button_1.Button
                  size="sm"
                  onClick={() => updateConsent(consentType.key, true)}
                  disabled={loading}
                >
                  <lucide_react_1.Check className="w-3 h-3 mr-1" />
                  Conceder
                </button_1.Button>}
          </div>
        </div>
        <separator_1.Separator />
      </div>
    );
  };
  // Agrupar consentimentos por categoria
  var groupedConsents = CONSENT_TYPES.reduce((acc, consentType) => {
    if (!acc[consentType.category]) {
      acc[consentType.category] = [];
    }
    acc[consentType.category].push(consentType);
    return acc;
  }, {});
  var categoryLabels = {
    communication: "Comunicação Essencial",
    marketing: "Marketing e Promoções",
    analytics: "Análise e Melhorias",
  };
  return (
    <card_1.Card className={(0, utils_1.cn)("", className)}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Shield className="w-5 h-5" />
          Gerenciamento de Consentimentos
        </card_1.CardTitle>
        <alert_1.Alert>
          <lucide_react_1.AlertCircle className="w-4 h-4" />
          <alert_1.AlertDescription>
            <strong>LGPD - Lei Geral de Proteção de Dados:</strong> Você tem o direito de controlar
            como seus dados são utilizados. Pode revogar consentimentos a qualquer momento.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        {Object.entries(groupedConsents).map((_a) => {
          var category = _a[0],
            types = _a[1];
          return (
            <div key={category} className="space-y-4">
              <h3 className="font-semibold text-lg">{categoryLabels[category]}</h3>
              <div className="space-y-4">{types.map(renderConsentItem)}</div>
            </div>
          );
        })}

        <alert_1.Alert>
          <lucide_react_1.AlertCircle className="w-4 h-4" />
          <alert_1.AlertDescription className="text-xs">
            <strong>Importante:</strong> Todas as ações de consentimento são registradas para fins
            de auditoria e compliance. Os dados são armazenados de forma segura conforme as normas
            da LGPD.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </card_1.CardContent>
    </card_1.Card>
  );
}
