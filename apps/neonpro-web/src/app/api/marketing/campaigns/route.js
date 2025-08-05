"use strict";
// =====================================================================================
// MARKETING CAMPAIGNS API - CAMPAIGNS ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================
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
var marketing_campaigns_service_1 = require("@/app/lib/services/marketing-campaigns-service");
var server_1 = require("next/server");
// GET /api/marketing/campaigns - List campaigns with filters
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, filters_1, campaigns, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          filters_1 = {
            status:
              (_a = searchParams.get("status")) === null || _a === void 0 ? void 0 : _a.split(","),
            type:
              (_b = searchParams.get("type")) === null || _b === void 0 ? void 0 : _b.split(","),
            clinicId: searchParams.get("clinic_id") || undefined,
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")) : undefined,
            offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")) : undefined,
          };
          // Remove undefined values
          Object.keys(filters_1).forEach(function (key) {
            if (filters_1[key] === undefined) {
              delete filters_1[key];
            }
          });
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.getCampaigns(filters_1),
          ];
        case 1:
          campaigns = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: campaigns,
              total: campaigns.length,
              filters: filters_1,
            }),
          ];
        case 2:
          error_1 = _c.sent();
          console.error("GET /api/marketing/campaigns error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch campaigns",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/marketing/campaigns - Create new campaign
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      requiredFields,
      _i,
      requiredFields_1,
      field,
      validCampaignTypes,
      validTriggerTypes,
      campaignData,
      campaign,
      error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          requiredFields = [
            "name",
            "campaignType",
            "content",
            "triggerType",
            "createdBy",
            "clinicId",
          ];
          for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            field = requiredFields_1[_i];
            if (!body[field]) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    success: false,
                    error: "Missing required field: ".concat(field),
                  },
                  { status: 400 },
                ),
              ];
            }
          }
          validCampaignTypes = [
            "email",
            "sms",
            "whatsapp",
            "push_notification",
            "in_app",
            "multi_channel",
          ];
          if (!validCampaignTypes.includes(body.campaignType)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Invalid campaign type. Must be one of: ".concat(
                    validCampaignTypes.join(", "),
                  ),
                },
                { status: 400 },
              ),
            ];
          }
          validTriggerTypes = [
            "manual",
            "scheduled",
            "event_based",
            "segment_entry",
            "segment_exit",
            "behavioral",
            "date_based",
            "lifecycle_stage",
          ];
          if (!validTriggerTypes.includes(body.triggerType)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Invalid trigger type. Must be one of: ".concat(
                    validTriggerTypes.join(", "),
                  ),
                },
                { status: 400 },
              ),
            ];
          }
          campaignData = {
            name: body.name,
            description: body.description,
            campaignType: body.campaignType,
            status: body.status || "draft",
            priority: body.priority || "normal",
            targetSegments: body.targetSegments || [],
            includeCriteria: body.includeCriteria,
            excludeCriteria: body.excludeCriteria,
            scheduledStart: body.scheduledStart ? new Date(body.scheduledStart) : undefined,
            scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : undefined,
            timezone: body.timezone || "America/Sao_Paulo",
            templateId: body.templateId,
            subject: body.subject,
            content: body.content,
            personalizationLevel: body.personalizationLevel || "basic",
            personalizationData: body.personalizationData || {},
            triggerType: body.triggerType,
            triggerConfig: body.triggerConfig,
            autoOptimization: body.autoOptimization || false,
            requiresConsent: body.requiresConsent !== false, // Default to true
            consentTypes: body.consentTypes || [],
            respectUnsubscribe: body.respectUnsubscribe !== false, // Default to true
            createdBy: body.createdBy,
            clinicId: body.clinicId,
          };
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.createCampaign(campaignData),
          ];
        case 2:
          campaign = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: campaign,
                message: "Campaign created successfully",
              },
              { status: 201 },
            ),
          ];
        case 3:
          error_2 = _a.sent();
          console.error("POST /api/marketing/campaigns error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to create campaign",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
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
