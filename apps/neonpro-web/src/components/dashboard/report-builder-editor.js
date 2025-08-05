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
exports.ReportBuilderEditor = ReportBuilderEditor;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var componentLibrary = [
  {
    type: "chart",
    name: "Gráfico",
    icon: lucide_react_1.BarChart3,
    description: "Gráficos de linha, barra, pizza, etc.",
    variants: [
      { id: "line", name: "Linha", icon: lucide_react_1.LineChart },
      { id: "bar", name: "Barra", icon: lucide_react_1.BarChart3 },
      { id: "pie", name: "Pizza", icon: lucide_react_1.PieChart },
    ],
  },
  {
    type: "table",
    name: "Tabela",
    icon: lucide_react_1.Table,
    description: "Tabelas de dados com filtros e ordenação",
  },
  {
    type: "kpi",
    name: "KPI",
    icon: lucide_react_1.Grid3X3,
    description: "Indicadores chave de performance",
  },
  {
    type: "filter",
    name: "Filtro",
    icon: lucide_react_1.Filter,
    description: "Controles de filtro para dados",
  },
  {
    type: "text",
    name: "Texto",
    icon: lucide_react_1.Type,
    description: "Títulos, labels e textos",
  },
  {
    type: "image",
    name: "Imagem",
    icon: lucide_react_1.Image,
    description: "Logos, imagens e ícones",
  },
];
var dataSources = [
  {
    id: "patients",
    name: "Pacientes",
    icon: lucide_react_1.Database,
    description: "Dados de pacientes e consultas",
    tables: ["patients", "appointments", "medical_records"],
  },
  {
    id: "financial",
    name: "Financeiro",
    icon: lucide_react_1.Database,
    description: "Receitas, pagamentos e faturamento",
    tables: ["payments", "invoices", "financial_summary"],
  },
  {
    id: "inventory",
    name: "Estoque",
    icon: lucide_react_1.Database,
    description: "Produtos, fornecedores e movimentação",
    tables: ["inventory_items", "suppliers", "inventory_movements"],
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: lucide_react_1.Database,
    description: "Campanhas, segmentação e conversão",
    tables: ["marketing_campaigns", "patient_segments", "campaign_analytics"],
  },
];
function ReportBuilderEditor(_a) {
  var _this = this;
  var reportId = _a.reportId;
  var _b = (0, react_1.useState)("Novo Relatório"),
    reportName = _b[0],
    setReportName = _b[1];
  var _c = (0, react_1.useState)(""),
    reportDescription = _c[0],
    setReportDescription = _c[1];
  var _d = (0, react_1.useState)(""),
    selectedDataSource = _d[0],
    setSelectedDataSource = _d[1];
  var _e = (0, react_1.useState)([]),
    components = _e[0],
    setComponents = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedComponent = _f[0],
    setSelectedComponent = _f[1];
  var _g = (0, react_1.useState)({ width: 1200, height: 800 }),
    canvasSize = _g[0],
    setCanvasSize = _g[1];
  var _h = (0, react_1.useState)(false),
    showPreview = _h[0],
    setShowPreview = _h[1];
  var _j = (0, react_1.useState)(false),
    sidebarCollapsed = _j[0],
    setSidebarCollapsed = _j[1];
  // Mock report data if editing existing report
  react_1.default.useEffect(
    function () {
      if (reportId && reportId !== "new") {
        // Load existing report data
        setReportName("Relatório de Receita Mensal");
        setReportDescription("Análise detalhada da receita por mês e procedimento");
        setSelectedDataSource("financial");
        // Mock components
        setComponents([
          {
            id: "1",
            type: "kpi",
            x: 50,
            y: 50,
            width: 200,
            height: 100,
            config: {
              title: "Receita Total",
              value: "R$ 45.750,00",
              change: "+8.2%",
            },
          },
          {
            id: "2",
            type: "chart",
            x: 300,
            y: 50,
            width: 400,
            height: 250,
            config: {
              type: "line",
              title: "Receita por Mês",
              dataSource: "financial",
              xAxis: "month",
              yAxis: "revenue",
            },
          },
        ]);
      }
    },
    [reportId],
  );
  var handleAddComponent = (0, react_1.useCallback)(
    function (type, variant) {
      var newComponent = {
        id: Date.now().toString(),
        type: type,
        x: 100,
        y: 100,
        width: type === "kpi" ? 200 : type === "text" ? 300 : 400,
        height: type === "kpi" ? 120 : type === "text" ? 60 : 250,
        config: {
          title: "Novo ".concat(type),
          variant: variant,
          dataSource: selectedDataSource,
        },
      };
      setComponents(function (prev) {
        return __spreadArray(__spreadArray([], prev, true), [newComponent], false);
      });
      setSelectedComponent(newComponent.id);
    },
    [selectedDataSource],
  );
  var handleComponentSelect = (0, react_1.useCallback)(function (id) {
    setSelectedComponent(id);
  }, []);
  var handleComponentDelete = (0, react_1.useCallback)(
    function (id) {
      setComponents(function (prev) {
        return prev.filter(function (comp) {
          return comp.id !== id;
        });
      });
      if (selectedComponent === id) {
        setSelectedComponent(null);
      }
    },
    [selectedComponent],
  );
  var handleComponentUpdate = (0, react_1.useCallback)(function (id, updates) {
    setComponents(function (prev) {
      return prev.map(function (comp) {
        return comp.id === id ? __assign(__assign({}, comp), updates) : comp;
      });
    });
  }, []);
  var handleSave = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          // Implement save logic
          console.log("Saving report:", {
            name: reportName,
            description: reportDescription,
            dataSource: selectedDataSource,
            components: components,
          });
          return [2 /*return*/];
        });
      });
    },
    [reportName, reportDescription, selectedDataSource, components],
  );
  var selectedComponentData = (0, react_1.useMemo)(
    function () {
      return components.find(function (comp) {
        return comp.id === selectedComponent;
      });
    },
    [components, selectedComponent],
  );
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <input_1.Input
                value={reportName}
                onChange={function (e) {
                  return setReportName(e.target.value);
                }}
                className="text-lg font-semibold border-none p-0 h-auto"
                placeholder="Nome do relatório"
              />
              <input_1.Input
                value={reportDescription}
                onChange={function (e) {
                  return setReportDescription(e.target.value);
                }}
                className="text-sm text-muted-foreground border-none p-0 h-auto mt-1"
                placeholder="Descrição do relatório"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={function () {
                return setShowPreview(!showPreview);
              }}
            >
              <lucide_react_1.Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Editor" : "Preview"}
            </button_1.Button>

            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.Play className="w-4 h-4 mr-2" />
              Executar
            </button_1.Button>

            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.Download className="w-4 h-4 mr-2" />
              Exportar
            </button_1.Button>

            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.Share className="w-4 h-4 mr-2" />
              Compartilhar
            </button_1.Button>

            <button_1.Button onClick={handleSave}>
              <lucide_react_1.Save className="w-4 h-4 mr-2" />
              Salvar
            </button_1.Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Components & Data Sources */}
        <div
          className={"border-r bg-muted/30 transition-all duration-300 ".concat(
            sidebarCollapsed ? "w-12" : "w-80",
          )}
        >
          <div className="p-4">
            <button_1.Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mb-4"
              onClick={function () {
                return setSidebarCollapsed(!sidebarCollapsed);
              }}
            >
              {sidebarCollapsed
                ? <lucide_react_1.ChevronRight className="w-4 h-4" />
                : <lucide_react_1.ChevronLeft className="w-4 h-4 mr-2" />}
              {!sidebarCollapsed && "Recolher"}
            </button_1.Button>

            {!sidebarCollapsed && (
              <tabs_1.Tabs defaultValue="components" className="w-full">
                <tabs_1.TabsList className="grid w-full grid-cols-2">
                  <tabs_1.TabsTrigger value="components">Componentes</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="data">Dados</tabs_1.TabsTrigger>
                </tabs_1.TabsList>

                <tabs_1.TabsContent value="components" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Biblioteca de Componentes</h3>
                    <div className="space-y-2">
                      {componentLibrary.map(function (component) {
                        var IconComponent = component.icon;
                        return (
                          <card_1.Card
                            key={component.type}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={function () {
                              return handleAddComponent(component.type);
                            }}
                          >
                            <card_1.CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{component.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {component.description}
                                  </p>
                                </div>
                                <lucide_react_1.Plus className="w-3 h-3 text-muted-foreground" />
                              </div>

                              {component.variants && (
                                <div className="mt-2 flex gap-1">
                                  {component.variants.map(function (variant) {
                                    var VariantIcon = variant.icon;
                                    return (
                                      <button_1.Button
                                        key={variant.id}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={function (e) {
                                          e.stopPropagation();
                                          handleAddComponent(component.type, variant.id);
                                        }}
                                      >
                                        <VariantIcon className="w-3 h-3" />
                                      </button_1.Button>
                                    );
                                  })}
                                </div>
                              )}
                            </card_1.CardContent>
                          </card_1.Card>
                        );
                      })}
                    </div>
                  </div>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="data" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Fontes de Dados</h3>
                    <div className="space-y-2">
                      {dataSources.map(function (source) {
                        var IconComponent = source.icon;
                        return (
                          <card_1.Card
                            key={source.id}
                            className={"cursor-pointer transition-colors ".concat(
                              selectedDataSource === source.id
                                ? "ring-2 ring-primary bg-primary/5"
                                : "hover:bg-muted/50",
                            )}
                            onClick={function () {
                              return setSelectedDataSource(source.id);
                            }}
                          >
                            <card_1.CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{source.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {source.description}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1">
                                {source.tables.map(function (table) {
                                  return (
                                    <badge_1.Badge
                                      key={table}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {table}
                                    </badge_1.Badge>
                                  );
                                })}
                              </div>
                            </card_1.CardContent>
                          </card_1.Card>
                        );
                      })}
                    </div>
                  </div>
                </tabs_1.TabsContent>
              </tabs_1.Tabs>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-background overflow-auto">
          <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Components */}
            {components.map(function (component) {
              return (
                <div
                  key={component.id}
                  className={"absolute border-2 rounded-lg bg-white shadow-sm cursor-move transition-all ".concat(
                    selectedComponent === component.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50",
                  )}
                  style={{
                    left: component.x,
                    top: component.y,
                    width: component.width,
                    height: component.height,
                  }}
                  onClick={function () {
                    return handleComponentSelect(component.id);
                  }}
                >
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">
                        {component.config.title || "".concat(component.type, " Component")}
                      </h4>
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={function (e) {
                          e.stopPropagation();
                          handleComponentDelete(component.id);
                        }}
                      >
                        <lucide_react_1.Trash2 className="w-3 h-3" />
                      </button_1.Button>
                    </div>

                    <div className="flex-1 bg-muted/30 rounded flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        {component.type === "chart" && (
                          <lucide_react_1.BarChart3 className="w-8 h-8 mx-auto mb-2" />
                        )}
                        {component.type === "table" && (
                          <lucide_react_1.Table className="w-8 h-8 mx-auto mb-2" />
                        )}
                        {component.type === "kpi" && (
                          <lucide_react_1.Grid3X3 className="w-8 h-8 mx-auto mb-2" />
                        )}
                        {component.type === "filter" && (
                          <lucide_react_1.Filter className="w-8 h-8 mx-auto mb-2" />
                        )}
                        {component.type === "text" && (
                          <lucide_react_1.Type className="w-8 h-8 mx-auto mb-2" />
                        )}
                        {component.type === "image" && (
                          <lucide_react_1.Image className="w-8 h-8 mx-auto mb-2" />
                        )}
                        <p className="text-xs capitalize">{component.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <lucide_react_1.BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Comece criando seu relatório</h3>
                  <p className="text-sm mb-4">Arraste componentes da barra lateral para começar</p>
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return handleAddComponent("chart");
                    }}
                  >
                    <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Componente
                  </button_1.Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedComponentData && (
          <div className="w-80 border-l bg-muted/30 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Propriedades do Componente</h3>

                <div className="space-y-3">
                  <div>
                    <label_1.Label htmlFor="component-title" className="text-xs">
                      Título
                    </label_1.Label>
                    <input_1.Input
                      id="component-title"
                      value={selectedComponentData.config.title || ""}
                      onChange={function (e) {
                        return handleComponentUpdate(selectedComponentData.id, {
                          config: __assign(__assign({}, selectedComponentData.config), {
                            title: e.target.value,
                          }),
                        });
                      }}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label_1.Label htmlFor="component-width" className="text-xs">
                        Largura
                      </label_1.Label>
                      <input_1.Input
                        id="component-width"
                        type="number"
                        value={selectedComponentData.width}
                        onChange={function (e) {
                          return handleComponentUpdate(selectedComponentData.id, {
                            width: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label_1.Label htmlFor="component-height" className="text-xs">
                        Altura
                      </label_1.Label>
                      <input_1.Input
                        id="component-height"
                        type="number"
                        value={selectedComponentData.height}
                        onChange={function (e) {
                          return handleComponentUpdate(selectedComponentData.id, {
                            height: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {selectedComponentData.type === "chart" && (
                    <div>
                      <label_1.Label htmlFor="chart-type" className="text-xs">
                        Tipo de Gráfico
                      </label_1.Label>
                      <select_1.Select
                        value={selectedComponentData.config.variant || "line"}
                        onValueChange={function (value) {
                          return handleComponentUpdate(selectedComponentData.id, {
                            config: __assign(__assign({}, selectedComponentData.config), {
                              variant: value,
                            }),
                          });
                        }}
                      >
                        <select_1.SelectTrigger className="mt-1">
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="line">Linha</select_1.SelectItem>
                          <select_1.SelectItem value="bar">Barra</select_1.SelectItem>
                          <select_1.SelectItem value="pie">Pizza</select_1.SelectItem>
                          <select_1.SelectItem value="area">Área</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  )}

                  <div>
                    <label_1.Label htmlFor="data-source" className="text-xs">
                      Fonte de Dados
                    </label_1.Label>
                    <select_1.Select
                      value={selectedComponentData.config.dataSource || ""}
                      onValueChange={function (value) {
                        return handleComponentUpdate(selectedComponentData.id, {
                          config: __assign(__assign({}, selectedComponentData.config), {
                            dataSource: value,
                          }),
                        });
                      }}
                    >
                      <select_1.SelectTrigger className="mt-1">
                        <select_1.SelectValue placeholder="Selecionar fonte" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {dataSources.map(function (source) {
                          return (
                            <select_1.SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
              </div>

              <separator_1.Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Ações</h4>
                <div className="space-y-2">
                  <button_1.Button variant="outline" size="sm" className="w-full justify-start">
                    <lucide_react_1.Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </button_1.Button>
                  <button_1.Button variant="outline" size="sm" className="w-full justify-start">
                    <lucide_react_1.Move className="w-4 h-4 mr-2" />
                    Mover para Frente
                  </button_1.Button>
                  <button_1.Button
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start"
                    onClick={function () {
                      return handleComponentDelete(selectedComponentData.id);
                    }}
                  >
                    <lucide_react_1.Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </button_1.Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
