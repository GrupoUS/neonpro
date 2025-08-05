// NeonPro - useNetworkStatus Hook
// VIBECODE V1.0 - Professional Excellence Standards
// Purpose: React hook for network connectivity detection with healthcare PWA patterns
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
exports.useNetworkStatus = useNetworkStatus;
exports.useOfflineApi = useOfflineApi;
var react_1 = require("react");
function useNetworkStatus() {
    var _this = this;
    var _a = (0, react_1.useState)({
        isOnline: true,
        isOffline: false,
    }), networkStatus = _a[0], setNetworkStatus = _a[1];
    var _b = (0, react_1.useState)([]), syncQueue = _b[0], setSyncQueue = _b[1];
    var _c = (0, react_1.useState)(false), isSyncing = _c[0], setIsSyncing = _c[1];
    // Update network status
    var updateNetworkStatus = (0, react_1.useCallback)(function () {
        var connection = navigator.connection;
        var isOnline = navigator.onLine;
        setNetworkStatus({
            isOnline: isOnline,
            isOffline: !isOnline,
            downlink: connection === null || connection === void 0 ? void 0 : connection.downlink,
            effectiveType: connection === null || connection === void 0 ? void 0 : connection.effectiveType,
            saveData: connection === null || connection === void 0 ? void 0 : connection.saveData,
        });
    }, []);
    // Load sync queue from localStorage
    var loadSyncQueue = (0, react_1.useCallback)(function () {
        try {
            var stored = localStorage.getItem('neonpro-sync-queue');
            if (stored) {
                var queue = JSON.parse(stored);
                setSyncQueue(queue);
            }
        }
        catch (error) {
            console.warn('Failed to load sync queue from localStorage:', error);
        }
    }, []);
    // Process sync queue when coming back online
    var processSyncQueue = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var updatedQueue, i, item, response, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!networkStatus.isOnline || syncQueue.length === 0 || isSyncing) {
                        return [2 /*return*/];
                    }
                    setIsSyncing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    updatedQueue = __spreadArray([], syncQueue, true);
                    i = updatedQueue.length - 1;
                    _a.label = 2;
                case 2:
                    if (!(i >= 0)) return [3 /*break*/, 7];
                    item = updatedQueue[i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fetch(item.url, {
                            method: item.method,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: item.data ? JSON.stringify(item.data) : undefined,
                        })];
                case 4:
                    response = _a.sent();
                    if (response.ok) {
                        // Success - remove from queue
                        updatedQueue.splice(i, 1);
                        console.log("\u2705 Synced offline action: ".concat(item.method, " ").concat(item.url));
                    }
                    else {
                        // Failed - increment retry count
                        item.retryCount = (item.retryCount || 0) + 1;
                        // Remove after 3 failed attempts
                        if (item.retryCount >= 3) {
                            updatedQueue.splice(i, 1);
                            console.warn("\u274C Gave up syncing after 3 attempts: ".concat(item.method, " ").concat(item.url));
                        }
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    // Network error - increment retry count
                    item.retryCount = (item.retryCount || 0) + 1;
                    if (item.retryCount >= 3) {
                        updatedQueue.splice(i, 1);
                        console.warn("\u274C Gave up syncing after network errors: ".concat(item.method, " ").concat(item.url));
                    }
                    return [3 /*break*/, 6];
                case 6:
                    i--;
                    return [3 /*break*/, 2];
                case 7:
                    // Update state and localStorage
                    setSyncQueue(updatedQueue);
                    localStorage.setItem('neonpro-sync-queue', JSON.stringify(updatedQueue));
                    return [3 /*break*/, 10];
                case 8:
                    error_2 = _a.sent();
                    console.error('Error processing sync queue:', error_2);
                    return [3 /*break*/, 10];
                case 9:
                    setIsSyncing(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [networkStatus.isOnline, syncQueue, isSyncing]);
    // Add item to sync queue
    var addToSyncQueue = (0, react_1.useCallback)(function (item) {
        var queueItem = __assign(__assign({}, item), { id: "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)), timestamp: Date.now(), retryCount: 0 });
        setSyncQueue(function (prev) {
            var newQueue = __spreadArray(__spreadArray([], prev, true), [queueItem], false);
            localStorage.setItem('neonpro-sync-queue', JSON.stringify(newQueue));
            return newQueue;
        });
        return queueItem.id;
    }, []);
    // Clear sync queue
    var clearSyncQueue = (0, react_1.useCallback)(function () {
        setSyncQueue([]);
        localStorage.removeItem('neonpro-sync-queue');
    }, []);
    // Initialize hook
    (0, react_1.useEffect)(function () {
        updateNetworkStatus();
        loadSyncQueue();
        // Event listeners
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        // Connection change listener (if available)
        var connection = navigator.connection;
        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
        }
        return function () {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, [updateNetworkStatus, loadSyncQueue]);
    // Process queue when coming online
    (0, react_1.useEffect)(function () {
        if (networkStatus.isOnline && syncQueue.length > 0) {
            // Small delay to ensure connection is stable
            var timer_1 = setTimeout(function () {
                processSyncQueue();
            }, 1000);
            return function () { return clearTimeout(timer_1); };
        }
    }, [networkStatus.isOnline, syncQueue.length, processSyncQueue]);
    return __assign(__assign({}, networkStatus), { syncQueue: syncQueue, syncQueueCount: syncQueue.length, isSyncing: isSyncing, addToSyncQueue: addToSyncQueue, clearSyncQueue: clearSyncQueue, processSyncQueue: processSyncQueue });
}
// Utility hook for offline-first API calls
function useOfflineApi() {
    var _this = this;
    var _a = useNetworkStatus(), isOnline = _a.isOnline, addToSyncQueue = _a.addToSyncQueue;
    var makeRequest = (0, react_1.useCallback)(function (url_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([url_1], args_1, true), void 0, function (url, options) {
            var response, error_3;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isOnline) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url, options)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_3 = _a.sent();
                        console.warn('API call failed, adding to sync queue:', error_3);
                        // Add to sync queue if it's a safe method to retry
                        if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
                            addToSyncQueue({
                                method: options.method,
                                url: url,
                                data: options.body ? JSON.parse(options.body) : undefined,
                            });
                        }
                        throw error_3;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        // Offline - add to sync queue if it's a write operation
                        if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
                            addToSyncQueue({
                                method: options.method,
                                url: url,
                                data: options.body ? JSON.parse(options.body) : undefined,
                            });
                            // Return a mock successful response for UI feedback
                            return [2 /*return*/, new Response(JSON.stringify({
                                    success: true,
                                    offline: true,
                                    message: 'Ação salva para sincronização'
                                }), {
                                    status: 200,
                                    statusText: 'OK (Offline)',
                                    headers: { 'Content-Type': 'application/json' }
                                })];
                        }
                        // For read operations, return null to indicate offline
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, [isOnline, addToSyncQueue]);
    return {
        makeRequest: makeRequest,
        isOnline: isOnline,
    };
}
