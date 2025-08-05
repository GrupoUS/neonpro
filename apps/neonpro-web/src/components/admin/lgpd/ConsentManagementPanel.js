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
exports.ConsentManagementPanel = ConsentManagementPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function ConsentManagementPanel(_a) {
  var className = _a.className;
  var _b = (0, useLGPD_1.useConsentManagement)(),
    consents = _b.consents,
    purposes = _b.purposes,
    isLoading = _b.isLoading,
    error = _b.error,
    createPurpose = _b.createPurpose,
    updatePurpose = _b.updatePurpose,
    deletePurpose = _b.deletePurpose,
    updateConsent = _b.updateConsent,
    withdrawConsent = _b.withdrawConsent,
    exportConsents = _b.exportConsents,
    refreshData = _b.refreshData;
  var _c = (0, react_1.useState)(""),
    searchTerm = _c[0],
    setSearchTerm = _c[1];
  var _d = (0, react_1.useState)("all"),
    statusFilter = _d[0],
    setStatusFilter = _d[1];
  var _e = (0, react_1.useState)("all"),
    purposeFilter = _e[0],
    setPurposeFilter = _e[1];
  var _f = (0, react_1.useState)(false),
    isCreatePurposeOpen = _f[0],
    setIsCreatePurposeOpen = _f[1];
  var _g = (0, react_1.useState)(null),
    editingPurpose = _g[0],
    setEditingPurpose = _g[1];
  var _h = (0, react_1.useState)({
      name: "",
      description: "",
      required: false,
      retention_period: 365,
    }),
    newPurpose = _h[0],
    setNewPurpose = _h[1];
  // Filtrar consentimentos
  var filteredConsents =
    (consents === null || consents === void 0
      ? void 0
      : consents.filter((consent) => {
          var _a, _b;
          var matchesSearch =
            ((_a = consent.user_email) === null || _a === void 0
              ? void 0
              : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_b = consent.purpose_name) === null || _b === void 0
              ? void 0
              : _b.toLowerCase().includes(searchTerm.toLowerCase()));
          var matchesStatus = statusFilter === "all" || consent.status === statusFilter;
          var matchesPurpose = purposeFilter === "all" || consent.purpose_id === purposeFilter;
          return matchesSearch && matchesStatus && matchesPurpose;
        })) || [];
  var getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <badge_1.Badge variant="default">
            <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </badge_1.Badge>
        );
      case "expired":
        return (
          <badge_1.Badge variant="secondary">
            <lucide_react_1.Clock className="h-3 w-3 mr-1" />
            Expirado
          </badge_1.Badge>
        );
      case "withdrawn":
        return (
          <badge_1.Badge variant="outline">
            <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
            Retirado
          </badge_1.Badge>
        );
      default:
        return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
    }
  };
  var handleCreatePurpose = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, createPurpose(newPurpose)];
          case 1:
            _a.sent();
            setIsCreatePurposeOpen(false);
            setNewPurpose({ name: "", description: "", required: false, retention_period: 365 });
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao criar finalidade:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleUpdatePurpose = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!editingPurpose) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, updatePurpose(editingPurpose.id, editingPurpose)];
          case 2:
            _a.sent();
            setEditingPurpose(null);
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Erro ao atualizar finalidade:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleWithdrawConsent = (consentId) =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, withdrawConsent(consentId)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Erro ao retirar consentimento:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando consentimentos...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>
          Erro ao carregar consentimentos: {error}
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Gerenciamento de Consentimentos</h3>
          <p className="text-muted-foreground">
            Gerencie finalidades e consentimentos dos usuários
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={refreshData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" onClick={exportConsents}>
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
        </div>
      </div>

      <tabs_1.Tabs defaultValue="consents" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="consents">Consentimentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="purposes">Finalidades</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="consents" className="space-y-4">
          {/* Filtros */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Filtros</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label_1.Label htmlFor="search">Buscar</label_1.Label>
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input_1.Input
                      id="search"
                      placeholder="Email ou finalidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label_1.Label htmlFor="status">Status</label_1.Label>
                  <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todos os status" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                      <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
                      <select_1.SelectItem value="expired">Expirado</select_1.SelectItem>
                      <select_1.SelectItem value="withdrawn">Retirado</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="purpose">Finalidade</label_1.Label>
                  <select_1.Select value={purposeFilter} onValueChange={setPurposeFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todas as finalidades" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                      {purposes === null || purposes === void 0
                        ? void 0
                        : purposes.map((purpose) => (
                            <select_1.SelectItem key={purpose.id} value={purpose.id}>
                              {purpose.name}
                            </select_1.SelectItem>
                          ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-end">
                  <button_1.Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPurposeFilter("all");
                    }}
                  >
                    <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Tabela de consentimentos */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Consentimentos ({filteredConsents.length})</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Usuário</table_1.TableHead>
                    <table_1.TableHead>Finalidade</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Data de Consentimento</table_1.TableHead>
                    <table_1.TableHead>Expiração</table_1.TableHead>
                    <table_1.TableHead>Versão</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredConsents.map((consent) => (
                    <table_1.TableRow key={consent.id}>
                      <table_1.TableCell>
                        <div>
                          <div className="font-medium">{consent.user_email}</div>
                          <div className="text-sm text-muted-foreground">
                            IP: {consent.ip_address}
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div>
                          <div className="font-medium">{consent.purpose_name}</div>
                          {consent.purpose_required && (
                            <badge_1.Badge variant="outline" className="text-xs">
                              Obrigatório
                            </badge_1.Badge>
                          )}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>{getStatusBadge(consent.status)}</table_1.TableCell>
                      <table_1.TableCell>
                        {new Date(consent.granted_at).toLocaleDateString("pt-BR")}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {consent.expires_at
                          ? <div
                              className={"".concat(
                                new Date(consent.expires_at) < new Date()
                                  ? "text-red-600"
                                  : new Date(consent.expires_at) <
                                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                    ? "text-yellow-600"
                                    : "text-green-600",
                              )}
                            >
                              {new Date(consent.expires_at).toLocaleDateString("pt-BR")}
                            </div>
                          : <span className="text-muted-foreground">Sem expiração</span>}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">v{consent.version}</badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex gap-2">
                          {consent.status === "active" && (
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWithdrawConsent(consent.id)}
                            >
                              <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
                              Retirar
                            </button_1.Button>
                          )}
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>

              {filteredConsents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum consentimento encontrado
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="purposes" className="space-y-4">
          {/* Header das finalidades */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium">Finalidades de Consentimento</h4>
            <dialog_1.Dialog open={isCreatePurposeOpen} onOpenChange={setIsCreatePurposeOpen}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Nova Finalidade
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Criar Nova Finalidade</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Defina uma nova finalidade para coleta de consentimentos
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label_1.Label htmlFor="name">Nome</label_1.Label>
                    <input_1.Input
                      id="name"
                      value={newPurpose.name}
                      onChange={(e) =>
                        setNewPurpose(__assign(__assign({}, newPurpose), { name: e.target.value }))
                      }
                      placeholder="Ex: Marketing por email"
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="description">Descrição</label_1.Label>
                    <textarea_1.Textarea
                      id="description"
                      value={newPurpose.description}
                      onChange={(e) =>
                        setNewPurpose(
                          __assign(__assign({}, newPurpose), { description: e.target.value }),
                        )
                      }
                      placeholder="Descreva como os dados serão utilizados..."
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="retention">Período de Retenção (dias)</label_1.Label>
                    <input_1.Input
                      id="retention"
                      type="number"
                      value={newPurpose.retention_period}
                      onChange={(e) =>
                        setNewPurpose(
                          __assign(__assign({}, newPurpose), {
                            retention_period: parseInt(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id="required"
                      checked={newPurpose.required}
                      onCheckedChange={(checked) =>
                        setNewPurpose(__assign(__assign({}, newPurpose), { required: !!checked }))
                      }
                    />
                    <label_1.Label htmlFor="required">Consentimento obrigatório</label_1.Label>
                  </div>
                </div>
                <dialog_1.DialogFooter>
                  <button_1.Button variant="outline" onClick={() => setIsCreatePurposeOpen(false)}>
                    Cancelar
                  </button_1.Button>
                  <button_1.Button onClick={handleCreatePurpose}>Criar Finalidade</button_1.Button>
                </dialog_1.DialogFooter>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>

          {/* Lista de finalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purposes === null || purposes === void 0
              ? void 0
              : purposes.map((purpose) => (
                  <card_1.Card key={purpose.id}>
                    <card_1.CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <card_1.CardTitle className="text-base">{purpose.name}</card_1.CardTitle>
                          <card_1.CardDescription>{purpose.description}</card_1.CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <button_1.Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPurpose(purpose)}
                          >
                            <lucide_react_1.Edit className="h-3 w-3" />
                          </button_1.Button>
                          <button_1.Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePurpose(purpose.id)}
                          >
                            <lucide_react_1.Trash2 className="h-3 w-3" />
                          </button_1.Button>
                        </div>
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Status:</span>
                          <badge_1.Badge variant={purpose.active ? "default" : "secondary"}>
                            {purpose.active ? "Ativo" : "Inativo"}
                          </badge_1.Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Obrigatório:</span>
                          <badge_1.Badge variant={purpose.required ? "default" : "outline"}>
                            {purpose.required ? "Sim" : "Não"}
                          </badge_1.Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Retenção:</span>
                          <span>{purpose.retention_period} dias</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Versão:</span>
                          <badge_1.Badge variant="outline">v{purpose.version}</badge_1.Badge>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                ))}
          </div>

          {/* Dialog de edição */}
          <dialog_1.Dialog open={!!editingPurpose} onOpenChange={() => setEditingPurpose(null)}>
            <dialog_1.DialogContent>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Editar Finalidade</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Modifique os detalhes da finalidade
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              {editingPurpose && (
                <div className="space-y-4">
                  <div>
                    <label_1.Label htmlFor="edit-name">Nome</label_1.Label>
                    <input_1.Input
                      id="edit-name"
                      value={editingPurpose.name}
                      onChange={(e) =>
                        setEditingPurpose(
                          __assign(__assign({}, editingPurpose), { name: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="edit-description">Descrição</label_1.Label>
                    <textarea_1.Textarea
                      id="edit-description"
                      value={editingPurpose.description}
                      onChange={(e) =>
                        setEditingPurpose(
                          __assign(__assign({}, editingPurpose), { description: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="edit-retention">
                      Período de Retenção (dias)
                    </label_1.Label>
                    <input_1.Input
                      id="edit-retention"
                      type="number"
                      value={editingPurpose.retention_period}
                      onChange={(e) =>
                        setEditingPurpose(
                          __assign(__assign({}, editingPurpose), {
                            retention_period: parseInt(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id="edit-required"
                      checked={editingPurpose.required}
                      onCheckedChange={(checked) =>
                        setEditingPurpose(
                          __assign(__assign({}, editingPurpose), { required: !!checked }),
                        )
                      }
                    />
                    <label_1.Label htmlFor="edit-required">Consentimento obrigatório</label_1.Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id="edit-active"
                      checked={editingPurpose.active}
                      onCheckedChange={(checked) =>
                        setEditingPurpose(
                          __assign(__assign({}, editingPurpose), { active: !!checked }),
                        )
                      }
                    />
                    <label_1.Label htmlFor="edit-active">Finalidade ativa</label_1.Label>
                  </div>
                </div>
              )}
              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={() => setEditingPurpose(null)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleUpdatePurpose}>Salvar Alterações</button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
