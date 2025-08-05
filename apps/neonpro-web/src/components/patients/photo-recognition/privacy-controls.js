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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyControls = PrivacyControls;
/**
 * Privacy Controls Component for Patient Photo Management
 * Manages LGPD compliance and privacy settings for patient photos
 *
 * @author APEX Master Developer
 */
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var use_toast_1 = require("@/components/ui/use-toast");
var dialog_1 = require("@/components/ui/dialog");
var ACCESS_LEVEL_DESCRIPTIONS = {
    public: 'Fotos podem ser acessadas por toda a equipe médica',
    restricted: 'Acesso limitado apenas aos profissionais envolvidos no tratamento',
    private: 'Acesso restrito apenas ao médico responsável'
};
var RETENTION_PERIODS = [
    { value: 365, label: '1 ano' },
    { value: 730, label: '2 anos' },
    { value: 1095, label: '3 anos' },
    { value: 1825, label: '5 anos' },
    { value: 3650, label: '10 anos' },
    { value: -1, label: 'Indefinido (conforme legislação)' }
];
function PrivacyControls(_a) {
    var _this = this;
    var patientId = _a.patientId, patientName = _a.patientName, onPrivacyUpdated = _a.onPrivacyUpdated, _b = _a.readOnly, readOnly = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(null), privacyControls = _c[0], setPrivacyControls = _c[1];
    var _d = (0, react_1.useState)([]), consentHistory = _d[0], setConsentHistory = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(false), isSaving = _f[0], setIsSaving = _f[1];
    var _g = (0, react_1.useState)(false), showConsentDialog = _g[0], setShowConsentDialog = _g[1];
    var _h = (0, react_1.useState)(false), showExportDialog = _h[0], setShowExportDialog = _h[1];
    var _j = (0, react_1.useState)(false), showDeletionDialog = _j[0], setShowDeletionDialog = _j[1];
    var _k = (0, react_1.useState)(''), deletionReason = _k[0], setDeletionReason = _k[1];
    var toast = (0, use_toast_1.useToast)().toast;
    (0, react_1.useEffect)(function () {
        loadPrivacyControls();
        loadConsentHistory();
    }, [patientId]);
    var loadPrivacyControls = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, defaultControls, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/patients/photos/privacy?patientId=".concat(patientId), {
                            headers: {
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    setPrivacyControls(result.data);
                    return [3 /*break*/, 4];
                case 3:
                    defaultControls = {
                        allowFacialRecognition: false,
                        allowPhotoSharing: false,
                        dataRetentionPeriod: 1825, // 5 years default
                        accessLevel: 'restricted',
                        consentGiven: false,
                        consentDate: new Date().toISOString(),
                        consentVersion: '1.0',
                        allowDataProcessing: false,
                        allowThirdPartyAccess: false,
                        notificationPreferences: {
                            emailNotifications: true,
                            smsNotifications: false,
                            dataProcessingAlerts: true
                        },
                        dataExportRequests: [],
                        deletionRequests: []
                    };
                    setPrivacyControls(defaultControls);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    toast({
                        title: 'Erro ao carregar configurações',
                        description: 'Não foi possível carregar as configurações de privacidade.',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var loadConsentHistory = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/patients/photos/privacy/consent-history?patientId=".concat(patientId), {
                            headers: {
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    setConsentHistory(result.data || []);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error loading consent history:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var updatePrivacyControls = function (updates) { return __awaiter(_this, void 0, void 0, function () {
        var updatedControls, response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (readOnly)
                        return [2 /*return*/];
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    updatedControls = __assign(__assign({}, privacyControls), updates);
                    return [4 /*yield*/, fetch('/api/patients/photos/privacy', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            },
                            body: JSON.stringify({
                                patientId: patientId,
                                privacyControls: updatedControls
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to update privacy controls');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    setPrivacyControls(result.data);
                    onPrivacyUpdated === null || onPrivacyUpdated === void 0 ? void 0 : onPrivacyUpdated(result.data);
                    toast({
                        title: 'Configurações atualizadas',
                        description: 'As configurações de privacidade foram atualizadas com sucesso.'
                    });
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    toast({
                        title: 'Erro ao atualizar configurações',
                        description: 'Não foi possível atualizar as configurações de privacidade.',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var requestDataExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch('/api/patients/photos/privacy/export', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            },
                            body: JSON.stringify({ patientId: patientId })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to request data export');
                    }
                    toast({
                        title: 'Solicitação enviada',
                        description: 'Sua solicitação de exportação de dados foi enviada. Você receberá um email quando estiver pronta.'
                    });
                    setShowExportDialog(false);
                    loadPrivacyControls(); // Reload to get updated export requests
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    toast({
                        title: 'Erro na solicitação',
                        description: 'Não foi possível processar sua solicitação de exportação.',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var requestDataDeletion = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!deletionReason.trim()) {
                        toast({
                            title: 'Motivo obrigatório',
                            description: 'Por favor, informe o motivo da solicitação de exclusão.',
                            variant: 'destructive'
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/patients/photos/privacy/deletion', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            },
                            body: JSON.stringify({
                                patientId: patientId,
                                reason: deletionReason
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to request data deletion');
                    }
                    toast({
                        title: 'Solicitação enviada',
                        description: 'Sua solicitação de exclusão de dados foi enviada para análise.'
                    });
                    setShowDeletionDialog(false);
                    setDeletionReason('');
                    loadPrivacyControls(); // Reload to get updated deletion requests
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    toast({
                        title: 'Erro na solicitação',
                        description: 'Não foi possível processar sua solicitação de exclusão.',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    var getStatusBadge = function (status) {
        var statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
            processing: { color: 'bg-blue-100 text-blue-800', label: 'Processando' },
            completed: { color: 'bg-green-100 text-green-800', label: 'Concluído' },
            failed: { color: 'bg-red-100 text-red-800', label: 'Falhou' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' }
        };
        var config = statusConfig[status] || statusConfig.pending;
        return <badge_1.Badge className={config.color}>{config.label}</badge_1.Badge>;
    };
    if (isLoading) {
        return (<card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!privacyControls) {
        return (<card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="text-center text-gray-500">
            Não foi possível carregar as configurações de privacidade.
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5"/>
            Configurações de Privacidade - {patientName}
          </card_1.CardTitle>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Consent Status */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            {privacyControls.consentGiven ? (<lucide_react_1.Check className="h-5 w-5 text-green-600"/>) : (<lucide_react_1.X className="h-5 w-5 text-red-600"/>)}
            Status do Consentimento
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {privacyControls.consentGiven ? 'Consentimento concedido' : 'Consentimento pendente'}
                </p>
                <p className="text-sm text-gray-500">
                  Versão: {privacyControls.consentVersion} • {formatDate(privacyControls.consentDate)}
                </p>
              </div>
              {!readOnly && (<button_1.Button variant="outline" onClick={function () { return setShowConsentDialog(true); }}>
                  {privacyControls.consentGiven ? 'Revogar' : 'Conceder'} Consentimento
                </button_1.Button>)}
            </div>
            
            {!privacyControls.consentGiven && (<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                  <div>
                    <p className="font-medium text-yellow-800">Consentimento necessário</p>
                    <p className="text-sm text-yellow-700">
                      O consentimento é obrigatório para o processamento de fotos e dados pessoais conforme a LGPD.
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Privacy Settings */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Configurações de Privacidade</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-6">
            {/* Facial Recognition */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label_1.Label htmlFor="facial-recognition" className="text-base font-medium">
                  Reconhecimento Facial
                </label_1.Label>
                <p className="text-sm text-gray-500">
                  Permitir o uso de tecnologia de reconhecimento facial para identificação
                </p>
              </div>
              <switch_1.Switch id="facial-recognition" checked={privacyControls.allowFacialRecognition} onCheckedChange={function (checked) {
            return updatePrivacyControls({ allowFacialRecognition: checked });
        }} disabled={readOnly || isSaving}/>
            </div>

            {/* Photo Sharing */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label_1.Label htmlFor="photo-sharing" className="text-base font-medium">
                  Compartilhamento de Fotos
                </label_1.Label>
                <p className="text-sm text-gray-500">
                  Permitir compartilhamento de fotos com outros profissionais
                </p>
              </div>
              <switch_1.Switch id="photo-sharing" checked={privacyControls.allowPhotoSharing} onCheckedChange={function (checked) {
            return updatePrivacyControls({ allowPhotoSharing: checked });
        }} disabled={readOnly || isSaving}/>
            </div>

            {/* Data Processing */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label_1.Label htmlFor="data-processing" className="text-base font-medium">
                  Processamento de Dados
                </label_1.Label>
                <p className="text-sm text-gray-500">
                  Permitir processamento automatizado de dados para análises
                </p>
              </div>
              <switch_1.Switch id="data-processing" checked={privacyControls.allowDataProcessing} onCheckedChange={function (checked) {
            return updatePrivacyControls({ allowDataProcessing: checked });
        }} disabled={readOnly || isSaving}/>
            </div>

            {/* Third Party Access */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label_1.Label htmlFor="third-party" className="text-base font-medium">
                  Acesso de Terceiros
                </label_1.Label>
                <p className="text-sm text-gray-500">
                  Permitir acesso a dados por parceiros e laboratórios
                </p>
              </div>
              <switch_1.Switch id="third-party" checked={privacyControls.allowThirdPartyAccess} onCheckedChange={function (checked) {
            return updatePrivacyControls({ allowThirdPartyAccess: checked });
        }} disabled={readOnly || isSaving}/>
            </div>

            {/* Access Level */}
            <div className="space-y-2">
              <label_1.Label className="text-base font-medium">Nível de Acesso</label_1.Label>
              <select_1.Select value={privacyControls.accessLevel} onValueChange={function (value) {
            return updatePrivacyControls({ accessLevel: value });
        }} disabled={readOnly || isSaving}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="public">Público</select_1.SelectItem>
                  <select_1.SelectItem value="restricted">Restrito</select_1.SelectItem>
                  <select_1.SelectItem value="private">Privado</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              <p className="text-sm text-gray-500">
                {ACCESS_LEVEL_DESCRIPTIONS[privacyControls.accessLevel]}
              </p>
            </div>

            {/* Data Retention */}
            <div className="space-y-2">
              <label_1.Label className="text-base font-medium">Período de Retenção</label_1.Label>
              <select_1.Select value={privacyControls.dataRetentionPeriod.toString()} onValueChange={function (value) {
            return updatePrivacyControls({ dataRetentionPeriod: parseInt(value) });
        }} disabled={readOnly || isSaving}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {RETENTION_PERIODS.map(function (period) { return (<select_1.SelectItem key={period.value} value={period.value.toString()}>
                      {period.label}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
              <p className="text-sm text-gray-500">
                Tempo que os dados serão mantidos no sistema
              </p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Notification Preferences */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Preferências de Notificação</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="email-notifications">Notificações por email</label_1.Label>
              <switch_1.Switch id="email-notifications" checked={privacyControls.notificationPreferences.emailNotifications} onCheckedChange={function (checked) {
            return updatePrivacyControls({
                notificationPreferences: __assign(__assign({}, privacyControls.notificationPreferences), { emailNotifications: checked })
            });
        }} disabled={readOnly || isSaving}/>
            </div>
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="sms-notifications">Notificações por SMS</label_1.Label>
              <switch_1.Switch id="sms-notifications" checked={privacyControls.notificationPreferences.smsNotifications} onCheckedChange={function (checked) {
            return updatePrivacyControls({
                notificationPreferences: __assign(__assign({}, privacyControls.notificationPreferences), { smsNotifications: checked })
            });
        }} disabled={readOnly || isSaving}/>
            </div>
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="processing-alerts">Alertas de processamento</label_1.Label>
              <switch_1.Switch id="processing-alerts" checked={privacyControls.notificationPreferences.dataProcessingAlerts} onCheckedChange={function (checked) {
            return updatePrivacyControls({
                notificationPreferences: __assign(__assign({}, privacyControls.notificationPreferences), { dataProcessingAlerts: checked })
            });
        }} disabled={readOnly || isSaving}/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Data Rights */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Direitos do Titular dos Dados</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button_1.Button variant="outline" onClick={function () { return setShowExportDialog(true); }} disabled={readOnly} className="h-auto p-4 text-left">
                <div>
                  <p className="font-medium">Exportar Dados</p>
                  <p className="text-sm text-gray-500">Solicitar cópia dos seus dados</p>
                </div>
              </button_1.Button>
              
              <button_1.Button variant="outline" onClick={function () { return setShowDeletionDialog(true); }} disabled={readOnly} className="h-auto p-4 text-left">
                <div>
                  <p className="font-medium">Excluir Dados</p>
                  <p className="text-sm text-gray-500">Solicitar exclusão dos dados</p>
                </div>
              </button_1.Button>
            </div>

            {/* Export Requests */}
            {privacyControls.dataExportRequests.length > 0 && (<div className="space-y-2">
                <h4 className="font-medium">Solicitações de Exportação</h4>
                {privacyControls.dataExportRequests.map(function (request) { return (<div key={request.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">{formatDate(request.requestDate)}</p>
                      {request.downloadUrl && (<a href={request.downloadUrl} className="text-sm text-blue-600 hover:underline">
                          Download disponível
                        </a>)}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>); })}
              </div>)}

            {/* Deletion Requests */}
            {privacyControls.deletionRequests.length > 0 && (<div className="space-y-2">
                <h4 className="font-medium">Solicitações de Exclusão</h4>
                {privacyControls.deletionRequests.map(function (request) { return (<div key={request.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">{formatDate(request.requestDate)}</p>
                      <p className="text-sm text-gray-500">{request.reason}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>); })}
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Consent History */}
      {consentHistory.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Histórico de Consentimento</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {consentHistory.map(function (consent) { return (<div key={consent.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Versão {consent.version}</p>
                      <p className="text-sm text-gray-500">
                        Concedido em: {formatDate(consent.givenAt)}
                        {consent.revokedAt && " \u2022 Revogado em: ".concat(formatDate(consent.revokedAt))}
                      </p>
                    </div>
                  </div>
                  {consent.changes.length > 0 && (<div className="mt-2">
                      <p className="text-sm font-medium">Alterações:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {consent.changes.map(function (change, index) { return (<li key={index}>{change}</li>); })}
                      </ul>
                    </div>)}
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Consent Dialog */}
      <dialog_1.Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {privacyControls.consentGiven ? 'Revogar' : 'Conceder'} Consentimento
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {privacyControls.consentGiven
            ? 'Ao revogar o consentimento, o processamento de suas fotos e dados será interrompido.'
            : 'Ao conceder o consentimento, você autoriza o processamento de suas fotos e dados conforme nossa política de privacidade.'}
            </p>
            <div className="flex gap-2">
              <button_1.Button variant="outline" onClick={function () { return setShowConsentDialog(false); }}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={function () {
            updatePrivacyControls({
                consentGiven: !privacyControls.consentGiven,
                consentDate: new Date().toISOString()
            });
            setShowConsentDialog(false);
        }}>
                {privacyControls.consentGiven ? 'Revogar' : 'Conceder'}
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Export Dialog */}
      <dialog_1.Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Exportar Dados</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Você receberá um arquivo com todos os seus dados pessoais e fotos armazenados no sistema.
              O download estará disponível por 7 dias após o processamento.
            </p>
            <div className="flex gap-2">
              <button_1.Button variant="outline" onClick={function () { return setShowExportDialog(false); }}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={requestDataExport}>
                Solicitar Exportação
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Deletion Dialog */}
      <dialog_1.Dialog open={showDeletionDialog} onOpenChange={setShowDeletionDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Solicitar Exclusão de Dados</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Esta solicitação será analisada conforme os requisitos legais. 
              Alguns dados podem ser mantidos por obrigações regulatórias.
            </p>
            <div className="space-y-2">
              <label_1.Label htmlFor="deletion-reason">Motivo da solicitação</label_1.Label>
              <textarea_1.Textarea id="deletion-reason" value={deletionReason} onChange={function (e) { return setDeletionReason(e.target.value); }} placeholder="Descreva o motivo da solicitação de exclusão..." rows={3}/>
            </div>
            <div className="flex gap-2">
              <button_1.Button variant="outline" onClick={function () {
            setShowDeletionDialog(false);
            setDeletionReason('');
        }}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={requestDataDeletion}>
                Enviar Solicitação
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
