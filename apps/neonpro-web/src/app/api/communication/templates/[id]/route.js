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
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.POST = POST;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var communication_service_1 = require("@/app/lib/services/communication-service");
// Input schemas
var UpdateTemplateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Template name is required").optional(),
  category: zod_1.z.string().min(1, "Template category is required").optional(),
  subject: zod_1.z.string().optional(),
  body: zod_1.z.string().min(1, "Template body is required").optional(),
  variables: zod_1.z.array(zod_1.z.string()).optional(),
  default_channel: zod_1.z.enum(["sms", "email", "whatsapp", "system"]).optional(),
  is_active: zod_1.z.boolean().optional(),
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
/**
 * GET /api/communication/templates/[id]
 * Get a specific template by ID
 */
function GET(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (_request, _b) {
    var supabase, session, templateId, profile, communicationService, template, error_1;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, undefined, 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          templateId = params.id;
          if (!templateId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template ID is required", code: "INVALID_ID" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 2:
          profile = _c.sent().data;
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
          return [4 /*yield*/, communicationService.getTemplate(templateId)];
        case 3:
          template = _c.sent();
          if (!template) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template not found", code: "TEMPLATE_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: { template: template },
            }),
          ];
        case 4:
          error_1 = _c.sent();
          console.error("Error fetching template:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to fetch template",
                code: "FETCH_ERROR",
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
/**
 * PUT /api/communication/templates/[id]
 * Update a specific template
 */
function PUT(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      templateId,
      body,
      validatedData,
      profile,
      communicationService,
      existingTemplate,
      nameConflict,
      updatedTemplate,
      error_2;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 8, undefined, 9]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          templateId = params.id;
          if (!templateId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template ID is required", code: "INVALID_ID" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _c.sent();
          validatedData = UpdateTemplateSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _c.sent().data;
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
          return [4 /*yield*/, communicationService.getTemplate(templateId)];
        case 4:
          existingTemplate = _c.sent();
          if (!existingTemplate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template not found", code: "TEMPLATE_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          if (!(validatedData.name && validatedData.name !== existingTemplate.name))
            return [3 /*break*/, 6];
          return [4 /*yield*/, communicationService.getTemplateByName(validatedData.name)];
        case 5:
          nameConflict = _c.sent();
          if (nameConflict && nameConflict.id !== templateId) {
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
          _c.label = 6;
        case 6:
          return [
            4 /*yield*/,
            communicationService.updateTemplate(
              templateId,
              __assign(__assign({}, validatedData), { updated_by: session.user.id }),
            ),
          ];
        case 7:
          updatedTemplate = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: { template: updatedTemplate },
              message: "Template updated successfully",
            }),
          ];
        case 8:
          error_2 = _c.sent();
          console.error("Error updating template:", error_2);
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
                error: "Failed to update template",
                code: "UPDATE_ERROR",
              },
              { status: 500 },
            ),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/communication/templates/[id]
 * Delete a specific template
 */
function DELETE(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (_request, _b) {
    var supabase,
      session,
      templateId,
      profile,
      communicationService,
      existingTemplate,
      templatesInUse,
      error_3;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, undefined, 7]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          templateId = params.id;
          if (!templateId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template ID is required", code: "INVALID_ID" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 2:
          profile = _c.sent().data;
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
          return [4 /*yield*/, communicationService.getTemplate(templateId)];
        case 3:
          existingTemplate = _c.sent();
          if (!existingTemplate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template not found", code: "TEMPLATE_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          return [4 /*yield*/, communicationService.checkTemplatesInUse([templateId])];
        case 4:
          templatesInUse = _c.sent();
          if (templatesInUse.length > 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Template is currently in use",
                  code: "TEMPLATE_IN_USE",
                },
                { status: 409 },
              ),
            ];
          }
          // Delete template
          return [4 /*yield*/, communicationService.deleteTemplate(templateId)];
        case 5:
          // Delete template
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Template deleted successfully",
            }),
          ];
        case 6:
          error_3 = _c.sent();
          console.error("Error deleting template:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to delete template",
                code: "DELETE_ERROR",
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
 * POST /api/communication/templates/[id]/duplicate
 * Duplicate a template
 */
function POST(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      templateId,
      body,
      name_1,
      profile,
      communicationService,
      sourceTemplate,
      nameConflict,
      duplicatedTemplate,
      error_4;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, undefined, 8]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authentication required", code: "AUTH_REQUIRED" },
                { status: 401 },
              ),
            ];
          }
          templateId = params.id;
          if (!templateId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template ID is required", code: "INVALID_ID" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _c.sent();
          name_1 = body.name;
          if (!name_1 || typeof name_1 !== "string") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "New template name is required", code: "INVALID_NAME" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _c.sent().data;
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
          return [4 /*yield*/, communicationService.getTemplate(templateId)];
        case 4:
          sourceTemplate = _c.sent();
          if (!sourceTemplate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Source template not found", code: "TEMPLATE_NOT_FOUND" },
                { status: 404 },
              ),
            ];
          }
          return [4 /*yield*/, communicationService.getTemplateByName(name_1)];
        case 5:
          nameConflict = _c.sent();
          if (nameConflict) {
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
            communicationService.duplicateTemplate(templateId, name_1, session.user.id),
          ];
        case 6:
          duplicatedTemplate = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: { template: duplicatedTemplate },
                message: "Template duplicated successfully",
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_4 = _c.sent();
          console.error("Error duplicating template:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to duplicate template",
                code: "DUPLICATE_ERROR",
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
