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
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Validation schemas
var CreateServiceSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome é obrigatório"),
  description: zod_1.z.string().optional(),
  category: zod_1.z.string().optional(),
  service_type: zod_1.z.enum(["procedure", "consultation", "package"]),
  base_price: zod_1.z.number().min(0, "Preço deve ser positivo"),
  duration_minutes: zod_1.z.number().int().min(0).optional(),
  is_active: zod_1.z.boolean().optional().default(true),
  requires_appointment: zod_1.z.boolean().optional().default(true),
});
var _UpdateServiceSchema = CreateServiceSchema.partial();
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, isActive, category, query, _a, services, error, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, undefined, 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          isActive = searchParams.get("active");
          category = searchParams.get("category");
          query = supabase.from("services").select("*").order("created_at", { ascending: false });
          if (isActive !== null) {
            query = query.eq("is_active", isActive === "true");
          }
          if (category) {
            query = query.eq("category", category);
          }
          return [4 /*yield*/, query];
        case 3:
          (_a = _b.sent()), (services = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching services:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to fetch services" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ services: services })];
        case 4:
          error_1 = _b.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validatedData, _a, service, error, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData = CreateServiceSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("services")
              .insert(__assign(__assign({}, validatedData), { clinic_id: user.id }))
              .select()
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (service = _a.data), (error = _a.error);
          if (error) {
            console.error("Error creating service:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to create service" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ service: service }, { status: 201 })];
        case 5:
          error_2 = _b.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Validation failed", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("API Error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
