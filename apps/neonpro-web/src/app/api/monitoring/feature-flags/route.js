/**
 * TASK-001: Foundation Setup & Baseline
 * Feature Flags Management API
 *
 * Provides comprehensive feature flag management with gradual rollout
 * capability for safe enhancement implementation.
 */
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, searchParams, environment, epic_id, query, _a, flags, error, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          environment = searchParams.get("environment");
          epic_id = searchParams.get("epic_id");
          query = supabase
            .from("feature_flags")
            .select("*")
            .order("created_at", { ascending: false });
          if (environment) {
            query = query.eq("environment", environment);
          }
          if (epic_id) {
            query = query.eq("epic_id", epic_id);
          }
          return [4 /*yield*/, query];
        case 3:
          (_a = _b.sent()), (flags = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: { flags: flags || [] },
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Error fetching feature flags:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      name_1,
      description,
      _a,
      environment,
      epic_id,
      _b,
      enabled,
      _c,
      rollout_percentage,
      existingFlag,
      _d,
      flag,
      error,
      error_2;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _e.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _e.sent();
          (name_1 = body.name),
            (description = body.description),
            (_a = body.environment),
            (environment = _a === void 0 ? "development" : _a),
            (epic_id = body.epic_id),
            (_b = body.enabled),
            (enabled = _b === void 0 ? false : _b),
            (_c = body.rollout_percentage),
            (rollout_percentage = _c === void 0 ? 0 : _c);
          // Validate required fields
          if (!name_1 || !description) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Missing required fields: name, description" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("feature_flags")
              .select("id")
              .eq("name", name_1)
              .eq("environment", environment)
              .single(),
          ];
        case 4:
          existingFlag = _e.sent().data;
          if (existingFlag) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Feature flag with this name already exists in this environment" },
                { status: 409 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("feature_flags")
              .insert({
                name: name_1,
                description: description,
                environment: environment,
                epic_id: epic_id,
                enabled: enabled,
                rollout_percentage: rollout_percentage,
                created_by: session.user.id,
              })
              .select()
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (flag = _d.data), (error = _d.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: { flag: flag },
              message: "Feature flag created successfully",
            }),
          ];
        case 6:
          error_2 = _e.sent();
          console.error("Error creating feature flag:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to create feature flag" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
