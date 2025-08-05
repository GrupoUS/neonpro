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
exports.DocumentUpload = DocumentUpload;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var DOCUMENT_CATEGORIES = [
    { value: 'exam_results', label: 'Resultados de Exames', icon: <lucide_react_1.FileText className="w-4 h-4"/>, color: 'bg-blue-100 text-blue-800' },
    { value: 'prescriptions', label: 'Receitas Médicas', icon: <lucide_react_1.FileText className="w-4 h-4"/>, color: 'bg-green-100 text-green-800' },
    { value: 'reports', label: 'Relatórios Médicos', icon: <lucide_react_1.FileText className="w-4 h-4"/>, color: 'bg-purple-100 text-purple-800' },
    { value: 'images', label: 'Imagens Médicas', icon: <lucide_react_1.FileImage className="w-4 h-4"/>, color: 'bg-orange-100 text-orange-800' },
    { value: 'before_after', label: 'Antes e Depois', icon: <lucide_react_1.Camera className="w-4 h-4"/>, color: 'bg-pink-100 text-pink-800' },
    { value: 'consent_forms', label: 'Termos de Consentimento', icon: <lucide_react_1.Shield className="w-4 h-4"/>, color: 'bg-gray-100 text-gray-800' },
    { value: 'insurance', label: 'Documentos do Convênio', icon: <lucide_react_1.FileText className="w-4 h-4"/>, color: 'bg-indigo-100 text-indigo-800' },
    { value: 'identification', label: 'Documentos de Identificação', icon: <lucide_react_1.User className="w-4 h-4"/>, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Outros', icon: <lucide_react_1.File className="w-4 h-4"/>, color: 'bg-gray-100 text-gray-800' }
];
var ACCESS_LEVELS = [
    { value: 'public', label: 'Público', description: 'Visível para toda a equipe' },
    { value: 'restricted', label: 'Restrito', description: 'Apenas médicos responsáveis' },
    { value: 'private', label: 'Privado', description: 'Apenas o médico que enviou' },
    { value: 'patient', label: 'Paciente', description: 'Visível para o paciente' }
];
var FILE_TYPES = {
    'image/jpeg': { icon: <lucide_react_1.FileImage className="w-4 h-4"/>, color: 'text-green-600' },
    'image/png': { icon: <lucide_react_1.FileImage className="w-4 h-4"/>, color: 'text-green-600' },
    'image/gif': { icon: <lucide_react_1.FileImage className="w-4 h-4"/>, color: 'text-green-600' },
    'image/webp': { icon: <lucide_react_1.FileImage className="w-4 h-4"/>, color: 'text-green-600' },
    'application/pdf': { icon: <lucide_react_1.FilePdf className="w-4 h-4"/>, color: 'text-red-600' },
    'application/msword': { icon: <lucide_react_1.FileText className="w-4 h-4"/>, color: 'text-blue-600' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: <lucide_react_1.FileText className="w-4 h-4"/>, color: 'text-blue-600' },
    'application/vnd.ms-excel': { icon: <lucide_react_1.FileSpreadsheet className="w-4 h-4"/>, color: 'text-green-600' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: <lucide_react_1.FileSpreadsheet className="w-4 h-4"/>, color: 'text-green-600' },
    'video/mp4': { icon: <lucide_react_1.FileVideo className="w-4 h-4"/>, color: 'text-purple-600' },
    'video/avi': { icon: <lucide_react_1.FileVideo className="w-4 h-4"/>, color: 'text-purple-600' },
    'audio/mp3': { icon: <lucide_react_1.FileAudio className="w-4 h-4"/>, color: 'text-orange-600' },
    'audio/wav': { icon: <lucide_react_1.FileAudio className="w-4 h-4"/>, color: 'text-orange-600' },
    'application/zip': { icon: <lucide_react_1.Archive className="w-4 h-4"/>, color: 'text-gray-600' },
    'application/rar': { icon: <lucide_react_1.Archive className="w-4 h-4"/>, color: 'text-gray-600' }
};
var DEFAULT_ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4', 'video/avi',
    'audio/mp3', 'audio/wav'
];
var MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
function DocumentUpload(_a) {
    var _this = this;
    var patientId = _a.patientId, clinicId = _a.clinicId, onDocumentUploaded = _a.onDocumentUploaded, _b = _a.allowedTypes, allowedTypes = _b === void 0 ? DEFAULT_ALLOWED_TYPES : _b, _c = _a.maxFileSize, maxFileSize = _c === void 0 ? MAX_FILE_SIZE : _c, category = _a.category, _d = _a.isBeforeAfter, isBeforeAfter = _d === void 0 ? false : _d;
    var _e = (0, react_1.useState)([]), documents = _e[0], setDocuments = _e[1];
    var _f = (0, react_1.useState)([]), uploadingFiles = _f[0], setUploadingFiles = _f[1];
    var _g = (0, react_1.useState)({}), uploadProgress = _g[0], setUploadProgress = _g[1];
    var _h = (0, react_1.useState)(false), dragActive = _h[0], setDragActive = _h[1];
    var _j = (0, react_1.useState)(false), showUploadDialog = _j[0], setShowUploadDialog = _j[1];
    var _k = (0, react_1.useState)('grid'), viewMode = _k[0], setViewMode = _k[1];
    var _l = (0, react_1.useState)(''), searchTerm = _l[0], setSearchTerm = _l[1];
    var _m = (0, react_1.useState)('all'), selectedCategory = _m[0], setSelectedCategory = _m[1];
    var _o = (0, react_1.useState)(null), selectedDocument = _o[0], setSelectedDocument = _o[1];
    var _p = (0, react_1.useState)({
        category: category || '',
        subcategory: '',
        description: '',
        tags: [],
        accessLevel: 'restricted',
        captureDate: new Date(),
        isEncrypted: false
    }), newDocumentData = _p[0], setNewDocumentData = _p[1];
    var _q = (0, react_1.useState)(''), tagInput = _q[0], setTagInput = _q[1];
    var fileInputRef = (0, react_1.useRef)(null);
    var cameraInputRef = (0, react_1.useRef)(null);
    // Load documents
    react_1.default.useEffect(function () {
        loadDocuments();
    }, [patientId]);
    var loadDocuments = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockDocuments;
        return __generator(this, function (_a) {
            try {
                mockDocuments = [
                    {
                        id: '1',
                        patientId: patientId,
                        clinicId: clinicId,
                        fileName: 'exame_sangue_2024.pdf',
                        originalName: 'Exame de Sangue - Janeiro 2024.pdf',
                        fileType: 'application/pdf',
                        fileSize: 2048576,
                        category: 'exam_results',
                        description: 'Exame de sangue completo - hemograma',
                        tags: ['hemograma', 'sangue', 'rotina'],
                        isBeforeAfter: false,
                        uploadDate: new Date('2024-01-15'),
                        uploadedBy: 'dr-silva',
                        accessLevel: 'restricted',
                        isEncrypted: true,
                        downloadUrl: '/api/documents/1/download',
                        metadata: { laboratory: 'Lab Central' },
                        version: 1,
                        status: 'active'
                    },
                    {
                        id: '2',
                        patientId: patientId,
                        clinicId: clinicId,
                        fileName: 'antes_tratamento.jpg',
                        originalName: 'Foto Antes do Tratamento.jpg',
                        fileType: 'image/jpeg',
                        fileSize: 1024000,
                        category: 'before_after',
                        description: 'Foto antes do início do tratamento',
                        tags: ['antes', 'tratamento', 'facial'],
                        isBeforeAfter: true,
                        beforeAfterPairId: 'pair-1',
                        position: 'before',
                        captureDate: new Date('2024-01-10'),
                        uploadDate: new Date('2024-01-10'),
                        uploadedBy: 'dr-silva',
                        accessLevel: 'patient',
                        isEncrypted: false,
                        thumbnailUrl: '/api/documents/2/thumbnail',
                        downloadUrl: '/api/documents/2/download',
                        metadata: { camera: 'Canon EOS', resolution: '4000x3000' },
                        version: 1,
                        status: 'active'
                    }
                ];
                setDocuments(mockDocuments);
            }
            catch (error) {
                console.error('Erro ao carregar documentos:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleDrag = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);
    var handleDrop = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }, []);
    var handleFileInput = function (e) {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };
    var handleFiles = function (files) {
        var validFiles = files.filter(function (file) {
            if (!allowedTypes.includes(file.type)) {
                alert("Tipo de arquivo n\u00E3o permitido: ".concat(file.type));
                return false;
            }
            if (file.size > maxFileSize) {
                alert("Arquivo muito grande: ".concat(file.name, ". M\u00E1ximo permitido: ").concat(formatFileSize(maxFileSize)));
                return false;
            }
            return true;
        });
        if (validFiles.length > 0) {
            setUploadingFiles(validFiles);
            setShowUploadDialog(true);
        }
    };
    var uploadFiles = function () { return __awaiter(_this, void 0, void 0, function () {
        var _loop_1, _i, uploadingFiles_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (file) {
                        var uploadInterval_1, newDocument_1, error_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    setUploadProgress(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = 0, _a)));
                                    });
                                    uploadInterval_1 = setInterval(function () {
                                        setUploadProgress(function (prev) {
                                            var _a;
                                            var currentProgress = prev[file.name] || 0;
                                            if (currentProgress >= 100) {
                                                clearInterval(uploadInterval_1);
                                                return prev;
                                            }
                                            return __assign(__assign({}, prev), (_a = {}, _a[file.name] = currentProgress + 10, _a));
                                        });
                                    }, 200);
                                    // Simulate API call
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                                case 1:
                                    // Simulate API call
                                    _b.sent();
                                    newDocument_1 = {
                                        id: crypto.randomUUID(),
                                        patientId: patientId,
                                        clinicId: clinicId,
                                        fileName: "".concat(Date.now(), "_").concat(file.name),
                                        originalName: file.name,
                                        fileType: file.type,
                                        fileSize: file.size,
                                        category: newDocumentData.category,
                                        subcategory: newDocumentData.subcategory,
                                        description: newDocumentData.description,
                                        tags: newDocumentData.tags,
                                        isBeforeAfter: isBeforeAfter,
                                        captureDate: newDocumentData.captureDate,
                                        uploadDate: new Date(),
                                        uploadedBy: 'current-user',
                                        accessLevel: newDocumentData.accessLevel,
                                        isEncrypted: newDocumentData.isEncrypted,
                                        downloadUrl: "/api/documents/".concat(crypto.randomUUID(), "/download"),
                                        metadata: {
                                            originalSize: file.size,
                                            uploadedAt: new Date().toISOString()
                                        },
                                        version: 1,
                                        status: 'active'
                                    };
                                    setDocuments(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newDocument_1], false); });
                                    onDocumentUploaded === null || onDocumentUploaded === void 0 ? void 0 : onDocumentUploaded(newDocument_1);
                                    setUploadProgress(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = 100, _a)));
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _b.sent();
                                    console.error('Erro ao fazer upload:', error_1);
                                    setUploadProgress(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = -1, _a)));
                                    });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, uploadingFiles_1 = uploadingFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < uploadingFiles_1.length)) return [3 /*break*/, 4];
                    file = uploadingFiles_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Reset after upload
                    setTimeout(function () {
                        setUploadingFiles([]);
                        setUploadProgress({});
                        setShowUploadDialog(false);
                        setNewDocumentData({
                            category: category || '',
                            subcategory: '',
                            description: '',
                            tags: [],
                            accessLevel: 'restricted',
                            captureDate: new Date(),
                            isEncrypted: false
                        });
                    }, 1000);
                    return [2 /*return*/];
            }
        });
    }); };
    var addTag = function () {
        if (tagInput.trim() && !newDocumentData.tags.includes(tagInput.trim())) {
            setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { tags: __spreadArray(__spreadArray([], prev.tags, true), [tagInput.trim()], false) })); });
            setTagInput('');
        }
    };
    var removeTag = function (tagToRemove) {
        setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { tags: prev.tags.filter(function (tag) { return tag !== tagToRemove; }) })); });
    };
    var formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    var getFileIcon = function (fileType) {
        return FILE_TYPES[fileType] || { icon: <lucide_react_1.File className="w-4 h-4"/>, color: 'text-gray-600' };
    };
    var getCategoryInfo = function (categoryValue) {
        return DOCUMENT_CATEGORIES.find(function (cat) { return cat.value === categoryValue; }) || DOCUMENT_CATEGORIES[DOCUMENT_CATEGORIES.length - 1];
    };
    var filteredDocuments = documents.filter(function (doc) {
        var _a;
        var matchesSearch = searchTerm === '' ||
            doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_a = doc.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            doc.tags.some(function (tag) { return tag.toLowerCase().includes(searchTerm.toLowerCase()); });
        var matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos Médicos</h2>
          <p className="text-gray-600">Gerencie exames, receitas e outros documentos do paciente</p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" onClick={function () { var _a; return (_a = cameraInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
            <lucide_react_1.Camera className="w-4 h-4 mr-2"/>
            Câmera
          </button_1.Button>
          <button_1.Button onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
            <lucide_react_1.Upload className="w-4 h-4 mr-2"/>
            Upload
          </button_1.Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" multiple accept={allowedTypes.join(',')} onChange={handleFileInput} className="hidden"/>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileInput} className="hidden"/>

      {/* Upload Dialog */}
      <dialog_1.Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Upload de Documentos</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Configure as informações dos documentos antes do upload
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          
          <div className="space-y-4">
            {/* Files to upload */}
            <div className="space-y-2">
              <label_1.Label>Arquivos Selecionados</label_1.Label>
              <div className="space-y-2">
                {uploadingFiles.map(function (file, index) {
            var fileIcon = getFileIcon(file.type);
            var progress = uploadProgress[file.name] || 0;
            return (<div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={fileIcon.color}>
                        {fileIcon.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                        {progress > 0 && (<progress_1.Progress value={progress} className="mt-1"/>)}
                      </div>
                      {progress === -1 && (<lucide_react_1.AlertTriangle className="w-5 h-5 text-red-500"/>)}
                      {progress === 100 && (<lucide_react_1.CheckCircle className="w-5 h-5 text-green-500"/>)}
                    </div>);
        })}
              </div>
            </div>

            {/* Document metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="category">Categoria *</label_1.Label>
                <select_1.Select value={newDocumentData.category} onValueChange={function (value) { return setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { category: value })); }); }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione a categoria"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {DOCUMENT_CATEGORIES.map(function (category) { return (<select_1.SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          {category.icon}
                          <span>{category.label}</span>
                        </div>
                      </select_1.SelectItem>); })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="accessLevel">Nível de Acesso</label_1.Label>
                <select_1.Select value={newDocumentData.accessLevel} onValueChange={function (value) { return setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { accessLevel: value })); }); }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {ACCESS_LEVELS.map(function (level) { return (<select_1.SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </select_1.SelectItem>); })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="subcategory">Subcategoria</label_1.Label>
              <input_1.Input id="subcategory" value={newDocumentData.subcategory} onChange={function (e) { return setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { subcategory: e.target.value })); }); }} placeholder="Subcategoria específica"/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="description">Descrição</label_1.Label>
              <textarea_1.Textarea id="description" value={newDocumentData.description} onChange={function (e) { return setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }} placeholder="Descrição do documento" rows={3}/>
            </div>

            <div className="space-y-2">
              <label_1.Label>Tags</label_1.Label>
              <div className="flex items-center space-x-2">
                <input_1.Input value={tagInput} onChange={function (e) { return setTagInput(e.target.value); }} placeholder="Adicionar tag" onKeyPress={function (e) { return e.key === 'Enter' && addTag(); }}/>
                <button_1.Button type="button" onClick={addTag} size="sm">
                  <lucide_react_1.Plus className="w-4 h-4"/>
                </button_1.Button>
              </div>
              {newDocumentData.tags.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">
                  {newDocumentData.tags.map(function (tag, index) { return (<badge_1.Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button type="button" onClick={function () { return removeTag(tag); }} className="ml-1 hover:text-red-500">
                        <lucide_react_1.X className="w-3 h-3"/>
                      </button>
                    </badge_1.Badge>); })}
                </div>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="captureDate">Data de Captura</label_1.Label>
                <input_1.Input id="captureDate" type="date" value={(0, date_fns_1.format)(newDocumentData.captureDate, 'yyyy-MM-dd')} onChange={function (e) { return setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { captureDate: new Date(e.target.value) })); }); }}/>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input type="checkbox" id="isEncrypted" checked={newDocumentData.isEncrypted} onChange={function (e) { return setNewDocumentData(function (prev) { return (__assign(__assign({}, prev), { isEncrypted: e.target.checked })); }); }} className="rounded"/>
                <label_1.Label htmlFor="isEncrypted" className="flex items-center space-x-1">
                  <lucide_react_1.Lock className="w-4 h-4"/>
                  <span>Criptografar arquivo</span>
                </label_1.Label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button_1.Button type="button" variant="outline" onClick={function () {
            setShowUploadDialog(false);
            setUploadingFiles([]);
            setUploadProgress({});
        }}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={uploadFiles} disabled={!newDocumentData.category || uploadingFiles.length === 0}>
                Fazer Upload
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Drag and Drop Area */}
      <card_1.Card className={"border-2 border-dashed transition-colors ".concat(dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300')} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        <card_1.CardContent className="pt-6">
          <div className="text-center py-8">
            <lucide_react_1.Upload className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-gray-600 mb-4">
              Suporte para imagens, PDFs, documentos do Office e mais
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button_1.Button variant="outline" onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                <lucide_react_1.File className="w-4 h-4 mr-2"/>
                Selecionar Arquivos
              </button_1.Button>
              <button_1.Button variant="outline" onClick={function () { var _a; return (_a = cameraInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                <lucide_react_1.Camera className="w-4 h-4 mr-2"/>
                Usar Câmera
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Filters and Search */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                <input_1.Input placeholder="Buscar documentos..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
              </div>
            </div>
            <div className="flex gap-2">
              <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <select_1.SelectTrigger className="w-48">
                  <select_1.SelectValue placeholder="Categoria"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                  {DOCUMENT_CATEGORIES.map(function (category) { return (<select_1.SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
              
              <div className="flex items-center border rounded-lg">
                <button_1.Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={function () { return setViewMode('grid'); }} className="rounded-r-none">
                  <lucide_react_1.Grid className="w-4 h-4"/>
                </button_1.Button>
                <button_1.Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={function () { return setViewMode('list'); }} className="rounded-l-none">
                  <lucide_react_1.List className="w-4 h-4"/>
                </button_1.Button>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Documents List/Grid */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (<card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="text-center py-8">
                <lucide_react_1.FileText className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== 'all'
                ? 'Nenhum documento encontrado'
                : 'Nenhum documento enviado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Faça upload de exames, receitas e outros documentos médicos'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (<button_1.Button onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                    <lucide_react_1.Upload className="w-4 h-4 mr-2"/>
                    Fazer Primeiro Upload
                  </button_1.Button>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>) : viewMode === 'grid' ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(function (document) {
                var categoryInfo = getCategoryInfo(document.category);
                var fileIcon = getFileIcon(document.fileType);
                return (<card_1.Card key={document.id} className="hover:shadow-md transition-shadow">
                  <card_1.CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className={fileIcon.color}>
                          {fileIcon.icon}
                        </div>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.MoreVertical className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {document.originalName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatFileSize(document.fileSize)}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        <badge_1.Badge className={categoryInfo.color} variant="secondary">
                          {categoryInfo.label}
                        </badge_1.Badge>
                        {document.isEncrypted && (<badge_1.Badge variant="outline">
                            <lucide_react_1.Lock className="w-3 h-3 mr-1"/>
                            Criptografado
                          </badge_1.Badge>)}
                      </div>
                      
                      {document.tags.length > 0 && (<div className="flex flex-wrap gap-1">
                          {document.tags.slice(0, 3).map(function (tag, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </badge_1.Badge>); })}
                          {document.tags.length > 3 && (<badge_1.Badge variant="outline" className="text-xs">
                              +{document.tags.length - 3}
                            </badge_1.Badge>)}
                        </div>)}
                      
                      <div className="text-xs text-gray-500">
                        {(0, date_fns_1.format)(document.uploadDate, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="outline" size="sm" className="flex-1">
                          <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                          Ver
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Download className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
            })}
          </div>) : (<card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="space-y-4">
                {filteredDocuments.map(function (document) {
                var categoryInfo = getCategoryInfo(document.category);
                var fileIcon = getFileIcon(document.fileType);
                return (<div key={document.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className={fileIcon.color}>
                        {fileIcon.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {document.originalName}
                          </h3>
                          <badge_1.Badge className={categoryInfo.color} variant="secondary">
                            {categoryInfo.label}
                          </badge_1.Badge>
                          {document.isEncrypted && (<badge_1.Badge variant="outline">
                              <lucide_react_1.Lock className="w-3 h-3 mr-1"/>
                              Criptografado
                            </badge_1.Badge>)}
                        </div>
                        
                        {document.description && (<p className="text-sm text-gray-600 mt-1">
                            {document.description}
                          </p>)}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>{(0, date_fns_1.format)(document.uploadDate, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</span>
                          {document.tags.length > 0 && (<div className="flex items-center space-x-1">
                              <lucide_react_1.Tag className="w-3 h-3"/>
                              <span>{document.tags.join(', ')}</span>
                            </div>)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Eye className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Download className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.MoreVertical className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </div>);
            })}
              </div>
            </card_1.CardContent>
          </card_1.Card>)}
      </div>

      {/* Summary */}
      {filteredDocuments.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.FileText className="w-5 h-5"/>
              <span>Resumo dos Documentos</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredDocuments.length}
                </div>
                <div className="text-sm text-gray-600">Total de Documentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredDocuments.filter(function (d) { return d.fileType.startsWith('image/'); }).length}
                </div>
                <div className="text-sm text-gray-600">Imagens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredDocuments.filter(function (d) { return d.fileType === 'application/pdf'; }).length}
                </div>
                <div className="text-sm text-gray-600">PDFs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredDocuments.filter(function (d) { return d.isEncrypted; }).length}
                </div>
                <div className="text-sm text-gray-600">Criptografados</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
