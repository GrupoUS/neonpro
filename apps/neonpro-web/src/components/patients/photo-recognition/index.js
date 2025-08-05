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
exports.PrivacyControls = exports.PhotoGallery = exports.IdentityVerification = exports.PhotoUpload = void 0;
exports.PhotoRecognitionSystem = PhotoRecognitionSystem;
/**
 * Photo Recognition System - Main Integration Component
 * Combines all photo recognition features into a unified interface
 *
 * @author APEX Master Developer
 */
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var tabs_1 = require("@/components/ui/tabs");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var use_toast_1 = require("@/components/ui/use-toast");
// Import photo recognition components
var photo_upload_1 = require("./photo-upload");
Object.defineProperty(exports, "PhotoUpload", { enumerable: true, get: function () { return photo_upload_1.PhotoUpload; } });
var identity_verification_1 = require("./identity-verification");
Object.defineProperty(exports, "IdentityVerification", { enumerable: true, get: function () { return identity_verification_1.IdentityVerification; } });
var photo_gallery_1 = require("./photo-gallery");
Object.defineProperty(exports, "PhotoGallery", { enumerable: true, get: function () { return photo_gallery_1.PhotoGallery; } });
var privacy_controls_1 = require("./privacy-controls");
Object.defineProperty(exports, "PrivacyControls", { enumerable: true, get: function () { return privacy_controls_1.PrivacyControls; } });
var DEFAULT_PERMISSIONS = {
    canUpload: true,
    canVerify: true,
    canManagePrivacy: true,
    canViewStats: true,
    canDelete: false
};
var PHOTO_TYPE_LABELS = {
    profile: 'Perfil',
    before: 'Antes',
    after: 'Depois',
    progress: 'Progresso',
    document: 'Documento',
    other: 'Outro'
};
function PhotoRecognitionSystem(_a) {
    var _this = this;
    var patientId = _a.patientId, patientName = _a.patientName, patientEmail = _a.patientEmail, onSystemUpdate = _a.onSystemUpdate, _b = _a.defaultTab, defaultTab = _b === void 0 ? 'gallery' : _b, _c = _a.permissions, permissions = _c === void 0 ? DEFAULT_PERMISSIONS : _c;
    var _d = (0, react_1.useState)(defaultTab), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)(null), systemStats = _e[0], setSystemStats = _e[1];
    var _f = (0, react_1.useState)(true), isLoadingStats = _f[0], setIsLoadingStats = _f[1];
    var _g = (0, react_1.useState)(0), refreshKey = _g[0], setRefreshKey = _g[1];
    var toast = (0, use_toast_1.useToast)().toast;
    (0, react_1.useEffect)(function () {
        loadSystemStats();
    }, [patientId, refreshKey]);
    var loadSystemStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!permissions.canViewStats) {
                        setIsLoadingStats(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/patients/photos/stats?patientId=".concat(patientId), {
                            headers: {
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    setSystemStats(result.data);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error loading system stats:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoadingStats(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleSystemUpdate = function (updateData) {
        // Refresh stats when system is updated
        setRefreshKey(function (prev) { return prev + 1; });
        onSystemUpdate === null || onSystemUpdate === void 0 ? void 0 : onSystemUpdate(updateData);
    };
    var handlePhotoUploaded = function (photoData) {
        toast({
            title: 'Foto enviada com sucesso',
            description: "A foto ".concat(photoData.fileName, " foi processada e armazenada.")
        });
        handleSystemUpdate({ type: 'photo_uploaded', data: photoData });
    };
    var handleVerificationCompleted = function (verificationData) {
        toast({
            title: 'Verificação concluída',
            description: "Identidade verificada com ".concat(Math.round(verificationData.confidence * 100), "% de confian\u00E7a.")
        });
        handleSystemUpdate({ type: 'verification_completed', data: verificationData });
    };
    var handlePrivacyUpdated = function (privacyData) {
        toast({
            title: 'Configurações atualizadas',
            description: 'As configurações de privacidade foram atualizadas com sucesso.'
        });
        handleSystemUpdate({ type: 'privacy_updated', data: privacyData });
    };
    var handlePhotoDeleted = function (photoId) {
        toast({
            title: 'Foto excluída',
            description: 'A foto foi removida do sistema com sucesso.'
        });
        handleSystemUpdate({ type: 'photo_deleted', data: { photoId: photoId } });
    };
    var formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    var formatDate = function (dateString) {
        if (!dateString)
            return 'Nunca';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    var getComplianceStatus = function () {
        if (!(systemStats === null || systemStats === void 0 ? void 0 : systemStats.privacyCompliance))
            return null;
        var _a = systemStats.privacyCompliance, consentGiven = _a.consentGiven, lgpdCompliant = _a.lgpdCompliant;
        if (consentGiven && lgpdCompliant) {
            return { status: 'compliant', label: 'Conforme', color: 'bg-green-100 text-green-800' };
        }
        else if (consentGiven && !lgpdCompliant) {
            return { status: 'partial', label: 'Parcial', color: 'bg-yellow-100 text-yellow-800' };
        }
        else {
            return { status: 'non-compliant', label: 'Não conforme', color: 'bg-red-100 text-red-800' };
        }
    };
    var renderStatsOverview = function () {
        if (isLoadingStats) {
            return (<card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </card_1.CardContent>
        </card_1.Card>);
        }
        if (!systemStats || !permissions.canViewStats) {
            return null;
        }
        var complianceStatus = getComplianceStatus();
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Photos */}
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Fotos</p>
                <p className="text-2xl font-bold">{systemStats.totalPhotos}</p>
              </div>
              <lucide_react_1.Camera className="h-8 w-8 text-blue-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Verification Success Rate */}
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {systemStats.verificationAttempts > 0
                ? Math.round((systemStats.successfulVerifications / systemStats.verificationAttempts) * 100)
                : 0}%
                </p>
              </div>
              <lucide_react_1.BarChart3 className="h-8 w-8 text-green-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Storage Usage */}
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Armazenamento</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(systemStats.storageUsage.totalSize)}
                </p>
              </div>
              <lucide_react_1.Upload className="h-8 w-8 text-purple-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* LGPD Compliance */}
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conformidade LGPD</p>
                {complianceStatus && (<badge_1.Badge className={complianceStatus.color}>
                    {complianceStatus.label}
                  </badge_1.Badge>)}
              </div>
              <lucide_react_1.Shield className="h-8 w-8 text-orange-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    };
    var renderPhotoTypeBreakdown = function () {
        if (!(systemStats === null || systemStats === void 0 ? void 0 : systemStats.photosByType) || !permissions.canViewStats)
            return null;
        return (<card_1.Card className="mb-6">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Distribuição por Tipo</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(systemStats.photosByType).map(function (_a) {
                var type = _a[0], count = _a[1];
                return (<div key={type} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-gray-600">
                  {PHOTO_TYPE_LABELS[type] || type}
                </p>
              </div>);
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    };
    var renderRecentActivity = function () {
        if (!(systemStats === null || systemStats === void 0 ? void 0 : systemStats.recentActivity) || !permissions.canViewStats)
            return null;
        return (<card_1.Card className="mb-6">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Atividade Recente</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Último upload:</span>
              <span className="text-sm font-medium">
                {formatDate(systemStats.recentActivity.lastUpload)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Última verificação:</span>
              <span className="text-sm font-medium">
                {formatDate(systemStats.recentActivity.lastVerification)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Última atualização de privacidade:</span>
              <span className="text-sm font-medium">
                {formatDate(systemStats.recentActivity.lastPrivacyUpdate)}
              </span>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    };
    return (<div className="space-y-6">
      {/* Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Camera className="h-6 w-6"/>
              Sistema de Reconhecimento Facial - {patientName}
            </card_1.CardTitle>
            <div className="flex items-center gap-2">
              {patientEmail && (<badge_1.Badge variant="outline">{patientEmail}</badge_1.Badge>)}
              <button_1.Button variant="outline" size="sm" onClick={function () { return setRefreshKey(function (prev) { return prev + 1; }); }}>
                <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
                Atualizar
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Stats Overview */}
      {renderStatsOverview()}
      {renderPhotoTypeBreakdown()}
      {renderRecentActivity()}

      {/* Main Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="gallery" className="flex items-center gap-2">
            <lucide_react_1.Eye className="h-4 w-4"/>
            Galeria
          </tabs_1.TabsTrigger>
          
          {permissions.canUpload && (<tabs_1.TabsTrigger value="upload" className="flex items-center gap-2">
              <lucide_react_1.Upload className="h-4 w-4"/>
              Upload
            </tabs_1.TabsTrigger>)}
          
          {permissions.canVerify && (<tabs_1.TabsTrigger value="verify" className="flex items-center gap-2">
              <lucide_react_1.Camera className="h-4 w-4"/>
              Verificar
            </tabs_1.TabsTrigger>)}
          
          {permissions.canManagePrivacy && (<tabs_1.TabsTrigger value="privacy" className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-4 w-4"/>
              Privacidade
            </tabs_1.TabsTrigger>)}
        </tabs_1.TabsList>

        {/* Gallery Tab */}
        <tabs_1.TabsContent value="gallery" className="space-y-4">
          <photo_gallery_1.PhotoGallery patientId={patientId} patientName={patientName} onPhotoDeleted={handlePhotoDeleted} allowDelete={permissions.canDelete} allowDownload={true}/>
        </tabs_1.TabsContent>

        {/* Upload Tab */}
        {permissions.canUpload && (<tabs_1.TabsContent value="upload" className="space-y-4">
            <photo_upload_1.PhotoUpload patientId={patientId} patientName={patientName} onPhotoUploaded={handlePhotoUploaded} maxFileSize={10 * 1024 * 1024} // 10MB
         allowedTypes={['image/jpeg', 'image/png', 'image/webp']} enableFacialRecognition={true}/>
          </tabs_1.TabsContent>)}

        {/* Verification Tab */}
        {permissions.canVerify && (<tabs_1.TabsContent value="verify" className="space-y-4">
            <identity_verification_1.IdentityVerification patientId={patientId} patientName={patientName} onVerificationCompleted={handleVerificationCompleted} enableCamera={true} confidenceThreshold={0.8}/>
          </tabs_1.TabsContent>)}

        {/* Privacy Tab */}
        {permissions.canManagePrivacy && (<tabs_1.TabsContent value="privacy" className="space-y-4">
            <privacy_controls_1.PrivacyControls patientId={patientId} patientName={patientName} onPrivacyUpdated={handlePrivacyUpdated} readOnly={false}/>
          </tabs_1.TabsContent>)}
      </tabs_1.Tabs>
    </div>);
}
