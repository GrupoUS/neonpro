// ============================================================================
// Supplier Detail View Component - Epic 6, Story 6.3
// ============================================================================
// Comprehensive supplier detail view with performance metrics, analytics,
// procurement history, quality tracking, and management features
// ============================================================================
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
exports.SupplierDetail = SupplierDetail;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var avatar_1 = require("@/components/ui/avatar");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var supplier_1 = require("@/lib/types/supplier");
var use_supplier_1 = require("@/lib/hooks/use-supplier");
var supplier_form_1 = require("./supplier-form");
var utils_1 = require("@/lib/utils");
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
var getStatusColor = function (status) {
    switch (status) {
        case supplier_1.SupplierStatus.ACTIVE:
            return 'bg-green-100 text-green-800 border-green-200';
        case supplier_1.SupplierStatus.INACTIVE:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        case supplier_1.SupplierStatus.PENDING_VERIFICATION:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case supplier_1.SupplierStatus.SUSPENDED:
            return 'bg-red-100 text-red-800 border-red-200';
        case supplier_1.SupplierStatus.BLACKLISTED:
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
var getRiskLevelColor = function (level) {
    switch (level) {
        case supplier_1.RiskLevel.LOW:
            return 'text-green-600';
        case supplier_1.RiskLevel.MEDIUM:
            return 'text-yellow-600';
        case supplier_1.RiskLevel.HIGH:
            return 'text-red-600';
        case supplier_1.RiskLevel.CRITICAL:
            return 'text-red-800';
        default:
            return 'text-gray-600';
    }
};
var getPerformanceColor = function (score) {
    if (score >= 90)
        return 'text-green-600';
    if (score >= 70)
        return 'text-yellow-600';
    if (score >= 50)
        return 'text-orange-600';
    return 'text-red-600';
};
var formatScore = function (score) {
    return "".concat(score.toFixed(1), "%");
};
// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================
var MetricCard = function (_a) {
    var title = _a.title, value = _a.value, subtitle = _a.subtitle, icon = _a.icon, trend = _a.trend, trendValue = _a.trendValue, _b = _a.color, color = _b === void 0 ? 'default' : _b;
    var colorClasses = {
        default: 'border-gray-200',
        success: 'border-green-200 bg-green-50',
        warning: 'border-yellow-200 bg-yellow-50',
        danger: 'border-red-200 bg-red-50'
    };
    var trendIcon = trend === 'up' ?
        <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/> :
        trend === 'down' ?
            <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/> :
            null;
    return (<card_1.Card className={(0, utils_1.cn)('transition-all hover:shadow-md', colorClasses[color])}>
      <card_1.CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white border">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (<p className="text-xs text-gray-500">{subtitle}</p>)}
            </div>
          </div>
          {trendValue && trendIcon && (<div className="flex items-center space-x-1">
              {trendIcon}
              <span className={(0, utils_1.cn)('text-sm font-medium', trend === 'up' ? 'text-green-600' : 'text-red-600')}>
                {trendValue}
              </span>
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function SupplierDetail(_a) {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    var _this = this;
    var supplierId = _a.supplierId, clinicId = _a.clinicId, open = _a.open, onOpenChange = _a.onOpenChange, onEdit = _a.onEdit, onDelete = _a.onDelete;
    var _b = (0, react_1.useState)('overview'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)(false), editFormOpen = _c[0], setEditFormOpen = _c[1];
    var _d = (0, react_1.useState)('3months'), selectedTimeRange = _d[0], setSelectedTimeRange = _d[1];
    // Data hooks
    var _e = (0, use_supplier_1.useSuppliers)(clinicId), supplier = _e.supplier, deleteSupplier = _e.deleteSupplier, isLoadingSupplier = _e.isLoading;
    var _f = (0, use_supplier_1.useSupplierPerformance)(clinicId, supplierId, selectedTimeRange), performanceData = _f.performanceData, performanceStats = _f.performanceStats, isLoadingPerformance = _f.isLoading;
    var _g = (0, use_supplier_1.useSupplierProcurement)(clinicId, supplierId, selectedTimeRange), procurementHistory = _g.procurementHistory, procurementStats = _g.procurementStats, isLoadingProcurement = _g.isLoading;
    var _h = (0, use_supplier_1.useSupplierQuality)(clinicId, supplierId, selectedTimeRange), qualityData = _h.qualityData, qualityStats = _h.qualityStats, isLoadingQuality = _h.isLoading;
    var _j = (0, use_supplier_1.useSupplierContracts)(clinicId, supplierId), contracts = _j.contracts, activeContracts = _j.activeContracts, isLoadingContracts = _j.isLoading;
    var _k = (0, use_supplier_1.useSupplierCommunications)(clinicId, supplierId), communications = _k.communications, recentCommunications = _k.recentCommunications, isLoadingCommunications = _k.isLoading;
    // Get current supplier data
    var currentSupplier = supplier === null || supplier === void 0 ? void 0 : supplier.find(function (s) { return s.id === supplierId; });
    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================
    var isLoading = isLoadingSupplier || isLoadingPerformance ||
        isLoadingProcurement || isLoadingQuality ||
        isLoadingContracts || isLoadingCommunications;
    var overallPerformance = currentSupplier ?
        (currentSupplier.performance_score +
            currentSupplier.quality_rating +
            currentSupplier.reliability_score +
            currentSupplier.cost_competitiveness) / 4 : 0;
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    var handleEdit = function () {
        if (currentSupplier && onEdit) {
            onEdit(currentSupplier);
        }
        setEditFormOpen(true);
    };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentSupplier)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteSupplier(currentSupplier.id)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Fornecedor excluído com sucesso');
                    onOpenChange(false);
                    onDelete === null || onDelete === void 0 ? void 0 : onDelete(currentSupplier);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Erro ao excluir fornecedor:', error_1);
                    sonner_1.toast.error('Erro ao excluir fornecedor');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleExport = function () {
        // Implementation for exporting supplier data
        sonner_1.toast.info('Funcionalidade de exportação em desenvolvimento');
    };
    var handleCopyId = function () {
        navigator.clipboard.writeText(supplierId);
        sonner_1.toast.success('ID copiado para a área de transferência');
    };
    // ============================================================================
    // RENDER HELPERS
    // ============================================================================
    var renderHeader = function () {
        var _a;
        if (!currentSupplier)
            return null;
        return (<div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <avatar_1.Avatar className="h-16 w-16">
            <avatar_1.AvatarImage src={currentSupplier.logo_url}/>
            <avatar_1.AvatarFallback className="text-lg font-semibold">
              {currentSupplier.name.substring(0, 2).toUpperCase()}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentSupplier.name}
              </h1>
              <badge_1.Badge className={getStatusColor(currentSupplier.status)}>
                {currentSupplier.status.replace('_', ' ')}
              </badge_1.Badge>
            </div>
            
            <p className="text-gray-600 mb-1">{currentSupplier.legal_name}</p>
            <p className="text-sm text-gray-500">
              {currentSupplier.category.replace('_', ' ').toLowerCase()}
            </p>
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              {currentSupplier.cnpj && (<span>CNPJ: {currentSupplier.cnpj}</span>)}
              {((_a = currentSupplier.primary_contact) === null || _a === void 0 ? void 0 : _a.email) && (<div className="flex items-center space-x-1">
                  <lucide_react_1.Mail className="h-4 w-4"/>
                  <span>{currentSupplier.primary_contact.email}</span>
                </div>)}
              {currentSupplier.website && (<div className="flex items-center space-x-1">
                  <lucide_react_1.Globe className="h-4 w-4"/>
                  <a href={currentSupplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    Website
                    <lucide_react_1.ExternalLink className="h-3 w-3 ml-1 inline"/>
                  </a>
                </div>)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={handleCopyId}>
            <lucide_react_1.Copy className="h-4 w-4 mr-2"/>
            ID
          </button_1.Button>
          
          <button_1.Button variant="outline" size="sm" onClick={handleExport}>
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar
          </button_1.Button>
          
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem onClick={handleEdit}>
                <lucide_react_1.Edit className="h-4 w-4 mr-2"/>
                Editar
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.Upload className="h-4 w-4 mr-2"/>
                Importar Dados
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
                Excluir
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>);
    };
    var renderOverviewTab = function () {
        if (!currentSupplier)
            return null;
        return (<div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Performance Geral" value={formatScore(overallPerformance)} icon={<lucide_react_1.TrendingUp className="h-5 w-5"/>} color={overallPerformance >= 80 ? 'success' :
                overallPerformance >= 60 ? 'warning' : 'danger'}/>
          
          <MetricCard title="Qualidade" value={formatScore(currentSupplier.quality_rating)} icon={<lucide_react_1.Star className="h-5 w-5"/>} color={currentSupplier.quality_rating >= 80 ? 'success' :
                currentSupplier.quality_rating >= 60 ? 'warning' : 'danger'}/>
          
          <MetricCard title="Confiabilidade" value={formatScore(currentSupplier.reliability_score)} icon={<lucide_react_1.Shield className="h-5 w-5"/>} color={currentSupplier.reliability_score >= 80 ? 'success' :
                currentSupplier.reliability_score >= 60 ? 'warning' : 'danger'}/>
          
          <MetricCard title="Competitividade" value={formatScore(currentSupplier.cost_competitiveness)} icon={<lucide_react_1.DollarSign className="h-5 w-5"/>} color={currentSupplier.cost_competitiveness >= 80 ? 'success' :
                currentSupplier.cost_competitiveness >= 60 ? 'warning' : 'danger'}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Building2 className="h-5 w-5"/>
                <span>Informações Básicas</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Categoria</p>
                  <p className="font-medium">
                    {currentSupplier.category.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Nível de Risco</p>
                  <p className={(0, utils_1.cn)('font-medium', getRiskLevelColor(currentSupplier.risk_level))}>
                    {currentSupplier.risk_level}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Prazo de Pagamento</p>
                  <p className="font-medium">
                    {currentSupplier.payment_terms.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Moeda</p>
                  <p className="font-medium">{currentSupplier.currency}</p>
                </div>
              </div>

              {currentSupplier.tags && currentSupplier.tags.length > 0 && (<div>
                  <p className="text-gray-600 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {currentSupplier.tags.map(function (tag, index) { return (<badge_1.Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </badge_1.Badge>); })}
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>

          {/* Contact Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.User className="h-5 w-5"/>
                <span>Contato Principal</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {currentSupplier.primary_contact && (<div className="space-y-3">
                  <div>
                    <p className="font-medium">{currentSupplier.primary_contact.name}</p>
                    {currentSupplier.primary_contact.title && (<p className="text-sm text-gray-600">{currentSupplier.primary_contact.title}</p>)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <lucide_react_1.Mail className="h-4 w-4 text-gray-400"/>
                      <span>{currentSupplier.primary_contact.email}</span>
                    </div>
                    
                    {currentSupplier.primary_contact.phone && (<div className="flex items-center space-x-2">
                        <lucide_react_1.Phone className="h-4 w-4 text-gray-400"/>
                        <span>{currentSupplier.primary_contact.phone}</span>
                      </div>)}
                  </div>
                </div>)}
              
              {currentSupplier.secondary_contacts && currentSupplier.secondary_contacts.length > 0 && (<div>
                  <separator_1.Separator className="my-3"/>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Contatos Secundários ({currentSupplier.secondary_contacts.length})
                  </p>
                  <div className="space-y-2">
                    {currentSupplier.secondary_contacts.slice(0, 2).map(function (contact, index) { return (<div key={index} className="text-sm">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-gray-600">{contact.email}</p>
                      </div>); })}
                    {currentSupplier.secondary_contacts.length > 2 && (<p className="text-xs text-gray-500">
                        +{currentSupplier.secondary_contacts.length - 2} contatos adicionais
                      </p>)}
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>

          {/* Address Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.MapPin className="h-5 w-5"/>
                <span>Endereço</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {currentSupplier.address && (<div className="text-sm space-y-1">
                  <p>
                    {currentSupplier.address.street}, {currentSupplier.address.number}
                    {currentSupplier.address.complement && ", ".concat(currentSupplier.address.complement)}
                  </p>
                  <p>{currentSupplier.address.neighborhood}</p>
                  <p>
                    {currentSupplier.address.city} - {currentSupplier.address.state}
                  </p>
                  <p>{currentSupplier.address.postal_code}</p>
                  <p>{currentSupplier.address.country}</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>

          {/* Compliance Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Shield className="h-5 w-5"/>
                <span>Compliance</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {currentSupplier.regulatory_compliance ? (<lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>) : (<lucide_react_1.XCircle className="h-5 w-5 text-red-600"/>)}
                <span className="text-sm">
                  {currentSupplier.regulatory_compliance
                ? 'Em conformidade regulatória'
                : 'Não conforme'}
                </span>
              </div>

              {currentSupplier.anvisa_registration && (<div>
                  <p className="text-gray-600 text-sm">Registro ANVISA</p>
                  <p className="font-medium">{currentSupplier.anvisa_registration}</p>
                </div>)}

              {currentSupplier.certifications && currentSupplier.certifications.length > 0 && (<div>
                  <p className="text-gray-600 text-sm mb-2">
                    Certificações ({currentSupplier.certifications.length})
                  </p>
                  <div className="space-y-2">
                    {currentSupplier.certifications.slice(0, 3).map(function (cert, index) { return (<div key={index} className="flex items-center space-x-2">
                        <lucide_react_1.Award className="h-4 w-4 text-gray-400"/>
                        <span className="text-sm">{cert.name}</span>
                        <badge_1.Badge variant={cert.verification_status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                          {cert.verification_status}
                        </badge_1.Badge>
                      </div>); })}
                    {currentSupplier.certifications.length > 3 && (<p className="text-xs text-gray-500">
                        +{currentSupplier.certifications.length - 3} certificações adicionais
                      </p>)}
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Notes */}
        {currentSupplier.notes && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.FileText className="h-5 w-5"/>
                <span>Observações</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {currentSupplier.notes}
              </p>
            </card_1.CardContent>
          </card_1.Card>)}
      </div>);
    };
    var renderPerformanceTab = function () { return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Análise de Performance</h3>
        <div className="flex space-x-2">
          <button_1.Button variant={selectedTimeRange === '1month' ? 'default' : 'outline'} size="sm" onClick={function () { return setSelectedTimeRange('1month'); }}>
            1 Mês
          </button_1.Button>
          <button_1.Button variant={selectedTimeRange === '3months' ? 'default' : 'outline'} size="sm" onClick={function () { return setSelectedTimeRange('3months'); }}>
            3 Meses
          </button_1.Button>
          <button_1.Button variant={selectedTimeRange === '6months' ? 'default' : 'outline'} size="sm" onClick={function () { return setSelectedTimeRange('6months'); }}>
            6 Meses
          </button_1.Button>
          <button_1.Button variant={selectedTimeRange === '1year' ? 'default' : 'outline'} size="sm" onClick={function () { return setSelectedTimeRange('1year'); }}>
            1 Ano
          </button_1.Button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      {performanceStats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Entregas no Prazo" value={(0, utils_1.formatPercentage)(performanceStats.on_time_delivery_rate)} icon={<lucide_react_1.Clock className="h-5 w-5"/>} color={performanceStats.on_time_delivery_rate >= 0.9 ? 'success' :
                performanceStats.on_time_delivery_rate >= 0.7 ? 'warning' : 'danger'}/>
          
          <MetricCard title="Taxa de Qualidade" value={(0, utils_1.formatPercentage)(performanceStats.quality_score)} icon={<lucide_react_1.Star className="h-5 w-5"/>} color={performanceStats.quality_score >= 0.9 ? 'success' :
                performanceStats.quality_score >= 0.7 ? 'warning' : 'danger'}/>
          
          <MetricCard title="Pedidos Entregues" value={performanceStats.total_orders.toString()} subtitle="Total no período" icon={<lucide_react_1.Package className="h-5 w-5"/>}/>
          
          <MetricCard title="Valor Total" value={(0, utils_1.formatCurrency)(performanceStats.total_value)} subtitle="Total faturado" icon={<lucide_react_1.DollarSign className="h-5 w-5"/>}/>
        </div>)}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.LineChart className="h-5 w-5"/>
              <span>Tendência de Performance</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {/* Chart implementation would go here */}
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto mb-2"/>
                <p>Gráfico de tendência em desenvolvimento</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.PieChart className="h-5 w-5"/>
              <span>Distribuição de Qualidade</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {/* Chart implementation would go here */}
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <lucide_react_1.PieChart className="h-12 w-12 mx-auto mb-2"/>
                <p>Gráfico de distribuição em desenvolvimento</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Recent Performance Issues */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5"/>
            <span>Alertas de Performance</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600"/>
              <div>
                <p className="font-medium text-yellow-800">Atraso em Entregas</p>
                <p className="text-sm text-yellow-700">
                  Taxa de entregas no prazo abaixo de 85% nos últimos 30 dias
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <lucide_react_1.TrendingUp className="h-5 w-5 text-blue-600"/>
              <div>
                <p className="font-medium text-blue-800">Melhoria de Qualidade</p>
                <p className="text-sm text-blue-700">
                  Pontuação de qualidade aumentou 12% este mês
                </p>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var renderProcurementTab = function () { return (<div className="space-y-6">
      <h3 className="text-lg font-semibold">Histórico de Compras</h3>

      {/* Procurement Stats */}
      {procurementStats && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total de Pedidos" value={procurementStats.total_orders.toString()} icon={<lucide_react_1.Package className="h-5 w-5"/>}/>
          
          <MetricCard title="Valor Total" value={(0, utils_1.formatCurrency)(procurementStats.total_value)} icon={<lucide_react_1.DollarSign className="h-5 w-5"/>}/>
          
          <MetricCard title="Ticket Médio" value={(0, utils_1.formatCurrency)(procurementStats.average_order_value)} icon={<lucide_react_1.TrendingUp className="h-5 w-5"/>}/>
        </div>)}

      {/* Recent Orders */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.FileText className="h-5 w-5"/>
            <span>Pedidos Recentes</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {procurementHistory && procurementHistory.length > 0 ? (procurementHistory.slice(0, 5).map(function (order, index) { return (<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {(0, utils_1.formatDate)(order.date)} • {order.items} itens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(0, utils_1.formatCurrency)(order.total_value)}</p>
                    <badge_1.Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                      {order.status}
                    </badge_1.Badge>
                  </div>
                </div>); })) : (<p className="text-gray-500 text-center py-8">
                Nenhum histórico de compras encontrado
              </p>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var renderContractsTab = function () { return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contratos</h3>
        <button_1.Button>
          <Plus className="h-4 w-4 mr-2"/>
          Novo Contrato
        </button_1.Button>
      </div>

      {/* Active Contracts */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.FileText className="h-5 w-5"/>
            <span>Contratos Ativos</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {activeContracts && activeContracts.length > 0 ? (activeContracts.map(function (contract, index) { return (<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-gray-600">
                      Vigência: {(0, utils_1.formatDate)(contract.start_date)} - {(0, utils_1.formatDate)(contract.end_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valor: {(0, utils_1.formatCurrency)(contract.total_value)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <badge_1.Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                      {contract.status}
                    </badge_1.Badge>
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Eye className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                </div>); })) : (<p className="text-gray-500 text-center py-8">
                Nenhum contrato ativo encontrado
              </p>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var renderCommunicationsTab = function () { return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Comunicações</h3>
        <button_1.Button>
          <Plus className="h-4 w-4 mr-2"/>
          Nova Comunicação
        </button_1.Button>
      </div>

      {/* Recent Communications */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.Mail className="h-5 w-5"/>
            <span>Comunicações Recentes</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {recentCommunications && recentCommunications.length > 0 ? (recentCommunications.map(function (comm, index) { return (<div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {comm.type === 'email' ? (<lucide_react_1.Mail className="h-5 w-5 text-blue-600"/>) : comm.type === 'phone' ? (<lucide_react_1.Phone className="h-5 w-5 text-green-600"/>) : (<lucide_react_1.Activity className="h-5 w-5 text-gray-600"/>)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{comm.subject}</p>
                    <p className="text-sm text-gray-600">{comm.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{(0, utils_1.formatDate)(comm.date)}</span>
                      <span>Por: {comm.created_by}</span>
                      <badge_1.Badge variant="outline" className="text-xs">
                        {comm.type}
                      </badge_1.Badge>
                    </div>
                  </div>
                </div>); })) : (<p className="text-gray-500 text-center py-8">
                Nenhuma comunicação registrada
              </p>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    if (!open)
        return null;
    if (isLoading) {
        return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
        <dialog_1.DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin text-gray-400"/>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>);
    }
    if (!currentSupplier) {
        return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
        <dialog_1.DialogContent className="max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Fornecedor não encontrado</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              O fornecedor solicitado não foi encontrado.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>);
    }
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {renderHeader()}

          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
            <tabs_1.TabsList className="grid w-full grid-cols-5">
              <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="procurement">Compras</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="contracts">Contratos</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="communications">Comunicações</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="overview" className="mt-6">
              {renderOverviewTab()}
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="performance" className="mt-6">
              {renderPerformanceTab()}
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="procurement" className="mt-6">
              {renderProcurementTab()}
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="contracts" className="mt-6">
              {renderContractsTab()}
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="communications" className="mt-6">
              {renderCommunicationsTab()}
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </div>

        {/* Edit Form Modal */}
        {editFormOpen && currentSupplier && (<supplier_form_1.SupplierForm supplier={currentSupplier} clinicId={clinicId} open={editFormOpen} onOpenChange={setEditFormOpen} mode="edit" onSuccess={function () {
                setEditFormOpen(false);
                // Refresh data
            }}/>)}
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
