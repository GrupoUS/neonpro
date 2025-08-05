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
exports.PUT = PUT;
// PUT /api/treatment-prediction/predictions/[id] - Update prediction outcome
var treatment_prediction_1 = require("@/app/lib/services/treatment-prediction");
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
// PUT /api/treatment-prediction/predictions/[id] - Update prediction outcome
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      body,
      validOutcomes,
      prediction,
      predictionService,
      updatedPrediction,
      error_1;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_1.createServerClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          // Validate required fields for outcome update
          if (!body.actual_outcome || !body.outcome_date) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Missing required fields: actual_outcome, outcome_date" },
                { status: 400 },
              ),
            ];
          }
          validOutcomes = ["success", "partial_success", "failure"];
          if (!validOutcomes.includes(body.actual_outcome)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid outcome. Must be: success, partial_success, or failure" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("treatment_predictions")
              .select("id, patient_id")
              .eq("id", params.id)
              .single(),
          ];
        case 4:
          prediction = _c.sent().data;
          if (!prediction) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Prediction not found" }, { status: 404 }),
            ];
          }
          predictionService = new treatment_prediction_1.TreatmentPredictionService();
          return [
            4 /*yield*/,
            predictionService.updatePredictionOutcome(
              params.id,
              body.actual_outcome,
              body.outcome_date,
            ),
          ];
        case 5:
          updatedPrediction = _c.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              prediction: updatedPrediction,
              message: "Prediction outcome updated successfully",
            }),
          ];
        case 6:
          error_1 = _c.sent();
          console.error("Error updating prediction outcome:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to update prediction outcome" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
