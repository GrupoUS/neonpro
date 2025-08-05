"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
// GET /api/treatment-prediction/models - Get prediction models
var treatment_prediction_1 = require("@/app/lib/services/treatment-prediction");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, supabase, session, filters, predictionService, models, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          return [4 /*yield*/, (0, server_1.createServerClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          filters = {};
          if (searchParams.get("status")) {
            filters.status = searchParams.get("status");
          }
          if (searchParams.get("algorithm_type")) {
            filters.algorithm_type = searchParams.get("algorithm_type");
          }
          if (searchParams.get("accuracy_min")) {
            filters.accuracy_min = parseFloat(searchParams.get("accuracy_min"));
          }
          if (searchParams.get("version")) {
            filters.version = searchParams.get("version");
          }
          if (searchParams.get("created_from")) {
            filters.created_from = searchParams.get("created_from");
          }
          if (searchParams.get("created_to")) {
            filters.created_to = searchParams.get("created_to");
          }
          predictionService = new treatment_prediction_1.TreatmentPredictionService();
          return [4 /*yield*/, predictionService.getModels(filters)];
        case 3:
          models = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              models: models,
              total: models.length,
            }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Error fetching prediction models:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to fetch prediction models" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/treatment-prediction/models - Create new model
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, profile, body, predictionService, model, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_1.createServerClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("role").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _a.sent().data;
          if (!profile || !["admin", "manager"].includes(profile.role)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _a.sent();
          // Validate required fields
          if (!body.name || !body.algorithm_type) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Missing required fields: name, algorithm_type" },
                { status: 400 },
              ),
            ];
          }
          predictionService = new treatment_prediction_1.TreatmentPredictionService();
          return [4 /*yield*/, predictionService.createModel(body)];
        case 5:
          model = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                model: model,
                message: "Prediction model created successfully",
              },
              { status: 201 },
            ),
          ];
        case 6:
          error_2 = _a.sent();
          console.error("Error creating prediction model:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to create prediction model" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
