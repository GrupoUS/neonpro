"use strict";
// ============================================================================
// Supplier Management Hooks - Epic 6, Story 6.3
// ============================================================================
// React hooks for supplier management, performance tracking, procurement,
// and quality management in NeonPro clinic management system
// ============================================================================
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSuppliers = useSuppliers;
exports.useSupplier = useSupplier;
exports.useSupplierPerformance = useSupplierPerformance;
exports.useSupplierAnalytics = useSupplierAnalytics;
exports.useProcurementRequests = useProcurementRequests;
exports.useSupplierBids = useSupplierBids;
exports.useQualityIssues = useQualityIssues;
exports.useSupplierContracts = useSupplierContracts;
exports.useSupplierCommunications = useSupplierCommunications;
exports.useSupplierSearch = useSupplierSearch;
exports.useSupplierDashboard = useSupplierDashboard;
exports.useSupplierProcurement = useSupplierProcurement;
exports.useSupplierQuality = useSupplierQuality;
exports.useSupplierStats = useSupplierStats;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var supplier_1 = require("@/lib/types/supplier");
var client_1 = require("@/lib/supabase/client");
// ============================================================================
// SUPPLIER MANAGEMENT HOOKS
// ============================================================================
/**
 * Hook for managing suppliers - CRUD operations with validation and caching
 */
