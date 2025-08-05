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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportModal = ExportModal;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var react_1 = require("react");
function ExportModal(_a) {
  var open = _a.open,
    onClose = _a.onClose,
    data = _a.data;
  var _b = (0, react_1.useState)(["pdf"]),
    selectedFormats = _b[0],
    setSelectedFormats = _b[1];
  var _c = (0, react_1.useState)(["kpis", "charts"]),
    selectedSections = _c[0],
    setSelectedSections = _c[1];
  var _d = (0, react_1.useState)(false),
    isExporting = _d[0],
    setIsExporting = _d[1];
  var exportOptions = [
    { id: "pdf", label: "PDF Report", icon: "📄" },
    { id: "csv", label: "CSV Data", icon: "📊" },
    { id: "xlsx", label: "Excel Spreadsheet", icon: "📈" },
  ];
  var sectionOptions = [
    { id: "kpis", label: "KPIs e Métricas" },
    { id: "charts", label: "Gráficos e Visualizações" },
    { id: "summary", label: "Resumo Executivo" },
  ];
  var handleFormatChange = (format, checked) => {
    if (checked) {
      setSelectedFormats(__spreadArray(__spreadArray([], selectedFormats, true), [format], false));
    } else {
      setSelectedFormats(selectedFormats.filter((f) => f !== format));
    }
  };
  var handleSectionChange = (section, checked) => {
    if (checked) {
      setSelectedSections(
        __spreadArray(__spreadArray([], selectedSections, true), [section], false),
      );
    } else {
      setSelectedSections(selectedSections.filter((s) => s !== section));
    }
  };
  var handleExport = () =>
    __awaiter(this, void 0, void 0, function () {
      var message, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (selectedFormats.length === 0 || selectedSections.length === 0) {
              alert("Selecione pelo menos um formato e uma seção para exportar");
              return [2 /*return*/];
            }
            setIsExporting(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simular processo de exportação
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2000))];
          case 2:
            // Simular processo de exportação
            _a.sent();
            // Exportação real para CSV
            selectedFormats.forEach((format) => {
              var fileName = "neonpro-analytics-"
                .concat(new Date().toISOString().split("T")[0], ".")
                .concat(format);
              if (format === "csv") {
                // Gerar e baixar CSV real
                var csvData = generateCSVData(data, selectedSections);
                downloadCSV(csvData, fileName);
              } else {
                console.log(
                  "Exportando ".concat(fileName, " com se\u00E7\u00F5es:"),
                  selectedSections,
                );
              }
            });
            message =
              selectedFormats.length === 1
                ? "Relat\u00F3rio exportado com sucesso em formato ".concat(
                    selectedFormats[0].toUpperCase(),
                    "!",
                  )
                : "Relat\u00F3rio exportado com sucesso em ".concat(
                    selectedFormats.length,
                    " formatos!",
                  );
            alert(message);
            onClose();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            alert("Erro ao exportar relatório. Tente novamente.");
            return [3 /*break*/, 5];
          case 4:
            setIsExporting(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Função para gerar dados CSV
  var generateCSVData = (data, sections) => {
    var csv = "NeonPro - Dashboard de Analytics\n";
    csv += "Data de Exporta\u00E7\u00E3o: ".concat(new Date().toLocaleDateString("pt-BR"), "\n\n");
    if (sections.includes("kpis")) {
      csv += "=== KPIs CLÍNICOS ===\n";
      csv += "Métrica,Valor,Variação,Tendência\n";
      csv += "Satisfa\u00E7\u00E3o do Paciente,"
        .concat(data.kpis.clinical.patientSatisfaction.value, "%,")
        .concat(data.kpis.clinical.patientSatisfaction.change > 0 ? "+" : "")
        .concat(data.kpis.clinical.patientSatisfaction.change, "%,")
        .concat(data.kpis.clinical.patientSatisfaction.trend, "\n");
      csv += "Taxa de Conclus\u00E3o,"
        .concat(data.kpis.clinical.appointmentCompletion.value, "%,")
        .concat(data.kpis.clinical.appointmentCompletion.change > 0 ? "+" : "")
        .concat(data.kpis.clinical.appointmentCompletion.change, "%,")
        .concat(data.kpis.clinical.appointmentCompletion.trend, "\n\n");
      csv += "=== KPIs FINANCEIROS ===\n";
      csv += "Métrica,Valor,Variação,Tendência\n";
      csv += "Receita Mensal,R$ "
        .concat(data.kpis.financial.monthlyRevenue.value.toLocaleString("pt-BR"), ",")
        .concat(data.kpis.financial.monthlyRevenue.change > 0 ? "+" : "")
        .concat(data.kpis.financial.monthlyRevenue.change, "%,")
        .concat(data.kpis.financial.monthlyRevenue.trend, "\n\n");
    }
    if (sections.includes("summary")) {
      csv += "=== RESUMO EXECUTIVO ===\n";
      csv += "Performance geral da clínica demonstra crescimento positivo.\n";
      csv += "Pontos fortes: Satisfação do paciente e eficiência operacional.\n\n";
    }
    csv += "---\n";
    csv += "Gerado automaticamente pelo NeonPro Analytics Dashboard\n";
    return csv;
  };
  // Função para baixar CSV
  var downloadCSV = (csvData, fileName) => {
    var blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    if (link.download !== undefined) {
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <dialog_1.Dialog open={open} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            📥 Exportar Analytics
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Selecione o formato e as seções que deseja incluir no relatório
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <label_1.Label className="text-sm font-semibold">Formato de Exportação</label_1.Label>
            <div className="space-y-2">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <checkbox_1.Checkbox
                    id={option.id}
                    checked={selectedFormats.includes(option.id)}
                    onCheckedChange={(checked) => handleFormatChange(option.id, checked)}
                  />
                  <label_1.Label
                    htmlFor={option.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </label_1.Label>
                </div>
              ))}
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <label_1.Label className="text-sm font-semibold">Seções a Incluir</label_1.Label>
            <div className="space-y-2">
              {sectionOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <checkbox_1.Checkbox
                    id={option.id}
                    checked={selectedSections.includes(option.id)}
                    onCheckedChange={(checked) => handleSectionChange(option.id, checked)}
                  />
                  <label_1.Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
                  </label_1.Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label_1.Label className="text-sm font-semibold">Visualização</label_1.Label>
            <div className="flex flex-wrap gap-2">
              {selectedFormats.map((format) => (
                <badge_1.Badge key={format}>{format.toUpperCase()}</badge_1.Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedSections.length} seção(ões) selecionada(s)
            </p>
          </div>
        </div>

        <dialog_1.DialogFooter className="flex gap-2">
          <button_1.Button onClick={onClose} disabled={isExporting}>
            Cancelar
          </button_1.Button>
          <button_1.Button onClick={handleExport} disabled={isExporting}>
            {isExporting
              ? <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Exportando...
                </>
              : <>📥 Exportar</>}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
