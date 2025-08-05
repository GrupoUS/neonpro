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
exports.createdocumentsService = void 0;
var client_1 = require("@/lib/supabase/client");
var DocumentsService = /** @class */ (() => {
  function DocumentsService() {
    this.supabase = (0, client_1.createClient)();
  }
  DocumentsService.prototype.uploadDocument = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var user,
        fileExtension,
        timestamp,
        uniqueFileName,
        filePath,
        uploadError,
        documentData,
        _a,
        document_1,
        dbError,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            fileExtension = data.file.name.split(".").pop();
            timestamp = Date.now();
            uniqueFileName = ""
              .concat(timestamp, "_")
              .concat(Math.random().toString(36).substr(2, 9), ".")
              .concat(fileExtension);
            filePath = "documents/"
              .concat(data.entityType, "/")
              .concat(data.entityId, "/")
              .concat(uniqueFileName);
            return [
              4 /*yield*/,
              this.supabase.storage.from("documents").upload(filePath, data.file),
            ];
          case 2:
            uploadError = _b.sent().error;
            if (uploadError) throw uploadError;
            documentData = {
              id: crypto.randomUUID(),
              entity_type: data.entityType,
              entity_id: data.entityId,
              document_type: data.documentType,
              file_name: data.fileName,
              file_path: filePath,
              file_size: data.file.size,
              mime_type: data.file.type,
              uploaded_by: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            return [
              4 /*yield*/,
              this.supabase.from("ap_documents").insert(documentData).select().single(),
            ];
          case 3:
            (_a = _b.sent()), (document_1 = _a.data), (dbError = _a.error);
            if (dbError) throw dbError;
            return [2 /*return*/, document_1];
          case 4:
            error_1 = _b.sent();
            console.error("Error uploading document:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  DocumentsService.prototype.getDocuments = function (entityType, entityId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_documents")
                .select("*")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_2 = _b.sent();
            console.error("Error fetching documents:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DocumentsService.prototype.downloadDocument = function (documentId, fileName) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, document_2, docError, _b, data, error, url, link, error_3;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("ap_documents").select("file_path").eq("id", documentId).single(),
            ];
          case 1:
            (_a = _c.sent()), (document_2 = _a.data), (docError = _a.error);
            if (docError) throw docError;
            return [
              4 /*yield*/,
              this.supabase.storage.from("documents").download(document_2.file_path),
            ];
          case 2:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            url = URL.createObjectURL(data);
            link = window.document.createElement("a");
            link.href = url;
            link.download = fileName;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return [3 /*break*/, 4];
          case 3:
            error_3 = _c.sent();
            console.error("Error downloading document:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  DocumentsService.prototype.deleteDocument = function (documentId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, document_3, docError, storageError, dbError, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase.from("ap_documents").select("file_path").eq("id", documentId).single(),
            ];
          case 1:
            (_a = _b.sent()), (document_3 = _a.data), (docError = _a.error);
            if (docError) throw docError;
            return [
              4 /*yield*/,
              this.supabase.storage.from("documents").remove([document_3.file_path]),
            ];
          case 2:
            storageError = _b.sent().error;
            if (storageError) throw storageError;
            return [4 /*yield*/, this.supabase.from("ap_documents").delete().eq("id", documentId)];
          case 3:
            dbError = _b.sent().error;
            if (dbError) throw dbError;
            return [3 /*break*/, 5];
          case 4:
            error_4 = _b.sent();
            console.error("Error deleting document:", error_4);
            throw error_4;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  DocumentsService.prototype.getDocumentsByType = function (documentType) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_documents")
                .select("*")
                .eq("document_type", documentType)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_5 = _b.sent();
            console.error("Error fetching documents by type:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DocumentsService.prototype.updateDocumentType = function (documentId, newType) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_documents")
                .update({
                  document_type: newType,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", documentId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error updating document type:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return DocumentsService;
})();
var createdocumentsService = () => new DocumentsService();
exports.createdocumentsService = createdocumentsService;