function useSuppliers(clinicId, filters) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    // Use demo clinic ID if not provided (for testing)
    var effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';
    // Query for fetching suppliers
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['suppliers', effectiveClinicId, filters],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var query, _a, data, error;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        query = supabase
                            .from('suppliers')
                            .select("\n          *,\n          contacts:supplier_contacts(*),\n          products:supplier_products(*),\n          contracts:supplier_contracts(*),\n          performance:supplier_performance_metrics(*)\n        ")
                            .eq('clinic_id', effectiveClinicId)
                            .order('name');
                        // Apply filters
                        if ((_b = filters === null || filters === void 0 ? void 0 : filters.status) === null || _b === void 0 ? void 0 : _b.length) {
                            query = query.in('status', filters.status);
                        }
                        if ((_c = filters === null || filters === void 0 ? void 0 : filters.category) === null || _c === void 0 ? void 0 : _c.length) {
                            query = query.in('category', filters.category);
                        }
                        if ((_d = filters === null || filters === void 0 ? void 0 : filters.riskLevel) === null || _d === void 0 ? void 0 : _d.length) {
                            query = query.in('risk_level', filters.riskLevel);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.search) {
                            query = query.or("name.ilike.%".concat(filters.search, "%,legal_name.ilike.%").concat(filters.search, "%"));
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _e.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    }), _b = _a.data, suppliers = _b === void 0 ? [] : _b, isLoading = _a.isLoading, error = _a.error, refetch = _a.refetch;
    // Create supplier mutation
    var createSupplier = (0, react_query_1.useMutation)({
        mutationFn: function (supplierData) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('suppliers')
                            .insert(__assign(__assign({}, supplierData), { clinic_id: effectiveClinicId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function (newSupplier) {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            sonner_1.toast.success("Fornecedor ".concat(newSupplier.name, " criado com sucesso!"));
        },
        onError: function (error) {
            console.error('Erro ao criar fornecedor:', error);
            sonner_1.toast.error('Erro ao criar fornecedor. Tente novamente.');
        }
    });
    // Update supplier mutation
    var updateSupplier = (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, void 0, void 0, function () {
            var _b, data, error;
            var id = _a.id, supplierData = __rest(_a, ["id"]);
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('suppliers')
                            .update(__assign(__assign({}, supplierData), { updated_at: new Date().toISOString() }))
                            .eq('id', id)
                            .select()
                            .single()];
                    case 1:
                        _b = _c.sent(), data = _b.data, error = _b.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function (updatedSupplier) {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            queryClient.invalidateQueries({ queryKey: ['supplier', updatedSupplier.id] });
            sonner_1.toast.success("Fornecedor ".concat(updatedSupplier.name, " atualizado com sucesso!"));
        },
        onError: function (error) {
            console.error('Erro ao atualizar fornecedor:', error);
            sonner_1.toast.error('Erro ao atualizar fornecedor. Tente novamente.');
        }
    });
    // Delete supplier mutation
    var deleteSupplier = (0, react_query_1.useMutation)({
        mutationFn: function (supplierId) { return __awaiter(_this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('suppliers')
                            .delete()
                            .eq('id', supplierId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, supplierId];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            sonner_1.toast.success('Fornecedor removido com sucesso!');
        },
        onError: function (error) {
            console.error('Erro ao remover fornecedor:', error);
            sonner_1.toast.error('Erro ao remover fornecedor. Tente novamente.');
        }
    });
    // Activate/Deactivate supplier
    var toggleSupplierStatus = (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var _c, data, error;
            var supplierId = _b.supplierId, newStatus = _b.newStatus;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('suppliers')
                            .update({
                            status: newStatus,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', supplierId)
                            .select()
                            .single()];
                    case 1:
                        _c = _d.sent(), data = _c.data, error = _c.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function (updatedSupplier) {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            var statusText = updatedSupplier.status === supplier_1.SupplierStatus.ACTIVE ? 'ativado' : 'desativado';
            sonner_1.toast.success("Fornecedor ".concat(updatedSupplier.name, " ").concat(statusText, " com sucesso!"));
        },
        onError: function (error) {
            console.error('Erro ao alterar status do fornecedor:', error);
            sonner_1.toast.error('Erro ao alterar status do fornecedor. Tente novamente.');
        }
    });
    return {
        suppliers: suppliers,
        isLoading: isLoading,
        error: error,
        refetch: refetch,
        createSupplier: createSupplier.mutate,
        updateSupplier: updateSupplier.mutate,
        deleteSupplier: deleteSupplier.mutate,
        toggleSupplierStatus: toggleSupplierStatus.mutate,
        isCreating: createSupplier.isPending,
        isUpdating: updateSupplier.isPending,
        isDeleting: deleteSupplier.isPending,
        isTogglingStatus: toggleSupplierStatus.isPending
    };
}
/**
 * Hook for managing a single supplier - detailed view with relationships
 */
function useSupplier(supplierId) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier', supplierId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('suppliers')
                            .select("\n          *,\n          contacts:supplier_contacts(*),\n          products:supplier_products(*),\n          contracts:supplier_contracts(*),\n          performance:supplier_performance_metrics(*),\n          communications:supplier_communications(*)\n        ")
                            .eq('id', supplierId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        enabled: !!supplierId,
        staleTime: 2 * 60 * 1000 // 2 minutes
    }), supplier = _a.data, isLoading = _a.isLoading, error = _a.error;
    return {
        supplier: supplier,
        isLoading: isLoading,
        error: error,
        refetch: function () { return queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] }); }
    };
}
// ============================================================================
// PERFORMANCE TRACKING HOOKS
// ============================================================================
/**
 * Hook for managing supplier performance tracking and analytics
 */
