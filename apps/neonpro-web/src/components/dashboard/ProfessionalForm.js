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
exports.default = ProfessionalForm;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var form_1 = require("@/components/ui/form");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var professional_1 = require("@/lib/validations/professional");
var professionals_1 = require("@/lib/supabase/professionals");
var employmentStatusOptions = [
  { value: "full_time", label: "Tempo Integral" },
  { value: "part_time", label: "Meio Período" },
  { value: "contractor", label: "Contratado" },
  { value: "locum_tenens", label: "Substituto" },
  { value: "retired", label: "Aposentado" },
];
var professionalStatusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "suspended", label: "Suspenso" },
  { value: "pending_verification", label: "Pendente Verificação" },
];
var credentialTypeOptions = [
  { value: "license", label: "Licença Profissional" },
  { value: "certification", label: "Certificação" },
  { value: "board_certification", label: "Certificação do Conselho" },
  { value: "fellowship", label: "Fellowship" },
  { value: "residency", label: "Residência" },
  { value: "degree", label: "Diploma" },
  { value: "cme", label: "Educação Médica Continuada" },
  { value: "training", label: "Treinamento" },
];
var serviceTypeOptions = [
  { value: "consultation", label: "Consulta" },
  { value: "procedure", label: "Procedimento" },
  { value: "surgery", label: "Cirurgia" },
  { value: "diagnostic", label: "Diagnóstico" },
  { value: "therapy", label: "Terapia" },
  { value: "emergency", label: "Emergência" },
  { value: "telemedicine", label: "Telemedicina" },
  { value: "administrative", label: "Administrativo" },
];
function ProfessionalForm(_a) {
  var _this = this;
  var professionalId = _a.professionalId,
    _b = _a.mode,
    mode = _b === void 0 ? "create" : _b;
  var router = (0, navigation_1.useRouter)();
  var _c = (0, react_1.useState)(false),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    professional = _d[0],
    setProfessional = _d[1];
  var _e = (0, react_1.useState)([]),
    credentials = _e[0],
    setCredentials = _e[1];
  var _f = (0, react_1.useState)([]),
    services = _f[0],
    setServices = _f[1];
  var _g = (0, react_1.useState)([]),
    specialties = _g[0],
    setSpecialties = _g[1];
  var _h = (0, react_1.useState)([]),
    selectedSpecialties = _h[0],
    setSelectedSpecialties = _h[1];
  var _j = (0, react_1.useState)(false),
    showCredentialDialog = _j[0],
    setShowCredentialDialog = _j[1];
  var _k = (0, react_1.useState)(false),
    showServiceDialog = _k[0],
    setShowServiceDialog = _k[1];
  var _l = (0, react_1.useState)(null),
    profilePhoto = _l[0],
    setProfilePhoto = _l[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(
      mode === "create"
        ? professional_1.ProfessionalCreateSchema
        : professional_1.ProfessionalUpdateSchema,
    ),
    defaultValues: {
      given_name: "",
      family_name: "",
      email: "",
      phone_number: "",
      birth_date: "",
      license_number: "",
      qualification: "",
      employment_status: "full_time",
      status: "pending_verification",
      bio: "",
      address: {
        line: "",
        city: "",
        state: "",
        postal_code: "",
        country: "BR",
      },
    },
  });
  var credentialForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(
      professional_1.CredentialCreateSchema.omit({ professional_id: true }),
    ),
    defaultValues: {
      credential_type: "",
      credential_number: "",
      issuing_authority: "",
      issue_date: "",
      expiry_date: "",
      description: "",
    },
  });
  var serviceForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(
      professional_1.ServiceCreateSchema.omit({ professional_id: true }),
    ),
    defaultValues: {
      service_name: "",
      service_type: "",
      description: "",
      duration_minutes: 60,
      base_price: 0,
      requires_certification: false,
    },
  });
  (0, react_1.useEffect)(
    function () {
      loadSpecialties();
      if (mode === "edit" && professionalId) {
        loadProfessional();
      }
    },
    [mode, professionalId],
  );
  var loadSpecialties = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, professionals_1.getSpecialties)()];
          case 1:
            data = _a.sent();
            setSpecialties(data);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error loading specialties:", error_1);
            sonner_1.toast.error("Erro ao carregar especialidades");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadProfessional = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!professionalId) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, (0, professionals_1.getProfessional)(professionalId)];
          case 2:
            data = _a.sent();
            setProfessional(data);
            // Populate form with professional data
            form.reset({
              given_name: data.given_name,
              family_name: data.family_name,
              email: data.email || "",
              phone_number: data.phone_number || "",
              birth_date: data.birth_date || "",
              license_number: data.license_number || "",
              qualification: data.qualification || "",
              employment_status: data.employment_status,
              status: data.status,
              bio: data.bio || "",
              address: data.address || {
                line: "",
                city: "",
                state: "",
                postal_code: "",
                country: "BR",
              },
            });
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Error loading professional:", error_2);
            sonner_1.toast.error("Erro ao carregar dados do profissional");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var newProfessional, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoading(true);
            if (!(mode === "create")) return [3 /*break*/, 2];
            return [4 /*yield*/, (0, professionals_1.createProfessional)(data)];
          case 1:
            newProfessional = _a.sent();
            sonner_1.toast.success("Profissional cadastrado com sucesso!");
            router.push("/dashboard/professionals/".concat(newProfessional.id));
            return [3 /*break*/, 4];
          case 2:
            if (!(mode === "edit" && professionalId)) return [3 /*break*/, 4];
            return [4 /*yield*/, (0, professionals_1.updateProfessional)(professionalId, data)];
          case 3:
            _a.sent();
            sonner_1.toast.success("Profissional atualizado com sucesso!");
            router.push("/dashboard/professionals");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_3 = _a.sent();
            console.error("Error saving professional:", error_3);
            sonner_1.toast.error("Erro ao salvar profissional");
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleAddCredential = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var credentialData, newCredential_1, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!professionalId && mode === "edit") {
              sonner_1.toast.error("Salve o profissional primeiro antes de adicionar credenciais");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            credentialData = __assign(__assign({}, data), { professional_id: professionalId });
            return [4 /*yield*/, (0, professionals_1.createCredential)(credentialData)];
          case 2:
            newCredential_1 = _a.sent();
            setCredentials(function (prev) {
              return __spreadArray(__spreadArray([], prev, true), [newCredential_1], false);
            });
            credentialForm.reset();
            setShowCredentialDialog(false);
            sonner_1.toast.success("Credencial adicionada com sucesso!");
            return [3 /*break*/, 5];
          case 3:
            error_4 = _a.sent();
            console.error("Error adding credential:", error_4);
            sonner_1.toast.error("Erro ao adicionar credencial");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleAddService = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var serviceData, newService_1, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!professionalId && mode === "edit") {
              sonner_1.toast.error("Salve o profissional primeiro antes de adicionar serviços");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            serviceData = __assign(__assign({}, data), { professional_id: professionalId });
            return [4 /*yield*/, (0, professionals_1.createService)(serviceData)];
          case 2:
            newService_1 = _a.sent();
            setServices(function (prev) {
              return __spreadArray(__spreadArray([], prev, true), [newService_1], false);
            });
            serviceForm.reset();
            setShowServiceDialog(false);
            sonner_1.toast.success("Serviço adicionado com sucesso!");
            return [3 /*break*/, 5];
          case 3:
            error_5 = _a.sent();
            console.error("Error adding service:", error_5);
            sonner_1.toast.error("Erro ao adicionar serviço");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handlePhotoUpload = function (event) {
    var _a;
    var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
      setProfilePhoto(file);
      sonner_1.toast.success("Foto selecionada com sucesso!");
    }
  };
  var handleSpecialtyToggle = function (specialtyId) {
    setSelectedSpecialties(function (prev) {
      return prev.includes(specialtyId)
        ? prev.filter(function (id) {
            return id !== specialtyId;
          })
        : __spreadArray(__spreadArray([], prev, true), [specialtyId], false);
    });
  };
  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "Cadastrar Profissional" : "Editar Profissional"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Cadastre um novo profissional no sistema"
              : "Edite as informações do profissional"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button_1.Button
            variant="outline"
            onClick={function () {
              return router.back();
            }}
          >
            <lucide_react_1.X className="mr-2 h-4 w-4" />
            Cancelar
          </button_1.Button>
          <button_1.Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            <lucide_react_1.Save className="mr-2 h-4 w-4" />
            {loading ? "Salvando..." : "Salvar"}
          </button_1.Button>
        </div>
      </div>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <tabs_1.Tabs defaultValue="personal" className="w-full">
            <tabs_1.TabsList className="grid w-full grid-cols-5">
              <tabs_1.TabsTrigger value="personal">Pessoal</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="professional">Profissional</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="specialties">Especialidades</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="credentials">Credenciais</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="services">Serviços</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Personal Information Tab */}
            <tabs_1.TabsContent value="personal">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.User className="h-5 w-5" />
                    Informações Pessoais
                  </card_1.CardTitle>
                  <card_1.CardDescription>Dados pessoais do profissional</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  {/* Profile Photo */}
                  <div className="space-y-2">
                    <label_1.Label>Foto de Perfil</label_1.Label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        {profilePhoto
                          ? <img
                              src={URL.createObjectURL(profilePhoto)}
                              alt="Profile"
                              className="h-24 w-24 rounded-full object-cover"
                            />
                          : <lucide_react_1.User className="h-12 w-12 text-muted-foreground" />}
                      </div>
                      <div>
                        <input_1.Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label_1.Label htmlFor="photo" className="cursor-pointer">
                          <button_1.Button type="button" variant="outline" asChild>
                            <span>
                              <lucide_react_1.Upload className="mr-2 h-4 w-4" />
                              Selecionar Foto
                            </span>
                          </button_1.Button>
                        </label_1.Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form_1.FormField
                      control={form.control}
                      name="given_name"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Nome *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="Nome do profissional" {...field} />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="family_name"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Sobrenome *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="Sobrenome do profissional" {...field} />
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
                                placeholder="email@exemplo.com"
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
                      name="phone_number"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Telefone</form_1.FormLabel>
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
                      name="birth_date"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Data de Nascimento</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="date" {...field} />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <lucide_react_1.MapPin className="h-4 w-4" />
                      Endereço
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="address.line"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Endereço</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="Rua, número, complemento" {...field} />
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="address.city"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Cidade</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="Cidade" {...field} />
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="address.state"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Estado</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="Estado" {...field} />
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="address.postal_code"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>CEP</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="00000-000" {...field} />
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <form_1.FormField
                    control={form.control}
                    name="bio"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Biografia</form_1.FormLabel>
                          <form_1.FormControl>
                            <textarea_1.Textarea
                              placeholder="Descrição sobre o profissional, experiência, especialidades..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Informações que serão exibidas no perfil público do profissional
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Professional Information Tab */}
            <tabs_1.TabsContent value="professional">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Briefcase className="h-5 w-5" />
                    Informações Profissionais
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Dados relacionados à atividade profissional
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form_1.FormField
                      control={form.control}
                      name="license_number"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Número da Licença</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="CRM, CRO, CREF, etc." {...field} />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="qualification"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Qualificação Principal</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="Médico, Dentista, Fisioterapeuta, etc."
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
                      name="employment_status"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Status de Emprego</form_1.FormLabel>
                            <select_1.Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Selecione o status" />
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                {employmentStatusOptions.map(function (option) {
                                  return (
                                    <select_1.SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                      name="status"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Status Profissional</form_1.FormLabel>
                            <select_1.Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Selecione o status" />
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                {professionalStatusOptions.map(function (option) {
                                  return (
                                    <select_1.SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Specialties Tab */}
            <tabs_1.TabsContent value="specialties">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Star className="h-5 w-5" />
                    Especialidades
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Selecione as especialidades do profissional
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialties.map(function (specialty) {
                      return (
                        <div
                          key={specialty.id}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={function () {
                            return handleSpecialtyToggle(specialty.id);
                          }}
                        >
                          <checkbox_1.Checkbox
                            checked={selectedSpecialties.includes(specialty.id)}
                            onChange={function () {
                              return handleSpecialtyToggle(specialty.id);
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{specialty.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {specialty.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Credentials Tab */}
            <tabs_1.TabsContent value="credentials">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Certificate className="h-5 w-5" />
                        Credenciais e Certificações
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        Gerencie as credenciais profissionais
                      </card_1.CardDescription>
                    </div>
                    <dialog_1.Dialog
                      open={showCredentialDialog}
                      onOpenChange={setShowCredentialDialog}
                    >
                      <dialog_1.DialogTrigger asChild>
                        <button_1.Button variant="outline">
                          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                          Adicionar Credencial
                        </button_1.Button>
                      </dialog_1.DialogTrigger>
                      <dialog_1.DialogContent>
                        <dialog_1.DialogHeader>
                          <dialog_1.DialogTitle>Nova Credencial</dialog_1.DialogTitle>
                          <dialog_1.DialogDescription>
                            Adicione uma nova credencial ou certificação
                          </dialog_1.DialogDescription>
                        </dialog_1.DialogHeader>
                        <form_1.Form {...credentialForm}>
                          <form
                            onSubmit={credentialForm.handleSubmit(handleAddCredential)}
                            className="space-y-4"
                          >
                            <form_1.FormField
                              control={credentialForm.control}
                              name="credential_type"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Tipo de Credencial</form_1.FormLabel>
                                    <select_1.Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <form_1.FormControl>
                                        <select_1.SelectTrigger>
                                          <select_1.SelectValue placeholder="Selecione o tipo" />
                                        </select_1.SelectTrigger>
                                      </form_1.FormControl>
                                      <select_1.SelectContent>
                                        {credentialTypeOptions.map(function (option) {
                                          return (
                                            <select_1.SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
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
                              control={credentialForm.control}
                              name="credential_number"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Número da Credencial</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input
                                        placeholder="Número ou código da credencial"
                                        {...field}
                                      />
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>
                                );
                              }}
                            />

                            <form_1.FormField
                              control={credentialForm.control}
                              name="issuing_authority"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Autoridade Emissora</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input
                                        placeholder="CFM, CRO, Universidade, etc."
                                        {...field}
                                      />
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>
                                );
                              }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <form_1.FormField
                                control={credentialForm.control}
                                name="issue_date"
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem>
                                      <form_1.FormLabel>Data de Emissão</form_1.FormLabel>
                                      <form_1.FormControl>
                                        <input_1.Input type="date" {...field} />
                                      </form_1.FormControl>
                                      <form_1.FormMessage />
                                    </form_1.FormItem>
                                  );
                                }}
                              />

                              <form_1.FormField
                                control={credentialForm.control}
                                name="expiry_date"
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem>
                                      <form_1.FormLabel>Data de Expiração</form_1.FormLabel>
                                      <form_1.FormControl>
                                        <input_1.Input type="date" {...field} />
                                      </form_1.FormControl>
                                      <form_1.FormMessage />
                                    </form_1.FormItem>
                                  );
                                }}
                              />
                            </div>

                            <form_1.FormField
                              control={credentialForm.control}
                              name="description"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Descrição</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <textarea_1.Textarea
                                        placeholder="Detalhes sobre a credencial..."
                                        {...field}
                                      />
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>
                                );
                              }}
                            />
                          </form>
                        </form_1.Form>
                        <dialog_1.DialogFooter>
                          <button_1.Button
                            variant="outline"
                            onClick={function () {
                              return setShowCredentialDialog(false);
                            }}
                          >
                            Cancelar
                          </button_1.Button>
                          <button_1.Button
                            onClick={credentialForm.handleSubmit(handleAddCredential)}
                            disabled={loading}
                          >
                            Adicionar
                          </button_1.Button>
                        </dialog_1.DialogFooter>
                      </dialog_1.DialogContent>
                    </dialog_1.Dialog>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {credentials.length === 0
                    ? <div className="text-center py-8">
                        <lucide_react_1.Certificate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhuma credencial cadastrada</p>
                      </div>
                    : <div className="space-y-4">
                        {credentials.map(function (credential) {
                          return (
                            <div
                              key={credential.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div>
                                <div className="font-medium">{credential.credential_type}</div>
                                <div className="text-sm text-muted-foreground">
                                  {credential.credential_number} - {credential.issuing_authority}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Válida até:{" "}
                                  {credential.expiry_date
                                    ? new Date(credential.expiry_date).toLocaleDateString("pt-BR")
                                    : "Sem expiração"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <badge_1.Badge
                                  variant={
                                    credential.verification_status === "verified"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {credential.verification_status}
                                </badge_1.Badge>
                                <button_1.Button variant="ghost" size="sm">
                                  <lucide_react_1.Trash2 className="h-4 w-4" />
                                </button_1.Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Services Tab */}
            <tabs_1.TabsContent value="services">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Stethoscope className="h-5 w-5" />
                        Serviços Oferecidos
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        Gerencie os serviços que o profissional oferece
                      </card_1.CardDescription>
                    </div>
                    <dialog_1.Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
                      <dialog_1.DialogTrigger asChild>
                        <button_1.Button variant="outline">
                          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                          Adicionar Serviço
                        </button_1.Button>
                      </dialog_1.DialogTrigger>
                      <dialog_1.DialogContent>
                        <dialog_1.DialogHeader>
                          <dialog_1.DialogTitle>Novo Serviço</dialog_1.DialogTitle>
                          <dialog_1.DialogDescription>
                            Adicione um novo serviço oferecido pelo profissional
                          </dialog_1.DialogDescription>
                        </dialog_1.DialogHeader>
                        <form_1.Form {...serviceForm}>
                          <form
                            onSubmit={serviceForm.handleSubmit(handleAddService)}
                            className="space-y-4"
                          >
                            <form_1.FormField
                              control={serviceForm.control}
                              name="service_name"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Nome do Serviço</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input placeholder="Nome do serviço" {...field} />
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>
                                );
                              }}
                            />

                            <form_1.FormField
                              control={serviceForm.control}
                              name="service_type"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Tipo de Serviço</form_1.FormLabel>
                                    <select_1.Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <form_1.FormControl>
                                        <select_1.SelectTrigger>
                                          <select_1.SelectValue placeholder="Selecione o tipo" />
                                        </select_1.SelectTrigger>
                                      </form_1.FormControl>
                                      <select_1.SelectContent>
                                        {serviceTypeOptions.map(function (option) {
                                          return (
                                            <select_1.SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
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
                              control={serviceForm.control}
                              name="description"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Descrição</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <textarea_1.Textarea
                                        placeholder="Descrição do serviço..."
                                        {...field}
                                      />
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>
                                );
                              }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <form_1.FormField
                                control={serviceForm.control}
                                name="duration_minutes"
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem>
                                      <form_1.FormLabel>Duração (minutos)</form_1.FormLabel>
                                      <form_1.FormControl>
                                        <input_1.Input
                                          type="number"
                                          placeholder="60"
                                          {...field}
                                          onChange={function (e) {
                                            return field.onChange(parseInt(e.target.value));
                                          }}
                                        />
                                      </form_1.FormControl>
                                      <form_1.FormMessage />
                                    </form_1.FormItem>
                                  );
                                }}
                              />

                              <form_1.FormField
                                control={serviceForm.control}
                                name="base_price"
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem>
                                      <form_1.FormLabel>Preço Base (R$)</form_1.FormLabel>
                                      <form_1.FormControl>
                                        <input_1.Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={function (e) {
                                            return field.onChange(parseFloat(e.target.value));
                                          }}
                                        />
                                      </form_1.FormControl>
                                      <form_1.FormMessage />
                                    </form_1.FormItem>
                                  );
                                }}
                              />
                            </div>

                            <form_1.FormField
                              control={serviceForm.control}
                              name="requires_certification"
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <form_1.FormControl>
                                      <checkbox_1.Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </form_1.FormControl>
                                    <div className="space-y-1 leading-none">
                                      <form_1.FormLabel>
                                        Requer Certificação Específica
                                      </form_1.FormLabel>
                                      <form_1.FormDescription>
                                        Marque se este serviço requer certificação específica
                                      </form_1.FormDescription>
                                    </div>
                                  </form_1.FormItem>
                                );
                              }}
                            />
                          </form>
                        </form_1.Form>
                        <dialog_1.DialogFooter>
                          <button_1.Button
                            variant="outline"
                            onClick={function () {
                              return setShowServiceDialog(false);
                            }}
                          >
                            Cancelar
                          </button_1.Button>
                          <button_1.Button
                            onClick={serviceForm.handleSubmit(handleAddService)}
                            disabled={loading}
                          >
                            Adicionar
                          </button_1.Button>
                        </dialog_1.DialogFooter>
                      </dialog_1.DialogContent>
                    </dialog_1.Dialog>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {services.length === 0
                    ? <div className="text-center py-8">
                        <lucide_react_1.Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
                      </div>
                    : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map(function (service) {
                          var _a;
                          return (
                            <div key={service.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{service.service_name}</div>
                                <badge_1.Badge variant="outline">
                                  {service.service_type}
                                </badge_1.Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {service.description}
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Duração: {service.duration_minutes}min</span>
                                <span className="font-medium">
                                  R${" "}
                                  {((_a = service.base_price) === null || _a === void 0
                                    ? void 0
                                    : _a.toFixed(2)) || "0.00"}
                                </span>
                              </div>
                              {service.requires_certification && (
                                <badge_1.Badge className="mt-2" variant="outline">
                                  <lucide_react_1.Award className="mr-1 h-3 w-3" />
                                  Requer Certificação
                                </badge_1.Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </form>
      </form_1.Form>
    </div>
  );
}
