/**
 * Photo Recognition Statistics API
 * Provides analytics and statistics for photo recognition system
 *
 * @route GET /api/patients/photos/stats
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
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authHeader,
      token,
      _a,
      user,
      authError,
      _b,
      userProfile,
      profileError,
      searchParams,
      timeframe,
      patientId,
      stats,
      systemStats,
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
          return [
            4 /*yield*/,
            supabase.from("user_profiles").select("role").eq("user_id", user.id).single(),
          ];
        case 2:
          (_b = _c.sent()), (userProfile = _b.data), (profileError = _b.error);
          if (profileError || !userProfile || !["admin", "manager"].includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          timeframe = searchParams.get("timeframe") || "30d"; // 7d, 30d, 90d, 1y
          patientId = searchParams.get("patientId"); // Optional: stats for specific patient
          return [
            4 /*yield*/,
            photoManager.getRecognitionStats(timeframe, patientId || undefined),
            // Get additional system-wide statistics
          ];
        case 3:
          stats = _c.sent();
          return [4 /*yield*/, getSystemPhotoStats(timeframe)];
        case 4:
          systemStats = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                recognition: stats,
                system: systemStats,
                timeframe: timeframe,
                generatedAt: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          error_1 = _c.sent();
          console.error("Get photo stats error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to get statistics",
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
// Helper function to get system-wide photo statistics
function getSystemPhotoStats(timeframe) {
  return __awaiter(this, void 0, void 0, function () {
    var timeframeDays,
      startDate,
      totalPhotos,
      photosByType,
      typeDistribution,
      verificationAttempts,
      successfulVerifications,
      confidenceData,
      avgConfidence,
      privacyData,
      privacyStats,
      storageData,
      totalStorageUsed,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          timeframeDays =
            {
              "7d": 7,
              "30d": 30,
              "90d": 90,
              "1y": 365,
            }[timeframe] || 30;
          startDate = new Date();
          startDate.setDate(startDate.getDate() - timeframeDays);
          _a.label = 1;
        case 1:
          _a.trys.push([1, 9, , 10]);
          return [
            4 /*yield*/,
            supabase
              .from("patient_photos")
              .select("*", { count: "exact", head: true })
              .gte("created_at", startDate.toISOString()),
            // Photos by type
          ];
        case 2:
          totalPhotos = _a.sent().count;
          return [
            4 /*yield*/,
            supabase
              .from("patient_photos")
              .select("photo_type")
              .gte("created_at", startDate.toISOString()),
          ];
        case 3:
          photosByType = _a.sent().data;
          typeDistribution =
            (photosByType === null || photosByType === void 0
              ? void 0
              : photosByType.reduce((acc, photo) => {
                  acc[photo.photo_type] = (acc[photo.photo_type] || 0) + 1;
                  return acc;
                }, {})) || {};
          return [
            4 /*yield*/,
            supabase
              .from("patient_photo_verifications")
              .select("*", { count: "exact", head: true })
              .gte("created_at", startDate.toISOString()),
            // Successful verifications
          ];
        case 4:
          verificationAttempts = _a.sent().count;
          return [
            4 /*yield*/,
            supabase
              .from("patient_photo_verifications")
              .select("*", { count: "exact", head: true })
              .eq("verified", true)
              .gte("created_at", startDate.toISOString()),
            // Average confidence scores
          ];
        case 5:
          successfulVerifications = _a.sent().count;
          return [
            4 /*yield*/,
            supabase
              .from("patient_photo_verifications")
              .select("confidence")
              .gte("created_at", startDate.toISOString())
              .not("confidence", "is", null),
          ];
        case 6:
          confidenceData = _a.sent().data;
          avgConfidence = (
            confidenceData === null || confidenceData === void 0
              ? void 0
              : confidenceData.length
          )
            ? confidenceData.reduce((sum, item) => sum + (item.confidence || 0), 0) /
              confidenceData.length
            : 0;
          return [
            4 /*yield*/,
            supabase
              .from("patient_photo_privacy")
              .select("allow_facial_recognition, allow_photo_sharing"),
          ];
        case 7:
          privacyData = _a.sent().data;
          privacyStats = (privacyData === null || privacyData === void 0
            ? void 0
            : privacyData.reduce(
                (acc, privacy) => {
                  acc.facialRecognitionEnabled += privacy.allow_facial_recognition ? 1 : 0;
                  acc.photoSharingEnabled += privacy.allow_photo_sharing ? 1 : 0;
                  acc.total += 1;
                  return acc;
                },
                { facialRecognitionEnabled: 0, photoSharingEnabled: 0, total: 0 },
              )) || { facialRecognitionEnabled: 0, photoSharingEnabled: 0, total: 0 };
          return [
            4 /*yield*/,
            supabase
              .from("patient_photos")
              .select("file_size")
              .gte("created_at", startDate.toISOString()),
          ];
        case 8:
          storageData = _a.sent().data;
          totalStorageUsed =
            (storageData === null || storageData === void 0
              ? void 0
              : storageData.reduce((sum, photo) => sum + (photo.file_size || 0), 0)) || 0;
          return [
            2 /*return*/,
            {
              uploads: {
                total: totalPhotos || 0,
                byType: typeDistribution,
                storageUsed: totalStorageUsed,
              },
              verifications: {
                total: verificationAttempts || 0,
                successful: successfulVerifications || 0,
                successRate: verificationAttempts
                  ? (successfulVerifications || 0) / verificationAttempts
                  : 0,
                averageConfidence: Math.round(avgConfidence * 100) / 100,
              },
              privacy: {
                facialRecognitionOptIn: privacyStats.total
                  ? privacyStats.facialRecognitionEnabled / privacyStats.total
                  : 0,
                photoSharingOptIn: privacyStats.total
                  ? privacyStats.photoSharingEnabled / privacyStats.total
                  : 0,
                totalPatientsWithSettings: privacyStats.total,
              },
            },
          ];
        case 9:
          error_2 = _a.sent();
          console.error("Error getting system photo stats:", error_2);
          return [
            2 /*return*/,
            {
              uploads: { total: 0, byType: {}, storageUsed: 0 },
              verifications: { total: 0, successful: 0, successRate: 0, averageConfidence: 0 },
              privacy: {
                facialRecognitionOptIn: 0,
                photoSharingOptIn: 0,
                totalPatientsWithSettings: 0,
              },
            },
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
