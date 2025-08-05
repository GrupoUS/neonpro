/**
 * Patient Photo Upload API
 * Handles photo upload with facial recognition and privacy controls
 *
 * @route POST /api/patients/photos/upload
 * @author APEX Master Developer
 */
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
exports.GET = GET;
var server_1 = require("next/server");
var supabase_js_1 = require("@supabase/supabase-js");
var photo_recognition_manager_1 = require("../../../../../lib/patients/photo-recognition/photo-recognition-manager");
var audit_logger_1 = require("../../../../../lib/audit/audit-logger");
var lgpd_manager_1 = require("../../../../../lib/security/lgpd-manager");
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
var auditLogger = new audit_logger_1.AuditLogger(supabase);
var lgpdManager = new lgpd_manager_1.LGPDManager(supabase, auditLogger);
var photoManager = new photo_recognition_manager_1.PhotoRecognitionManager(
  supabase,
  auditLogger,
  lgpdManager,
  photo_recognition_manager_1.defaultPhotoRecognitionConfig,
);
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authHeader,
      token,
      _a,
      user,
      authError,
      formData,
      photoFile,
      patientId,
      photoType,
      allowedTypes,
      _b,
      patient,
      patientError,
      result,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, , 6]);
          authHeader = request.headers.get("authorization");
          if (!authHeader) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authorization required" }, { status: 401 }),
            ];
          }
          token = authHeader.replace("Bearer ", "");
          return [4 /*yield*/, supabase.auth.getUser(token)];
        case 1:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid authentication" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.formData()];
        case 2:
          formData = _c.sent();
          photoFile = formData.get("photo");
          patientId = formData.get("patientId");
          photoType = formData.get("photoType") || "profile";
          if (!photoFile || !patientId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Photo file and patient ID are required" },
                { status: 400 },
              ),
            ];
          }
          allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
          if (!allowedTypes.includes(photoFile.type)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
                { status: 400 },
              ),
            ];
          }
          // Validate file size (10MB max)
          if (photoFile.size > 10 * 1024 * 1024) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "File too large. Maximum size is 10MB" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("patients").select("id, name").eq("id", patientId).single(),
          ];
        case 3:
          (_b = _c.sent()), (patient = _b.data), (patientError = _b.error);
          if (patientError || !patient) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Patient not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            photoManager.uploadPatientPhoto(patientId, photoFile, photoType, user.id),
          ];
        case 4:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                photoId: result.photoId,
                metadata: result.metadata,
                recognition: result.recognition
                  ? {
                      success: result.recognition.success,
                      confidence: result.recognition.confidence,
                      matchesFound: result.recognition.matches.length,
                    }
                  : null,
              },
            }),
          ];
        case 5:
          error_1 = _c.sent();
          console.error("Photo upload error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Upload failed",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authHeader, token, _a, user, authError, searchParams, patientId, photoType, photos, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          authHeader = request.headers.get("authorization");
          if (!authHeader) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authorization required" }, { status: 401 }),
            ];
          }
          token = authHeader.replace("Bearer ", "");
          return [4 /*yield*/, supabase.auth.getUser(token)];
        case 1:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid authentication" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          patientId = searchParams.get("patientId");
          photoType = searchParams.get("photoType");
          if (!patientId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Patient ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            photoManager.getPatientPhotos(patientId, photoType || undefined, user.id),
          ];
        case 2:
          photos = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: photos,
            }),
          ];
        case 3:
          error_2 = _b.sent();
          console.error("Get photos error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to get photos",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
