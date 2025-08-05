"use strict";
// =====================================================================================
// MARKETING CAMPAIGNS API - INDIVIDUAL CAMPAIGN ROUTE
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var marketing_campaigns_service_1 = require("@/app/lib/services/marketing-campaigns-service");
var server_1 = require("next/server");
// GET /api/marketing/campaigns/[id] - Get campaign by ID
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id, campaign, error_1;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 2, , 3]);
          id = params.id;
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Campaign ID is required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.getCampaignById(id),
          ];
        case 1:
          campaign = _c.sent();
          if (!campaign) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Campaign not found" },
                { status: 404 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: campaign,
            }),
          ];
        case 2:
          error_1 = _c.sent();
          console.error("GET /api/marketing/campaigns/".concat(params.id, " error:"), error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch campaign",
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
// PUT /api/marketing/campaigns/[id] - Update campaign
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id, body, existingCampaign, updatedCampaign, error_2;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          id = params.id;
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Campaign ID is required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.getCampaignById(id),
          ];
        case 2:
          existingCampaign = _c.sent();
          if (!existingCampaign) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Campaign not found" },
                { status: 404 },
              ),
            ];
          }
          // Validate status transitions
          if (
            body.status &&
            existingCampaign.status === "completed" &&
            body.status !== "completed"
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Cannot modify completed campaigns" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.updateCampaign(id, body),
          ];
        case 3:
          updatedCampaign = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedCampaign,
              message: "Campaign updated successfully",
            }),
          ];
        case 4:
          error_2 = _c.sent();
          console.error("PUT /api/marketing/campaigns/".concat(params.id, " error:"), error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to update campaign",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
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
// DELETE /api/marketing/campaigns/[id] - Delete campaign
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id, existingCampaign, error_3;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          id = params.id;
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Campaign ID is required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.getCampaignById(id),
          ];
        case 1:
          existingCampaign = _c.sent();
          if (!existingCampaign) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Campaign not found" },
                { status: 404 },
              ),
            ];
          }
          // Validate deletion (don't allow deletion of active or completed campaigns)
          if (["active", "completed"].includes(existingCampaign.status)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Cannot delete active or completed campaigns. Please cancel first.",
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.deleteCampaign(id),
          ];
        case 2:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Campaign deleted successfully",
            }),
          ];
        case 3:
          error_3 = _c.sent();
          console.error("DELETE /api/marketing/campaigns/".concat(params.id, " error:"), error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to delete campaign",
                message: error_3 instanceof Error ? error_3.message : "Unknown error",
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
