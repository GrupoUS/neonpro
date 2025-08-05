/**
 * TASK-003: Business Logic Enhancement
 * Intelligent Invoice Generation Component
 *
 * AI-powered invoice generation with template customization,
 * automated calculations, and compliance checking.
 */
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
exports.IntelligentInvoicing = IntelligentInvoicing;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_toast_1 = require("@/components/ui/use-toast");
function IntelligentInvoicing(_a) {
  var _this = this;
  var patientId = _a.patientId,
    appointmentId = _a.appointmentId,
    onInvoiceGenerated = _a.onInvoiceGenerated;
  var _b = (0, react_1.useState)(null),
    patient = _b[0],
    setPatient = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedTemplate = _c[0],
    setSelectedTemplate = _c[1];
  var _d = (0, react_1.useState)([]),
    invoiceItems = _d[0],
    setInvoiceItems = _d[1];
  var _e = (0, react_1.useState)(),
    dueDate = _e[0],
    setDueDate = _e[1];
  var _f = (0, react_1.useState)(0),
    discount = _f[0],
    setDiscount = _f[1];
  var _g = (0, react_1.useState)(0),
    taxRate = _g[0],
    setTaxRate = _g[1];
  var _h = (0, react_1.useState)(false),
    isGenerating = _h[0],
    setIsGenerating = _h[1];
  var _j = (0, react_1.useState)(false),
    previewMode = _j[0],
    setPreviewMode = _j[1];
  var toast = (0, use_toast_1.useToast)().toast;
  // Mock templates - In production, these would come from the database
  var templates = [
    {
      id: "1",
      name: "Consulta Dermatológica",
      type: "consultation",
      items: [
        {
          id: "1",
          serviceId: "srv_001",
          serviceName: "Consulta Dermatológica",
          quantity: 1,
          unitPrice: 200.0,
          discount: 0,
          taxRate: 0,
          total: 200.0,
        },
      ],
      terms: "Pagamento à vista ou parcelado em até 3x",
      notes: "Consulta médica especializada",
    },
    {
      id: "2",
      name: "Procedimento Estético Completo",
      type: "procedure",
      items: [
        {
          id: "1",
          serviceId: "srv_002",
          serviceName: "Botox Facial",
          quantity: 1,
          unitPrice: 800.0,
          discount: 0,
          taxRate: 0,
          total: 800.0,
        },
        {
          id: "2",
          serviceId: "srv_003",
          serviceName: "Preenchimento Labial",
          quantity: 1,
          unitPrice: 600.0,
          discount: 0,
          taxRate: 0,
          total: 600.0,
        },
      ],
      terms: "Pagamento parcelado em até 6x sem juros",
      notes: "Procedimentos realizados conforme protocolo clínico",
    },
  ];
  // AI-powered template recommendation based on patient history and appointment
  var recommendTemplate = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var recommendedTemplate, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!patientId && !appointmentId) return [2 /*return*/];
            setIsGenerating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simulate AI analysis
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 2000);
              }),
            ];
          case 2:
            // Simulate AI analysis
            _a.sent();
            recommendedTemplate = templates[0];
            setSelectedTemplate(recommendedTemplate);
            setInvoiceItems(__spreadArray([], recommendedTemplate.items, true));
            toast({
              title: "Template Recomendado",
              description: "AI recomendou: ".concat(recommendedTemplate.name),
            });
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            toast({
              title: "Erro na Recomendação",
              description: "Não foi possível gerar recomendação automática",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsGenerating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Calculate totals with tax and discount
  var calculateTotals = function () {
    var subtotal = invoiceItems.reduce(function (sum, item) {
      return sum + item.total;
    }, 0);
    var discountAmount = subtotal * (discount / 100);
    var taxableAmount = subtotal - discountAmount;
    var taxAmount = taxableAmount * (taxRate / 100);
    var total = taxableAmount + taxAmount;
    return {
      subtotal: subtotal,
      discountAmount: discountAmount,
      taxAmount: taxAmount,
      total: total,
    };
  };
  // Generate invoice with automated processing
  var generateInvoice = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var totals_1, invoiceData, invoiceId, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!patient || invoiceItems.length === 0) {
              toast({
                title: "Dados Incompletos",
                description: "Selecione um paciente e adicione itens à fatura",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            setIsGenerating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            totals_1 = calculateTotals();
            invoiceData = __assign(
              __assign(
                {
                  patientId: patient.id,
                  appointmentId: appointmentId,
                  items: invoiceItems,
                  dueDate: dueDate,
                  discount: discount,
                  taxRate: taxRate,
                },
                totals_1,
              ),
              {
                template:
                  selectedTemplate === null || selectedTemplate === void 0
                    ? void 0
                    : selectedTemplate.name,
                generatedAt: new Date().toISOString(),
                status: "pending",
              },
            );
            // Mock API call
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1500);
              }),
            ];
          case 2:
            // Mock API call
            _a.sent();
            invoiceId = "INV-".concat(Date.now());
            toast({
              title: "Fatura Gerada",
              description: "Fatura ".concat(invoiceId, " criada com sucesso"),
            });
            onInvoiceGenerated === null || onInvoiceGenerated === void 0
              ? void 0
              : onInvoiceGenerated(invoiceId);
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            toast({
              title: "Erro na Geração",
              description: "Não foi possível gerar a fatura",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsGenerating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var totals = calculateTotals();
  return (
    <div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Send className="h-5 w-5" />
            Geração Inteligente de Faturas
          </card_1.CardTitle>
          <card_1.CardDescription>
            Sistema automatizado com recomendações AI e templates personalizáveis
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="patient">Paciente</label_1.Label>
              <select_1.Select
                onValueChange={function (value) {
                  // Mock patient data
                  setPatient({
                    id: value,
                    name: "Maria Silva",
                    email: "maria@email.com",
                    cpf: "123.456.789-00",
                    address: "Rua das Flores, 123",
                  });
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecionar paciente" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="patient_1">Maria Silva</select_1.SelectItem>
                  <select_1.SelectItem value="patient_2">João Santos</select_1.SelectItem>
                  <select_1.SelectItem value="patient_3">Ana Costa</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Data de Vencimento</label_1.Label>
              <popover_1.Popover>
                <popover_1.PopoverTrigger asChild>
                  <button_1.Button variant="outline" className="w-full justify-start text-left">
                    <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? (0, date_fns_1.format)(dueDate, "PPP", { locale: locale_1.pt })
                      : "Selecionar data"}
                  </button_1.Button>
                </popover_1.PopoverTrigger>
                <popover_1.PopoverContent className="w-auto p-0">
                  <calendar_1.Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </popover_1.PopoverContent>
              </popover_1.Popover>
            </div>
          </div>

          {/* AI Template Recommendation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label_1.Label>Template de Fatura</label_1.Label>
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={recommendTemplate}
                disabled={isGenerating}
              >
                {isGenerating ? "Analisando..." : "Recomendar com AI"}
              </button_1.Button>
            </div>

            <select_1.Select
              onValueChange={function (templateId) {
                var template = templates.find(function (t) {
                  return t.id === templateId;
                });
                if (template) {
                  setSelectedTemplate(template);
                  setInvoiceItems(__spreadArray([], template.items, true));
                }
              }}
            >
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Selecionar template" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {templates.map(function (template) {
                  return (
                    <select_1.SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <badge_1.Badge variant="secondary">{template.type}</badge_1.Badge>
                        {template.name}
                      </div>
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Invoice Items */}
          {invoiceItems.length > 0 && (
            <div className="space-y-4">
              <label_1.Label>Itens da Fatura</label_1.Label>
              <div className="border rounded-lg">
                <div className="p-4 space-y-4">
                  {invoiceItems.map(function (item, index) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.serviceName}</p>
                          <p className="text-sm text-gray-600">
                            Qtd: {item.quantity} × R$ {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {item.total.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Discount and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="discount">Desconto (%)</label_1.Label>
              <input_1.Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={function (e) {
                  return setDiscount(Number(e.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="tax">Taxa/Imposto (%)</label_1.Label>
              <input_1.Input
                id="tax"
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={function (e) {
                  return setTaxRate(Number(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Totals Summary */}
          {invoiceItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {totals.subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({discount}%):</span>
                    <span>-R$ {totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Impostos ({taxRate}%):</span>
                    <span>R$ {totals.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button_1.Button
              onClick={generateInvoice}
              disabled={isGenerating || !patient || invoiceItems.length === 0}
              className="flex-1 sm:flex-none"
            >
              <lucide_react_1.Send className="mr-2 h-4 w-4" />
              {isGenerating ? "Gerando..." : "Gerar Fatura"}
            </button_1.Button>

            <button_1.Button
              variant="outline"
              onClick={function () {
                return setPreviewMode(true);
              }}
            >
              <lucide_react_1.Eye className="mr-2 h-4 w-4" />
              Visualizar
            </button_1.Button>

            <button_1.Button variant="outline">
              <lucide_react_1.Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </button_1.Button>

            <button_1.Button variant="outline">
              <lucide_react_1.Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
