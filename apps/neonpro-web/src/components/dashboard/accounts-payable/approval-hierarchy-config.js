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
exports.default = ApprovalHierarchyConfig;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var table_1 = require("@/components/ui/table");
var textarea_1 = require("@/components/ui/textarea");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var defaultLevels = [
  {
    level_order: 1,
    level_name: "Supervisor Direto",
    min_amount: 0,
    max_amount: 1000,
    required_approvers: 1,
    approval_timeout_hours: 24,
    can_be_skipped: false,
    auto_approve_below: 100,
    description: "Aprovação para despesas até R$ 1.000",
  },
  {
    level_order: 2,
    level_name: "Gerente Departamental",
    min_amount: 1000.01,
    max_amount: 5000,
    required_approvers: 1,
    approval_timeout_hours: 48,
    can_be_skipped: false,
    description: "Aprovação para despesas de R$ 1.000,01 até R$ 5.000",
  },
  {
    level_order: 3,
    level_name: "Diretor Financeiro",
    min_amount: 5000.01,
    max_amount: null,
    required_approvers: 2,
    approval_timeout_hours: 72,
    can_be_skipped: false,
    description: "Aprovação para despesas acima de R$ 5.000",
  },
];
var userRoles = [
  { value: "approver", label: "Aprovador", icon: lucide_react_1.UserCheck },
  { value: "admin", label: "Administrador", icon: lucide_react_1.Shield },
  { value: "super_admin", label: "Super Admin", icon: lucide_react_1.Crown },
];
function ApprovalHierarchyConfig(_a) {
  var _this = this;
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    onSave = _a.onSave;
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)("levels"),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)([]),
    approvalLevels = _d[0],
    setApprovalLevels = _d[1];
  var _e = (0, react_1.useState)([]),
    approvalUsers = _e[0],
    setApprovalUsers = _e[1];
  // Form states
  var _f = (0, react_1.useState)(null),
    editingLevel = _f[0],
    setEditingLevel = _f[1];
  var _g = (0, react_1.useState)(null),
    editingUser = _g[0],
    setEditingUser = _g[1];
  var _h = (0, react_1.useState)(false),
    showLevelForm = _h[0],
    setShowLevelForm = _h[1];
  var _j = (0, react_1.useState)(false),
    showUserForm = _j[0],
    setShowUserForm = _j[1];
  (0, react_1.useEffect)(
    function () {
      if (open) {
        loadApprovalHierarchy();
      }
    },
    [open],
  );
  var loadApprovalHierarchy = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockLevels, mockUsers;
      return __generator(this, function (_a) {
        try {
          mockLevels = defaultLevels.map(function (level, index) {
            return __assign(__assign({ id: "level_".concat(index + 1) }, level), {
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          });
          mockUsers = [
            {
              id: "user_1",
              user_id: "u1",
              user_name: "João Silva",
              user_email: "joao@neonpro.com",
              approval_level_id: "level_1",
              spending_limit: 1000,
              can_override: false,
              is_active: true,
              role: "approver",
              department: "Operações",
              created_at: new Date().toISOString(),
            },
            {
              id: "user_2",
              user_id: "u2",
              user_name: "Maria Santos",
              user_email: "maria@neonpro.com",
              approval_level_id: "level_2",
              spending_limit: 5000,
              can_override: false,
              is_active: true,
              role: "approver",
              department: "Financeiro",
              created_at: new Date().toISOString(),
            },
            {
              id: "user_3",
              user_id: "u3",
              user_name: "Carlos Oliveira",
              user_email: "carlos@neonpro.com",
              approval_level_id: "level_3",
              spending_limit: null,
              can_override: true,
              is_active: true,
              role: "admin",
              department: "Direção",
              created_at: new Date().toISOString(),
            },
          ];
          setApprovalLevels(mockLevels);
          setApprovalUsers(mockUsers);
        } catch (error) {
          console.error("Error loading approval hierarchy:", error);
          sonner_1.toast.error("Erro ao carregar hierarquia de aprovação");
        }
        return [2 /*return*/];
      });
    });
  };
  var formatCurrency = function (amount) {
    if (amount === null) return "Sem limite";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  var handleSaveLevel = function (levelData) {
    return __awaiter(_this, void 0, void 0, function () {
      var newLevel_1;
      return __generator(this, function (_a) {
        setLoading(true);
        try {
          if (editingLevel) {
            // Update existing level
            setApprovalLevels(function (levels) {
              return levels.map(function (level) {
                return level.id === editingLevel.id
                  ? __assign(__assign(__assign({}, level), levelData), {
                      updated_at: new Date().toISOString(),
                    })
                  : level;
              });
            });
            sonner_1.toast.success("Nível de aprovação atualizado");
          } else {
            newLevel_1 = __assign(__assign({ id: "level_".concat(Date.now()) }, levelData), {
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setApprovalLevels(function (levels) {
              return __spreadArray(__spreadArray([], levels, true), [newLevel_1], false);
            });
            sonner_1.toast.success("Nível de aprovação criado");
          }
          setShowLevelForm(false);
          setEditingLevel(null);
        } catch (error) {
          console.error("Error saving level:", error);
          sonner_1.toast.error("Erro ao salvar nível de aprovação");
        } finally {
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var handleSaveUser = function (userData) {
    return __awaiter(_this, void 0, void 0, function () {
      var newUser_1;
      return __generator(this, function (_a) {
        setLoading(true);
        try {
          if (editingUser) {
            // Update existing user
            setApprovalUsers(function (users) {
              return users.map(function (user) {
                return user.id === editingUser.id ? __assign(__assign({}, user), userData) : user;
              });
            });
            sonner_1.toast.success("Usuário aprovador atualizado");
          } else {
            newUser_1 = __assign(__assign({ id: "user_".concat(Date.now()) }, userData), {
              is_active: true,
              created_at: new Date().toISOString(),
            });
            setApprovalUsers(function (users) {
              return __spreadArray(__spreadArray([], users, true), [newUser_1], false);
            });
            sonner_1.toast.success("Usuário aprovador adicionado");
          }
          setShowUserForm(false);
          setEditingUser(null);
        } catch (error) {
          console.error("Error saving user:", error);
          sonner_1.toast.error("Erro ao salvar usuário aprovador");
        } finally {
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var handleDeleteLevel = function (levelId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (!confirm("Tem certeza que deseja excluir este nível de aprovação?"))
          return [2 /*return*/];
        try {
          setApprovalLevels(function (levels) {
            return levels.filter(function (level) {
              return level.id !== levelId;
            });
          });
          sonner_1.toast.success("Nível de aprovação excluído");
        } catch (error) {
          console.error("Error deleting level:", error);
          sonner_1.toast.error("Erro ao excluir nível de aprovação");
        }
        return [2 /*return*/];
      });
    });
  };
  var handleDeleteUser = function (userId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (!confirm("Tem certeza que deseja remover este usuário aprovador?"))
          return [2 /*return*/];
        try {
          setApprovalUsers(function (users) {
            return users.filter(function (user) {
              return user.id !== userId;
            });
          });
          sonner_1.toast.success("Usuário aprovador removido");
        } catch (error) {
          console.error("Error deleting user:", error);
          sonner_1.toast.error("Erro ao remover usuário aprovador");
        }
        return [2 /*return*/];
      });
    });
  };
  var handleSaveHierarchy = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // In real implementation, this would save to API
            console.log("Saving hierarchy:", {
              approvalLevels: approvalLevels,
              approvalUsers: approvalUsers,
            });
            // Simulate API call
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 2000);
              }),
            ];
          case 2:
            // Simulate API call
            _a.sent();
            sonner_1.toast.success("Hierarquia de aprovação salva com sucesso");
            onSave();
            onOpenChange(false);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error saving hierarchy:", error_1);
            sonner_1.toast.error("Erro ao salvar hierarquia de aprovação");
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
  var getUsersForLevel = function (levelId) {
    return approvalUsers.filter(function (user) {
      return user.approval_level_id === levelId;
    });
  };
  var getRoleIcon = function (role) {
    var roleConfig = userRoles.find(function (r) {
      return r.value === role;
    });
    return (
      (roleConfig === null || roleConfig === void 0 ? void 0 : roleConfig.icon) ||
      lucide_react_1.UserCheck
    );
  };
  var getLevelStatus = function (level) {
    var users = getUsersForLevel(level.id);
    if (users.length === 0) {
      return {
        status: "warning",
        label: "Sem aprovadores",
        color: "bg-yellow-100 text-yellow-800",
      };
    }
    if (users.length < level.required_approvers) {
      return {
        status: "error",
        label: "Aprovadores insuficientes",
        color: "bg-red-100 text-red-800",
      };
    }
    return {
      status: "success",
      label: "Configurado",
      color: "bg-green-100 text-green-800",
    };
  };
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Settings className="h-5 w-5" />
            Configuração da Hierarquia de Aprovação
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure níveis de aprovação e usuários responsáveis pela aprovação de contas a pagar
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={function () {
              return setActiveTab("levels");
            }}
            className={(0, utils_1.cn)(
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              activeTab === "levels"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Níveis de Aprovação
          </button>
          <button
            onClick={function () {
              return setActiveTab("users");
            }}
            className={(0, utils_1.cn)(
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              activeTab === "users"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Usuários Aprovadores
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "levels" && (
            <div className="space-y-4">
              {/* Levels Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Níveis de Aprovação</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os diferentes níveis de aprovação baseados em valores
                  </p>
                </div>
                <button_1.Button
                  onClick={function () {
                    setEditingLevel(null);
                    setShowLevelForm(true);
                  }}
                  size="sm"
                >
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Adicionar Nível
                </button_1.Button>
              </div>

              {/* Levels Table */}
              <card_1.Card>
                <card_1.CardContent className="p-0">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Ordem</table_1.TableHead>
                        <table_1.TableHead>Nome</table_1.TableHead>
                        <table_1.TableHead>Faixa de Valores</table_1.TableHead>
                        <table_1.TableHead>Aprovadores</table_1.TableHead>
                        <table_1.TableHead>Timeout</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead className="w-[100px]">Ações</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {approvalLevels
                        .sort(function (a, b) {
                          return a.level_order - b.level_order;
                        })
                        .map(function (level) {
                          var statusInfo = getLevelStatus(level);
                          var users = getUsersForLevel(level.id);
                          return (
                            <table_1.TableRow key={level.id}>
                              <table_1.TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                    {level.level_order}
                                  </div>
                                  {!level.is_active && (
                                    <badge_1.Badge variant="secondary" className="text-xs">
                                      Inativo
                                    </badge_1.Badge>
                                  )}
                                </div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <div>
                                  <p className="font-medium">{level.level_name}</p>
                                  {level.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {level.description}
                                    </p>
                                  )}
                                </div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <div className="text-sm">
                                  <div>{formatCurrency(level.min_amount)} +</div>
                                  {level.max_amount && (
                                    <div className="text-muted-foreground">
                                      até {formatCurrency(level.max_amount)}
                                    </div>
                                  )}
                                </div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <lucide_react_1.Users className="h-3 w-3" />
                                  {users.length}/{level.required_approvers}
                                </div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <lucide_react_1.Clock className="h-3 w-3" />
                                  {level.approval_timeout_hours}h
                                </div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <badge_1.Badge
                                  className={(0, utils_1.cn)("text-xs", statusInfo.color)}
                                >
                                  {statusInfo.label}
                                </badge_1.Badge>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <div className="flex items-center gap-1">
                                  <button_1.Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={function () {
                                      setEditingLevel(level);
                                      setShowLevelForm(true);
                                    }}
                                  >
                                    <lucide_react_1.Edit className="h-3 w-3" />
                                  </button_1.Button>
                                  <button_1.Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={function () {
                                      return handleDeleteLevel(level.id);
                                    }}
                                  >
                                    <lucide_react_1.Trash2 className="h-3 w-3" />
                                  </button_1.Button>
                                </div>
                              </table_1.TableCell>
                            </table_1.TableRow>
                          );
                        })}
                      {approvalLevels.length === 0 && (
                        <table_1.TableRow>
                          <table_1.TableCell colSpan={7} className="h-24 text-center">
                            Nenhum nível de aprovação configurado.
                          </table_1.TableCell>
                        </table_1.TableRow>
                      )}
                    </table_1.TableBody>
                  </table_1.Table>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Usuários Aprovadores</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie usuários que podem aprovar contas a pagar
                  </p>
                </div>
                <button_1.Button
                  onClick={function () {
                    setEditingUser(null);
                    setShowUserForm(true);
                  }}
                  size="sm"
                >
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </button_1.Button>
              </div>

              {/* Users Table */}
              <card_1.Card>
                <card_1.CardContent className="p-0">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Usuário</table_1.TableHead>
                        <table_1.TableHead>Nível</table_1.TableHead>
                        <table_1.TableHead>Limite</table_1.TableHead>
                        <table_1.TableHead>Função</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead className="w-[100px]">Ações</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {approvalUsers.map(function (user) {
                        var _a;
                        var level = approvalLevels.find(function (l) {
                          return l.id === user.approval_level_id;
                        });
                        var RoleIcon = getRoleIcon(user.role);
                        return (
                          <table_1.TableRow key={user.id}>
                            <table_1.TableCell>
                              <div>
                                <p className="font-medium">{user.user_name}</p>
                                <p className="text-xs text-muted-foreground">{user.user_email}</p>
                                {user.department && (
                                  <p className="text-xs text-blue-600">{user.department}</p>
                                )}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                  {(level === null || level === void 0
                                    ? void 0
                                    : level.level_order) || "?"}
                                </div>
                                <span className="text-sm">
                                  {(level === null || level === void 0
                                    ? void 0
                                    : level.level_name) || "Nível não encontrado"}
                                </span>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <span className="text-sm">{formatCurrency(user.spending_limit)}</span>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-3 w-3" />
                                <span className="text-sm capitalize">
                                  {(_a = userRoles.find(function (r) {
                                    return r.value === user.role;
                                  })) === null || _a === void 0
                                    ? void 0
                                    : _a.label}
                                </span>
                                {user.can_override && (
                                  <badge_1.Badge variant="outline" className="text-xs">
                                    Override
                                  </badge_1.Badge>
                                )}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <badge_1.Badge
                                className={(0, utils_1.cn)(
                                  "text-xs",
                                  user.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800",
                                )}
                              >
                                {user.is_active ? "Ativo" : "Inativo"}
                              </badge_1.Badge>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center gap-1">
                                <button_1.Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={function () {
                                    setEditingUser(user);
                                    setShowUserForm(true);
                                  }}
                                >
                                  <lucide_react_1.Edit className="h-3 w-3" />
                                </button_1.Button>
                                <button_1.Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={function () {
                                    return handleDeleteUser(user.id);
                                  }}
                                >
                                  <lucide_react_1.Trash2 className="h-3 w-3" />
                                </button_1.Button>
                              </div>
                            </table_1.TableCell>
                          </table_1.TableRow>
                        );
                      })}
                      {approvalUsers.length === 0 && (
                        <table_1.TableRow>
                          <table_1.TableCell colSpan={6} className="h-24 text-center">
                            Nenhum usuário aprovador configurado.
                          </table_1.TableCell>
                        </table_1.TableRow>
                      )}
                    </table_1.TableBody>
                  </table_1.Table>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          )}
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button
            type="button"
            variant="outline"
            onClick={function () {
              return onOpenChange(false);
            }}
          >
            Cancelar
          </button_1.Button>
          <button_1.Button onClick={handleSaveHierarchy} disabled={loading}>
            {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Salvando..." : "Salvar Hierarquia"}
          </button_1.Button>
        </dialog_1.DialogFooter>

        {/* Level Form Modal */}
        <LevelFormModal
          open={showLevelForm}
          onOpenChange={setShowLevelForm}
          level={editingLevel}
          onSave={handleSaveLevel}
          loading={loading}
        />

        {/* User Form Modal */}
        <UserFormModal
          open={showUserForm}
          onOpenChange={setShowUserForm}
          user={editingUser}
          approvalLevels={approvalLevels}
          onSave={handleSaveUser}
          loading={loading}
        />
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
function LevelFormModal(_a) {
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    level = _a.level,
    onSave = _a.onSave,
    loading = _a.loading;
  var _b = (0, react_1.useState)({
      level_order: 1,
      level_name: "",
      min_amount: 0,
      max_amount: null,
      required_approvers: 1,
      approval_timeout_hours: 24,
      can_be_skipped: false,
      auto_approve_below: null,
      description: "",
    }),
    formData = _b[0],
    setFormData = _b[1];
  (0, react_1.useEffect)(
    function () {
      if (level) {
        setFormData(level);
      } else {
        setFormData({
          level_order: 1,
          level_name: "",
          min_amount: 0,
          max_amount: null,
          required_approvers: 1,
          approval_timeout_hours: 24,
          can_be_skipped: false,
          auto_approve_below: null,
          description: "",
        });
      }
    },
    [level, open],
  );
  var handleSubmit = function (e) {
    e.preventDefault();
    onSave(formData);
  };
  var updateField = function (field, value) {
    setFormData(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-2xl">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {level ? "Editar Nível de Aprovação" : "Novo Nível de Aprovação"}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure os parâmetros deste nível de aprovação
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="level_order">Ordem do Nível *</label_1.Label>
              <input_1.Input
                id="level_order"
                type="number"
                min="1"
                value={formData.level_order || ""}
                onChange={function (e) {
                  return updateField("level_order", parseInt(e.target.value) || 1);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="level_name">Nome do Nível *</label_1.Label>
              <input_1.Input
                id="level_name"
                value={formData.level_name || ""}
                onChange={function (e) {
                  return updateField("level_name", e.target.value);
                }}
                placeholder="Ex: Supervisor Direto"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="min_amount">Valor Mínimo (R$) *</label_1.Label>
              <input_1.Input
                id="min_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_amount || ""}
                onChange={function (e) {
                  return updateField("min_amount", parseFloat(e.target.value) || 0);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="max_amount">Valor Máximo (R$)</label_1.Label>
              <input_1.Input
                id="max_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.max_amount || ""}
                onChange={function (e) {
                  return updateField(
                    "max_amount",
                    e.target.value ? parseFloat(e.target.value) : null,
                  );
                }}
                placeholder="Deixe vazio para sem limite"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="required_approvers">Aprovadores Necessários *</label_1.Label>
              <input_1.Input
                id="required_approvers"
                type="number"
                min="1"
                value={formData.required_approvers || ""}
                onChange={function (e) {
                  return updateField("required_approvers", parseInt(e.target.value) || 1);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="approval_timeout_hours">Timeout (horas) *</label_1.Label>
              <input_1.Input
                id="approval_timeout_hours"
                type="number"
                min="1"
                value={formData.approval_timeout_hours || ""}
                onChange={function (e) {
                  return updateField("approval_timeout_hours", parseInt(e.target.value) || 24);
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label_1.Label htmlFor="auto_approve_below">Auto-aprovar abaixo de (R$)</label_1.Label>
            <input_1.Input
              id="auto_approve_below"
              type="number"
              step="0.01"
              min="0"
              value={formData.auto_approve_below || ""}
              onChange={function (e) {
                return updateField(
                  "auto_approve_below",
                  e.target.value ? parseFloat(e.target.value) : null,
                );
              }}
              placeholder="Deixe vazio para desabilitar"
            />
          </div>

          <div className="space-y-2">
            <label_1.Label htmlFor="description">Descrição</label_1.Label>
            <textarea_1.Textarea
              id="description"
              value={formData.description || ""}
              onChange={function (e) {
                return updateField("description", e.target.value);
              }}
              placeholder="Descrição opcional do nível"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <switch_1.Switch
              id="can_be_skipped"
              checked={formData.can_be_skipped || false}
              onCheckedChange={function (checked) {
                return updateField("can_be_skipped", checked);
              }}
            />
            <label_1.Label htmlFor="can_be_skipped">
              Este nível pode ser pulado em situações especiais
            </label_1.Label>
          </div>

          <dialog_1.DialogFooter>
            <button_1.Button
              type="button"
              variant="outline"
              onClick={function () {
                return onOpenChange(false);
              }}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button type="submit" disabled={loading}>
              {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
function UserFormModal(_a) {
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    user = _a.user,
    approvalLevels = _a.approvalLevels,
    onSave = _a.onSave,
    loading = _a.loading;
  var _b = (0, react_1.useState)({
      user_name: "",
      user_email: "",
      approval_level_id: "",
      spending_limit: null,
      can_override: false,
      role: "approver",
      department: "",
    }),
    formData = _b[0],
    setFormData = _b[1];
  (0, react_1.useEffect)(
    function () {
      if (user) {
        setFormData(user);
      } else {
        setFormData({
          user_name: "",
          user_email: "",
          approval_level_id: "",
          spending_limit: null,
          can_override: false,
          role: "approver",
          department: "",
        });
      }
    },
    [user, open],
  );
  var handleSubmit = function (e) {
    e.preventDefault();
    onSave(
      __assign(__assign({}, formData), { user_id: formData.user_id || "user_".concat(Date.now()) }),
    );
  };
  var updateField = function (field, value) {
    setFormData(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-2xl">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {user ? "Editar Usuário Aprovador" : "Novo Usuário Aprovador"}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure os dados e permissões deste usuário
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="user_name">Nome Completo *</label_1.Label>
              <input_1.Input
                id="user_name"
                value={formData.user_name || ""}
                onChange={function (e) {
                  return updateField("user_name", e.target.value);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="user_email">E-mail *</label_1.Label>
              <input_1.Input
                id="user_email"
                type="email"
                value={formData.user_email || ""}
                onChange={function (e) {
                  return updateField("user_email", e.target.value);
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="approval_level_id">Nível de Aprovação *</label_1.Label>
              <select_1.Select
                value={formData.approval_level_id || ""}
                onValueChange={function (value) {
                  return updateField("approval_level_id", value);
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione um nível" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {approvalLevels.map(function (level) {
                    return (
                      <select_1.SelectItem key={level.id} value={level.id}>
                        Nível {level.level_order} - {level.level_name}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="role">Função *</label_1.Label>
              <select_1.Select
                value={formData.role || ""}
                onValueChange={function (value) {
                  return updateField("role", value);
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione a função" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {userRoles.map(function (role) {
                    return (
                      <select_1.SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="h-4 w-4" />
                          {role.label}
                        </div>
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="spending_limit">Limite de Gastos (R$)</label_1.Label>
              <input_1.Input
                id="spending_limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.spending_limit || ""}
                onChange={function (e) {
                  return updateField(
                    "spending_limit",
                    e.target.value ? parseFloat(e.target.value) : null,
                  );
                }}
                placeholder="Deixe vazio para sem limite"
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="department">Departamento</label_1.Label>
              <input_1.Input
                id="department"
                value={formData.department || ""}
                onChange={function (e) {
                  return updateField("department", e.target.value);
                }}
                placeholder="Ex: Financeiro, Operações"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <switch_1.Switch
              id="can_override"
              checked={formData.can_override || false}
              onCheckedChange={function (checked) {
                return updateField("can_override", checked);
              }}
            />
            <label_1.Label htmlFor="can_override">
              Pode substituir/anular aprovações de outros usuários
            </label_1.Label>
          </div>

          <dialog_1.DialogFooter>
            <button_1.Button
              type="button"
              variant="outline"
              onClick={function () {
                return onOpenChange(false);
              }}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button type="submit" disabled={loading}>
              {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
