// Marketing Campaigns API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.GET = GET;
exports.POST = POST;
var marketing_campaign_service_1 = require("@/app/lib/services/marketing-campaign-service");
var campaigns_1 = require("@/app/lib/validations/campaigns");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var campaignService = new marketing_campaign_service_1.MarketingCampaignService();
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, searchParams, filters, result, error_1;
    var _a, _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, undefined, 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
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
          searchParams = new URL(request.url).searchParams;
          filters = {
            status: searchParams.get("status")
              ? (_a = searchParams.get("status")) === null || _a === void 0
                ? void 0
                : _a.split(",")
              : undefined,
            campaign_type: searchParams.get("campaign_type")
              ? (_b = searchParams.get("campaign_type")) === null || _b === void 0
                ? void 0
                : _b.split(",")
              : undefined,
            search: searchParams.get("search") || undefined,
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "20"),
            sort: searchParams.get("sort") || "created_at",
            order: searchParams.get("order") || "desc",
            automation_level: searchParams.get("automation_min")
              ? {
                  min: parseFloat(searchParams.get("automation_min") || "0"),
                  max: parseFloat(searchParams.get("automation_max") || "1"),
                }
              : undefined,
            date_range:
              searchParams.get("start_date") && searchParams.get("end_date")
                ? {
                    start: searchParams.get("start_date"),
                    end: searchParams.get("end_date"),
                  }
                : undefined,
          };
          return [4 /*yield*/, campaignService.getCampaigns(filters)];
        case 3:
          result = _c.sent();
          if (!result.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: result.error }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              campaigns: result.data,
              pagination: result.pagination,
              filters: filters,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 4:
          error_1 = _c.sent();
          console.error("Error in campaigns GET:", error_1);
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, body, validationResult, campaignData, result, error_2;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validationResult = campaigns_1.CreateCampaignSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Validation failed",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          campaignData = __assign(__assign({}, validationResult.data), {
            created_by: session.user.id,
            clinic_id:
              ((_a = session.user.user_metadata) === null || _a === void 0
                ? void 0
                : _a.clinic_id) || "default",
          });
          // Ensure automation level is ≥80% as per Epic 7.2 requirements
          if (campaignData.automation_level < 0.8) {
            campaignData.automation_level = 0.8;
          }
          return [4 /*yield*/, campaignService.createCampaign(campaignData)];
        case 4:
          result = _b.sent();
          if (!result.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: result.error }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                message: "Campaign created successfully",
                campaign: result.data,
                timestamp: new Date().toISOString(),
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _b.sent();
          console.error("Error in campaigns POST:", error_2);
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
