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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileManagement = ProfileManagement;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var avatar_1 = require("@/components/ui/avatar");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var sonner_1 = require("sonner");
var patient_auth_1 = require("@/lib/auth/patient-auth");
var utils_1 = require("@/lib/utils");
var profileSchema = zod_2.z.object({
  name: zod_2.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: zod_2.z.string().email("Email inválido"),
  phone: zod_2.z.string().min(10, "Telefone inválido"),
  birth_date: zod_2.z.string().min(1, "Data de nascimento é obrigatória"),
  gender: zod_2.z.enum(["M", "F", "NB"], { required_error: "Selecione o gênero" }),
  emergency_contact_name: zod_2.z.string().min(2, "Nome do contato é obrigatório"),
  emergency_contact: zod_2.z.string().min(10, "Telefone do contato é obrigatório"),
  address: zod_2.z.object({
    street: zod_2.z.string().min(1, "Rua é obrigatória"),
    number: zod_2.z.string().min(1, "Número é obrigatório"),
    complement: zod_2.z.string().optional(),
    neighborhood: zod_2.z.string().min(1, "Bairro é obrigatório"),
    city: zod_2.z.string().min(1, "Cidade é obrigatória"),
    state: zod_2.z.string().min(2, "Estado é obrigatório").max(2, "Use a sigla do estado"),
    zipcode: zod_2.z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  }),
});
var passwordSchema = zod_2.z
  .object({
    currentPassword: zod_2.z.string().min(1, "Senha atual é obrigatória"),
    newPassword: zod_2.z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
    confirmPassword: zod_2.z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });
