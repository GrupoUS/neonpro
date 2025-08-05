"use client";
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfessionalManagement;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var professionals_1 = require("@/lib/supabase/professionals");
var getStatusBadgeVariant = function (status) {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "suspended":
      return "destructive";
    case "pending_verification":
      return "outline";
    default:
      return "secondary";
  }
};
var getCredentialStatusIcon = function (status) {
  switch (status) {
    case "verified":
      return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />;
    case "pending":
      return <lucide_react_1.Clock className="h-4 w-4 text-yellow-600" />;
    case "expired":
      return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <lucide_react_1.Clock className="h-4 w-4 text-gray-600" />;
  }
};
function ProfessionalManagement(_a) {
  var _this = this;
  var _b = _a.initialProfessionals,
    initialProfessionals = _b === void 0 ? [] : _b;
  var router = (0, navigation_1.useRouter)();
  var _c = (0, react_1.useState)(initialProfessionals),
    professionals = _c[0],
    setProfessionals = _c[1];
  var _d = (0, react_1.useState)(initialProfessionals),
    filteredProfessionals = _d[0],
    setFilteredProfessionals = _d[1];
  var _e = (0, react_1.useState)({
      total: 0,
      active: 0,
      pending_verification: 0,
      credentialsExpiringSoon: 0,
    }),
    stats = _e[0],
    setStats = _e[1];
  var _f = (0, react_1.useState)(false),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)(""),
    searchTerm = _g[0],
    setSearchTerm = _g[1];
  var _h = (0, react_1.useState)("all"),
    statusFilter = _h[0],
    setStatusFilter = _h[1];
  var _j = (0, react_1.useState)("all"),
    specialtyFilter = _j[0],
    setSpecialtyFilter = _j[1];
  var _k = (0, react_1.useState)(null),
    selectedProfessional = _k[0],
    setSelectedProfessional = _k[1];
  var _l = (0, react_1.useState)([]),
    credentials = _l[0],
    setCredentials = _l[1];
  var _m = (0, react_1.useState)([]),
    services = _m[0],
    setServices = _m[1];
  var _o = (0, react_1.useState)(false),
    showDetailsDialog = _o[0],
    setShowDetailsDialog = _o[1];
  var _p = (0, react_1.useState)(false),
    showDeleteDialog = _p[0],
    setShowDeleteDialog = _p[1];
  var _q = (0, react_1.useState)(null),
    professionalToDelete = _q[0],
    setProfessionalToDelete = _q[1];
  (0, react_1.useEffect)(function () {
    loadProfessionals();
  }, []);
  (0, react_1.useEffect)(
    function () {
      filterProfessionals();
    },
    [professionals, searchTerm, statusFilter, specialtyFilter],
  );
  var loadProfessionals = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [4 /*yield*/, (0, professionals_1.getProfessionals)()];
          case 1:
            data = _a.sent();
            setProfessionals(data);
            calculateStats(data);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Error loading professionals:", error_1);
            sonner_1.toast.error("Erro ao carregar profissionais");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var calculateStats = function (professionalsData) {
    var total = professionalsData.length;
    var active = professionalsData.filter(function (p) {
      return p.status === "active";
    }).length;
    var pending_verification = professionalsData.filter(function (p) {
      return p.status === "pending_verification";
    }).length;
    // Calculate credentials expiring in next 30 days
    var thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    var credentialsExpiringSoon = 0;
    professionalsData.forEach(function (professional) {
      // This would need to be calculated from actual credential data
      // For now, using a placeholder calculation
      credentialsExpiringSoon += Math.floor(Math.random() * 2); // Placeholder
    });
    setStats({
      total: total,
      active: active,
      pending_verification: pending_verification,
      credentialsExpiringSoon: credentialsExpiringSoon,
    });
  };
  var filterProfessionals = function () {
    var filtered = professionals;
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(function (professional) {
        var _a, _b;
        return (
          professional.given_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          professional.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ((_a = professional.email) === null || _a === void 0
            ? void 0
            : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
          ((_b = professional.license_number) === null || _b === void 0
            ? void 0
            : _b.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(function (professional) {
        return professional.status === statusFilter;
      });
    }
    // Specialty filter (would need to join with professional_specialties)
    if (specialtyFilter !== "all") {
      // This would need to be implemented with proper data relationships
      // For now, keeping all results
    }
    setFilteredProfessionals(filtered);
  };
  var handleViewDetails = function (professional) {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, credentialsData, servicesData, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setSelectedProfessional(professional);
            setLoading(true);
            return [
              4 /*yield*/,
              Promise.all([
                (0, professionals_1.getProfessionalCredentials)(professional.id),
                (0, professionals_1.getProfessionalServices)(professional.id),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (credentialsData = _a[0]), (servicesData = _a[1]);
            setCredentials(credentialsData);
            setServices(servicesData);
            setShowDetailsDialog(true);
            return [3 /*break*/, 4];
          case 2:
            error_2 = _b.sent();
            console.error("Error loading professional details:", error_2);
            sonner_1.toast.error("Erro ao carregar detalhes do profissional");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleEdit = function (professional) {
    // Navigate to edit form
    router.push("/dashboard/professionals/".concat(professional.id, "/edit"));
  };
  var handleDelete = function (professional) {
    setProfessionalToDelete(professional);
    setShowDeleteDialog(true);
  };
  var confirmDelete = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!professionalToDelete) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, (0, professionals_1.deleteProfessional)(professionalToDelete.id)];
          case 2:
            _a.sent();
            setProfessionals(function (prev) {
              return prev.filter(function (p) {
                return p.id !== professionalToDelete.id;
              });
            });
            sonner_1.toast.success("Profissional removido com sucesso");
            setShowDeleteDialog(false);
            setProfessionalToDelete(null);
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Error deleting professional:", error_3);
            sonner_1.toast.error("Erro ao remover profissional");
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
  var handleVerifyCredential = function (credentialId) {
    return __awaiter(_this, void 0, void 0, function () {
      var updatedCredentials, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            setLoading(true);
            return [
              4 /*yield*/,
              (0, professionals_1.verifyCredential)(credentialId),
              // Reload credentials
            ];
          case 1:
            _a.sent();
            if (!selectedProfessional) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              (0, professionals_1.getProfessionalCredentials)(selectedProfessional.id),
            ];
          case 2:
            updatedCredentials = _a.sent();
            setCredentials(updatedCredentials);
            _a.label = 3;
          case 3:
            sonner_1.toast.success("Credencial verificada com sucesso");
            return [3 /*break*/, 6];
          case 4:
            error_4 = _a.sent();
            console.error("Error verifying credential:", error_4);
            sonner_1.toast.error("Erro ao verificar credencial");
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Profissionais</h2>
          <p className="text-muted-foreground">
            Gerencie perfis profissionais, credenciais e especialidades
          </p>
        </div>
        <button_1.Button
          onClick={function () {
            return router.push("/dashboard/professionals/new");
          }}
        >
          <lucide_react_1.UserPlus className="mr-2 h-4 w-4" />
          Cadastrar Profissional
        </button_1.Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Total de Profissionais
            </card_1.CardTitle>
            <lucide_react_1.Stethoscope className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Profissionais Ativos
            </card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Atualmente em atividade</p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Pendente Verificação
            </card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.pending_verification}</div>
            <p className="text-xs text-muted-foreground">Aguardando verificação</p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Credenciais Expirando
            </card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.credentialsExpiringSoon}</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative max-w-sm">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar profissionais..."
                  value={searchTerm}
                  onChange={function (e) {
                    return setSearchTerm(e.target.value);
                  }}
                  className="pl-8"
                />
              </div>
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger className="w-[180px]">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os Status</select_1.SelectItem>
                  <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
                  <select_1.SelectItem value="inactive">Inativo</select_1.SelectItem>
                  <select_1.SelectItem value="suspended">Suspenso</select_1.SelectItem>
                  <select_1.SelectItem value="pending_verification">Pendente</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              <select_1.Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <select_1.SelectTrigger className="w-[180px]">
                  <select_1.SelectValue placeholder="Especialidade" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas Especialidades</select_1.SelectItem>
                  <select_1.SelectItem value="dermatology">Dermatologia</select_1.SelectItem>
                  <select_1.SelectItem value="plastic_surgery">
                    Cirurgia Plástica
                  </select_1.SelectItem>
                  <select_1.SelectItem value="aesthetics">Estética</select_1.SelectItem>
                  <select_1.SelectItem value="cosmetology">Cosmetologia</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="flex items-center gap-2">
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Filter className="mr-2 h-4 w-4" />
                Filtros
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Professionals Table */}
      <card_1.Card>
        <card_1.CardContent className="p-0">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Profissional</table_1.TableHead>
                <table_1.TableHead>Especialidades</table_1.TableHead>
                <table_1.TableHead>Credenciais</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Últimas Atividades</table_1.TableHead>
                <table_1.TableHead className="text-right">Ações</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {loading
                ? <table_1.TableRow>
                    <table_1.TableCell colSpan={6} className="text-center py-8">
                      Carregando profissionais...
                    </table_1.TableCell>
                  </table_1.TableRow>
                : filteredProfessionals.length === 0
                  ? <table_1.TableRow>
                      <table_1.TableCell colSpan={6} className="text-center py-8">
                        Nenhum profissional encontrado
                      </table_1.TableCell>
                    </table_1.TableRow>
                  : filteredProfessionals.map(function (professional) {
                      return (
                        <table_1.TableRow key={professional.id}>
                          <table_1.TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {professional.given_name[0]}
                                {professional.family_name[0]}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {professional.given_name} {professional.family_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {professional.email}
                                </div>
                              </div>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex flex-wrap gap-1">
                              {/* This would come from joined specialty data */}
                              <badge_1.Badge variant="outline">Estética</badge_1.Badge>
                              <badge_1.Badge variant="outline">Dermatologia</badge_1.Badge>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Certificate className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">3 credenciais</span>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <badge_1.Badge variant={getStatusBadgeVariant(professional.status)}>
                              {professional.status === "active" && "Ativo"}
                              {professional.status === "inactive" && "Inativo"}
                              {professional.status === "suspended" && "Suspenso"}
                              {professional.status === "pending_verification" && "Pendente"}
                            </badge_1.Badge>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="text-sm text-muted-foreground">
                              {professional.updated_at
                                ? new Date(professional.updated_at).toLocaleDateString("pt-BR")
                                : "N/A"}
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell className="text-right">
                            <dropdown_menu_1.DropdownMenu>
                              <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                                  <lucide_react_1.MoreVertical className="h-4 w-4" />
                                </button_1.Button>
                              </dropdown_menu_1.DropdownMenuTrigger>
                              <dropdown_menu_1.DropdownMenuContent align="end">
                                <dropdown_menu_1.DropdownMenuLabel>
                                  Ações
                                </dropdown_menu_1.DropdownMenuLabel>
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={function () {
                                    return handleViewDetails(professional);
                                  }}
                                >
                                  <lucide_react_1.Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={function () {
                                    return handleEdit(professional);
                                  }}
                                >
                                  <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuSeparator />
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={function () {
                                    return handleDelete(professional);
                                  }}
                                  className="text-destructive"
                                >
                                  <lucide_react_1.Trash2 className="mr-2 h-4 w-4" />
                                  Remover
                                </dropdown_menu_1.DropdownMenuItem>
                              </dropdown_menu_1.DropdownMenuContent>
                            </dropdown_menu_1.DropdownMenu>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      );
                    })}
            </table_1.TableBody>
          </table_1.Table>
        </card_1.CardContent>
      </card_1.Card>

      {/* Professional Details Dialog */}
      <dialog_1.Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Detalhes do Profissional</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Informações completas sobre{" "}
              {selectedProfessional === null || selectedProfessional === void 0
                ? void 0
                : selectedProfessional.given_name}{" "}
              {selectedProfessional === null || selectedProfessional === void 0
                ? void 0
                : selectedProfessional.family_name}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          {selectedProfessional && (
            <tabs_1.Tabs defaultValue="overview" className="w-full">
              <tabs_1.TabsList className="grid w-full grid-cols-4">
                <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="credentials">Credenciais</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="services">Serviços</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
              </tabs_1.TabsList>

              <tabs_1.TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações Pessoais</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Nome:</strong> {selectedProfessional.given_name}{" "}
                        {selectedProfessional.family_name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedProfessional.email}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {selectedProfessional.phone_number || "N/A"}
                      </div>
                      <div>
                        <strong>Data de Nascimento:</strong>{" "}
                        {selectedProfessional.birth_date || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Informações Profissionais</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Licença:</strong> {selectedProfessional.license_number || "N/A"}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <badge_1.Badge
                          className="ml-2"
                          variant={getStatusBadgeVariant(selectedProfessional.status)}
                        >
                          {selectedProfessional.status}
                        </badge_1.Badge>
                      </div>
                      <div>
                        <strong>Cadastrado em:</strong>{" "}
                        {new Date(selectedProfessional.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              </tabs_1.TabsContent>

              <tabs_1.TabsContent value="credentials" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Credenciais e Certificações</h4>
                  <button_1.Button size="sm" variant="outline">
                    <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                    Adicionar Credencial
                  </button_1.Button>
                </div>
                <div className="space-y-3">
                  {credentials.map(function (credential) {
                    return (
                      <card_1.Card key={credential.id}>
                        <card_1.CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getCredentialStatusIcon(credential.verification_status)}
                              <div>
                                <div className="font-medium">{credential.credential_type}</div>
                                <div className="text-sm text-muted-foreground">
                                  Número: {credential.credential_number}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Validade:{" "}
                                  {credential.expiry_date
                                    ? new Date(credential.expiry_date).toLocaleDateString("pt-BR")
                                    : "N/A"}
                                </div>
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
                              {credential.verification_status === "pending" && (
                                <button_1.Button
                                  size="sm"
                                  variant="outline"
                                  onClick={function () {
                                    return handleVerifyCredential(credential.id);
                                  }}
                                >
                                  Verificar
                                </button_1.Button>
                              )}
                            </div>
                          </div>
                        </card_1.CardContent>
                      </card_1.Card>
                    );
                  })}
                </div>
              </tabs_1.TabsContent>

              <tabs_1.TabsContent value="services" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Serviços Oferecidos</h4>
                  <button_1.Button size="sm" variant="outline">
                    <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                    Adicionar Serviço
                  </button_1.Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(function (service) {
                    var _a;
                    return (
                      <card_1.Card key={service.id}>
                        <card_1.CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{service.service_name}</div>
                            <badge_1.Badge variant="outline">{service.service_type}</badge_1.Badge>
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
                        </card_1.CardContent>
                      </card_1.Card>
                    );
                  })}
                </div>
              </tabs_1.TabsContent>

              <tabs_1.TabsContent value="performance" className="space-y-4">
                <h4 className="font-medium">Métricas de Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <card_1.Card>
                    <card_1.CardContent className="p-4 text-center">
                      <lucide_react_1.TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm text-muted-foreground">Satisfação do Paciente</div>
                    </card_1.CardContent>
                  </card_1.Card>
                  <card_1.Card>
                    <card_1.CardContent className="p-4 text-center">
                      <lucide_react_1.Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">142</div>
                      <div className="text-sm text-muted-foreground">Consultas no Mês</div>
                    </card_1.CardContent>
                  </card_1.Card>
                  <card_1.Card>
                    <card_1.CardContent className="p-4 text-center">
                      <lucide_react_1.Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold">4.8</div>
                      <div className="text-sm text-muted-foreground">Avaliação Média</div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>
              </tabs_1.TabsContent>
            </tabs_1.Tabs>
          )}

          <dialog_1.DialogFooter>
            <button_1.Button
              variant="outline"
              onClick={function () {
                return setShowDetailsDialog(false);
              }}
            >
              Fechar
            </button_1.Button>
            {selectedProfessional && (
              <button_1.Button
                onClick={function () {
                  return handleEdit(selectedProfessional);
                }}
              >
                <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                Editar Profissional
              </button_1.Button>
            )}
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Delete Confirmation Dialog */}
      <dialog_1.Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Confirmar Remoção</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Tem certeza que deseja remover o profissional{" "}
              {professionalToDelete === null || professionalToDelete === void 0
                ? void 0
                : professionalToDelete.given_name}{" "}
              {professionalToDelete === null || professionalToDelete === void 0
                ? void 0
                : professionalToDelete.family_name}
              ? Esta ação não pode ser desfeita.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter>
            <button_1.Button
              variant="outline"
              onClick={function () {
                return setShowDeleteDialog(false);
              }}
              disabled={loading}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? "Removendo..." : "Remover"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
