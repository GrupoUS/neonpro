// =====================================================================================
// SUPPLIER MANAGEMENT SERVICE
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierManagementService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var SupplierManagementService = /** @class */ (() => {
  function SupplierManagementService(supabaseUrl, supabaseKey) {
    this.supabase = (0, supabase_js_1.createClient)(
      supabaseUrl || process.env.SUPABASE_URL,
      supabaseKey || process.env.SUPABASE_ANON_KEY,
    );
  }
  SupplierManagementService.prototype.getSupabaseClient = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, supabase]);
    });
  };
  // =====================================================================================
  // SUPPLIER CRUD OPERATIONS
  // =====================================================================================
  SupplierManagementService.prototype.createSupplier = function (clinicId, supplierData) {
    return __awaiter(this, void 0, void 0, function () {
      var supplierCode, supabase, existingCode, supplierToCreate, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            supplierCode = supplierData.supplier_code;
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("suppliers")
                .select("id")
                .eq("clinic_id", clinicId)
                .eq("supplier_code", supplierCode)
                .single(),
            ];
          case 2:
            existingCode = _b.sent().data;
            if (existingCode) {
              throw new Error(
                "C\u00F3digo de fornecedor '".concat(supplierCode, "' j\u00E1 existe"),
              );
            }
            supplierToCreate = __assign(__assign({}, supplierData), {
              clinic_id: clinicId,
              supplier_code: supplierCode,
              status: "active",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase.from("suppliers").insert([supplierToCreate]).select("*").single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao criar fornecedor: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getSupplier = function (clinicId, supplierId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("suppliers")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("id", supplierId)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              throw new Error("Erro ao buscar fornecedor: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.updateSupplier = function (clinicId, supplierId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            updateData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
            return [
              4 /*yield*/,
              supabase
                .from("suppliers")
                .update(updateData)
                .eq("clinic_id", clinicId)
                .eq("id", supplierId)
                .select("*")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao atualizar fornecedor: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.deleteSupplier = function (clinicId, supplierId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, contracts, error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contracts")
                .select("id")
                .eq("supplier_id", supplierId)
                .eq("status", "active")
                .limit(1),
            ];
          case 2:
            contracts = _a.sent().data;
            if (contracts && contracts.length > 0) {
              throw new Error("Não é possível excluir fornecedor com contratos ativos");
            }
            return [
              4 /*yield*/,
              supabase.from("suppliers").delete().eq("clinic_id", clinicId).eq("id", supplierId),
            ];
          case 3:
            error = _a.sent().error;
            if (error) {
              throw new Error("Erro ao excluir fornecedor: ".concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  SupplierManagementService.prototype.listSuppliers = function (clinicId_1, filters_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, filters, page, limit) {
      var query, offset, _a, data, error, count;
      if (page === void 0) {
        page = 1;
      }
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("suppliers")
              .select("*", { count: "exact" })
              .eq("clinic_id", clinicId);
            // Apply filters
            if (filters) {
              if (filters.supplier_type && filters.supplier_type.length > 0) {
                query = query.in("supplier_type", filters.supplier_type);
              }
              if (filters.status && filters.status.length > 0) {
                query = query.in("status", filters.status);
              }
              if (filters.is_preferred !== undefined) {
                query = query.eq("is_preferred", filters.is_preferred);
              }
              if (filters.is_critical !== undefined) {
                query = query.eq("is_critical", filters.is_critical);
              }
              if (filters.performance_score_min !== undefined) {
                query = query.gte("performance_score", filters.performance_score_min);
              }
              if (filters.performance_score_max !== undefined) {
                query = query.lte("performance_score", filters.performance_score_max);
              }
              if (filters.search) {
                query = query.or(
                  "supplier_name.ilike.%"
                    .concat(filters.search, "%,supplier_code.ilike.%")
                    .concat(filters.search, "%"),
                );
              }
            }
            offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);
            // Order by name
            query = query.order("supplier_name");
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) {
              throw new Error("Erro ao listar fornecedores: ".concat(error.message));
            }
            return [
              2 /*return*/,
              {
                suppliers: data,
                total: count || 0,
                page: page,
                limit: limit,
                filters: filters,
              },
            ];
        }
      });
    });
  };
  // =====================================================================================
  // CONTRACT MANAGEMENT
  // =====================================================================================
  SupplierManagementService.prototype.createContract = function (contractData) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, existingContract, contractToCreate, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contracts")
                .select("id")
                .eq("supplier_id", contractData.supplier_id)
                .eq("contract_number", contractData.contract_number)
                .single(),
            ];
          case 2:
            existingContract = _b.sent().data;
            if (existingContract) {
              throw new Error(
                "N\u00FAmero de contrato '".concat(
                  contractData.contract_number,
                  "' j\u00E1 existe para este fornecedor",
                ),
              );
            }
            contractToCreate = __assign(__assign({}, contractData), {
              status: "draft",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contracts")
                .insert([contractToCreate])
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao criar contrato: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getContract = function (contractId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contracts")
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .eq("id", contractId)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              throw new Error("Erro ao buscar contrato: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.updateContract = function (contractId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            updateData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contracts")
                .update(updateData)
                .eq("id", contractId)
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao atualizar contrato: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getSupplierContracts = function (supplierId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contracts")
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .eq("supplier_id", supplierId)
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao buscar contratos: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getContractRenewalAlerts = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, daysAhead) {
      var alertDate, supabase, _a, data, error;
      if (daysAhead === void 0) {
        daysAhead = 90;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            alertDate = new Date();
            alertDate.setDate(alertDate.getDate() + daysAhead);
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("contract_renewal_alerts")
                .select("*")
                .eq("clinic_id", clinicId)
                .lte("end_date", alertDate.toISOString())
                .order("days_until_expiration"),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error(
                "Erro ao buscar alertas de renova\u00E7\u00E3o: ".concat(error.message),
              );
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // =====================================================================================
  // CONTACT MANAGEMENT
  // =====================================================================================
  SupplierManagementService.prototype.createContact = function (contactData) {
    return __awaiter(this, void 0, void 0, function () {
      var contactToCreate, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            contactToCreate = __assign(__assign({}, contactData), {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contacts")
                .insert([contactToCreate])
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao criar contato: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getSupplierContacts = function (supplierId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contacts")
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .eq("supplier_id", supplierId)
                .eq("is_active", true)
                .order("is_primary", { ascending: false })
                .order("contact_name"),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao buscar contatos: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.updateContact = function (contactId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            updateData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_contacts")
                .update(updateData)
                .eq("id", contactId)
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao atualizar contato: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // =====================================================================================
  // PERFORMANCE TRACKING
  // =====================================================================================
  SupplierManagementService.prototype.calculateSupplierPerformance = function (
    supplierId,
    periodStart,
    periodEnd,
    evaluationType,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        ordersData,
        qualityData,
        financialData,
        deliveryScore,
        qualityScore,
        overallScore,
        performanceData,
        _b,
        data,
        error;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all([
                this.getDeliveryPerformanceData(supplierId, periodStart, periodEnd),
                this.getQualityPerformanceData(supplierId, periodStart, periodEnd),
                this.getFinancialPerformanceData(supplierId, periodStart, periodEnd),
              ]),
            ];
          case 1:
            (_a = _c.sent()), (ordersData = _a[0]), (qualityData = _a[1]), (financialData = _a[2]);
            deliveryScore = this.calculateDeliveryScore(ordersData);
            qualityScore = this.calculateQualityScore(qualityData);
            overallScore = (deliveryScore + qualityScore) / 2;
            performanceData = {
              supplier_id: supplierId,
              period_start: periodStart,
              period_end: periodEnd,
              evaluation_type: evaluationType,
              // Delivery Performance
              total_orders: ordersData.totalOrders,
              on_time_deliveries: ordersData.onTimeDeliveries,
              late_deliveries: ordersData.lateDeliveries,
              avg_delivery_days: ordersData.avgDeliveryDays,
              delivery_performance_score: deliveryScore,
              // Quality Performance
              total_items_received: qualityData.totalItems,
              defective_items: qualityData.defectiveItems,
              returned_items: qualityData.returnedItems,
              quality_score: qualityScore,
              // Financial Performance
              total_order_value: financialData.totalOrderValue,
              total_invoiced: financialData.totalInvoiced,
              total_paid: financialData.totalPaid,
              avg_payment_delay_days: financialData.avgPaymentDelay,
              cost_savings: financialData.costSavings,
              // Overall Performance
              overall_score: overallScore,
              performance_grade: this.calculatePerformanceGrade(overallScore),
              calculated_at: new Date().toISOString(),
            };
            return [
              4 /*yield*/,
              supabase
                .from("supplier_performance")
                .insert([performanceData])
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 2:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) {
              throw new Error("Erro ao calcular performance: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.createEvaluation = function (evaluationData) {
    return __awaiter(this, void 0, void 0, function () {
      var weights, weightedScore, finalGrade, evaluationToCreate, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            weights = {
              delivery_reliability: 0.25,
              product_quality: 0.25,
              customer_service: 0.15,
              pricing_competitiveness: 0.15,
              technical_support: 0.1,
              documentation_quality: 0.1,
            };
            weightedScore =
              evaluationData.delivery_reliability * weights.delivery_reliability +
              evaluationData.product_quality * weights.product_quality +
              evaluationData.customer_service * weights.customer_service +
              evaluationData.pricing_competitiveness * weights.pricing_competitiveness +
              evaluationData.technical_support * weights.technical_support +
              evaluationData.documentation_quality * weights.documentation_quality;
            finalGrade = this.calculatePerformanceGrade(weightedScore);
            evaluationToCreate = __assign(__assign({}, evaluationData), {
              evaluation_date: new Date().toISOString(),
              weighted_score: Number(weightedScore.toFixed(2)),
              final_grade: finalGrade,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_evaluations")
                .insert([evaluationToCreate])
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao criar avalia\u00E7\u00E3o: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getSupplierEvaluations = function (supplierId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_evaluations")
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .eq("supplier_id", supplierId)
                .order("evaluation_date", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao buscar avalia\u00E7\u00F5es: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // =====================================================================================
  // QUALITY ISSUE MANAGEMENT
  // =====================================================================================
  SupplierManagementService.prototype.createQualityIssue = function (issueData) {
    return __awaiter(this, void 0, void 0, function () {
      var issueToCreate, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            issueToCreate = __assign(__assign({}, issueData), {
              issue_date: new Date().toISOString(),
              status: "open",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_quality_issues")
                .insert([issueToCreate])
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao criar issue de qualidade: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.updateQualityIssue = function (issueId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            updateData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_quality_issues")
                .update(updateData)
                .eq("id", issueId)
                .select("\n        *,\n        supplier:suppliers(*)\n      ")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao atualizar issue: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getQualityIssuesSummary = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("quality_issues_summary")
                .select("*")
                .eq("clinic_id", clinicId)
                .order("open_issues", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao buscar resumo de issues: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // =====================================================================================
  // COMMUNICATION MANAGEMENT
  // =====================================================================================
  SupplierManagementService.prototype.createCommunication = function (communicationData) {
    return __awaiter(this, void 0, void 0, function () {
      var communicationToCreate, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            communicationToCreate = __assign(__assign({}, communicationData), {
              communication_date: new Date().toISOString(),
              status: "sent",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase
                .from("supplier_communications")
                .insert([communicationToCreate])
                .select(
                  "\n        *,\n        supplier:suppliers(*),\n        contact:supplier_contacts(*)\n      ",
                )
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao criar comunica\u00E7\u00E3o: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  SupplierManagementService.prototype.getSupplierCommunications = function (supplierId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_communications")
                .select(
                  "\n        *,\n        supplier:suppliers(*),\n        contact:supplier_contacts(*)\n      ",
                )
                .eq("supplier_id", supplierId)
                .order("communication_date", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao buscar comunica\u00E7\u00F5es: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // =====================================================================================
  // DASHBOARD AND ANALYTICS
  // =====================================================================================
  SupplierManagementService.prototype.getDashboardData = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        suppliers,
        totalSuppliers,
        activeSuppliers,
        preferredSuppliers,
        criticalSuppliers,
        avgPerformanceScore,
        suppliersByType,
        contractAlerts,
        recentCommunications,
        _a,
        qualityIssues,
        openQualityIssues;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("suppliers")
                .select("id, supplier_type, status, is_preferred, is_critical, performance_score")
                .eq("clinic_id", clinicId),
            ];
          case 2:
            suppliers = _b.sent().data;
            totalSuppliers =
              (suppliers === null || suppliers === void 0 ? void 0 : suppliers.length) || 0;
            activeSuppliers =
              (suppliers === null || suppliers === void 0
                ? void 0
                : suppliers.filter((s) => s.status === "active").length) || 0;
            preferredSuppliers =
              (suppliers === null || suppliers === void 0
                ? void 0
                : suppliers.filter((s) => s.is_preferred).length) || 0;
            criticalSuppliers =
              (suppliers === null || suppliers === void 0
                ? void 0
                : suppliers.filter((s) => s.is_critical).length) || 0;
            avgPerformanceScore = (
              suppliers === null || suppliers === void 0
                ? void 0
                : suppliers.length
            )
              ? suppliers.reduce((sum, s) => sum + (s.performance_score || 0), 0) / suppliers.length
              : 0;
            suppliersByType =
              (suppliers === null || suppliers === void 0
                ? void 0
                : suppliers.reduce((acc, supplier) => {
                    acc[supplier.supplier_type] = (acc[supplier.supplier_type] || 0) + 1;
                    return acc;
                  }, {})) || {};
            return [4 /*yield*/, this.getContractRenewalAlerts(clinicId)];
          case 3:
            contractAlerts = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_communications")
                .select(
                  "\n        *,\n        supplier:suppliers(*),\n        contact:supplier_contacts(*)\n      ",
                )
                .eq("supplier.clinic_id", clinicId)
                .order("communication_date", { ascending: false })
                .limit(10),
            ];
          case 4:
            recentCommunications = _b.sent().data;
            return [
              4 /*yield*/,
              supabase
                .from("supplier_quality_issues")
                .select("*", { count: "exact" })
                .eq("supplier.clinic_id", clinicId)
                .eq("status", "open"),
            ];
          case 5:
            (_a = _b.sent()), (qualityIssues = _a.data), (openQualityIssues = _a.count);
            return [
              2 /*return*/,
              {
                total_suppliers: totalSuppliers,
                active_suppliers: activeSuppliers,
                preferred_suppliers: preferredSuppliers,
                critical_suppliers: criticalSuppliers,
                avg_performance_score: Number(avgPerformanceScore.toFixed(2)),
                suppliers_by_type: suppliersByType,
                suppliers_by_rating: {},
                contract_renewals_due: contractAlerts.length,
                open_quality_issues: openQualityIssues || 0,
                recent_communications: recentCommunications || [],
                top_performing_suppliers: [],
                contract_alerts: contractAlerts,
              },
            ];
        }
      });
    });
  };
  SupplierManagementService.prototype.getSupplierAnalytics = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would require complex queries joining with orders, invoices, etc.
        // For now, return basic structure
        return [
          2 /*return*/,
          {
            period_start: periodStart,
            period_end: periodEnd,
            total_spend: 0,
            supplier_count: 0,
            avg_performance_score: 0,
            cost_savings: 0,
            top_categories: [],
            performance_trends: [],
            quality_metrics: {
              total_issues: 0,
              critical_issues: 0,
              avg_resolution_time: 0,
              issue_trends: [],
            },
          },
        ];
      });
    });
  };
  SupplierManagementService.prototype.compareSuppliers = function (supplierIds) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, suppliers, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [4 /*yield*/, supabase.from("suppliers").select("*").in("id", supplierIds)];
          case 2:
            (_a = _b.sent()), (suppliers = _a.data), (error = _a.error);
            if (error) {
              throw new Error(
                "Erro ao buscar fornecedores para compara\u00E7\u00E3o: ".concat(error.message),
              );
            }
            // This would include complex performance metrics comparison
            return [
              2 /*return*/,
              {
                suppliers: suppliers,
                comparison_criteria: [],
                performance_metrics: {},
                recommendations: [],
              },
            ];
        }
      });
    });
  };
  // =====================================================================================
  // HELPER METHODS
  // =====================================================================================
  SupplierManagementService.prototype.getDeliveryPerformanceData = function (
    supplierId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would query actual orders/deliveries data
        return [
          2 /*return*/,
          {
            totalOrders: 0,
            onTimeDeliveries: 0,
            lateDeliveries: 0,
            avgDeliveryDays: 0,
          },
        ];
      });
    });
  };
  SupplierManagementService.prototype.getQualityPerformanceData = function (
    supplierId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, qualityIssues;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, supabase_js_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("supplier_quality_issues")
                .select("*")
                .eq("supplier_id", supplierId)
                .gte("issue_date", periodStart)
                .lte("issue_date", periodEnd),
            ];
          case 2:
            qualityIssues = _a.sent().data;
            return [
              2 /*return*/,
              {
                totalItems: 1000, // This would come from actual orders
                defectiveItems:
                  (qualityIssues === null || qualityIssues === void 0
                    ? void 0
                    : qualityIssues.length) || 0,
                returnedItems:
                  (qualityIssues === null || qualityIssues === void 0
                    ? void 0
                    : qualityIssues.filter((i) => i.issue_type === "defective_product").length) ||
                  0,
              },
            ];
        }
      });
    });
  };
  SupplierManagementService.prototype.getFinancialPerformanceData = function (
    supplierId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would query actual financial data
        return [
          2 /*return*/,
          {
            totalOrderValue: 0,
            totalInvoiced: 0,
            totalPaid: 0,
            avgPaymentDelay: 0,
            costSavings: 0,
          },
        ];
      });
    });
  };
  SupplierManagementService.prototype.calculateDeliveryScore = (data) => {
    if (data.totalOrders === 0) return 10;
    var onTimePercentage = (data.onTimeDeliveries / data.totalOrders) * 100;
    return Math.min(10, Math.max(0, onTimePercentage / 10));
  };
  SupplierManagementService.prototype.calculateQualityScore = (data) => {
    if (data.totalItems === 0) return 10;
    var defectivePercentage = (data.defectiveItems / data.totalItems) * 100;
    return Math.min(10, Math.max(0, 10 - defectivePercentage));
  };
  SupplierManagementService.prototype.calculatePerformanceGrade = (score) => {
    if (score >= 9.5) return "A+";
    if (score >= 9.0) return "A";
    if (score >= 8.5) return "B+";
    if (score >= 8.0) return "B";
    if (score >= 7.5) return "C+";
    if (score >= 7.0) return "C";
    if (score >= 6.0) return "D";
    return "F";
  };
  return SupplierManagementService;
})();
exports.SupplierManagementService = SupplierManagementService;
