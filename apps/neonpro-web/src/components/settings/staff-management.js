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
exports.default = StaffManagement;
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
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
// CRM validation function for different states
var validateCRM = function (crm, state) {
  var cleanCRM = crm.replace(/[^\d]/g, "");
  // Basic validation - CRM numbers typically have 4-6 digits
  if (cleanCRM.length < 4 || cleanCRM.length > 6) return false;
  // State-specific validation could be added here
  return true;
};
// CPF validation function
var validateCPF = function (cpf) {
  var cleanCPF = cpf.replace(/[^\d]/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  var sum = 0;
  for (var i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  var remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  sum = 0;
  for (var i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};
var professionalTypes = [
  { value: "medico", label: "Médico", requiresCRM: true },
  { value: "enfermeiro", label: "Enfermeiro", requiresCRM: true },
  { value: "esteticista", label: "Esteticista", requiresCRM: false },
  { value: "fisioterapeuta", label: "Fisioterapeuta", requiresCRM: true },
  { value: "nutricionista", label: "Nutricionista", requiresCRM: true },
  { value: "psicologo", label: "Psicólogo", requiresCRM: true },
  { value: "recepcionista", label: "Recepcionista", requiresCRM: false },
  { value: "administrativo", label: "Administrativo", requiresCRM: false },
];
var brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
var staffMemberSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    cpf: z.string().refine(validateCPF, "CPF inválido"),
    professionalType: z.string().min(1, "Tipo profissional é obrigatório"),
    crm: z.string().optional(),
    crmState: z.string().optional(),
    specialty: z.string().optional(),
    active: z.boolean().default(true),
    canPerformProcedures: z.boolean().default(false),
    canAccessFinancial: z.boolean().default(false),
    canManageSchedule: z.boolean().default(false),
    isAdmin: z.boolean().default(false),
  })
  .superRefine(function (data, ctx) {
    var professionalType = professionalTypes.find(function (pt) {
      return pt.value === data.professionalType;
    });
    if (
      professionalType === null || professionalType === void 0
        ? void 0
        : professionalType.requiresCRM
    ) {
      if (!data.crm || data.crm.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM é obrigatório para este tipo profissional",
          path: ["crm"],
        });
      } else if (!validateCRM(data.crm, data.crmState || "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM inválido",
          path: ["crm"],
        });
      }
      if (!data.crmState || data.crmState.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Estado do CRM é obrigatório",
          path: ["crmState"],
        });
      }
    }
  });
