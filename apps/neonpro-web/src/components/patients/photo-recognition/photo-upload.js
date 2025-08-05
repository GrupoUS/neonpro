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
exports.PhotoUpload = PhotoUpload;
/**
 * Photo Upload Component with Facial Recognition
 * Handles patient photo upload with real-time recognition feedback
 *
 * @author APEX Master Developer
 */
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var use_toast_1 = require("@/components/ui/use-toast");
var PHOTO_TYPES = [
    { value: 'profile', label: 'Foto de Perfil' },
    { value: 'before', label: 'Antes do Tratamento' },
    { value: 'after', label: 'Depois do Tratamento' },
    { value: 'progress', label: 'Progresso' },
    { value: 'document', label: 'Documento' },
    { value: 'other', label: 'Outro' }
];
function PhotoUpload(_a) {
    var _this = this;
    var patientId = _a.patientId, onUploadSuccess = _a.onUploadSuccess, onUploadError = _a.onUploadError, _b = _a.allowedTypes, allowedTypes = _b === void 0 ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] : _b, _c = _a.maxFileSize, maxFileSize = _c === void 0 ? 10 * 1024 * 1024 : _c, // 10MB
    _d = _a.enableRecognition, // 10MB
    enableRecognition = _d === void 0 ? true : _d;
    var _e = (0, react_1.useState)(null), selectedFile = _e[0], setSelectedFile = _e[1];
    var _f = (0, react_1.useState)('profile'), photoType = _f[0], setPhotoType = _f[1];
    var _g = (0, react_1.useState)(false), isUploading = _g[0], setIsUploading = _g[1];
    var _h = (0, react_1.useState)(0), uploadProgress = _h[0], setUploadProgress = _h[1];
    var _j = (0, react_1.useState)(null), previewUrl = _j[0], setPreviewUrl = _j[1];
    var _k = (0, react_1.useState)(null), uploadResult = _k[0], setUploadResult = _k[1];
    var _l = (0, react_1.useState)(enableRecognition), enableFacialRecognition = _l[0], setEnableFacialRecognition = _l[1];
    var _m = (0, react_1.useState)(true), showPreview = _m[0], setShowPreview = _m[1];
    var fileInputRef = (0, react_1.useRef)(null);
    var toast = (0, use_toast_1.useToast)().toast;
    var handleFileSelect = (0, react_1.useCallback)(function (file) {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Tipo de arquivo inválido',
                description: 'Apenas arquivos JPEG, PNG e WebP são permitidos.',
                variant: 'destructive'
            });
            return;
        }
        // Validate file size
        if (file.size > maxFileSize) {
            toast({
                title: 'Arquivo muito grande',
                description: "O arquivo deve ter no m\u00E1ximo ".concat(Math.round(maxFileSize / 1024 / 1024), "MB."),
                variant: 'destructive'
            });
            return;
        }
        setSelectedFile(file);
        setUploadResult(null);
        // Create preview
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            setPreviewUrl((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
        };
        reader.readAsDataURL(file);
    }, [allowedTypes, maxFileSize, toast]);
    var handleFileInputChange = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    var handleDrop = function (event) {
        event.preventDefault();
        var file = event.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    var handleDragOver = function (event) {
        event.preventDefault();
    };
    var uploadPhoto = function () { return __awaiter(_this, void 0, void 0, function () {
        var formData, progressInterval, response, error, result, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedFile)
                        return [2 /*return*/];
                    setIsUploading(true);
                    setUploadProgress(0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    formData = new FormData();
                    formData.append('photo', selectedFile);
                    formData.append('patientId', patientId);
                    formData.append('photoType', photoType);
                    progressInterval = setInterval(function () {
                        setUploadProgress(function (prev) { return Math.min(prev + 10, 90); });
                    }, 200);
                    return [4 /*yield*/, fetch('/api/patients/photos/upload', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(localStorage.getItem('supabase_token'))
                            },
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    error = _a.sent();
                    throw new Error(error.error || 'Upload failed');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    setUploadResult(result.data);
                    toast({
                        title: 'Upload realizado com sucesso!',
                        description: enableFacialRecognition && result.data.recognition
                            ? "Reconhecimento facial: ".concat(result.data.recognition.confidence, "% de confian\u00E7a")
                            : 'Foto enviada com sucesso.'
                    });
                    onUploadSuccess === null || onUploadSuccess === void 0 ? void 0 : onUploadSuccess(result.data);
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Erro desconhecido';
                    toast({
                        title: 'Erro no upload',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    onUploadError === null || onUploadError === void 0 ? void 0 : onUploadError(errorMessage);
                    return [3 /*break*/, 8];
                case 7:
                    setIsUploading(false);
                    setUploadProgress(0);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var resetUpload = function () {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadResult(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    return (<card_1.Card className="w-full max-w-2xl mx-auto">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Camera className="h-5 w-5"/>
          Upload de Foto do Paciente
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Photo Type Selection */}
        <div className="space-y-2">
          <label_1.Label htmlFor="photo-type">Tipo de Foto</label_1.Label>
          <select_1.Select value={photoType} onValueChange={setPhotoType}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Selecione o tipo de foto"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {PHOTO_TYPES.map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                  {type.label}
                </select_1.SelectItem>); })}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Facial Recognition Toggle */}
        {enableRecognition && (<div className="flex items-center space-x-2">
            <switch_1.Switch id="facial-recognition" checked={enableFacialRecognition} onCheckedChange={setEnableFacialRecognition}/>
            <label_1.Label htmlFor="facial-recognition">
              Habilitar reconhecimento facial
            </label_1.Label>
          </div>)}

        {/* File Upload Area */}
        <div className={"border-2 border-dashed rounded-lg p-8 text-center transition-colors ".concat(selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400')} onDrop={handleDrop} onDragOver={handleDragOver}>
          <input ref={fileInputRef} type="file" accept={allowedTypes.join(',')} onChange={handleFileInputChange} className="hidden"/>
          
          {selectedFile ? (<div className="space-y-4">
              <lucide_react_1.CheckCircle className="h-12 w-12 text-green-500 mx-auto"/>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {Math.round(selectedFile.size / 1024)} KB
                </p>
              </div>
            </div>) : (<div className="space-y-4">
              <lucide_react_1.Upload className="h-12 w-12 text-gray-400 mx-auto"/>
              <div>
                <p className="text-lg font-medium">Arraste uma foto aqui</p>
                <p className="text-gray-500">ou clique para selecionar</p>
              </div>
              <button_1.Button type="button" variant="outline" onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                Selecionar Arquivo
              </button_1.Button>
            </div>)}
        </div>

        {/* Preview */}
        {previewUrl && showPreview && (<div className="space-y-2">
            <div className="flex items-center justify-between">
              <label_1.Label>Pré-visualização</label_1.Label>
              <button_1.Button type="button" variant="ghost" size="sm" onClick={function () { return setShowPreview(!showPreview); }}>
                {showPreview ? <lucide_react_1.EyeOff className="h-4 w-4"/> : <lucide_react_1.Eye className="h-4 w-4"/>}
              </button_1.Button>
            </div>
            <div className="relative max-w-md mx-auto">
              <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg shadow-md"/>
            </div>
          </div>)}

        {/* Upload Progress */}
        {isUploading && (<div className="space-y-2">
            <div className="flex items-center justify-between">
              <label_1.Label>Enviando...</label_1.Label>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <progress_1.Progress value={uploadProgress} className="w-full"/>
          </div>)}

        {/* Upload Result */}
        {uploadResult && (<alert_1.Alert>
            <lucide_react_1.CheckCircle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Upload realizado com sucesso!</p>
                
                {uploadResult.recognition && (<div className="flex items-center gap-2">
                    <badge_1.Badge variant={uploadResult.recognition.success ? 'default' : 'secondary'}>
                      Reconhecimento: {uploadResult.recognition.confidence}%
                    </badge_1.Badge>
                    {uploadResult.recognition.matchesFound > 0 && (<badge_1.Badge variant="outline">
                        {uploadResult.recognition.matchesFound} correspondência(s)
                      </badge_1.Badge>)}
                  </div>)}
                
                {uploadResult.metadata.quality.score < 0.7 && (<div className="text-sm text-amber-600">
                    <p>Qualidade da imagem pode ser melhorada:</p>
                    <ul className="list-disc list-inside">
                      {uploadResult.metadata.quality.recommendations.map(function (rec, index) { return (<li key={index}>{rec}</li>); })}
                    </ul>
                  </div>)}
              </div>
            </alert_1.AlertDescription>
          </alert_1.Alert>)}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button_1.Button onClick={uploadPhoto} disabled={!selectedFile || isUploading} className="flex-1">
            {isUploading ? (<>
                <lucide_react_1.Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                Enviando...
              </>) : (<>
                <lucide_react_1.Upload className="h-4 w-4 mr-2"/>
                Enviar Foto
              </>)}
          </button_1.Button>
          
          {selectedFile && (<button_1.Button type="button" variant="outline" onClick={resetUpload} disabled={isUploading}>
              Cancelar
            </button_1.Button>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
