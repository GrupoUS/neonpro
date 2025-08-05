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
var profile_manager_1 = require("@/lib/patients/profile-manager");
var patient_insights_1 = require("@/lib/ai/patient-insights");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Initialize services
var profileManager = new profile_manager_1.ProfileManager();
var patientInsights = new patient_insights_1.PatientInsights();
// Validation schemas
var CreateProfileSchema = zod_1.z.object({
  patient_id: zod_1.z.string().min(1),
  user_id: zod_1.z.string().min(1),
  demographics: zod_1.z.object({
    name: zod_1.z.string().min(1),
    date_of_birth: zod_1.z.string(),
    gender: zod_1.z.enum(["male", "female", "other"]),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().optional(),
  }),
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
var SearchSchema = zod_1.z.object({
  name: zod_1.z.string().optional(),
  phone: zod_1.z.string().optional(),
  email: zod_1.z.string().optional(),
  conditions: zod_1.z.array(zod_1.z.string()).optional(),
  min_completeness: zod_1.z.number().min(0).max(1).optional(),
});
/**
 * POST /api/patients/profile - Create patient profile
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, body, validatedData, profile, insights, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData = CreateProfileSchema.parse(body);
          return [4 /*yield*/, profileManager.createPatientProfile(validatedData)];
        case 4:
          profile = _b.sent();
          if (!profile) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to create patient profile" },
                { status: 500 },
              ),
            ];
          }
          return [4 /*yield*/, patientInsights.generateComprehensiveInsights(profile)];
        case 5:
          insights = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              profile: profile,
              insights: insights,
              message: "Patient profile created successfully",
            }),
          ];
        case 6:
          error_1 = _b.sent();
          console.error("Error creating patient profile:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET /api/patients/profile - Search patient profiles
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, searchParams, searchData, validatedSearch, profiles, error_2;
    var _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
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
          searchParams = new URL(request.url).searchParams;
          searchData = {
            name: searchParams.get("name") || undefined,
            phone: searchParams.get("phone") || undefined,
            email: searchParams.get("email") || undefined,
            conditions:
              ((_b = searchParams.get("conditions")) === null || _b === void 0
                ? void 0
                : _b.split(",")) || undefined,
            min_completeness: searchParams.get("min_completeness")
              ? parseFloat(searchParams.get("min_completeness"))
              : undefined,
          };
          validatedSearch = SearchSchema.parse(searchData);
          return [4 /*yield*/, profileManager.searchPatients(validatedSearch)];
        case 3:
          profiles = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              profiles: profiles,
              count: profiles.length,
              message: "Patient profiles retrieved successfully",
            }),
          ];
        case 4:
          error_2 = _c.sent();
          console.error("Error searching patient profiles:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid search parameters", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
