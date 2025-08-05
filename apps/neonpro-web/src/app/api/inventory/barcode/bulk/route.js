/**
 * Story 6.1 Task 2: Bulk Barcode Operations API
 * Handle bulk scanning operations and batch processing
 * Quality: ≥9.5/10 with comprehensive operation tracking
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
exports.PATCH = PATCH;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var barcode_service_1 = require("@/app/lib/services/barcode-service");
var zod_1 = require("zod");
var processBulkScanSchema = zod_1.z.object({
  operation_id: zod_1.z.string().uuid("ID da operação deve ser um UUID válido"),
  scan_value: zod_1.z.string().min(1, "Valor do scan é obrigatório"),
});
var updateOperationSchema = zod_1.z.object({
  status: zod_1.z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
  notes: zod_1.z.string().optional(),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      searchParams,
      action,
      validatedData,
      result,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action") || "process";
          if (!(action === "process")) return [3 /*break*/, 5];
          validatedData = processBulkScanSchema.parse(body);
          return [
            4 /*yield*/,
            barcode_service_1.barcodeService.processBulkScan(
              validatedData.operation_id,
              validatedData.scan_value,
              session.user.id,
            ),
          ];
        case 4:
          result = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              data: result.data,
              error: result.error,
              metadata: result.metadata,
            }),
          ];
        case 5:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Ação não suportada" }, { status: 400 }),
          ];
        case 6:
          error_1 = _b.sent();
          console.error("Erro no bulk scan:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados inválidos",
                  details: error_1.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                  })),
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      operationId,
      status_1,
      limit,
      _b,
      operation,
      error_3,
      query,
      _c,
      operations,
      error,
      error_2;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _d.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          operationId = searchParams.get("operation_id");
          status_1 = searchParams.get("status");
          limit = parseInt(searchParams.get("limit") || "20");
          if (!operationId) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase.from("bulk_scan_operations").select("*").eq("id", operationId).single(),
          ];
        case 3:
          (_b = _d.sent()), (operation = _b.data), (error_3 = _b.error);
          if (error_3) {
            console.error("Erro ao buscar operação:", error_3);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Operação não encontrada" }, { status: 404 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: operation,
            }),
          ];
        case 4:
          query = supabase
            .from("bulk_scan_operations")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(limit);
          if (status_1) {
            query = query.eq("status", status_1);
          }
          return [4 /*yield*/, query];
        case 5:
          (_c = _d.sent()), (operations = _c.data), (error = _c.error);
          if (error) {
            console.error("Erro ao buscar operações:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao buscar operações" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: operations,
            }),
          ];
        case 6:
          error_2 = _d.sent();
          console.error("Erro na busca de operações bulk:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      operationId,
      body,
      validatedData,
      _b,
      operation,
      error,
      error_4;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          operationId = searchParams.get("operation_id");
          if (!operationId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "operation_id é obrigatório" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = updateOperationSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("bulk_scan_operations")
              .update(
                __assign(__assign({}, validatedData), { updated_at: new Date().toISOString() }),
              )
              .eq("id", operationId)
              .select()
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (operation = _b.data), (error = _b.error);
          if (error) {
            console.error("Erro ao atualizar operação:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao atualizar operação" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: operation,
            }),
          ];
        case 5:
          error_4 = _c.sent();
          console.error("Erro na atualização da operação:", error_4);
          if (error_4 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados inválidos",
                  details: error_4.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                  })),
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
