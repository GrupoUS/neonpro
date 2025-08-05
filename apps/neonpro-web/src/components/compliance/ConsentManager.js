/**
 * LGPD Compliance Framework - Consent Manager Component
 * Interface para gerenciamento de consentimentos LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º
 */
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
exports.ConsentManager = ConsentManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
var lgpd_1 = require("@/types/lgpd");
// ============================================================================
// CONSENT DEFINITIONS
// ============================================================================
var CONSENT_DEFINITIONS = [
  {
    type: lgpd_1.ConsentType.PERSONAL_DATA,
    title: "Dados Pessoais Básicos",
    description: "Processamento de dados pessoais básicos (nome, email, telefone)",
    purpose: "Prestação de serviços médicos e comunicação",
    required: true,
    category: "essential",
    legalBasis: lgpd_1.LegalBasis.CONTRACT,
  },
  {
    type: lgpd_1.ConsentType.SENSITIVE_DATA,
    title: "Dados Pessoais Sensíveis",
    description: "Processamento de dados sensíveis (CPF, RG, dados biométricos)",
    purpose: "Identificação e segurança",
    required: true,
    category: "essential",
    legalBasis: lgpd_1.LegalBasis.CONSENT,
  },
  {
    type: lgpd_1.ConsentType.MEDICAL_DATA,
    title: "Dados Médicos",
    description: "Armazenamento e processamento de dados de saúde",
    purpose: "Prestação de cuidados médicos e acompanhamento",
    required: true,
    category: "essential",
    legalBasis: lgpd_1.LegalBasis.VITAL_INTERESTS,
  },
  {
    type: lgpd_1.ConsentType.MARKETING,
    title: "Comunicações de Marketing",
    description: "Envio de ofertas, promoções e comunicações comerciais",
    purpose: "Marketing direto e comunicação promocional",
    required: false,
    category: "marketing",
    legalBasis: lgpd_1.LegalBasis.CONSENT,
  },
  {
    type: lgpd_1.ConsentType.ANALYTICS,
    title: "Análise e Métricas",
    description: "Coleta de dados para análise de uso e melhorias",
    purpose: "Análise de performance e otimização de serviços",
    required: false,
    category: "analytics",
    legalBasis: lgpd_1.LegalBasis.LEGITIMATE_INTERESTS,
  },
  {
    type: lgpd_1.ConsentType.THIRD_PARTY_SHARING,
    title: "Compartilhamento com Terceiros",
    description: "Compartilhamento de dados com parceiros e fornecedores",
    purpose: "Integração com serviços externos e parceiros",
    required: false,
    category: "functional",
    legalBasis: lgpd_1.LegalBasis.CONSENT,
  },
];
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
var getStatusIcon = (status) => {
  switch (status) {
    case lgpd_1.ConsentStatus.GRANTED:
      return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
    case lgpd_1.ConsentStatus.DENIED:
      return <lucide_react_1.XCircle className="h-4 w-4 text-red-500" />;
    case lgpd_1.ConsentStatus.WITHDRAWN:
      return <lucide_react_1.XCircle className="h-4 w-4 text-orange-500" />;
    case lgpd_1.ConsentStatus.EXPIRED:
      return <lucide_react_1.Clock className="h-4 w-4 text-gray-500" />;
    case lgpd_1.ConsentStatus.PENDING:
      return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <lucide_react_1.Info className="h-4 w-4 text-gray-400" />;
  }
};
var getStatusColor = (status) => {
  switch (status) {
    case lgpd_1.ConsentStatus.GRANTED:
      return "bg-green-100 text-green-800";
    case lgpd_1.ConsentStatus.DENIED:
      return "bg-red-100 text-red-800";
    case lgpd_1.ConsentStatus.WITHDRAWN:
      return "bg-orange-100 text-orange-800";
    case lgpd_1.ConsentStatus.EXPIRED:
      return "bg-gray-100 text-gray-800";
    case lgpd_1.ConsentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};
var getCategoryColor = (category) => {
  switch (category) {
    case "essential":
      return "bg-blue-100 text-blue-800";
    case "functional":
      return "bg-purple-100 text-purple-800";
    case "analytics":
      return "bg-green-100 text-green-800";
    case "marketing":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function ConsentManager(_a) {
  var clinicId = _a.clinicId,
    userId = _a.userId,
    _b = _a.className,
    className = _b === void 0 ? "" : _b,
    onConsentChange = _a.onConsentChange;
  var _c = (0, useLGPD_1.useLGPD)({
      clinicId: clinicId,
      onConsentChange: onConsentChange,
    }),
    consents = _c.consents,
    activeConsents = _c.activeConsents,
    loading = _c.loading,
    error = _c.error,
    grantConsent = _c.grantConsent,
    withdrawConsent = _c.withdrawConsent,
    hasValidConsent = _c.hasValidConsent,
    getConsentByType = _c.getConsentByType,
    clearError = _c.clearError;
  var _d = (0, react_1.useState)(null),
    selectedConsent = _d[0],
    setSelectedConsent = _d[1];
  var _e = (0, react_1.useState)(false),
    isDetailsOpen = _e[0],
    setIsDetailsOpen = _e[1];
  // ============================================================================
  // HANDLERS
  // ============================================================================
  var handleConsentToggle = (definition, granted) =>
    __awaiter(this, void 0, void 0, function () {
      var existingConsent, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            existingConsent = getConsentByType(definition.type);
            if (!granted) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              grantConsent(definition.type, {
                purpose: definition.purpose,
                description: definition.description,
                legalBasis: definition.legalBasis,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            if (!existingConsent) return [3 /*break*/, 4];
            return [4 /*yield*/, withdrawConsent(existingConsent.id)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            console.error("Failed to toggle consent:", error_1);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var handleViewDetails = (consent) => {
    setSelectedConsent(consent);
    setIsDetailsOpen(true);
  };
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var renderConsentItem = (definition) => {
    var existingConsent = getConsentByType(definition.type);
    var isGranted = hasValidConsent(definition.type);
    var isExpired =
      (existingConsent === null || existingConsent === void 0
        ? void 0
        : existingConsent.expiresAt) && new Date(existingConsent.expiresAt) < new Date();
    return (
      <card_1.Card key={definition.type} className="mb-4">
        <card_1.CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-sm">{definition.title}</h3>
                <badge_1.Badge variant="outline" className={getCategoryColor(definition.category)}>
                  {definition.category}
                </badge_1.Badge>
                {definition.required && (
                  <badge_1.Badge variant="destructive" className="text-xs">
                    Obrigatório
                  </badge_1.Badge>
                )}
              </div>

              <p className="text-xs text-gray-600 mb-2">{definition.description}</p>

              <p className="text-xs text-gray-500">
                <strong>Finalidade:</strong> {definition.purpose}
              </p>

              {existingConsent && (
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(existingConsent.status)}
                  <badge_1.Badge className={getStatusColor(existingConsent.status)}>
                    {existingConsent.status}
                  </badge_1.Badge>
                  {existingConsent.grantedAt && (
                    <span className="text-xs text-gray-500">
                      Concedido em {new Date(existingConsent.grantedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {isExpired && (
                    <badge_1.Badge variant="destructive" className="text-xs">
                      Expirado
                    </badge_1.Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              {existingConsent && (
                <button_1.Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(existingConsent)}
                >
                  <lucide_react_1.Eye className="h-4 w-4" />
                </button_1.Button>
              )}

              <switch_1.Switch
                checked={isGranted && !isExpired}
                onCheckedChange={(checked) => handleConsentToggle(definition, checked)}
                disabled={loading || (definition.required && isGranted)}
              />
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var renderConsentDetails = () => {
    if (!selectedConsent) return null;
    var definition = CONSENT_DEFINITIONS.find((d) => d.type === selectedConsent.consentType);
    return (
      <dialog_1.Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5" />
              Detalhes do Consentimento
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Informações detalhadas sobre o consentimento LGPD
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p>
                    {(definition === null || definition === void 0 ? void 0 : definition.title) ||
                      selectedConsent.consentType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedConsent.status)}
                    <badge_1.Badge className={getStatusColor(selectedConsent.status)}>
                      {selectedConsent.status}
                    </badge_1.Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Base Legal:</span>
                  <p>{selectedConsent.legalBasis}</p>
                </div>
                <div>
                  <span className="text-gray-500">Versão:</span>
                  <p>{selectedConsent.version}</p>
                </div>
              </div>
            </div>

            <separator_1.Separator />

            <div>
              <h4 className="font-medium mb-2">Finalidade</h4>
              <p className="text-sm text-gray-600">{selectedConsent.purpose}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-sm text-gray-600">{selectedConsent.description}</p>
            </div>

            <separator_1.Separator />

            <div>
              <h4 className="font-medium mb-2">Histórico</h4>
              <div className="space-y-2 text-sm">
                {selectedConsent.grantedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Concedido em:</span>
                    <span>{new Date(selectedConsent.grantedAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                {selectedConsent.withdrawnAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revogado em:</span>
                    <span>{new Date(selectedConsent.withdrawnAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                {selectedConsent.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expira em:</span>
                    <span>{new Date(selectedConsent.expiresAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Criado em:</span>
                  <span>{new Date(selectedConsent.createdAt).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            <separator_1.Separator />

            <div>
              <h4 className="font-medium mb-2">Informações Técnicas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">IP Address:</span>
                  <span className="font-mono">{selectedConsent.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User Agent:</span>
                  <span className="font-mono text-xs truncate max-w-xs">
                    {selectedConsent.userAgent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    );
  };
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className={"space-y-6 ".concat(className)}>
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5" />
            Gerenciamento de Consentimentos LGPD
          </card_1.CardTitle>
          <card_1.CardDescription>
            Gerencie seus consentimentos de acordo com a Lei Geral de Proteção de Dados
          </card_1.CardDescription>
        </card_1.CardHeader>

        <card_1.CardContent>
          {error && (
            <alert_1.Alert className="mb-4">
              <lucide_react_1.AlertTriangle className="h-4 w-4" />
              <alert_1.AlertDescription>
                {error}
                <button_1.Button
                  variant="link"
                  size="sm"
                  onClick={clearError}
                  className="ml-2 p-0 h-auto"
                >
                  Dispensar
                </button_1.Button>
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Status dos Consentimentos</h3>
              <badge_1.Badge variant="outline">
                {activeConsents.length} de {CONSENT_DEFINITIONS.length} ativos
              </badge_1.Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-700">
                  {consents.filter((c) => c.status === lgpd_1.ConsentStatus.GRANTED).length}
                </div>
                <div className="text-green-600">Concedidos</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-medium text-red-700">
                  {consents.filter((c) => c.status === lgpd_1.ConsentStatus.WITHDRAWN).length}
                </div>
                <div className="text-red-600">Revogados</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-700">
                  {consents.filter((c) => c.status === lgpd_1.ConsentStatus.EXPIRED).length}
                </div>
                <div className="text-gray-600">Expirados</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-700">
                  {consents.filter((c) => c.status === lgpd_1.ConsentStatus.PENDING).length}
                </div>
                <div className="text-yellow-600">Pendentes</div>
              </div>
            </div>
          </div>

          <separator_1.Separator className="my-4" />

          <scroll_area_1.ScrollArea className="h-96">
            <div className="space-y-2">{CONSENT_DEFINITIONS.map(renderConsentItem)}</div>
          </scroll_area_1.ScrollArea>
        </card_1.CardContent>
      </card_1.Card>

      {renderConsentDetails()}
    </div>
  );
}
exports.default = ConsentManager;