function useSupplierPerformance(supplierId, period) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    // Get performance data for supplier
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-performance', supplierId, period],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('supplier_performance_metrics')
                            .select('*')
                            .eq('supplier_id', supplierId)
                            .order('metric_date', { ascending: false });
                        if (period) {
                            query = query.eq('metric_period', period);
                        }
                        else {
                            query = query.limit(12); // Last 12 periods
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        enabled: !!supplierId,
        staleTime: 10 * 60 * 1000 // 10 minutes
    }), performance = _a.data, isLoading = _a.isLoading, error = _a.error;
    // Create performance evaluation
    var createPerformanceEvaluation = (0, react_query_1.useMutation)({
        mutationFn: function (performanceData) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('supplier_performance_metrics')
                            .insert(__assign(__assign({}, performanceData), { created_at: new Date().toISOString() }))
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['supplier-performance'] });
            sonner_1.toast.success('Avaliação de performance criada com sucesso!');
        },
        onError: function (error) {
            console.error('Erro ao criar avaliação:', error);
            sonner_1.toast.error('Erro ao criar avaliação. Tente novamente.');
        }
    });
    // Calculate performance metrics
    var performanceMetrics = (0, react_1.useMemo)(function () {
        if (!(performance === null || performance === void 0 ? void 0 : performance.length))
            return null;
        var latest = performance[0];
        var previous = performance[1];
        return {
            current: latest,
            trend: previous ? {
                scoreChange: latest.quality_score - previous.quality_score,
                deliveryChange: latest.on_time_delivery_rate - previous.on_time_delivery_rate,
                serviceChange: latest.customer_satisfaction - previous.customer_satisfaction
            } : null,
            averageQualityScore: performance.reduce(function (sum, p) { return sum + p.quality_score; }, 0) / performance.length,
            averageDeliveryRate: performance.reduce(function (sum, p) { return sum + p.on_time_delivery_rate; }, 0) / performance.length,
            averageServiceScore: performance.reduce(function (sum, p) { return sum + p.customer_satisfaction; }, 0) / performance.length
        };
    }, [performance]);
    return {
        performance: performance,
        performanceMetrics: performanceMetrics,
        isLoading: isLoading,
        error: error,
        createPerformanceEvaluation: createPerformanceEvaluation.mutate,
        isCreatingEvaluation: createPerformanceEvaluation.isPending
    };
}
/**
 * Hook for performance analytics across all suppliers
 */
function useSupplierAnalytics(clinicId, options) {
    var _this = this;
    var supabase = yield (0, client_1.createClient)();
    var effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-analytics', clinicId, options],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('supplier_analytics')
                            .select('*')
                            .eq('clinic_id', effectiveClinicId)
                            .order('generated_at', { ascending: false })
                            .limit(1)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        staleTime: 30 * 60 * 1000 // 30 minutes
    }), analytics = _a.data, isLoading = _a.isLoading, error = _a.error;
    return {
        analytics: analytics,
        isLoading: isLoading,
        error: error
    };
}
// ============================================================================
// PROCUREMENT & BIDDING HOOKS
// ============================================================================
/**
 * Hook for managing procurement requests
 */
function useProcurementRequests(clinicId, filters) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['procurement-requests', clinicId, filters],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var query, _a, data, error;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        query = supabase
                            .from('procurement_requests')
                            .select("\n          *,\n          items:procurement_items(*),\n          bids:supplier_bids(*)\n        ")
                            .eq('clinic_id', effectiveClinicId)
                            .order('created_at', { ascending: false });
                        // Apply filters
                        if ((_b = filters === null || filters === void 0 ? void 0 : filters.status) === null || _b === void 0 ? void 0 : _b.length) {
                            query = query.in('status', filters.status);
                        }
                        if ((_c = filters === null || filters === void 0 ? void 0 : filters.category) === null || _c === void 0 ? void 0 : _c.length) {
                            query = query.in('category', filters.category);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.dateRange) {
                            query = query
                                .gte('created_at', filters.dateRange.start)
                                .lte('created_at', filters.dateRange.end);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        staleTime: 5 * 60 * 1000
    }), _b = _a.data, requests = _b === void 0 ? [] : _b, isLoading = _a.isLoading, error = _a.error;
    // Create procurement request
    var createProcurementRequest = (0, react_query_1.useMutation)({
        mutationFn: function (requestData) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('procurement_requests')
                            .insert(__assign(__assign({}, requestData), { clinic_id: clinicId, created_at: new Date().toISOString() }))
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function (newRequest) {
            queryClient.invalidateQueries({ queryKey: ['procurement-requests'] });
            sonner_1.toast.success("Solicita\u00E7\u00E3o ".concat(newRequest.title, " criada com sucesso!"));
        },
        onError: function (error) {
            console.error('Erro ao criar solicitação:', error);
            sonner_1.toast.error('Erro ao criar solicitação. Tente novamente.');
        }
    });
    return {
        requests: requests,
        isLoading: isLoading,
        error: error,
        createProcurementRequest: createProcurementRequest.mutate,
        isCreating: createProcurementRequest.isPending
    };
}
/**
 * Hook for managing supplier bids
 */
