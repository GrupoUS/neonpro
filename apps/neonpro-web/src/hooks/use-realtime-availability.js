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
exports.useRealtimeAvailability = useRealtimeAvailability;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
function useRealtimeAvailability(_a) {
    var _this = this;
    var _b = _a === void 0 ? {} : _a, professionalId = _b.professionalId, serviceId = _b.serviceId, date = _b.date;
    var _c = (0, react_1.useState)([]), timeSlots = _c[0], setTimeSlots = _c[1];
    var _d = (0, react_1.useState)(false), isConnected = _d[0], setIsConnected = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var supabase = yield (0, client_1.createClient)();
    var toast = (0, use_toast_1.useToast)().toast;
    var channelRef = (0, react_1.useRef)(null);
    // Função para buscar slots iniciais
    var fetchInitialSlots = function () { return __awaiter(_this, void 0, void 0, function () {
        var query, _a, data, error_1, err_1, errorMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    query = supabase
                        .from('time_slots')
                        .select("\n          *,\n          professional:professionals(name, email),\n          service:services(name, duration, price)\n        ")
                        .order('date', { ascending: true })
                        .order('start_time', { ascending: true });
                    // Aplicar filtros se fornecidos
                    if (professionalId) {
                        query = query.eq('professional_id', professionalId);
                    }
                    if (serviceId) {
                        query = query.eq('service_id', serviceId);
                    }
                    if (date) {
                        query = query.eq('date', date);
                    }
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), data = _a.data, error_1 = _a.error;
                    if (error_1) {
                        throw new Error("Erro ao buscar slots: ".concat(error_1.message));
                    }
                    setTimeSlots(data || []);
                    setError(null);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _b.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Erro desconhecido';
                    setError(errorMessage);
                    console.error('Erro ao buscar slots:', err_1);
                    toast({
                        title: 'Erro ao carregar disponibilidade',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Setup de subscription em tempo real
    (0, react_1.useEffect)(function () {
        // Buscar dados iniciais
        fetchInitialSlots();
        // Setup do canal realtime
        var channel = supabase
            .channel('availability_updates')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'time_slots'
        }, function (payload) {
            console.log('Realtime update:', payload);
            switch (payload.eventType) {
                case 'INSERT':
                    handleSlotInsert(payload.new);
                    break;
                case 'UPDATE':
                    handleSlotUpdate(payload.new, payload.old);
                    break;
                case 'DELETE':
                    handleSlotDelete(payload.old);
                    break;
            }
        })
            .subscribe(function (status) {
            console.log('Realtime status:', status);
            setIsConnected(status === 'SUBSCRIBED');
            if (status === 'SUBSCRIBED') {
                toast({
                    title: 'Conectado',
                    description: 'Atualizações em tempo real ativadas',
                    duration: 2000
                });
            }
            else if (status === 'CLOSED') {
                setIsConnected(false);
                toast({
                    title: 'Desconectado',
                    description: 'Atualizações em tempo real desativadas',
                    variant: 'destructive',
                    duration: 3000
                });
            }
        });
        channelRef.current = channel;
        // Cleanup
        return function () {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [professionalId, serviceId, date]);
    // Handlers para eventos realtime
    var handleSlotInsert = function (newSlot) {
        setTimeSlots(function (prev) {
            // Verificar se já existe
            var exists = prev.find(function (slot) { return slot.id === newSlot.id; });
            if (exists)
                return prev;
            // Adicionar e reordenar
            var updated = __spreadArray(__spreadArray([], prev, true), [newSlot], false).sort(function (a, b) {
                var dateComparison = a.date.localeCompare(b.date);
                if (dateComparison !== 0)
                    return dateComparison;
                return a.start_time.localeCompare(b.start_time);
            });
            toast({
                title: 'Novo horário disponível',
                description: "".concat(newSlot.date, " \u00E0s ").concat(newSlot.start_time),
                duration: 3000
            });
            return updated;
        });
    };
    var handleSlotUpdate = function (updatedSlot, oldSlot) {
        setTimeSlots(function (prev) {
            return prev.map(function (slot) {
                return slot.id === updatedSlot.id ? updatedSlot : slot;
            });
        });
        // Notificar sobre mudanças importantes
        if (oldSlot.is_available !== updatedSlot.is_available) {
            toast({
                title: updatedSlot.is_available ? 'Horário liberado' : 'Horário ocupado',
                description: "".concat(updatedSlot.date, " \u00E0s ").concat(updatedSlot.start_time),
                duration: 3000
            });
        }
    };
    var handleSlotDelete = function (deletedSlot) {
        setTimeSlots(function (prev) {
            return prev.filter(function (slot) { return slot.id !== deletedSlot.id; });
        });
        toast({
            title: 'Horário removido',
            description: "".concat(deletedSlot.date, " \u00E0s ").concat(deletedSlot.start_time),
            duration: 3000
        });
    };
    // Função para tentar reservar slot (com otimistic update)
    var bookSlot = function (slotId, patientId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Otimistic update
                    setTimeSlots(function (prev) {
                        return prev.map(function (slot) {
                            return slot.id === slotId
                                ? __assign(__assign({}, slot), { is_available: false }) : slot;
                        });
                    });
                    return [4 /*yield*/, supabase
                            .from('appointments')
                            .insert([
                            {
                                time_slot_id: slotId,
                                patient_id: patientId,
                                status: 'confirmed'
                            }
                        ])];
                case 1:
                    error_2 = (_a.sent()).error;
                    if (error_2) {
                        // Reverter otimistic update em caso de erro
                        setTimeSlots(function (prev) {
                            return prev.map(function (slot) {
                                return slot.id === slotId
                                    ? __assign(__assign({}, slot), { is_available: true }) : slot;
                            });
                        });
                        throw new Error("Erro ao reservar: ".concat(error_2.message));
                    }
                    toast({
                        title: 'Agendamento confirmado',
                        description: 'O horário foi reservado com sucesso',
                        duration: 3000
                    });
                    return [2 /*return*/, { success: true }];
                case 2:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Erro desconhecido';
                    toast({
                        title: 'Erro no agendamento',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [2 /*return*/, { success: false, error: errorMessage }];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return {
        timeSlots: timeSlots,
        isConnected: isConnected,
        isLoading: isLoading,
        error: error,
        bookSlot: bookSlot,
        refetch: fetchInitialSlots
    };
}
