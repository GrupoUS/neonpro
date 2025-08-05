/**
 * Treatment Plan Form Component
 * FHIR R4 compliant form for creating and editing treatment plans
 * Includes LGPD compliance and Brazilian healthcare validation
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
exports.TreatmentPlanForm = TreatmentPlanForm;
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
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var form_1 = require("@/components/ui/form");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var use_toast_1 = require("@/hooks/use-toast");
var treatment_1 = require("@/lib/types/treatment");
var treatments_1 = require("@/lib/supabase/treatments");
var patients_1 = require("@/lib/supabase/patients");
var utils_1 = require("@/lib/utils");
var statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativo" },
  { value: "on-hold", label: "Em Pausa" },
  { value: "completed", label: "Concluído" },
  { value: "revoked", label: "Cancelado" },
];
var intentOptions = [
  { value: "proposal", label: "Proposta" },
  { value: "plan", label: "Plano" },
  { value: "order", label: "Ordem" },
  { value: "directive", label: "Diretiva" },
];
var commonActivities = [
  "Consulta inicial",
  "Avaliação estética",
  "Procedimento de limpeza de pele",
  "Aplicação de botox",
  "Preenchimento facial",
  "Peeling químico",
  "Tratamento a laser",
  "Massagem relaxante",
  "Drenagem linfática",
  "Consulta de retorno",
  "Avaliação de resultados",
];
function TreatmentPlanForm(_a) {
  var _b;
  var treatmentPlan = _a.treatmentPlan,
    initialPatientId = _a.patientId,
    onSuccess = _a.onSuccess,
    onCancel = _a.onCancel;
  var toast = (0, use_toast_1.useToast)().toast;
  var _c = (0, react_1.useState)(false),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)([]),
    patients = _d[0],
    setPatients = _d[1];
  var _e = (0, react_1.useState)(
      (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.activities) ||
        [],
    ),
    activities = _e[0],
    setActivities = _e[1];
  // Form setup
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(treatment_1.createTreatmentPlanSchema),
    defaultValues: {
      patient_id:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.patient_id) ||
        initialPatientId ||
        "",
      title:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.title) || "",
      description:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.description) ||
        "",
      status:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.status) ||
        "draft",
      intent:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.intent) ||
        "plan",
      period_start:
        (treatmentPlan === null || treatmentPlan === void 0
          ? void 0
          : treatmentPlan.period_start) || "",
      period_end:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.period_end) ||
        "",
      goals:
        (treatmentPlan === null || treatmentPlan === void 0 ? void 0 : treatmentPlan.goals) || [],
    },
  });
  // Load patients on mount
  (0, react_1.useEffect)(() => {
    loadPatients();
  }, []);
  var loadPatients = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_1;
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
            error_1 = _a.sent();
            console.error("Erro ao carregar pacientes:", error_1);
            toast({
              title: "Erro",
              description: "Não foi possível carregar a lista de pacientes.",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var treatmentPlanData, result, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoading(true);
            treatmentPlanData = __assign(__assign({}, data), { activities: activities });
            result = void 0;
            if (!treatmentPlan) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              (0, treatments_1.updateTreatmentPlan)(treatmentPlan.id, treatmentPlanData),
            ];
          case 1:
            result = _a.sent();
            toast({
              title: "Sucesso",
              description: "Plano de tratamento atualizado com sucesso.",
            });
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, (0, treatments_1.createTreatmentPlan)(treatmentPlanData)];
          case 3:
            result = _a.sent();
            toast({
              title: "Sucesso",
              description: "Plano de tratamento criado com sucesso.",
            });
            _a.label = 4;
          case 4:
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(result);
            return [3 /*break*/, 7];
          case 5:
            error_2 = _a.sent();
            console.error("Erro ao salvar plano de tratamento:", error_2);
            toast({
              title: "Erro",
              description: "Não foi possível salvar o plano de tratamento.",
              variant: "destructive",
            });
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  var addActivity = (activityName) => {
    var newActivity = {
      id: crypto.randomUUID(),
      title: activityName,
      description: "",
      status: "not-started",
      scheduled_date: "",
    };
    setActivities((prev) => __spreadArray(__spreadArray([], prev, true), [newActivity], false));
  };
  var updateActivity = (id, updates) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? __assign(__assign({}, activity), updates) : activity,
      ),
    );
  };
  var removeActivity = (id) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };
  var addGoal = () => {
    var currentGoals = form.getValues("goals");
    form.setValue("goals", __spreadArray(__spreadArray([], currentGoals, true), [""], false));
  };
  var updateGoal = (index, value) => {
    var currentGoals = form.getValues("goals");
    var newGoals = __spreadArray([], currentGoals, true);
    newGoals[index] = value;
    form.setValue("goals", newGoals);
  };
  var removeGoal = (index) => {
    var currentGoals = form.getValues("goals");
    form.setValue(
      "goals",
      currentGoals.filter((_, i) => i !== index),
    );
  };
  var selectedPatient = patients.find((p) => p.id === form.watch("patient_id"));
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {treatmentPlan ? "Editar Plano de Tratamento" : "Novo Plano de Tratamento"}
          </h2>
          <p className="text-muted-foreground">
            Crie um plano de tratamento seguindo padrões HL7 FHIR R4
          </p>
        </div>

        {onCancel && (
          <button_1.Button variant="outline" onClick={onCancel}>
            <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </button_1.Button>
        )}
      </div>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Paciente</card_1.CardTitle>
              <card_1.CardDescription>
                Selecione o paciente para este plano de tratamento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
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
                        disabled={!!initialPatientId}
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
                                {patient.email && (
                                  <span className="text-muted-foreground ml-2">
                                    ({patient.email})
                                  </span>
                                )}
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

              {selectedPatient && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">Paciente Selecionado</h4>
                  <p className="text-sm text-muted-foreground">
                    {(_b = selectedPatient.given_name) === null || _b === void 0 ? void 0 : _b[0]}{" "}
                    {selectedPatient.family_name}
                  </p>
                  {selectedPatient.email && (
                    <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                  )}
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
          {/* Basic Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Informações Básicas</card_1.CardTitle>
              <card_1.CardDescription>
                Defina o título, descrição e configurações do plano
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="title"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Título *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          placeholder="Ex: Tratamento estético facial completo"
                          {...field}
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="description"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Descrição</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea_1.Textarea
                          placeholder="Descreva detalhadamente o plano de tratamento..."
                          rows={4}
                          {...field}
                        />
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Inclua objetivos, métodos e expectativas do tratamento
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                <form_1.FormField
                  control={form.control}
                  name="intent"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Intenção *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {intentOptions.map((option) => (
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
            </card_1.CardContent>
          </card_1.Card>{" "}
          {/* Period/Schedule */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Período de Tratamento</card_1.CardTitle>
              <card_1.CardDescription>
                Defina o período de duração do tratamento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form_1.FormField
                  control={form.control}
                  name="period_start"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data de Início</form_1.FormLabel>
                        <popover_1.Popover>
                          <popover_1.PopoverTrigger asChild>
                            <form_1.FormControl>
                              <button_1.Button
                                variant="outline"
                                className={(0, utils_1.cn)(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? (0, date_fns_1.format)(new Date(field.value), "dd/MM/yyyy", {
                                      locale: locale_1.ptBR,
                                    })
                                  : <span>Selecione uma data</span>}
                                <lucide_react_1.CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </button_1.Button>
                            </form_1.FormControl>
                          </popover_1.PopoverTrigger>
                          <popover_1.PopoverContent className="w-auto p-0" align="start">
                            <calendar_1.Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(
                                  date === null || date === void 0
                                    ? void 0
                                    : date.toISOString().split("T")[0],
                                )
                              }
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </popover_1.PopoverContent>
                        </popover_1.Popover>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="period_end"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data de Término (Opcional)</form_1.FormLabel>
                        <popover_1.Popover>
                          <popover_1.PopoverTrigger asChild>
                            <form_1.FormControl>
                              <button_1.Button
                                variant="outline"
                                className={(0, utils_1.cn)(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? (0, date_fns_1.format)(new Date(field.value), "dd/MM/yyyy", {
                                      locale: locale_1.ptBR,
                                    })
                                  : <span>Selecione uma data</span>}
                                <lucide_react_1.CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </button_1.Button>
                            </form_1.FormControl>
                          </popover_1.PopoverTrigger>
                          <popover_1.PopoverContent className="w-auto p-0" align="start">
                            <calendar_1.Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(
                                  date === null || date === void 0
                                    ? void 0
                                    : date.toISOString().split("T")[0],
                                )
                              }
                              disabled={(date) => {
                                var startDate = form.getValues("period_start");
                                return startDate ? date < new Date(startDate) : date < new Date();
                              }}
                              initialFocus
                            />
                          </popover_1.PopoverContent>
                        </popover_1.Popover>
                        <form_1.FormDescription>
                          Deixe em branco para tratamento de duração indefinida
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>
            </card_1.CardContent>
          </card_1.Card>
          {/* Treatment Goals */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Objetivos do Tratamento</card_1.CardTitle>
              <card_1.CardDescription>
                Defina os objetivos e metas específicas deste tratamento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {form.watch("goals").map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input_1.Input
                      placeholder="Ex: Reduzir rugas de expressão na região frontal"
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                    />
                  </div>
                  <button_1.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGoal(index)}
                  >
                    <lucide_react_1.X className="h-4 w-4" />
                  </button_1.Button>
                </div>
              ))}

              <button_1.Button type="button" variant="outline" onClick={addGoal} className="w-full">
                <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                Adicionar Objetivo
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
          {/* Activities Management */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Atividades do Tratamento</card_1.CardTitle>
              <card_1.CardDescription>
                Adicione e configure as atividades que fazem parte deste plano
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {/* Quick Add Common Activities */}
              <div>
                <label_1.Label className="text-sm font-medium">Atividades Comuns</label_1.Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {commonActivities.map((activity) => (
                    <badge_1.Badge
                      key={activity}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => addActivity(activity)}
                    >
                      <lucide_react_1.Plus className="mr-1 h-3 w-3" />
                      {activity}
                    </badge_1.Badge>
                  ))}
                </div>
              </div>

              <separator_1.Separator />

              {/* Current Activities */}
              {activities.length > 0 && (
                <div className="space-y-4">
                  <label_1.Label className="text-sm font-medium">
                    Atividades Adicionadas
                  </label_1.Label>
                  {activities.map((activity, index) => (
                    <card_1.Card key={activity.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <input_1.Input
                            placeholder="Nome da atividade"
                            value={activity.title}
                            onChange={(e) => updateActivity(activity.id, { title: e.target.value })}
                            className="font-medium"
                          />
                          <button_1.Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeActivity(activity.id)}
                          >
                            <lucide_react_1.X className="h-4 w-4" />
                          </button_1.Button>
                        </div>

                        <textarea_1.Textarea
                          placeholder="Descrição da atividade (opcional)"
                          value={activity.description}
                          onChange={(e) =>
                            updateActivity(activity.id, { description: e.target.value })
                          }
                          rows={2}
                        />

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label_1.Label className="text-sm">Status</label_1.Label>
                            <select_1.Select
                              value={activity.status}
                              onValueChange={(value) =>
                                updateActivity(activity.id, { status: value })
                              }
                            >
                              <select_1.SelectTrigger>
                                <select_1.SelectValue />
                              </select_1.SelectTrigger>
                              <select_1.SelectContent>
                                <select_1.SelectItem value="not-started">
                                  Não iniciado
                                </select_1.SelectItem>
                                <select_1.SelectItem value="in-progress">
                                  Em andamento
                                </select_1.SelectItem>
                                <select_1.SelectItem value="on-hold">Em pausa</select_1.SelectItem>
                                <select_1.SelectItem value="completed">
                                  Concluído
                                </select_1.SelectItem>
                                <select_1.SelectItem value="cancelled">
                                  Cancelado
                                </select_1.SelectItem>
                              </select_1.SelectContent>
                            </select_1.Select>
                          </div>

                          <div>
                            <label_1.Label className="text-sm">
                              Data Agendada (Opcional)
                            </label_1.Label>
                            <input_1.Input
                              type="date"
                              value={activity.scheduled_date}
                              onChange={(e) =>
                                updateActivity(activity.id, {
                                  scheduled_date: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </card_1.Card>
                  ))}
                </div>
              )}

              {/* Add Custom Activity */}
              <button_1.Button
                type="button"
                variant="outline"
                onClick={() => addActivity("Nova atividade")}
                className="w-full"
              >
                <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                Adicionar Atividade Personalizada
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <button_1.Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </button_1.Button>
            )}
            <button_1.Button type="submit" disabled={loading}>
              {loading
                ? <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Salvando...
                  </>
                : <>
                    <lucide_react_1.Save className="mr-2 h-4 w-4" />
                    {treatmentPlan ? "Atualizar" : "Criar"} Plano
                  </>}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>
  );
}
