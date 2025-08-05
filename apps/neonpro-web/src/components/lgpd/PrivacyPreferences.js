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
exports.PrivacyPreferences = PrivacyPreferences;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function PrivacyPreferences(_a) {
  var userId = _a.userId,
    _b = _a.showHeader,
    showHeader = _b === void 0 ? true : _b,
    className = _a.className;
  var _c = (0, useLGPD_1.useConsentBanner)(),
    purposes = _c.purposes,
    userConsents = _c.userConsents,
    isLoading = _c.isLoading,
    error = _c.error,
    giveConsent = _c.giveConsent,
    withdrawConsent = _c.withdrawConsent,
    refreshData = _c.refreshData;
  var _d = (0, react_1.useState)({}),
    preferences = _d[0],
    setPreferences = _d[1];
  var _e = (0, react_1.useState)(false),
    hasChanges = _e[0],
    setHasChanges = _e[1];
  var _f = (0, react_1.useState)(false),
    isSaving = _f[0],
    setIsSaving = _f[1];
  var _g = (0, react_1.useState)(null),
    saveMessage = _g[0],
    setSaveMessage = _g[1];
  (0, react_1.useEffect)(() => {
    // Inicializar preferências com consentimentos existentes
    var initialPreferences = {};
    purposes === null || purposes === void 0
      ? void 0
      : purposes.forEach((purpose) => {
          var existingConsent =
            userConsents === null || userConsents === void 0
              ? void 0
              : userConsents.find((c) => c.purpose_id === purpose.id);
          initialPreferences[purpose.id] =
            (existingConsent === null || existingConsent === void 0
              ? void 0
              : existingConsent.status) === "given";
        });
    setPreferences(initialPreferences);
    setHasChanges(false);
  }, [purposes, userConsents]);
  var handlePreferenceChange = (purposeId, enabled) => {
    setPreferences((prev) => {
      var _a;
      var newPreferences = __assign(__assign({}, prev), ((_a = {}), (_a[purposeId] = enabled), _a));
      // Verificar se há mudanças
      var hasChanges =
        (purposes === null || purposes === void 0
          ? void 0
          : purposes.some((purpose) => {
              var existingConsent =
                userConsents === null || userConsents === void 0
                  ? void 0
                  : userConsents.find((c) => c.purpose_id === purpose.id);
              var currentStatus =
                (existingConsent === null || existingConsent === void 0
                  ? void 0
                  : existingConsent.status) === "given";
              return newPreferences[purpose.id] !== currentStatus;
            })) || false;
      setHasChanges(hasChanges);
      return newPreferences;
    });
  };
  var handleSavePreferences = () =>
    __awaiter(this, void 0, void 0, function () {
      var _loop_1, _i, _a, _b, purposeId, enabled, error_1;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            setIsSaving(true);
            setSaveMessage(null);
            _c.label = 1;
          case 1:
            _c.trys.push([1, 7, 8, 9]);
            _loop_1 = function (purposeId, enabled) {
              var existingConsent, currentStatus;
              return __generator(this, (_d) => {
                switch (_d.label) {
                  case 0:
                    existingConsent =
                      userConsents === null || userConsents === void 0
                        ? void 0
                        : userConsents.find((c) => c.purpose_id === purposeId);
                    currentStatus =
                      (existingConsent === null || existingConsent === void 0
                        ? void 0
                        : existingConsent.status) === "given";
                    if (!(enabled !== currentStatus)) return [3 /*break*/, 4];
                    if (!enabled) return [3 /*break*/, 2];
                    return [4 /*yield*/, giveConsent(purposeId)];
                  case 1:
                    _d.sent();
                    return [3 /*break*/, 4];
                  case 2:
                    return [4 /*yield*/, withdrawConsent(purposeId)];
                  case 3:
                    _d.sent();
                    _d.label = 4;
                  case 4:
                    return [2 /*return*/];
                }
              });
            };
            (_i = 0), (_a = Object.entries(preferences));
            _c.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            (_b = _a[_i]), (purposeId = _b[0]), (enabled = _b[1]);
            return [5 /*yield**/, _loop_1(purposeId, enabled)];
          case 3:
            _c.sent();
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            setSaveMessage("Preferências salvas com sucesso!");
            setHasChanges(false);
            return [4 /*yield*/, refreshData()];
          case 6:
            _c.sent();
            return [3 /*break*/, 9];
          case 7:
            error_1 = _c.sent();
            setSaveMessage("Erro ao salvar preferências. Tente novamente.");
            console.error("Erro ao salvar preferências:", error_1);
            return [3 /*break*/, 9];
          case 8:
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
            return [7 /*endfinally*/];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  var handleResetPreferences = () => {
    var resetPreferences = {};
    purposes === null || purposes === void 0
      ? void 0
      : purposes.forEach((purpose) => {
          var existingConsent =
            userConsents === null || userConsents === void 0
              ? void 0
              : userConsents.find((c) => c.purpose_id === purpose.id);
          resetPreferences[purpose.id] =
            (existingConsent === null || existingConsent === void 0
              ? void 0
              : existingConsent.status) === "given";
        });
    setPreferences(resetPreferences);
    setHasChanges(false);
  };
  var getPurposeIcon = (category) => {
    switch (category) {
      case "essential":
        return <lucide_react_1.Shield className="h-5 w-5" />;
      case "analytics":
        return <lucide_react_1.BarChart3 className="h-5 w-5" />;
      case "marketing":
        return <lucide_react_1.Mail className="h-5 w-5" />;
      case "personalization":
        return <lucide_react_1.Users className="h-5 w-5" />;
      case "advertising":
        return <lucide_react_1.Globe className="h-5 w-5" />;
      default:
        return <lucide_react_1.Cookie className="h-5 w-5" />;
    }
  };
  var getPurposeColor = (category) => {
    switch (category) {
      case "essential":
        return "bg-green-100 text-green-800 border-green-200";
      case "analytics":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "marketing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "personalization":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "advertising":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getConsentHistory = (purposeId) =>
    (userConsents === null || userConsents === void 0
      ? void 0
      : userConsents.filter((c) => c.purpose_id === purposeId)) || [];
  var essentialPurposes =
    (purposes === null || purposes === void 0
      ? void 0
      : purposes.filter((p) => p.category === "essential")) || [];
  var optionalPurposes =
    (purposes === null || purposes === void 0
      ? void 0
      : purposes.filter((p) => p.category !== "essential")) || [];
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando preferências...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>Erro ao carregar preferências: {error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <lucide_react_1.Shield className="h-6 w-6" />
            Preferências de Privacidade
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie como seus dados são utilizados de acordo com a LGPD
          </p>
        </div>
      )}

      {saveMessage && (
        <alert_1.Alert
          className={"mb-4 ".concat(
            saveMessage.includes("sucesso")
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {saveMessage.includes("sucesso")
            ? <lucide_react_1.CheckCircle className="h-4 w-4" />
            : <lucide_react_1.XCircle className="h-4 w-4" />}
          <alert_1.AlertDescription>{saveMessage}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      <tabs_1.Tabs defaultValue="preferences" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="preferences">Preferências</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history">Histórico</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rights">Meus Direitos</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="preferences" className="space-y-6">
          {/* Cookies Essenciais */}
          {essentialPurposes.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Shield className="h-5 w-5 text-green-600" />
                  Cookies Essenciais
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Necessários para o funcionamento básico do site. Não podem ser desabilitados.
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {essentialPurposes.map((purpose) => (
                  <div
                    key={purpose.id}
                    className="flex items-start justify-between p-4 border rounded-lg bg-green-50"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getPurposeIcon(purpose.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{purpose.name}</h4>
                          <badge_1.Badge className="bg-green-100 text-green-800 border-green-200">
                            Sempre Ativo
                          </badge_1.Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{purpose.description}</p>
                        {purpose.legal_basis && (
                          <p className="text-xs text-gray-500">
                            <strong>Base Legal:</strong> {purpose.legal_basis}
                          </p>
                        )}
                      </div>
                    </div>
                    <switch_1.Switch checked={true} disabled className="mt-1" />
                  </div>
                ))}
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Cookies Opcionais */}
          {optionalPurposes.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Settings className="h-5 w-5 text-blue-600" />
                  Cookies Opcionais
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Você pode escolher quais tipos de dados deseja compartilhar conosco.
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {optionalPurposes.map((purpose) => (
                  <div
                    key={purpose.id}
                    className={"p-4 border rounded-lg transition-colors ".concat(
                      preferences[purpose.id] ? "bg-blue-50 border-blue-200" : "bg-gray-50",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getPurposeIcon(purpose.category)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{purpose.name}</h4>
                            <badge_1.Badge
                              variant="outline"
                              className={getPurposeColor(purpose.category)}
                            >
                              {purpose.category}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{purpose.description}</p>

                          <div className="space-y-1 text-xs text-gray-500">
                            {purpose.legal_basis && (
                              <p>
                                <strong>Base Legal:</strong> {purpose.legal_basis}
                              </p>
                            )}
                            {purpose.data_retention_days && (
                              <p>
                                <strong>Retenção:</strong> {purpose.data_retention_days} dias
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label_1.Label htmlFor={"switch-".concat(purpose.id)} className="text-sm">
                          {preferences[purpose.id] ? "Ativo" : "Inativo"}
                        </label_1.Label>
                        <switch_1.Switch
                          id={"switch-".concat(purpose.id)}
                          checked={preferences[purpose.id] || false}
                          onCheckedChange={(checked) => handlePreferenceChange(purpose.id, checked)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button_1.Button
              variant="outline"
              onClick={handleResetPreferences}
              disabled={!hasChanges || isSaving}
            >
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
              Resetar
            </button_1.Button>

            <button_1.Button
              onClick={handleSavePreferences}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving
                ? <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                : <lucide_react_1.Save className="h-4 w-4 mr-2" />}
              {isSaving ? "Salvando..." : "Salvar Preferências"}
            </button_1.Button>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="history" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-5 w-5" />
                Histórico de Consentimentos
              </card_1.CardTitle>
              <card_1.CardDescription>
                Visualize o histórico de suas decisões de privacidade
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {purposes === null || purposes === void 0
                  ? void 0
                  : purposes.map((purpose) => {
                      var history = getConsentHistory(purpose.id);
                      var currentConsent = history.find((c) => c.status === "given");
                      return (
                        <div key={purpose.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getPurposeIcon(purpose.category)}
                              <h4 className="font-medium">{purpose.name}</h4>
                              <badge_1.Badge
                                variant={currentConsent ? "default" : "outline"}
                                className={currentConsent ? "bg-green-100 text-green-800" : ""}
                              >
                                {currentConsent ? "Ativo" : "Inativo"}
                              </badge_1.Badge>
                            </div>
                          </div>

                          {history.length > 0
                            ? <div className="space-y-2">
                                {history.slice(0, 3).map((consent, index) => (
                                  <div
                                    key={consent.id}
                                    className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                                  >
                                    <div className="flex items-center gap-2">
                                      {consent.status === "given"
                                        ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                                        : <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />}
                                      <span>
                                        {consent.status === "given"
                                          ? "Consentimento dado"
                                          : "Consentimento retirado"}
                                      </span>
                                    </div>
                                    <span className="text-gray-500">
                                      {new Date(consent.created_at).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                ))}
                                {history.length > 3 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{history.length - 3} registros anteriores
                                  </p>
                                )}
                              </div>
                            : <p className="text-sm text-gray-500">Nenhum histórico disponível</p>}
                        </div>
                      );
                    })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="rights" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.FileText className="h-5 w-5" />
                Seus Direitos LGPD
              </card_1.CardTitle>
              <card_1.CardDescription>
                Conheça e exerça seus direitos de proteção de dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <lucide_react_1.Eye className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Acesso aos Dados</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite uma cópia de todos os dados pessoais que temos sobre você.
                  </p>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                    Solicitar Dados
                  </button_1.Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <lucide_react_1.Settings className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Correção de Dados</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite a correção de dados pessoais incompletos ou incorretos.
                  </p>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                    Corrigir Dados
                  </button_1.Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <lucide_react_1.Trash2 className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium">Exclusão de Dados</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite a exclusão de seus dados pessoais quando aplicável.
                  </p>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                    Excluir Dados
                  </button_1.Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <lucide_react_1.Lock className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Portabilidade</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Receba seus dados em formato estruturado e legível.
                  </p>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </button_1.Button>
                </div>
              </div>

              <separator_1.Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <lucide_react_1.Info className="h-4 w-4" />
                  Como exercer seus direitos
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Para exercer qualquer um dos seus direitos LGPD, entre em contato conosco através
                  dos canais oficiais. Responderemos sua solicitação em até 15 dias úteis.
                </p>
                <div className="flex gap-2">
                  <button_1.Button variant="outline" size="sm" className="bg-white">
                    <lucide_react_1.Mail className="h-4 w-4 mr-2" />
                    Contato
                  </button_1.Button>
                  <button_1.Button variant="outline" size="sm" className="bg-white">
                    <lucide_react_1.FileText className="h-4 w-4 mr-2" />
                    Política de Privacidade
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