function useSupplierBids(procurementRequestId) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-bids', procurementRequestId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('supplier_bids')
                            .select("\n          *,\n          supplier:suppliers(*),\n          bid_items:bid_items(*),\n          documents:bid_documents(*)\n        ")
                            .eq('procurement_request_id', procurementRequestId)
                            .order('submitted_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        enabled: !!procurementRequestId,
        staleTime: 2 * 60 * 1000
    }), _b = _a.data, bids = _b === void 0 ? [] : _b, isLoading = _a.isLoading, error = _a.error;
    // Submit bid evaluation
    var evaluateBid = (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var _c, data, error;
            var bidId = _b.bidId, technicalScore = _b.technicalScore, commercialScore = _b.commercialScore, overallScore = _b.overallScore, notes = _b.notes;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('supplier_bids')
                            .update({
                            technical_score: technicalScore,
                            commercial_score: commercialScore,
                            overall_score: overallScore,
                            evaluation_notes: notes,
                            evaluated_at: new Date().toISOString()
                        })
                            .eq('id', bidId)
                            .select()
                            .single()];
                    case 1:
                        _c = _d.sent(), data = _c.data, error = _c.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['supplier-bids'] });
            sonner_1.toast.success('Avaliação da proposta salva com sucesso!');
        },
        onError: function (error) {
            console.error('Erro ao avaliar proposta:', error);
            sonner_1.toast.error('Erro ao avaliar proposta. Tente novamente.');
        }
    });
    return {
        bids: bids,
        isLoading: isLoading,
        error: error,
        evaluateBid: evaluateBid.mutate,
        isEvaluating: evaluateBid.isPending
    };
}
// ============================================================================
// QUALITY MANAGEMENT HOOKS
// ============================================================================
/**
 * Hook for managing quality issues
 */
