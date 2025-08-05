"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentUpload;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var documents_1 = require("@/lib/services/documents");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function DocumentUpload(_a) {
  var _this = this;
  var entityType = _a.entityType,
    entityId = _a.entityId,
    _b = _a.existingDocuments,
    existingDocuments = _b === void 0 ? [] : _b,
    onDocumentsChange = _a.onDocumentsChange;
  var _c = (0, react_1.useState)([]),
    files = _c[0],
    setFiles = _c[1];
  var _d = (0, react_1.useState)(false),
    uploading = _d[0],
    setUploading = _d[1];
  var _e = (0, react_1.useState)(""),
    documentType = _e[0],
    setDocumentType = _e[1];
  var fileInputRef = (0, react_1.useRef)(null);
  var documentTypes = [
    { value: "invoice", label: "Fatura/Invoice" },
    { value: "contract", label: "Contrato" },
    { value: "receipt", label: "Recibo" },
    { value: "tax_document", label: "Documento Fiscal" },
    { value: "bank_statement", label: "Extrato Bancário" },
    { value: "payment_proof", label: "Comprovante de Pagamento" },
    { value: "certificate", label: "Certificado" },
    { value: "other", label: "Outro" },
  ];
  var handleFileSelect = function (e) {
    if (e.target.files) {
      var newFiles_1 = Array.from(e.target.files);
      setFiles(function (prev) {
        return __spreadArray(__spreadArray([], prev, true), newFiles_1, true);
      });
    }
  };
  var removeFile = function (index) {
    setFiles(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
  };
  var handleUpload = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _i, files_1, file, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (files.length === 0 || !documentType) {
              sonner_1.toast.error("Selecione arquivos e tipo de documento");
              return [2 /*return*/];
            }
            setUploading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            (_i = 0), (files_1 = files);
            _a.label = 2;
          case 2:
            if (!(_i < files_1.length)) return [3 /*break*/, 5];
            file = files_1[_i];
            return [
              4 /*yield*/,
              documents_1.documentsService.uploadDocument({
                file: file,
                entityType: entityType,
                entityId: entityId,
                documentType: documentType,
                fileName: file.name,
              }),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            setFiles([]);
            setDocumentType("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            sonner_1.toast.success("Documentos enviados com sucesso");
            onDocumentsChange === null || onDocumentsChange === void 0
              ? void 0
              : onDocumentsChange();
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            console.error("Erro no upload:", error_1);
            sonner_1.toast.error("Erro ao enviar documentos");
            return [3 /*break*/, 8];
          case 7:
            setUploading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleDownload = function (documentId, fileName) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              documents_1.documentsService.downloadDocument(documentId, fileName),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro no download:", error_2);
            sonner_1.toast.error("Erro ao baixar documento");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleDelete = function (documentId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, documents_1.documentsService.deleteDocument(documentId)];
          case 1:
            _a.sent();
            sonner_1.toast.success("Documento removido com sucesso");
            onDocumentsChange === null || onDocumentsChange === void 0
              ? void 0
              : onDocumentsChange();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Erro ao deletar:", error_3);
            sonner_1.toast.error("Erro ao remover documento");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var formatFileSize = function (bytes) {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Upload className="h-5 w-5" />
            Upload de Documentos
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="documentType">Tipo de Documento</label_1.Label>
              <select_1.Select value={documentType} onValueChange={setDocumentType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione o tipo" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {documentTypes.map(function (type) {
                    return (
                      <select_1.SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="fileInput">Arquivos</label_1.Label>
              <input_1.Input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <label_1.Label>Arquivos Selecionados:</label_1.Label>
              <div className="space-y-2">
                {files.map(function (file, index) {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <lucide_react_1.FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <badge_1.Badge variant="outline" className="text-xs">
                          {formatFileSize(file.size)}
                        </badge_1.Badge>
                      </div>
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        onClick={function () {
                          return removeFile(index);
                        }}
                      >
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button_1.Button
            onClick={handleUpload}
            disabled={files.length === 0 || !documentType || uploading}
            className="w-full"
          >
            {uploading ? "Enviando..." : "Enviar Documentos"}
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.FileText className="h-5 w-5" />
              Documentos Existentes
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              {existingDocuments.map(function (doc) {
                var _a;
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <lucide_react_1.FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <badge_1.Badge variant="outline">
                            {((_a = documentTypes.find(function (t) {
                              return t.value === doc.document_type;
                            })) === null || _a === void 0
                              ? void 0
                              : _a.label) || doc.document_type}
                          </badge_1.Badge>
                          {doc.file_size && <span>{formatFileSize(doc.file_size)}</span>}
                          <span>{new Date(doc.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return handleDownload(doc.id, doc.file_name);
                        }}
                      >
                        <lucide_react_1.Download className="h-4 w-4" />
                      </button_1.Button>
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        onClick={function () {
                          return handleDelete(doc.id);
                        }}
                      >
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
