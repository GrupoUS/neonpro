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
exports.StockTransfers = StockTransfers;
/**
 * Story 11.3: Stock Transfers Component
 * Internal stock transfer management interface
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var icons_1 = require("@/components/ui/icons");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var inventory_1 = require("@/lib/inventory");
var use_toast_1 = require("@/hooks/use-toast");
function StockTransfers(_a) {
  var onRefresh = _a.onRefresh,
    className = _a.className;
  var _b = (0, react_1.useState)([]),
    transfers = _b[0],
    setTransfers = _b[1];
  var _c = (0, react_1.useState)([]),
    pendingTransfers = _c[0],
    setPendingTransfers = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(false),
    isSubmitting = _e[0],
    setIsSubmitting = _e[1];
  var _f = (0, react_1.useState)(null),
    isApproving = _f[0],
    setIsApproving = _f[1];
  var _g = (0, react_1.useState)(null),
    isRejecting = _g[0],
    setIsRejecting = _g[1];
  var _h = (0, react_1.useState)(false),
    isDialogOpen = _h[0],
    setIsDialogOpen = _h[1];
  var _j = (0, react_1.useState)("pendente"),
    selectedStatus = _j[0],
    setSelectedStatus = _j[1];
  var _k = (0, react_1.useState)({
      produto_id: "",
      centro_custo_origem: "",
      centro_custo_destino: "",
      quantidade: 1,
      observacoes: "",
      prioridade: "media",
    }),
    formData = _k[0],
    setFormData = _k[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var stockOutputManager = new inventory_1.StockOutputManager();
  (0, react_1.useEffect)(() => {
    loadTransfers();
  }, [selectedStatus]);
  var loadTransfers = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, transfersData, transfersError, error_1, errorMessage;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setIsLoading(true);
            return [4 /*yield*/, stockOutputManager.getTransfersByStatus(selectedStatus)];
          case 1:
            (_a = _b.sent()), (transfersData = _a.data), (transfersError = _a.error);
            if (transfersError) {
              throw new Error(transfersError);
            }
            if (selectedStatus === "pendente") {
              setPendingTransfers(transfersData || []);
              setTransfers([]);
            } else {
              setTransfers(transfersData || []);
              setPendingTransfers([]);
            }
            return [3 /*break*/, 4];
          case 2:
            error_1 = _b.sent();
            errorMessage =
              error_1 instanceof Error ? error_1.message : "Erro ao carregar transferências";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleSubmitTransfer = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var transferRequest, _a, data, error, error_2, errorMessage;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            e.preventDefault();
            if (
              !formData.produto_id ||
              !formData.centro_custo_origem ||
              !formData.centro_custo_destino
            ) {
              toast({
                title: "Erro",
                description: "Preencha todos os campos obrigatórios",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            if (formData.centro_custo_origem === formData.centro_custo_destino) {
              toast({
                title: "Erro",
                description: "Centro de custo origem deve ser diferente do destino",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            setIsSubmitting(true);
            transferRequest = {
              produto_id: formData.produto_id,
              centro_custo_origem: formData.centro_custo_origem,
              centro_custo_destino: formData.centro_custo_destino,
              quantidade: formData.quantidade,
              observacoes: formData.observacoes || null,
              prioridade: formData.prioridade,
            };
            return [4 /*yield*/, stockOutputManager.createTransferRequest(transferRequest)];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error(error);
            }
            toast({
              title: "Sucesso",
              description: "Solicitação de transferência criada com sucesso",
            });
            setFormData({
              produto_id: "",
              centro_custo_origem: "",
              centro_custo_destino: "",
              quantidade: 1,
              observacoes: "",
              prioridade: "media",
            });
            setIsDialogOpen(false);
            loadTransfers();
            onRefresh();
            return [3 /*break*/, 5];
          case 3:
            error_2 = _b.sent();
            errorMessage =
              error_2 instanceof Error ? error_2.message : "Erro ao criar transferência";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleApproveTransfer = (transferId) =>
    __awaiter(this, void 0, void 0, function () {
      var error, error_3, errorMessage;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsApproving(transferId);
            return [4 /*yield*/, stockOutputManager.approveTransfer(transferId, "user-123")];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error(error);
            }
            toast({
              title: "Sucesso",
              description: "Transferência aprovada com sucesso",
            });
            loadTransfers();
            onRefresh();
            return [3 /*break*/, 4];
          case 2:
            error_3 = _a.sent();
            errorMessage =
              error_3 instanceof Error ? error_3.message : "Erro ao aprovar transferência";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setIsApproving(null);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleRejectTransfer = (transferId) =>
    __awaiter(this, void 0, void 0, function () {
      var error, error_4, errorMessage;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsRejecting(transferId);
            return [
              4 /*yield*/,
              stockOutputManager.rejectTransfer(transferId, "user-123", "Rejeitado via interface"),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error(error);
            }
            toast({
              title: "Sucesso",
              description: "Transferência rejeitada",
            });
            loadTransfers();
            onRefresh();
            return [3 /*break*/, 4];
          case 2:
            error_4 = _a.sent();
            errorMessage =
              error_4 instanceof Error ? error_4.message : "Erro ao rejeitar transferência";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setIsRejecting(null);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var getStatusColor = (status) => {
    var colors = {
      pendente: "bg-yellow-100 text-yellow-800",
      aprovado: "bg-green-100 text-green-800",
      rejeitado: "bg-red-100 text-red-800",
      concluido: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  var getPriorityColor = (priority) => {
    var colors = {
      baixa: "bg-gray-100 text-gray-800",
      media: "bg-orange-100 text-orange-800",
      alta: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };
  var formatDateTime = (dateString) => new Date(dateString).toLocaleString("pt-BR");
  if (isLoading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Transferências de Estoque</h2>
            <p className="text-muted-foreground">Gestão de transferências internas</p>
          </div>
        </div>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  var displayTransfers = selectedStatus === "pendente" ? pendingTransfers : transfers;
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transferências de Estoque</h2>
          <p className="text-muted-foreground">
            Gestão de transferências internas entre centros de custo
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={loadTransfers}>
            <icons_1.Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button_1.Button>
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <icons_1.Icons.Plus className="w-4 h-4 mr-2" />
                Nova Transferência
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-md">
              <form onSubmit={handleSubmitTransfer}>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Solicitar Transferência</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Crie uma nova solicitação de transferência entre centros de custo
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="produto_id">Produto *</label_1.Label>
                    <select_1.Select
                      value={formData.produto_id}
                      onValueChange={(value) =>
                        setFormData((prev) => __assign(__assign({}, prev), { produto_id: value }))
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o produto" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="PROD001">Seringa 10ml</select_1.SelectItem>
                        <select_1.SelectItem value="PROD002">Luva Nitrilo M</select_1.SelectItem>
                        <select_1.SelectItem value="PROD003">Máscara N95</select_1.SelectItem>
                        <select_1.SelectItem value="PROD004">Álcool 70%</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="centro_custo_origem">
                      Centro de Custo Origem *
                    </label_1.Label>
                    <select_1.Select
                      value={formData.centro_custo_origem}
                      onValueChange={(value) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { centro_custo_origem: value }),
                        )
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione a origem" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="cc001">Consultório 1</select_1.SelectItem>
                        <select_1.SelectItem value="cc002">Consultório 2</select_1.SelectItem>
                        <select_1.SelectItem value="cc003">Sala de Cirurgia</select_1.SelectItem>
                        <select_1.SelectItem value="cc004">Recepção</select_1.SelectItem>
                        <select_1.SelectItem value="cc005">Estoque Central</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="centro_custo_destino">
                      Centro de Custo Destino *
                    </label_1.Label>
                    <select_1.Select
                      value={formData.centro_custo_destino}
                      onValueChange={(value) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { centro_custo_destino: value }),
                        )
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o destino" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="cc001">Consultório 1</select_1.SelectItem>
                        <select_1.SelectItem value="cc002">Consultório 2</select_1.SelectItem>
                        <select_1.SelectItem value="cc003">Sala de Cirurgia</select_1.SelectItem>
                        <select_1.SelectItem value="cc004">Recepção</select_1.SelectItem>
                        <select_1.SelectItem value="cc005">Estoque Central</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="quantidade">Quantidade *</label_1.Label>
                    <input_1.Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={formData.quantidade}
                      onChange={(e) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), {
                            quantidade: parseInt(e.target.value) || 1,
                          }),
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="prioridade">Prioridade</label_1.Label>
                    <select_1.Select
                      value={formData.prioridade}
                      onValueChange={(value) =>
                        setFormData((prev) => __assign(__assign({}, prev), { prioridade: value }))
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="baixa">Baixa</select_1.SelectItem>
                        <select_1.SelectItem value="media">Média</select_1.SelectItem>
                        <select_1.SelectItem value="alta">Alta</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="observacoes">Observações</label_1.Label>
                    <textarea_1.Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { observacoes: e.target.value }),
                        )
                      }
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>

                <dialog_1.DialogFooter>
                  <button_1.Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </button_1.Button>
                  <button_1.Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? <>
                          <icons_1.Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      : "Criar Solicitação"}
                  </button_1.Button>
                </dialog_1.DialogFooter>
              </form>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Status Filter */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Filtros</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label_1.Label>Status da Transferência</label_1.Label>
              <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <select_1.SelectTrigger className="w-48">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="pendente">Pendente</select_1.SelectItem>
                  <select_1.SelectItem value="aprovado">Aprovado</select_1.SelectItem>
                  <select_1.SelectItem value="rejeitado">Rejeitado</select_1.SelectItem>
                  <select_1.SelectItem value="concluido">Concluído</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Transfers Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.ArrowRightLeft className="h-5 w-5" />
            Transferências ({selectedStatus})
          </card_1.CardTitle>
          <card_1.CardDescription>
            {displayTransfers.length} transferência(s) encontrada(s)
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {displayTransfers.length === 0
            ? <div className="text-center py-8">
                <icons_1.Icons.ArrowRightLeft className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma transferência encontrada
                </h3>
                <p className="text-gray-500">
                  Não há transferências com status "{selectedStatus}" no momento.
                </p>
              </div>
            : <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>ID</table_1.TableHead>
                    <table_1.TableHead>Produto</table_1.TableHead>
                    <table_1.TableHead>Origem</table_1.TableHead>
                    <table_1.TableHead>Destino</table_1.TableHead>
                    <table_1.TableHead>Quantidade</table_1.TableHead>
                    <table_1.TableHead>Prioridade</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Data</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {displayTransfers.map((transfer) => (
                    <table_1.TableRow key={transfer.id}>
                      <table_1.TableCell className="font-mono text-sm">
                        {transfer.id.slice(-8)}
                      </table_1.TableCell>
                      <table_1.TableCell className="font-medium">
                        {transfer.nome_produto}
                        {transfer.observacoes && (
                          <p className="text-sm text-muted-foreground">{transfer.observacoes}</p>
                        )}
                      </table_1.TableCell>
                      <table_1.TableCell>{transfer.centro_custo_origem}</table_1.TableCell>
                      <table_1.TableCell>{transfer.centro_custo_destino}</table_1.TableCell>
                      <table_1.TableCell>{transfer.quantidade}</table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge className={getPriorityColor(transfer.prioridade)}>
                          {transfer.prioridade}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge className={getStatusColor(transfer.status)}>
                          {transfer.status}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell className="text-sm">
                        {formatDateTime(transfer.data_solicitacao)}
                        {transfer.data_aprovacao && (
                          <p className="text-muted-foreground">
                            Aprovado: {formatDateTime(transfer.data_aprovacao)}
                          </p>
                        )}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {transfer.status === "pendente" && (
                          <div className="flex gap-2">
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveTransfer(transfer.id)}
                              disabled={isApproving === transfer.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              {isApproving === transfer.id
                                ? <icons_1.Icons.Loader2 className="w-4 h-4 animate-spin" />
                                : <icons_1.Icons.Check className="w-4 h-4" />}
                            </button_1.Button>
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectTransfer(transfer.id)}
                              disabled={isRejecting === transfer.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              {isRejecting === transfer.id
                                ? <icons_1.Icons.Loader2 className="w-4 h-4 animate-spin" />
                                : <icons_1.Icons.X className="w-4 h-4" />}
                            </button_1.Button>
                          </div>
                        )}
                        {transfer.status === "aprovado" && (
                          <badge_1.Badge variant="outline">Aguardando execução</badge_1.Badge>
                        )}
                        {transfer.status === "concluido" && (
                          <badge_1.Badge variant="secondary">Concluído</badge_1.Badge>
                        )}
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
