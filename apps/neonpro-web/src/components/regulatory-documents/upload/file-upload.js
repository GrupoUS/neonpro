"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.FileUpload = FileUpload;
var react_1 = require("react");
var react_dropzone_1 = require("react-dropzone");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function FileUpload(_a) {
  var onUploadComplete = _a.onUploadComplete,
    onUploadError = _a.onUploadError,
    _b = _a.accept,
    accept =
      _b === void 0
        ? {
            "application/pdf": [".pdf"],
            "image/*": [".png", ".jpg", ".jpeg"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
          }
        : _b,
    _c = _a.maxSize,
    maxSize = _c === void 0 ? 10 * 1024 * 1024 : _c, // 10MB
    _d = _a.maxFiles, // 10MB
    maxFiles = _d === void 0 ? 1 : _d,
    _e = _a.disabled,
    disabled = _e === void 0 ? false : _e;
  var _f = (0, react_1.useState)([]),
    uploadingFiles = _f[0],
    setUploadingFiles = _f[1];
  var _g = (0, react_1.useState)(false),
    isUploading = _g[0],
    setIsUploading = _g[1];
  var onDrop = (0, react_1.useCallback)(
    (acceptedFiles) =>
      __awaiter(this, void 0, void 0, function () {
        var file,
          error,
          uploadingFile,
          formData,
          response,
          error,
          result_1,
          error_1,
          errorMessage_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (acceptedFiles.length === 0) return [2 /*return*/];
              file = acceptedFiles[0]; // Single file upload for regulatory documents
              // Validate file size
              if (file.size > maxSize) {
                error = "Arquivo muito grande. Tamanho m\u00E1ximo: ".concat(
                  Math.round(maxSize / 1024 / 1024),
                  "MB",
                );
                sonner_1.toast.error(error);
                onUploadError === null || onUploadError === void 0 ? void 0 : onUploadError(error);
                return [2 /*return*/];
              }
              setIsUploading(true);
              uploadingFile = {
                file: file,
                progress: 0,
              };
              setUploadingFiles([uploadingFile]);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, 7, 8]);
              formData = new FormData();
              formData.append("file", file);
              return [
                4 /*yield*/,
                fetch("/api/regulatory-documents/upload", {
                  method: "POST",
                  body: formData,
                }),
              ];
            case 2:
              response = _a.sent();
              if (response.ok) return [3 /*break*/, 4];
              return [4 /*yield*/, response.text()];
            case 3:
              error = _a.sent();
              throw new Error(error || "Upload failed");
            case 4:
              return [
                4 /*yield*/,
                response.json(),
                // Update file state to completed
              ];
            case 5:
              result_1 = _a.sent();
              // Update file state to completed
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.file === file
                    ? __assign(__assign({}, f), {
                        progress: 100,
                        completed: true,
                        url: result_1.url,
                      })
                    : f,
                ),
              );
              // Call success callback
              onUploadComplete(result_1.url, file.name, file.size);
              sonner_1.toast.success("Arquivo enviado com sucesso!");
              // Clear files after a delay
              setTimeout(() => {
                setUploadingFiles([]);
              }, 2000);
              return [3 /*break*/, 8];
            case 6:
              error_1 = _a.sent();
              console.error("Upload error:", error_1);
              errorMessage_1 = error_1 instanceof Error ? error_1.message : "Erro no upload";
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.file === file ? __assign(__assign({}, f), { error: errorMessage_1 }) : f,
                ),
              );
              sonner_1.toast.error(errorMessage_1);
              onUploadError === null || onUploadError === void 0
                ? void 0
                : onUploadError(errorMessage_1);
              return [3 /*break*/, 8];
            case 7:
              setIsUploading(false);
              return [7 /*endfinally*/];
            case 8:
              return [2 /*return*/];
          }
        });
      }),
    [maxSize, onUploadComplete, onUploadError],
  );
  var _h = (0, react_dropzone_1.useDropzone)({
      onDrop: onDrop,
      accept: accept,
      maxFiles: maxFiles,
      maxSize: maxSize,
      disabled: disabled || isUploading,
      multiple: false,
    }),
    getRootProps = _h.getRootProps,
    getInputProps = _h.getInputProps,
    isDragActive = _h.isDragActive,
    fileRejections = _h.fileRejections;
  var removeFile = (fileToRemove) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== fileToRemove));
  };
  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <card_1.Card
        {...getRootProps()}
        className={"border-2 border-dashed cursor-pointer transition-colors "
          .concat(
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            " ",
          )
          .concat(disabled || isUploading ? "opacity-50 cursor-not-allowed" : "")}
      >
        <card_1.CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <input {...getInputProps()} />

          <div className="flex flex-col items-center text-center space-y-2">
            <lucide_react_1.Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Solte o arquivo aqui..." : "Clique ou arraste o arquivo aqui"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, DOCX ou imagens até {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>
            <ul className="list-disc list-inside">
              {fileRejections.map((_a) => {
                var file = _a.file,
                  errors = _a.errors;
                return (
                  <li key={file.name}>
                    {file.name}: {errors.map((e) => e.message).join(", ")}
                  </li>
                );
              })}
            </ul>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <card_1.Card key={index}>
              <card_1.CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <lucide_react_1.File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {uploadingFile.completed
                      ? <lucide_react_1.Check className="h-5 w-5 text-green-500" />
                      : uploadingFile.error
                        ? <lucide_react_1.AlertCircle className="h-5 w-5 text-red-500" />
                        : <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadingFile.file)}
                            disabled={isUploading}
                          >
                            <lucide_react_1.X className="h-4 w-4" />
                          </button_1.Button>}
                  </div>
                </div>

                {!uploadingFile.completed && !uploadingFile.error && (
                  <div className="mt-2">
                    <progress_1.Progress value={uploadingFile.progress} className="h-2" />
                  </div>
                )}

                {uploadingFile.error && (
                  <alert_1.Alert variant="destructive" className="mt-2">
                    <lucide_react_1.AlertCircle className="h-4 w-4" />
                    <alert_1.AlertDescription>{uploadingFile.error}</alert_1.AlertDescription>
                  </alert_1.Alert>
                )}
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      )}
    </div>
  );
}
