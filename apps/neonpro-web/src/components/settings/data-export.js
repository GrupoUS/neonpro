"use client";
"use strict";
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
exports.default = DataExport;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var exportTypes = [
  {
    id: "lgpd_compliance",
    name: "Relatório LGPD",
    description: "Relatório de conformidade com Lei Geral de Proteção de Dados",
    category: "compliance",
    formats: ["PDF", "CSV", "JSON"],
    frequency: ["manual", "monthly", "quarterly"],
    regulation: "LGPD Lei 13.709/2018",
    fields: [
      "consentimentos_coletados",
      "solicitacoes_titular",
      "incidentes_seguranca",
      "compartilhamentos_dados",
      "politicas_retencao",
      "avaliacoes_impacto",
    ],
  },
  {
    id: "anvisa_devices",
    name: "Registro ANVISA - Dispositivos",
    description: "Relatório de dispositivos médicos e equipamentos",
    category: "regulatory",
    formats: ["PDF", "XML", "CSV"],
    frequency: ["manual", "monthly", "annually"],
    regulation: "RDC 185/2001",
    fields: [
      "equipamentos_registrados",
      "manutencoes_realizadas",
      "eventos_adversos",
      "calibracoes_metrologia",
      "responsavel_tecnico",
    ],
  },
  {
    id: "cfm_professional",
    name: "Relatório CFM - Ética Profissional",
    description: "Relatório de conformidade ética e profissional",
    category: "professional",
    formats: ["PDF", "DOCX"],
    frequency: ["manual", "quarterly", "annually"],
    regulation: "Resolução CFM 2.314/2022",
    fields: [
      "profissionais_ativos",
      "especializacoes_registradas",
      "atendimentos_telemedicina",
      "prontuarios_eletronicos",
      "consentimentos_informados",
    ],
  },
  {
    id: "financial_summary",
    name: "Resumo Financeiro",
    description: "Relatório financeiro para auditoria e compliance",
    category: "financial",
    formats: ["PDF", "XLSX", "CSV"],
    frequency: ["manual", "monthly", "quarterly"],
    regulation: "RFB - Receita Federal",
    fields: [
      "receitas_procedimentos",
      "custos_operacionais",
      "tributos_recolhidos",
      "pagamentos_profissionais",
      "investimentos_equipamentos",
    ],
  },
  {
    id: "patient_anonymized",
    name: "Dados Anonimizados - Pesquisa",
    description: "Dados de pacientes anonimizados para pesquisa médica",
    category: "research",
    formats: ["CSV", "JSON", "XLSX"],
    frequency: ["manual", "quarterly"],
    regulation: "Resolução CNS 466/2012",
    fields: [
      "demografia_anonima",
      "procedimentos_realizados",
      "resultados_tratamento",
      "dados_epidemiologicos",
      "estatisticas_clinicas",
    ],
  },
  {
    id: "audit_trail",
    name: "Trilha de Auditoria",
    description: "Log completo de atividades do sistema",
    category: "security",
    formats: ["CSV", "JSON", "TXT"],
    frequency: ["manual", "daily", "weekly"],
    regulation: "ISO 27001",
    fields: [
      "logins_usuarios",
      "acesso_prontuarios",
      "modificacoes_dados",
      "exportacoes_realizadas",
      "falhas_seguranca",
    ],
  },
];
var dateRanges = [
  { value: "last_7_days", label: "Últimos 7 dias" },
  { value: "last_30_days", label: "Últimos 30 dias" },
  { value: "last_quarter", label: "Último trimestre" },
  { value: "last_year", label: "Último ano" },
  { value: "custom", label: "Período personalizado" },
];
var exportSchema = z
  .object({
    exportType: z.string().min(1, "Tipo de exportação é obrigatório"),
    format: z.string().min(1, "Formato é obrigatório"),
    dateRange: z.string().min(1, "Período é obrigatório"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    includePersonalData: z.boolean(),
    anonymizeData: z.boolean(),
    includeMetadata: z.boolean(),
    compressionEnabled: z.boolean(),
    passwordProtection: z.boolean(),
    password: z.string().optional(),
    notificationEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  })
  .superRefine(function (data, ctx) {
    if (data.dateRange === "custom") {
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data inicial é obrigatória para período personalizado",
          path: ["startDate"],
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data final é obrigatória para período personalizado",
          path: ["endDate"],
        });
      }
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data final deve ser posterior à data inicial",
          path: ["endDate"],
        });
      }
    }
    if (data.passwordProtection && (!data.password || data.password.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Senha deve ter pelo menos 8 caracteres",
        path: ["password"],
      });
    }
  });
