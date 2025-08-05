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
exports.InvoiceManager = InvoiceManager;
/**
 * Invoice Manager Component
 * Created: January 27, 2025
 * Purpose: Comprehensive invoice management UI for Epic 4
 * Features: Create, edit, view, manage invoices with NFSe integration
 */
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var sonner_1 = require("sonner");
// UI Components
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
// Icons
var lucide_react_1 = require("lucide-react");
// Services
var financial_1 = require("@/lib/supabase/financial");
function InvoiceManager(_a) {
  var clinicId = _a.clinicId,
    _b = _a.defaultView,
    defaultView = _b === void 0 ? "list" : _b,
    selectedInvoiceId = _a.selectedInvoiceId;
  var router = (0, navigation_1.useRouter)();
  // State Management
  var _c = (0, react_1.useState)(defaultView),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)([]),
    invoices = _d[0],
    setInvoices = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedInvoice = _e[0],
    setSelectedInvoice = _e[1];
  var _f = (0, react_1.useState)(null),
    summary = _f[0],
    setSummary = _f[1];
  var _g = (0, react_1.useState)(false),
    loading = _g[0],
    setLoading = _g[1];
  var _h = (0, react_1.useState)(""),
    searchTerm = _h[0],
    setSearchTerm = _h[1];
  // Form State for Create/Edit
  var _j = (0, react_1.useState)({
      patient_id: "",
      description: "",
      due_date: "",
      items: [],
    }),
    formData = _j[0],
    setFormData = _j[1];
  // Load Data
  (0, react_1.useEffect)(() => {
    loadInvoices();
    loadSummary();
  }, [clinicId]);
  (0, react_1.useEffect)(() => {
    if (selectedInvoiceId && activeTab === "edit") {
      loadInvoiceDetails(selectedInvoiceId);
    }
  }, [selectedInvoiceId, activeTab]);
  var loadInvoices = () =>
    __awaiter(this, void 0, void 0, function () {
      var result, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [4 /*yield*/, (0, financial_1.listInvoices)({ clinic_id: clinicId }, 1, 100)];
          case 1:
            result = _a.sent();
            if (result.invoices) {
              setInvoices(result.invoices);
            }
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to load invoices:", error_1);
            sonner_1.toast.error("Erro ao carregar faturas");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadSummary = () =>
    __awaiter(this, void 0, void 0, function () {
      var result, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, financial_1.getFinancialSummary)({ clinic_id: clinicId })];
          case 1:
            result = _a.sent();
            setSummary(result);
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Failed to load summary:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var loadInvoiceDetails = (invoiceId) =>
    __awaiter(this, void 0, void 0, function () {
      var result, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [4 /*yield*/, (0, financial_1.getInvoiceById)(invoiceId)];
          case 1:
            result = _a.sent();
            setSelectedInvoice(result);
            setFormData({
              patient_id: result.patient_id,
              description: result.description,
              due_date: result.due_date || "",
              items: result.invoice_items || [],
            });
            return [3 /*break*/, 4];
          case 2:
            error_3 = _a.sent();
            console.error("Failed to load invoice details:", error_3);
            sonner_1.toast.error("Erro ao carregar detalhes da fatura");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Handlers
  var handleCreateInvoice = () =>
    __awaiter(this, void 0, void 0, function () {
      var invoiceData, result, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            invoiceData = __assign(__assign({}, formData), { clinic_id: clinicId });
            return [4 /*yield*/, (0, financial_1.createInvoice)(invoiceData)];
          case 1:
            result = _a.sent();
            sonner_1.toast.success("Fatura criada com sucesso!");
            setActiveTab("list");
            setFormData({
              patient_id: "",
              description: "",
              due_date: "",
              items: [],
            });
            loadInvoices();
            loadSummary();
            return [3 /*break*/, 4];
          case 2:
            error_4 = _a.sent();
            console.error("Failed to create invoice:", error_4);
            sonner_1.toast.error("Erro ao criar fatura");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleUpdateInvoice = () =>
    __awaiter(this, void 0, void 0, function () {
      var result, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedInvoice) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            return [
              4 /*yield*/,
              (0, financial_1.updateInvoice)(selectedInvoice.id, {
                description: formData.description || "",
                due_date: formData.due_date,
              }),
            ];
          case 2:
            result = _a.sent();
            sonner_1.toast.success("Fatura atualizada com sucesso!");
            setActiveTab("list");
            loadInvoices();
            loadSummary();
            return [3 /*break*/, 5];
          case 3:
            error_5 = _a.sent();
            console.error("Failed to update invoice:", error_5);
            sonner_1.toast.error("Erro ao atualizar fatura");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleDownloadPDF = (invoiceId) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Mock PDF download - replace with actual implementation
          sonner_1.toast.success("Funcionalidade de PDF será implementada em breve");
        } catch (error) {
          console.error("Failed to download PDF:", error);
          sonner_1.toast.error("Erro ao baixar PDF");
        }
        return [2 /*return*/];
      });
    });
  var handleSendEmail = (invoiceId) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Mock email sending - replace with actual implementation
          sonner_1.toast.success("Funcionalidade de email será implementada em breve");
        } catch (error) {
          console.error("Failed to send email:", error);
          sonner_1.toast.error("Erro ao enviar email");
        }
        return [2 /*return*/];
      });
    });
  // Filter invoices by search term
  var filteredInvoices = invoices.filter((invoice) => {
    var _a, _b;
    return (
      ((_b = (_a = invoice.patient) === null || _a === void 0 ? void 0 : _a.name) === null ||
      _b === void 0
        ? void 0
        : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  // Status badge color mapping
  var getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "issued":
        return "bg-blue-500";
      case "sent":
        return "bg-purple-500";
      case "overdue":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-yellow-500"; // draft
    }
  };
  var getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "issued":
        return "Emitido";
      case "sent":
        return "Enviado";
      case "overdue":
        return "Vencido";
      case "cancelled":
        return "Cancelado";
      default:
        return "Rascunho"; // draft
    }
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Total Faturas</card_1.CardTitle>
              <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{summary.total_invoices}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Valor Total</card_1.CardTitle>
              <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">R$ {(summary.total_amount / 100).toFixed(2)}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Pago</card_1.CardTitle>
              <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {(summary.total_paid / 100).toFixed(2)}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Pendente</card_1.CardTitle>
              <lucide_react_1.AlertCircle className="h-4 w-4 text-yellow-600" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {(summary.total_pending / 100).toFixed(2)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Main Interface */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Gestão de Faturas</card_1.CardTitle>
          <card_1.CardDescription>
            Crie, edite e gerencie faturas para seus pacientes
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <tabs_1.Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
            <tabs_1.TabsList className="grid w-full grid-cols-3">
              <tabs_1.TabsTrigger value="list">Lista de Faturas</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="create">Criar Fatura</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="edit" disabled={!selectedInvoice}>
                Editar Fatura
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Invoice List Tab */}
            <tabs_1.TabsContent value="list" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input_1.Input
                    placeholder="Buscar faturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <button_1.Button onClick={() => setActiveTab("create")}>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Nova Fatura
                </button_1.Button>
              </div>

              <div className="space-y-2">
                {loading
                  ? <div className="text-center py-8">Carregando...</div>
                  : filteredInvoices.length === 0
                    ? <div className="text-center py-8 text-muted-foreground">
                        Nenhuma fatura encontrada
                      </div>
                    : filteredInvoices.map((invoice) => {
                        var _a;
                        return (
                          <card_1.Card key={invoice.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">#{invoice.invoice_number}</span>
                                  <badge_1.Badge className={getStatusColor(invoice.status)}>
                                    {getStatusText(invoice.status)}
                                  </badge_1.Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {(_a = invoice.patient) === null || _a === void 0
                                    ? void 0
                                    : _a.name}{" "}
                                  • {invoice.description}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Valor: R$ {(invoice.total_amount / 100).toFixed(2)}
                                  {invoice.due_date &&
                                    " \u2022 Vence: ".concat(
                                      new Date(invoice.due_date).toLocaleDateString("pt-BR"),
                                    )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(invoice.id)}
                                >
                                  <lucide_react_1.Download className="h-4 w-4" />
                                </button_1.Button>

                                {invoice.status !== "sent" && invoice.status !== "paid" && (
                                  <button_1.Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendEmail(invoice.id)}
                                  >
                                    <lucide_react_1.Send className="h-4 w-4" />
                                  </button_1.Button>
                                )}

                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setActiveTab("edit");
                                  }}
                                >
                                  <lucide_react_1.Edit className="h-4 w-4" />
                                </button_1.Button>
                              </div>
                            </div>
                          </card_1.Card>
                        );
                      })}
              </div>
            </tabs_1.TabsContent>

            {/* Create Invoice Tab */}
            <tabs_1.TabsContent value="create" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label_1.Label htmlFor="patient">Paciente</label_1.Label>
                  <input_1.Input
                    id="patient"
                    placeholder="ID do paciente"
                    value={formData.patient_id || ""}
                    onChange={(e) =>
                      setFormData(__assign(__assign({}, formData), { patient_id: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label_1.Label htmlFor="description">Descrição</label_1.Label>
                  <textarea_1.Textarea
                    id="description"
                    placeholder="Descrição dos serviços..."
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData(__assign(__assign({}, formData), { description: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label_1.Label htmlFor="due_date">Data de Vencimento</label_1.Label>
                  <input_1.Input
                    id="due_date"
                    type="date"
                    value={formData.due_date || ""}
                    onChange={(e) =>
                      setFormData(__assign(__assign({}, formData), { due_date: e.target.value }))
                    }
                  />
                </div>
              </div>

              <separator_1.Separator />

              <div className="flex justify-end space-x-2">
                <button_1.Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleCreateInvoice} disabled={loading}>
                  {loading ? "Criando..." : "Criar Fatura"}
                </button_1.Button>
              </div>
            </tabs_1.TabsContent>

            {/* Edit Invoice Tab */}
            <tabs_1.TabsContent value="edit" className="space-y-4">
              {selectedInvoice && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label_1.Label>Número da Fatura</label_1.Label>
                    <input_1.Input value={selectedInvoice.invoice_number} disabled />
                  </div>

                  <div className="grid gap-2">
                    <label_1.Label htmlFor="edit_description">Descrição</label_1.Label>
                    <textarea_1.Textarea
                      id="edit_description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData(
                          __assign(__assign({}, formData), { description: e.target.value }),
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label_1.Label htmlFor="edit_due_date">Data de Vencimento</label_1.Label>
                    <input_1.Input
                      id="edit_due_date"
                      type="date"
                      value={formData.due_date || ""}
                      onChange={(e) =>
                        setFormData(__assign(__assign({}, formData), { due_date: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}

              <separator_1.Separator />

              <div className="flex justify-end space-x-2">
                <button_1.Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleUpdateInvoice} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button_1.Button>
              </div>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
