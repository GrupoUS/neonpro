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
exports.StockOutputManagement = StockOutputManagement;
/**
 * Story 11.3: Stock Output Management Component
 * Comprehensive stock output creation and management interface
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var icons_1 = require("@/components/ui/icons");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var inventory_1 = require("@/lib/inventory");
var use_toast_1 = require("@/hooks/use-toast");
function StockOutputManagement(_a) {
  var onRefresh = _a.onRefresh,
    className = _a.className;
  var _b = (0, react_1.useState)([]),
    stockOutputs = _b[0],
    setStockOutputs = _b[1];
  var _c = (0, react_1.useState)([]),
    pendingRequests = _c[0],
    setPendingRequests = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(false),
    isCreating = _e[0],
    setIsCreating = _e[1];
  var _f = (0, react_1.useState)(false),
    showCreateDialog = _f[0],
    setShowCreateDialog = _f[1];
  var _g = (0, react_1.useState)({
      centro_custo_id: "",
      solicitante: "",
      motivo: "",
      urgente: false,
      items: [],
    }),
    newOutputData = _g[0],
    setNewOutputData = _g[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var stockOutputManager = new inventory_1.StockOutputManager();
  (0, react_1.useEffect)(() => {
    loadStockOutputs();
  }, []);
  var loadStockOutputs = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, outputs, outputsError, _b, requests, requestsError, error_1, errorMessage;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            return [
              4 /*yield*/,
              stockOutputManager.getStockOutputs({
                limit: 50,
                status: undefined,
              }),
            ];
          case 1:
            (_a = _c.sent()), (outputs = _a.data), (outputsError = _a.error);
            if (outputsError) {
              throw new Error(outputsError);
            }
            setStockOutputs(outputs || []);
            return [
              4 /*yield*/,
              stockOutputManager.getStockRequests({
                status: "pendente",
              }),
            ];
          case 2:
            (_b = _c.sent()), (requests = _b.data), (requestsError = _b.error);
            if (requestsError) {
              throw new Error(requestsError);
            }
            setPendingRequests(requests || []);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _c.sent();
            errorMessage =
              error_1 instanceof Error ? error_1.message : "Erro ao carregar saídas de estoque";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleCreateStockOutput = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, output, error, error_2, errorMessage;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setIsCreating(true);
            if (
              !newOutputData.centro_custo_id ||
              !newOutputData.solicitante ||
              newOutputData.items.length === 0
            ) {
              toast({
                title: "Erro de Validação",
                description: "Preencha todos os campos obrigatórios e adicione pelo menos um item",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            return [
              4 /*yield*/,
              stockOutputManager.createStockOutput({
                centro_custo_id: newOutputData.centro_custo_id,
                solicitante: newOutputData.solicitante,
                motivo: newOutputData.motivo,
                urgente: newOutputData.urgente,
                items: newOutputData.items.map((item) => ({
                  produto_id: item.produto_id,
                  quantidade_solicitada: item.quantidade_solicitada,
                  observacoes: item.observacoes,
                })),
              }),
            ];
          case 1:
            (_a = _b.sent()), (output = _a.data), (error = _a.error);
            if (error) {
              throw new Error(error);
            }
            toast({
              title: "Sucesso",
              description: "Sa\u00EDda de estoque ".concat(
                output === null || output === void 0 ? void 0 : output.numero_saida,
                " criada com sucesso",
              ),
            });
            setShowCreateDialog(false);
            setNewOutputData({
              centro_custo_id: "",
              solicitante: "",
              motivo: "",
              urgente: false,
              items: [],
            });
            loadStockOutputs();
            onRefresh();
            return [3 /*break*/, 4];
          case 2:
            error_2 = _b.sent();
            errorMessage =
              error_2 instanceof Error ? error_2.message : "Erro ao criar saída de estoque";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setIsCreating(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleApproveRequest = (requestId) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, success, error, error_3, errorMessage;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, stockOutputManager.approveStockRequest(requestId, "Sistema")];
          case 1:
            (_a = _b.sent()), (success = _a.success), (error = _a.error);
            if (!success) {
              throw new Error(error || "Erro ao aprovar solicitação");
            }
            toast({
              title: "Sucesso",
              description: "Solicitação aprovada com sucesso",
            });
            loadStockOutputs();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _b.sent();
            errorMessage =
              error_3 instanceof Error ? error_3.message : "Erro ao aprovar solicitação";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var addItemToOutput = () => {
    setNewOutputData((prev) =>
      __assign(__assign({}, prev), {
        items: __spreadArray(
          __spreadArray([], prev.items, true),
          [
            {
              produto_id: "",
              nome_produto: "",
              quantidade_solicitada: 0,
              observacoes: "",
            },
          ],
          false,
        ),
      }),
    );
  };
  var removeItemFromOutput = (index) => {
    setNewOutputData((prev) =>
      __assign(__assign({}, prev), {
        items: prev.items.filter((_, i) => i !== index),
      }),
    );
  };
  var updateOutputItem = (index, field, value) => {
    setNewOutputData((prev) =>
      __assign(__assign({}, prev), {
        items: prev.items.map((item, i) => {
          var _a;
          return i === index
            ? __assign(__assign({}, item), ((_a = {}), (_a[field] = value), _a))
            : item;
        }),
      }),
    );
  };
  var getStatusColor = (status) => {
    var colors = {
      rascunho: "bg-gray-100 text-gray-800",
      pendente: "bg-yellow-100 text-yellow-800",
      aprovada: "bg-blue-100 text-blue-800",
      em_processamento: "bg-purple-100 text-purple-800",
      concluida: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  var formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  if (isLoading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Saídas de Estoque</h2>
            <p className="text-muted-foreground">Gerenciar saídas e solicitações</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <card_1.Card key={i}>
              <card_1.CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded animate-pulse" />
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saídas de Estoque</h2>
          <p className="text-muted-foreground">Gerenciar saídas e solicitações de materiais</p>
        </div>
        <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button>
              <icons_1.Icons.Plus className="w-4 h-4 mr-2" />
              Nova Saída
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Criar Nova Saída de Estoque</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Preencha as informações para criar uma nova saída de estoque
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="centro_custo">Centro de Custo</label_1.Label>
                  <select_1.Select
                    value={newOutputData.centro_custo_id}
                    onValueChange={(value) =>
                      setNewOutputData((prev) =>
                        __assign(__assign({}, prev), { centro_custo_id: value }),
                      )
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione o centro de custo" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="cc001">Consultório 1</select_1.SelectItem>
                      <select_1.SelectItem value="cc002">Consultório 2</select_1.SelectItem>
                      <select_1.SelectItem value="cc003">Sala de Cirurgia</select_1.SelectItem>
                      <select_1.SelectItem value="cc004">Recepção</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="solicitante">Solicitante</label_1.Label>
                  <input_1.Input
                    id="solicitante"
                    value={newOutputData.solicitante}
                    onChange={(e) =>
                      setNewOutputData((prev) =>
                        __assign(__assign({}, prev), { solicitante: e.target.value }),
                      )
                    }
                    placeholder="Nome do solicitante"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="motivo">Motivo da Saída</label_1.Label>
                <textarea_1.Textarea
                  id="motivo"
                  value={newOutputData.motivo}
                  onChange={(e) =>
                    setNewOutputData((prev) =>
                      __assign(__assign({}, prev), { motivo: e.target.value }),
                    )
                  }
                  placeholder="Descreva o motivo da saída"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgente"
                  checked={newOutputData.urgente}
                  onChange={(e) =>
                    setNewOutputData((prev) =>
                      __assign(__assign({}, prev), { urgente: e.target.checked }),
                    )
                  }
                  className="rounded border-gray-300"
                />
                <label_1.Label htmlFor="urgente">Solicitação urgente</label_1.Label>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label_1.Label className="text-base font-medium">Itens Solicitados</label_1.Label>
                  <button_1.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItemToOutput}
                  >
                    <icons_1.Icons.Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </button_1.Button>
                </div>

                {newOutputData.items.length === 0
                  ? <alert_1.Alert>
                      <icons_1.Icons.Info className="h-4 w-4" />
                      <alert_1.AlertDescription>
                        Adicione pelo menos um item para criar a saída de estoque
                      </alert_1.AlertDescription>
                    </alert_1.Alert>
                  : <div className="space-y-3">
                      {newOutputData.items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Item {index + 1}</h4>
                            <button_1.Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromOutput(index)}
                            >
                              <icons_1.Icons.Trash2 className="w-4 h-4" />
                            </button_1.Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <label_1.Label>Produto</label_1.Label>
                              <select_1.Select
                                value={item.produto_id}
                                onValueChange={(value) => {
                                  updateOutputItem(index, "produto_id", value);
                                  // In real implementation, would fetch product name
                                  updateOutputItem(index, "nome_produto", "Nome do Produto");
                                }}
                              >
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Selecione o produto" />
                                </select_1.SelectTrigger>
                                <select_1.SelectContent>
                                  <select_1.SelectItem value="prod001">
                                    Luvas de Procedimento
                                  </select_1.SelectItem>
                                  <select_1.SelectItem value="prod002">
                                    Máscaras Cirúrgicas
                                  </select_1.SelectItem>
                                  <select_1.SelectItem value="prod003">
                                    Soro Fisiológico
                                  </select_1.SelectItem>
                                  <select_1.SelectItem value="prod004">
                                    Gaze Estéril
                                  </select_1.SelectItem>
                                </select_1.SelectContent>
                              </select_1.Select>
                            </div>

                            <div className="space-y-2">
                              <label_1.Label>Quantidade</label_1.Label>
                              <input_1.Input
                                type="number"
                                value={item.quantidade_solicitada}
                                onChange={(e) =>
                                  updateOutputItem(
                                    index,
                                    "quantidade_solicitada",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                                min="1"
                              />
                            </div>

                            <div className="space-y-2">
                              <label_1.Label>Observações</label_1.Label>
                              <input_1.Input
                                value={item.observacoes || ""}
                                onChange={(e) =>
                                  updateOutputItem(index, "observacoes", e.target.value)
                                }
                                placeholder="Observações opcionais"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button_1.Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </button_1.Button>
                <button_1.Button
                  onClick={handleCreateStockOutput}
                  disabled={isCreating || newOutputData.items.length === 0}
                >
                  {isCreating
                    ? <>
                        <icons_1.Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    : "Criar Saída"}
                </button_1.Button>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Saídas Hoje
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {
                stockOutputs.filter((output) => {
                  var today = new Date().toDateString();
                  return new Date(output.data_saida).toDateString() === today;
                }).length
              }
            </div>
            <p className="text-sm text-muted-foreground">Processadas hoje</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <p className="text-sm text-muted-foreground">Aguardando aprovação</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total (Mês)
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                stockOutputs
                  .filter((output) => {
                    var outputDate = new Date(output.data_saida);
                    var currentMonth = new Date().getMonth();
                    var currentYear = new Date().getFullYear();
                    return (
                      outputDate.getMonth() === currentMonth &&
                      outputDate.getFullYear() === currentYear
                    );
                  })
                  .reduce((sum, output) => sum + (output.valor_total || 0), 0),
              )}
            </div>
            <p className="text-sm text-muted-foreground">Consumido este mês</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.Clock className="h-5 w-5" />
              Solicitações Pendentes
            </card_1.CardTitle>
            <card_1.CardDescription>Solicitações aguardando aprovação</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Solicitante</table_1.TableHead>
                  <table_1.TableHead>Centro de Custo</table_1.TableHead>
                  <table_1.TableHead>Motivo</table_1.TableHead>
                  <table_1.TableHead>Data</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {pendingRequests.map((request) => (
                  <table_1.TableRow key={request.id}>
                    <table_1.TableCell className="font-medium">
                      {request.solicitante}
                    </table_1.TableCell>
                    <table_1.TableCell>{request.centro_custo_id}</table_1.TableCell>
                    <table_1.TableCell className="max-w-xs truncate">
                      {request.motivo}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {new Date(request.data_solicitacao).toLocaleDateString("pt-BR")}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex gap-2">
                        <button_1.Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                          <icons_1.Icons.Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </button_1.Button>
                        <button_1.Button size="sm" variant="outline">
                          <icons_1.Icons.Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button_1.Button>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>
                ))}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Recent Stock Outputs */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.Package className="h-5 w-5" />
            Saídas Recentes
          </card_1.CardTitle>
          <card_1.CardDescription>Últimas saídas de estoque processadas</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {stockOutputs.length > 0
            ? <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Número</table_1.TableHead>
                    <table_1.TableHead>Solicitante</table_1.TableHead>
                    <table_1.TableHead>Centro de Custo</table_1.TableHead>
                    <table_1.TableHead>Data</table_1.TableHead>
                    <table_1.TableHead>Valor</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {stockOutputs.slice(0, 10).map((output) => (
                    <table_1.TableRow key={output.id}>
                      <table_1.TableCell className="font-medium">
                        {output.numero_saida}
                      </table_1.TableCell>
                      <table_1.TableCell>{output.solicitante}</table_1.TableCell>
                      <table_1.TableCell>{output.centro_custo_id}</table_1.TableCell>
                      <table_1.TableCell>
                        {new Date(output.data_saida).toLocaleDateString("pt-BR")}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {formatCurrency(output.valor_total || 0)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge className={getStatusColor(output.status)}>
                          {output.status}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <button_1.Button size="sm" variant="outline">
                          <icons_1.Icons.Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button_1.Button>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>
            : <div className="text-center py-8">
                <icons_1.Icons.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma saída de estoque encontrada</p>
              </div>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