function DataExport() {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    isExporting = _a[0],
    setIsExporting = _a[1];
  var _b = (0, react_1.useState)("export"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)("all"),
    selectedCategory = _c[0],
    setSelectedCategory = _c[1];
  var _d = (0, react_1.useState)([
      {
        id: "1",
        type: "lgpd_compliance",
        format: "PDF",
        dateRange: "last_quarter",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "completed",
        fileSize: "2.1 MB",
        downloadUrl: "/exports/lgpd_q4_2024.pdf",
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        type: "anvisa_devices",
        format: "CSV",
        dateRange: "last_30_days",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "processing",
      },
    ]),
    exportHistory = _d[0],
    setExportHistory = _d[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(exportSchema),
    defaultValues: {
      exportType: "",
      format: "",
      dateRange: "last_30_days",
      startDate: "",
      endDate: "",
      includePersonalData: false,
      anonymizeData: true,
      includeMetadata: true,
      compressionEnabled: true,
      passwordProtection: false,
      password: "",
      notificationEmail: "",
    },
  });
  var watchedExportType = form.watch("exportType");
  var watchedDateRange = form.watch("dateRange");
  var watchedPasswordProtection = form.watch("passwordProtection");
  var selectedExportType = exportTypes.find(function (type) {
    return type.id === watchedExportType;
  });
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var newExport_1, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsExporting(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // TODO: Replace with actual API call
            // const response = await fetch("/api/exports/generate", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(data),
            // });
            // Simulate export process
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 2000);
              }),
            ];
          case 2:
            // TODO: Replace with actual API call
            // const response = await fetch("/api/exports/generate", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(data),
            // });
            // Simulate export process
            _a.sent();
            newExport_1 = {
              id: Date.now().toString(),
              type: data.exportType,
              format: data.format,
              dateRange: data.dateRange,
              createdAt: new Date(),
              status: "processing",
            };
            setExportHistory(function (prev) {
              return __spreadArray([newExport_1], prev, true);
            });
            sonner_1.toast.success(
              "Exportação iniciada! Você será notificado quando estiver pronta.",
            );
            form.reset();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Erro ao gerar exportação:", error_1);
            sonner_1.toast.error("Erro ao gerar exportação");
            return [3 /*break*/, 5];
          case 4:
            setIsExporting(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var downloadExport = function (exportItem) {
    if (exportItem.downloadUrl) {
      // TODO: Implement secure download with authentication
      window.open(exportItem.downloadUrl, "_blank");
      sonner_1.toast.success("Download iniciado");
    }
  };
  var filteredExportTypes =
    selectedCategory === "all"
      ? exportTypes
      : exportTypes.filter(function (type) {
          return type.category === selectedCategory;
        });
  var getStatusBadge = function (status) {
    switch (status) {
      case "completed":
        return <badge_1.Badge className="bg-green-100 text-green-800">Concluído</badge_1.Badge>;
      case "processing":
        return <badge_1.Badge className="bg-blue-100 text-blue-800">Processando</badge_1.Badge>;
      case "failed":
        return <badge_1.Badge className="bg-red-100 text-red-800">Falhou</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">{status}</badge_1.Badge>;
    }
  };
  var getExportTypeInfo = function (typeId) {
    return exportTypes.find(function (type) {
      return type.id === typeId;
    });
  };
  return (
    <div className="space-y-6">
      {/* Brazilian Compliance Alert */}
      <alert_1.Alert>
        <lucide_react_1.Shield className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Conformidade Brasileira:</strong> Todas as exportações seguem as regulamentações
          LGPD, ANVISA e CFM. Dados sensíveis são automaticamente protegidos e anonimizados quando
          necessário.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="export" className="flex items-center gap-2">
            <lucide_react_1.Download className="h-4 w-4" />
            Nova Exportação
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history" className="flex items-center gap-2">
            <lucide_react_1.Archive className="h-4 w-4" />
            Histórico
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="scheduled" className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4" />
            Agendadas
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* New Export Tab */}
        <tabs_1.TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Types Selection */}
            <div className="lg:col-span-2">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle>Tipos de Exportação</card_1.CardTitle>
                      <card_1.CardDescription>
                        Selecione o tipo de dados para exportar
                      </card_1.CardDescription>
                    </div>
                    <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <select_1.SelectTrigger className="w-48">
                        <select_1.SelectValue placeholder="Filtrar categoria" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                        <select_1.SelectItem value="compliance">Conformidade</select_1.SelectItem>
                        <select_1.SelectItem value="regulatory">Regulatório</select_1.SelectItem>
                        <select_1.SelectItem value="professional">Profissional</select_1.SelectItem>
                        <select_1.SelectItem value="financial">Financeiro</select_1.SelectItem>
                        <select_1.SelectItem value="research">Pesquisa</select_1.SelectItem>
                        <select_1.SelectItem value="security">Segurança</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExportTypes.map(function (exportType) {
                      return (
                        <div
                          key={exportType.id}
                          className={"border rounded-lg p-4 cursor-pointer transition-colors ".concat(
                            watchedExportType === exportType.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                          onClick={function () {
                            return form.setValue("exportType", exportType.id);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{exportType.name}</h4>
                            <input
                              type="radio"
                              checked={watchedExportType === exportType.id}
                              onChange={function () {
                                return form.setValue("exportType", exportType.id);
                              }}
                              className="mt-1"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{exportType.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <badge_1.Badge variant="outline" className="text-xs">
                                {exportType.regulation}
                              </badge_1.Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {exportType.formats.map(function (format) {
                                return (
                                  <badge_1.Badge
                                    key={format}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {format}
                                  </badge_1.Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* Export Configuration */}
            <div>
              <form_1.Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Configurações</card_1.CardTitle>
                      <card_1.CardDescription>
                        Configure os parâmetros da exportação
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="space-y-4">
                      {selectedExportType && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">
                            {selectedExportType.name}
                          </h4>
                          <p className="text-sm text-blue-700">{selectedExportType.description}</p>
                        </div>
                      )}

                      <form_1.FormField
                        control={form.control}
                        name="format"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Formato</form_1.FormLabel>
                              <select_1.Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <form_1.FormControl>
                                  <select_1.SelectTrigger>
                                    <select_1.SelectValue placeholder="Selecione o formato" />
                                  </select_1.SelectTrigger>
                                </form_1.FormControl>
                                <select_1.SelectContent>
                                  {selectedExportType === null || selectedExportType === void 0
                                    ? void 0
                                    : selectedExportType.formats.map(function (format) {
                                        return (
                                          <select_1.SelectItem key={format} value={format}>
                                            {format}
                                          </select_1.SelectItem>
                                        );
                                      })}
                                </select_1.SelectContent>
                              </select_1.Select>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="dateRange"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Período</form_1.FormLabel>
                              <select_1.Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <form_1.FormControl>
                                  <select_1.SelectTrigger>
                                    <select_1.SelectValue placeholder="Selecione o período" />
                                  </select_1.SelectTrigger>
                                </form_1.FormControl>
                                <select_1.SelectContent>
                                  {dateRanges.map(function (range) {
                                    return (
                                      <select_1.SelectItem key={range.value} value={range.value}>
                                        {range.label}
                                      </select_1.SelectItem>
                                    );
                                  })}
                                </select_1.SelectContent>
                              </select_1.Select>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      {watchedDateRange === "custom" && (
                        <div className="grid grid-cols-2 gap-2">
                          <form_1.FormField
                            control={form.control}
                            name="startDate"
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Data Inicial</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input type="date" {...field} />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />
                          <form_1.FormField
                            control={form.control}
                            name="endDate"
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Data Final</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input type="date" {...field} />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Opções de Privacidade</h4>

                        <form_1.FormField
                          control={form.control}
                          name="anonymizeData"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel className="text-sm">
                                    Anonimizar Dados
                                  </form_1.FormLabel>
                                  <form_1.FormDescription className="text-xs">
                                    Remove informações pessoais identificáveis
                                  </form_1.FormDescription>
                                </div>
                                <form_1.FormControl>
                                  <switch_1.Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </form_1.FormControl>
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="includeMetadata"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel className="text-sm">
                                    Incluir Metadados
                                  </form_1.FormLabel>
                                  <form_1.FormDescription className="text-xs">
                                    Informações sobre origem e processamento
                                  </form_1.FormDescription>
                                </div>
                                <form_1.FormControl>
                                  <switch_1.Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </form_1.FormControl>
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="compressionEnabled"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel className="text-sm">
                                    Compressão
                                  </form_1.FormLabel>
                                  <form_1.FormDescription className="text-xs">
                                    Reduzir tamanho do arquivo
                                  </form_1.FormDescription>
                                </div>
                                <form_1.FormControl>
                                  <switch_1.Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </form_1.FormControl>
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="passwordProtection"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel className="text-sm">
                                    Proteção por Senha
                                  </form_1.FormLabel>
                                  <form_1.FormDescription className="text-xs">
                                    Adicionar senha ao arquivo
                                  </form_1.FormDescription>
                                </div>
                                <form_1.FormControl>
                                  <switch_1.Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </form_1.FormControl>
                              </form_1.FormItem>
                            );
                          }}
                        />

                        {watchedPasswordProtection && (
                          <form_1.FormField
                            control={form.control}
                            name="password"
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Senha</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input
                                      type="password"
                                      placeholder="Mínimo 8 caracteres"
                                      {...field}
                                    />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />
                        )}

                        <form_1.FormField
                          control={form.control}
                          name="notificationEmail"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Email de Notificação</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="email"
                                    placeholder="email@clinica.com.br"
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormDescription>
                                  Será notificado quando a exportação estiver pronta
                                </form_1.FormDescription>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>

                      <button_1.Button
                        type="submit"
                        disabled={!watchedExportType || isExporting}
                        className="w-full"
                      >
                        {isExporting
                          ? <>
                              <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Gerando Exportação...
                            </>
                          : <>
                              <lucide_react_1.Download className="mr-2 h-4 w-4" />
                              Gerar Exportação
                            </>}
                      </button_1.Button>
                    </card_1.CardContent>
                  </card_1.Card>
                </form>
              </form_1.Form>
            </div>
          </div>
        </tabs_1.TabsContent>

        {/* History Tab */}
        <tabs_1.TabsContent value="history" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Histórico de Exportações</card_1.CardTitle>
              <card_1.CardDescription>
                Exportações realizadas nos últimos 30 dias
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {exportHistory.length === 0
                ? <div className="text-center p-8">
                    <lucide_react_1.Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma exportação encontrada
                    </h3>
                    <p className="text-gray-600">Suas exportações aparecerão aqui</p>
                  </div>
                : <div className="space-y-4">
                    {exportHistory.map(function (exportItem) {
                      var typeInfo = getExportTypeInfo(exportItem.type);
                      return (
                        <div key={exportItem.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <lucide_react_1.FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <h4 className="font-medium">
                                  {(typeInfo === null || typeInfo === void 0
                                    ? void 0
                                    : typeInfo.name) || exportItem.type}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {exportItem.format} • {exportItem.dateRange}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(exportItem.status)}
                              {exportItem.status === "completed" && exportItem.downloadUrl && (
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function () {
                                    return downloadExport(exportItem);
                                  }}
                                >
                                  <lucide_react_1.Download className="h-4 w-4 mr-2" />
                                  Download
                                </button_1.Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <lucide_react_1.Clock className="h-3 w-3" />
                                {exportItem.createdAt.toLocaleDateString("pt-BR")} às{" "}
                                {exportItem.createdAt.toLocaleTimeString("pt-BR")}
                              </span>
                              {exportItem.fileSize && (
                                <span className="flex items-center gap-1">
                                  <lucide_react_1.Database className="h-3 w-3" />
                                  {exportItem.fileSize}
                                </span>
                              )}
                            </div>
                            {exportItem.expiresAt && (
                              <span className="flex items-center gap-1 text-orange-600">
                                <lucide_react_1.AlertCircle className="h-3 w-3" />
                                Expira em{" "}
                                {Math.ceil(
                                  (exportItem.expiresAt.getTime() - Date.now()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                dias
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Scheduled Tab */}
        <tabs_1.TabsContent value="scheduled" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Exportações Agendadas</card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure exportações automáticas recorrentes
                  </card_1.CardDescription>
                </div>
                <button_1.Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Exportação
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center p-8">
                <lucide_react_1.Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma exportação agendada
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure exportações automáticas para relatórios regulares
                </p>
                <button_1.Button variant="outline">Configurar Primeira Exportação</button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
