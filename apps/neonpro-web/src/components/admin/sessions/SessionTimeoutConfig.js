/**
 * Session Timeout Configuration Interface
 * Story 1.4 - Task 1: Session timeout configuration interface for admins
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
exports.default = SessionTimeoutConfig;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var DEFAULT_CONFIGS = {
    owner: {
        defaultTimeoutMinutes: 60,
        maxTimeoutMinutes: 480,
        warningThresholds: [15, 5, 1],
        activityExtensionMinutes: 30,
        gracePeriodMinutes: 5,
        autoExtendEnabled: true
    },
    manager: {
        defaultTimeoutMinutes: 45,
        maxTimeoutMinutes: 240,
        warningThresholds: [10, 5, 1],
        activityExtensionMinutes: 20,
        gracePeriodMinutes: 3,
        autoExtendEnabled: true
    },
    staff: {
        defaultTimeoutMinutes: 30,
        maxTimeoutMinutes: 120,
        warningThresholds: [10, 5, 1],
        activityExtensionMinutes: 15,
        gracePeriodMinutes: 2,
        autoExtendEnabled: true
    },
    patient: {
        defaultTimeoutMinutes: 20,
        maxTimeoutMinutes: 60,
        warningThresholds: [5, 2, 1],
        activityExtensionMinutes: 10,
        gracePeriodMinutes: 1,
        autoExtendEnabled: false
    }
};
var ROLE_LABELS = {
    owner: 'Proprietário',
    manager: 'Gerente',
    staff: 'Funcionário',
    patient: 'Paciente'
};
var ROLE_DESCRIPTIONS = {
    owner: 'Acesso completo ao sistema com sessões de longa duração',
    manager: 'Acesso gerencial com sessões moderadas',
    staff: 'Acesso operacional com sessões padrão',
    patient: 'Acesso limitado com sessões de curta duração'
};
function SessionTimeoutConfig(_a) {
    var _this = this;
    var onConfigUpdate = _a.onConfigUpdate;
    var _b = (0, react_1.useState)(DEFAULT_CONFIGS), configs = _b[0], setConfigs = _b[1];
    var _c = (0, react_1.useState)('staff'), activeRole = _c[0], setActiveRole = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)(false), hasChanges = _e[0], setHasChanges = _e[1];
    var _f = (0, react_1.useState)({}), validationErrors = _f[0], setValidationErrors = _f[1];
    (0, react_1.useEffect)(function () {
        loadCurrentConfigs();
    }, []);
    var loadCurrentConfigs = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    setIsLoading(true);
                    return [4 /*yield*/, fetch('/api/admin/session-timeout-configs')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setConfigs(data.configs || DEFAULT_CONFIGS);
                    _a.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Failed to load session timeout configs:', error_1);
                    sonner_1.toast.error('Falha ao carregar configurações de timeout');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var validateConfig = function (role, config) {
        var errors = {};
        if (config.defaultTimeoutMinutes <= 0) {
            errors.defaultTimeout = 'Timeout padrão deve ser maior que 0';
        }
        if (config.maxTimeoutMinutes <= config.defaultTimeoutMinutes) {
            errors.maxTimeout = 'Timeout máximo deve ser maior que o timeout padrão';
        }
        if (config.activityExtensionMinutes <= 0) {
            errors.activityExtension = 'Extensão por atividade deve ser maior que 0';
        }
        if (config.gracePeriodMinutes <= 0) {
            errors.gracePeriod = 'Período de graça deve ser maior que 0';
        }
        if (config.warningThresholds.some(function (threshold) { return threshold <= 0; })) {
            errors.warningThresholds = 'Todos os avisos devem ser maiores que 0';
        }
        if (config.warningThresholds.some(function (threshold) { return threshold >= config.defaultTimeoutMinutes; })) {
            errors.warningThresholds = 'Avisos devem ser menores que o timeout padrão';
        }
        // Role-specific validations
        if (role === 'patient' && config.defaultTimeoutMinutes > 30) {
            errors.patientTimeout = 'Pacientes não devem ter sessões superiores a 30 minutos';
        }
        if (role === 'owner' && config.maxTimeoutMinutes < 240) {
            errors.ownerTimeout = 'Proprietários devem ter pelo menos 4 horas de timeout máximo';
        }
        return errors;
    };
    var handleConfigChange = function (role, field, value) {
        var _a, _b;
        var newConfigs = __assign(__assign({}, configs), (_a = {}, _a[role] = __assign(__assign({}, configs[role]), (_b = {}, _b[field] = value, _b)), _a));
        setConfigs(newConfigs);
        setHasChanges(true);
        // Validate the updated config
        var errors = validateConfig(role, newConfigs[role]);
        setValidationErrors(errors);
    };
    var handleWarningThresholdChange = function (role, index, value) {
        var newThresholds = __spreadArray([], configs[role].warningThresholds, true);
        newThresholds[index] = value;
        handleConfigChange(role, 'warningThresholds', newThresholds);
    };
    var addWarningThreshold = function (role) {
        var newThresholds = __spreadArray(__spreadArray([], configs[role].warningThresholds, true), [5], false);
        handleConfigChange(role, 'warningThresholds', newThresholds);
    };
    var removeWarningThreshold = function (role, index) {
        var newThresholds = configs[role].warningThresholds.filter(function (_, i) { return i !== index; });
        handleConfigChange(role, 'warningThresholds', newThresholds);
    };
    var saveConfigs = function () { return __awaiter(_this, void 0, void 0, function () {
        var allErrors_1, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    allErrors_1 = {};
                    Object.entries(configs).forEach(function (_a) {
                        var role = _a[0], config = _a[1];
                        var errors = validateConfig(role, config);
                        Object.assign(allErrors_1, errors);
                    });
                    if (Object.keys(allErrors_1).length > 0) {
                        setValidationErrors(allErrors_1);
                        sonner_1.toast.error('Corrija os erros de validação antes de salvar');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('/api/admin/session-timeout-configs', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ configs: configs })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to save configurations');
                    }
                    // Notify parent component
                    Object.entries(configs).forEach(function (_a) {
                        var role = _a[0], config = _a[1];
                        var sessionConfig = {
                            role: role,
                            defaultTimeoutMinutes: config.defaultTimeoutMinutes,
                            maxTimeoutMinutes: config.maxTimeoutMinutes,
                            warningThresholds: config.warningThresholds,
                            activityExtensionMinutes: config.activityExtensionMinutes,
                            gracePeriodMinutes: config.gracePeriodMinutes
                        };
                        onConfigUpdate === null || onConfigUpdate === void 0 ? void 0 : onConfigUpdate(role, sessionConfig);
                    });
                    setHasChanges(false);
                    setValidationErrors({});
                    sonner_1.toast.success('Configurações de timeout salvas com sucesso');
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to save session timeout configs:', error_2);
                    sonner_1.toast.error('Falha ao salvar configurações');
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var resetToDefaults = function () {
        setConfigs(DEFAULT_CONFIGS);
        setHasChanges(true);
        setValidationErrors({});
        sonner_1.toast.info('Configurações resetadas para os valores padrão');
    };
    var formatDuration = function (minutes) {
        if (minutes < 60) {
            return "".concat(minutes, " min");
        }
        var hours = Math.floor(minutes / 60);
        var remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? "".concat(hours, "h ").concat(remainingMinutes, "min") : "".concat(hours, "h");
    };
    var getRoleSecurityLevel = function (role) {
        switch (role) {
            case 'owner':
                return { level: 'Máxima', color: 'bg-red-100 text-red-800' };
            case 'manager':
                return { level: 'Alta', color: 'bg-orange-100 text-orange-800' };
            case 'staff':
                return { level: 'Média', color: 'bg-yellow-100 text-yellow-800' };
            case 'patient':
                return { level: 'Restrita', color: 'bg-green-100 text-green-800' };
            default:
                return { level: 'Padrão', color: 'bg-gray-100 text-gray-800' };
        }
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuração de Timeout de Sessão</h2>
          <p className="text-muted-foreground">
            Configure os tempos limite de sessão por função de usuário
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={resetToDefaults} disabled={isLoading}>
            <lucide_react_1.RotateCcw className="h-4 w-4 mr-2"/>
            Resetar
          </button_1.Button>
          <button_1.Button onClick={saveConfigs} disabled={isLoading || !hasChanges || Object.keys(validationErrors).length > 0}>
            <lucide_react_1.Save className="h-4 w-4 mr-2"/>
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </button_1.Button>
        </div>
      </div>

      {Object.keys(validationErrors).length > 0 && (<alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertDescription>
            Existem erros de validação que precisam ser corrigidos antes de salvar.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      <tabs_1.Tabs value={activeRole} onValueChange={function (value) { return setActiveRole(value); }}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          {Object.entries(ROLE_LABELS).map(function (_a) {
            var role = _a[0], label = _a[1];
            var securityLevel = getRoleSecurityLevel(role);
            return (<tabs_1.TabsTrigger key={role} value={role} className="flex flex-col gap-1">
                <span>{label}</span>
                <badge_1.Badge className={"text-xs ".concat(securityLevel.color)}>
                  {securityLevel.level}
                </badge_1.Badge>
              </tabs_1.TabsTrigger>);
        })}
        </tabs_1.TabsList>

        {Object.entries(configs).map(function (_a) {
            var role = _a[0], config = _a[1];
            return (<tabs_1.TabsContent key={role} value={role}>
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-5 w-5"/>
                  {ROLE_LABELS[role]}
                </card_1.CardTitle>
                <card_1.CardDescription>
                  {ROLE_DESCRIPTIONS[role]}
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                {/* Basic Timeout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor={"".concat(role, "-default-timeout")}>
                      Timeout Padrão (minutos)
                    </label_1.Label>
                    <input_1.Input id={"".concat(role, "-default-timeout")} type="number" min="1" value={config.defaultTimeoutMinutes} onChange={function (e) { return handleConfigChange(role, 'defaultTimeoutMinutes', parseInt(e.target.value) || 0); }} className={validationErrors.defaultTimeout ? 'border-red-500' : ''}/>
                    <p className="text-sm text-muted-foreground">
                      Duração: {formatDuration(config.defaultTimeoutMinutes)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor={"".concat(role, "-max-timeout")}>
                      Timeout Máximo (minutos)
                    </label_1.Label>
                    <input_1.Input id={"".concat(role, "-max-timeout")} type="number" min="1" value={config.maxTimeoutMinutes} onChange={function (e) { return handleConfigChange(role, 'maxTimeoutMinutes', parseInt(e.target.value) || 0); }} className={validationErrors.maxTimeout ? 'border-red-500' : ''}/>
                    <p className="text-sm text-muted-foreground">
                      Duração: {formatDuration(config.maxTimeoutMinutes)}
                    </p>
                  </div>
                </div>

                <separator_1.Separator />

                {/* Activity Extension Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor={"".concat(role, "-activity-extension")}>
                      Extensão por Atividade (minutos)
                    </label_1.Label>
                    <input_1.Input id={"".concat(role, "-activity-extension")} type="number" min="1" value={config.activityExtensionMinutes} onChange={function (e) { return handleConfigChange(role, 'activityExtensionMinutes', parseInt(e.target.value) || 0); }} className={validationErrors.activityExtension ? 'border-red-500' : ''}/>
                    <p className="text-sm text-muted-foreground">
                      Tempo adicionado quando há atividade do usuário
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor={"".concat(role, "-grace-period")}>
                      Período de Graça (minutos)
                    </label_1.Label>
                    <input_1.Input id={"".concat(role, "-grace-period")} type="number" min="1" value={config.gracePeriodMinutes} onChange={function (e) { return handleConfigChange(role, 'gracePeriodMinutes', parseInt(e.target.value) || 0); }} className={validationErrors.gracePeriod ? 'border-red-500' : ''}/>
                    <p className="text-sm text-muted-foreground">
                      Tempo extra antes do logout forçado
                    </p>
                  </div>
                </div>

                <separator_1.Separator />

                {/* Warning Thresholds */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label_1.Label>Avisos de Timeout (minutos antes do logout)</label_1.Label>
                    <button_1.Button variant="outline" size="sm" onClick={function () { return addWarningThreshold(role); }}>
                      Adicionar Aviso
                    </button_1.Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {config.warningThresholds.map(function (threshold, index) { return (<div key={index} className="flex items-center gap-2">
                        <input_1.Input type="number" min="1" value={threshold} onChange={function (e) { return handleWarningThresholdChange(role, index, parseInt(e.target.value) || 0); }} className={validationErrors.warningThresholds ? 'border-red-500' : ''}/>
                        {config.warningThresholds.length > 1 && (<button_1.Button variant="outline" size="sm" onClick={function () { return removeWarningThreshold(role, index); }}>
                            ×
                          </button_1.Button>)}
                      </div>); })}
                  </div>
                  {validationErrors.warningThresholds && (<p className="text-sm text-red-500">{validationErrors.warningThresholds}</p>)}
                </div>

                <separator_1.Separator />

                {/* Auto Extension Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label_1.Label>Extensão Automática por Atividade</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Estender automaticamente a sessão quando o usuário está ativo
                    </p>
                  </div>
                  <switch_1.Switch checked={config.autoExtendEnabled} onCheckedChange={function (checked) { return handleConfigChange(role, 'autoExtendEnabled', checked); }}/>
                </div>

                {/* Configuration Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <lucide_react_1.Settings className="h-4 w-4"/>
                    Resumo da Configuração
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Timeout padrão: {formatDuration(config.defaultTimeoutMinutes)}</div>
                    <div>Timeout máximo: {formatDuration(config.maxTimeoutMinutes)}</div>
                    <div>Extensão por atividade: {formatDuration(config.activityExtensionMinutes)}</div>
                    <div>Período de graça: {formatDuration(config.gracePeriodMinutes)}</div>
                    <div>Avisos: {config.warningThresholds.join(', ')} min</div>
                    <div>Auto-extensão: {config.autoExtendEnabled ? 'Ativada' : 'Desativada'}</div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>);
        })}
      </tabs_1.Tabs>
    </div>);
}
