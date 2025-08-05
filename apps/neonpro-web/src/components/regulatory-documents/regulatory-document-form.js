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
exports.RegulatoryDocumentForm = RegulatoryDocumentForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var use_regulatory_categories_1 = require("@/hooks/use-regulatory-categories");
var utils_1 = require("@/lib/utils");
var documentFormSchema = zod_2.z.object({
  document_type: zod_2.z.string().min(1, "Tipo do documento é obrigatório"),
  document_category: zod_2.z.string().min(1, "Categoria é obrigatória"),
  authority: zod_2.z.string().min(1, "Autoridade é obrigatória"),
  document_number: zod_2.z.string().optional(),
  issue_date: zod_2.z.date({ required_error: "Data de emissão é obrigatória" }),
  expiration_date: zod_2.z.date().optional(),
  status: zod_2.z.enum(["valid", "expiring", "expired", "pending"]).default("pending"),
  associated_professional_id: zod_2.z.string().optional(),
  associated_equipment_id: zod_2.z.string().optional(),
});
function RegulatoryDocumentForm(_a) {
  var document = _a.document,
    onSubmit = _a.onSubmit,
    onCancel = _a.onCancel,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)(null),
    uploadedFile = _c[0],
    setUploadedFile = _c[1];
  var _d = (0, react_1.useState)(false),
    uploading = _d[0],
    setUploading = _d[1];
  var _e = (0, use_regulatory_categories_1.useRegulatoryCategories)(),
    categories = _e.categories,
    authorities = _e.authorities,
    groupedCategories = _e.groupedCategories;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(documentFormSchema),
    defaultValues: {
      document_type:
        (document === null || document === void 0 ? void 0 : document.document_type) || "",
      document_category:
        (document === null || document === void 0 ? void 0 : document.document_category) || "",
      authority: (document === null || document === void 0 ? void 0 : document.authority) || "",
      document_number:
        (document === null || document === void 0 ? void 0 : document.document_number) || "",
      issue_date: document ? new Date(document.issue_date) : undefined,
      expiration_date: (
        document === null || document === void 0
          ? void 0
          : document.expiration_date
      )
        ? new Date(document.expiration_date)
        : undefined,
      status: (document === null || document === void 0 ? void 0 : document.status) || "pending",
      associated_professional_id:
        (document === null || document === void 0 ? void 0 : document.associated_professional_id) ||
        "",
      associated_equipment_id:
        (document === null || document === void 0 ? void 0 : document.associated_equipment_id) ||
        "",
    },
  });
  var selectedAuthority = form.watch("authority");
  var selectedCategory = form.watch("document_category");
  // Update authority when category changes
  (0, react_1.useEffect)(() => {
    if (selectedCategory && categories.length > 0) {
      var category = categories.find((cat) => cat.name === selectedCategory);
      if (category && category.authority_name !== selectedAuthority) {
        form.setValue("authority", category.authority_name);
      }
    }
  }, [selectedCategory, categories, selectedAuthority, form]);
  var handleFileUpload = (event) =>
    __awaiter(this, void 0, void 0, function () {
      var file, allowedTypes, formData, response, result, error_1;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file) return [2 /*return*/];
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
              alert("Arquivo muito grande. Tamanho máximo: 10MB");
              return [2 /*return*/];
            }
            allowedTypes = [
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/webp",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedTypes.includes(file.type)) {
              alert("Tipo de arquivo não permitido. Use: PDF, JPG, PNG, WebP, DOC, DOCX");
              return [2 /*return*/];
            }
            setUploading(true);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, 5, 6]);
            formData = new FormData();
            formData.append("file", file);
            formData.append("category", selectedCategory || "general");
            if (document === null || document === void 0 ? void 0 : document.id) {
              formData.append("document_id", document.id);
            }
            return [
              4 /*yield*/,
              fetch("/api/regulatory-documents/upload", {
                method: "POST",
                body: formData,
              }),
            ];
          case 2:
            response = _b.sent();
            if (!response.ok) {
              throw new Error("Failed to upload file");
            }
            return [4 /*yield*/, response.json()];
          case 3:
            result = _b.sent();
            setUploadedFile({
              url: result.file.url,
              name: result.file.name,
              size: result.file.size,
            });
            return [3 /*break*/, 6];
          case 4:
            error_1 = _b.sent();
            console.error("Upload error:", error_1);
            alert("Erro ao fazer upload do arquivo");
            return [3 /*break*/, 6];
          case 5:
            setUploading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var removeUploadedFile = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!uploadedFile) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/regulatory-documents/upload", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  filePath: uploadedFile.url.replace("/storage/v1/object/public/documents/", ""),
                  documentId: document === null || document === void 0 ? void 0 : document.id,
                }),
              }),
            ];
          case 2:
            _a.sent();
            setUploadedFile(null);
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error removing file:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var submitData;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            submitData = __assign(__assign({}, data), {
              issue_date: data.issue_date.toISOString().split("T")[0],
              expiration_date:
                (_a = data.expiration_date) === null || _a === void 0
                  ? void 0
                  : _a.toISOString().split("T")[0],
              file_url:
                uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.url,
              file_name:
                uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.name,
              file_size:
                uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.size,
              // Remove empty strings
              document_number: data.document_number || undefined,
              associated_professional_id: data.associated_professional_id || undefined,
              associated_equipment_id: data.associated_equipment_id || undefined,
            });
            return [4 /*yield*/, onSubmit(submitData)];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  var formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };
  return (
    <card_1.Card className="w-full max-w-4xl mx-auto">
      <card_1.CardHeader>
        <card_1.CardTitle>
          {document ? "Editar Documento Regulatório" : "Novo Documento Regulatório"}
        </card_1.CardTitle>
        <card_1.CardDescription>
          {document
            ? "Atualize as informações do documento regulatório"
            : "Adicione um novo documento de compliance ou certificação"}
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Type */}
              <form_1.FormField
                control={form.control}
                name="document_type"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Tipo do Documento</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          placeholder="Ex: Alvará Sanitário, Licença de Funcionamento"
                          {...field}
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Category */}
              <form_1.FormField
                control={form.control}
                name="document_category"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Categoria</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione a categoria" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {Object.entries(groupedCategories).map((_a) => {
                            var authority = _a[0],
                              cats = _a[1];
                            return (
                              <div key={authority}>
                                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                  {authority}
                                </div>
                                {cats.map((category) => (
                                  <select_1.SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                  </select_1.SelectItem>
                                ))}
                              </div>
                            );
                          })}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Authority */}
              <form_1.FormField
                control={form.control}
                name="authority"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Autoridade</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione a autoridade" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {authorities.map((authority) => (
                            <select_1.SelectItem
                              key={authority.authority_code}
                              value={authority.authority_name}
                            >
                              {authority.authority_name}
                            </select_1.SelectItem>
                          ))}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Document Number */}
              <form_1.FormField
                control={form.control}
                name="document_number"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Número do Documento (Opcional)</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="Ex: 12345/2024" {...field} />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Issue Date */}
              <form_1.FormField
                control={form.control}
                name="issue_date"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-col">
                      <form_1.FormLabel>Data de Emissão</form_1.FormLabel>
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <form_1.FormControl>
                            <button_1.Button
                              variant="outline"
                              className={(0, utils_1.cn)(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? (0, date_fns_1.format)(field.value, "PPP", {
                                    locale: locale_1.ptBR,
                                  })
                                : <span>Selecione a data</span>}
                              <lucide_react_1.CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button_1.Button>
                          </form_1.FormControl>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Expiration Date */}
              <form_1.FormField
                control={form.control}
                name="expiration_date"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-col">
                      <form_1.FormLabel>Data de Validade (Opcional)</form_1.FormLabel>
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <form_1.FormControl>
                            <button_1.Button
                              variant="outline"
                              className={(0, utils_1.cn)(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? (0, date_fns_1.format)(field.value, "PPP", {
                                    locale: locale_1.ptBR,
                                  })
                                : <span>Selecione a data</span>}
                              <lucide_react_1.CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button_1.Button>
                          </form_1.FormControl>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              {/* Status */}
              <form_1.FormField
                control={form.control}
                name="status"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Status</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o status" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="valid">Válido</select_1.SelectItem>
                          <select_1.SelectItem value="expiring">Expirando</select_1.SelectItem>
                          <select_1.SelectItem value="expired">Expirado</select_1.SelectItem>
                          <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label_1.Label>Arquivo do Documento</label_1.Label>

              {!uploadedFile
                ? <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <lucide_react_1.Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <label_1.Label
                          htmlFor="file-upload"
                          className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                        >
                          Clique para fazer upload
                        </label_1.Label>
                        <p className="text-xs text-muted-foreground">
                          PDF, JPG, PNG, WebP, DOC, DOCX (máx. 10MB)
                        </p>
                      </div>
                      <input_1.Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </div>
                    {uploading && (
                      <div className="mt-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Fazendo upload...</p>
                      </div>
                    )}
                  </div>
                : <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <button_1.Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeUploadedFile}
                      className="gap-1"
                    >
                      <lucide_react_1.X className="h-3 w-3" />
                      Remover
                    </button_1.Button>
                  </div>}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                type="submit"
                disabled={loading || uploading}
                className="min-w-[120px]"
              >
                {loading ? "Salvando..." : document ? "Atualizar" : "Criar"}
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
