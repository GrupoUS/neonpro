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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsManagement = DocumentsManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var mockDocuments = [
  {
    id: "1",
    name: "Exame_Laboratorial_15_07_2024.pdf",
    type: "exam",
    size: "2.3 MB",
    uploadDate: "2024-07-15",
    status: "processed",
    isConfidential: true,
    lgpdConsent: true,
  },
  {
    id: "2",
    name: "Receita_Medicamentos_10_07_2024.pdf",
    type: "prescription",
    size: "856 KB",
    uploadDate: "2024-07-10",
    status: "processed",
    isConfidential: true,
    lgpdConsent: true,
  },
  {
    id: "3",
    name: "Termo_Consentimento_Botox.pdf",
    type: "consent",
    size: "1.2 MB",
    uploadDate: "2024-07-05",
    status: "processed",
    isConfidential: false,
    lgpdConsent: true,
  },
];
var documentTypeLabels = {
  exam: "Exame",
  prescription: "Receita",
  report: "Relatório",
  consent: "Consentimento",
  other: "Outros",
};
var statusLabels = {
  processed: "Processado",
  pending: "Processando",
  error: "Erro",
};
function DocumentsManagement() {
  var _a = (0, react_1.useState)(mockDocuments),
    documents = _a[0],
    setDocuments = _a[1];
  var _b = (0, react_1.useState)("all"),
    selectedType = _b[0],
    setSelectedType = _b[1];
  var _c = (0, react_1.useState)(0),
    uploadProgress = _c[0],
    setUploadProgress = _c[1];
  var _d = (0, react_1.useState)(false),
    isUploading = _d[0],
    setIsUploading = _d[1];
  var _e = (0, react_1.useState)(false),
    showLgpdDialog = _e[0],
    setShowLgpdDialog = _e[1];
  var _f = (0, react_1.useState)(false),
    lgpdConsent = _f[0],
    setLgpdConsent = _f[1];
  var fileInputRef = (0, react_1.useRef)(null);
  var filteredDocuments = documents.filter(
    (doc) => selectedType === "all" || doc.type === selectedType,
  );
  var handleFileUpload = (event) =>
    __awaiter(this, void 0, void 0, function () {
      var files, progressInterval;
      return __generator(this, (_a) => {
        files = event.target.files;
        if (!files || files.length === 0) return [2 /*return*/];
        if (!lgpdConsent) {
          setShowLgpdDialog(true);
          return [2 /*return*/];
        }
        setIsUploading(true);
        setUploadProgress(0);
        progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              setIsUploading(false);
              // Add new document to list
              var file = files[0];
              var newDoc_1 = {
                id: Date.now().toString(),
                name: file.name,
                type: "other",
                size: "".concat((file.size / 1024 / 1024).toFixed(1), " MB"),
                uploadDate: new Date().toISOString().split("T")[0],
                status: "pending",
                isConfidential: true,
                lgpdConsent: true,
              };
              setDocuments((prev) => __spreadArray([newDoc_1], prev, true));
              return 100;
            }
            return prev + 10;
          });
        }, 200);
        return [2 /*return*/];
      });
    });
  var handleDownload = (doc) => {
    // Simulate document download
    console.log("Downloading ".concat(doc.name));
  };
  var handleDelete = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };
  var getDocumentIcon = (type) => {
    switch (type) {
      case "exam":
      case "report":
        return lucide_react_1.FileText;
      case "prescription":
        return lucide_react_1.FileText;
      case "consent":
        return lucide_react_1.Shield;
      default:
        return lucide_react_1.FileText;
    }
  };
  var getStatusColor = (status) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return (
    <div className="space-y-6">
      {/* LGPD Consent Dialog */}
      <dialog_1.Dialog open={showLgpdDialog} onOpenChange={setShowLgpdDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5 text-primary" />
              Consentimento LGPD
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Para fazer upload de documentos médicos, é necessário seu consentimento para
              processamento de dados pessoais.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <alert_1.Alert>
              <lucide_react_1.Lock className="h-4 w-4" />
              <alert_1.AlertDescription>
                Seus documentos serão criptografados e armazenados com segurança máxima, conforme
                LGPD e normas do CFM.
              </alert_1.AlertDescription>
            </alert_1.Alert>
            <div className="flex items-center space-x-2">
              <checkbox_1.Checkbox
                id="consent"
                checked={lgpdConsent}
                onCheckedChange={(checked) => setLgpdConsent(checked)}
              />
              <label_1.Label htmlFor="consent" className="text-sm">
                Consinto com o processamento dos meus dados médicos para fins de tratamento e
                acompanhamento clínico.
              </label_1.Label>
            </div>
            <div className="flex gap-2">
              <button_1.Button
                onClick={() => {
                  var _a;
                  setShowLgpdDialog(false);
                  if (
                    lgpdConsent &&
                    ((_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.files)
                  ) {
                    handleFileUpload({ target: fileInputRef.current });
                  }
                }}
                disabled={!lgpdConsent}
                className="flex-1"
              >
                Confirmar e Continuar
              </button_1.Button>
              <button_1.Button
                variant="outline"
                onClick={() => setShowLgpdDialog(false)}
                className="flex-1"
              >
                Cancelar
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Documentos</h2>
          <p className="text-gray-600">Gerencie seus documentos médicos com segurança</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select_1.Select value={selectedType} onValueChange={setSelectedType}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Filtrar por tipo" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
              <select_1.SelectItem value="exam">Exames</select_1.SelectItem>
              <select_1.SelectItem value="prescription">Receitas</select_1.SelectItem>
              <select_1.SelectItem value="report">Relatórios</select_1.SelectItem>
              <select_1.SelectItem value="consent">Consentimentos</select_1.SelectItem>
              <select_1.SelectItem value="other">Outros</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button
            onClick={() => {
              var _a;
              return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <lucide_react_1.Upload className="h-4 w-4 mr-2" />
            Upload Documento
          </button_1.Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Fazendo upload do documento...</span>
                <span>{uploadProgress}%</span>
              </div>
              <progress_1.Progress value={uploadProgress} className="h-2" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* LGPD Notice */}
      <alert_1.Alert>
        <lucide_react_1.Shield className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Segurança LGPD:</strong> Todos os documentos são criptografados e processados
          conforme regulamentações de proteção de dados pessoais e normas do CFM.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      {/* Documents List */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Documentos ({filteredDocuments.length})</card_1.CardTitle>
          <card_1.CardDescription>
            Lista dos seus documentos médicos organizados por data
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {filteredDocuments.length === 0
              ? <div className="text-center py-8">
                  <lucide_react_1.FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhum documento encontrado</p>
                  <p className="text-sm text-gray-400">
                    {selectedType === "all"
                      ? "Faça upload do seu primeiro documento"
                      : "Nenhum documento encontrado para este filtro"}
                  </p>
                </div>
              : filteredDocuments.map((doc, index) => {
                  var IconComponent = getDocumentIcon(doc.type);
                  return (
                    <div key={doc.id}>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              {doc.isConfidential && (
                                <lucide_react_1.Lock className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{documentTypeLabels[doc.type]}</span>
                              <span>{doc.size}</span>
                              <span>{new Date(doc.uploadDate).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge className={getStatusColor(doc.status)}>
                            {statusLabels[doc.status]}
                          </badge_1.Badge>
                          <div className="flex gap-1">
                            <button_1.Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(doc)}
                              disabled={doc.status !== "processed"}
                            >
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(doc)}
                              disabled={doc.status !== "processed"}
                            >
                              <lucide_react_1.Download className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <lucide_react_1.X className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </div>
                      </div>
                      {index < filteredDocuments.length - 1 && (
                        <separator_1.Separator className="my-2" />
                      )}
                    </div>
                  );
                })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Storage Info */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Uso do Armazenamento</h3>
              <span className="text-sm text-gray-500">2.8 GB / 10 GB</span>
            </div>
            <progress_1.Progress value={28} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-primary">8</p>
                <p className="text-gray-500">Exames</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">5</p>
                <p className="text-gray-500">Receitas</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-600">3</p>
                <p className="text-gray-500">Relatórios</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-purple-600">2</p>
                <p className="text-gray-500">Consentimentos</p>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
