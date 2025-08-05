// Personalization Engine Component
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PersonalizationEngine;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function PersonalizationEngine(_a) {
  var _this = this;
  var campaignId = _a.campaignId,
    onRuleCreated = _a.onRuleCreated;
  var _b = (0, react_1.useState)([]),
    rules = _b[0],
    setRules = _b[1];
  var _c = (0, react_1.useState)([]),
    templates = _c[0],
    setTemplates = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)("rules"),
    activeTab = _e[0],
    setActiveTab = _e[1];
  // Form state for creating new personalization rule
  var _f = (0, react_1.useState)({
      name: "",
      trigger_event: "segment_match",
      conditions: {
        segment_id: "",
        behavior_pattern: "",
        engagement_level: "",
        time_condition: "",
      },
      actions: {
        content_variation: "",
        send_time_optimization: false,
        frequency_capping: "",
        channel_preference: "",
      },
      priority: 5,
      is_active: true,
    }),
    ruleForm = _f[0],
    setRuleForm = _f[1];
  // Form state for creating new template
  var _g = (0, react_1.useState)({
      name: "",
      type: "email",
      content_variables: [],
      base_template: "",
      personalization_fields: {},
    }),
    templateForm = _g[0],
    setTemplateForm = _g[1];
  var loadPersonalizationData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockRules, mockTemplates;
      return __generator(this, function (_a) {
        try {
          setIsLoading(true);
          mockRules = [
            {
              id: "1",
              name: "Personalização por Segmento VIP",
              condition: {
                segment: "vip_customers",
                engagement_level: "high",
                last_purchase: "within_30_days",
              },
              action: {
                content_variation: "premium_offers",
                send_time: "optimal_per_user",
                discount_level: "20_percent",
              },
              priority: 9,
              is_active: true,
              performance_score: 8.7,
              created_at: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Re-engajamento para Inativos",
              condition: {
                last_interaction: "over_90_days",
                purchase_history: "exists",
                email_engagement: "low",
              },
              action: {
                content_variation: "reactivation_offers",
                send_time: "previous_optimal",
                incentive: "progressive_discount",
              },
              priority: 7,
              is_active: true,
              performance_score: 6.3,
              created_at: new Date().toISOString(),
            },
          ];
          mockTemplates = [
            {
              id: "1",
              name: "Template VIP Personalizado",
              type: "email",
              content_variables: ["first_name", "last_purchase", "vip_tier", "exclusive_offer"],
              base_template:
                "Olá {{first_name}}, como membro {{vip_tier}}, temos uma oferta exclusiva...",
              personalization_fields: {
                greeting_style: "formal",
                offer_intensity: "high",
                urgency_level: "medium",
              },
              conversion_rate: 12.8,
              usage_count: 247,
            },
            {
              id: "2",
              name: "Template Re-engajamento",
              type: "email",
              content_variables: [
                "first_name",
                "last_visit",
                "favorite_category",
                "comeback_offer",
              ],
              base_template:
                "Sentimos sua falta, {{first_name}}! Veja o que há de novo em {{favorite_category}}...",
              personalization_fields: {
                tone: "friendly",
                incentive_type: "discount",
                content_focus: "product_recommendations",
              },
              conversion_rate: 8.4,
              usage_count: 156,
            },
          ];
          setRules(mockRules);
          setTemplates(mockTemplates);
        } catch (error) {
          console.error("Error loading personalization data:", error);
          sonner_1.toast.error("Erro ao carregar dados de personalização");
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      loadPersonalizationData();
    },
    [campaignId],
  );
  var handleCreateRule = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var ruleData;
      return __generator(this, function (_a) {
        try {
          ruleData = {
            campaign_id: campaignId,
            name: ruleForm.name,
            condition: ruleForm.conditions,
            action: ruleForm.actions,
            priority: ruleForm.priority,
            is_active: ruleForm.is_active,
          };
          // In a real app, this would call the API
          console.log("Creating personalization rule:", ruleData);
          sonner_1.toast.success("Regra de personalização criada com sucesso!");
          // Reset form
          setRuleForm({
            name: "",
            trigger_event: "segment_match",
            conditions: {
              segment_id: "",
              behavior_pattern: "",
              engagement_level: "",
              time_condition: "",
            },
            actions: {
              content_variation: "",
              send_time_optimization: false,
              frequency_capping: "",
              channel_preference: "",
            },
            priority: 5,
            is_active: true,
          });
          loadPersonalizationData();
        } catch (error) {
          console.error("Error creating personalization rule:", error);
          sonner_1.toast.error("Erro ao criar regra de personalização");
        }
        return [2 /*return*/];
      });
    });
  };
  var handleCreateTemplate = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var templateData;
      return __generator(this, function (_a) {
        try {
          templateData = __assign({ campaign_id: campaignId }, templateForm);
          // In a real app, this would call the API
          console.log("Creating personalization template:", templateData);
          sonner_1.toast.success("Template de personalização criado com sucesso!");
          // Reset form
          setTemplateForm({
            name: "",
            type: "email",
            content_variables: [],
            base_template: "",
            personalization_fields: {},
          });
          loadPersonalizationData();
        } catch (error) {
          console.error("Error creating personalization template:", error);
          sonner_1.toast.error("Erro ao criar template de personalização");
        }
        return [2 /*return*/];
      });
    });
  };
  var getPriorityBadge = function (priority) {
    if (priority >= 8) return <badge_1.Badge className="bg-red-500 text-white">Alta</badge_1.Badge>;
    if (priority >= 5)
      return <badge_1.Badge className="bg-yellow-500 text-white">Média</badge_1.Badge>;
    return <badge_1.Badge className="bg-green-500 text-white">Baixa</badge_1.Badge>;
  };
  var getPerformanceColor = function (score) {
    if (!score) return "text-gray-500";
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };
  var addContentVariable = function () {
    var newVar = prompt("Nome da variável (ex: first_name):");
    if (newVar && !templateForm.content_variables.includes(newVar)) {
      setTemplateForm(function (prev) {
        return __assign(__assign({}, prev), {
          content_variables: __spreadArray(
            __spreadArray([], prev.content_variables, true),
            [newVar],
            false,
          ),
        });
      });
    }
  };
  var removeContentVariable = function (variable) {
    setTemplateForm(function (prev) {
      return __assign(__assign({}, prev), {
        content_variables: prev.content_variables.filter(function (v) {
          return v !== variable;
        }),
      });
    });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <lucide_react_1.Brain className="h-6 w-6" />
            Engine de Personalização
          </h2>
          <p className="text-muted-foreground">
            Configure regras inteligentes para personalizar automaticamente suas campanhas
          </p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regras Ativas</p>
                <p className="text-2xl font-bold">
                  {
                    rules.filter(function (r) {
                      return r.is_active;
                    }).length
                  }
                </p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <lucide_react_1.MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Média</p>
                <p className="text-2xl font-bold">7.5</p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uplift Médio</p>
                <p className="text-2xl font-bold text-green-600">+24%</p>
              </div>
              <lucide_react_1.Star className="h-8 w-8 text-yellow-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="rules">Regras de Personalização</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Personalization Rules Tab */}
        <tabs_1.TabsContent value="rules" className="space-y-6">
          {/* Create New Rule */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Nova Regra de Personalização</card_1.CardTitle>
              <card_1.CardDescription>
                Configure quando e como personalizar o conteúdo da campanha
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label htmlFor="rule_name">Nome da Regra</label_1.Label>
                  <input_1.Input
                    id="rule_name"
                    value={ruleForm.name}
                    onChange={function (e) {
                      return setRuleForm(function (prev) {
                        return __assign(__assign({}, prev), { name: e.target.value });
                      });
                    }}
                    placeholder="Ex: Personalização VIP"
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="priority">Prioridade</label_1.Label>
                  <select_1.Select
                    value={ruleForm.priority.toString()}
                    onValueChange={function (value) {
                      return setRuleForm(function (prev) {
                        return __assign(__assign({}, prev), { priority: parseInt(value) });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="1">1 - Muito Baixa</select_1.SelectItem>
                      <select_1.SelectItem value="3">3 - Baixa</select_1.SelectItem>
                      <select_1.SelectItem value="5">5 - Média</select_1.SelectItem>
                      <select_1.SelectItem value="7">7 - Alta</select_1.SelectItem>
                      <select_1.SelectItem value="9">9 - Muito Alta</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-3">
                <label_1.Label>Condições de Ativação</label_1.Label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="segment_id">Segmento</label_1.Label>
                    <select_1.Select
                      value={ruleForm.conditions.segment_id}
                      onValueChange={function (value) {
                        return setRuleForm(function (prev) {
                          return __assign(__assign({}, prev), {
                            conditions: __assign(__assign({}, prev.conditions), {
                              segment_id: value,
                            }),
                          });
                        });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o segmento" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="vip">Clientes VIP</select_1.SelectItem>
                        <select_1.SelectItem value="new">Novos Clientes</select_1.SelectItem>
                        <select_1.SelectItem value="inactive">Inativos</select_1.SelectItem>
                        <select_1.SelectItem value="high_value">Alto Valor</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="engagement_level">Nível de Engajamento</label_1.Label>
                    <select_1.Select
                      value={ruleForm.conditions.engagement_level}
                      onValueChange={function (value) {
                        return setRuleForm(function (prev) {
                          return __assign(__assign({}, prev), {
                            conditions: __assign(__assign({}, prev.conditions), {
                              engagement_level: value,
                            }),
                          });
                        });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o nível" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="high">Alto</select_1.SelectItem>
                        <select_1.SelectItem value="medium">Médio</select_1.SelectItem>
                        <select_1.SelectItem value="low">Baixo</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <label_1.Label>Ações de Personalização</label_1.Label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="content_variation">Variação de Conteúdo</label_1.Label>
                    <select_1.Select
                      value={ruleForm.actions.content_variation}
                      onValueChange={function (value) {
                        return setRuleForm(function (prev) {
                          return __assign(__assign({}, prev), {
                            actions: __assign(__assign({}, prev.actions), {
                              content_variation: value,
                            }),
                          });
                        });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Tipo de variação" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="premium_offers">
                          Ofertas Premium
                        </select_1.SelectItem>
                        <select_1.SelectItem value="discount_focus">
                          Foco em Desconto
                        </select_1.SelectItem>
                        <select_1.SelectItem value="product_recs">
                          Recomendações
                        </select_1.SelectItem>
                        <select_1.SelectItem value="urgency">Urgência</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="channel_preference">Canal Preferido</label_1.Label>
                    <select_1.Select
                      value={ruleForm.actions.channel_preference}
                      onValueChange={function (value) {
                        return setRuleForm(function (prev) {
                          return __assign(__assign({}, prev), {
                            actions: __assign(__assign({}, prev.actions), {
                              channel_preference: value,
                            }),
                          });
                        });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Canal" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="email">Email</select_1.SelectItem>
                        <select_1.SelectItem value="sms">SMS</select_1.SelectItem>
                        <select_1.SelectItem value="push">Push</select_1.SelectItem>
                        <select_1.SelectItem value="whatsapp">WhatsApp</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <switch_1.Switch
                    id="send_time_optimization"
                    checked={ruleForm.actions.send_time_optimization}
                    onCheckedChange={function (checked) {
                      return setRuleForm(function (prev) {
                        return __assign(__assign({}, prev), {
                          actions: __assign(__assign({}, prev.actions), {
                            send_time_optimization: checked,
                          }),
                        });
                      });
                    }}
                  />
                  <label_1.Label htmlFor="send_time_optimization">
                    Otimização de Horário de Envio
                  </label_1.Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <switch_1.Switch
                  id="is_active"
                  checked={ruleForm.is_active}
                  onCheckedChange={function (checked) {
                    return setRuleForm(function (prev) {
                      return __assign(__assign({}, prev), { is_active: checked });
                    });
                  }}
                />
                <label_1.Label htmlFor="is_active">Regra Ativa</label_1.Label>
              </div>

              <button_1.Button
                onClick={handleCreateRule}
                disabled={!ruleForm.name}
                className="w-full"
              >
                Criar Regra de Personalização
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Existing Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Regras Configuradas ({rules.length})</h3>

            {rules.map(function (rule) {
              return (
                <card_1.Card key={rule.id}>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <card_1.CardTitle className="text-lg">{rule.name}</card_1.CardTitle>
                        <card_1.CardDescription>
                          Criada em {new Date(rule.created_at).toLocaleDateString("pt-BR")}
                        </card_1.CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(rule.priority)}
                        {rule.is_active
                          ? <badge_1.Badge className="bg-green-500 text-white">Ativa</badge_1.Badge>
                          : <badge_1.Badge variant="outline">Inativa</badge_1.Badge>}
                      </div>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      {/* Performance Score */}
                      {rule.performance_score && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Performance:</span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={"font-bold ".concat(
                                getPerformanceColor(rule.performance_score),
                              )}
                            >
                              {rule.performance_score.toFixed(1)}/10
                            </span>
                            <progress_1.Progress
                              value={rule.performance_score * 10}
                              className="w-20"
                            />
                          </div>
                        </div>
                      )}

                      <separator_1.Separator />

                      {/* Rule Configuration */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-2">Condições</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            {Object.entries(rule.condition).map(function (_a) {
                              var key = _a[0],
                                value = _a[1];
                              return (
                                <li key={key}>
                                  <span className="capitalize">{key.replace("_", " ")}: </span>
                                  {typeof value === "string" ? value : JSON.stringify(value)}
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Ações</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            {Object.entries(rule.action).map(function (_a) {
                              var key = _a[0],
                                value = _a[1];
                              return (
                                <li key={key}>
                                  <span className="capitalize">{key.replace("_", " ")}: </span>
                                  {typeof value === "string" ? value : JSON.stringify(value)}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                          Editar
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                          Ver Performance
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          {rule.is_active ? "Desativar" : "Ativar"}
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        {/* Templates Tab */}
        <tabs_1.TabsContent value="templates" className="space-y-6">
          {/* Create New Template */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Novo Template de Personalização</card_1.CardTitle>
              <card_1.CardDescription>
                Crie templates reutilizáveis com variáveis dinâmicas
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label htmlFor="template_name">Nome do Template</label_1.Label>
                  <input_1.Input
                    id="template_name"
                    value={templateForm.name}
                    onChange={function (e) {
                      return setTemplateForm(function (prev) {
                        return __assign(__assign({}, prev), { name: e.target.value });
                      });
                    }}
                    placeholder="Ex: Email VIP Personalizado"
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="template_type">Tipo de Template</label_1.Label>
                  <select_1.Select
                    value={templateForm.type}
                    onValueChange={function (value) {
                      return setTemplateForm(function (prev) {
                        return __assign(__assign({}, prev), { type: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="email">Email</select_1.SelectItem>
                      <select_1.SelectItem value="sms">SMS</select_1.SelectItem>
                      <select_1.SelectItem value="push">Push Notification</select_1.SelectItem>
                      <select_1.SelectItem value="web">Web</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              {/* Content Variables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label_1.Label>Variáveis de Conteúdo</label_1.Label>
                  <button_1.Button onClick={addContentVariable} variant="outline" size="sm">
                    Adicionar Variável
                  </button_1.Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {templateForm.content_variables.map(function (variable) {
                    return (
                      <badge_1.Badge
                        key={variable}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {"{{".concat(variable, "}}")}
                        <button
                          onClick={function () {
                            return removeContentVariable(variable);
                          }}
                          className="ml-1 text-xs hover:text-red-500"
                        >
                          ×
                        </button>
                      </badge_1.Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <label_1.Label htmlFor="base_template">Template Base</label_1.Label>
                <textarea_1.Textarea
                  id="base_template"
                  value={templateForm.base_template}
                  onChange={function (e) {
                    return setTemplateForm(function (prev) {
                      return __assign(__assign({}, prev), { base_template: e.target.value });
                    });
                  }}
                  placeholder="Ex: Olá {{first_name}}, como membro {{vip_tier}}..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{{variable}}"} para inserir variáveis dinâmicas
                </p>
              </div>

              <button_1.Button
                onClick={handleCreateTemplate}
                disabled={!templateForm.name || !templateForm.base_template}
                className="w-full"
              >
                Criar Template
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Existing Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Templates Criados ({templates.length})</h3>

            {templates.map(function (template) {
              return (
                <card_1.Card key={template.id}>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <card_1.CardTitle className="text-lg">{template.name}</card_1.CardTitle>
                        <card_1.CardDescription>
                          Tipo: {template.type.toUpperCase()} •{template.usage_count} usos
                        </card_1.CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <badge_1.Badge variant="outline">{template.type}</badge_1.Badge>
                        {template.conversion_rate && (
                          <badge_1.Badge className="bg-green-500 text-white">
                            {template.conversion_rate}% conversão
                          </badge_1.Badge>
                        )}
                      </div>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      {/* Template Preview */}
                      <div>
                        <h4 className="font-medium mb-2">Preview do Template</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          {template.base_template}
                        </div>
                      </div>

                      {/* Variables */}
                      <div>
                        <h4 className="font-medium mb-2">Variáveis Disponíveis</h4>
                        <div className="flex flex-wrap gap-2">
                          {template.content_variables.map(function (variable) {
                            return (
                              <badge_1.Badge key={variable} variant="outline">
                                {"{{".concat(variable, "}}")}
                              </badge_1.Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                          Editar
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                          Preview
                        </button_1.Button>
                        <button_1.Button size="sm">Usar Template</button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        {/* Analytics Tab */}
        <tabs_1.TabsContent value="analytics" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance da Personalização</card_1.CardTitle>
              <card_1.CardDescription>
                Análise de efetividade das regras e templates de personalização
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-6">
                {/* Overall Performance */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">+24%</div>
                    <div className="text-sm text-muted-foreground">Uplift em Conversão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">+18%</div>
                    <div className="text-sm text-muted-foreground">Melhoria em Engajamento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">87%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
                  </div>
                </div>

                <separator_1.Separator />

                {/* Top Performing Rules */}
                <div>
                  <h4 className="font-medium mb-3">Regras com Melhor Performance</h4>
                  <div className="space-y-2">
                    {rules
                      .filter(function (r) {
                        return r.performance_score;
                      })
                      .sort(function (a, b) {
                        return (b.performance_score || 0) - (a.performance_score || 0);
                      })
                      .slice(0, 3)
                      .map(function (rule, index) {
                        var _a;
                        return (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-lg font-bold text-muted-foreground">
                                #{index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{rule.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Prioridade: {rule.priority}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={"font-bold ".concat(
                                  getPerformanceColor(rule.performance_score),
                                )}
                              >
                                {(_a = rule.performance_score) === null || _a === void 0
                                  ? void 0
                                  : _a.toFixed(1)}
                                /10
                              </div>
                              <div className="text-sm text-green-600">
                                +{Math.round((rule.performance_score || 0) * 3)}% uplift
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-3">Recomendações de Otimização</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <lucide_react_1.CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Expandir Regra VIP</div>
                        <div className="text-sm text-muted-foreground">
                          A regra para clientes VIP está performando muito bem. Considere criar
                          variações para diferentes níveis VIP.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <lucide_react_1.AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Otimizar Timing</div>
                        <div className="text-sm text-muted-foreground">
                          Algumas regras podem se beneficiar de horários de envio mais específicos
                          baseados no comportamento do usuário.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
