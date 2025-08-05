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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var communication_service_1 = require("@/app/lib/services/communication-service");
// Input schemas
var CreateTemplateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Template name is required"),
  category: zod_1.z.string().min(1, "Template category is required"),
  subject: zod_1.z.string().optional(),
  body: zod_1.z.string().min(1, "Template body is required"),
  variables: zod_1.z.array(zod_1.z.string()).default([]),
  default_channel: zod_1.z.enum(["sms", "email", "whatsapp", "system"]).optional(),
  is_active: zod_1.z.boolean().default(true),
  scheduling: zod_1.z
    .object({
      type: zod_1.z.enum(["immediate", "scheduled", "business_hours"]).default("immediate"),
      days_of_week: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(),
      time_start: zod_1.z.string().optional(),
      time_end: zod_1.z.string().optional(),
      timezone: zod_1.z.string().optional(),
    })
    .optional(),
});
var _UpdateTemplateSchema = CreateTemplateSchema.partial();
var QuerySchema = zod_1.z.object({
  category: zod_1.z.string().optional(),
  active: zod_1.z.string().optional(),
  search: zod_1.z.string().optional(),
  page: zod_1.z.string().optional(),
  limit: zod_1.z.string().optional(),
  sort: zod_1.z.string().optional(),
  order: zod_1.z.enum(["asc", "desc"]).optional(),
});
/**
 * GET /api/communication/templates
 * Retrieve message templates with filtering and pagination
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      url,
      queryParams,
      validatedQuery,
      category,
      active,
      search,
      _a,
      page,
      _b,
      limit,
      _c,
      sort,
      _d,
      order,
      filters,
      pageNum,
      limitNum,
      offset,
      profile,
      communicationService,
      result,
      error_1;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _e.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery = QuerySchema.parse(queryParams);
          (category = validatedQuery.category),
            (active = validatedQuery.active),
            (search = validatedQuery.search),
            (_a = validatedQuery.page),
            (page = _a === void 0 ? "1" : _a),
            (_b = validatedQuery.limit),
            (limit = _b === void 0 ? "20" : _b),
            (_c = validatedQuery.sort),
            (sort = _c === void 0 ? "name" : _c),
            (_d = validatedQuery.order),
            (order = _d === void 0 ? "asc" : _d);
          filters = {};
          if (category) {
            filters.category = category;
          }
          if (active !== undefined) {
            filters.is_active = active === "true";
          }
          if (search) {
            filters.search = search;
          }
          pageNum = Math.max(1, parseInt(page));
          limitNum = Math.min(100, Math.max(1, parseInt(limit)));
          offset = (pageNum - 1) * limitNum;
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _e.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found", code: "CLINIC_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          communicationService = new communication_service_1.CommunicationService(
            supabase,
            profile.clinic_id,
          );
          return [
            4 /*yield*/,
            communicationService.getTemplates(
              __assign(__assign({}, filters), {
                limit: limitNum,
                offset: offset,
                sort_by: sort,
                sort_order: order,
              }),
            ),
          ];
        case 4:
          result = _e.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                templates: result.templates,
                pagination: {
                  total: result.total,
                  page: pageNum,
                  limit: limitNum,
                  pages: Math.ceil(result.total / limitNum),
                  has_next: pageNum * limitNum < result.total,
                  has_prev: pageNum > 1,
                },
              },
            }),
          ];
        case 5:
          error_1 = _e.sent();
          console.error("Error fetching templates:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid query parameters",
                  code: "VALIDATION_ERROR",
                  details: error_1.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to fetch templates",
                code: "FETCH_ERROR",
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
/**
 * POST /api/communication/templates
 * Create a new message template
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      validatedData,
      profile,
      communicationService,
      existingTemplate,
      template,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 7, undefined, 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validatedData = CreateTemplateSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _a.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found", code: "CLINIC_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          communicationService = new communication_service_1.CommunicationService(
            supabase,
            profile.clinic_id,
          );
          return [4 /*yield*/, communicationService.getTemplateByName(validatedData.name)];
        case 5:
          existingTemplate = _a.sent();
          if (existingTemplate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Template name already exists",
                  code: "TEMPLATE_EXISTS",
                },
                { status: 409 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            communicationService.createTemplate(
              __assign(__assign({}, validatedData), { created_by: session.user.id }),
            ),
          ];
        case 6:
          template = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: { template: template },
                message: "Template created successfully",
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_2 = _a.sent();
          console.error("Error creating template:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid template data",
                  code: "VALIDATION_ERROR",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to create template",
                code: "CREATE_ERROR",
              },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/communication/templates
 * Bulk update templates (activate/deactivate multiple)
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      template_ids,
      is_active,
      profile,
      communicationService,
      updatedTemplates,
      error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, undefined, 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          (template_ids = body.template_ids), (is_active = body.is_active);
          if (!Array.isArray(template_ids) || template_ids.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template IDs array is required", code: "INVALID_INPUT" },
                { status: 400 },
              ),
            ];
          }
          if (typeof is_active !== "boolean") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "is_active must be boolean", code: "INVALID_INPUT" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _a.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found", code: "CLINIC_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          communicationService = new communication_service_1.CommunicationService(
            supabase,
            profile.clinic_id,
          );
          return [
            4 /*yield*/,
            communicationService.bulkUpdateTemplates(template_ids, {
              is_active: is_active,
              updated_by: session.user.id,
            }),
          ];
        case 5:
          updatedTemplates = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: { templates: updatedTemplates },
              message: "".concat(updatedTemplates.length, " template(s) updated successfully"),
            }),
          ];
        case 6:
          error_3 = _a.sent();
          console.error("Error bulk updating templates:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to update templates",
                code: "UPDATE_ERROR",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/communication/templates
 * Bulk delete templates
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      template_ids,
      profile,
      communicationService,
      templatesInUse,
      error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 7, undefined, 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          template_ids = body.template_ids;
          if (!Array.isArray(template_ids) || template_ids.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template IDs array is required", code: "INVALID_INPUT" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _a.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found", code: "CLINIC_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          communicationService = new communication_service_1.CommunicationService(
            supabase,
            profile.clinic_id,
          );
          return [4 /*yield*/, communicationService.checkTemplatesInUse(template_ids)];
        case 5:
          templatesInUse = _a.sent();
          if (templatesInUse.length > 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Some templates are currently in use",
                  code: "TEMPLATES_IN_USE",
                  details: { templates_in_use: templatesInUse },
                },
                { status: 409 },
              ),
            ];
          }
          // Delete templates
          return [4 /*yield*/, communicationService.deleteTemplates(template_ids)];
        case 6:
          // Delete templates
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "".concat(template_ids.length, " template(s) deleted successfully"),
            }),
          ];
        case 7:
          error_4 = _a.sent();
          console.error("Error deleting templates:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to delete templates",
                code: "DELETE_ERROR",
              },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
