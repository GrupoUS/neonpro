'use client';
"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var lodash_1 = require("lodash");
var react_query_1 = require("@tanstack/react-query");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
// Optimized API hooks with caching and debouncing
var useOptimizedConflictApi = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    var requestCache = (0, react_1.useRef)(new Map());
    var batchQueue = (0, react_1.useRef)([]);
    var batchTimer = (0, react_1.useRef)(null);
    // Debounced search function
    var debouncedSearch = (0, react_1.useCallback)((0, lodash_1.debounce)(function (searchTerm, filters) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, queryClient.invalidateQueries({ queryKey: ['conflicts', 'search', searchTerm, filters] })];
        });
    }); }, 300), [queryClient]);
    // Request deduplication
    var deduplicatedRequest = (0, react_1.useCallback)(function (key, requestFn) { return __awaiter(void 0, void 0, void 0, function () {
        var promise;
        return __generator(this, function (_a) {
            if (requestCache.current.has(key)) {
                return [2 /*return*/, requestCache.current.get(key)];
            }
            promise = requestFn().finally(function () {
                requestCache.current.delete(key);
            });
            requestCache.current.set(key, promise);
            return [2 /*return*/, promise];
        });
    }); }, []);
    // Batch request processing
    var processBatch = (0, react_1.useCallback)(function () {
        if (batchQueue.current.length === 0)
            return;
        var batch = __spreadArray([], batchQueue.current, true);
        batchQueue.current = [];
        // Process batch of conflict checks
        var batchRequest = fetch('/api/scheduling/conflicts/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: batch.map(function (item) { return ({ id: item.id }); }),
                timestamp: new Date().toISOString()
            })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
            batch.forEach(function (item, index) {
                if (data.results && data.results[index]) {
                    item.resolve(data.results[index]);
                }
                else {
                    item.reject(new Error('Batch request failed'));
                }
            });
        })
            .catch(function (error) {
            batch.forEach(function (item) { return item.reject(error); });
        });
        return batchRequest;
    }, []);
    // Batched conflict check
    var batchedConflictCheck = (0, react_1.useCallback)(function (conflictId) {
        return new Promise(function (resolve, reject) {
            batchQueue.current.push({ id: conflictId, resolve: resolve, reject: reject });
            if (batchTimer.current) {
                clearTimeout(batchTimer.current);
            }
            batchTimer.current = setTimeout(processBatch, 50); // 50ms batch window
        });
    }, [processBatch]);
    return {
        debouncedSearch: debouncedSearch,
        deduplicatedRequest: deduplicatedRequest,
        batchedConflictCheck: batchedConflictCheck
    };
};
// Intelligent cache management with TTL
var useCacheManager = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    var invalidateConflictCache = (0, react_1.useCallback)(function (conflictId) {
        if (conflictId) {
            queryClient.invalidateQueries({ queryKey: ['conflicts', conflictId] });
        }
        else {
            queryClient.invalidateQueries({ queryKey: ['conflicts'] });
        }
    }, [queryClient]);
    var setCachedData = (0, react_1.useCallback)(function (key, data, ttl) {
        if (ttl === void 0) { ttl = 300000; }
        queryClient.setQueryData(key, data);
        // Set TTL for automatic invalidation
        setTimeout(function () {
            queryClient.invalidateQueries({ queryKey: key });
        }, ttl);
    }, [queryClient]);
    return { invalidateConflictCache: invalidateConflictCache, setCachedData: setCachedData };
}; // Main component with optimized API usage
var ScheduleConflictResolverOptimized = function () {
    var _a = (0, react_1.useState)(''), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = (0, react_1.useState)({
        severity: 'all',
        type: 'all',
        dateRange: 'today'
    }), filters = _b[0], setFilters = _b[1];
    var _c = (0, react_1.useState)([]), selectedConflicts = _c[0], setSelectedConflicts = _c[1];
    var _d = (0, react_1.useState)(false), isResolving = _d[0], setIsResolving = _d[1];
    var _e = useOptimizedConflictApi(), debouncedSearch = _e.debouncedSearch, deduplicatedRequest = _e.deduplicatedRequest, batchedConflictCheck = _e.batchedConflictCheck;
    var _f = useCacheManager(), invalidateConflictCache = _f.invalidateConflictCache, setCachedData = _f.setCachedData;
    // Optimized conflicts query with caching
    var _g = (0, react_query_1.useQuery)({
        queryKey: ['conflicts', 'list', searchTerm, filters],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var cacheKey;
            return __generator(this, function (_a) {
                cacheKey = "conflicts-".concat(JSON.stringify({ searchTerm: searchTerm, filters: filters }));
                return [2 /*return*/, deduplicatedRequest(cacheKey, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var response, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetch('/api/scheduling/conflicts', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            search: searchTerm,
                                            filters: filters,
                                            includeResolutions: true,
                                            timestamp: new Date().toISOString()
                                        })
                                    })];
                                case 1:
                                    response = _a.sent();
                                    if (!response.ok) {
                                        throw new Error("API Error: ".concat(response.status));
                                    }
                                    return [4 /*yield*/, response.json()];
                                case 2:
                                    result = _a.sent();
                                    if (!result.success) {
                                        throw new Error(result.error || 'Failed to fetch conflicts');
                                    }
                                    return [2 /*return*/, result.data];
                            }
                        });
                    }); })];
            });
        }); },
        staleTime: 60000, // 1 minute cache
        gcTime: 300000, // 5 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchInterval: false,
        retry: function (failureCount, error) {
            var _a, _b;
            // Smart retry logic for healthcare applications
            if (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('403')) || ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('401'))) {
                return false; // Don't retry auth errors
            }
            return failureCount < 3;
        }
    }), conflictsData = _g.data, conflictsLoading = _g.isLoading, conflictsError = _g.error, refetchConflicts = _g.refetch;
    // Optimized resolution mutation with batch processing
    var resolveConflictsMutation = (0, react_query_1.useMutation)({
        mutationFn: function (resolutionData) { return __awaiter(void 0, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsResolving(true);
                        return [4 /*yield*/, fetch('/api/scheduling/conflicts/resolve-batch', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-LGPD-Consent': 'true' // Healthcare compliance header
                                },
                                body: JSON.stringify(__assign(__assign({}, resolutionData), { timestamp: new Date().toISOString(), batchSize: resolutionData.conflictIds.length }))
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Resolution failed: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Failed to resolve conflicts');
                        }
                        return [2 /*return*/, result.data];
                }
            });
        }); },
        onSuccess: function (data) {
            // Invalidate relevant caches
            invalidateConflictCache();
            setSelectedConflicts([]);
            setIsResolving(false);
            sonner_1.toast.success("Successfully resolved ".concat(data.resolvedCount, " conflicts"), {
                description: "".concat(data.rescheduled, " rescheduled, ").concat(data.cancelled, " cancelled")
            });
        },
        onError: function (error) {
            setIsResolving(false);
            sonner_1.toast.error('Failed to resolve conflicts', {
                description: error.message
            });
        }
    });
    // Debounced search handler
    var handleSearch = (0, react_1.useCallback)(function (value) {
        setSearchTerm(value);
        debouncedSearch(value, filters);
    }, [filters, debouncedSearch]);
    // Optimized filter change handler
    var handleFilterChange = (0, react_1.useCallback)(function (newFilters) {
        setFilters(newFilters);
        // Cache previous results while loading new ones
        var currentData = conflictsData;
        if (currentData) {
            setCachedData(['conflicts', 'list', searchTerm, newFilters], currentData, 30000);
        }
    }, [conflictsData, searchTerm, setCachedData]);
    // Memoized conflict statistics
    var conflictStats = (0, react_1.useMemo)(function () {
        if (!conflictsData)
            return null;
        return {
            total: conflictsData.length,
            critical: conflictsData.filter(function (c) { return c.severity === 'critical'; }).length,
            high: conflictsData.filter(function (c) { return c.severity === 'high'; }).length,
            pending: conflictsData.filter(function (c) { return !c.suggestedResolutions.length; }).length
        };
    }, [conflictsData]);
    // Batch resolution handler
    var handleBatchResolve = (0, react_1.useCallback)(function (resolutionType) { return __awaiter(void 0, void 0, void 0, function () {
        var selectedData, hasEmergency;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedConflicts.length === 0) {
                        sonner_1.toast.warning('Please select conflicts to resolve');
                        return [2 /*return*/];
                    }
                    selectedData = (conflictsData === null || conflictsData === void 0 ? void 0 : conflictsData.filter(function (c) { return selectedConflicts.includes(c.id); })) || [];
                    hasEmergency = selectedData.some(function (c) { return c.metadata.emergencyFlag; });
                    if (hasEmergency) {
                        sonner_1.toast.warning('Emergency cases require individual resolution for compliance');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, resolveConflictsMutation.mutateAsync({
                            conflictIds: selectedConflicts,
                            resolutionType: resolutionType,
                            metadata: {
                                batchProcessed: true,
                                lgpdCompliant: true,
                                processingTime: new Date().toISOString()
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [selectedConflicts, conflictsData, resolveConflictsMutation]);
    // Real-time conflict detection (optimized)
    (0, react_1.useEffect)(function () {
        var eventSource = new EventSource('/api/scheduling/conflicts/stream');
        eventSource.onmessage = function (event) {
            var newConflict = JSON.parse(event.data);
            // Update cache with new conflict
            if (conflictsData) {
                var updatedData = __spreadArray([newConflict], conflictsData, true);
                setCachedData(['conflicts', 'list', searchTerm, filters], updatedData, 60000);
            }
            // Show notification for critical conflicts
            if (newConflict.severity === 'critical') {
                sonner_1.toast.error("Critical conflict detected: ".concat(newConflict.description), {
                    action: {
                        label: 'Resolve',
                        onClick: function () { return setSelectedConflicts([newConflict.id]); }
                    }
                });
            }
        };
        eventSource.onerror = function () {
            console.warn('Conflict stream disconnected, falling back to polling');
            // Fallback to periodic refresh
            var interval = setInterval(function () {
                refetchConflicts();
            }, 30000);
            return function () { return clearInterval(interval); };
        };
        return function () {
            eventSource.close();
        };
    }, [conflictsData, searchTerm, filters, setCachedData, refetchConflicts]);
    return (<div className="space-y-6 p-6">[Content continues...]      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Conflicts</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(conflictStats === null || conflictStats === void 0 ? void 0 : conflictStats.total) || 0}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Critical</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(conflictStats === null || conflictStats === void 0 ? void 0 : conflictStats.critical) || 0}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">High Priority</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-orange-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(conflictStats === null || conflictStats === void 0 ? void 0 : conflictStats.high) || 0}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Pending Resolution</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-yellow-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(conflictStats === null || conflictStats === void 0 ? void 0 : conflictStats.pending) || 0}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Optimized Search and Filters */}
      <card_1.Card className="mb-6">
        <card_1.CardHeader>
          <card_1.CardTitle>Conflict Search & Filters</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Search conflicts by patient, professional, or description..." value={searchTerm} onChange={function (e) { return handleSearch(e.target.value); }} className="pl-10"/>
              </div>
            </div>
            
            <div className="flex gap-2">
              <select value={filters.severity} onChange={function (e) { return handleFilterChange(__assign(__assign({}, filters), { severity: e.target.value })); }} className="px-3 py-2 border rounded-md">
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select value={filters.type} onChange={function (e) { return handleFilterChange(__assign(__assign({}, filters), { type: e.target.value })); }} className="px-3 py-2 border rounded-md">
                <option value="all">All Types</option>
                <option value="scheduling">Scheduling</option>
                <option value="resource">Resource</option>
                <option value="professional">Professional</option>
                <option value="patient">Patient</option>
              </select>

              <select value={filters.dateRange} onChange={function (e) { return handleFilterChange(__assign(__assign({}, filters), { dateRange: e.target.value })); }} className="px-3 py-2 border rounded-md">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Batch Actions */}
      {selectedConflicts.length > 0 && (<card_1.Card className="mb-6 border-blue-200 bg-blue-50">
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <lucide_react_1.CheckCircle2 className="h-5 w-5 text-blue-600"/>
                <span className="font-medium">
                  {selectedConflicts.length} conflicts selected
                </span>
              </div>
              
              <div className="flex gap-2">
                <button_1.Button variant="outline" size="sm" onClick={function () { return handleBatchResolve('reschedule'); }} disabled={isResolving}>
                  Batch Reschedule
                </button_1.Button>
                <button_1.Button variant="outline" size="sm" onClick={function () { return handleBatchResolve('reassign'); }} disabled={isResolving}>
                  Batch Reassign
                </button_1.Button>
                <button_1.Button variant="outline" size="sm" onClick={function () { return setSelectedConflicts([]); }}>
                  Clear Selection
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Error Handling */}
      {conflictsError && (<alert_1.Alert className="mb-6">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertDescription>
            Failed to load conflicts: {conflictsError.message}
            <button_1.Button variant="outline" size="sm" onClick={function () { return refetchConflicts(); }} className="ml-2">
              Retry
            </button_1.Button>
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Optimized Conflicts List */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Active Conflicts</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {conflictsLoading ? (<div className="space-y-4">
              {__spreadArray([], Array(5), true).map(function (_, i) { return (<div key={i} className="flex items-center space-x-4">
                  <skeleton_1.Skeleton className="h-12 w-12 rounded-full"/>
                  <div className="space-y-2">
                    <skeleton_1.Skeleton className="h-4 w-[250px]"/>
                    <skeleton_1.Skeleton className="h-4 w-[200px]"/>
                  </div>
                </div>); })}
            </div>) : conflictsData && conflictsData.length > 0 ? (<div className="space-y-4">
              {conflictsData.map(function (conflict) { return (<ConflictCard key={conflict.id} conflict={conflict} isSelected={selectedConflicts.includes(conflict.id)} onSelect={function (selected) {
                    if (selected) {
                        setSelectedConflicts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [conflict.id], false); });
                    }
                    else {
                        setSelectedConflicts(function (prev) { return prev.filter(function (id) { return id !== conflict.id; }); });
                    }
                }} onResolve={function (resolutionType) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, resolveConflictsMutation.mutateAsync({
                                    conflictIds: [conflict.id],
                                    resolutionType: resolutionType,
                                    metadata: {
                                        individualResolution: true,
                                        emergencyFlag: conflict.metadata.emergencyFlag,
                                        clinicalPriority: conflict.metadata.clinicalPriority
                                    }
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }}/>); })}
            </div>) : (<div className="text-center py-8 text-muted-foreground">
              <lucide_react_1.CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500"/>
              <p className="text-lg font-medium">No conflicts found</p>
              <p className="text-sm">All appointments are properly scheduled</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
// Optimized Conflict Card Component
var ConflictCard = react_1.default.memo(function (_a) {
    var conflict = _a.conflict, isSelected = _a.isSelected, onSelect = _a.onSelect, onResolve = _a.onResolve;
    var _b = (0, react_1.useState)(false), isResolving = _b[0], setIsResolving = _b[1];
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'critical': return 'border-red-500 bg-red-50';
            case 'high': return 'border-orange-500 bg-orange-50';
            case 'medium': return 'border-yellow-500 bg-yellow-50';
            default: return 'border-gray-300 bg-gray-50';
        }
    };
    var handleResolve = function (resolutionType) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsResolving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, onResolve(resolutionType)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsResolving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div className={"border rounded-lg p-4 ".concat(getSeverityColor(conflict.severity), " ").concat(isSelected ? 'ring-2 ring-blue-500' : '')}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input type="checkbox" checked={isSelected} onChange={function (e) { return onSelect(e.target.checked); }} className="mt-1" disabled={conflict.metadata.emergencyFlag} // Emergency cases require individual handling
    />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <badge_1.Badge variant={conflict.severity === 'critical' ? 'destructive' : 'secondary'}>
                {conflict.severity.toUpperCase()}
              </badge_1.Badge>
              <badge_1.Badge variant="outline">{conflict.type}</badge_1.Badge>
              {conflict.metadata.emergencyFlag && (<badge_1.Badge variant="destructive">EMERGENCY</badge_1.Badge>)}
            </div>
            
            <h4 className="font-medium mb-1">{conflict.description}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Time: {new Date(conflict.conflictTime).toLocaleString()}
            </p>
            
            {conflict.suggestedResolutions.length > 0 && (<div className="space-y-2">
                <p className="text-sm font-medium">Suggested Resolutions:</p>
                {conflict.suggestedResolutions.map(function (resolution) { return (<div key={resolution.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div>
                      <p className="text-sm font-medium">{resolution.description}</p>
                      <p className="text-xs text-muted-foreground">{resolution.impact}</p>
                    </div>
                    <button_1.Button size="sm" variant="outline" onClick={function () { return handleResolve(resolution.type); }} disabled={isResolving}>
                      Apply
                    </button_1.Button>
                  </div>); })}
              </div>)}
          </div>
        </div>
        
        <button_1.Button variant="ghost" size="sm" onClick={function () { return onSelect(!isSelected); }}>
          <lucide_react_1.X className="h-4 w-4"/>
        </button_1.Button>
      </div>
    </div>);
});
ConflictCard.displayName = 'ConflictCard';
exports.default = ScheduleConflictResolverOptimized;
