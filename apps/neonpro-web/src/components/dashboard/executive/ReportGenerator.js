/**
 * Report Generator Component
 *
 * Handles report generation, scheduling, and export functionality
 * for the executive dashboard with multiple formats and templates.
 */
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
exports.ReportGenerator = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var checkbox_1 = require("@/components/ui/checkbox");
var switch_1 = require("@/components/ui/switch");
// ============================================================================
// CONSTANTS
// ============================================================================
var REPORT_FORMATS = {
  pdf: {
    label: "PDF",
    icon: lucide_react_1.FileText,
    description: "Documento formatado para impressão",
  },
  excel: {
    label: "Excel",
    icon: lucide_react_1.FileSpreadsheet,
    description: "Planilha com dados e gráficos",
  },
  csv: {
    label: "CSV",
    icon: lucide_react_1.FileText,
    description: "Dados brutos em formato tabular",
  },
  png: { label: "PNG", icon: lucide_react_1.Image, description: "Imagem dos gráficos principais" },
};
var FREQUENCY_OPTIONS = {
  once: { label: "Uma vez", description: "Gerar apenas uma vez" },
  daily: { label: "Diário", description: "Todos os dias no horário especificado" },
  weekly: { label: "Semanal", description: "Uma vez por semana" },
  monthly: { label: "Mensal", description: "Uma vez por mês" },
};
var WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
var DEFAULT_TEMPLATES = [
  {
    id: "executive-summary",
    name: "Resumo Executivo",
    description: "Visão geral dos KPIs principais",
    sections: ["financial", "operational", "patient"],
    defaultFormat: "pdf",
  },
  {
    id: "financial-detailed",
    name: "Relatório Financeiro Detalhado",
    description: "Análise completa das métricas financeiras",
    sections: ["financial"],
    defaultFormat: "excel",
  },
  {
    id: "operational-performance",
    name: "Performance Operacional",
    description: "Métricas de eficiência e produtividade",
    sections: ["operational", "staff"],
    defaultFormat: "pdf",
  },
  {
    id: "patient-analytics",
    name: "Analytics de Pacientes",
    description: "Análise de satisfação e experiência do paciente",
    sections: ["patient"],
    defaultFormat: "excel",
  },
];
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
var formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  var k = 1024;
  var sizes = ["Bytes", "KB", "MB", "GB"];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
};
var getNextRunTime = (schedule) => {
  var now = new Date();
  var nextRun = new Date();
  switch (schedule.frequency) {
    case "daily":
      nextRun.setDate(now.getDate() + 1);
      break;
    case "weekly": {
      var daysUntilNext = (schedule.dayOfWeek - now.getDay() + 7) % 7;
      nextRun.setDate(now.getDate() + (daysUntilNext || 7));
      break;
    }
    case "monthly":
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(schedule.dayOfMonth);
      break;
    default:
      return "N/A";
  }
  if (schedule.time) {
    var _a = schedule.time.split(":").map(Number),
      hours = _a[0],
      minutes = _a[1];
    nextRun.setHours(hours, minutes, 0, 0);
  }
  return nextRun.toLocaleString("pt-BR");
};
// ============================================================================
// REPORT ITEM COMPONENT
// ============================================================================
var ReportItem = (_a) => {
  var report = _a.report,
    onDelete = _a.onDelete,
    onDownload = _a.onDownload,
    onShare = _a.onShare;
  var formatConfig = REPORT_FORMATS[report.format];
  var Icon = formatConfig.icon;
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{report.title}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{formatConfig.label}</span>
            <span>•</span>
            <span>{formatFileSize(report.size || 0)}</span>
            <span>•</span>
            <span>{new Date(report.generatedAt).toLocaleString("pt-BR")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <badge_1.Badge variant={report.status === "completed" ? "default" : "secondary"}>
            {report.status === "completed" ? "Concluído" : "Processando"}
          </badge_1.Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button_1.Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload(report.id)}
          disabled={report.status !== "completed"}
        >
          <lucide_react_1.Download className="h-4 w-4" />
        </button_1.Button>

        <button_1.Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(report.id)}
          disabled={report.status !== "completed"}
        >
          <lucide_react_1.Share className="h-4 w-4" />
        </button_1.Button>

        <button_1.Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(report.id)}
          className="text-red-600 hover:text-red-700"
        >
          <lucide_react_1.Trash2 className="h-4 w-4" />
        </button_1.Button>
      </div>
    </div>
  );
};
// ============================================================================
// SCHEDULE ITEM COMPONENT
// ============================================================================
var ScheduleItem = (_a) => {
  var schedule = _a.schedule,
    onEdit = _a.onEdit,
    onDelete = _a.onDelete,
    onToggle = _a.onToggle;
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <lucide_react_1.Calendar className="h-5 w-5 text-green-600" />
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{schedule.name}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{FREQUENCY_OPTIONS[schedule.frequency].label}</span>
            <span>•</span>
            <span>Próxima execução: {getNextRunTime(schedule)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <badge_1.Badge variant={schedule.enabled ? "default" : "secondary"}>
            {schedule.enabled ? "Ativo" : "Inativo"}
          </badge_1.Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <switch_1.Switch
          checked={schedule.enabled}
          onCheckedChange={(enabled) => onToggle(schedule.id, enabled)}
        />

        <button_1.Button variant="ghost" size="sm" onClick={() => onEdit(schedule)}>
          <lucide_react_1.Edit className="h-4 w-4" />
        </button_1.Button>

        <button_1.Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(schedule.id)}
          className="text-red-600 hover:text-red-700"
        >
          <lucide_react_1.Trash2 className="h-4 w-4" />
        </button_1.Button>
      </div>
    </div>
  );
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
var ReportGenerator = (_a) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  var reports = _a.reports,
    _b = _a.templates,
    templates = _b === void 0 ? DEFAULT_TEMPLATES : _b,
    schedules = _a.schedules,
    onGenerateReport = _a.onGenerateReport,
    onScheduleReport = _a.onScheduleReport,
    onDeleteReport = _a.onDeleteReport,
    onDeleteSchedule = _a.onDeleteSchedule,
    _c = _a.canManage,
    canManage = _c === void 0 ? true : _c;
  var _d = (0, react_1.useState)(false),
    isGenerating = _d[0],
    setIsGenerating = _d[1];
  var _e = (0, react_1.useState)(false),
    showNewReportDialog = _e[0],
    setShowNewReportDialog = _e[1];
  var _f = (0, react_1.useState)(false),
    showScheduleDialog = _f[0],
    setShowScheduleDialog = _f[1];
  var _g = (0, react_1.useState)(null),
    editingSchedule = _g[0],
    setEditingSchedule = _g[1];
  var _h = (0, react_1.useState)({
      templateId: "",
      title: "",
      description: "",
      format: "pdf",
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
      },
      filters: {
        includeCharts: true,
        includeRawData: false,
      },
      recipients: [],
    }),
    reportConfig = _h[0],
    setReportConfig = _h[1];
  var _j = (0, react_1.useState)({
      id: "",
      name: "",
      templateId: "",
      frequency: "weekly",
      enabled: true,
      recipients: [],
      format: "pdf",
      createdAt: new Date(),
      lastRun: null,
      nextRun: new Date(),
    }),
    scheduleConfig = _j[0],
    setScheduleConfig = _j[1];
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  var handleGenerateReport = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!reportConfig.templateId || !reportConfig.title) {
              return [2 /*return*/];
            }
            setIsGenerating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onGenerateReport(reportConfig)];
          case 2:
            _a.sent();
            setShowNewReportDialog(false);
            // Reset form
            setReportConfig({
              templateId: "",
              title: "",
              description: "",
              format: "pdf",
              dateRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date(),
              },
              filters: {
                includeCharts: true,
                includeRawData: false,
              },
              recipients: [],
            });
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error generating report:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsGenerating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleScheduleReport = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!scheduleConfig.name || !scheduleConfig.templateId) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, onScheduleReport(scheduleConfig)];
          case 2:
            _a.sent();
            setShowScheduleDialog(false);
            setEditingSchedule(null);
            // Reset form
            setScheduleConfig({
              id: "",
              name: "",
              templateId: "",
              frequency: "weekly",
              enabled: true,
              recipients: [],
              format: "pdf",
              createdAt: new Date(),
              lastRun: null,
              nextRun: new Date(),
            });
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error scheduling report:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleConfig(schedule);
    setShowScheduleDialog(true);
  };
  var handleToggleSchedule = (scheduleId, enabled) =>
    __awaiter(void 0, void 0, void 0, function () {
      var schedule;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            schedule = schedules.find((s) => s.id === scheduleId);
            if (!schedule) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              onScheduleReport(__assign(__assign({}, schedule), { enabled: enabled })),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var renderNewReportDialog = () => (
    <dialog_1.Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button className="gap-2">
          <lucide_react_1.Plus className="h-4 w-4" />
          Novo Relatório
        </button_1.Button>
      </dialog_1.DialogTrigger>

      <dialog_1.DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Gerar Novo Relatório</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure os parâmetros para gerar um novo relatório do dashboard.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <label_1.Label>Template</label_1.Label>
            <select_1.Select
              value={reportConfig.templateId}
              onValueChange={(value) =>
                setReportConfig((prev) => __assign(__assign({}, prev), { templateId: value }))
              }
            >
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Selecione um template" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {templates.map((template) => (
                  <select_1.SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label>Título</label_1.Label>
              <input_1.Input
                value={reportConfig.title}
                onChange={(e) =>
                  setReportConfig((prev) => __assign(__assign({}, prev), { title: e.target.value }))
                }
                placeholder="Nome do relatório"
              />
            </div>

            <div className="space-y-2">
              <label_1.Label>Formato</label_1.Label>
              <select_1.Select
                value={reportConfig.format}
                onValueChange={(value) =>
                  setReportConfig((prev) => __assign(__assign({}, prev), { format: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {Object.entries(REPORT_FORMATS).map((_a) => {
                    var key = _a[0],
                      config = _a[1];
                    return (
                      <select_1.SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          <div>
                            <div>{config.label}</div>
                            <div className="text-xs text-gray-500">{config.description}</div>
                          </div>
                        </div>
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label_1.Label>Descrição (opcional)</label_1.Label>
            <textarea_1.Textarea
              value={reportConfig.description}
              onChange={(e) =>
                setReportConfig((prev) =>
                  __assign(__assign({}, prev), { description: e.target.value }),
                )
              }
              placeholder="Descrição do relatório"
              rows={3}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label_1.Label>Período</label_1.Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label_1.Label className="text-sm text-gray-600">Data Inicial</label_1.Label>
                <input_1.Input
                  type="date"
                  value={reportConfig.dateRange.start.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setReportConfig((prev) =>
                      __assign(__assign({}, prev), {
                        dateRange: __assign(__assign({}, prev.dateRange), {
                          start: new Date(e.target.value),
                        }),
                      }),
                    )
                  }
                />
              </div>

              <div>
                <label_1.Label className="text-sm text-gray-600">Data Final</label_1.Label>
                <input_1.Input
                  type="date"
                  value={reportConfig.dateRange.end.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setReportConfig((prev) =>
                      __assign(__assign({}, prev), {
                        dateRange: __assign(__assign({}, prev.dateRange), {
                          end: new Date(e.target.value),
                        }),
                      }),
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <label_1.Label>Opções de Conteúdo</label_1.Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox
                  id="includeCharts"
                  checked={reportConfig.filters.includeCharts}
                  onCheckedChange={(checked) =>
                    setReportConfig((prev) =>
                      __assign(__assign({}, prev), {
                        filters: __assign(__assign({}, prev.filters), {
                          includeCharts: !!checked,
                        }),
                      }),
                    )
                  }
                />
                <label_1.Label htmlFor="includeCharts" className="text-sm">
                  Incluir gráficos e visualizações
                </label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox
                  id="includeRawData"
                  checked={reportConfig.filters.includeRawData}
                  onCheckedChange={(checked) =>
                    setReportConfig((prev) =>
                      __assign(__assign({}, prev), {
                        filters: __assign(__assign({}, prev.filters), {
                          includeRawData: !!checked,
                        }),
                      }),
                    )
                  }
                />
                <label_1.Label htmlFor="includeRawData" className="text-sm">
                  Incluir dados brutos (tabelas detalhadas)
                </label_1.Label>
              </div>
            </div>
          </div>
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={() => setShowNewReportDialog(false)}>
            Cancelar
          </button_1.Button>
          <button_1.Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !reportConfig.templateId || !reportConfig.title}
          >
            {isGenerating && <lucide_react_1.Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Gerar Relatório
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
  var renderScheduleDialog = () => {
    var _a;
    return (
      <dialog_1.Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <dialog_1.DialogTrigger asChild>
          <button_1.Button variant="outline" className="gap-2">
            <lucide_react_1.Calendar className="h-4 w-4" />
            Agendar Relatório
          </button_1.Button>
        </dialog_1.DialogTrigger>

        <dialog_1.DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {editingSchedule ? "Editar Agendamento" : "Agendar Relatório"}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Configure o agendamento automático de relatórios.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Nome do Agendamento</label_1.Label>
                <input_1.Input
                  value={scheduleConfig.name}
                  onChange={(e) =>
                    setScheduleConfig((prev) =>
                      __assign(__assign({}, prev), { name: e.target.value }),
                    )
                  }
                  placeholder="Ex: Relatório Semanal Executivo"
                />
              </div>

              <div className="space-y-2">
                <label_1.Label>Template</label_1.Label>
                <select_1.Select
                  value={scheduleConfig.templateId}
                  onValueChange={(value) =>
                    setScheduleConfig((prev) => __assign(__assign({}, prev), { templateId: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione um template" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {templates.map((template) => (
                      <select_1.SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label_1.Label>Frequência</label_1.Label>
              <select_1.Select
                value={scheduleConfig.frequency}
                onValueChange={(value) =>
                  setScheduleConfig((prev) => __assign(__assign({}, prev), { frequency: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {Object.entries(FREQUENCY_OPTIONS).map((_a) => {
                    var key = _a[0],
                      config = _a[1];
                    return (
                      <select_1.SelectItem key={key} value={key}>
                        <div>
                          <div>{config.label}</div>
                          <div className="text-sm text-gray-500">{config.description}</div>
                        </div>
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {/* Timing */}
            {scheduleConfig.frequency !== "once" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Horário</label_1.Label>
                  <input_1.Input
                    type="time"
                    value={scheduleConfig.time || "09:00"}
                    onChange={(e) =>
                      setScheduleConfig((prev) =>
                        __assign(__assign({}, prev), { time: e.target.value }),
                      )
                    }
                  />
                </div>

                {scheduleConfig.frequency === "weekly" && (
                  <div className="space-y-2">
                    <label_1.Label>Dia da Semana</label_1.Label>
                    <select_1.Select
                      value={
                        ((_a = scheduleConfig.dayOfWeek) === null || _a === void 0
                          ? void 0
                          : _a.toString()) || "1"
                      }
                      onValueChange={(value) =>
                        setScheduleConfig((prev) =>
                          __assign(__assign({}, prev), { dayOfWeek: parseInt(value) }),
                        )
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {WEEKDAYS.map((day, index) => (
                          <select_1.SelectItem key={index} value={index.toString()}>
                            {day}
                          </select_1.SelectItem>
                        ))}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                )}

                {scheduleConfig.frequency === "monthly" && (
                  <div className="space-y-2">
                    <label_1.Label>Dia do Mês</label_1.Label>
                    <input_1.Input
                      type="number"
                      min="1"
                      max="31"
                      value={scheduleConfig.dayOfMonth || 1}
                      onChange={(e) =>
                        setScheduleConfig((prev) =>
                          __assign(__assign({}, prev), {
                            dayOfMonth: parseInt(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Format and Recipients */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Formato</label_1.Label>
                <select_1.Select
                  value={scheduleConfig.format}
                  onValueChange={(value) =>
                    setScheduleConfig((prev) => __assign(__assign({}, prev), { format: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {Object.entries(REPORT_FORMATS).map((_a) => {
                      var key = _a[0],
                        config = _a[1];
                      return (
                        <select_1.SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label>Status</label_1.Label>
                <div className="flex items-center space-x-2 pt-2">
                  <switch_1.Switch
                    checked={scheduleConfig.enabled}
                    onCheckedChange={(enabled) =>
                      setScheduleConfig((prev) =>
                        __assign(__assign({}, prev), { enabled: enabled }),
                      )
                    }
                  />
                  <label_1.Label className="text-sm">
                    {scheduleConfig.enabled ? "Ativo" : "Inativo"}
                  </label_1.Label>
                </div>
              </div>
            </div>
          </div>

          <dialog_1.DialogFooter>
            <button_1.Button
              variant="outline"
              onClick={() => {
                setShowScheduleDialog(false);
                setEditingSchedule(null);
              }}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button
              onClick={handleScheduleReport}
              disabled={!scheduleConfig.name || !scheduleConfig.templateId}
            >
              {editingSchedule ? "Atualizar" : "Agendar"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    );
  };
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600 mt-1">Gere e agende relatórios personalizados do dashboard</p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            {renderNewReportDialog()}
            {renderScheduleDialog()}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <tabs_1.Tabs defaultValue="reports" className="space-y-6">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="reports" className="gap-2">
            <lucide_react_1.FileText className="h-4 w-4" />
            Relatórios Gerados
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="schedules" className="gap-2">
            <lucide_react_1.Calendar className="h-4 w-4" />
            Agendamentos
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates" className="gap-2">
            <lucide_react_1.Settings className="h-4 w-4" />
            Templates
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Reports Tab */}
        <tabs_1.TabsContent value="reports">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.FileText className="h-5 w-5" />
                Relatórios Recentes
              </card_1.CardTitle>
            </card_1.CardHeader>

            <card_1.CardContent>
              {reports.length === 0
                ? <div className="text-center py-8 text-gray-500">
                    <lucide_react_1.FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum relatório gerado ainda</p>
                    <p className="text-sm mt-1">Clique em "Novo Relatório" para começar</p>
                  </div>
                : <div className="space-y-3">
                    {reports.map((report, index) => (
                      <react_1.default.Fragment key={report.id}>
                        <ReportItem
                          report={report}
                          onDelete={onDeleteReport}
                          onDownload={(id) => console.log("Download report:", id)}
                          onShare={(id) => console.log("Share report:", id)}
                        />
                        {index < reports.length - 1 && <separator_1.Separator />}
                      </react_1.default.Fragment>
                    ))}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Schedules Tab */}
        <tabs_1.TabsContent value="schedules">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-5 w-5" />
                Agendamentos Ativos
              </card_1.CardTitle>
            </card_1.CardHeader>

            <card_1.CardContent>
              {schedules.length === 0
                ? <div className="text-center py-8 text-gray-500">
                    <lucide_react_1.Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum agendamento configurado</p>
                    <p className="text-sm mt-1">Configure relatórios automáticos</p>
                  </div>
                : <div className="space-y-3">
                    {schedules.map((schedule, index) => (
                      <react_1.default.Fragment key={schedule.id}>
                        <ScheduleItem
                          schedule={schedule}
                          onEdit={handleEditSchedule}
                          onDelete={onDeleteSchedule}
                          onToggle={handleToggleSchedule}
                        />
                        {index < schedules.length - 1 && <separator_1.Separator />}
                      </react_1.default.Fragment>
                    ))}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Templates Tab */}
        <tabs_1.TabsContent value="templates">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-5 w-5" />
                Templates Disponíveis
              </card_1.CardTitle>
            </card_1.CardHeader>

            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <badge_1.Badge variant="outline">
                          {REPORT_FORMATS[template.defaultFormat].label}
                        </badge_1.Badge>
                        <span className="text-xs text-gray-500">
                          {template.sections.length} seções
                        </span>
                      </div>

                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReportConfig((prev) =>
                            __assign(__assign({}, prev), {
                              templateId: template.id,
                              title: template.name,
                              format: template.defaultFormat,
                            }),
                          );
                          setShowNewReportDialog(true);
                        }}
                      >
                        <lucide_react_1.Play className="h-4 w-4 mr-2" />
                        Usar Template
                      </button_1.Button>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
};
exports.ReportGenerator = ReportGenerator;
exports.default = exports.ReportGenerator;
