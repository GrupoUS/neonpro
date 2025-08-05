"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.ConsentBanner = ConsentBanner;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var accordion_1 = require("@/components/ui/accordion");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function ConsentBanner(_a) {
  var _this = this;
  var _b = _a.position,
    position = _b === void 0 ? "bottom" : _b,
    _c = _a.theme,
    theme = _c === void 0 ? "light" : _c,
    _d = _a.showLogo,
    showLogo = _d === void 0 ? true : _d,
    _e = _a.companyName,
    companyName = _e === void 0 ? "NeonPro" : _e,
    _f = _a.privacyPolicyUrl,
    privacyPolicyUrl = _f === void 0 ? "/privacy-policy" : _f,
    _g = _a.termsOfServiceUrl,
    termsOfServiceUrl = _g === void 0 ? "/terms-of-service" : _g;
  var _h = (0, useLGPD_1.useConsentBanner)(),
    purposes = _h.purposes,
    userConsents = _h.userConsents,
    isVisible = _h.isVisible,
    isLoading = _h.isLoading,
    giveConsent = _h.giveConsent,
    withdrawConsent = _h.withdrawConsent,
    acceptAll = _h.acceptAll,
    rejectAll = _h.rejectAll,
    hideConsentBanner = _h.hideConsentBanner;
  var _j = (0, react_1.useState)({}),
    selectedPurposes = _j[0],
    setSelectedPurposes = _j[1];
  var _k = (0, react_1.useState)(false),
    showDetails = _k[0],
    setShowDetails = _k[1];
  (0, react_1.useEffect)(
    function () {
      // Inicializar com consentimentos existentes
      var initialConsents = {};
      purposes === null || purposes === void 0
        ? void 0
        : purposes.forEach(function (purpose) {
            var existingConsent =
              userConsents === null || userConsents === void 0
                ? void 0
                : userConsents.find(function (c) {
                    return c.purpose_id === purpose.id;
                  });
            initialConsents[purpose.id] =
              (existingConsent === null || existingConsent === void 0
                ? void 0
                : existingConsent.status) === "given";
          });
      setSelectedPurposes(initialConsents);
    },
    [purposes, userConsents],
  );
  var handlePurposeToggle = function (purposeId, checked) {
    setSelectedPurposes(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[purposeId] = checked), _a));
    });
  };
  var handleSavePreferences = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _i, _a, _b, purposeId, granted, error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            (_i = 0), (_a = Object.entries(selectedPurposes));
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (purposeId = _b[0]), (granted = _b[1]);
            if (!granted) return [3 /*break*/, 3];
            return [4 /*yield*/, giveConsent(purposeId)];
          case 2:
            _c.sent();
            return [3 /*break*/, 5];
          case 3:
            return [4 /*yield*/, withdrawConsent(purposeId)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            hideConsentBanner();
            return [3 /*break*/, 8];
          case 7:
            error_1 = _c.sent();
            console.error("Erro ao salvar preferências:", error_1);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleAcceptAll = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, acceptAll()];
          case 1:
            _a.sent();
            hideConsentBanner();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao aceitar todos:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRejectAll = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, rejectAll()];
          case 1:
            _a.sent();
            hideConsentBanner();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Erro ao rejeitar todos:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getPurposeIcon = function (category) {
    switch (category) {
      case "essential":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      case "analytics":
        return <lucide_react_1.BarChart3 className="h-4 w-4" />;
      case "marketing":
        return <lucide_react_1.Mail className="h-4 w-4" />;
      case "personalization":
        return <lucide_react_1.Users className="h-4 w-4" />;
      case "advertising":
        return <lucide_react_1.Globe className="h-4 w-4" />;
      default:
        return <lucide_react_1.Cookie className="h-4 w-4" />;
    }
  };
  var getPurposeColor = function (category) {
    switch (category) {
      case "essential":
        return "bg-green-100 text-green-800";
      case "analytics":
        return "bg-blue-100 text-blue-800";
      case "marketing":
        return "bg-purple-100 text-purple-800";
      case "personalization":
        return "bg-orange-100 text-orange-800";
      case "advertising":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  if (!isVisible || isLoading) {
    return null;
  }
  var essentialPurposes =
    (purposes === null || purposes === void 0
      ? void 0
      : purposes.filter(function (p) {
          return p.category === "essential";
        })) || [];
  var optionalPurposes =
    (purposes === null || purposes === void 0
      ? void 0
      : purposes.filter(function (p) {
          return p.category !== "essential";
        })) || [];
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Banner */}
      <div
        className={"fixed left-0 right-0 z-50 ".concat(position === "top" ? "top-0" : "bottom-0")}
      >
        <card_1.Card
          className={"mx-4 mb-4 shadow-lg border-2 ".concat(
            theme === "dark"
              ? "bg-gray-900 border-gray-700 text-white"
              : "bg-white border-gray-200",
          )}
        >
          <card_1.CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {showLogo && (
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                    <lucide_react_1.Shield className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <lucide_react_1.Cookie className="h-5 w-5" />
                    Suas Preferências de Privacidade
                  </h3>
                  <p
                    className={"text-sm ".concat(
                      theme === "dark" ? "text-gray-300" : "text-gray-600",
                    )}
                  >
                    Respeitamos sua privacidade e seguimos a LGPD
                  </p>
                </div>
              </div>

              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={function () {
                  return hideConsentBanner();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <lucide_react_1.X className="h-4 w-4" />
              </button_1.Button>
            </div>

            <div className="space-y-4">
              {/* Resumo */}
              <div
                className={"p-4 rounded-lg border ".concat(
                  theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200",
                )}
              >
                <p className="text-sm leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência,
                  personalizar conteúdo e analisar nosso tráfego. Você pode escolher quais tipos de
                  dados deseja compartilhar conosco.
                </p>
              </div>

              {/* Cookies essenciais */}
              {essentialPurposes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Cookies Essenciais</span>
                    <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">
                      Sempre Ativo
                    </badge_1.Badge>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Necessários para o funcionamento básico do site. Não podem ser desabilitados.
                  </p>
                </div>
              )}

              {/* Cookies opcionais */}
              {optionalPurposes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Cookies Opcionais</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                    {optionalPurposes.map(function (purpose) {
                      return (
                        <div key={purpose.id} className="flex items-center space-x-3">
                          <checkbox_1.Checkbox
                            id={purpose.id}
                            checked={selectedPurposes[purpose.id] || false}
                            onCheckedChange={function (checked) {
                              return handlePurposeToggle(purpose.id, checked);
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getPurposeIcon(purpose.category)}
                              <label
                                htmlFor={purpose.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {purpose.name}
                              </label>
                              <badge_1.Badge
                                variant="outline"
                                className={getPurposeColor(purpose.category)}
                              >
                                {purpose.category}
                              </badge_1.Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{purpose.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Links legais */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <a
                  href={privacyPolicyUrl}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <lucide_react_1.FileText className="h-3 w-3" />
                  Política de Privacidade
                  <lucide_react_1.ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={termsOfServiceUrl}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <lucide_react_1.Lock className="h-3 w-3" />
                  Termos de Uso
                  <lucide_react_1.ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex gap-2 flex-1">
                  <button_1.Button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    <lucide_react_1.Check className="h-4 w-4 mr-2" />
                    Aceitar Todos
                  </button_1.Button>

                  <button_1.Button variant="outline" onClick={handleRejectAll} disabled={isLoading}>
                    Rejeitar Opcionais
                  </button_1.Button>
                </div>

                <div className="flex gap-2">
                  <button_1.Button
                    variant="outline"
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                  >
                    <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </button_1.Button>

                  <dialog_1.Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <dialog_1.DialogTrigger asChild>
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Info className="h-4 w-4 mr-2" />
                        Detalhes
                      </button_1.Button>
                    </dialog_1.DialogTrigger>
                    <dialog_1.DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle className="flex items-center gap-2">
                          <lucide_react_1.Shield className="h-5 w-5" />
                          Detalhes sobre Cookies e Privacidade
                        </dialog_1.DialogTitle>
                        <dialog_1.DialogDescription>
                          Informações detalhadas sobre como utilizamos seus dados
                        </dialog_1.DialogDescription>
                      </dialog_1.DialogHeader>

                      <div className="space-y-6">
                        <accordion_1.Accordion type="single" collapsible className="w-full">
                          {purposes === null || purposes === void 0
                            ? void 0
                            : purposes.map(function (purpose) {
                                return (
                                  <accordion_1.AccordionItem key={purpose.id} value={purpose.id}>
                                    <accordion_1.AccordionTrigger className="text-left">
                                      <div className="flex items-center gap-3">
                                        {getPurposeIcon(purpose.category)}
                                        <div>
                                          <div className="font-medium">{purpose.name}</div>
                                          <badge_1.Badge
                                            variant="outline"
                                            className={"".concat(
                                              getPurposeColor(purpose.category),
                                              " text-xs",
                                            )}
                                          >
                                            {purpose.category}
                                          </badge_1.Badge>
                                        </div>
                                      </div>
                                    </accordion_1.AccordionTrigger>
                                    <accordion_1.AccordionContent className="space-y-3">
                                      <p className="text-sm text-gray-600">{purpose.description}</p>

                                      {purpose.legal_basis && (
                                        <div>
                                          <h5 className="text-sm font-medium mb-1">Base Legal:</h5>
                                          <p className="text-sm text-gray-600">
                                            {purpose.legal_basis}
                                          </p>
                                        </div>
                                      )}

                                      {purpose.data_retention_days && (
                                        <div>
                                          <h5 className="text-sm font-medium mb-1">
                                            Retenção de Dados:
                                          </h5>
                                          <p className="text-sm text-gray-600">
                                            {purpose.data_retention_days} dias
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex items-center gap-2 pt-2">
                                        <span className="text-sm font-medium">Status:</span>
                                        {purpose.category === "essential"
                                          ? <badge_1.Badge className="bg-green-100 text-green-800">
                                              <lucide_react_1.Shield className="h-3 w-3 mr-1" />
                                              Sempre Ativo
                                            </badge_1.Badge>
                                          : <badge_1.Badge
                                              variant={
                                                selectedPurposes[purpose.id] ? "default" : "outline"
                                              }
                                            >
                                              {selectedPurposes[purpose.id] ? "Ativo" : "Inativo"}
                                            </badge_1.Badge>}
                                      </div>
                                    </accordion_1.AccordionContent>
                                  </accordion_1.AccordionItem>
                                );
                              })}
                        </accordion_1.Accordion>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <lucide_react_1.Info className="h-4 w-4" />
                            Seus Direitos LGPD
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Acessar seus dados pessoais</li>
                            <li>• Corrigir dados incompletos ou incorretos</li>
                            <li>• Solicitar a exclusão de seus dados</li>
                            <li>• Revogar consentimento a qualquer momento</li>
                            <li>• Portabilidade de dados</li>
                            <li>• Informações sobre compartilhamento</li>
                          </ul>
                          <p className="text-xs text-blue-700 mt-2">
                            Para exercer seus direitos, entre em contato conosco através da página
                            de privacidade.
                          </p>
                        </div>
                      </div>
                    </dialog_1.DialogContent>
                  </dialog_1.Dialog>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </>
  );
}
