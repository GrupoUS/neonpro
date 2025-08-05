"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityVerification = IdentityVerification;
/**
 * Identity Verification Component
 * Handles patient identity verification through facial recognition
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
var label_1 = require("@/components/ui/label");
var use_toast_1 = require("@/components/ui/use-toast");
var VERIFICATION_CONTEXTS = [
  { value: "identity_check", label: "Verificação de Identidade" },
  { value: "appointment_checkin", label: "Check-in de Consulta" },
  { value: "treatment_authorization", label: "Autorização de Tratamento" },
  { value: "document_access", label: "Acesso a Documentos" },
  { value: "payment_authorization", label: "Autorização de Pagamento" },
];
function IdentityVerification(_a) {
  var patientId = _a.patientId,
    patientName = _a.patientName,
    onVerificationComplete = _a.onVerificationComplete,
    onVerificationError = _a.onVerificationError,
    _b = _a.requiredConfidence,
    requiredConfidence = _b === void 0 ? 0.8 : _b;
  var _c = (0, react_1.useState)(null),
    selectedFile = _c[0],
    setSelectedFile = _c[1];
  var _d = (0, react_1.useState)("identity_check"),
    verificationContext = _d[0],
    setVerificationContext = _d[1];
  var _e = (0, react_1.useState)(false),
    isVerifying = _e[0],
    setIsVerifying = _e[1];
  var _f = (0, react_1.useState)(0),
    verificationProgress = _f[0],
    setVerificationProgress = _f[1];
  var _g = (0, react_1.useState)(null),
    previewUrl = _g[0],
    setPreviewUrl = _g[1];
  var _h = (0, react_1.useState)(null),
    verificationResult = _h[0],
    setVerificationResult = _h[1];
  var _j = (0, react_1.useState)(false),
    isUsingCamera = _j[0],
    setIsUsingCamera = _j[1];
  var _k = (0, react_1.useState)(null),
    stream = _k[0],
    setStream = _k[1];
  var fileInputRef = (0, react_1.useRef)(null);
  var videoRef = (0, react_1.useRef)(null);
  var canvasRef = (0, react_1.useRef)(null);
  var toast = (0, use_toast_1.useToast)().toast;
  var handleFileSelect = (0, react_1.useCallback)(
    (file) => {
      // Validate file type
      var allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos JPEG, PNG e WebP são permitidos.",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (5MB max for verification)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB para verificação.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setVerificationResult(null);
      // Create preview
      var reader = new FileReader();
      reader.onload = (e) => {
        var _a;
        setPreviewUrl((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
      };
      reader.readAsDataURL(file);
    },
    [toast],
  );
  var handleFileInputChange = (event) => {
    var _a;
    var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  var startCamera = () =>
    __awaiter(this, void 0, void 0, function () {
      var mediaStream, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
              }),
            ];
          case 1:
            mediaStream = _a.sent();
            setStream(mediaStream);
            setIsUsingCamera(true);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            toast({
              title: "Erro ao acessar câmera",
              description: "Não foi possível acessar a câmera. Verifique as permissões.",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };
  var capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    var canvas = canvasRef.current;
    var video = videoRef.current;
    var context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          var file = new File([blob], "verification-photo.jpg", { type: "image/jpeg" });
          handleFileSelect(file);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9,
    );
  };
  var verifyIdentity = () =>
    __awaiter(this, void 0, void 0, function () {
      var formData, progressInterval, response, error, result, isVerified, error_2, errorMessage;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedFile) return [2 /*return*/];
            setIsVerifying(true);
            setVerificationProgress(0);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            formData = new FormData();
            formData.append("photo", selectedFile);
            formData.append("patientId", patientId);
            formData.append("context", verificationContext);
            progressInterval = setInterval(() => {
              setVerificationProgress((prev) => Math.min(prev + 15, 90));
            }, 300);
            return [
              4 /*yield*/,
              fetch("/api/patients/photos/verify", {
                method: "POST",
                headers: {
                  Authorization: "Bearer ".concat(localStorage.getItem("supabase_token")),
                },
                body: formData,
              }),
            ];
          case 2:
            response = _a.sent();
            clearInterval(progressInterval);
            setVerificationProgress(100);
            if (response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            error = _a.sent();
            throw new Error(error.error || "Verification failed");
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            result = _a.sent();
            setVerificationResult(result.data);
            isVerified = result.data.verified && result.data.confidence >= requiredConfidence;
            toast({
              title: isVerified ? "Identidade verificada!" : "Verificação falhou",
              description: "Confian\u00E7a: ".concat(Math.round(result.data.confidence * 100), "%"),
              variant: isVerified ? "default" : "destructive",
            });
            onVerificationComplete === null || onVerificationComplete === void 0
              ? void 0
              : onVerificationComplete(result.data);
            return [3 /*break*/, 8];
          case 6:
            error_2 = _a.sent();
            errorMessage = error_2 instanceof Error ? error_2.message : "Erro desconhecido";
            toast({
              title: "Erro na verificação",
              description: errorMessage,
              variant: "destructive",
            });
            onVerificationError === null || onVerificationError === void 0
              ? void 0
              : onVerificationError(errorMessage);
            return [3 /*break*/, 8];
          case 7:
            setIsVerifying(false);
            setVerificationProgress(0);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var resetVerification = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVerificationResult(null);
    setVerificationProgress(0);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  var getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };
  var getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) return "default";
    if (confidence >= 0.7) return "secondary";
    return "destructive";
  };
  return (
    <card_1.Card className="w-full max-w-2xl mx-auto">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Shield className="h-5 w-5" />
          Verificação de Identidade - {patientName}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Verification Context */}
        <div className="space-y-2">
          <label_1.Label htmlFor="verification-context">Contexto da Verificação</label_1.Label>
          <select_1.Select value={verificationContext} onValueChange={setVerificationContext}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Selecione o contexto" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {VERIFICATION_CONTEXTS.map((context) => (
                <select_1.SelectItem key={context.value} value={context.value}>
                  {context.label}
                </select_1.SelectItem>
              ))}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Camera or File Upload */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button_1.Button
              type="button"
              variant={isUsingCamera ? "default" : "outline"}
              onClick={isUsingCamera ? stopCamera : startCamera}
              className="flex-1"
            >
              <lucide_react_1.Camera className="h-4 w-4 mr-2" />
              {isUsingCamera ? "Parar Câmera" : "Usar Câmera"}
            </button_1.Button>
            <button_1.Button
              type="button"
              variant="outline"
              onClick={() => {
                var _a;
                return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
              }}
              className="flex-1"
            >
              <lucide_react_1.Eye className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </button_1.Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Camera View */}
        {isUsingCamera && (
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg shadow-md"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <button_1.Button type="button" onClick={capturePhoto} className="w-full">
              <lucide_react_1.Camera className="h-4 w-4 mr-2" />
              Capturar Foto
            </button_1.Button>
          </div>
        )}

        {/* Preview */}
        {previewUrl && !isUsingCamera && (
          <div className="space-y-2">
            <label_1.Label>Foto para Verificação</label_1.Label>
            <div className="relative max-w-md mx-auto">
              <img
                src={previewUrl}
                alt="Verification photo"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        )}

        {/* Verification Progress */}
        {isVerifying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label_1.Label>Verificando identidade...</label_1.Label>
              <span className="text-sm text-gray-500">{verificationProgress}%</span>
            </div>
            <progress_1.Progress value={verificationProgress} className="w-full" />
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <alert_1.Alert
            className={
              verificationResult.verified
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {verificationResult.verified
              ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
              : <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />}
            <alert_1.AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {verificationResult.verified ? "Identidade Verificada" : "Verificação Falhou"}
                  </span>
                  <badge_1.Badge variant={getConfidenceBadge(verificationResult.confidence)}>
                    {Math.round(verificationResult.confidence * 100)}% confiança
                  </badge_1.Badge>
                </div>

                {verificationResult.matchedPhotos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Fotos correspondentes:</p>
                    <div className="space-y-1">
                      {verificationResult.matchedPhotos.map((photo, index) => (
                        <div key={photo.id} className="flex items-center justify-between text-sm">
                          <span>
                            {photo.type} - {new Date(photo.uploadedAt).toLocaleDateString()}
                          </span>
                          <badge_1.Badge
                            variant="outline"
                            className={getConfidenceColor(photo.confidence)}
                          >
                            {Math.round(photo.confidence * 100)}%
                          </badge_1.Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {verificationResult.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Recomendações:</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {verificationResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </alert_1.AlertDescription>
          </alert_1.Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button_1.Button
            onClick={verifyIdentity}
            disabled={!selectedFile || isVerifying}
            className="flex-1"
            variant={
              (
                verificationResult === null || verificationResult === void 0
                  ? void 0
                  : verificationResult.verified
              )
                ? "default"
                : "default"
            }
          >
            {isVerifying
              ? <>
                  <lucide_react_1.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              : <>
                  <lucide_react_1.Shield className="h-4 w-4 mr-2" />
                  Verificar Identidade
                </>}
          </button_1.Button>

          {selectedFile && (
            <button_1.Button
              type="button"
              variant="outline"
              onClick={resetVerification}
              disabled={isVerifying}
            >
              <lucide_react_1.X className="h-4 w-4 mr-2" />
              Limpar
            </button_1.Button>
          )}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