function useQualityIssues(clinicId, filters) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['quality-issues', clinicId, filters],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var query, _a, data, error;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        query = supabase
                            .from('quality_issues')
                            .select("\n          *,\n          supplier:suppliers(*),\n          corrective_actions:corrective_actions(*),\n          documents:quality_documents(*)\n        ")
                            .eq('clinic_id', effectiveClinicId)
                            .order('reported_date', { ascending: false });
                        // Apply filters
                        if (filters === null || filters === void 0 ? void 0 : filters.supplierId) {
                            query = query.eq('supplier_id', filters.supplierId);
                        }
                        if ((_b = filters === null || filters === void 0 ? void 0 : filters.status) === null || _b === void 0 ? void 0 : _b.length) {
                            query = query.in('status', filters.status);
                        }
                        if ((_c = filters === null || filters === void 0 ? void 0 : filters.severity) === null || _c === void 0 ? void 0 : _c.length) {
                            query = query.in('severity', filters.severity);
                        }
                        if ((_d = filters === null || filters === void 0 ? void 0 : filters.type) === null || _d === void 0 ? void 0 : _d.length) {
                            query = query.in('type', filters.type);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _e.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        staleTime: 3 * 60 * 1000
    }), _b = _a.data, issues = _b === void 0 ? [] : _b, isLoading = _a.isLoading, error = _a.error;
    // Create quality issue
    var createQualityIssue = (0, react_query_1.useMutation)({
        mutationFn: function (issueData) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('quality_issues')
                            .insert(__assign(__assign({}, issueData), { clinic_id: clinicId, reported_date: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function (newIssue) {
            queryClient.invalidateQueries({ queryKey: ['quality-issues'] });
            sonner_1.toast.success("Problema de qualidade #".concat(newIssue.issue_number, " registrado com sucesso!"));
        },
        onError: function (error) {
            console.error('Erro ao registrar problema:', error);
            sonner_1.toast.error('Erro ao registrar problema. Tente novamente.');
        }
    });
    // Update issue status
    var updateIssueStatus = (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var updates, _c, data, error;
            var issueId = _b.issueId, newStatus = _b.newStatus, notes = _b.notes;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        updates = {
                            status: newStatus,
                            updated_at: new Date().toISOString()
                        };
                        // Set resolution date if resolving
                        if (newStatus === supplier_1.IssueStatus.RESOLVED) {
                            updates.resolved_date = new Date().toISOString();
                        }
                        // Set closure date if closing
                        if (newStatus === supplier_1.IssueStatus.CLOSED) {
                            updates.closure_date = new Date().toISOString();
                        }
                        return [4 /*yield*/, supabase
                                .from('quality_issues')
                                .update(updates)
                                .eq('id', issueId)
                                .select()
                                .single()];
                    case 1:
                        _c = _d.sent(), data = _c.data, error = _c.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function (updatedIssue) {
            queryClient.invalidateQueries({ queryKey: ['quality-issues'] });
            sonner_1.toast.success("Status do problema #".concat(updatedIssue.issue_number, " atualizado!"));
        },
        onError: function (error) {
            console.error('Erro ao atualizar status:', error);
            sonner_1.toast.error('Erro ao atualizar status. Tente novamente.');
        }
    });
    return {
        issues: issues,
        isLoading: isLoading,
        error: error,
        createQualityIssue: createQualityIssue.mutate,
        updateIssueStatus: updateIssueStatus.mutate,
        isCreating: createQualityIssue.isPending,
        isUpdatingStatus: updateIssueStatus.isPending
    };
}
// ============================================================================
// CONTRACT MANAGEMENT HOOKS
// ============================================================================
/**
 * Hook for managing supplier contracts
 */
function useSupplierContracts(clinicId, filters) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-contracts', clinicId, filters],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var query, futureDate, _a, data, error;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        query = supabase
                            .from('supplier_contracts')
                            .select("\n          *,\n          supplier:suppliers(*),\n          amendments:contract_amendments(*)\n        ")
                            .eq('clinic_id', effectiveClinicId)
                            .order('start_date', { ascending: false });
                        // Apply filters
                        if (filters === null || filters === void 0 ? void 0 : filters.supplierId) {
                            query = query.eq('supplier_id', filters.supplierId);
                        }
                        if ((_b = filters === null || filters === void 0 ? void 0 : filters.status) === null || _b === void 0 ? void 0 : _b.length) {
                            query = query.in('status', filters.status);
                        }
                        if ((_c = filters === null || filters === void 0 ? void 0 : filters.type) === null || _c === void 0 ? void 0 : _c.length) {
                            query = query.in('type', filters.type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.expiringIn) {
                            futureDate = new Date();
                            futureDate.setDate(futureDate.getDate() + filters.expiringIn);
                            query = query.lte('end_date', futureDate.toISOString());
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        staleTime: 10 * 60 * 1000
    }), _b = _a.data, contracts = _b === void 0 ? [] : _b, isLoading = _a.isLoading, error = _a.error;
    // Get contracts expiring soon
    var expiringContracts = (0, react_1.useMemo)(function () {
        var thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return contracts.filter(function (contract) {
            return contract.end_date &&
                new Date(contract.end_date) <= thirtyDaysFromNow &&
                contract.status === 'active';
        });
    }, [contracts]);
    return {
        contracts: contracts,
        expiringContracts: expiringContracts,
        isLoading: isLoading,
        error: error
    };
}
// ============================================================================
// COMMUNICATION HOOKS
// ============================================================================
/**
 * Hook for managing supplier communications
 */
