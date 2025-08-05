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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("@/app/utils/supabase/server");
var patient_insights_1 = require("@/lib/ai/patient-insights");
var profile_manager_1 = require("@/lib/patients/profile-manager");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Initialize services
var profileManager = new profile_manager_1.ProfileManager();
var patientInsights = new patient_insights_1.PatientInsights();
// Validation schema for updates
var UpdateProfileSchema = zod_1.z.object({
  demographics: zod_1.z
    .object({
      name: zod_1.z.string().optional(),
      phone: zod_1.z.string().optional(),
      email: zod_1.z.string().email().optional(),
      address: zod_1.z.string().optional(),
    })
    .optional(),
  medical_history: zod_1.z
    .object({
      allergies: zod_1.z.array(zod_1.z.string()).optional(),
      conditions: zod_1.z.array(zod_1.z.string()).optional(),
      medications: zod_1.z.array(zod_1.z.string()).optional(),
      surgeries: zod_1.z.array(zod_1.z.string()).optional(),
    })
    .optional(),
  preferences: zod_1.z
    .object({
      language: zod_1.z.string().optional(),
      timezone: zod_1.z.string().optional(),
      communication_method: zod_1.z.enum(["email", "sms", "phone", "in_app"]).optional(),
      appointment_reminders: zod_1.z.boolean().optional(),
    })
    .optional(),
  emergency_contact: zod_1.z
    .object({
      name: zod_1.z.string().optional(),
      relationship: zod_1.z.string().optional(),
      phone: zod_1.z.string().optional(),
    })
    .optional(),
});
/**
 * GET /api/patients/profile/[id] - Get specific patient profile
 */
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, patientId, _c, user, authError, profile, error_1;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, , 5]);
          supabase = (0, server_1.createClient)();
          return [4 /*yield*/, params];
        case 1:
          patientId = _d.sent().id;
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, profileManager.getPatientProfile(patientId)];
        case 3:
          profile = _d.sent();
          if (!profile) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Patient not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ profile: profile })];
        case 4:
          error_1 = _d.sent();
          console.error("Error getting patient profile:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/patients/profile/[id] - Update patient profile
 */
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, patientId, _c, user, authError, body, validatedData, updatedProfile, error_2;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          supabase = (0, server_1.createClient)();
          return [4 /*yield*/, params];
        case 1:
          patientId = _d.sent().id;
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          validatedData = UpdateProfileSchema.parse(body);
          return [4 /*yield*/, profileManager.updatePatientProfile(patientId, validatedData)];
        case 4:
          updatedProfile = _d.sent();
          if (!updatedProfile) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Patient not found" }, { status: 404 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              profile: updatedProfile,
              message: "Profile updated successfully",
            }),
          ];
        case 5:
          error_2 = _d.sent();
          console.error("Error updating patient profile:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid data format", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/patients/profile/[id] - Archive patient profile
 */
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, patientId, _c, user, authError, archived, error_3;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, , 5]);
          supabase = (0, server_1.createClient)();
          return [4 /*yield*/, params];
        case 1:
          patientId = _d.sent().id;
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, profileManager.archivePatientProfile(patientId)];
        case 3:
          archived = _d.sent();
          if (!archived) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Patient not found" }, { status: 404 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              message: "Patient profile archived successfully",
            }),
          ];
        case 4:
          error_3 = _d.sent();
          console.error("Error archiving patient profile:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
