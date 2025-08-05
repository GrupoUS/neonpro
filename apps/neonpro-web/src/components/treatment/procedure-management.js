/**
 * Procedure Management Component
 * FHIR R4 compliant component for documenting medical/aesthetic procedures
 * Follows Brazilian healthcare standards and LGPD compliance
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */
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
exports.ProcedureManagement = ProcedureManagement;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var form_1 = require("@/components/ui/form");
var use_toast_1 = require("@/hooks/use-toast");
var treatment_1 = require("@/lib/types/treatment");
var treatments_1 = require("@/lib/supabase/treatments");
var patients_1 = require("@/lib/supabase/patients");
var statusOptions = [
  { value: "preparation", label: "Preparação", color: "bg-blue-100 text-blue-800" },
  { value: "in-progress", label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  { value: "on-hold", label: "Em Pausa", color: "bg-orange-100 text-orange-800" },
  { value: "stopped", label: "Interrompido", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Concluído", color: "bg-green-100 text-green-800" },
  { value: "entered-in-error", label: "Erro", color: "bg-gray-100 text-gray-600" },
  { value: "unknown", label: "Desconhecido", color: "bg-gray-100 text-gray-600" },
];
var commonProcedures = [
  "Limpeza de pele profunda",
  "Aplicação de toxina botulínica",
  "Preenchimento com ácido hialurônico",
  "Peeling químico superficial",
  "Peeling químico médio",
  "Microagulhamento",
  "Laser CO2 fracionado",
  "IPL (Luz Intensa Pulsada)",
  "Radiofrequência facial",
  "Drenagem linfática manual",
  "Massagem relaxante",
  "Hidrafacial",
  "Criolipólise",
  "Carboxiterapia",
  "Mesoterapia facial",
];
function ProcedureManagement(_a) {
  var _b;
  var treatmentPlanId = _a.treatmentPlanId,
    patientId = _a.patientId,
    onSelectProcedure = _a.onSelectProcedure;
  var toast = (0, use_toast_1.useToast)().toast;
  // State management
  var _c = (0, react_1.useState)([]),
    procedures = _c[0],
    setProcedures = _c[1];
  var _d = (0, react_1.useState)([]),
    patients = _d[0],
    setPatients = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(""),
    searchText = _f[0],
    setSearchText = _f[1];
  var _g = (0, react_1.useState)({
      treatment_plan_id: treatmentPlanId,
      patient_id: patientId,
    }),
    filters = _g[0],
    setFilters = _g[1];
  var _h = (0, react_1.useState)(1),
    currentPage = _h[0],
    setCurrentPage = _h[1];
  var _j = (0, react_1.useState)(0),
    totalCount = _j[0],
    setTotalCount = _j[1];
  var _k = (0, react_1.useState)(false),
    isDialogOpen = _k[0],
    setIsDialogOpen = _k[1];
  var _l = (0, react_1.useState)(null),
    editingProcedure = _l[0],
    setEditingProcedure = _l[1];
  var perPage = 10;
  // Form setup
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(treatment_1.createProcedureSchema),
    defaultValues: {
      treatment_plan_id: treatmentPlanId || "",
      patient_id: patientId || "",
      code: "",
      display: "",
      status: "preparation",
      performed_date_time: "",
      performer_id: "",
      location: "",
      reason_code: "",
      reason_display: "",
      outcome: "",
      notes: "",
    },
  });
  // Load data on component mount
  (0, react_1.useEffect)(() => {
    loadData();
    loadPatients();
  }, []);
  // Reload procedures when filters change
  (0, react_1.useEffect)(() => {
    loadProcedures();
  }, [filters, currentPage, searchText]);
  var loadData = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, loadProcedures()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  var loadProcedures = () =>
    __awaiter(this, void 0, void 0, function () {
      var searchFilters, response, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            searchFilters = __assign(__assign({}, filters), {
              search_text: searchText || undefined,
            });
            return [
              4 /*yield*/,
              (0, treatments_1.searchProcedures)(searchFilters, currentPage, perPage),
            ];
          case 1:
            response = _a.sent();
            setProcedures(response.procedures);
            setTotalCount(response.total_count);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao carregar procedimentos:", error_1);
            toast({
              title: "Erro",
              description: "Não foi possível carregar os procedimentos.",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadPatients = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, patients_1.searchPatients)({}, 1, 100)];
          case 1:
            response = _a.sent();
            setPatients(response.patients);
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao carregar pacientes:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };
  var handleFilterChange = (key, value) => {
    setFilters((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[key] = value), _a));
    });
    setCurrentPage(1);
  };
  var openCreateDialog = () => {
    setEditingProcedure(null);
    form.reset({
      treatment_plan_id: treatmentPlanId || "",
      patient_id: patientId || "",
      code: "",
      display: "",
      status: "preparation",
      performed_date_time: "",
      performer_id: "",
      location: "",
      reason_code: "",
      reason_display: "",
      outcome: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };
  var openEditDialog = (procedure) => {
    setEditingProcedure(procedure);
    form.reset({
      treatment_plan_id: procedure.treatment_plan_id,
      patient_id: procedure.patient_id,
      code: procedure.code,
      display: procedure.display,
      status: procedure.status,
      performed_date_time: procedure.performed_date_time || "",
      performer_id: procedure.performer_id || "",
      location: procedure.location || "",
      reason_code: procedure.reason_code || "",
      reason_display: procedure.reason_display || "",
      outcome: procedure.outcome || "",
      notes: procedure.notes || "",
    });
    setIsDialogOpen(true);
  };
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            if (!editingProcedure) return [3 /*break*/, 2];
            return [4 /*yield*/, (0, treatments_1.updateProcedure)(editingProcedure.id, data)];
          case 1:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Procedimento atualizado com sucesso.",
            });
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, (0, treatments_1.createProcedure)(data)];
          case 3:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Procedimento criado com sucesso.",
            });
            _a.label = 4;
          case 4:
            setIsDialogOpen(false);
            loadProcedures();
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            console.error("Erro ao salvar procedimento:", error_3);
            toast({
              title: "Erro",
              description: "Não foi possível salvar o procedimento.",
              variant: "destructive",
            });
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var handleDeleteProcedure = (procedure) =>
    __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, treatments_1.deleteProcedure)(procedure.id)];
          case 1:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Procedimento excluído com sucesso.",
            });
            loadProcedures();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Erro ao excluir procedimento:", error_4);
            toast({
              title: "Erro",
              description: "Não foi possível excluir o procedimento.",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var selectCommonProcedure = (procedureName) => {
    form.setValue("display", procedureName);
    form.setValue("code", procedureName.toLowerCase().replace(/\s+/g, "-"));
  };
  var formatDateTime = (dateString) =>
    (0, date_fns_1.format)(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: locale_1.ptBR,
    });
  var getStatusOption = (status) => statusOptions.find((option) => option.value === status);
  var totalPages = Math.ceil(totalCount / perPage);
  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procedimentos</h1>
          <p className="text-muted-foreground">
            Documentação de procedimentos seguindo padrões HL7 FHIR R4
          </p>
        </div>

        <button_1.Button onClick={openCreateDialog}>
          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
          Novo Procedimento
        </button_1.Button>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input_1.Input
            placeholder="Buscar procedimentos..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {!patientId && (
            <select_1.Select
              value={filters.patient_id || "all"}
              onValueChange={(value) =>
                handleFilterChange("patient_id", value === "all" ? undefined : value)
              }
            >
              <select_1.SelectTrigger className="w-[200px]">
                <select_1.SelectValue placeholder="Todos os pacientes" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os pacientes</select_1.SelectItem>
                {patients.map((patient) => {
                  var _a;
                  return (
                    <select_1.SelectItem key={patient.id} value={patient.id}>
                      {(_a = patient.given_name) === null || _a === void 0 ? void 0 : _a[0]}{" "}
                      {patient.family_name}
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>
          )}

          <select_1.Select
            value={((_b = filters.status) === null || _b === void 0 ? void 0 : _b[0]) || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? undefined : [value])
            }
          >
            <select_1.SelectTrigger className="w-[150px]">
              <select_1.SelectValue placeholder="Todos os status" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
              {statusOptions.map((option) => (
                <select_1.SelectItem key={option.value} value={option.value}>
                  {option.label}
                </select_1.SelectItem>
              ))}
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>{" "}
      {/* Procedures Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Lista de Procedimentos</card_1.CardTitle>
          <card_1.CardDescription>
            Histórico de procedimentos realizados e agendados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading
            ? <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando...</div>
              </div>
            : procedures.length === 0
              ? <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <lucide_react_1.FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum procedimento encontrado</h3>
                    <p className="text-muted-foreground">
                      Comece documentando um novo procedimento.
                    </p>
                  </div>
                </div>
              : <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Procedimento</table_1.TableHead>
                      <table_1.TableHead>Paciente</table_1.TableHead>
                      <table_1.TableHead>Status</table_1.TableHead>
                      <table_1.TableHead>Data Realizada</table_1.TableHead>
                      <table_1.TableHead>Local</table_1.TableHead>
                      <table_1.TableHead className="w-[50px]"></table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {procedures.map((procedure) => {
                      var _a, _b, _c;
                      var statusOption = getStatusOption(procedure.status);
                      return (
                        <table_1.TableRow
                          key={procedure.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            onSelectProcedure === null || onSelectProcedure === void 0
                              ? void 0
                              : onSelectProcedure(procedure)
                          }
                        >
                          <table_1.TableCell>
                            <div className="font-medium">{procedure.display}</div>
                            {procedure.reason_display && (
                              <div className="text-sm text-muted-foreground">
                                Motivo: {procedure.reason_display}
                              </div>
                            )}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="font-medium">
                              {/* @ts-ignore - patient relation from Supabase */}
                              {(_b =
                                (_a = procedure.patient) === null || _a === void 0
                                  ? void 0
                                  : _a.given_name) === null || _b === void 0
                                ? void 0
                                : _b[0]}{" "}
                              {(_c = procedure.patient) === null || _c === void 0
                                ? void 0
                                : _c.family_name}
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {statusOption && (
                              <badge_1.Badge className={statusOption.color}>
                                {statusOption.label}
                              </badge_1.Badge>
                            )}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {procedure.performed_date_time
                              ? formatDateTime(procedure.performed_date_time)
                              : <span className="text-muted-foreground">Não realizado</span>}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {procedure.location || <span className="text-muted-foreground">-</span>}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <dropdown_menu_1.DropdownMenu>
                              <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" size="sm">
                                  <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                                </button_1.Button>
                              </dropdown_menu_1.DropdownMenuTrigger>
                              <dropdown_menu_1.DropdownMenuContent align="end">
                                <dropdown_menu_1.DropdownMenuLabel>
                                  Ações
                                </dropdown_menu_1.DropdownMenuLabel>
                                <dropdown_menu_1.DropdownMenuSeparator />
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectProcedure === null || onSelectProcedure === void 0
                                      ? void 0
                                      : onSelectProcedure(procedure);
                                  }}
                                >
                                  <lucide_react_1.FileText className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(procedure);
                                  }}
                                >
                                  <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuSeparator />
                                <dropdown_menu_1.DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProcedure(procedure);
                                  }}
                                >
                                  <lucide_react_1.Trash className="mr-2 h-4 w-4" />
                                  Excluir
                                </dropdown_menu_1.DropdownMenuItem>
                              </dropdown_menu_1.DropdownMenuContent>
                            </dropdown_menu_1.DropdownMenu>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      );
                    })}
                  </table_1.TableBody>
                </table_1.Table>}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * perPage + 1} a{" "}
                {Math.min(currentPage * perPage, totalCount)} de {totalCount} resultados
              </div>
              <div className="flex items-center space-x-2">
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button_1.Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button_1.Button>
              </div>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>
      {/* Create/Edit Procedure Dialog */}
      <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {editingProcedure ? "Editar Procedimento" : "Novo Procedimento"}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Documente um procedimento seguindo padrões HL7 FHIR R4
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Common Procedures Quick Selection */}
              <div className="space-y-3">
                <label_1.Label>Procedimentos Comuns</label_1.Label>
                <div className="flex flex-wrap gap-2">
                  {commonProcedures.map((procedure) => (
                    <badge_1.Badge
                      key={procedure}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => selectCommonProcedure(procedure)}
                    >
                      <lucide_react_1.Plus className="mr-1 h-3 w-3" />
                      {procedure}
                    </badge_1.Badge>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form_1.FormField
                  control={form.control}
                  name="display"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Nome do Procedimento *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Ex: Limpeza de pele profunda" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="code"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Código do Procedimento</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Ex: limpeza-pele-profunda" {...field} />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Código interno para identificação
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              {/* Patient and Treatment Plan */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {!patientId && (
                  <form_1.FormField
                    control={form.control}
                    name="patient_id"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Paciente *</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Selecione um paciente" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              {patients.map((patient) => {
                                var _a;
                                return (
                                  <select_1.SelectItem key={patient.id} value={patient.id}>
                                    {(_a = patient.given_name) === null || _a === void 0
                                      ? void 0
                                      : _a[0]}{" "}
                                    {patient.family_name}
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
                )}

                <form_1.FormField
                  control={form.control}
                  name="status"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Status *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {statusOptions.map((option) => (
                              <select_1.SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </select_1.SelectItem>
                            ))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              {/* Date, Time and Location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form_1.FormField
                  control={form.control}
                  name="performed_date_time"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data e Hora da Realização</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="datetime-local" {...field} />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Quando o procedimento foi ou será realizado
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="location"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Local</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            placeholder="Ex: Sala 1, Consultório principal"
                            {...field}
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              {/* Reason */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form_1.FormField
                  control={form.control}
                  name="reason_display"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Motivo/Indicação</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Ex: Pele oleosa com cravos" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="outcome"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Resultado</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            placeholder="Ex: Procedimento realizado com sucesso"
                            {...field}
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              {/* Notes */}
              <form_1.FormField
                control={form.control}
                name="notes"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Observações</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea_1.Textarea
                          placeholder="Adicione observações sobre o procedimento, reações do paciente, cuidados pós-procedimento..."
                          rows={4}
                          {...field}
                        />
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Inclua informações importantes sobre a execução do procedimento
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <button_1.Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </button_1.Button>
                <button_1.Button type="submit">
                  {editingProcedure ? "Atualizar" : "Criar"} Procedimento
                </button_1.Button>
              </div>
            </form>
          </form_1.Form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
