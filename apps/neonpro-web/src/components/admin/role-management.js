// Role Management Interface Component
// Story 1.2: Role-Based Permissions Enhancement
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
exports.RoleManagement = RoleManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var use_toast_1 = require("@/components/ui/use-toast");
var use_rbac_1 = require("@/hooks/use-rbac");
var client_1 = require("@/lib/supabase/client");
var permissions_1 = require("@/lib/auth/rbac/permissions");
var rbac_1 = require("@/types/rbac");
var lucide_react_1 = require("lucide-react");
function RoleManagement(_a) {
  var clinicId = _a.clinicId;
  var toast = (0, use_toast_1.useToast)().toast;
  var _b = (0, use_rbac_1.useRBAC)({ clinicId: clinicId }),
    hasPermission = _b.hasPermission,
    userRole = _b.userRole,
    rbacLoading = _b.isLoading;
  var supabase = (0, client_1.createClient)();
  // State
  var _c = (0, react_1.useState)([]),
    users = _c[0],
    setUsers = _c[1];
  var _d = (0, react_1.useState)([]),
    roles = _d[0],
    setRoles = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(""),
    searchTerm = _f[0],
    setSearchTerm = _f[1];
  var _g = (0, react_1.useState)("all"),
    roleFilter = _g[0],
    setRoleFilter = _g[1];
  var _h = (0, react_1.useState)(false),
    showAssignDialog = _h[0],
    setShowAssignDialog = _h[1];
  var _j = (0, react_1.useState)(false),
    showCreateRoleDialog = _j[0],
    setShowCreateRoleDialog = _j[1];
  var _k = (0, react_1.useState)(null),
    selectedUser = _k[0],
    setSelectedUser = _k[1];
  var _l = (0, react_1.useState)({
      userId: "",
      roleId: "",
    }),
    assignmentForm = _l[0],
    setAssignmentForm = _l[1];
  // Check permissions
  var _m = (0, react_1.useState)(false),
    canManageRoles = _m[0],
    setCanManageRoles = _m[1];
  var _o = (0, react_1.useState)(false),
    canAssignRoles = _o[0],
    setCanAssignRoles = _o[1];
  var _p = (0, react_1.useState)(false),
    canViewUsers = _p[0],
    setCanViewUsers = _p[1];
  (0, react_1.useEffect)(() => {
    function checkPermissions() {
      return __awaiter(this, void 0, void 0, function () {
        var _a, manage, assign, view;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.all([
                  hasPermission("manage_roles"),
                  hasPermission("assign_roles"),
                  hasPermission("view_users"),
                ]),
              ];
            case 1:
              (_a = _b.sent()), (manage = _a[0]), (assign = _a[1]), (view = _a[2]);
              setCanManageRoles(manage);
              setCanAssignRoles(assign);
              setCanViewUsers(view);
              return [2 /*return*/];
          }
        });
      });
    }
    if (!rbacLoading) {
      checkPermissions();
    }
  }, [hasPermission, rbacLoading]);
  // Load data
  var loadUsers = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, error, usersWithRoles, error_1;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("user_role_assignments")
                  .select(
                    "\n          *,\n          user:users(id, email, full_name),\n          role:role_definitions(name, display_name)\n        ",
                  )
                  .eq("clinic_id", clinicId)
                  .order("assigned_at", { ascending: false }),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (error = _a.error);
              if (error) throw error;
              usersWithRoles = data.map((assignment) => ({
                id: assignment.user.id,
                email: assignment.user.email,
                full_name: assignment.user.full_name,
                role: assignment.role.name,
                role_id: assignment.role_id,
                assigned_at: assignment.assigned_at,
                assigned_by: assignment.assigned_by,
                is_active: assignment.is_active,
                expires_at: assignment.expires_at,
              }));
              setUsers(usersWithRoles);
              return [3 /*break*/, 3];
            case 2:
              error_1 = _b.sent();
              console.error("Error loading users:", error_1);
              toast({
                title: "Erro",
                description: "Falha ao carregar usuários",
                variant: "destructive",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [clinicId, supabase, toast],
  );
  var loadRoles = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_2;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase.from("role_definitions").select("*").order("hierarchy"),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (error = _a.error);
              if (error) throw error;
              setRoles(data);
              return [3 /*break*/, 3];
            case 2:
              error_2 = _b.sent();
              console.error("Error loading roles:", error_2);
              toast({
                title: "Erro",
                description: "Falha ao carregar funções",
                variant: "destructive",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, toast],
  );
  (0, react_1.useEffect)(() => {
    function loadData() {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              return [4 /*yield*/, Promise.all([loadUsers(), loadRoles()])];
            case 1:
              _a.sent();
              setIsLoading(false);
              return [2 /*return*/];
          }
        });
      });
    }
    if (canViewUsers) {
      loadData();
    }
  }, [canViewUsers, loadUsers, loadRoles]);
  // Handle role assignment
  var handleAssignRole = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!assignmentForm.userId || !assignmentForm.roleId) {
              toast({
                title: "Erro",
                description: "Selecione um usuário e uma função",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              permissions_1.rbacManager.assignRole(
                assignmentForm.userId,
                assignmentForm.roleId,
                clinicId,
                {
                  expiresAt: assignmentForm.expiresAt
                    ? new Date(assignmentForm.expiresAt)
                    : undefined,
                  notes: assignmentForm.notes,
                },
              ),
            ];
          case 2:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Função atribuída com sucesso",
            });
            setShowAssignDialog(false);
            setAssignmentForm({ userId: "", roleId: "" });
            return [4 /*yield*/, loadUsers()];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Error assigning role:", error_3);
            toast({
              title: "Erro",
              description: "Falha ao atribuir função",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Handle role removal
  var handleRemoveRole = (userId) =>
    __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, permissions_1.rbacManager.removeRole(userId, clinicId)];
          case 1:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Função removida com sucesso",
            });
            return [4 /*yield*/, loadUsers()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Error removing role:", error_4);
            toast({
              title: "Erro",
              description: "Falha ao remover função",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Filter users
  var filteredUsers = users.filter((user) => {
    var matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    var matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  // Get role badge variant
  var getRoleBadgeVariant = (role) => {
    switch (role) {
      case "owner":
        return "destructive";
      case "manager":
        return "default";
      case "staff":
        return "secondary";
      case "patient":
        return "outline";
      default:
        return "outline";
    }
  };
  if (rbacLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!canViewUsers) {
    return (
      <alert_1.Alert>
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>
          Você não tem permissão para visualizar usuários.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Funções</h2>
          <p className="text-muted-foreground">
            Gerencie funções e permissões dos usuários da clínica
          </p>
        </div>

        {canAssignRoles && (
          <dialog_1.Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                Atribuir Função
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Atribuir Função</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Selecione um usuário e uma função para atribuir
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <div className="space-y-4">
                <div>
                  <label_1.Label htmlFor="user-select">Usuário</label_1.Label>
                  <select_1.Select
                    value={assignmentForm.userId}
                    onValueChange={(value) =>
                      setAssignmentForm((prev) => __assign(__assign({}, prev), { userId: value }))
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um usuário" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {users.map((user) => (
                        <select_1.SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="role-select">Função</label_1.Label>
                  <select_1.Select
                    value={assignmentForm.roleId}
                    onValueChange={(value) =>
                      setAssignmentForm((prev) => __assign(__assign({}, prev), { roleId: value }))
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione uma função" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {roles.map((role) => (
                        <select_1.SelectItem key={role.id} value={role.id}>
                          {role.display_name}
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="expires-at">Data de Expiração (Opcional)</label_1.Label>
                  <input_1.Input
                    id="expires-at"
                    type="datetime-local"
                    value={assignmentForm.expiresAt || ""}
                    onChange={(e) =>
                      setAssignmentForm((prev) =>
                        __assign(__assign({}, prev), { expiresAt: e.target.value }),
                      )
                    }
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="notes">Notas (Opcional)</label_1.Label>
                  <input_1.Input
                    id="notes"
                    placeholder="Notas sobre a atribuição"
                    value={assignmentForm.notes || ""}
                    onChange={(e) =>
                      setAssignmentForm((prev) =>
                        __assign(__assign({}, prev), { notes: e.target.value }),
                      )
                    }
                  />
                </div>
              </div>

              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleAssignRole}>Atribuir</button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        )}
      </div>

      <tabs_1.Tabs defaultValue="users" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="users">Usuários</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="roles">Funções</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="permissions">Permissões</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <select_1.Select value={roleFilter} onValueChange={setRoleFilter}>
              <select_1.SelectTrigger className="w-48">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas as funções</select_1.SelectItem>
                <select_1.SelectItem value="owner">Proprietário</select_1.SelectItem>
                <select_1.SelectItem value="manager">Gerente</select_1.SelectItem>
                <select_1.SelectItem value="staff">Funcionário</select_1.SelectItem>
                <select_1.SelectItem value="patient">Paciente</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Users Table */}
          <card_1.Card>
            <card_1.CardContent className="p-0">
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Usuário</table_1.TableHead>
                    <table_1.TableHead>Função</table_1.TableHead>
                    <table_1.TableHead>Atribuído em</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredUsers.map((user) => (
                    <table_1.TableRow key={user.id}>
                      <table_1.TableCell>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="text-sm">
                          {new Date(user.assigned_at).toLocaleDateString("pt-BR")}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          {user.is_active
                            ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
                            : <lucide_react_1.Clock className="h-4 w-4 text-yellow-500" />}
                          <span className="text-sm">{user.is_active ? "Ativo" : "Inativo"}</span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {canAssignRoles && (
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
                                onClick={() => setSelectedUser(user)}
                              >
                                <lucide_react_1.Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuItem
                                onClick={() => {
                                  setAssignmentForm({ userId: user.id, roleId: user.role_id });
                                  setShowAssignDialog(true);
                                }}
                              >
                                <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                                Editar Função
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuSeparator />
                              <dropdown_menu_1.DropdownMenuItem
                                onClick={() => handleRemoveRole(user.id)}
                                className="text-destructive"
                              >
                                <lucide_react_1.Trash2 className="mr-2 h-4 w-4" />
                                Remover Função
                              </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                          </dropdown_menu_1.DropdownMenu>
                        )}
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="roles">
          <RoleDefinitionsTab
            roles={roles}
            canManageRoles={canManageRoles}
            onRolesChange={loadRoles}
            clinicId={clinicId}
          />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="permissions">
          <PermissionsTab roles={roles} />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
function RoleDefinitionsTab(_a) {
  var roles = _a.roles,
    canManageRoles = _a.canManageRoles,
    onRolesChange = _a.onRolesChange,
    clinicId = _a.clinicId;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <card_1.Card key={role.id}>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center justify-between">
                {role.display_name}
                <badge_1.Badge variant="outline">Nível {role.hierarchy}</badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription>{role.description}</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Permissões:</strong> {role.permissions.length}
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <badge_1.Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </badge_1.Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <badge_1.Badge variant="secondary" className="text-xs">
                      +{role.permissions.length - 3} mais
                    </badge_1.Badge>
                  )}
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        ))}
      </div>
    </div>
  );
}
function PermissionsTab(_a) {
  var roles = _a.roles;
  return (
    <div className="space-y-6">
      {Object.entries(rbac_1.PERMISSION_GROUPS).map((_a) => {
        var groupName = _a[0],
          permissions = _a[1];
        return (
          <card_1.Card key={groupName}>
            <card_1.CardHeader>
              <card_1.CardTitle className="capitalize">
                {groupName.replace("_", " ")}
              </card_1.CardTitle>
              <card_1.CardDescription>
                Permissões relacionadas a {groupName.replace("_", " ").toLowerCase()}
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{permission}</div>
                      <div className="text-sm text-muted-foreground">
                        Permite {permission.replace("_", " ").toLowerCase()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {roles.map((role) => (
                        <badge_1.Badge
                          key={role.id}
                          variant={role.permissions.includes(permission) ? "default" : "outline"}
                          className="text-xs"
                        >
                          {role.name}
                        </badge_1.Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        );
      })}
    </div>
  );
}
