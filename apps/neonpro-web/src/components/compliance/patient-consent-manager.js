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
exports.PatientConsentManager = PatientConsentManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var consent_service_1 = require("@/app/services/consent.service");
var lucide_react_1 = require("lucide-react");
var use_toast_1 = require("@/hooks/use-toast");
function PatientConsentManager(_a) {
    var _this = this;
    var patientId = _a.patientId, clinicId = _a.clinicId;
    var _b = (0, react_1.useState)([]), consents = _b[0], setConsents = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = (0, react_1.useState)('all'), filterStatus = _e[0], setFilterStatus = _e[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var consentService = new consent_service_1.ConsentService();
    (0, react_1.useEffect)(function () {
        loadConsents();
    }, [patientId, clinicId]);
    var loadConsents = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    setLoading(true);
                    if (!patientId) return [3 /*break*/, 2];
                    return [4 /*yield*/, consentService.getPatientConsents(patientId)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, consentService.getClinicConsents(clinicId)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    data = _a;
                    setConsents(data);
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    console.error('Error loading consents:', error_1);
                    toast({
                        title: 'Erro',
                        description: 'Não foi possível carregar os consentimentos.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleRevokeConsent = function (consentId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, consentService.revokePatientConsent(consentId)];
                case 1:
                    _a.sent();
                    toast({
                        title: 'Sucesso',
                        description: 'Consentimento revogado com sucesso.',
                    });
                    loadConsents();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error revoking consent:', error_2);
                    toast({
                        title: 'Erro',
                        description: 'Não foi possível revogar o consentimento.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'active':
                return <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500"/>;
            case 'withdrawn':
                return <lucide_react_1.XCircle className="w-4 h-4 text-red-500"/>;
            case 'expired':
                return <lucide_react_1.Clock className="w-4 h-4 text-orange-500"/>;
            default:
                return <lucide_react_1.AlertTriangle className="w-4 h-4 text-yellow-500"/>;
        }
    };
    var getStatusLabel = function (status) {
        var labels = {
            active: 'Ativo',
            withdrawn: 'Retirado',
            expired: 'Expirado',
            pending: 'Pendente'
        };
        return labels[status] || status;
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'withdrawn':
                return 'bg-red-100 text-red-800';
            case 'expired':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };
    var isExpiringSoon = function (consent) {
        if (!consent.expires_at)
            return false;
        var expiryDate = new Date(consent.expires_at);
        var today = new Date();
        var daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };
    var filteredConsents = consents.filter(function (consent) {
        var _a, _b, _c, _d;
        var matchesSearch = ((_b = (_a = consent.consent_form) === null || _a === void 0 ? void 0 : _a.form_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_d = (_c = consent.patient) === null || _c === void 0 ? void 0 : _c.full_name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesFilter = filterStatus === 'all' || consent.status === filterStatus;
        return matchesSearch && matchesFilter;
    });
    if (loading) {
        return (<div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {patientId ? 'Consentimentos do Paciente' : 'Consentimentos da Clínica'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Gerencie e monitore consentimentos de dados e tratamentos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
            <input_1.Input placeholder={patientId ? "Buscar consentimentos..." : "Buscar por paciente ou formulário..."} value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
          </div>
          <select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }} className="px-3 py-2 border border-input bg-background text-sm rounded-md">
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="withdrawn">Retirados</option>
            <option value="expired">Expirados</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500"/>
              <div>
                <p className="text-sm font-medium">Ativos</p>
                <p className="text-2xl font-bold">
                  {consents.filter(function (c) { return c.status === 'active'; }).length}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.XCircle className="w-4 h-4 text-red-500"/>
              <div>
                <p className="text-sm font-medium">Revogados</p>
                <p className="text-2xl font-bold">
                  {consents.filter(function (c) { return c.status === 'withdrawn'; }).length}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Clock className="w-4 h-4 text-orange-500"/>
              <div>
                <p className="text-sm font-medium">Expirados</p>
                <p className="text-2xl font-bold">
                  {consents.filter(function (c) { return c.status === 'expired'; }).length}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.AlertTriangle className="w-4 h-4 text-yellow-500"/>
              <div>
                <p className="text-sm font-medium">Expirando Soon</p>
                <p className="text-2xl font-bold">
                  {consents.filter(function (c) { return isExpiringSoon(c); }).length}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Consents List */}
      <div className="space-y-4">
        {filteredConsents.length === 0 ? (<card_1.Card>
            <card_1.CardContent className="p-8 text-center">
              <lucide_react_1.CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
              <h3 className="text-lg font-semibold mb-2">Nenhum consentimento encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Não há consentimentos registrados ainda.'}
              </p>
            </card_1.CardContent>
          </card_1.Card>) : (filteredConsents.map(function (consent) {
            var _a, _b, _c;
            return (<card_1.Card key={consent.id} className="hover:shadow-md transition-shadow">
              <card_1.CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(consent.status)}
                      <h4 className="font-semibold">{(_a = consent.consent_form) === null || _a === void 0 ? void 0 : _a.form_name}</h4>
                      <badge_1.Badge className={getStatusColor(consent.status)}>
                        {getStatusLabel(consent.status)}
                      </badge_1.Badge>
                      {isExpiringSoon(consent) && (<badge_1.Badge variant="outline" className="border-orange-500 text-orange-700">
                          Expira em breve
                        </badge_1.Badge>)}
                    </div>
                    
                    {!patientId && (<p className="text-sm text-muted-foreground mb-2">
                        Paciente: <span className="font-medium">{(_b = consent.patient) === null || _b === void 0 ? void 0 : _b.full_name}</span>
                      </p>)}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Data de Consentimento</p>
                        <p>{new Date(consent.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {consent.expires_at && (<div>
                          <p className="font-medium text-muted-foreground">Data de Expiração</p>
                          <p>{new Date(consent.expires_at).toLocaleDateString('pt-BR')}</p>
                        </div>)}
                      {consent.withdrawal_date && (<div>
                          <p className="font-medium text-muted-foreground">Data de Revogação</p>
                          <p>{new Date(consent.withdrawal_date).toLocaleDateString('pt-BR')}</p>
                        </div>)}
                      <div>
                        <p className="font-medium text-muted-foreground">Versão do Formulário</p>
                        <p>{(_c = consent.consent_form) === null || _c === void 0 ? void 0 : _c.form_version}</p>
                      </div>
                    </div>

                    {consent.withdrawal_reason && (<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Motivo da revogação:</strong> {consent.withdrawal_reason}
                        </p>
                      </div>)}
                  </div>

                  {consent.status === 'active' && (<div className="ml-4">
                      <button_1.Button variant="outline" size="sm" onClick={function () { return handleRevokeConsent(consent.id); }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <lucide_react_1.XCircle className="w-4 h-4 mr-1"/>
                        Revogar
                      </button_1.Button>
                    </div>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>);
        }))}
      </div>
    </div>);
}
