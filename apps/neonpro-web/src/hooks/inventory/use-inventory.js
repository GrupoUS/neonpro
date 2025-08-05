/**
 * Inventory Management Hook
 * React hook for real-time inventory management
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */
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
exports.useInventory = useInventory;
var inventory_1 = require("@/lib/supabase/inventory");
var inventory_2 = require("@/lib/types/inventory");
var react_1 = require("react");
function useInventory(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var _a = options.enableRealTime, enableRealTime = _a === void 0 ? true : _a, _b = options.autoLoadData, autoLoadData = _b === void 0 ? true : _b, _c = options.alertRefreshInterval // 30 seconds
    , alertRefreshInterval = _c === void 0 ? 30000 : _c // 30 seconds
    ;
    // State
    var _d = (0, react_1.useState)({
        items: [],
        locations: [],
        categories: [],
        movements: [],
        alerts: [],
        activeSessions: [],
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
        isRealTimeEnabled: enableRealTime,
        connectionStatus: inventory_2.ConnectionStatus.DISCONNECTED
    }), state = _d[0], setState = _d[1];
    var _e = (0, react_1.useState)(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(false), isUpdating = _f[0], setIsUpdating = _f[1];
    // Refs for real-time subscriptions
    var inventoryChannel = (0, react_1.useRef)(null);
    var alertsChannel = (0, react_1.useRef)(null);
    var alertInterval = (0, react_1.useRef)(null);
    // Load inventory items with filters
    var loadInventoryItems = (0, react_1.useCallback)(function (filters) { return __awaiter(_this, void 0, void 0, function () {
        var response_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    setState(function (prev) { return (__assign(__assign({}, prev), { loading: true, error: null })); });
                    return [4 /*yield*/, (0, inventory_1.getInventoryItems)(filters)];
                case 1:
                    response_1 = _a.sent();
                    if (response_1.success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { items: response_1.data, loading: false, lastUpdated: new Date().toISOString() })); });
                    }
                    else {
                        throw new Error(response_1.message || 'Failed to load inventory items');
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading inventory items:', error_1);
                    setState(function (prev) { return (__assign(__assign({}, prev), { loading: false, error: error_1 instanceof Error ? error_1.message : 'Unknown error' })); });
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load categories
    var loadCategories = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response_2, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.getInventoryCategories)()];
                case 1:
                    response_2 = _a.sent();
                    if (response_2.success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { categories: response_2.data })); });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error loading categories:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load locations
    var loadLocations = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response_3, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.getInventoryLocations)()];
                case 1:
                    response_3 = _a.sent();
                    if (response_3.success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { locations: response_3.data })); });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error loading locations:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load alerts
    var loadAlerts = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response_4, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.getStockAlerts)({
                            status: inventory_2.AlertStatus.ACTIVE,
                            limit: 50
                        })];
                case 1:
                    response_4 = _a.sent();
                    if (response_4.success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { alerts: response_4.data })); });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error loading alerts:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Refresh all data
    var refreshData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        loadInventoryItems({
                            category_id: state.selectedCategory,
                            location_id: state.selectedLocation,
                            search: state.searchQuery
                        }),
                        loadCategories(),
                        loadLocations(),
                        loadAlerts()
                    ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [loadInventoryItems, loadCategories, loadLocations, loadAlerts, state.selectedCategory, state.selectedLocation, state.searchQuery]);
    // Update stock level
    var updateStock = (0, react_1.useCallback)(function (itemId, quantity, movementType, locationId, options) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 8]);
                    setIsUpdating(true);
                    return [4 /*yield*/, (0, inventory_1.updateStockLevel)(itemId, quantity, movementType, locationId, options)];
                case 1:
                    response = _a.sent();
                    if (!response.success) return [3 /*break*/, 4];
                    // Refresh inventory items to get updated stock levels
                    return [4 /*yield*/, loadInventoryItems({
                            category_id: state.selectedCategory,
                            location_id: state.selectedLocation,
                            search: state.searchQuery
                        })];
                case 2:
                    // Refresh inventory items to get updated stock levels
                    _a.sent();
                    // Refresh alerts as stock changes might trigger new alerts
                    return [4 /*yield*/, loadAlerts()];
                case 3:
                    // Refresh alerts as stock changes might trigger new alerts
                    _a.sent();
                    return [2 /*return*/, true];
                case 4: throw new Error(response.message || 'Failed to update stock');
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_5 = _a.sent();
                    console.error('Error updating stock:', error_5);
                    setState(function (prev) { return (__assign(__assign({}, prev), { error: error_5 instanceof Error ? error_5.message : 'Unknown error' })); });
                    return [2 /*return*/, false];
                case 7:
                    setIsUpdating(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [loadInventoryItems, loadAlerts, state.selectedCategory, state.selectedLocation, state.searchQuery]);
    // Scan barcode
    var scanBarcode = (0, react_1.useCallback)(function (barcodeValue) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.getInventoryItemByBarcode)(barcodeValue)];
                case 1:
                    response = _a.sent();
                    if (response.success && response.data) {
                        return [2 /*return*/, {
                                success: true,
                                item: response.data,
                                message: 'Item found successfully'
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                success: false,
                                message: 'Item not found for this barcode'
                            }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error scanning barcode:', error_6);
                    return [2 /*return*/, {
                            success: false,
                            message: error_6 instanceof Error ? error_6.message : 'Unknown error'
                        }];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Start barcode session
    var startSession = (0, react_1.useCallback)(function (sessionType, locationId) { return __awaiter(_this, void 0, void 0, function () {
        var response_5, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.createBarcodeSession)(sessionType, locationId)];
                case 1:
                    response_5 = _a.sent();
                    if (response_5.success && response_5.data) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { activeSessions: __spreadArray(__spreadArray([], prev.activeSessions, true), [response_5.data], false) })); });
                        return [2 /*return*/, response_5.data];
                    }
                    return [2 /*return*/, null];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error starting session:', error_7);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Add scan to session
    var addScanToSession = (0, react_1.useCallback)(function (sessionId, barcodeValue) { return __awaiter(_this, void 0, void 0, function () {
        var scanResult, response, error_8;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, scanBarcode(barcodeValue)];
                case 1:
                    scanResult = _b.sent();
                    return [4 /*yield*/, (0, inventory_1.addScannedItem)(sessionId, barcodeValue, scanResult.success ? 'success' : 'item_not_found', (_a = scanResult.item) === null || _a === void 0 ? void 0 : _a.id, scanResult.success ? undefined : scanResult.message)];
                case 2:
                    response = _b.sent();
                    if (response.success && response.data) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, null];
                case 3:
                    error_8 = _b.sent();
                    console.error('Error adding scan to session:', error_8);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [scanBarcode]);
    // End session
    var endSession = (0, react_1.useCallback)(function (sessionId, notes) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.completeBarcodeSession)(sessionId, notes)];
                case 1:
                    response = _a.sent();
                    if (response.success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { activeSessions: prev.activeSessions.filter(function (session) { return session.id !== sessionId; }) })); });
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 2:
                    error_9 = _a.sent();
                    console.error('Error ending session:', error_9);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Resolve alert
    var resolveAlert = (0, react_1.useCallback)(function (alertId, notes) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, inventory_1.resolveStockAlert)(alertId, notes)];
                case 1:
                    response = _a.sent();
                    if (response.success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { alerts: prev.alerts.filter(function (alert) { return alert.id !== alertId; }) })); });
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 2:
                    error_10 = _a.sent();
                    console.error('Error resolving alert:', error_10);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Filter setters
    var setLocationFilter = (0, react_1.useCallback)(function (locationId) {
        setState(function (prev) { return (__assign(__assign({}, prev), { selectedLocation: locationId })); });
    }, []);
    var setCategoryFilter = (0, react_1.useCallback)(function (categoryId) {
        setState(function (prev) { return (__assign(__assign({}, prev), { selectedCategory: categoryId })); });
    }, []);
    var setSearchQuery = (0, react_1.useCallback)(function (query) {
        setState(function (prev) { return (__assign(__assign({}, prev), { searchQuery: query })); });
    }, []);
    // Real-time connection management
    var reconnect = (0, react_1.useCallback)(function () {
        if (enableRealTime) {
            setupRealTimeSubscriptions();
        }
    }, [enableRealTime]);
    // Setup real-time subscriptions
    var setupRealTimeSubscriptions = (0, react_1.useCallback)(function () {
        try {
            setState(function (prev) { return (__assign(__assign({}, prev), { connectionStatus: inventory_2.ConnectionStatus.RECONNECTING })); });
            // Subscribe to inventory updates
            inventoryChannel.current = (0, inventory_1.subscribeToInventoryUpdates)(function (payload) {
                console.log('Inventory update received:', payload);
                // Refresh data when changes occur
                refreshData();
                setState(function (prev) { return (__assign(__assign({}, prev), { lastUpdated: new Date().toISOString(), connectionStatus: inventory_2.ConnectionStatus.CONNECTED })); });
            });
            // Subscribe to new alerts
            alertsChannel.current = (0, inventory_1.subscribeToStockAlerts)(function (payload) {
                console.log('New alert received:', payload);
                // Add new alert to state
                if (payload.eventType === 'INSERT' && payload.new) {
                    setState(function (prev) { return (__assign(__assign({}, prev), { alerts: __spreadArray([payload.new], prev.alerts, true) })); });
                }
            });
            setState(function (prev) { return (__assign(__assign({}, prev), { connectionStatus: inventory_2.ConnectionStatus.CONNECTED })); });
        }
        catch (error) {
            console.error('Error setting up real-time subscriptions:', error);
            setState(function (prev) { return (__assign(__assign({}, prev), { connectionStatus: inventory_2.ConnectionStatus.ERROR })); });
        }
    }, [refreshData]);
    // Cleanup real-time subscriptions
    var cleanupSubscriptions = (0, react_1.useCallback)(function () {
        if (inventoryChannel.current) {
            inventoryChannel.current.unsubscribe();
            inventoryChannel.current = null;
        }
        if (alertsChannel.current) {
            alertsChannel.current.unsubscribe();
            alertsChannel.current = null;
        }
        if (alertInterval.current) {
            clearInterval(alertInterval.current);
            alertInterval.current = null;
        }
    }, []);
    // Initialize hook
    (0, react_1.useEffect)(function () {
        if (autoLoadData) {
            refreshData();
        }
        if (enableRealTime) {
            setupRealTimeSubscriptions();
        }
        // Setup alert refresh interval
        alertInterval.current = setInterval(loadAlerts, alertRefreshInterval);
        return function () {
            cleanupSubscriptions();
        };
    }, []);
    // Update filters effect
    (0, react_1.useEffect)(function () {
        if (autoLoadData) {
            loadInventoryItems({
                category_id: state.selectedCategory,
                location_id: state.selectedLocation,
                search: state.searchQuery
            });
        }
    }, [state.selectedCategory, state.selectedLocation, state.searchQuery, autoLoadData, loadInventoryItems]);
    return {
        state: state,
        isLoading: isLoading,
        isUpdating: isUpdating,
        loadInventoryItems: loadInventoryItems,
        loadCategories: loadCategories,
        loadLocations: loadLocations,
        loadAlerts: loadAlerts,
        refreshData: refreshData,
        updateStock: updateStock,
        scanBarcode: scanBarcode,
        startSession: startSession,
        addScanToSession: addScanToSession,
        endSession: endSession,
        resolveAlert: resolveAlert,
        setLocationFilter: setLocationFilter,
        setCategoryFilter: setCategoryFilter,
        setSearchQuery: setSearchQuery,
        connectionStatus: state.connectionStatus,
        reconnect: reconnect
    };
}