function useSupplierCommunications(supplierId) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var supabase = yield (0, client_1.createClient)();
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-communications', supplierId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('supplier_communications')
                            .select("\n          *,\n          attachments:communication_attachments(*)\n        ")
                            .eq('supplier_id', supplierId)
                            .order('timestamp', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        enabled: !!supplierId,
        staleTime: 2 * 60 * 1000
    }), _b = _a.data, communications = _b === void 0 ? [] : _b, isLoading = _a.isLoading, error = _a.error;
    // Create communication record
    var createCommunication = (0, react_query_1.useMutation)({
        mutationFn: function (communicationData) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('supplier_communications')
                            .insert(__assign(__assign({}, communicationData), { timestamp: new Date().toISOString() }))
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['supplier-communications'] });
            sonner_1.toast.success('Comunicação registrada com sucesso!');
        },
        onError: function (error) {
            console.error('Erro ao registrar comunicação:', error);
            sonner_1.toast.error('Erro ao registrar comunicação. Tente novamente.');
        }
    });
    return {
        communications: communications,
        isLoading: isLoading,
        error: error,
        createCommunication: createCommunication.mutate,
        isCreating: createCommunication.isPending
    };
}
// ============================================================================
// UTILITY HOOKS
// ============================================================================
/**
 * Hook for supplier search and filtering
 */
function useSupplierSearch() {
    var _a = (0, react_1.useState)(''), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = (0, react_1.useState)([]), selectedCategories = _b[0], setSelectedCategories = _b[1];
    var _c = (0, react_1.useState)([]), selectedStatuses = _c[0], setSelectedStatuses = _c[1];
    var _d = (0, react_1.useState)([]), selectedRiskLevels = _d[0], setSelectedRiskLevels = _d[1];
    var filters = (0, react_1.useMemo)(function () { return ({
        search: searchTerm.trim() || undefined,
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        riskLevel: selectedRiskLevels.length > 0 ? selectedRiskLevels : undefined
    }); }, [searchTerm, selectedCategories, selectedStatuses, selectedRiskLevels]);
    var clearFilters = (0, react_1.useCallback)(function () {
        setSearchTerm('');
        setSelectedCategories([]);
        setSelectedStatuses([]);
        setSelectedRiskLevels([]);
    }, []);
    return {
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
        selectedCategories: selectedCategories,
        setSelectedCategories: setSelectedCategories,
        selectedStatuses: selectedStatuses,
        setSelectedStatuses: setSelectedStatuses,
        selectedRiskLevels: selectedRiskLevels,
        setSelectedRiskLevels: setSelectedRiskLevels,
        filters: filters,
        clearFilters: clearFilters,
        hasActiveFilters: Object.values(filters).some(Boolean)
    };
}
/**
 * Hook for supplier dashboard statistics
 */
function useSupplierDashboard(clinicId) {
    var _this = this;
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-dashboard', clinicId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would typically be a complex aggregation query
                // For now, we'll return placeholder data
                return [2 /*return*/, {
                        totalSuppliers: 0,
                        activeSuppliers: 0,
                        averagePerformance: 0,
                        qualityIssues: 0,
                        expiringContracts: 0,
                        pendingEvaluations: 0
                    }];
            });
        }); },
        staleTime: 15 * 60 * 1000 // 15 minutes
    }), stats = _a.data, isLoading = _a.isLoading;
    return {
        stats: stats,
        isLoading: isLoading
    };
}
/**
 * Hook for supplier procurement metrics and management
 */
