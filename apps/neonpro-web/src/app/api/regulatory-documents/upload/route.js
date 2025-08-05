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
exports.POST = POST;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
// Maximum file size: 10MB (as per Story 12.1 requirements)
var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Allowed file types for regulatory documents
var ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
var ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];
// POST /api/regulatory-documents/upload - Upload document file
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      formData,
      file,
      documentId,
      category,
      fileExtension_1,
      timestamp,
      randomId,
      fileExtension,
      fileName,
      filePath,
      arrayBuffer,
      uint8Array,
      _b,
      uploadData,
      uploadError,
      publicUrlData,
      updateError,
      error_1;
    var _c;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 9, , 10]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "User not associated with clinic" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.formData()];
        case 4:
          formData = _d.sent();
          file = formData.get("file");
          documentId = formData.get("document_id");
          category = formData.get("category") || "general";
          if (!file) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "No file provided" }, { status: 400 }),
            ];
          }
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "File size too large. Maximum size is ".concat(
                    MAX_FILE_SIZE / 1024 / 1024,
                    "MB",
                  ),
                },
                { status: 400 },
              ),
            ];
          }
          // Validate file type
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            fileExtension_1 =
              "." +
              ((_c = file.name.split(".").pop()) === null || _c === void 0
                ? void 0
                : _c.toLowerCase());
            if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension_1)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    error: "File type not allowed. Supported types: ".concat(
                      ALLOWED_FILE_EXTENSIONS.join(", "),
                    ),
                  },
                  { status: 400 },
                ),
              ];
            }
          }
          timestamp = Date.now();
          randomId = Math.random().toString(36).substring(7);
          fileExtension = "." + file.name.split(".").pop();
          fileName = "".concat(timestamp, "_").concat(randomId).concat(fileExtension);
          filePath = "regulatory-documents/"
            .concat(profile.clinic_id, "/")
            .concat(category, "/")
            .concat(fileName);
          return [4 /*yield*/, file.arrayBuffer()];
        case 5:
          arrayBuffer = _d.sent();
          uint8Array = new Uint8Array(arrayBuffer);
          return [
            4 /*yield*/,
            supabase.storage.from("documents").upload(filePath, uint8Array, {
              contentType: file.type,
              metadata: {
                clinic_id: profile.clinic_id,
                document_id: documentId || null,
                category: category,
                uploaded_by: user.id,
                original_name: file.name,
              },
            }),
          ];
        case 6:
          (_b = _d.sent()), (uploadData = _b.data), (uploadError = _b.error);
          if (uploadError) {
            console.error("Error uploading file to Supabase Storage:", uploadError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to upload file" }, { status: 500 }),
            ];
          }
          publicUrlData = supabase.storage.from("documents").getPublicUrl(filePath).data;
          if (!documentId) return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            supabase
              .from("regulatory_documents")
              .update({
                file_url: publicUrlData.publicUrl,
                file_name: file.name,
                file_size: file.size,
                updated_by: user.id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", documentId),
          ];
        case 7:
          updateError = _d.sent().error;
          if (updateError) {
            console.error("Error updating document record:", updateError);
            // File was uploaded but document record wasn't updated
            // Should we delete the file? For now, we'll return success with warning
          }
          _d.label = 8;
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              file: {
                name: file.name,
                size: file.size,
                type: file.type,
                url: publicUrlData.publicUrl,
                path: filePath,
              },
              message: "File uploaded successfully",
            }),
          ];
        case 9:
          error_1 = _d.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
// DELETE /api/regulatory-documents/upload - Delete uploaded file
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, _b, filePath, documentId, deleteError, updateError, error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, , 8]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          (_b = _c.sent()), (filePath = _b.filePath), (documentId = _b.documentId);
          if (!filePath) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "File path is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, supabase.storage.from("documents").remove([filePath])];
        case 4:
          deleteError = _c.sent().error;
          if (deleteError) {
            console.error("Error deleting file from Supabase Storage:", deleteError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to delete file" }, { status: 500 }),
            ];
          }
          if (!documentId) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("regulatory_documents")
              .update({
                file_url: null,
                file_name: null,
                file_size: null,
                updated_by: user.id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", documentId),
          ];
        case 5:
          updateError = _c.sent().error;
          if (updateError) {
            console.error("Error updating document record:", updateError);
            // File was deleted but document record wasn't updated
          }
          _c.label = 6;
        case 6:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "File deleted successfully",
            }),
          ];
        case 7:
          error_2 = _c.sent();
          console.error("API Error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
