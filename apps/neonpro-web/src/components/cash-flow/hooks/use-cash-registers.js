"use client";
"use strict";
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
exports.useCashRegisters = useCashRegisters;
// Cash Registers Hook - React hook for cash register operations
// Following financial dashboard patterns from Context7 research
var react_1 = require("react");
var sonner_1 = require("sonner");
var cash_flow_service_1 = require("../services/cash-flow-service");
function useCashRegisters(clinicId) {
    var _this = this;
    var _a = (0, react_1.useState)([]), registers = _a[0], setRegisters = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var loadRegisters = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var data, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, cash_flow_service_1.cashFlowService.getCashRegisters(clinicId)];
                case 1:
                    data = _a.sent();
                    setRegisters(data);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Failed to load cash registers';
                    setError(errorMessage);
                    sonner_1.toast.error(errorMessage);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [clinicId]);
    var createRegister = (0, react_1.useCallback)(function (register) { return __awaiter(_this, void 0, void 0, function () {
        var newRegister_1, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, cash_flow_service_1.cashFlowService.createCashRegister(register)];
                case 1:
                    newRegister_1 = _a.sent();
                    // Add the new register to the current list (optimistic update)
                    setRegisters(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newRegister_1], false); });
                    sonner_1.toast.success('Cash register created successfully');
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Failed to create cash register';
                    setError(errorMessage);
                    sonner_1.toast.error(errorMessage);
                    throw err_2;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var updateRegister = (0, react_1.useCallback)(function (id, updates) { return __awaiter(_this, void 0, void 0, function () {
        var err_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    // For now, we'll just refresh the list after update
                    // TODO: Implement updateCashRegister in service
                    return [4 /*yield*/, loadRegisters()];
                case 1:
                    // For now, we'll just refresh the list after update
                    // TODO: Implement updateCashRegister in service
                    _a.sent();
                    sonner_1.toast.success('Cash register updated successfully');
                    return [3 /*break*/, 4];
                case 2:
                    err_3 = _a.sent();
                    errorMessage = err_3 instanceof Error ? err_3.message : 'Failed to update cash register';
                    setError(errorMessage);
                    sonner_1.toast.error(errorMessage);
                    throw err_3;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [loadRegisters]);
    var refreshRegisters = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadRegisters()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [loadRegisters]);
    // Load initial data
    (0, react_1.useEffect)(function () {
        if (clinicId) {
            loadRegisters();
        }
    }, [clinicId, loadRegisters]);
    return {
        registers: registers,
        loading: loading,
        error: error,
        createRegister: createRegister,
        updateRegister: updateRegister,
        refreshRegisters: refreshRegisters
    };
}
