// =====================================================
// NeonPro Resource Management API
// Story 2.4: Smart Resource Management - API Routes
// =====================================================
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
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var resource_manager_1 = require("@/lib/resources/resource-manager");
// =====================================================
// GET /api/resources - List resources with filters
// =====================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      clinicId,
      type,
      status_1,
      category,
      supabase,
      _a,
      user,
      authError,
      resourceManager,
      filters,
      resources,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          type = searchParams.get("type");
          status_1 = searchParams.get("status");
          category = searchParams.get("category");
          // Validate required parameters
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          resourceManager = new resource_manager_1.ResourceManager();
          filters = {};
          if (type) filters.type = type;
          if (status_1) filters.status = status_1;
          if (category) filters.category = category;
          return [4 /*yield*/, resourceManager.getResources(clinicId, filters)];
        case 3:
          resources = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: resources,
              count: resources.length,
              filters: filters,
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Error fetching resources:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to fetch resources",
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
// =====================================================
// POST /api/resources - Create new resource
// =====================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      name_1,
      type,
      clinic_id,
      supabase,
      _a,
      user,
      authError,
      resourceManager,
      resourceData,
      newResource,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          (name_1 = body.name), (type = body.type), (clinic_id = body.clinic_id);
          if (!name_1 || !type || !clinic_id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "name, type, and clinic_id are required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          resourceManager = new resource_manager_1.ResourceManager();
          resourceData = __assign(__assign({}, body), {
            created_by: user.id,
            updated_by: user.id,
            status: body.status || "available",
          });
          return [4 /*yield*/, resourceManager.createResource(resourceData)];
        case 4:
          newResource = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: newResource,
                message: "Resource created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _b.sent();
          console.error("Error creating resource:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to create resource",
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
// =====================================================
// PUT /api/resources - Update resource
// =====================================================
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, id, updates, supabase, _a, user, authError, resourceManager, updatedResource, error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          (id = body.id), (updates = __rest(body, ["id"]));
          // Validate required fields
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Resource id is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          resourceManager = new resource_manager_1.ResourceManager();
          return [
            4 /*yield*/,
            resourceManager.updateResource(
              id,
              __assign(__assign({}, updates), { updated_by: user.id }),
            ),
          ];
        case 4:
          updatedResource = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedResource,
              message: "Resource updated successfully",
            }),
          ];
        case 5:
          error_3 = _b.sent();
          console.error("Error updating resource:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to update resource",
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
// =====================================================
// DELETE /api/resources - Delete resource
// =====================================================
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, resourceId, supabase, _a, user, authError, resourceManager, error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          resourceId = searchParams.get("id");
          // Validate required parameters
          if (!resourceId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Resource id is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          resourceManager = new resource_manager_1.ResourceManager();
          return [4 /*yield*/, resourceManager.deleteResource(resourceId)];
        case 3:
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Resource deleted successfully",
            }),
          ];
        case 4:
          error_4 = _b.sent();
          console.error("Error deleting resource:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to delete resource",
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
