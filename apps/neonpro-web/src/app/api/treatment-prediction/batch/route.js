"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.POST = POST;
// POST /api/treatment-prediction/batch - Batch prediction generation
var treatment_prediction_1 = require("@/app/lib/services/treatment-prediction");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// POST /api/treatment-prediction/batch - Generate batch predictions
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      body,
      _i,
      _a,
      _b,
      index,
      pred,
      patientIds,
      patients,
      predictionService,
      batchResponse,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, , 8]);
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
          return [
            4 /*yield*/,
            supabase.from("profiles").select("role").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _c.sent().data;
          if (!profile || !["admin", "manager", "practitioner"].includes(profile.role)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Insufficient permissions for batch operations" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          // Validate request
          if (
            !body.predictions ||
            !Array.isArray(body.predictions) ||
            body.predictions.length === 0
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid request: predictions array is required and must not be empty" },
                { status: 400 },
              ),
            ];
          }
          // Limit batch size for performance
          if (body.predictions.length > 100) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Batch size limited to 100 predictions per request" },
                { status: 400 },
              ),
            ];
          }
          // Validate each prediction request
          for (_i = 0, _a = body.predictions.entries(); _i < _a.length; _i++) {
            (_b = _a[_i]), (index = _b[0]), (pred = _b[1]);
            if (!pred.patient_id || !pred.treatment_type) {
              return [
                2 /*return*/,
                server_2.NextResponse.json(
                  {
                    error: "Invalid prediction at index ".concat(
                      index,
                      ": patient_id and treatment_type are required",
                    ),
                  },
                  { status: 400 },
                ),
              ];
            }
          }
          patientIds = body.predictions.map(function (p) {
            return p.patient_id;
          });
          return [4 /*yield*/, supabase.from("patients").select("id").in("id", patientIds)];
        case 5:
          patients = _c.sent().data;
          if (!patients || patients.length !== patientIds.length) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "One or more patients not found" },
                { status: 404 },
              ),
            ];
          }
          predictionService = new treatment_prediction_1.TreatmentPredictionService();
          return [4 /*yield*/, predictionService.generateBatchPredictions(body)];
        case 6:
          batchResponse = _c.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              __assign(__assign({}, batchResponse), {
                message: "Batch prediction completed: ".concat(
                  batchResponse.predictions.length,
                  " predictions generated",
                ),
              }),
              { status: 201 },
            ),
          ];
        case 7:
          error_1 = _c.sent();
          console.error("Error generating batch predictions:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to generate batch predictions" },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