function ProfileManagement() {
  var _a = (0, patient_auth_1.usePatientAuth)(),
    patient = _a.patient,
    updatePatient = _a.updatePatient;
  var _b = (0, react_1.useState)(false),
    isUpdating = _b[0],
    setIsUpdating = _b[1];
  var _c = (0, react_1.useState)(false),
    showPasswordForm = _c[0],
    setShowPasswordForm = _c[1];
  var _d = (0, react_1.useState)(false),
    showCurrentPassword = _d[0],
    setShowCurrentPassword = _d[1];
  var _e = (0, react_1.useState)(false),
    showNewPassword = _e[0],
    setShowNewPassword = _e[1];
  var profileForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(profileSchema),
    defaultValues: {
      name: (patient === null || patient === void 0 ? void 0 : patient.name) || "",
      email: (patient === null || patient === void 0 ? void 0 : patient.email) || "",
      phone: (patient === null || patient === void 0 ? void 0 : patient.phone) || "",
      birth_date: (patient === null || patient === void 0 ? void 0 : patient.birth_date) || "",
      gender: (patient === null || patient === void 0 ? void 0 : patient.gender) || "M",
      emergency_contact_name:
        (patient === null || patient === void 0 ? void 0 : patient.emergency_contact_name) || "",
      emergency_contact:
        (patient === null || patient === void 0 ? void 0 : patient.emergency_contact) || "",
      address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipcode: "",
      },
    },
  });
  var passwordForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  var handleProfileUpdate = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsUpdating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              updatePatient({
                name: data.name,
                email: data.email,
                phone: data.phone,
                birth_date: data.birth_date,
                gender: data.gender,
                emergency_contact_name: data.emergency_contact_name,
                emergency_contact: data.emergency_contact,
                // TODO: Update address in separate table
              }),
            ];
          case 2:
            _a.sent();
            sonner_1.toast.success("Perfil atualizado com sucesso!");
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao atualizar perfil");
            return [3 /*break*/, 5];
          case 4:
            setIsUpdating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handlePasswordUpdate = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsUpdating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // TODO: Call API to update password
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1500))];
          case 2:
            // TODO: Call API to update password
            _a.sent();
            sonner_1.toast.success("Senha alterada com sucesso!");
            passwordForm.reset();
            setShowPasswordForm(false);
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            sonner_1.toast.error("Erro ao alterar senha");
            return [3 /*break*/, 5];
          case 4:
            setIsUpdating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleAvatarUpload = (event) =>
    __awaiter(this, void 0, void 0, function () {
      var file;
      var _a;
      return __generator(this, (_b) => {
        file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) return [2 /*return*/];
        // Validate file type and size
        if (!file.type.startsWith("image/")) {
          sonner_1.toast.error("Por favor, selecione uma imagem válida");
          return [2 /*return*/];
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB
          sonner_1.toast.error("Imagem deve ter no máximo 5MB");
          return [2 /*return*/];
        }
        try {
          // TODO: Upload to storage and update patient record
          sonner_1.toast.success("Foto de perfil atualizada!");
        } catch (error) {
          sonner_1.toast.error("Erro ao atualizar foto de perfil");
        }
        return [2 /*return*/];
      });
    });
  var getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      {/* Profile Picture */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Camera className="w-5 h-5 text-primary" />
            Foto de Perfil
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center gap-6">
            <avatar_1.Avatar className="h-24 w-24 border-4 border-primary/20">
              <avatar_1.AvatarImage
                src={patient === null || patient === void 0 ? void 0 : patient.avatar_url}
                alt={patient === null || patient === void 0 ? void 0 : patient.name}
              />
              <avatar_1.AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {(patient === null || patient === void 0 ? void 0 : patient.name) &&
                  getInitials(patient.name)}
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>

            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Escolha uma foto de perfil. Recomendamos uma imagem quadrada de pelo menos
                200x200px.
              </p>
              <div className="flex gap-3">
                <label htmlFor="avatar-upload">
                  <button_1.Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">
                      <lucide_react_1.Camera className="w-4 h-4 mr-2" />
                      Alterar Foto
                    </span>
                  </button_1.Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Personal Information */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.User className="w-5 h-5 text-primary" />
            Informações Pessoais
          </card_1.CardTitle>
          <card_1.CardDescription>
            Mantenha seus dados sempre atualizados para melhor atendimento
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form_1.Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField
                  control={profileForm.control}
                  name="name"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Nome Completo *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Seu nome completo" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={profileForm.control}
                  name="email"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Email *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="email" placeholder="seu@email.com" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form_1.FormField
                  control={profileForm.control}
                  name="phone"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Telefone *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            onChange={(e) => {
                              var formatted = (0, utils_1.formatPhone)(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={profileForm.control}
                  name="birth_date"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data de Nascimento *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="date" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={profileForm.control}
                  name="gender"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Gênero *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Selecione" />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="M">Masculino</select_1.SelectItem>
                            <select_1.SelectItem value="F">Feminino</select_1.SelectItem>
                            <select_1.SelectItem value="NB">Não-binário</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <separator_1.Separator />

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <lucide_react_1.Phone className="w-5 h-5 text-primary" />
                  Contato de Emergência
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={profileForm.control}
                    name="emergency_contact_name"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Nome do Contato *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Nome completo" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={profileForm.control}
                    name="emergency_contact"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Telefone de Emergência *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              placeholder="(11) 99999-9999"
                              {...field}
                              onChange={(e) => {
                                var formatted = (0, utils_1.formatPhone)(e.target.value);
                                field.onChange(formatted);
                              }}
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              <separator_1.Separator />

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <lucide_react_1.MapPin className="w-5 h-5 text-primary" />
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <form_1.FormField
                    control={profileForm.control}
                    name="address.street"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="md:col-span-2">
                          <form_1.FormLabel>Rua/Avenida *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Nome da rua" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={profileForm.control}
                    name="address.number"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Número *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="123" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={profileForm.control}
                    name="address.complement"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Complemento</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Apt, Bloco, etc." {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={profileForm.control}
                    name="address.neighborhood"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Bairro *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Nome do bairro" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <form_1.FormField
                    control={profileForm.control}
                    name="address.city"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Cidade *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Cidade" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={profileForm.control}
                    name="address.state"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Estado *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="SP" maxLength={2} {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={profileForm.control}
                    name="address.zipcode"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>CEP *</form_1.FormLabel>
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

              <div className="flex justify-end">
                <button_1.Button type="submit" disabled={isUpdating}>
                  {isUpdating
                    ? <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    : <>
                        <lucide_react_1.Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>}
                </button_1.Button>
              </div>
            </form>
          </form_1.Form>
        </card_1.CardContent>
      </card_1.Card>

      {/* Account Security */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="w-5 h-5 text-primary" />
            Segurança da Conta
          </card_1.CardTitle>
          <card_1.CardDescription>
            Mantenha sua conta segura alterando sua senha regularmente
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {!showPasswordForm
            ? <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Senha</h4>
                  <p className="text-sm text-muted-foreground">Última alteração: Há 3 meses</p>
                </div>
                <button_1.Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  Alterar Senha
                </button_1.Button>
              </div>
            : <form_1.Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                  className="space-y-4"
                >
                  <form_1.FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Senha Atual *</form_1.FormLabel>
                          <form_1.FormControl>
                            <div className="relative">
                              <input_1.Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Digite sua senha atual"
                                {...field}
                              />
                              <button_1.Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword
                                  ? <lucide_react_1.EyeOff className="w-4 h-4" />
                                  : <lucide_react_1.Eye className="w-4 h-4" />}
                              </button_1.Button>
                            </div>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Nova Senha *</form_1.FormLabel>
                          <form_1.FormControl>
                            <div className="relative">
                              <input_1.Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Digite a nova senha"
                                {...field}
                              />
                              <button_1.Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword
                                  ? <lucide_react_1.EyeOff className="w-4 h-4" />
                                  : <lucide_react_1.Eye className="w-4 h-4" />}
                              </button_1.Button>
                            </div>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Mínimo de 8 caracteres com letras e números
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Confirmar Nova Senha *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              type="password"
                              placeholder="Confirme a nova senha"
                              {...field}
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <div className="flex justify-end gap-3">
                    <button_1.Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        passwordForm.reset();
                      }}
                    >
                      Cancelar
                    </button_1.Button>
                    <button_1.Button type="submit" disabled={isUpdating}>
                      {isUpdating
                        ? <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Alterando...
                          </>
                        : "Alterar Senha"}
                    </button_1.Button>
                  </div>
                </form>
              </form_1.Form>}
        </card_1.CardContent>
      </card_1.Card>

      {/* Account Info */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle>Informações da Conta</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <lucide_react_1.Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Membro desde</p>
                <p className="text-sm text-muted-foreground">
                  {(patient === null || patient === void 0 ? void 0 : patient.created_at) &&
                    (0, date_fns_1.format)(new Date(patient.created_at), "MMMM 'de' yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <lucide_react_1.CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Status da Conta</p>
                <p className="text-sm text-green-600">Ativa</p>
              </div>
            </div>
          </div>

          <alert_1.Alert>
            <lucide_react_1.AlertCircle className="h-4 w-4" />
            <alert_1.AlertDescription>
              <strong>CPF:</strong> Seus dados estão protegidos. O CPF não pode ser alterado por
              questões de segurança. Para alterações, entre em contato conosco.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
