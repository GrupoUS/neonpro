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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var BackupScheduler = () => {
  var _a = (0, react_1.useState)([]),
    configs = _a[0],
    setConfigs = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(false),
    showNewDialog = _c[0],
    setShowNewDialog = _c[1];
  var _d = (0, react_1.useState)({
      name: "",
      description: "",
      enabled: true,
      type: "FULL",
      schedule_frequency: "DAILY",
      schedule_time: "02:00",
      storage_provider: "LOCAL",
      retention_daily: 30,
      priority: "MEDIUM",
      notification_email: "",
    }),
    newConfig = _d[0],
    setNewConfig = _d[1];
  (0, react_1.useEffect)(() => {
    loadConfigs();
  }, []);
  var loadConfigs = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/backup/configs")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setConfigs(data.data || []);
            return [3 /*break*/, 4];
          case 3:
            sonner_1.toast.error("Erro ao carregar configurações de backup");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Erro ao carregar configurações:", error_1);
            sonner_1.toast.error("Erro ao carregar configurações de backup");
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  var handleCreateConfig = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, errorData, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/backup/configs", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newConfig),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 2];
            sonner_1.toast.success("Configuração de backup criada com sucesso");
            setShowNewDialog(false);
            setNewConfig({
              name: "",
              description: "",
              enabled: true,
              type: "FULL",
              schedule_frequency: "DAILY",
              schedule_time: "02:00",
              storage_provider: "LOCAL",
              retention_daily: 30,
              priority: "MEDIUM",
              notification_email: "",
            });
            loadConfigs();
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            sonner_1.toast.error(errorData.error || "Erro ao criar configuração");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Erro ao criar configuração:", error_2);
            sonner_1.toast.error("Erro ao criar configuração de backup");
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var handleToggleConfig = (id, enabled) =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/backup/configs/".concat(id), {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ enabled: enabled }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success(
                "Configura\u00E7\u00E3o ".concat(
                  enabled ? "ativada" : "desativada",
                  " com sucesso",
                ),
              );
              loadConfigs();
            } else {
              sonner_1.toast.error("Erro ao atualizar configuração");
            }
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Erro ao atualizar configuração:", error_3);
            sonner_1.toast.error("Erro ao atualizar configuração");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
      case "PAUSED":
        return <lucide_react_1.Pause className="h-4 w-4 text-yellow-500" />;
      case "ERROR":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <lucide_react_1.Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  var getTypeIcon = (type) => {
    switch (type) {
      case "DATABASE":
        return <lucide_react_1.Database className="h-4 w-4" />;
      case "FILES":
        return <lucide_react_1.HardDrive className="h-4 w-4" />;
      default:
        return <lucide_react_1.Shield className="h-4 w-4" />;
    }
  };
  var getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "secondary";
      case "MEDIUM":
        return "outline";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Agendador de Backup</h2>
          <p className="text-muted-foreground">
            Configure e gerencie agendamentos automáticos de backup
          </p>
        </div>
        <dialog_1.Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button>
              <lucide_react_1.Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-2xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Nova Configuração de Backup</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Configure um novo agendamento automático de backup
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="name">Nome</label_1.Label>
                <input_1.Input
                  id="name"
                  value={newConfig.name}
                  onChange={(e) =>
                    setNewConfig(__assign(__assign({}, newConfig), { name: e.target.value }))
                  }
                  placeholder="Ex: Backup Diário Completo"
                />
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="type">Tipo de Backup</label_1.Label>
                <select_1.Select
                  value={newConfig.type}
                  onValueChange={(value) =>
                    setNewConfig(__assign(__assign({}, newConfig), { type: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="FULL">Completo</select_1.SelectItem>
                    <select_1.SelectItem value="INCREMENTAL">Incremental</select_1.SelectItem>
                    <select_1.SelectItem value="DIFFERENTIAL">Diferencial</select_1.SelectItem>
                    <select_1.SelectItem value="DATABASE">Banco de Dados</select_1.SelectItem>
                    <select_1.SelectItem value="FILES">Arquivos</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="frequency">Frequência</label_1.Label>
                <select_1.Select
                  value={newConfig.schedule_frequency}
                  onValueChange={(value) =>
                    setNewConfig(__assign(__assign({}, newConfig), { schedule_frequency: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="HOURLY">A cada hora</select_1.SelectItem>
                    <select_1.SelectItem value="DAILY">Diário</select_1.SelectItem>
                    <select_1.SelectItem value="WEEKLY">Semanal</select_1.SelectItem>
                    <select_1.SelectItem value="MONTHLY">Mensal</select_1.SelectItem>
                    <select_1.SelectItem value="CUSTOM">Personalizado</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="time">Horário</label_1.Label>
                <input_1.Input
                  id="time"
                  type="time"
                  value={newConfig.schedule_time}
                  onChange={(e) =>
                    setNewConfig(
                      __assign(__assign({}, newConfig), { schedule_time: e.target.value }),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="provider">Armazenamento</label_1.Label>
                <select_1.Select
                  value={newConfig.storage_provider}
                  onValueChange={(value) =>
                    setNewConfig(__assign(__assign({}, newConfig), { storage_provider: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="LOCAL">Local</select_1.SelectItem>
                    <select_1.SelectItem value="S3">AWS S3</select_1.SelectItem>
                    <select_1.SelectItem value="GCS">Google Cloud</select_1.SelectItem>
                    <select_1.SelectItem value="AZURE">Azure Blob</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="retention">Retenção (dias)</label_1.Label>
                <input_1.Input
                  id="retention"
                  type="number"
                  min="1"
                  max="365"
                  value={newConfig.retention_daily}
                  onChange={(e) =>
                    setNewConfig(
                      __assign(__assign({}, newConfig), {
                        retention_daily: parseInt(e.target.value),
                      }),
                    )
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label_1.Label htmlFor="description">Descrição</label_1.Label>
                <textarea_1.Textarea
                  id="description"
                  value={newConfig.description}
                  onChange={(e) =>
                    setNewConfig(__assign(__assign({}, newConfig), { description: e.target.value }))
                  }
                  placeholder="Descrição opcional da configuração..."
                />
              </div>
            </div>
            <dialog_1.DialogFooter>
              <button_1.Button variant="outline" onClick={() => setShowNewDialog(false)}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={handleCreateConfig}>Criar Configuração</button_1.Button>
            </dialog_1.DialogFooter>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {loading
        ? <div className="text-center py-8">
            <p>Carregando configurações...</p>
          </div>
        : <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Configurações de Backup</card_1.CardTitle>
              <card_1.CardDescription>
                {configs.length} configuração(ões) de backup ativa(s)
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {configs.length === 0
                ? <div className="text-center py-8">
                    <lucide_react_1.Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma configuração de backup encontrada
                    </p>
                  </div>
                : <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Nome</table_1.TableHead>
                        <table_1.TableHead>Tipo</table_1.TableHead>
                        <table_1.TableHead>Frequência</table_1.TableHead>
                        <table_1.TableHead>Próximo Backup</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead>Prioridade</table_1.TableHead>
                        <table_1.TableHead>Ações</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {configs.map((config) => (
                        <table_1.TableRow key={config.id}>
                          <table_1.TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(config.type)}
                              <div>
                                <div className="font-medium">{config.name}</div>
                                {config.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {config.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <badge_1.Badge variant="outline">{config.type}</badge_1.Badge>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {config.schedule_frequency}
                            {config.schedule_time && (
                              <div className="text-sm text-muted-foreground">
                                às {config.schedule_time}
                              </div>
                            )}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {config.next_backup
                              ? <div className="text-sm">
                                  {(0, utils_1.formatDate)(new Date(config.next_backup))}
                                  <div className="text-muted-foreground">
                                    {(0, utils_1.formatTime)(new Date(config.next_backup))}
                                  </div>
                                </div>
                              : <span className="text-muted-foreground">-</span>}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(config.status)}
                              <span className="text-sm">{config.status}</span>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <badge_1.Badge variant={getPriorityColor(config.priority)}>
                              {config.priority}
                            </badge_1.Badge>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center space-x-2">
                              <switch_1.Switch
                                checked={config.enabled}
                                onCheckedChange={(checked) =>
                                  handleToggleConfig(config.id, checked)
                                }
                              />
                              <button_1.Button variant="ghost" size="sm">
                                <lucide_react_1.Settings className="h-4 w-4" />
                              </button_1.Button>
                            </div>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      ))}
                    </table_1.TableBody>
                  </table_1.Table>}
            </card_1.CardContent>
          </card_1.Card>}
    </div>
  );
};
exports.default = BackupScheduler;
