/**
 * AI Duration Prediction API Route
 * POST /api/ai/predict-duration
 *
 * Provides AI-powered appointment duration predictions with A/B testing support
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var duration_prediction_1 = require("@/lib/ai/duration-prediction");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      supabase,
      _a,
      user,
      authError,
      _b,
      userRole,
      roleError,
      aiService,
      abTestService,
      shouldUseAI,
      _testGroup,
      features,
      prediction,
      aiError_1,
      fallbackDuration,
      baselineDuration,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 12, undefined, 13]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          // Validate required fields
          if (!body.appointmentId || !body.treatmentType || !body.professionalId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Missing required fields: appointmentId, treatmentType, professionalId",
                },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .in("role", ["admin", "manager", "scheduler", "professional"])
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (userRole = _b.data), (roleError = _b.error);
          if (roleError || !userRole) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Insufficient permissions" },
                { status: 403 },
              ),
            ];
          }
          aiService = new duration_prediction_1.AIDurationPredictionService();
          abTestService = new duration_prediction_1.AIABTestingService();
          return [4 /*yield*/, abTestService.shouldUseAIPredictions(user.id)];
        case 5:
          shouldUseAI = _c.sent();
          _testGroup = shouldUseAI ? "ai_prediction" : "control";
          features = {
            treatmentType: body.treatmentType,
            professionalId: body.professionalId,
            patientAge: body.patientAge,
            isFirstVisit: body.isFirstVisit,
            patientAnxietyLevel: body.patientAnxietyLevel,
            treatmentComplexity: body.treatmentComplexity,
            timeOfDay: body.timeOfDay,
            dayOfWeek: body.dayOfWeek,
            historicalDuration: body.historicalDuration,
            specialRequirements: body.specialRequirements,
          };
          if (!shouldUseAI) return [3 /*break*/, 10];
          _c.label = 6;
        case 6:
          _c.trys.push([6, 8, undefined, 9]);
          return [4 /*yield*/, aiService.predictDuration(body.appointmentId, features)];
        case 7:
          prediction = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              prediction: {
                predictedDuration: prediction.predictedDuration,
                confidenceScore: prediction.confidenceScore,
                modelVersion: prediction.modelVersion,
                uncertaintyRange: prediction.uncertaintyRange,
                isAIPrediction: true,
                testGroup: "ai_prediction",
              },
            }),
          ];
        case 8:
          aiError_1 = _c.sent();
          // Fallback to baseline if AI prediction fails
          console.error("AI prediction failed, falling back to baseline:", aiError_1);
          fallbackDuration = getFallbackDuration(body.treatmentType);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              fallbackDuration: fallbackDuration,
              prediction: {
                predictedDuration: fallbackDuration,
                confidenceScore: 0.5,
                modelVersion: "fallback",
                uncertaintyRange: {
                  min: Math.round(fallbackDuration * 0.8),
                  max: Math.round(fallbackDuration * 1.2),
                },
                isAIPrediction: false,
                testGroup: "ai_prediction",
              },
            }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          baselineDuration = getFallbackDuration(body.treatmentType);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              prediction: {
                predictedDuration: baselineDuration,
                confidenceScore: 0.5,
                modelVersion: "baseline",
                uncertaintyRange: {
                  min: Math.round(baselineDuration * 0.8),
                  max: Math.round(baselineDuration * 1.2),
                },
                isAIPrediction: false,
                testGroup: "control",
              },
            }),
          ];
        case 11:
          return [3 /*break*/, 13];
        case 12:
          error_1 = _c.sent();
          console.error("AI Duration Prediction API Error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error occurred while processing prediction request",
              },
              { status: 500 },
            ),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get fallback duration for treatment types
 */
function getFallbackDuration(treatmentType) {
  var fallbackDurations = {
    consultation: 30,
    cleaning: 45,
    treatment: 60,
    surgery: 120,
    checkup: 20,
    emergency: 90,
    follow_up: 25,
  };
  return fallbackDurations[treatmentType] || fallbackDurations.consultation;
}
// Handle unsupported HTTP methods
function GET() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json(
        { success: false, error: "Method not allowed. Use POST." },
        { status: 405 },
      ),
    ]);
  });
}
function PUT() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json(
        { success: false, error: "Method not allowed. Use POST." },
        { status: 405 },
      ),
    ]);
  });
}
function DELETE() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json(
        { success: false, error: "Method not allowed. Use POST." },
        { status: 405 },
      ),
    ]);
  });
}
