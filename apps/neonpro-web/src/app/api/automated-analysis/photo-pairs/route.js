"use strict";
// app/api/automated-analysis/photo-pairs/route.ts
// API endpoints for before/after photo pairs management
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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var automated_before_after_analysis_1 = require("@/app/lib/services/automated-before-after-analysis");
var automated_before_after_analysis_2 = require("@/app/lib/validations/automated-before-after-analysis");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// GET /api/automated-analysis/photo-pairs - Get photo pairs with filters
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, filters, validatedFilters, photoPairs, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
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
          searchParams = request.nextUrl.searchParams;
          filters = {
            session_id: searchParams.get("session_id") || undefined,
            treatment_area: searchParams.get("treatment_area") || undefined,
            pair_type: searchParams.get("pair_type") || undefined,
            analysis_status: searchParams.get("analysis_status") || undefined,
            improvement_min: searchParams.get("improvement_min")
              ? Number(searchParams.get("improvement_min"))
              : undefined,
            time_between_min: searchParams.get("time_between_min")
              ? Number(searchParams.get("time_between_min"))
              : undefined,
            time_between_max: searchParams.get("time_between_max")
              ? Number(searchParams.get("time_between_max"))
              : undefined,
          };
          validatedFilters =
            automated_before_after_analysis_2.validationSchemas.photoPairFilters.parse(filters);
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().getPhotoPairs(
              validatedFilters,
            ),
          ];
        case 3:
          photoPairs = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: photoPairs,
              count: photoPairs.length,
            }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Error fetching photo pairs:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to fetch photo pairs",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/automated-analysis/photo-pairs - Create new photo pair
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validatedData, photoPair, error_2;
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
          validatedData =
            automated_before_after_analysis_2.validationSchemas.createPhotoPair.parse(body);
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().createPhotoPair(
              validatedData,
            ),
          ];
        case 4:
          photoPair = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: true,
                data: photoPair,
                message: "Photo pair created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _a.sent();
          console.error("Error creating photo pair:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to create photo pair",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
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
// PUT /api/automated-analysis/photo-pairs - Update photo pair
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, id, updates, validatedUpdates, updatedPhotoPair, error_3;
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
          (id = body.id), (updates = __rest(body, ["id"]));
          if (!id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Photo pair ID is required" }, { status: 400 }),
            ];
          }
          validatedUpdates =
            automated_before_after_analysis_2.validationSchemas.updatePhotoPair.parse(updates);
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().updatePhotoPair(
              id,
              validatedUpdates,
            ),
          ];
        case 4:
          updatedPhotoPair = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: updatedPhotoPair,
              message: "Photo pair updated successfully",
            }),
          ];
        case 5:
          error_3 = _a.sent();
          console.error("Error updating photo pair:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to update photo pair",
                details: error_3 instanceof Error ? error_3.message : "Unknown error",
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
// DELETE /api/automated-analysis/photo-pairs - Delete photo pair
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, id, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
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
          searchParams = request.nextUrl.searchParams;
          id = searchParams.get("id");
          if (!id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Photo pair ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().deletePhotoPair(
              id,
            ),
          ];
        case 3:
          _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Photo pair deleted successfully",
            }),
          ];
        case 4:
          error_4 = _a.sent();
          console.error("Error deleting photo pair:", error_4);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to delete photo pair",
                details: error_4 instanceof Error ? error_4.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