function StaffManagement() {
  var _this = this;
  var _a;
  var _b = (0, react_1.useState)([]),
    staffMembers = _b[0],
    setStaffMembers = _b[1];
  var _c = (0, react_1.useState)(false),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var _d = (0, react_1.useState)(false),
    isDialogOpen = _d[0],
    setIsDialogOpen = _d[1];
  var _e = (0, react_1.useState)(null),
    editingMember = _e[0],
    setEditingMember = _e[1];
  var _f = (0, react_1.useState)(""),
    searchTerm = _f[0],
    setSearchTerm = _f[1];
  var _g = (0, react_1.useState)("all"),
    filterType = _g[0],
    setFilterType = _g[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(staffMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      professionalType: "",
      crm: "",
      crmState: "",
      specialty: "",
      active: true,
      canPerformProcedures: false,
      canAccessFinancial: false,
      canManageSchedule: false,
      isAdmin: false,
    },
  });
  var watchedProfessionalType = form.watch("professionalType");
  var requiresCRM =
    ((_a = professionalTypes.find(function (pt) {
      return pt.value === watchedProfessionalType;
    })) === null || _a === void 0
      ? void 0
      : _a.requiresCRM) || false;
  // Format CPF input
  var formatCPF = function (value) {
    var cleaned = value.replace(/[^\d]/g, "");
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  // Load staff members
  (0, react_1.useEffect)(function () {
    var loadStaffMembers = function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          setIsLoading(true);
          try {
            // TODO: Replace with actual API call
            // const response = await fetch("/api/settings/staff");
            // const data = await response.json();
            // setStaffMembers(data);
            // Mock data for demonstration
            setStaffMembers([
              {
                id: "1",
                name: "Dr. João Silva",
                email: "joao@clinica.com.br",
                phone: "(11) 99999-9999",
                cpf: "123.456.789-00",
                professionalType: "medico",
                crm: "123456",
                crmState: "SP",
                specialty: "Dermatologia",
                active: true,
                canPerformProcedures: true,
                canAccessFinancial: false,
                canManageSchedule: true,
                isAdmin: false,
                createdAt: new Date(),
                lastLogin: new Date(),
              },
            ]);
          } catch (error) {
            console.error("Erro ao carregar equipe:", error);
            sonner_1.toast.error("Erro ao carregar equipe médica");
          } finally {
            setIsLoading(false);
          }
          return [2 /*return*/];
        });
      });
    };
    loadStaffMembers();
  }, []);
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var updatedMember_1, newMember_1;
      return __generator(this, function (_a) {
        try {
          if (editingMember) {
            updatedMember_1 = __assign(__assign({}, editingMember), data);
            setStaffMembers(function (prev) {
              return prev.map(function (member) {
                return member.id === editingMember.id ? updatedMember_1 : member;
              });
            });
            sonner_1.toast.success("Profissional atualizado com sucesso!");
          } else {
            newMember_1 = __assign(__assign({}, data), {
              id: Date.now().toString(),
              createdAt: new Date(),
            });
            setStaffMembers(function (prev) {
              return __spreadArray(__spreadArray([], prev, true), [newMember_1], false);
            });
            sonner_1.toast.success("Profissional adicionado com sucesso!");
          }
          setIsDialogOpen(false);
          setEditingMember(null);
          form.reset();
        } catch (error) {
          console.error("Erro ao salvar profissional:", error);
          sonner_1.toast.error("Erro ao salvar profissional");
        }
        return [2 /*return*/];
      });
    });
  };
  var handleEdit = function (member) {
    setEditingMember(member);
    form.reset(member);
    setIsDialogOpen(true);
  };
  var handleDelete = function (memberId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (confirm("Tem certeza que deseja remover este profissional?")) {
          try {
            setStaffMembers(function (prev) {
              return prev.filter(function (member) {
                return member.id !== memberId;
              });
            });
            sonner_1.toast.success("Profissional removido com sucesso!");
          } catch (error) {
            console.error("Erro ao remover profissional:", error);
            sonner_1.toast.error("Erro ao remover profissional");
          }
        }
        return [2 /*return*/];
      });
    });
  };
  var handleToggleActive = function (memberId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          setStaffMembers(function (prev) {
            return prev.map(function (member) {
              return member.id === memberId
                ? __assign(__assign({}, member), { active: !member.active })
                : member;
            });
          });
          sonner_1.toast.success("Status atualizado com sucesso!");
        } catch (error) {
          console.error("Erro ao atualizar status:", error);
          sonner_1.toast.error("Erro ao atualizar status");
        }
        return [2 /*return*/];
      });
    });
  };
  var filteredMembers = staffMembers.filter(function (member) {
    var matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.crm && member.crm.includes(searchTerm));
    var matchesFilter = filterType === "all" || member.professionalType === filterType;
    return matchesSearch && matchesFilter;
  });
  var exportStaffData = function () {
    var csvContent =
      "data:text/csv;charset=utf-8," +
      "Nome,Email,Telefone,Tipo,CRM,Estado CRM,Especialidade,Ativo\n" +
      staffMembers
        .map(function (member) {
          var _a;
          return [
            member.name,
            member.email,
            member.phone,
            ((_a = professionalTypes.find(function (pt) {
              return pt.value === member.professionalType;
            })) === null || _a === void 0
              ? void 0
              : _a.label) || member.professionalType,
            member.crm || "",
            member.crmState || "",
            member.specialty || "",
            member.active ? "Sim" : "Não",
          ].join(",");
        })
        .join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "equipe_medica.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="space-y-6">
      {/* CFM Compliance Alert */}
      <alert_1.Alert>
        <lucide_react_1.Shield className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Conformidade CFM:</strong> Todos os profissionais da saúde devem ter registro
          válido no conselho profissional. O sistema valida automaticamente os números de CRM.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Equipe Médica ({staffMembers.length})
          </h2>
          <p className="text-gray-600">Gerenciar profissionais e permissões de acesso</p>
        </div>

        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm" onClick={exportStaffData}>
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button
                onClick={function () {
                  setEditingMember(null);
                  form.reset();
                }}
              >
                <lucide_react_1.UserPlus className="h-4 w-4 mr-2" />
                Adicionar Profissional
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>
                  {editingMember ? "Editar Profissional" : "Adicionar Profissional"}
                </dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Preencha as informações do profissional. Campos com * são obrigatórios.
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <form_1.Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="name"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Nome Completo *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="Dr. João Silva" {...field} />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                    <form_1.FormField
                      control={form.control}
                      name="email"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Email *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="email"
                                placeholder="joao@clinica.com.br"
                                {...field}
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="phone"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Telefone *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="(11) 99999-9999" {...field} />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                    <form_1.FormField
                      control={form.control}
                      name="cpf"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>CPF *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="000.000.000-00"
                                {...field}
                                onChange={function (e) {
                                  var formatted = formatCPF(e.target.value);
                                  field.onChange(formatted);
                                }}
                                maxLength={14}
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Professional Information */}
                  <form_1.FormField
                    control={form.control}
                    name="professionalType"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Tipo Profissional *</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Selecione o tipo profissional" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              {professionalTypes.map(function (type) {
                                return (
                                  <select_1.SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      {type.label}
                                      {type.requiresCRM && (
                                        <badge_1.Badge variant="secondary" className="text-xs">
                                          CRM
                                        </badge_1.Badge>
                                      )}
                                    </div>
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

                  {requiresCRM && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="crm"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Número do CRM *</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="123456" {...field} />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Conselho Regional de Medicina
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="crmState"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Estado do CRM *</form_1.FormLabel>
                              <select_1.Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <form_1.FormControl>
                                  <select_1.SelectTrigger>
                                    <select_1.SelectValue placeholder="Estado" />
                                  </select_1.SelectTrigger>
                                </form_1.FormControl>
                                <select_1.SelectContent>
                                  {brazilianStates.map(function (state) {
                                    return (
                                      <select_1.SelectItem key={state} value={state}>
                                        {state}
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
                    </div>
                  )}

                  <form_1.FormField
                    control={form.control}
                    name="specialty"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Especialidade</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Dermatologia, Estética, etc." {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  {/* Permissions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Permissões de Acesso</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="canPerformProcedures"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <form_1.FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300"
                                />
                              </form_1.FormControl>
                              <div className="space-y-1 leading-none">
                                <form_1.FormLabel>Realizar Procedimentos</form_1.FormLabel>
                                <form_1.FormDescription>
                                  Pode executar tratamentos e procedimentos
                                </form_1.FormDescription>
                              </div>
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="canManageSchedule"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <form_1.FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300"
                                />
                              </form_1.FormControl>
                              <div className="space-y-1 leading-none">
                                <form_1.FormLabel>Gerenciar Agenda</form_1.FormLabel>
                                <form_1.FormDescription>
                                  Pode criar e modificar agendamentos
                                </form_1.FormDescription>
                              </div>
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="canAccessFinancial"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <form_1.FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300"
                                />
                              </form_1.FormControl>
                              <div className="space-y-1 leading-none">
                                <form_1.FormLabel>Acesso Financeiro</form_1.FormLabel>
                                <form_1.FormDescription>
                                  Pode visualizar informações financeiras
                                </form_1.FormDescription>
                              </div>
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="isAdmin"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <form_1.FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300"
                                />
                              </form_1.FormControl>
                              <div className="space-y-1 leading-none">
                                <form_1.FormLabel>Administrador</form_1.FormLabel>
                                <form_1.FormDescription>
                                  Acesso completo ao sistema
                                </form_1.FormDescription>
                              </div>
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button_1.Button
                      type="button"
                      variant="outline"
                      onClick={function () {
                        setIsDialogOpen(false);
                        setEditingMember(null);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </button_1.Button>
                    <button_1.Button type="submit">
                      {editingMember ? "Atualizar" : "Adicionar"} Profissional
                    </button_1.Button>
                  </div>
                </form>
              </form_1.Form>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input_1.Input
                  placeholder="Buscar por nome, email ou CRM..."
                  value={searchTerm}
                  onChange={function (e) {
                    return setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select_1.Select value={filterType} onValueChange={setFilterType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Filtrar por tipo" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                  {professionalTypes.map(function (type) {
                    return (
                      <select_1.SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Staff Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Profissionais Cadastrados</card_1.CardTitle>
          <card_1.CardDescription>
            Lista completa da equipe médica e administrativa
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {isLoading
            ? <div className="flex items-center justify-center p-8">
                <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
              </div>
            : filteredMembers.length === 0
              ? <div className="text-center p-8">
                  <lucide_react_1.Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterType !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Adicione o primeiro profissional à equipe"}
                  </p>
                </div>
              : <div className="overflow-x-auto">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Nome</table_1.TableHead>
                        <table_1.TableHead>Tipo</table_1.TableHead>
                        <table_1.TableHead>CRM</table_1.TableHead>
                        <table_1.TableHead>Especialidade</table_1.TableHead>
                        <table_1.TableHead>Permissões</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead>Ações</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {filteredMembers.map(function (member) {
                        var professionalType = professionalTypes.find(function (pt) {
                          return pt.value === member.professionalType;
                        });
                        var permissions = [
                          member.canPerformProcedures && "Procedimentos",
                          member.canManageSchedule && "Agenda",
                          member.canAccessFinancial && "Financeiro",
                          member.isAdmin && "Admin",
                        ].filter(Boolean);
                        return (
                          <table_1.TableRow key={member.id}>
                            <table_1.TableCell>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-600">{member.email}</div>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center gap-2">
                                {professionalType === null || professionalType === void 0
                                  ? void 0
                                  : professionalType.label}
                                {(professionalType === null || professionalType === void 0
                                  ? void 0
                                  : professionalType.requiresCRM) && (
                                  <badge_1.Badge variant="secondary" className="text-xs">
                                    CRM
                                  </badge_1.Badge>
                                )}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {member.crm
                                ? "".concat(member.crm, "/").concat(member.crmState)
                                : "-"}
                            </table_1.TableCell>
                            <table_1.TableCell>{member.specialty || "-"}</table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex flex-wrap gap-1">
                                {permissions.map(function (permission) {
                                  return (
                                    <badge_1.Badge
                                      key={permission}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {permission}
                                    </badge_1.Badge>
                                  );
                                })}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <button
                                onClick={function () {
                                  return handleToggleActive(member.id);
                                }}
                                className="flex items-center gap-1"
                              >
                                {member.active
                                  ? <>
                                      <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600" />
                                      <span className="text-green-600">Ativo</span>
                                    </>
                                  : <>
                                      <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600" />
                                      <span className="text-red-600">Inativo</span>
                                    </>}
                              </button>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center gap-1">
                                <button_1.Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={function () {
                                    return handleEdit(member);
                                  }}
                                >
                                  <lucide_react_1.Edit className="h-4 w-4" />
                                </button_1.Button>
                                <button_1.Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={function () {
                                    return handleDelete(member.id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <lucide_react_1.Trash2 className="h-4 w-4" />
                                </button_1.Button>
                              </div>
                            </table_1.TableCell>
                          </table_1.TableRow>
                        );
                      })}
                    </table_1.TableBody>
                  </table_1.Table>
                </div>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
