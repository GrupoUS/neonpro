'use client';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePatientAuth = void 0;
exports.PatientAuthProvider = PatientAuthProvider;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var sonner_1 = require("sonner");
var PatientAuthContext = (0, react_1.createContext)(undefined);
function PatientAuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = (0, react_1.useState)(null), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)(null), patient = _c[0], setPatient = _c[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)(null), supabase = _e[0], setSupabase = _e[1];
    // Initialize Supabase client
    (0, react_1.useEffect)(function () {
        var initSupabase = function () { return __awaiter(_this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        client = _a.sent();
                        setSupabase(client);
                        return [2 /*return*/];
                }
            });
        }); };
        initSupabase();
    }, []);
    (0, react_1.useEffect)(function () {
        var getUser = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, user_1, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!supabase)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, supabase.auth.getUser()];
                    case 2:
                        _a = _b.sent(), user_1 = _a.data.user, error = _a.error;
                        if (error)
                            throw error;
                        setUser(user_1);
                        if (!user_1) return [3 /*break*/, 4];
                        return [4 /*yield*/, fetchPatientData(user_1.id)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_1 = _b.sent();
                        console.error('Error fetching user:', error_1);
                        sonner_1.toast.error('Erro ao carregar dados do usuário');
                        return [3 /*break*/, 7];
                    case 6:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        getUser();
        var subscription = supabase.auth.onAuthStateChange(function (event, session) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
                        if (!(session === null || session === void 0 ? void 0 : session.user)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetchPatientData(session.user.id)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        setPatient(null);
                        _b.label = 3;
                    case 3:
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); }).data.subscription;
        return function () { return subscription.unsubscribe(); };
    }, [supabase.auth]);
    var fetchPatientData = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('patient_profiles')
                            .select('*')
                            .eq('user_id', userId)
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error && error.code !== 'PGRST116') {
                        throw error;
                    }
                    setPatient(data);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error('Error fetching patient data:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var signIn = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var error, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    sonner_1.toast.success('Login realizado com sucesso!');
                    return [3 /*break*/, 4];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error signing in:', error_3);
                    sonner_1.toast.error(error_3.message || 'Erro ao fazer login');
                    throw error_3;
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        var error, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, supabase.auth.signOut()];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    setUser(null);
                    setPatient(null);
                    sonner_1.toast.success('Logout realizado com sucesso!');
                    return [3 /*break*/, 4];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error signing out:', error_4);
                    sonner_1.toast.error(error_4.message || 'Erro ao fazer logout');
                    throw error_4;
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var updatePatient = function (updates) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!user || !patient)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, supabase
                            .from('patient_profiles')
                            .update(updates)
                            .eq('user_id', user.id)
                            .select()
                            .single()];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    setPatient(data);
                    sonner_1.toast.success('Perfil atualizado com sucesso!');
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _b.sent();
                    console.error('Error updating patient:', error_5);
                    sonner_1.toast.error(error_5.message || 'Erro ao atualizar perfil');
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var refreshPatient = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchPatientData(user.id)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var contextValue = {
        user: user,
        patient: patient,
        isLoading: isLoading,
        signIn: signIn,
        signOut: signOut,
        updatePatient: updatePatient,
        refreshPatient: refreshPatient
    };
    return react_1.default.createElement(PatientAuthContext.Provider, { value: contextValue }, children);
}
var usePatientAuth = function () {
    var context = (0, react_1.useContext)(PatientAuthContext);
    if (context === undefined) {
        throw new Error('usePatientAuth must be used within a PatientAuthProvider');
    }
    return context;
};
exports.usePatientAuth = usePatientAuth;
