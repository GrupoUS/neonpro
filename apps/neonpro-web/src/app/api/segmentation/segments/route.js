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
var patient_segmentation_service_1 = require("@/app/lib/services/patient-segmentation-service");
var segmentation_1 = require("@/app/lib/validations/segmentation");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, isActive, segmentType, query, _a, segments, error, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          searchParams = new URL(request.url).searchParams;
          isActive = searchParams.get("is_active");
          segmentType = searchParams.get("segment_type");
          query = supabase
            .from("patient_segments")
            .select(
              "\n        id,\n        name,\n        description,\n        segment_type,\n        is_active,\n        created_at,\n        ai_generated,\n        criteria,\n        accuracy_score,\n        member_count\n      ",
            );
          if (isActive !== null) {
            query = query.eq("is_active", isActive === "true");
          }
          if (segmentType) {
            query = query.eq("segment_type", segmentType);
          }
          return [4 /*yield*/, query];
        case 2:
          (_a = _b.sent()), (segments = _a.data), (error = _a.error);
          if (error) {
            console.error("Database error:", error);
            throw error;
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: segments || [],
              total: (segments === null || segments === void 0 ? void 0 : segments.length) || 0,
            }),
          ];
        case 3:
          error_1 = _b.sent();
          console.error("Error fetching patient segments:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to fetch patient segments",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validationResult, segmentData, segment, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validationResult = segmentation_1.CreateSegmentSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid input", details: validationResult.error.issues },
                { status: 400 },
              ),
            ];
          }
          segmentData = {
            segment_name: validationResult.data.name,
            description: validationResult.data.description,
            criteria: validationResult.data.criteria, // Type casting for compatibility
            segment_type: validationResult.data.segment_type,
            ai_model: undefined,
            expected_accuracy: undefined,
          };
          return [
            4 /*yield*/,
            (0, patient_segmentation_service_1.createpatientSegmentationService)().createAISegment(
              segmentData,
            ),
          ];
        case 4:
          segment = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: true,
                data: segment,
                message: "AI-powered segment created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _a.sent();
          console.error("Error creating patient segment:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to create patient segment" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
