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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Request validation schemas
var CreateDocumentSchema = zod_1.z.object({
  document_type: zod_1.z.string().min(1, "Document type is required"),
  document_category: zod_1.z.string().min(1, "Document category is required"),
  authority: zod_1.z.string().min(1, "Authority is required"),
  document_number: zod_1.z.string().optional(),
  issue_date: zod_1.z.string().min(1, "Issue date is required"),
  expiration_date: zod_1.z.string().optional(),
  status: zod_1.z.enum(["valid", "expiring", "expired", "pending"]).default("pending"),
  file_url: zod_1.z.string().optional(),
  file_name: zod_1.z.string().optional(),
  file_size: zod_1.z.number().optional(),
  version: zod_1.z.string().default("v1.0"),
  associated_professional_id: zod_1.z.string().uuid().optional(),
  associated_equipment_id: zod_1.z.string().uuid().optional(),
});
var ListDocumentsSchema = zod_1.z.object({
  page: zod_1.z
    .string()
    .transform(function (val) {
      return parseInt(val) || 1;
    })
    .optional(),
  limit: zod_1.z
    .string()
    .transform(function (val) {
      return Math.min(parseInt(val) || 10, 50);
    })
    .optional(),
  category: zod_1.z.string().optional(),
  status: zod_1.z.enum(["valid", "expiring", "expired", "pending"]).optional(),
  search: zod_1.z.string().optional(),
});
// GET /api/regulatory-documents - List documents with filtering and pagination
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      queryParams,
      _b,
      _c,
      page,
      _d,
      limit,
      category,
      status_1,
      search,
      query,
      offset,
      _e,
      documents,
      error,
      count,
      totalPages,
      hasNextPage,
      hasPrevPage,
      error_1;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 4, , 5]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _f.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          queryParams = Object.fromEntries(searchParams.entries());
          (_b = ListDocumentsSchema.parse(queryParams)),
            (_c = _b.page),
            (page = _c === void 0 ? 1 : _c),
            (_d = _b.limit),
            (limit = _d === void 0 ? 10 : _d),
            (category = _b.category),
            (status_1 = _b.status),
            (search = _b.search);
          query = supabase
            .from("regulatory_documents")
            .select(
              "\n        *,\n        regulation_categories!inner(name, authority_name),\n        document_versions(id, version, created_at)\n      ",
            )
            .order("created_at", { ascending: false });
          // Apply filters
          if (category) {
            query = query.eq("document_category", category);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (search) {
            query = query.or(
              "document_type.ilike.%"
                .concat(search, "%,document_number.ilike.%")
                .concat(search, "%,file_name.ilike.%")
                .concat(search, "%"),
            );
          }
          offset = (page - 1) * limit;
          query = query.range(offset, offset + limit - 1);
          return [4 /*yield*/, query];
        case 3:
          (_e = _f.sent()), (documents = _e.data), (error = _e.error), (count = _e.count);
          if (error) {
            console.error("Error fetching regulatory documents:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 }),
            ];
          }
          totalPages = Math.ceil((count || 0) / limit);
          hasNextPage = page < totalPages;
          hasPrevPage = page > 1;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              documents: documents || [],
              pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
              },
            }),
          ];
        case 4:
          error_1 = _f.sent();
          console.error("API Error:", error_1);
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
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/regulatory-documents - Create new regulatory document
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      requestBody,
      validatedData,
      profile,
      _b,
      document_1,
      error,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 8, , 9]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
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
          return [4 /*yield*/, request.json()];
        case 3:
          requestBody = _c.sent();
          validatedData = CreateDocumentSchema.parse(requestBody);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 4:
          profile = _c.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "User not associated with clinic" },
                { status: 403 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("regulatory_documents")
              .insert(
                __assign(__assign({}, validatedData), {
                  clinic_id: profile.clinic_id,
                  created_by: user.id,
                  updated_by: user.id,
                }),
              )
              .select(
                "\n        *,\n        regulation_categories!inner(name, authority_name)\n      ",
              )
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (document_1 = _b.data), (error = _b.error);
          if (error) {
            console.error("Error creating regulatory document:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create document" }, { status: 500 }),
            ];
          }
          if (!validatedData.file_url) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            supabase.from("document_versions").insert({
              document_id: document_1.id,
              version: validatedData.version,
              file_url: validatedData.file_url,
              change_reason: "Initial document upload",
              created_by: user.id,
            }),
          ];
        case 6:
          _c.sent();
          _c.label = 7;
        case 7:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ document: document_1 }, { status: 201 }),
          ];
        case 8:
          error_2 = _c.sent();
          console.error("API Error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid document data", details: error_2.errors },
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
