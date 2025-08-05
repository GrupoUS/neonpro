// =====================================================================================
// SUPPLIER MANAGEMENT HOOK
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================
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
exports.useSupplierManagement = useSupplierManagement;
var react_1 = require("react");
function useSupplierManagement(_a) {
  var clinicId = _a.clinicId,
    _b = _a.autoRefresh,
    autoRefresh = _b === void 0 ? false : _b,
    _c = _a.refreshInterval, // 5 minutes
    refreshInterval = _c === void 0 ? 300000 : _c; // 5 minutes
  // State management
  var _d = (0, react_1.useState)([]),
    suppliers = _d[0],
    setSuppliers = _d[1];
  var _e = (0, react_1.useState)(null),
    supplierDetails = _e[0],
    setSupplierDetails = _e[1];
  var _f = (0, react_1.useState)([]),
    contracts = _f[0],
    setContracts = _f[1];
  var _g = (0, react_1.useState)([]),
    contacts = _g[0],
    setContacts = _g[1];
  var _h = (0, react_1.useState)([]),
    evaluations = _h[0],
    setEvaluations = _h[1];
  var _j = (0, react_1.useState)([]),
    qualityIssues = _j[0],
    setQualityIssues = _j[1];
  var _k = (0, react_1.useState)([]),
    communications = _k[0],
    setCommunications = _k[1];
  var _l = (0, react_1.useState)(null),
    dashboardData = _l[0],
    setDashboardData = _l[1];
  var _m = (0, react_1.useState)([]),
    contractAlerts = _m[0],
    setContractAlerts = _m[1];
  var _o = (0, react_1.useState)([]),
    qualityIssuesSummary = _o[0],
    setQualityIssuesSummary = _o[1];
  var _p = (0, react_1.useState)(null),
    analytics = _p[0],
    setAnalytics = _p[1];
  // Loading and error states
  var _q = (0, react_1.useState)(false),
    isLoading = _q[0],
    setIsLoading = _q[1];
  var _r = (0, react_1.useState)(false),
    isCreating = _r[0],
    setIsCreating = _r[1];
  var _s = (0, react_1.useState)(false),
    isUpdating = _s[0],
    setIsUpdating = _s[1];
  var _t = (0, react_1.useState)(false),
    isDeleting = _t[0],
    setIsDeleting = _t[1];
  var _u = (0, react_1.useState)(null),
    error = _u[0],
    setError = _u[1];
  // Pagination
  var _v = (0, react_1.useState)({
      page: 1,
      limit: 50,
      total: 0,
    }),
    pagination = _v[0],
    setPagination = _v[1];
  // Helper function for API calls
  var handleApiCall = (apiCall, onSuccess, loadingState) =>
    __awaiter(this, void 0, void 0, function () {
      var result, err_1, errorMessage;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setError(null);
            if (loadingState === "loading") setIsLoading(true);
            else if (loadingState === "creating") setIsCreating(true);
            else if (loadingState === "updating") setIsUpdating(true);
            else if (loadingState === "deleting") setIsDeleting(true);
            return [4 /*yield*/, apiCall()];
          case 1:
            result = _a.sent();
            if (onSuccess) {
              onSuccess(result);
            }
            return [2 /*return*/, result];
          case 2:
            err_1 = _a.sent();
            errorMessage = err_1 instanceof Error ? err_1.message : "Erro desconhecido";
            setError(errorMessage);
            console.error("API call error:", err_1);
            return [2 /*return*/, null];
          case 3:
            setIsLoading(false);
            setIsCreating(false);
            setIsUpdating(false);
            setIsDeleting(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // =====================================================================================
  // SUPPLIER MANAGEMENT
  // =====================================================================================
  var loadSuppliers = (0, react_1.useCallback)(
    (filters_1) => {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        this,
        __spreadArray([filters_1], args_1, true),
        void 0,
        function (filters, page, limit) {
          if (page === void 0) {
            page = 1;
          }
          if (limit === void 0) {
            limit = 50;
          }
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                return [
                  4 /*yield*/,
                  handleApiCall(
                    () =>
                      __awaiter(this, void 0, void 0, function () {
                        var queryParams, response, data;
                        var _a, _b;
                        return __generator(this, (_c) => {
                          switch (_c.label) {
                            case 0:
                              queryParams = new URLSearchParams({
                                clinic_id: clinicId,
                                page: page.toString(),
                                limit: limit.toString(),
                              });
                              if (filters) {
                                if (
                                  (_a = filters.supplier_type) === null || _a === void 0
                                    ? void 0
                                    : _a.length
                                ) {
                                  queryParams.append(
                                    "supplier_type",
                                    filters.supplier_type.join(","),
                                  );
                                }
                                if (
                                  (_b = filters.status) === null || _b === void 0
                                    ? void 0
                                    : _b.length
                                ) {
                                  queryParams.append("status", filters.status.join(","));
                                }
                                if (filters.is_preferred !== undefined) {
                                  queryParams.append(
                                    "is_preferred",
                                    filters.is_preferred.toString(),
                                  );
                                }
                                if (filters.is_critical !== undefined) {
                                  queryParams.append("is_critical", filters.is_critical.toString());
                                }
                                if (filters.performance_score_min !== undefined) {
                                  queryParams.append(
                                    "performance_score_min",
                                    filters.performance_score_min.toString(),
                                  );
                                }
                                if (filters.performance_score_max !== undefined) {
                                  queryParams.append(
                                    "performance_score_max",
                                    filters.performance_score_max.toString(),
                                  );
                                }
                                if (filters.search) {
                                  queryParams.append("search", filters.search);
                                }
                              }
                              return [4 /*yield*/, fetch("/api/suppliers?".concat(queryParams))];
                            case 1:
                              response = _c.sent();
                              if (!response.ok) {
                                throw new Error("Erro ao carregar fornecedores");
                              }
                              return [4 /*yield*/, response.json()];
                            case 2:
                              data = _c.sent();
                              return [2 /*return*/, data];
                          }
                        });
                      }),
                    (data) => {
                      setSuppliers(data.suppliers);
                      setPagination({
                        page: data.page,
                        limit: data.limit,
                        total: data.total,
                      });
                    },
                    "loading",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [clinicId],
  );
  var loadSupplierDetails = (0, react_1.useCallback)(
    (supplierId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch(
                                "/api/suppliers/"
                                  .concat(supplierId, "?clinic_id=")
                                  .concat(clinicId),
                              ),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar detalhes do fornecedor");
                            }
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (data) => setSupplierDetails(data),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [clinicId],
  );
  var createSupplier = (0, react_1.useCallback)(
    (supplierData) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(
                                  __assign(__assign({}, supplierData), { clinic_id: clinicId }),
                                ),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao criar fornecedor");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (newSupplier) => {
                    setSuppliers((prev) => __spreadArray([newSupplier], prev, true));
                  },
                  "creating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [clinicId],
  );
  var updateSupplier = (0, react_1.useCallback)(
    (supplierId, updates) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch(
                                "/api/suppliers/"
                                  .concat(supplierId, "?clinic_id=")
                                  .concat(clinicId),
                                {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(updates),
                                },
                              ),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao atualizar fornecedor");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (updatedSupplier) => {
                    setSuppliers((prev) =>
                      prev.map((supplier) =>
                        supplier.id === supplierId ? updatedSupplier : supplier,
                      ),
                    );
                    if (
                      (supplierDetails === null || supplierDetails === void 0
                        ? void 0
                        : supplierDetails.id) === supplierId
                    ) {
                      setSupplierDetails(updatedSupplier);
                    }
                  },
                  "updating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [clinicId, supplierDetails],
  );
  var deleteSupplier = (0, react_1.useCallback)(
    (supplierId) =>
      __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch(
                                "/api/suppliers/"
                                  .concat(supplierId, "?clinic_id=")
                                  .concat(clinicId),
                                {
                                  method: "DELETE",
                                },
                              ),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao excluir fornecedor");
                          case 3:
                            return [2 /*return*/, true];
                        }
                      });
                    }),
                  () => {
                    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== supplierId));
                    if (
                      (supplierDetails === null || supplierDetails === void 0
                        ? void 0
                        : supplierDetails.id) === supplierId
                    ) {
                      setSupplierDetails(null);
                    }
                  },
                  "deleting",
                ),
              ];
            case 1:
              result = _a.sent();
              return [2 /*return*/, result !== null];
          }
        });
      }),
    [clinicId, supplierDetails],
  );
  // =====================================================================================
  // CONTRACT MANAGEMENT
  // =====================================================================================
  var loadContracts = (0, react_1.useCallback)(
    (supplierId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, data;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/contracts?supplier_id=".concat(supplierId)),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar contratos");
                            }
                            return [4 /*yield*/, response.json()];
                          case 2:
                            data = _a.sent();
                            return [2 /*return*/, data.contracts];
                        }
                      });
                    }),
                  (contractsData) => setContracts(contractsData),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var createContract = (0, react_1.useCallback)(
    (contractData) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/contracts", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(contractData),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao criar contrato");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (newContract) => {
                    setContracts((prev) => __spreadArray([newContract], prev, true));
                  },
                  "creating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  var updateContract = (0, react_1.useCallback)(
    (contractId, updates) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/contracts/".concat(contractId), {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(updates),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao atualizar contrato");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (updatedContract) => {
                    setContracts((prev) =>
                      prev.map((contract) =>
                        contract.id === contractId ? updatedContract : contract,
                      ),
                    );
                  },
                  "updating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  var loadContractAlerts = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (daysAhead) {
      if (daysAhead === void 0) {
        daysAhead = 90;
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              handleApiCall(
                () =>
                  __awaiter(this, void 0, void 0, function () {
                    var response, data;
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            fetch(
                              "/api/suppliers/contracts?clinic_id="
                                .concat(clinicId, "&action=renewal-alerts&days_ahead=")
                                .concat(daysAhead),
                            ),
                          ];
                        case 1:
                          response = _a.sent();
                          if (!response.ok) {
                            throw new Error("Erro ao carregar alertas de contrato");
                          }
                          return [4 /*yield*/, response.json()];
                        case 2:
                          data = _a.sent();
                          return [2 /*return*/, data.alerts];
                      }
                    });
                  }),
                (alertsData) => setContractAlerts(alertsData),
                "loading",
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  }, [clinicId]);
  // =====================================================================================
  // CONTACT MANAGEMENT
  // =====================================================================================
  var loadContacts = (0, react_1.useCallback)(
    (supplierId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, data;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/contacts?supplier_id=".concat(supplierId)),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar contatos");
                            }
                            return [4 /*yield*/, response.json()];
                          case 2:
                            data = _a.sent();
                            return [2 /*return*/, data.contacts];
                        }
                      });
                    }),
                  (contactsData) => setContacts(contactsData),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var createContact = (0, react_1.useCallback)(
    (contactData) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/contacts", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(contactData),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao criar contato");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (newContact) => {
                    setContacts((prev) => __spreadArray([newContact], prev, true));
                  },
                  "creating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  var updateContact = (0, react_1.useCallback)(
    (contactId, updates) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/contacts/".concat(contactId), {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(updates),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao atualizar contato");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (updatedContact) => {
                    setContacts((prev) =>
                      prev.map((contact) => (contact.id === contactId ? updatedContact : contact)),
                    );
                  },
                  "updating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  // =====================================================================================
  // EVALUATION MANAGEMENT
  // =====================================================================================
  var loadEvaluations = (0, react_1.useCallback)(
    (supplierId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, data;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/evaluations?supplier_id=".concat(supplierId)),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar avaliações");
                            }
                            return [4 /*yield*/, response.json()];
                          case 2:
                            data = _a.sent();
                            return [2 /*return*/, data.evaluations];
                        }
                      });
                    }),
                  (evaluationsData) => setEvaluations(evaluationsData),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var createEvaluation = (0, react_1.useCallback)(
    (evaluationData) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/evaluations", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(evaluationData),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao criar avaliação");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (newEvaluation) => {
                    setEvaluations((prev) => __spreadArray([newEvaluation], prev, true));
                  },
                  "creating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  // =====================================================================================
  // QUALITY ISSUE MANAGEMENT
  // =====================================================================================
  var loadQualityIssuesSummary = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, data;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/quality-issues?clinic_id=".concat(clinicId)),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar resumo de issues");
                            }
                            return [4 /*yield*/, response.json()];
                          case 2:
                            data = _a.sent();
                            return [2 /*return*/, data.summary];
                        }
                      });
                    }),
                  (summaryData) => setQualityIssuesSummary(summaryData),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [clinicId],
  );
  var createQualityIssue = (0, react_1.useCallback)(
    (issueData) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/quality-issues", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(issueData),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao criar issue");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (newIssue) => {
                    setQualityIssues((prev) => __spreadArray([newIssue], prev, true));
                  },
                  "creating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  var updateQualityIssue = (0, react_1.useCallback)(
    (issueId, updates) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/quality-issues/".concat(issueId), {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(updates),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao atualizar issue");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (updatedIssue) => {
                    setQualityIssues((prev) =>
                      prev.map((issue) => (issue.id === issueId ? updatedIssue : issue)),
                    );
                  },
                  "updating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  // =====================================================================================
  // COMMUNICATION MANAGEMENT
  // =====================================================================================
  var loadCommunications = (0, react_1.useCallback)(
    (supplierId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, data;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch(
                                "/api/suppliers/communications?supplier_id=".concat(supplierId),
                              ),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar comunicações");
                            }
                            return [4 /*yield*/, response.json()];
                          case 2:
                            data = _a.sent();
                            return [2 /*return*/, data.communications];
                        }
                      });
                    }),
                  (communicationsData) => setCommunications(communicationsData),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var createCommunication = (0, react_1.useCallback)(
    (communicationData) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/communications", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(communicationData),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao criar comunicação");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (newCommunication) => {
                    setCommunications((prev) => __spreadArray([newCommunication], prev, true));
                  },
                  "creating",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  // =====================================================================================
  // DASHBOARD AND ANALYTICS
  // =====================================================================================
  var loadDashboardData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/dashboard?clinic_id=".concat(clinicId)),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar dados do dashboard");
                            }
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (data) => setDashboardData(data),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [clinicId],
  );
  var loadAnalytics = (0, react_1.useCallback)(
    (periodStart, periodEnd) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch(
                                "/api/suppliers/analytics?clinic_id="
                                  .concat(clinicId, "&period_start=")
                                  .concat(periodStart, "&period_end=")
                                  .concat(periodEnd),
                              ),
                            ];
                          case 1:
                            response = _a.sent();
                            if (!response.ok) {
                              throw new Error("Erro ao carregar analytics");
                            }
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  (data) => setAnalytics(data),
                  "loading",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [clinicId],
  );
  var compareSuppliers = (0, react_1.useCallback)(
    (supplierIds) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                handleApiCall(
                  () =>
                    __awaiter(this, void 0, void 0, function () {
                      var response, errorData;
                      return __generator(this, (_a) => {
                        switch (_a.label) {
                          case 0:
                            return [
                              4 /*yield*/,
                              fetch("/api/suppliers/analytics", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  supplier_ids: supplierIds,
                                  comparison_criteria: [
                                    "delivery_performance",
                                    "quality_rating",
                                    "cost_effectiveness",
                                    "response_time",
                                  ],
                                }),
                              }),
                            ];
                          case 1:
                            response = _a.sent();
                            if (response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json()];
                          case 2:
                            errorData = _a.sent();
                            throw new Error(errorData.error || "Erro ao comparar fornecedores");
                          case 3:
                            return [2 /*return*/, response.json()];
                        }
                      });
                    }),
                  undefined,
                  "loading",
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      }),
    [],
  );
  // =====================================================================================
  // UTILITY FUNCTIONS
  // =====================================================================================
  var refreshData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.all([
                  loadSuppliers(),
                  loadDashboardData(),
                  loadContractAlerts(),
                  loadQualityIssuesSummary(),
                ]),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [loadSuppliers, loadDashboardData, loadContractAlerts, loadQualityIssuesSummary],
  );
  var clearError = (0, react_1.useCallback)(() => {
    setError(null);
  }, []);
  var resetState = (0, react_1.useCallback)(() => {
    setSuppliers([]);
    setSupplierDetails(null);
    setContracts([]);
    setContacts([]);
    setEvaluations([]);
    setQualityIssues([]);
    setCommunications([]);
    setDashboardData(null);
    setContractAlerts([]);
    setQualityIssuesSummary([]);
    setAnalytics(null);
    setError(null);
    setPagination({ page: 1, limit: 50, total: 0 });
  }, []);
  // Auto-refresh effect
  (0, react_1.useEffect)(() => {
    if (autoRefresh) {
      var interval_1 = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval_1);
    }
  }, [autoRefresh, refreshInterval, refreshData]);
  // Initial load
  (0, react_1.useEffect)(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  return {
    // State
    suppliers: suppliers,
    supplierDetails: supplierDetails,
    contracts: contracts,
    contacts: contacts,
    evaluations: evaluations,
    qualityIssues: qualityIssues,
    communications: communications,
    dashboardData: dashboardData,
    contractAlerts: contractAlerts,
    qualityIssuesSummary: qualityIssuesSummary,
    analytics: analytics,
    // Loading states
    isLoading: isLoading,
    isCreating: isCreating,
    isUpdating: isUpdating,
    isDeleting: isDeleting,
    // Error state
    error: error,
    // Pagination
    pagination: pagination,
    // Actions
    loadSuppliers: loadSuppliers,
    loadSupplierDetails: loadSupplierDetails,
    createSupplier: createSupplier,
    updateSupplier: updateSupplier,
    deleteSupplier: deleteSupplier,
    // Contract management
    loadContracts: loadContracts,
    createContract: createContract,
    updateContract: updateContract,
    loadContractAlerts: loadContractAlerts,
    // Contact management
    loadContacts: loadContacts,
    createContact: createContact,
    updateContact: updateContact,
    // Performance and evaluation
    loadEvaluations: loadEvaluations,
    createEvaluation: createEvaluation,
    // Quality issues
    loadQualityIssuesSummary: loadQualityIssuesSummary,
    createQualityIssue: createQualityIssue,
    updateQualityIssue: updateQualityIssue,
    // Communications
    loadCommunications: loadCommunications,
    createCommunication: createCommunication,
    // Dashboard and analytics
    loadDashboardData: loadDashboardData,
    loadAnalytics: loadAnalytics,
    compareSuppliers: compareSuppliers,
    // Utility functions
    refreshData: refreshData,
    clearError: clearError,
    resetState: resetState,
  };
}
