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
exports.useConsentManagement = useConsentManagement;
var react_1 = require("react");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var use_toast_1 = require("@/hooks/use-toast");
function useConsentManagement() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    consents = _a[0],
    setConsents = _a[1];
  var _b = (0, react_1.useState)([]),
    purposes = _b[0],
    setPurposes = _b[1];
  var _c = (0, react_1.useState)(0),
    totalCount = _c[0],
    setTotalCount = _c[1];
  var _d = (0, react_1.useState)(1),
    currentPage = _d[0],
    setCurrentPage = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(false),
    isCreating = _f[0],
    setIsCreating = _f[1];
  var _g = (0, react_1.useState)(false),
    isUpdating = _g[0],
    setIsUpdating = _g[1];
  var _h = (0, react_1.useState)(false),
    isDeleting = _h[0],
    setIsDeleting = _h[1];
  var _j = (0, react_1.useState)(null),
    error = _j[0],
    setError = _j[1];
  var _k = (0, react_1.useState)({
      limit: 20,
      offset: 0,
      sortBy: "created_at",
      sortOrder: "desc",
    }),
    filters = _k[0],
    setFilters = _k[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
  var loadConsents = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, err_1, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              setError(null);
              return [
                4 /*yield*/,
                complianceManager.getConsents(
                  __assign(__assign({}, filters), {
                    offset: (currentPage - 1) * (filters.limit || 20),
                  }),
                ),
              ];
            case 1:
              response = _a.sent();
              setConsents(response.data);
              setTotalCount(response.total);
              return [3 /*break*/, 3];
            case 2:
              err_1 = _a.sent();
              errorMessage =
                err_1 instanceof Error ? err_1.message : "Erro ao carregar consentimentos";
              setError(errorMessage);
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
    },
    [filters, currentPage, complianceManager, toast],
  );
  var loadPurposes = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var mockPurposes, errorMessage;
        return __generator(this, function (_a) {
          try {
            setError(null);
            mockPurposes = [
              {
                id: "1",
                name: "Marketing",
                description: "Envio de comunicações promocionais e ofertas",
                category: "marketing",
                required: false,
                retention_period: 730, // 2 years
                legal_basis: "consent",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "2",
                name: "Analytics",
                description: "Análise de uso e melhoria da experiência",
                category: "analytics",
                required: false,
                retention_period: 365, // 1 year
                legal_basis: "legitimate_interest",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "3",
                name: "Essencial",
                description: "Funcionalidades básicas do sistema",
                category: "essential",
                required: true,
                retention_period: null,
                legal_basis: "contract",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];
            setPurposes(mockPurposes);
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao carregar finalidades";
            setError(errorMessage);
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return [2 /*return*/];
        });
      });
    },
    [complianceManager, toast],
  );
  var createPurpose = (0, react_1.useCallback)(
    function (purpose) {
      return __awaiter(_this, void 0, void 0, function () {
        var newPurpose_1, errorMessage;
        return __generator(this, function (_a) {
          setIsCreating(true);
          try {
            setError(null);
            newPurpose_1 = __assign(__assign({}, purpose), {
              id: Date.now().toString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setPurposes(function (prev) {
              return __spreadArray(__spreadArray([], prev, true), [newPurpose_1], false);
            });
            toast({
              title: "Finalidade criada",
              description: 'Finalidade "'.concat(purpose.name, '" foi criada com sucesso.'),
            });
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao criar finalidade";
            setError(errorMessage);
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
          } finally {
            setIsCreating(false);
          }
          return [2 /*return*/];
        });
      });
    },
    [toast],
  );
  var updatePurpose = (0, react_1.useCallback)(
    function (id, updates) {
      return __awaiter(_this, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, function (_a) {
          setIsUpdating(true);
          try {
            setError(null);
            setPurposes(function (prev) {
              return prev.map(function (purpose) {
                return purpose.id === id
                  ? __assign(__assign(__assign({}, purpose), updates), {
                      updated_at: new Date().toISOString(),
                    })
                  : purpose;
              });
            });
            toast({
              title: "Finalidade atualizada",
              description: "Finalidade foi atualizada com sucesso.",
            });
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao atualizar finalidade";
            setError(errorMessage);
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
          } finally {
            setIsUpdating(false);
          }
          return [2 /*return*/];
        });
      });
    },
    [toast],
  );
  var deletePurpose = (0, react_1.useCallback)(
    function (id) {
      return __awaiter(_this, void 0, void 0, function () {
        var purpose, errorMessage;
        return __generator(this, function (_a) {
          setIsDeleting(true);
          try {
            setError(null);
            purpose = purposes.find(function (p) {
              return p.id === id;
            });
            if (purpose === null || purpose === void 0 ? void 0 : purpose.required) {
              throw new Error("Não é possível excluir finalidades obrigatórias");
            }
            setPurposes(function (prev) {
              return prev.filter(function (purpose) {
                return purpose.id !== id;
              });
            });
            toast({
              title: "Finalidade excluída",
              description: "Finalidade foi excluída com sucesso.",
            });
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao excluir finalidade";
            setError(errorMessage);
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
          } finally {
            setIsDeleting(false);
          }
          return [2 /*return*/];
        });
      });
    },
    [purposes, toast],
  );
  var withdrawConsent = (0, react_1.useCallback)(
    function (consentId, reason) {
      return __awaiter(_this, void 0, void 0, function () {
        var err_2, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              setError(null);
              return [4 /*yield*/, complianceManager.withdrawConsent(consentId, reason)];
            case 1:
              _a.sent();
              // Update local state
              setConsents(function (prev) {
                return prev.map(function (consent) {
                  return consent.id === consentId
                    ? __assign(__assign({}, consent), {
                        status: "withdrawn",
                        updated_at: new Date().toISOString(),
                      })
                    : consent;
                });
              });
              toast({
                title: "Consentimento retirado",
                description: "Consentimento foi retirado com sucesso.",
              });
              return [3 /*break*/, 3];
            case 2:
              err_2 = _a.sent();
              errorMessage =
                err_2 instanceof Error ? err_2.message : "Erro ao retirar consentimento";
              setError(errorMessage);
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
    },
    [complianceManager, toast],
  );
  var exportConsents = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var csvHeaders, csvRows, csvContent, blob, link, url, errorMessage;
        return __generator(this, function (_a) {
          try {
            setError(null);
            csvHeaders = [
              "ID",
              "Usuário",
              "Finalidade",
              "Status",
              "Data de Consentimento",
              "Data de Expiração",
              "Última Atualização",
            ];
            csvRows = consents.map(function (consent) {
              return [
                consent.id,
                consent.user_id,
                consent.purpose_id,
                consent.status,
                consent.granted_at || "",
                consent.expires_at || "",
                consent.updated_at,
              ];
            });
            csvContent = __spreadArray([csvHeaders], csvRows, true)
              .map(function (row) {
                return row
                  .map(function (cell) {
                    return '"'.concat(cell, '"');
                  })
                  .join(",");
              })
              .join("\n");
            blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            link = document.createElement("a");
            url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
              "download",
              "lgpd-consents-".concat(new Date().toISOString().split("T")[0], ".csv"),
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
              title: "Exportação concluída",
              description: "Consentimentos exportados com sucesso.",
            });
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao exportar consentimentos";
            setError(errorMessage);
            toast({
              title: "Erro na exportação",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return [2 /*return*/];
        });
      });
    },
    [consents, toast],
  );
  var goToPage = (0, react_1.useCallback)(function (page) {
    setCurrentPage(page);
  }, []);
  // Load data on mount and when filters change
  (0, react_1.useEffect)(
    function () {
      var loadData = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                setIsLoading(true);
                return [4 /*yield*/, Promise.all([loadConsents(), loadPurposes()])];
              case 1:
                _a.sent();
                setIsLoading(false);
                return [2 /*return*/];
            }
          });
        });
      };
      loadData();
    },
    [loadConsents, loadPurposes],
  );
  return {
    // Data
    consents: consents,
    purposes: purposes,
    totalCount: totalCount,
    currentPage: currentPage,
    // Loading states
    isLoading: isLoading,
    isCreating: isCreating,
    isUpdating: isUpdating,
    isDeleting: isDeleting,
    // Filters
    filters: filters,
    setFilters: setFilters,
    // Actions
    loadConsents: loadConsents,
    loadPurposes: loadPurposes,
    createPurpose: createPurpose,
    updatePurpose: updatePurpose,
    deletePurpose: deletePurpose,
    withdrawConsent: withdrawConsent,
    exportConsents: exportConsents,
    // Pagination
    goToPage: goToPage,
    // Error handling
    error: error,
  };
}
