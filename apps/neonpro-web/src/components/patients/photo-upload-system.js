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
exports.PhotoUploadSystem = PhotoUploadSystem;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var badge_1 = require("@/components/ui/badge");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
var MAX_FILES = 10;
var TREATMENT_TYPES = [
    'Preenchimento',
    'Botox',
    'Laser',
    'Peeling',
    'Harmonização Facial',
    'Limpeza de Pele',
    'Microagulhamento',
    'Radiofrequência',
    'Criolipólise',
    'Outro'
];
var ANATOMICAL_AREAS = [
    'Face Completa',
    'Testa',
    'Área dos Olhos',
    'Nariz',
    'Bochechas',
    'Lábios',
    'Queixo',
    'Pescoço',
    'Corpo',
    'Abdômen',
    'Braços',
    'Pernas',
    'Outro'
];
function PhotoUploadSystem(_a) {
    var _this = this;
    var patientId = _a.patientId, onPhotosUploaded = _a.onPhotosUploaded, _b = _a.readonly, readonly = _b === void 0 ? false : _b, className = _a.className;
    var _c = (0, react_1.useState)([]), files = _c[0], setFiles = _c[1];
    var _d = (0, react_1.useState)(false), uploading = _d[0], setUploading = _d[1];
    var _e = (0, react_1.useState)(0), uploadProgress = _e[0], setUploadProgress = _e[1];
    var _f = (0, react_1.useState)([]), uploadedPhotos = _f[0], setUploadedPhotos = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var _h = (0, react_1.useState)(null), success = _h[0], setSuccess = _h[1];
    var _j = (0, react_1.useState)(false), dragActive = _j[0], setDragActive = _j[1];
    var _k = (0, react_1.useState)(false), lgpdConsent = _k[0], setLgpdConsent = _k[1];
    var _l = (0, react_1.useState)(null), selectedPhoto = _l[0], setSelectedPhoto = _l[1];
    var _m = (0, react_1.useState)({
        date: new Date(),
        treatmentType: '',
        category: 'before',
        notes: '',
        tags: [],
        anatomicalArea: ''
    }), photoMetadata = _m[0], setPhotoMetadata = _m[1];
    var fileInputRef = (0, react_1.useRef)(null);
    var dropRef = (0, react_1.useRef)(null);
    var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
    // Load existing photos
    (0, react_1.useEffect)(function () {
        loadExistingPhotos();
    }, [patientId]);
    // Verificar consentimento LGPD para fotos
    (0, react_1.useEffect)(function () {
        checkLGPDConsent();
    }, [patientId]);
    var checkLGPDConsent = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error_1, consents, photoConsent, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('lgpd_consents')
                            .eq('id', patientId)
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error_1 = _a.error;
                    if (error_1)
                        throw error_1;
                    consents = data === null || data === void 0 ? void 0 : data.lgpd_consents;
                    photoConsent = (consents === null || consents === void 0 ? void 0 : consents.photo_consent) || false;
                    setLgpdConsent(photoConsent);
                    if (!photoConsent) {
                        setError('Paciente não possui consentimento LGPD para armazenamento de fotos. Atualize o consentimento primeiro.');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _b.sent();
                    console.error('Erro ao verificar consentimento LGPD:', err_1);
                    setError('Erro ao verificar consentimento LGPD');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadExistingPhotos = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error_2, photosWithUrls, err_2;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase
                            .from('patient_photos')
                            .select('*')
                            .eq('patient_id', patientId)
                            .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error_2 = _a.error;
                    if (error_2)
                        throw error_2;
                    return [4 /*yield*/, Promise.all((data || []).map(function (photo) { return __awaiter(_this, void 0, void 0, function () {
                            var urlData;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, supabase.storage
                                            .from('patient-photos')
                                            .createSignedUrl(photo.file_path, 3600)]; // 1 hora
                                    case 1:
                                        urlData = (_a.sent()) // 1 hora
                                        .data;
                                        return [2 /*return*/, {
                                                id: photo.id,
                                                fileName: photo.file_name,
                                                filePath: photo.file_path,
                                                publicUrl: (urlData === null || urlData === void 0 ? void 0 : urlData.signedUrl) || '',
                                                metadata: photo.metadata,
                                                uploadDate: new Date(photo.created_at),
                                                fileSize: photo.file_size,
                                                mimeType: photo.mime_type,
                                                lgpdConsented: photo.lgpd_consented,
                                                patient_id: photo.patient_id
                                            }];
                                }
                            });
                        }); }))];
                case 2:
                    photosWithUrls = _b.sent();
                    setUploadedPhotos(photosWithUrls);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    console.error('Erro ao carregar fotos:', err_2);
                    setError('Erro ao carregar fotos existentes');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDrag = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);
    var handleDrop = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (readonly || !lgpdConsent)
            return;
        var droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, [readonly, lgpdConsent]);
    var handleFileSelect = (0, react_1.useCallback)(function (e) {
        if (readonly || !lgpdConsent)
            return;
        var selectedFiles = Array.from(e.target.files || []);
        handleFiles(selectedFiles);
    }, [readonly, lgpdConsent]);
    var handleFiles = function (newFiles) {
        var validFiles = newFiles.filter(function (file) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setError("Tipo de arquivo n\u00E3o permitido: ".concat(file.name, ". Use apenas JPG, PNG, HEIC ou WebP."));
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError("Arquivo muito grande: ".concat(file.name, ". M\u00E1ximo: 10MB."));
                return false;
            }
            return true;
        });
        if (files.length + validFiles.length > MAX_FILES) {
            setError("M\u00E1ximo ".concat(MAX_FILES, " arquivos permitidos"));
            return;
        }
        setFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), validFiles, true); });
        setError(null);
    };
    var removeFile = function (index) {
        setFiles(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    };
    var compressImage = function (file, quality) {
        if (quality === void 0) { quality = 0.7; }
        return new Promise(function (resolve) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.onload = function () {
                // Calcular dimensões mantendo proporção
                var maxWidth = 1920;
                var maxHeight = 1080;
                var width = img.width, height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    var ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                canvas.width = width;
                canvas.height = height;
                // Desenhar e comprimir
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, file.type, quality);
            };
            img.src = URL.createObjectURL(file);
        });
    };
    var uploadFiles = function () { return __awaiter(_this, void 0, void 0, function () {
        var uploadPromises, err_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!lgpdConsent) {
                        setError('Consentimento LGPD para fotos é obrigatório');
                        return [2 /*return*/];
                    }
                    if (files.length === 0) {
                        setError('Selecione pelo menos uma foto');
                        return [2 /*return*/];
                    }
                    if (!photoMetadata.treatmentType || !photoMetadata.anatomicalArea) {
                        setError('Preencha todos os campos obrigatórios (Tipo de Tratamento e Área Anatômica)');
                        return [2 /*return*/];
                    }
                    setUploading(true);
                    setError(null);
                    setSuccess(null);
                    setUploadProgress(0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    uploadPromises = files.map(function (file, index) { return __awaiter(_this, void 0, void 0, function () {
                        var compressedBlob, fileExt, fileName, _a, uploadData, uploadError, _b, photoData, dbError;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, compressImage(file)
                                    // Gerar nome único
                                ];
                                case 1:
                                    compressedBlob = _c.sent();
                                    fileExt = file.name.split('.').pop();
                                    fileName = "".concat(patientId, "/").concat(Date.now(), "-").concat(index, ".").concat(fileExt);
                                    return [4 /*yield*/, supabase.storage
                                            .from('patient-photos')
                                            .upload(fileName, compressedBlob, {
                                            contentType: file.type,
                                            cacheControl: '3600',
                                            upsert: false
                                        })];
                                case 2:
                                    _a = _c.sent(), uploadData = _a.data, uploadError = _a.error;
                                    if (uploadError)
                                        throw uploadError;
                                    return [4 /*yield*/, supabase
                                            .from('patient_photos')
                                            .insert({
                                            patient_id: patientId,
                                            file_name: file.name,
                                            file_path: uploadData.path,
                                            file_size: file.size,
                                            mime_type: file.type,
                                            metadata: photoMetadata,
                                            lgpd_consented: lgpdConsent
                                        })
                                            .select()
                                            .single()];
                                case 3:
                                    _b = _c.sent(), photoData = _b.data, dbError = _b.error;
                                    if (dbError)
                                        throw dbError;
                                    // Atualizar progresso
                                    setUploadProgress(function (prev) { return prev + (100 / files.length); });
                                    return [2 /*return*/, photoData];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(uploadPromises)];
                case 2:
                    _a.sent();
                    setSuccess("".concat(files.length, " foto(s) enviada(s) com sucesso!"));
                    setFiles([]);
                    setPhotoMetadata({
                        date: new Date(),
                        treatmentType: '',
                        category: 'before',
                        notes: '',
                        tags: [],
                        anatomicalArea: ''
                    });
                    // Recarregar fotos
                    return [4 /*yield*/, loadExistingPhotos()];
                case 3:
                    // Recarregar fotos
                    _a.sent();
                    if (onPhotosUploaded) {
                        onPhotosUploaded(uploadedPhotos);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_3 = _a.sent();
                    console.error('Erro no upload:', err_3);
                    setError('Erro ao enviar fotos. Tente novamente.');
                    return [3 /*break*/, 6];
                case 5:
                    setUploading(false);
                    setUploadProgress(0);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var deletePhoto = function (photoId, filePath) { return __awaiter(_this, void 0, void 0, function () {
        var storageError, dbError, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase.storage
                            .from('patient-photos')
                            .remove([filePath])];
                case 1:
                    storageError = (_a.sent()).error;
                    if (storageError)
                        throw storageError;
                    return [4 /*yield*/, supabase
                            .from('patient_photos')
                            .delete()
                            .eq('id', photoId)];
                case 2:
                    dbError = (_a.sent()).error;
                    if (dbError)
                        throw dbError;
                    // Atualizar lista local
                    setUploadedPhotos(function (prev) { return prev.filter(function (photo) { return photo.id !== photoId; }); });
                    setSuccess('Foto deletada com sucesso');
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    console.error('Erro ao deletar foto:', err_4);
                    setError('Erro ao deletar foto');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var downloadPhoto = function (photo) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error_3, url, a, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase.storage
                            .from('patient-photos')
                            .download(photo.filePath)];
                case 1:
                    _a = _b.sent(), data = _a.data, error_3 = _a.error;
                    if (error_3)
                        throw error_3;
                    url = URL.createObjectURL(data);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = photo.fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    return [3 /*break*/, 3];
                case 2:
                    err_5 = _b.sent();
                    console.error('Erro ao baixar foto:', err_5);
                    setError('Erro ao baixar foto');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (!lgpdConsent) {
        return (<card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Lock className="h-5 w-5 text-red-500"/>
            Sistema de Fotos Médicas
          </card_1.CardTitle>
          <card_1.CardDescription>
            Gerenciamento seguro de fotos com conformidade LGPD
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert>
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertTitle>Consentimento LGPD Necessário</alert_1.AlertTitle>
            <alert_1.AlertDescription>
              O paciente deve fornecer consentimento específico para armazenamento de fotos médicas antes de prosseguir. 
              Atualize o consentimento LGPD do paciente primeiro.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={(0, utils_1.cn)("w-full", className)}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Shield className="h-5 w-5 text-green-500"/>
          Sistema de Fotos Médicas
          <badge_1.Badge variant="outline" className="text-green-600">
            LGPD Conforme
          </badge_1.Badge>
        </card_1.CardTitle>
        <card_1.CardDescription>
          Upload seguro de fotos médicas com metadados completos
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Alertas */}
        {error && (<alert_1.Alert variant="destructive">
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertTitle>Erro</alert_1.AlertTitle>
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>)}

        {success && (<alert_1.Alert>
            <lucide_react_1.CheckCircle className="h-4 w-4"/>
            <alert_1.AlertTitle>Sucesso</alert_1.AlertTitle>
            <alert_1.AlertDescription>{success}</alert_1.AlertDescription>
          </alert_1.Alert>)}

        <tabs_1.Tabs defaultValue="upload" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="upload">Upload de Fotos</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="gallery">
              Galeria ({uploadedPhotos.length})
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="upload" className="space-y-6">
            {!readonly && (<>
                {/* Área de Upload */}
                <div ref={dropRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={(0, utils_1.cn)("border-2 border-dashed rounded-lg p-8 text-center transition-colors", dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50")}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-muted">
                      <lucide_react_1.Upload className="h-8 w-8 text-muted-foreground"/>
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        Arraste fotos aqui ou clique para selecionar
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        JPG, PNG, HEIC, WebP • Máximo 10MB por arquivo • Até {MAX_FILES} fotos
                      </p>
                    </div>
                    <button_1.Button type="button" variant="outline" onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} className="flex items-center gap-2">
                      <lucide_react_1.Camera className="h-4 w-4"/>
                      Selecionar Fotos
                    </button_1.Button>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept={ALLOWED_FILE_TYPES.join(',')} onChange={handleFileSelect} className="hidden"/>
                </div>

                {/* Arquivos Selecionados */}
                {files.length > 0 && (<div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      Arquivos Selecionados ({files.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {files.map(function (file, index) { return (<div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <lucide_react_1.FileImage className="h-4 w-4 text-muted-foreground"/>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button_1.Button type="button" variant="ghost" size="sm" onClick={function () { return removeFile(index); }}>
                            <lucide_react_1.X className="h-4 w-4"/>
                          </button_1.Button>
                        </div>); })}
                    </div>
                  </div>)}

                {/* Metadados da Foto */}
                {files.length > 0 && (<div className="space-y-4">
                    <separator_1.Separator />
                    <h3 className="text-sm font-medium">Informações das Fotos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Data */}
                      <div className="space-y-2">
                        <label_1.Label>Data da Foto</label_1.Label>
                        <popover_1.Popover>
                          <popover_1.PopoverTrigger asChild>
                            <button_1.Button variant="outline" className={(0, utils_1.cn)("justify-start text-left font-normal", !photoMetadata.date && "text-muted-foreground")}>
                              <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
                              {photoMetadata.date ? ((0, date_fns_1.format)(photoMetadata.date, "PPP", { locale: locale_1.ptBR })) : ("Selecione uma data")}
                            </button_1.Button>
                          </popover_1.PopoverTrigger>
                          <popover_1.PopoverContent className="w-auto p-0">
                            <calendar_1.Calendar mode="single" selected={photoMetadata.date} onSelect={function (date) {
                    return setPhotoMetadata(function (prev) { return (__assign(__assign({}, prev), { date: date || new Date() })); });
                }} initialFocus/>
                          </popover_1.PopoverContent>
                        </popover_1.Popover>
                      </div>

                      {/* Tipo de Tratamento */}
                      <div className="space-y-2">
                        <label_1.Label>Tipo de Tratamento *</label_1.Label>
                        <select_1.Select value={photoMetadata.treatmentType} onValueChange={function (value) {
                    return setPhotoMetadata(function (prev) { return (__assign(__assign({}, prev), { treatmentType: value })); });
                }}>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o tratamento"/>
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {TREATMENT_TYPES.map(function (type) { return (<select_1.SelectItem key={type} value={type}>
                                {type}
                              </select_1.SelectItem>); })}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>

                      {/* Categoria */}
                      <div className="space-y-2">
                        <label_1.Label>Categoria</label_1.Label>
                        <select_1.Select value={photoMetadata.category} onValueChange={function (value) {
                    return setPhotoMetadata(function (prev) { return (__assign(__assign({}, prev), { category: value })); });
                }}>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue />
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="before">Antes</select_1.SelectItem>
                            <select_1.SelectItem value="during">Durante</select_1.SelectItem>
                            <select_1.SelectItem value="after">Depois</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>

                      {/* Área Anatômica */}
                      <div className="space-y-2">
                        <label_1.Label>Área Anatômica *</label_1.Label>
                        <select_1.Select value={photoMetadata.anatomicalArea} onValueChange={function (value) {
                    return setPhotoMetadata(function (prev) { return (__assign(__assign({}, prev), { anatomicalArea: value })); });
                }}>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione a área"/>
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {ANATOMICAL_AREAS.map(function (area) { return (<select_1.SelectItem key={area} value={area}>
                                {area}
                              </select_1.SelectItem>); })}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                      <label_1.Label>Observações</label_1.Label>
                      <textarea_1.Textarea placeholder="Observações sobre as fotos (opcional)" value={photoMetadata.notes} onChange={function (e) {
                    return setPhotoMetadata(function (prev) { return (__assign(__assign({}, prev), { notes: e.target.value })); });
                }} rows={3}/>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (<div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label_1.Label>Enviando fotos...</label_1.Label>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(uploadProgress)}%
                          </span>
                        </div>
                        <progress_1.Progress value={uploadProgress}/>
                      </div>)}

                    {/* Botão de Upload */}
                    <button_1.Button onClick={uploadFiles} disabled={uploading} className="w-full">
                      {uploading ? (<>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"/>
                          Enviando...
                        </>) : (<>
                          <lucide_react_1.Upload className="h-4 w-4 mr-2"/>
                          Enviar {files.length} Foto(s)
                        </>)}
                    </button_1.Button>
                  </div>)}
              </>)}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="gallery" className="space-y-6">
            {/* Galeria de Fotos */}
            {uploadedPhotos.length === 0 ? (<div className="text-center py-8">
                <lucide_react_1.FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <p className="text-lg font-medium">Nenhuma foto encontrada</p>
                <p className="text-sm text-muted-foreground">
                  As fotos enviadas aparecerão aqui
                </p>
              </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedPhotos.map(function (photo) { return (<card_1.Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square relative group">
                      {photo.publicUrl && (<img src={photo.publicUrl} alt={photo.fileName} className="w-full h-full object-cover"/>)}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button_1.Button size="sm" variant="secondary" onClick={function () { return setSelectedPhoto(photo); }}>
                          <lucide_react_1.ZoomIn className="h-4 w-4"/>
                        </button_1.Button>
                        <button_1.Button size="sm" variant="secondary" onClick={function () { return downloadPhoto(photo); }}>
                          <lucide_react_1.Download className="h-4 w-4"/>
                        </button_1.Button>
                        {!readonly && (<button_1.Button size="sm" variant="destructive" onClick={function () { return deletePhoto(photo.id, photo.filePath); }}>
                            <lucide_react_1.Trash2 className="h-4 w-4"/>
                          </button_1.Button>)}
                      </div>
                    </div>
                    <card_1.CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <badge_1.Badge variant="outline">
                            {photo.metadata.category === 'before' ? 'Antes' :
                    photo.metadata.category === 'after' ? 'Depois' : 'Durante'}
                          </badge_1.Badge>
                          <span className="text-xs text-muted-foreground">
                            {(0, date_fns_1.format)(photo.uploadDate, "dd/MM/yyyy", { locale: locale_1.ptBR })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{photo.metadata.treatmentType}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.metadata.anatomicalArea}
                        </p>
                        {photo.metadata.notes && (<p className="text-xs text-muted-foreground line-clamp-2">
                            {photo.metadata.notes}
                          </p>)}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>); })}
              </div>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        {/* Modal de Visualização */}
        {selectedPhoto && (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedPhoto.fileName}</h3>
                <button_1.Button variant="ghost" size="sm" onClick={function () { return setSelectedPhoto(null); }}>
                  <lucide_react_1.X className="h-4 w-4"/>
                </button_1.Button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="max-h-96 flex items-center justify-center">
                    <img src={selectedPhoto.publicUrl} alt={selectedPhoto.fileName} className="max-w-full max-h-96 object-contain rounded-lg"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Tratamento:</p>
                      <p className="text-muted-foreground">{selectedPhoto.metadata.treatmentType}</p>
                    </div>
                    <div>
                      <p className="font-medium">Categoria:</p>
                      <p className="text-muted-foreground">
                        {selectedPhoto.metadata.category === 'before' ? 'Antes' :
                selectedPhoto.metadata.category === 'after' ? 'Depois' : 'Durante'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Área:</p>
                      <p className="text-muted-foreground">{selectedPhoto.metadata.anatomicalArea}</p>
                    </div>
                    <div>
                      <p className="font-medium">Data:</p>
                      <p className="text-muted-foreground">
                        {(0, date_fns_1.format)(selectedPhoto.metadata.date, "dd/MM/yyyy", { locale: locale_1.ptBR })}
                      </p>
                    </div>
                    {selectedPhoto.metadata.notes && (<div className="col-span-2">
                        <p className="font-medium">Observações:</p>
                        <p className="text-muted-foreground">{selectedPhoto.metadata.notes}</p>
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
