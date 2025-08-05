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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var compliance_manager_1 = require("@/lib/lgpd/compliance-manager");
// Validation schemas
var requestCreateSchema = zod_1.z.object({
  requestType: zod_1.z.enum(["access", "rectification", "deletion", "portability", "objection"]),
  description: zod_1.z.string().min(10).max(1000),
  specificData: zod_1.z.string().optional(),
  urgency: zod_1.z.enum(["low", "medium", "high"]).default("medium"),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var requestUpdateSchema = zod_1.z.object({
  status: zod_1.z.enum(["pending", "in_progress", "completed", "rejected"]).optional(),
  adminNotes: zod_1.z.string().optional(),
  responseData: zod_1.z.record(zod_1.z.any()).optional(),
  rejectionReason: zod_1.z.string().optional(),
});
var requestQuerySchema = zod_1.z.object({
  userId: zod_1.z.string().uuid().optional(),
  requestType: zod_1.z
    .enum(["access", "rectification", "deletion", "portability", "objection"])
    .optional(),
  status: zod_1.z.enum(["pending", "in_progress", "completed", "rejected"]).optional(),
  urgency: zod_1.z.enum(["low", "medium", "high"]).optional(),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
// GET /api/lgpd/data-subject-rights - Get user requests or admin view
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      url,
      queryParams,
      validatedQuery,
      profile,
      isAdmin,
      targetUserId,
      query,
      _b,
      requests,
      requestsError,
      countQuery,
      totalCount,
      complianceManager,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 8, , 9]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery = requestQuerySchema.parse(queryParams);
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _c.sent().data;
          isAdmin = (profile === null || profile === void 0 ? void 0 : profile.role) === "admin";
          targetUserId = isAdmin && validatedQuery.userId ? validatedQuery.userId : user.id;
          query = supabase
            .from("lgpd_data_subject_requests")
            .select(
              "\n        id,\n        user_id,\n        request_type,\n        status,\n        description,\n        specific_data,\n        urgency,\n        admin_notes,\n        response_data,\n        rejection_reason,\n        due_date,\n        completed_at,\n        created_at,\n        updated_at\n      ",
            );
          // Apply filters
          if (!isAdmin || !validatedQuery.userId) {
            query = query.eq("user_id", targetUserId);
          } else if (validatedQuery.userId) {
            query = query.eq("user_id", validatedQuery.userId);
          }
          if (validatedQuery.requestType) {
            query = query.eq("request_type", validatedQuery.requestType);
          }
          if (validatedQuery.status) {
            query = query.eq("status", validatedQuery.status);
          }
          if (validatedQuery.urgency) {
            query = query.eq("urgency", validatedQuery.urgency);
          }
          if (validatedQuery.startDate) {
            query = query.gte("created_at", validatedQuery.startDate);
          }
          if (validatedQuery.endDate) {
            query = query.lte("created_at", validatedQuery.endDate);
          }
          return [
            4 /*yield*/,
            query
              .order("created_at", { ascending: false })
              .range(
                (validatedQuery.page - 1) * validatedQuery.limit,
                validatedQuery.page * validatedQuery.limit - 1,
              ),
          ];
        case 4:
          (_b = _c.sent()), (requests = _b.data), (requestsError = _b.error);
          if (requestsError) {
            throw new Error("Failed to fetch requests: ".concat(requestsError.message));
          }
          countQuery = supabase
            .from("lgpd_data_subject_requests")
            .select("*", { count: "exact", head: true });
          if (!isAdmin || !validatedQuery.userId) {
            countQuery = countQuery.eq("user_id", targetUserId);
          } else if (validatedQuery.userId) {
            countQuery = countQuery.eq("user_id", validatedQuery.userId);
          }
          return [
            4 /*yield*/,
            countQuery,
            // Log access if admin viewing other user's data
          ];
        case 5:
          totalCount = _c.sent().count;
          if (!(isAdmin && validatedQuery.userId && validatedQuery.userId !== user.id))
            return [3 /*break*/, 7];
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: "admin_action",
              userId: user.id,
              description: "Admin accessed user data subject requests",
              details: "Admin viewed requests for user ".concat(validatedQuery.userId),
              metadata: {
                target_user_id: validatedQuery.userId,
                query_params: validatedQuery,
              },
            }),
          ];
        case 6:
          _c.sent();
          _c.label = 7;
        case 7:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                requests: requests,
                pagination: {
                  page: validatedQuery.page,
                  limit: validatedQuery.limit,
                  total: totalCount || 0,
                  totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit),
                },
              },
            }),
          ];
        case 8:
          error_1 = _c.sent();
          console.error("LGPD Data Subject Rights GET Error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid query parameters", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/lgpd/data-subject-rights - Create new request
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, body, validatedData, complianceManager, dsrRequest, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData = requestCreateSchema.parse(body);
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          return [
            4 /*yield*/,
            complianceManager.createDataSubjectRequest({
              userId: user.id,
              requestType: validatedData.requestType,
              description: validatedData.description,
              specificData: validatedData.specificData,
              urgency: validatedData.urgency,
              metadata: validatedData.metadata,
            }),
          ];
        case 4:
          dsrRequest = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: dsrRequest,
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _b.sent();
          console.error("LGPD Data Subject Rights POST Error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// PUT /api/lgpd/data-subject-rights - Update request (admin only)
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      body,
      validatedData,
      url,
      requestId,
      existingRequest,
      complianceManager,
      result,
      updateData,
      _b,
      updatedRequest,
      updateError,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _c.sent().data;
          if ((profile === null || profile === void 0 ? void 0 : profile.role) !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          validatedData = requestUpdateSchema.parse(body);
          url = new URL(request.url);
          requestId = url.searchParams.get("id");
          if (!requestId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Request ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("lgpd_data_subject_requests").select("*").eq("id", requestId).single(),
          ];
        case 5:
          existingRequest = _c.sent().data;
          if (!existingRequest) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Request not found" }, { status: 404 }),
            ];
          }
          complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
          if (!(validatedData.status === "completed")) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            complianceManager.processDataSubjectRequest(requestId, {
              responseData: validatedData.responseData,
              adminNotes: validatedData.adminNotes,
            }),
          ];
        case 6:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
            }),
          ];
        case 7:
          updateData = {
            updated_at: new Date().toISOString(),
          };
          if (validatedData.status) {
            updateData.status = validatedData.status;
            if (validatedData.status === "rejected" && validatedData.rejectionReason) {
              updateData.rejection_reason = validatedData.rejectionReason;
            }
            if (validatedData.status === "completed") {
              updateData.completed_at = new Date().toISOString();
            }
          }
          if (validatedData.adminNotes) {
            updateData.admin_notes = validatedData.adminNotes;
          }
          if (validatedData.responseData) {
            updateData.response_data = validatedData.responseData;
          }
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_data_subject_requests")
              .update(updateData)
              .eq("id", requestId)
              .select()
              .single(),
          ];
        case 8:
          (_b = _c.sent()), (updatedRequest = _b.data), (updateError = _b.error);
          if (updateError) {
            throw new Error("Failed to update request: ".concat(updateError.message));
          }
          // Log the update
          return [
            4 /*yield*/,
            complianceManager.logAuditEvent({
              eventType: "admin_action",
              userId: user.id,
              description: "Data subject request updated",
              details: "Request ".concat(requestId, " updated by admin"),
              metadata: {
                request_id: requestId,
                request_type: existingRequest.request_type,
                old_status: existingRequest.status,
                new_status: validatedData.status,
                changes: validatedData,
              },
            }),
          ];
        case 9:
          // Log the update
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedRequest,
            }),
          ];
        case 10:
          error_3 = _c.sent();
          console.error("LGPD Data Subject Rights PUT Error:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_3.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
