// NFE Management Component
// Story 5.5: List, create, and manage Brazilian electronic invoices
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NFEManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function NFEManagement(_a) {
  var _this = this;
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    documents = _b[0],
    setDocuments = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var _e = (0, react_1.useState)(0),
    total = _e[0],
    setTotal = _e[1];
  var _f = (0, react_1.useState)({
      status: "",
      customerName: "",
      startDate: "",
      endDate: "",
    }),
    filters = _f[0],
    setFilters = _f[1];
  var _g = (0, react_1.useState)({
      limit: 20,
      offset: 0,
    }),
    pagination = _g[0],
    setPagination = _g[1];
  var loadDocuments = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var params, response, data, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            setError(null);
            params = new URLSearchParams({
              clinic_id: clinicId,
              limit: pagination.limit.toString(),
              offset: pagination.offset.toString(),
            });
            // Add filters
            if (filters.status) params.append("status", filters.status);
            if (filters.customerName) params.append("customer_name", filters.customerName);
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            return [4 /*yield*/, fetch("/api/tax/nfe?".concat(params))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to load NFE documents");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setDocuments(data.data);
            setTotal(data.total);
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            console.error("Error loading NFE documents:", err_1);
            setError(err_1 instanceof Error ? err_1.message : "Unknown error");
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
  (0, react_1.useEffect)(
    function () {
      loadDocuments();
    },
    [clinicId, pagination, filters],
  );
  var handleFilterChange = function (field, value) {
    setFilters(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
    setPagination(function (prev) {
      return __assign(__assign({}, prev), { offset: 0 });
    }); // Reset to first page
  };
  var handleAuthorizeNFE = function (nfeId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, errorData, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/tax/nfe/".concat(nfeId, "/authorize"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to authorize NFE");
          case 3:
            // Reload documents to show updated status
            return [4 /*yield*/, loadDocuments()];
          case 4:
            // Reload documents to show updated status
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            err_2 = _a.sent();
            console.error("Error authorizing NFE:", err_2);
            alert(err_2 instanceof Error ? err_2.message : "Authorization failed");
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleCancelNFE = function (nfeId) {
    return __awaiter(_this, void 0, void 0, function () {
      var reason, response, errorData, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            reason = prompt("Digite o motivo do cancelamento:");
            if (!reason) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            return [
              4 /*yield*/,
              fetch("/api/tax/nfe/".concat(nfeId, "/cancel"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ reason: reason }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to cancel NFE");
          case 4:
            // Reload documents to show updated status
            return [4 /*yield*/, loadDocuments()];
          case 5:
            // Reload documents to show updated status
            _a.sent();
            return [3 /*break*/, 7];
          case 6:
            err_3 = _a.sent();
            console.error("Error cancelling NFE:", err_3);
            alert(err_3 instanceof Error ? err_3.message : "Cancellation failed");
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var getStatusBadge = function (status) {
    var config = {
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        icon: lucide_react_1.Clock,
        label: "Rascunho",
      },
      authorized: {
        color: "bg-green-100 text-green-800",
        icon: lucide_react_1.CheckCircle,
        label: "Autorizada",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: lucide_react_1.XCircle,
        label: "Cancelada",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: lucide_react_1.AlertTriangle,
        label: "Rejeitada",
      },
    };
    var _a = config[status] || config.draft,
      color = _a.color,
      Icon = _a.icon,
      label = _a.label;
    return (
      <badge_1.Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </badge_1.Badge>
    );
  };
  var hasNextPage = total > pagination.offset + pagination.limit;
  var hasPrevPage = pagination.offset > 0;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando NFes...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notas Fiscais Eletrônicas</h2>
          <p className="text-gray-600">{total} documento(s) encontrado(s)</p>
        </div>
        <button_1.Button>
          <lucide_react_1.Plus className="h-4 w-4 mr-2" />
          Nova NFe
        </button_1.Button>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center space-x-2">
            <lucide_react_1.Filter className="h-5 w-5" />
            <span>Filtros</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select_1.Select
                onValueChange={function (value) {
                  return handleFilterChange("status", value);
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos os status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="draft">Rascunho</select_1.SelectItem>
                  <select_1.SelectItem value="authorized">Autorizada</select_1.SelectItem>
                  <select_1.SelectItem value="cancelled">Cancelada</select_1.SelectItem>
                  <select_1.SelectItem value="rejected">Rejeitada</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <input_1.Input
                placeholder="Nome do cliente"
                value={filters.customerName}
                onChange={function (e) {
                  return handleFilterChange("customerName", e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <input_1.Input
                type="date"
                value={filters.startDate}
                onChange={function (e) {
                  return handleFilterChange("startDate", e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <input_1.Input
                type="date"
                value={filters.endDate}
                onChange={function (e) {
                  return handleFilterChange("endDate", e.target.value);
                }}
              />
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {error && (
        <card_1.Card className="border-red-200">
          <card_1.CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <lucide_react_1.AlertTriangle className="h-5 w-5" />
              <span>Erro ao carregar dados: {error}</span>
            </div>
            <button_1.Button onClick={loadDocuments} variant="outline" className="mt-4">
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Documents Table */}
      <card_1.Card>
        <card_1.CardContent className="p-0">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Número</table_1.TableHead>
                <table_1.TableHead>Cliente</table_1.TableHead>
                <table_1.TableHead>Valor</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Data</table_1.TableHead>
                <table_1.TableHead className="text-right">Ações</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {documents.length === 0
                ? <table_1.TableRow>
                    <table_1.TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma NFe encontrada
                    </table_1.TableCell>
                  </table_1.TableRow>
                : documents.map(function (doc) {
                    return (
                      <table_1.TableRow key={doc.id}>
                        <table_1.TableCell className="font-medium">
                          {doc.numero_nfe.toString().padStart(9, "0")}
                          <div className="text-xs text-gray-500">Série: {doc.serie_nfe}</div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div>
                            <div className="font-medium">{doc.cliente_nome || "N/A"}</div>
                            <div className="text-xs text-gray-500">{doc.cliente_cnpj_cpf}</div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {(0, utils_1.formatCurrency)(doc.valor_total)}
                        </table_1.TableCell>
                        <table_1.TableCell>{getStatusBadge(doc.status)}</table_1.TableCell>
                        <table_1.TableCell>
                          {new Date(doc.created_at).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleTimeString()}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Download className="h-4 w-4" />
                            </button_1.Button>
                            {doc.status === "draft" && (
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return handleAuthorizeNFE(doc.id);
                                }}
                              >
                                <lucide_react_1.CheckCircle className="h-4 w-4" />
                              </button_1.Button>
                            )}
                            {doc.status === "authorized" && (
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return handleCancelNFE(doc.id);
                                }}
                              >
                                <lucide_react_1.XCircle className="h-4 w-4" />
                              </button_1.Button>
                            )}
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>
                    );
                  })}
            </table_1.TableBody>
          </table_1.Table>
        </card_1.CardContent>
      </card_1.Card>

      {/* Pagination */}
      {documents.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {pagination.offset + 1} a{" "}
            {Math.min(pagination.offset + pagination.limit, total)} de {total} registros
          </div>
          <div className="flex space-x-2">
            <button_1.Button
              variant="outline"
              size="sm"
              disabled={!hasPrevPage}
              onClick={function () {
                return setPagination(function (prev) {
                  return __assign(__assign({}, prev), {
                    offset: Math.max(0, prev.offset - prev.limit),
                  });
                });
              }}
            >
              Anterior
            </button_1.Button>
            <button_1.Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={function () {
                return setPagination(function (prev) {
                  return __assign(__assign({}, prev), { offset: prev.offset + prev.limit });
                });
              }}
            >
              Próximo
            </button_1.Button>
          </div>
        </div>
      )}
    </div>
  );
}