function useSupplierProcurement(supplierId, clinicId) {
    var _this = this;
    var effectiveClinicId = clinicId || 'demo-clinic-id';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-procurement', supplierId, effectiveClinicId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var supabase, procurements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('supplier_products')
                                .select("\n          *,\n          supplier_contracts!inner(*)\n        ")
                                .eq('supplier_id', supplierId)];
                    case 2:
                        procurements = (_a.sent()).data;
                        return [2 /*return*/, {
                                procurements: procurements || [],
                                totalOrders: (procurements === null || procurements === void 0 ? void 0 : procurements.length) || 0,
                                totalValue: (procurements === null || procurements === void 0 ? void 0 : procurements.reduce(function (sum, p) { return sum + (p.unit_price * p.minimum_order_quantity); }, 0)) || 0,
                                averageOrderTime: 7, // placeholder
                                onTimeDeliveryRate: 0.85 // placeholder
                            }];
                }
            });
        }); },
        enabled: !!supplierId
    }), procurementData = _a.data, isLoading = _a.isLoading;
    return {
        procurementData: procurementData,
        isLoading: isLoading
    };
}
/**
 * Hook for supplier quality metrics and tracking
 */
function useSupplierQuality(supplierId, clinicId) {
    var _this = this;
    var effectiveClinicId = clinicId || 'demo-clinic-id';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-quality', supplierId, effectiveClinicId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var supabase, performance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('supplier_performance')
                                .select('*')
                                .eq('supplier_id', supplierId)
                                .order('evaluation_date', { ascending: false })
                                .limit(12)];
                    case 2:
                        performance = (_a.sent()).data;
                        return [2 /*return*/, {
                                performance: performance || [],
                                averageRating: (performance === null || performance === void 0 ? void 0 : performance.reduce(function (sum, p) { return sum + p.overall_rating; }, 0)) / ((performance === null || performance === void 0 ? void 0 : performance.length) || 1) || 0,
                                qualityTrend: 'stable', // placeholder
                                certificationStatus: 'valid' // placeholder
                            }];
                }
            });
        }); },
        enabled: !!supplierId
    }), qualityData = _a.data, isLoading = _a.isLoading;
    return {
        qualityData: qualityData,
        isLoading: isLoading
    };
}
/**
 * Hook for supplier statistics and analytics
 */
function useSupplierStats(clinicId) {
    var _this = this;
    var effectiveClinicId = clinicId || 'demo-clinic-id';
    var _a = (0, react_query_1.useQuery)({
        queryKey: ['supplier-stats', effectiveClinicId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var supabase, suppliers, totalSuppliers, activeSuppliers, categoryCounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('suppliers')
                                .select('status, category, risk_level')];
                    case 2:
                        suppliers = (_a.sent()).data;
                        totalSuppliers = (suppliers === null || suppliers === void 0 ? void 0 : suppliers.length) || 0;
                        activeSuppliers = (suppliers === null || suppliers === void 0 ? void 0 : suppliers.filter(function (s) { return s.status === 'active'; }).length) || 0;
                        categoryCounts = (suppliers === null || suppliers === void 0 ? void 0 : suppliers.reduce(function (acc, s) {
                            acc[s.category] = (acc[s.category] || 0) + 1;
                            return acc;
                        }, {})) || {};
                        return [2 /*return*/, {
                                totalSuppliers: totalSuppliers,
                                activeSuppliers: activeSuppliers,
                                categoryCounts: categoryCounts,
                                riskDistribution: {
                                    low: (suppliers === null || suppliers === void 0 ? void 0 : suppliers.filter(function (s) { return s.risk_level === 'low'; }).length) || 0,
                                    medium: (suppliers === null || suppliers === void 0 ? void 0 : suppliers.filter(function (s) { return s.risk_level === 'medium'; }).length) || 0,
                                    high: (suppliers === null || suppliers === void 0 ? void 0 : suppliers.filter(function (s) { return s.risk_level === 'high'; }).length) || 0
                                }
                            }];
                }
            });
        }); },
        staleTime: 10 * 60 * 1000 // 10 minutes
    }), stats = _a.data, isLoading = _a.isLoading;
    return {
        stats: stats,
        isLoading: isLoading
    };
}
