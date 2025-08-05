/**
 * Clinical Notes Management Component
 * FHIR R4 compliant component for clinical documentation and notes
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
exports.ClinicalNotesManagement = ClinicalNotesManagement;
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
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var form_1 = require("@/components/ui/form");
var use_toast_1 = require("@/hooks/use-toast");
var treatment_1 = require("@/lib/types/treatment");
var treatments_1 = require("@/lib/supabase/treatments");
var patients_1 = require("@/lib/supabase/patients");
var noteTypes = [
  { value: "progress", label: "Evolução", color: "bg-blue-100 text-blue-800" },
  { value: "assessment", label: "Avaliação", color: "bg-green-100 text-green-800" },
  { value: "plan", label: "Plano", color: "bg-purple-100 text-purple-800" },
  { value: "consultation", label: "Consulta", color: "bg-orange-100 text-orange-800" },
  { value: "procedure", label: "Procedimento", color: "bg-pink-100 text-pink-800" },
  { value: "follow-up", label: "Acompanhamento", color: "bg-teal-100 text-teal-800" },
  { value: "adverse-event", label: "Evento Adverso", color: "bg-red-100 text-red-800" },
  { value: "education", label: "Orientação", color: "bg-yellow-100 text-yellow-800" },
];
var commonTemplates = [
  {
    title: "Evolução pós-procedimento",
    content:
      "Paciente retorna para avaliação pós-procedimento. Apresenta:\n- Estado geral:\n- Área tratada:\n- Sintomas/reações:\n- Orientações fornecidas:\n- Próximos passos:",
  },
  {
    title: "Avaliação inicial",
    content:
      "Primeira consulta para avaliação estética:\n- Queixa principal:\n- Histórico:\n- Exame físico:\n- Hipótese diagnóstica:\n- Plano proposto:",
  },
  {
    title: "Consulta de retorno",
    content:
      "Retorno para acompanhamento:\n- Evolução desde último atendimento:\n- Satisfação com resultados:\n- Necessidade de ajustes:\n- Planejamento futuro:",
  },
];
function ClinicalNotesManagement(_a) {
  var treatmentPlanId = _a.treatmentPlanId,
    patientId = _a.patientId,
    onSelectNote = _a.onSelectNote;
  var toast = (0, use_toast_1.useToast)().toast;
  // State management
  var _b = (0, react_1.useState)([]),
    notes = _b[0],
    setNotes = _b[1];
  var _c = (0, react_1.useState)([]),
    patients = _c[0],
    setPatients = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(""),
    searchText = _e[0],
    setSearchText = _e[1];
  var _f = (0, react_1.useState)({
      treatment_plan_id: treatmentPlanId,
      patient_id: patientId,
    }),
    filters = _f[0],
    setFilters = _f[1];
  var _g = (0, react_1.useState)(1),
    currentPage = _g[0],
    setCurrentPage = _g[1];
  var _h = (0, react_1.useState)(0),
    totalCount = _h[0],
    setTotalCount = _h[1];
  var _j = (0, react_1.useState)(false),
    isDialogOpen = _j[0],
    setIsDialogOpen = _j[1];
  var _k = (0, react_1.useState)(null),
    editingNote = _k[0],
    setEditingNote = _k[1];
  var perPage = 10;
  // Form setup
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(treatment_1.createClinicalNoteSchema),
    defaultValues: {
      treatment_plan_id: treatmentPlanId || "",
      patient_id: patientId || "",
      title: "",
      content: "",
      note_type: "progress",
      created_date: new Date().toISOString().split("T")[0],
      author_id: "",
      tags: [],
    },
  });
  // Load data on component mount
  (0, react_1.useEffect)(() => {
    loadData();
    loadPatients();
  }, []);
  // Reload notes when filters change
  (0, react_1.useEffect)(() => {
    loadClinicalNotes();
  }, [filters, currentPage, searchText]);
  var loadData = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, loadClinicalNotes()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  var loadClinicalNotes = () =>
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
              (0, treatments_1.searchClinicalNotes)(searchFilters, currentPage, perPage),
            ];
          case 1:
            response = _a.sent();
            setNotes(response.clinical_notes);
            setTotalCount(response.total_count);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao carregar notas clínicas:", error_1);
            toast({
              title: "Erro",
              description: "Não foi possível carregar as notas clínicas.",
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
    setEditingNote(null);
    form.reset({
      treatment_plan_id: treatmentPlanId || "",
      patient_id: patientId || "",
      title: "",
      content: "",
      note_type: "progress",
      created_date: new Date().toISOString().split("T")[0],
      author_id: "",
      tags: [],
    });
    setIsDialogOpen(true);
  };
  var openEditDialog = (note) => {
    setEditingNote(note);
    form.reset({
      treatment_plan_id: note.treatment_plan_id,
      patient_id: note.patient_id,
      title: note.title,
      content: note.content,
      note_type: note.note_type,
      created_date: note.created_date,
      author_id: note.author_id || "",
      tags: note.tags || [],
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
            if (!editingNote) return [3 /*break*/, 2];
            return [4 /*yield*/, (0, treatments_1.updateClinicalNote)(editingNote.id, data)];
          case 1:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Nota clínica atualizada com sucesso.",
            });
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, (0, treatments_1.createClinicalNote)(data)];
          case 3:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Nota clínica criada com sucesso.",
            });
            _a.label = 4;
          case 4:
            setIsDialogOpen(false);
            loadClinicalNotes();
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            console.error("Erro ao salvar nota clínica:", error_3);
            toast({
              title: "Erro",
              description: "Não foi possível salvar a nota clínica.",
              variant: "destructive",
            });
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var handleDeleteNote = (note) =>
    __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, treatments_1.deleteClinicalNote)(note.id)];
          case 1:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Nota clínica excluída com sucesso.",
            });
            loadClinicalNotes();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Erro ao excluir nota clínica:", error_4);
            toast({
              title: "Erro",
              description: "Não foi possível excluir a nota clínica.",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var applyTemplate = (template) => {
    form.setValue("title", template.title);
    form.setValue("content", template.content);
  };
  var formatDate = (dateString) =>
    (0, date_fns_1.format)(new Date(dateString), "dd/MM/yyyy", { locale: locale_1.ptBR });
  var getNoteType = (type) => noteTypes.find((nt) => nt.value === type);
  var totalPages = Math.ceil(totalCount / perPage);
  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas Clínicas</h1>
          <p className="text-muted-foreground">Documentação clínica seguindo padrões HL7 FHIR R4</p>
        </div>

        <button_1.Button onClick={openCreateDialog}>
          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </button_1.Button>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input_1.Input
            placeholder="Buscar notas clínicas..."
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
            value={filters.note_type || "all"}
            onValueChange={(value) =>
              handleFilterChange("note_type", value === "all" ? undefined : value)
            }
          >
            <select_1.SelectTrigger className="w-[150px]">
              <select_1.SelectValue placeholder="Todos os tipos" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
              {noteTypes.map((type) => (
                <select_1.SelectItem key={type.value} value={type.value}>
                  {type.label}
                </select_1.SelectItem>
              ))}
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>{" "}
      {/* Clinical Notes Grid */}
      <div className="grid gap-4">
        {loading
          ? <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          : notes.length === 0
            ? <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <lucide_react_1.FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhuma nota encontrada</h3>
                  <p className="text-muted-foreground">Comece criando uma nova nota clínica.</p>
                </div>
              </div>
            : notes.map((note) => {
                var _a, _b, _c;
                var noteType = getNoteType(note.note_type);
                return (
                  <card_1.Card
                    key={note.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() =>
                      onSelectNote === null || onSelectNote === void 0 ? void 0 : onSelectNote(note)
                    }
                  >
                    <card_1.CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <card_1.CardTitle className="text-lg">{note.title}</card_1.CardTitle>
                            {noteType && (
                              <badge_1.Badge className={noteType.color}>
                                {noteType.label}
                              </badge_1.Badge>
                            )}
                          </div>
                          <card_1.CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <lucide_react_1.User className="h-3 w-3" />
                              {/* @ts-ignore - patient relation from Supabase */}
                              {(_b =
                                (_a = note.patient) === null || _a === void 0
                                  ? void 0
                                  : _a.given_name) === null || _b === void 0
                                ? void 0
                                : _b[0]}{" "}
                              {(_c = note.patient) === null || _c === void 0
                                ? void 0
                                : _c.family_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <lucide_react_1.Calendar className="h-3 w-3" />
                              {formatDate(note.created_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <lucide_react_1.Clock className="h-3 w-3" />
                              {(0, date_fns_1.format)(new Date(note.created_at), "HH:mm", {
                                locale: locale_1.ptBR,
                              })}
                            </span>
                          </card_1.CardDescription>
                        </div>

                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                                onSelectNote === null || onSelectNote === void 0
                                  ? void 0
                                  : onSelectNote(note);
                              }}
                            >
                              <lucide_react_1.FileText className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(note);
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
                                handleDeleteNote(note);
                              }}
                            >
                              <lucide_react_1.Trash className="mr-2 h-4 w-4" />
                              Excluir
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {note.tags.map((tag, index) => (
                            <badge_1.Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </badge_1.Badge>
                          ))}
                        </div>
                      )}
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
      {/* Create/Edit Clinical Note Dialog */}
      <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {editingNote ? "Editar Nota Clínica" : "Nova Nota Clínica"}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Documente observações clínicas seguindo padrões HL7 FHIR R4
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Templates Quick Selection */}
              <div className="space-y-3">
                <label_1.Label>Modelos de Nota</label_1.Label>
                <div className="flex flex-wrap gap-2">
                  {commonTemplates.map((template, index) => (
                    <badge_1.Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => applyTemplate(template)}
                    >
                      <lucide_react_1.Plus className="mr-1 h-3 w-3" />
                      {template.title}
                    </badge_1.Badge>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form_1.FormField
                  control={form.control}
                  name="title"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Título da Nota *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Ex: Evolução pós-procedimento" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="note_type"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Tipo de Nota *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {noteTypes.map((type) => (
                              <select_1.SelectItem key={type.value} value={type.value}>
                                {type.label}
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

              {/* Patient Selection */}
              {!patientId && (
                <form_1.FormField
                  control={form.control}
                  name="patient_id"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Paciente *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {/* Date */}
              <form_1.FormField
                control={form.control}
                name="created_date"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Data *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input type="date" {...field} />
                      </form_1.FormControl>
                      <form_1.FormDescription>Data da observação clínica</form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Content */}
              <form_1.FormField
                control={form.control}
                name="content"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Conteúdo da Nota *</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea_1.Textarea
                          placeholder="Descreva suas observações clínicas..."
                          rows={10}
                          {...field}
                        />
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Inclua observações detalhadas sobre o estado do paciente, evolução,
                        procedimentos realizados, etc.
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Tags */}
              <form_1.FormField
                control={form.control}
                name="tags"
                render={(_a) => {
                  var _b;
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Tags (Opcional)</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          placeholder="Ex: botox, preenchimento, pós-operatório (separadas por vírgula)"
                          value={
                            ((_b = field.value) === null || _b === void 0
                              ? void 0
                              : _b.join(", ")) || ""
                          }
                          onChange={(e) => {
                            var tags = e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter((tag) => tag.length > 0);
                            field.onChange(tags);
                          }}
                        />
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Tags para facilitar a busca e organização das notas
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
                  {editingNote ? "Atualizar" : "Criar"} Nota
                </button_1.Button>
              </div>
            </form>
          </form_1.Form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
