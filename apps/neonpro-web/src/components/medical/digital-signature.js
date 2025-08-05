"use client";
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
exports.DigitalSignature = DigitalSignature;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var SIGNATURE_TYPES = [
    {
        value: 'digital_certificate',
        label: 'Certificado Digital',
        icon: <lucide_react_1.Shield className="w-4 h-4"/>,
        color: 'bg-green-100 text-green-800',
        description: 'Assinatura com certificado digital ICP-Brasil'
    },
    {
        value: 'electronic',
        label: 'Eletrônica Simples',
        icon: <lucide_react_1.PenTool className="w-4 h-4"/>,
        color: 'bg-blue-100 text-blue-800',
        description: 'Assinatura eletrônica com login e senha'
    },
    {
        value: 'biometric',
        label: 'Biométrica',
        icon: <lucide_react_1.Fingerprint className="w-4 h-4"/>,
        color: 'bg-purple-100 text-purple-800',
        description: 'Assinatura com dados biométricos'
    },
    {
        value: 'pin',
        label: 'PIN/Token',
        icon: <lucide_react_1.Key className="w-4 h-4"/>,
        color: 'bg-orange-100 text-orange-800',
        description: 'Assinatura com PIN ou token de segurança'
    },
    {
        value: 'sms',
        label: 'SMS/OTP',
        icon: <lucide_react_1.Smartphone className="w-4 h-4"/>,
        color: 'bg-indigo-100 text-indigo-800',
        description: 'Verificação por SMS com código OTP'
    }
];
var SIGNATURE_STATUS = [
    { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: <lucide_react_1.Clock className="w-3 h-3"/> },
    { value: 'signed', label: 'Assinado', color: 'bg-green-100 text-green-800', icon: <lucide_react_1.CheckCircle className="w-3 h-3"/> },
    { value: 'rejected', label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: <lucide_react_1.X className="w-3 h-3"/> },
    { value: 'expired', label: 'Expirado', color: 'bg-gray-100 text-gray-800', icon: <lucide_react_1.AlertTriangle className="w-3 h-3"/> }
];
var SIGNER_ROLES = [
    { value: 'doctor', label: 'Médico', icon: <lucide_react_1.UserCheck className="w-4 h-4"/> },
    { value: 'patient', label: 'Paciente', icon: <lucide_react_1.User className="w-4 h-4"/> },
    { value: 'nurse', label: 'Enfermeiro(a)', icon: <lucide_react_1.UserCheck className="w-4 h-4"/> },
    { value: 'admin', label: 'Administrador', icon: <lucide_react_1.Shield className="w-4 h-4"/> },
    { value: 'witness', label: 'Testemunha', icon: <lucide_react_1.Eye className="w-4 h-4"/> },
    { value: 'legal_guardian', label: 'Responsável Legal', icon: <lucide_react_1.Shield className="w-4 h-4"/> }
];
function DigitalSignature(_a) {
    var _this = this;
    var documentId = _a.documentId, documentName = _a.documentName, patientId = _a.patientId, clinicId = _a.clinicId, onSignatureComplete = _a.onSignatureComplete, onRequestSent = _a.onRequestSent, _b = _a.allowedSignatureTypes, allowedSignatureTypes = _b === void 0 ? ['digital_certificate', 'electronic', 'pin'] : _b, _c = _a.requireMultipleSignatures, requireMultipleSignatures = _c === void 0 ? false : _c;
    var _d = (0, react_1.useState)([]), signatures = _d[0], setSignatures = _d[1];
    var _e = (0, react_1.useState)([]), signatureRequests = _e[0], setSignatureRequests = _e[1];
    var _f = (0, react_1.useState)(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)(false), showSignDialog = _g[0], setShowSignDialog = _g[1];
    var _h = (0, react_1.useState)(false), showRequestDialog = _h[0], setShowRequestDialog = _h[1];
    var _j = (0, react_1.useState)(''), selectedSignatureType = _j[0], setSelectedSignatureType = _j[1];
    var _k = (0, react_1.useState)({
        signerName: '',
        signerRole: '',
        password: '',
        pinCode: '',
        otpCode: '',
        certificateFile: null,
        biometricData: '',
        reason: ''
    }), signatureData = _k[0], setSignatureData = _k[1];
    var _l = (0, react_1.useState)({
        message: '',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        requiredSigners: []
    }), newRequest = _l[0], setNewRequest = _l[1];
    var _m = (0, react_1.useState)({
        name: '',
        email: '',
        role: '',
        signatureType: '',
        isRequired: true
    }), newSigner = _m[0], setNewSigner = _m[1];
    var canvasRef = (0, react_1.useRef)(null);
    var _o = (0, react_1.useState)(false), isDrawing = _o[0], setIsDrawing = _o[1];
    var _p = (0, react_1.useState)(''), signatureCanvas = _p[0], setSignatureCanvas = _p[1];
    // Load signatures and requests
    (0, react_1.useEffect)(function () {
        loadSignatures();
        loadSignatureRequests();
    }, [documentId]);
    var loadSignatures = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockSignatures;
        return __generator(this, function (_a) {
            try {
                mockSignatures = [
                    {
                        id: '1',
                        documentId: documentId,
                        signerId: 'dr-silva',
                        signerName: 'Dr. João Silva',
                        signerRole: 'doctor',
                        signatureType: 'digital_certificate',
                        signatureData: 'base64_signature_data',
                        certificateId: 'cert_123456',
                        ipAddress: '192.168.1.100',
                        userAgent: 'Mozilla/5.0...',
                        timestamp: new Date('2024-01-15T10:30:00'),
                        isValid: true,
                        validationDetails: {
                            certificateValid: true,
                            timestampValid: true,
                            integrityValid: true,
                            revocationStatus: 'valid',
                            validationDate: new Date('2024-01-15T10:30:00'),
                            validatorId: 'validator_001'
                        },
                        metadata: {
                            certificateIssuer: 'ICP-Brasil',
                            certificateSerial: '123456789',
                            hashAlgorithm: 'SHA-256'
                        }
                    }
                ];
                setSignatures(mockSignatures);
            }
            catch (error) {
                console.error('Erro ao carregar assinaturas:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var loadSignatureRequests = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockRequests;
        return __generator(this, function (_a) {
            try {
                mockRequests = [
                    {
                        id: '1',
                        documentId: documentId,
                        documentName: documentName,
                        requesterId: 'dr-silva',
                        requesterName: 'Dr. João Silva',
                        requiredSigners: [
                            {
                                id: 'patient-001',
                                name: 'Maria Santos',
                                email: 'maria@email.com',
                                role: 'patient',
                                signatureType: 'electronic',
                                isRequired: true
                            },
                            {
                                id: 'witness-001',
                                name: 'Ana Costa',
                                email: 'ana@email.com',
                                role: 'witness',
                                signatureType: 'electronic',
                                isRequired: false
                            }
                        ],
                        message: 'Por favor, assine o termo de consentimento para o procedimento.',
                        deadline: new Date('2024-01-22T23:59:59'),
                        status: 'pending',
                        createdAt: new Date('2024-01-15T09:00:00'),
                        signatures: []
                    }
                ];
                setSignatureRequests(mockRequests);
            }
            catch (error) {
                console.error('Erro ao carregar solicitações de assinatura:', error);
            }
            return [2 /*return*/];
        });
    }); };
    // Canvas drawing functions
    var startDrawing = function (e) {
        setIsDrawing(true);
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var rect = canvas.getBoundingClientRect();
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };
    var draw = function (e) {
        if (!isDrawing)
            return;
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var rect = canvas.getBoundingClientRect();
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };
    var stopDrawing = function () {
        setIsDrawing(false);
        var canvas = canvasRef.current;
        if (canvas) {
            setSignatureCanvas(canvas.toDataURL());
        }
    };
    var clearCanvas = function () {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureCanvas('');
    };
    var handleSign = function () { return __awaiter(_this, void 0, void 0, function () {
        var newSignature_1;
        return __generator(this, function (_a) {
            setIsLoading(true);
            try {
                newSignature_1 = {
                    id: crypto.randomUUID(),
                    documentId: documentId,
                    signerId: 'current-user',
                    signerName: signatureData.signerName,
                    signerRole: signatureData.signerRole,
                    signatureType: selectedSignatureType,
                    signatureData: selectedSignatureType === 'electronic' ? signatureCanvas : 'encrypted_signature_data',
                    certificateId: selectedSignatureType === 'digital_certificate' ? 'cert_' + crypto.randomUUID() : undefined,
                    biometricData: selectedSignatureType === 'biometric' ? signatureData.biometricData : undefined,
                    pinCode: selectedSignatureType === 'pin' ? 'encrypted_pin' : undefined,
                    ipAddress: '192.168.1.100',
                    userAgent: navigator.userAgent,
                    timestamp: new Date(),
                    isValid: true,
                    validationDetails: {
                        certificateValid: selectedSignatureType === 'digital_certificate',
                        timestampValid: true,
                        integrityValid: true,
                        revocationStatus: 'valid',
                        validationDate: new Date(),
                        validatorId: 'validator_001'
                    },
                    metadata: {
                        reason: signatureData.reason,
                        signatureMethod: selectedSignatureType,
                        deviceInfo: navigator.platform
                    }
                };
                setSignatures(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newSignature_1], false); });
                onSignatureComplete === null || onSignatureComplete === void 0 ? void 0 : onSignatureComplete(newSignature_1);
                setShowSignDialog(false);
                setSignatureData({
                    signerName: '',
                    signerRole: '',
                    password: '',
                    pinCode: '',
                    otpCode: '',
                    certificateFile: null,
                    biometricData: '',
                    reason: ''
                });
                setSelectedSignatureType('');
                clearCanvas();
            }
            catch (error) {
                console.error('Erro ao assinar documento:', error);
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var addSigner = function () {
        if (newSigner.name && newSigner.email && newSigner.role && newSigner.signatureType) {
            var signer_1 = {
                id: crypto.randomUUID(),
                name: newSigner.name,
                email: newSigner.email,
                role: newSigner.role,
                signatureType: newSigner.signatureType,
                isRequired: newSigner.isRequired
            };
            setNewRequest(function (prev) { return (__assign(__assign({}, prev), { requiredSigners: __spreadArray(__spreadArray([], prev.requiredSigners, true), [signer_1], false) })); });
            setNewSigner({
                name: '',
                email: '',
                role: '',
                signatureType: '',
                isRequired: true
            });
        }
    };
    var removeSigner = function (signerId) {
        setNewRequest(function (prev) { return (__assign(__assign({}, prev), { requiredSigners: prev.requiredSigners.filter(function (s) { return s.id !== signerId; }) })); });
    };
    var sendSignatureRequest = function () { return __awaiter(_this, void 0, void 0, function () {
        var request_1;
        return __generator(this, function (_a) {
            try {
                request_1 = {
                    id: crypto.randomUUID(),
                    documentId: documentId,
                    documentName: documentName,
                    requesterId: 'current-user',
                    requesterName: 'Current User',
                    requiredSigners: newRequest.requiredSigners,
                    message: newRequest.message,
                    deadline: newRequest.deadline,
                    status: 'pending',
                    createdAt: new Date(),
                    signatures: []
                };
                setSignatureRequests(function (prev) { return __spreadArray(__spreadArray([], prev, true), [request_1], false); });
                onRequestSent === null || onRequestSent === void 0 ? void 0 : onRequestSent(request_1);
                setShowRequestDialog(false);
                setNewRequest({
                    message: '',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    requiredSigners: []
                });
            }
            catch (error) {
                console.error('Erro ao enviar solicitação de assinatura:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var getSignatureTypeInfo = function (type) {
        return SIGNATURE_TYPES.find(function (t) { return t.value === type; }) || SIGNATURE_TYPES[0];
    };
    var getSignerRoleInfo = function (role) {
        return SIGNER_ROLES.find(function (r) { return r.value === role; }) || SIGNER_ROLES[0];
    };
    var getStatusBadge = function (status) {
        var statusInfo = SIGNATURE_STATUS.find(function (s) { return s.value === status; });
        return (<badge_1.Badge className={statusInfo === null || statusInfo === void 0 ? void 0 : statusInfo.color}>
        <div className="flex items-center space-x-1">
          {statusInfo === null || statusInfo === void 0 ? void 0 : statusInfo.icon}
          <span>{statusInfo === null || statusInfo === void 0 ? void 0 : statusInfo.label}</span>
        </div>
      </badge_1.Badge>);
    };
    var validateSignature = function (signatureId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Simulate signature validation
            console.log('Validating signature:', signatureId);
            return [2 /*return*/];
        });
    }); };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assinaturas Digitais</h2>
          <p className="text-gray-600">Gerencie assinaturas e solicitações para {documentName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <dialog_1.Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button variant="outline">
                <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                Solicitar Assinaturas
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Solicitar Assinaturas</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Envie solicitações de assinatura para múltiplos signatários
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="message">Mensagem</label_1.Label>
                  <textarea_1.Textarea id="message" value={newRequest.message} onChange={function (e) { return setNewRequest(function (prev) { return (__assign(__assign({}, prev), { message: e.target.value })); }); }} placeholder="Mensagem para os signatários" rows={3}/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="deadline">Prazo</label_1.Label>
                  <input_1.Input id="deadline" type="datetime-local" value={(0, date_fns_1.format)(newRequest.deadline, "yyyy-MM-dd'T'HH:mm")} onChange={function (e) { return setNewRequest(function (prev) { return (__assign(__assign({}, prev), { deadline: new Date(e.target.value) })); }); }}/>
                </div>

                {/* Add Signer Form */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Adicionar Signatário</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="signerName">Nome</label_1.Label>
                      <input_1.Input id="signerName" value={newSigner.name} onChange={function (e) { return setNewSigner(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} placeholder="Nome do signatário"/>
                    </div>
                    
                    <div className="space-y-2">
                      <label_1.Label htmlFor="signerEmail">Email</label_1.Label>
                      <input_1.Input id="signerEmail" type="email" value={newSigner.email} onChange={function (e) { return setNewSigner(function (prev) { return (__assign(__assign({}, prev), { email: e.target.value })); }); }} placeholder="email@exemplo.com"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="signerRole">Função</label_1.Label>
                      <select_1.Select value={newSigner.role} onValueChange={function (value) { return setNewSigner(function (prev) { return (__assign(__assign({}, prev), { role: value })); }); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione a função"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {SIGNER_ROLES.map(function (role) { return (<select_1.SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center space-x-2">
                                {role.icon}
                                <span>{role.label}</span>
                              </div>
                            </select_1.SelectItem>); })}
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label_1.Label htmlFor="signerSignatureType">Tipo de Assinatura</label_1.Label>
                      <select_1.Select value={newSigner.signatureType} onValueChange={function (value) { return setNewSigner(function (prev) { return (__assign(__assign({}, prev), { signatureType: value })); }); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Tipo de assinatura"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {SIGNATURE_TYPES.filter(function (type) { return allowedSignatureTypes.includes(type.value); }).map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                {type.icon}
                                <span>{type.label}</span>
                              </div>
                            </select_1.SelectItem>); })}
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isRequired" checked={newSigner.isRequired} onChange={function (e) { return setNewSigner(function (prev) { return (__assign(__assign({}, prev), { isRequired: e.target.checked })); }); }} className="rounded"/>
                    <label_1.Label htmlFor="isRequired">Assinatura obrigatória</label_1.Label>
                  </div>

                  <button_1.Button type="button" onClick={addSigner} disabled={!newSigner.name || !newSigner.email || !newSigner.role || !newSigner.signatureType} className="w-full">
                    <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                    Adicionar Signatário
                  </button_1.Button>
                </div>

                {/* Signers List */}
                {newRequest.requiredSigners.length > 0 && (<div className="space-y-2">
                    <label_1.Label>Signatários Adicionados</label_1.Label>
                    <div className="space-y-2">
                      {newRequest.requiredSigners.map(function (signer) {
                var roleInfo = getSignerRoleInfo(signer.role);
                var typeInfo = getSignatureTypeInfo(signer.signatureType);
                return (<div key={signer.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{signer.name}</span>
                                <badge_1.Badge className={roleInfo.value === 'patient' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                  {roleInfo.label}
                                </badge_1.Badge>
                                <badge_1.Badge className={typeInfo.color} variant="outline">
                                  {typeInfo.label}
                                </badge_1.Badge>
                                {signer.isRequired && (<badge_1.Badge variant="outline" className="text-red-600">
                                    Obrigatório
                                  </badge_1.Badge>)}
                              </div>
                              <div className="text-sm text-gray-600">{signer.email}</div>
                            </div>
                            <button_1.Button variant="outline" size="sm" onClick={function () { return removeSigner(signer.id); }} className="text-red-600 hover:text-red-700">
                              <lucide_react_1.X className="w-4 h-4"/>
                            </button_1.Button>
                          </div>);
            })}
                    </div>
                  </div>)}

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button_1.Button type="button" variant="outline" onClick={function () { return setShowRequestDialog(false); }}>
                    Cancelar
                  </button_1.Button>
                  <button_1.Button onClick={sendSignatureRequest} disabled={newRequest.requiredSigners.length === 0}>
                    Enviar Solicitações
                  </button_1.Button>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
          
          <dialog_1.Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.PenTool className="w-4 h-4 mr-2"/>
                Assinar Documento
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Assinar Documento</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Assine digitalmente o documento: {documentName}
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <tabs_1.Tabs value={selectedSignatureType} onValueChange={setSelectedSignatureType}>
                <tabs_1.TabsList className="grid w-full grid-cols-3">
                  {SIGNATURE_TYPES.filter(function (type) { return allowedSignatureTypes.includes(type.value); }).slice(0, 3).map(function (type) { return (<tabs_1.TabsTrigger key={type.value} value={type.value}>
                      <div className="flex items-center space-x-1">
                        {type.icon}
                        <span className="hidden sm:inline">{type.label}</span>
                      </div>
                    </tabs_1.TabsTrigger>); })}
                </tabs_1.TabsList>
                
                {SIGNATURE_TYPES.filter(function (type) { return allowedSignatureTypes.includes(type.value); }).map(function (type) { return (<tabs_1.TabsContent key={type.value} value={type.value} className="space-y-4">
                    <alert_1.Alert>
                      <lucide_react_1.Info className="w-4 h-4"/>
                      <alert_1.AlertDescription>
                        {type.description}
                      </alert_1.AlertDescription>
                    </alert_1.Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label_1.Label htmlFor="signerName">Nome do Signatário *</label_1.Label>
                        <input_1.Input id="signerName" value={signatureData.signerName} onChange={function (e) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { signerName: e.target.value })); }); }} placeholder="Seu nome completo"/>
                      </div>
                      
                      <div className="space-y-2">
                        <label_1.Label htmlFor="signerRole">Função *</label_1.Label>
                        <select_1.Select value={signatureData.signerRole} onValueChange={function (value) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { signerRole: value })); }); }}>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Sua função"/>
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {SIGNER_ROLES.map(function (role) { return (<select_1.SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center space-x-2">
                                  {role.icon}
                                  <span>{role.label}</span>
                                </div>
                              </select_1.SelectItem>); })}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>
                    </div>

                    {type.value === 'digital_certificate' && (<div className="space-y-4">
                        <div className="space-y-2">
                          <label_1.Label htmlFor="certificate">Certificado Digital</label_1.Label>
                          <input_1.Input id="certificate" type="file" accept=".p12,.pfx" onChange={function (e) { return setSignatureData(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), { certificateFile: ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) || null }));
                }); }}/>
                        </div>
                        <div className="space-y-2">
                          <label_1.Label htmlFor="certPassword">Senha do Certificado</label_1.Label>
                          <input_1.Input id="certPassword" type="password" value={signatureData.password} onChange={function (e) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { password: e.target.value })); }); }} placeholder="Senha do certificado"/>
                        </div>
                      </div>)}

                    {type.value === 'electronic' && (<div className="space-y-4">
                        <div className="space-y-2">
                          <label_1.Label>Assinatura Manuscrita</label_1.Label>
                          <div className="border rounded-lg p-4">
                            <canvas ref={canvasRef} width={400} height={200} className="border border-gray-300 rounded cursor-crosshair w-full" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}/>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm text-gray-600">Desenhe sua assinatura acima</p>
                              <button_1.Button type="button" variant="outline" size="sm" onClick={clearCanvas}>
                                Limpar
                              </button_1.Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label_1.Label htmlFor="password">Senha de Confirmação</label_1.Label>
                          <input_1.Input id="password" type="password" value={signatureData.password} onChange={function (e) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { password: e.target.value })); }); }} placeholder="Sua senha de login"/>
                        </div>
                      </div>)}

                    {type.value === 'biometric' && (<div className="space-y-4">
                        <alert_1.Alert>
                          <lucide_react_1.Fingerprint className="w-4 h-4"/>
                          <alert_1.AlertDescription>
                            A captura biométrica será realizada através do dispositivo conectado.
                          </alert_1.AlertDescription>
                        </alert_1.Alert>
                        <button_1.Button type="button" className="w-full">
                          <lucide_react_1.Fingerprint className="w-4 h-4 mr-2"/>
                          Capturar Biometria
                        </button_1.Button>
                      </div>)}

                    {type.value === 'pin' && (<div className="space-y-4">
                        <div className="space-y-2">
                          <label_1.Label htmlFor="pinCode">Código PIN</label_1.Label>
                          <input_1.Input id="pinCode" type="password" value={signatureData.pinCode} onChange={function (e) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { pinCode: e.target.value })); }); }} placeholder="Seu código PIN" maxLength={6}/>
                        </div>
                      </div>)}

                    {type.value === 'sms' && (<div className="space-y-4">
                        <div className="space-y-2">
                          <label_1.Label htmlFor="phone">Número do Celular</label_1.Label>
                          <input_1.Input id="phone" type="tel" placeholder="(11) 99999-9999"/>
                        </div>
                        <button_1.Button type="button" variant="outline" className="w-full">
                          <lucide_react_1.Smartphone className="w-4 h-4 mr-2"/>
                          Enviar Código SMS
                        </button_1.Button>
                        <div className="space-y-2">
                          <label_1.Label htmlFor="otpCode">Código de Verificação</label_1.Label>
                          <input_1.Input id="otpCode" value={signatureData.otpCode} onChange={function (e) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { otpCode: e.target.value })); }); }} placeholder="Código recebido por SMS" maxLength={6}/>
                        </div>
                      </div>)}

                    <div className="space-y-2">
                      <label_1.Label htmlFor="reason">Motivo da Assinatura</label_1.Label>
                      <textarea_1.Textarea id="reason" value={signatureData.reason} onChange={function (e) { return setSignatureData(function (prev) { return (__assign(__assign({}, prev), { reason: e.target.value })); }); }} placeholder="Motivo ou contexto da assinatura" rows={2}/>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4">
                      <button_1.Button type="button" variant="outline" onClick={function () { return setShowSignDialog(false); }}>
                        Cancelar
                      </button_1.Button>
                      <button_1.Button onClick={handleSign} disabled={!signatureData.signerName || !signatureData.signerRole || isLoading}>
                        {isLoading ? (<lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin"/>) : (<lucide_react_1.PenTool className="w-4 h-4 mr-2"/>)}
                        Assinar Documento
                      </button_1.Button>
                    </div>
                  </tabs_1.TabsContent>); })}
              </tabs_1.Tabs>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Existing Signatures */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.CheckCircle className="w-5 h-5"/>
            <span>Assinaturas Existentes</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {signatures.length === 0 ? (<div className="text-center py-8">
              <lucide_react_1.PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Este documento ainda não foi assinado
              </p>
              <button_1.Button onClick={function () { return setShowSignDialog(true); }}>
                <lucide_react_1.PenTool className="w-4 h-4 mr-2"/>
                Primeira Assinatura
              </button_1.Button>
            </div>) : (<div className="space-y-4">
              {signatures.map(function (signature) {
                var typeInfo = getSignatureTypeInfo(signature.signatureType);
                var roleInfo = getSignerRoleInfo(signature.signerRole);
                return (<div key={signature.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {roleInfo.icon}
                            <span className="font-medium">{signature.signerName}</span>
                          </div>
                          <badge_1.Badge className={typeInfo.color}>
                            <div className="flex items-center space-x-1">
                              {typeInfo.icon}
                              <span>{typeInfo.label}</span>
                            </div>
                          </badge_1.Badge>
                          <badge_1.Badge className={signature.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {signature.isValid ? 'Válida' : 'Inválida'}
                          </badge_1.Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <lucide_react_1.Calendar className="w-4 h-4"/>
                            <span>{(0, date_fns_1.format)(signature.timestamp, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <lucide_react_1.Hash className="w-4 h-4"/>
                            <span>IP: {signature.ipAddress}</span>
                          </div>
                          {signature.certificateId && (<div className="flex items-center space-x-1">
                              <lucide_react_1.Shield className="w-4 h-4"/>
                              <span>Cert: {signature.certificateId.slice(0, 8)}...</span>
                            </div>)}
                        </div>
                        
                        {signature.metadata.reason && (<div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Motivo:</strong> {signature.metadata.reason}
                          </div>)}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="outline" size="sm" onClick={function () { return validateSignature(signature.id); }}>
                          <lucide_react_1.Shield className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Download className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </div>
                  </div>);
            })}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Signature Requests */}
      {signatureRequests.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Send className="w-5 h-5"/>
              <span>Solicitações de Assinatura</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {signatureRequests.map(function (request) { return (<div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{request.documentName}</h3>
                      <p className="text-sm text-gray-600">Por: {request.requesterName}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  {request.message && (<div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                      {request.message}
                    </div>)}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Signatários:</h4>
                    {request.requiredSigners.map(function (signer) {
                    var roleInfo = getSignerRoleInfo(signer.role);
                    var typeInfo = getSignatureTypeInfo(signer.signatureType);
                    return (<div key={signer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {roleInfo.icon}
                            <span className="text-sm">{signer.name}</span>
                            <badge_1.Badge className={typeInfo.color} variant="outline">
                              {typeInfo.label}
                            </badge_1.Badge>
                            {signer.isRequired && (<badge_1.Badge variant="outline" className="text-red-600">
                                Obrigatório
                              </badge_1.Badge>)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {signer.hasSignedAt ? (<span className="text-green-600">Assinado</span>) : (<span>Pendente</span>)}
                          </div>
                        </div>);
                })}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Criado em: {(0, date_fns_1.format)(request.createdAt, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</span>
                    {request.deadline && (<span>Prazo: {(0, date_fns_1.format)(request.deadline, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</span>)}
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Summary */}
      {(signatures.length > 0 || signatureRequests.length > 0) && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Shield className="w-5 h-5"/>
              <span>Resumo das Assinaturas</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {signatures.filter(function (s) { return s.isValid; }).length}
                </div>
                <div className="text-sm text-gray-600">Assinaturas Válidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {signatures.filter(function (s) { return s.signatureType === 'digital_certificate'; }).length}
                </div>
                <div className="text-sm text-gray-600">Certificado Digital</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {signatureRequests.filter(function (r) { return r.status === 'pending'; }).length}
                </div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {signatureRequests.reduce(function (acc, req) { return acc + req.requiredSigners.length; }, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Solicitações</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
