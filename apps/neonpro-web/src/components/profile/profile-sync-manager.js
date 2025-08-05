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
exports.ProfileSyncManager = ProfileSyncManager;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var use_profile_sync_1 = require("@/hooks/use-profile-sync");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function ProfileSyncManager(_a) {
  var _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, use_profile_sync_1.useProfileSync)(),
    profile = _c.profile,
    syncStatus = _c.syncStatus,
    isLoading = _c.isLoading,
    isUpdating = _c.isUpdating,
    error = _c.error,
    updateProfile = _c.updateProfile,
    syncWithGoogle = _c.syncWithGoogle,
    resolveConflict = _c.resolveConflict,
    toggleGoogleSync = _c.toggleGoogleSync;
  var _d = (0, react_1.useState)({
      full_name: "",
      first_name: "",
      last_name: "",
      professional_title: "",
      medical_license: "",
      department: "",
      phone: "",
      role: "professional",
    }),
    formData = _d[0],
    setFormData = _d[1];
  var _e = (0, react_1.useState)(false),
    isFormInitialized = _e[0],
    setIsFormInitialized = _e[1];
  // Initialize form when profile loads
  if (profile && !isFormInitialized) {
    setFormData({
      full_name: profile.full_name || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      professional_title: profile.professional_title || "",
      medical_license: profile.medical_license || "",
      department: profile.department || "",
      phone: profile.phone || "",
      role: profile.role,
    });
    setIsFormInitialized(true);
  }
  var handleInputChange = (field, value) => {
    setFormData((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  var handleUpdateProfile = () =>
    __awaiter(this, void 0, void 0, function () {
      var success;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, updateProfile(formData)];
          case 1:
            success = _a.sent();
            if (success) {
              sonner_1.toast.success("Perfil atualizado com sucesso!");
            }
            return [2 /*return*/];
        }
      });
    });
  var handleSyncWithGoogle = () =>
    __awaiter(this, void 0, void 0, function () {
      var success;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, syncWithGoogle()];
          case 1:
            success = _a.sent();
            if (success) {
              // Refresh form data with synced profile
              setIsFormInitialized(false);
            }
            return [2 /*return*/];
        }
      });
    });
  var handleResolveConflict = () =>
    __awaiter(this, void 0, void 0, function () {
      var success;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, resolveConflict(formData)];
          case 1:
            success = _a.sent();
            if (success) {
              setIsFormInitialized(false);
            }
            return [2 /*return*/];
        }
      });
    });
  var handleToggleGoogleSync = (enabled) =>
    __awaiter(this, void 0, void 0, function () {
      var success;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, toggleGoogleSync(enabled)];
          case 1:
            success = _a.sent();
            if (success) {
              sonner_1.toast.success(
                enabled ? "Sincronização Google ativada" : "Sincronização Google desativada",
              );
            }
            return [2 /*return*/];
        }
      });
    });
  var getSyncStatusIcon = () => {
    if (!syncStatus) return <lucide_react_1.Clock className="h-4 w-4 text-gray-400" />;
    switch (syncStatus.sync_status) {
      case "synced":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
      case "conflict":
        return <lucide_react_1.AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <lucide_react_1.Clock className="h-4 w-4 text-blue-500" />;
    }
  };
  var getSyncStatusText = () => {
    if (!syncStatus) return "Verificando...";
    switch (syncStatus.sync_status) {
      case "synced":
        return "Sincronizado";
      case "conflict":
        return "Conflito detectado";
      case "error":
        return "Erro na sincronização";
      case "pending":
        return "Pendente";
      default:
        return "Status desconhecido";
    }
  };
  var getSyncStatusColor = () => {
    if (!syncStatus) return "secondary";
    switch (syncStatus.sync_status) {
      case "synced":
        return "success";
      case "conflict":
        return "warning";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };
  if (isLoading) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center">
            <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando perfil...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (error) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <lucide_react_1.AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Sync Status Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5" />
            Status de Sincronização Google
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSyncStatusIcon()}
              <span className="font-medium">{getSyncStatusText()}</span>
              <badge_1.Badge variant={getSyncStatusColor()}>
                {(syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.sync_status) ||
                  "unknown"}
              </badge_1.Badge>
            </div>

            <div className="flex items-center gap-2">
              <label_1.Label htmlFor="google-sync">Sincronização automática</label_1.Label>
              <switch_1.Switch
                id="google-sync"
                checked={
                  (profile === null || profile === void 0 ? void 0 : profile.google_sync_enabled) ||
                  false
                }
                onCheckedChange={handleToggleGoogleSync}
                disabled={isUpdating}
              />
            </div>
          </div>

          {(syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.last_sync) && (
            <p className="text-sm text-gray-600">
              Última sincronização: {new Date(syncStatus.last_sync).toLocaleString("pt-BR")}
            </p>
          )}

          <div className="flex gap-2">
            <button_1.Button
              onClick={handleSyncWithGoogle}
              disabled={isUpdating}
              size="sm"
              variant="outline"
            >
              {isUpdating
                ? <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2" />
                : <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />}
              Sincronizar agora
            </button_1.Button>

            {(syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.has_conflicts) && (
              <button_1.Button
                onClick={handleResolveConflict}
                disabled={isUpdating}
                size="sm"
                variant="default"
              >
                <lucide_react_1.AlertCircle className="h-4 w-4 mr-2" />
                Resolver conflito
              </button_1.Button>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Profile Information Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.User className="h-5 w-5" />
            Informações Pessoais
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="full_name">Nome completo</label_1.Label>
              <input_1.Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Nome completo"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="email">Email</label_1.Label>
              <div className="flex items-center gap-2">
                <input_1.Input
                  id="email"
                  value={(profile === null || profile === void 0 ? void 0 : profile.email) || ""}
                  disabled
                  className="bg-gray-50"
                />
                <lucide_react_1.Mail className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="first_name">Primeiro nome</label_1.Label>
              <input_1.Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="Primeiro nome"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="last_name">Sobrenome</label_1.Label>
              <input_1.Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Sobrenome"
                disabled={isUpdating}
              />
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Professional Information Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Stethoscope className="h-5 w-5" />
            Informações Profissionais
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="professional_title">Título profissional</label_1.Label>
              <input_1.Input
                id="professional_title"
                value={formData.professional_title}
                onChange={(e) => handleInputChange("professional_title", e.target.value)}
                placeholder="Ex: Médico Cardiologista"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="medical_license">Registro profissional</label_1.Label>
              <input_1.Input
                id="medical_license"
                value={formData.medical_license}
                onChange={(e) => handleInputChange("medical_license", e.target.value)}
                placeholder="Ex: CRM 12345"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="department">Departamento</label_1.Label>
              <input_1.Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Ex: Cardiologia"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="role">Função</label_1.Label>
              <select_1.Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isUpdating}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione a função" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="admin">Administrador</select_1.SelectItem>
                  <select_1.SelectItem value="doctor">Médico</select_1.SelectItem>
                  <select_1.SelectItem value="nurse">Enfermeiro(a)</select_1.SelectItem>
                  <select_1.SelectItem value="staff">Funcionário</select_1.SelectItem>
                  <select_1.SelectItem value="professional">Profissional</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label_1.Label htmlFor="phone">Telefone</label_1.Label>
              <div className="flex items-center gap-2">
                <input_1.Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  disabled={isUpdating}
                />
                <lucide_react_1.Phone className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Actions */}
      <div className="flex justify-end">
        <button_1.Button onClick={handleUpdateProfile} disabled={isUpdating} size="lg">
          {isUpdating
            ? <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2" />
            : <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />}
          Salvar alterações
        </button_1.Button>
      </div>
    </div>
  );
}
