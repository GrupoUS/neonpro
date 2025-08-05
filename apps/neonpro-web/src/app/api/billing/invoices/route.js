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
var CreateInvoiceSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid("ID do paciente inválido"),
  appointment_id: zod_1.z.string().uuid().optional(),
  due_date: zod_1.z.string().optional(),
  notes: zod_1.z.string().optional(),
  payment_terms: zod_1.z.string().optional(),
  items: zod_1.z
    .array(
      zod_1.z.object({
        service_id: zod_1.z.string().uuid().optional(),
        description: zod_1.z.string().min(1, "Descrição é obrigatória"),
        quantity: zod_1.z.number().min(1, "Quantidade deve ser pelo menos 1"),
        unit_price: zod_1.z.number().min(0, "Preço unitário deve ser positivo"),
        discount_type: zod_1.z.enum(["percentage", "fixed"]).optional(),
        discount_value: zod_1.z.number().min(0).optional(),
      }),
    )
    .min(1, "Pelo menos um item é obrigatório"),
});
var _UpdateInvoiceSchema = zod_1.z.object({
  status: zod_1.z.enum(["draft", "pending", "paid", "overdue", "cancelled"]).optional(),
  due_date: zod_1.z.string().optional(),
  notes: zod_1.z.string().optional(),
  payment_terms: zod_1.z.string().optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      searchParams,
      status_1,
      patientId,
      page,
      limit,
      offset,
      query,
      _a,
      invoices,
      error,
      count,
      error_1;
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
          status_1 = searchParams.get("status");
          patientId = searchParams.get("patient_id");
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "20");
          offset = (page - 1) * limit;
          query = supabase
            .from("invoices")
            .select(
              "\n        *,\n        patient:profiles!invoices_patient_id_fkey(\n          id,\n          full_name,\n          email,\n          phone\n        ),\n        invoice_items(\n          id,\n          service_id,\n          description,\n          quantity,\n          unit_price,\n          discount_type,\n          discount_value,\n          total_amount,\n          service:services(name)\n        ),\n        payments(\n          id,\n          payment_number,\n          amount,\n          method,\n          status,\n          payment_date\n        )\n      ",
            )
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (patientId) {
            query = query.eq("patient_id", patientId);
          }
          return [4 /*yield*/, query];
        case 3:
          (_a = _b.sent()), (invoices = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            console.error("Error fetching invoices:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              invoices: invoices,
              pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
              },
            }),
          ];
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
    var supabase,
      user,
      body,
      validatedData,
      _a,
      invoice_1,
      invoiceError,
      items,
      itemsError,
      _b,
      completeInvoice,
      fetchError,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 9, undefined, 10]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = CreateInvoiceSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .insert({
                patient_id: validatedData.patient_id,
                appointment_id: validatedData.appointment_id,
                status: "draft",
                issue_date: new Date().toISOString(),
                due_date:
                  validatedData.due_date ||
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                notes: validatedData.notes,
                payment_terms: validatedData.payment_terms,
                subtotal_amount: 0, // Will be calculated by trigger
                discount_amount: 0, // Will be calculated by trigger
                tax_amount: 0, // Will be calculated by trigger
                total_amount: 0, // Will be calculated by trigger
                clinic_id: user.id,
              })
              .select()
              .single(),
          ];
        case 4:
          (_a = _c.sent()), (invoice_1 = _a.data), (invoiceError = _a.error);
          if (invoiceError) {
            console.error("Error creating invoice:", invoiceError);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to create invoice" }, { status: 500 }),
            ];
          }
          items = validatedData.items.map((item) => ({
            invoice_id: invoice_1.id,
            service_id: item.service_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_type: item.discount_type,
            discount_value: item.discount_value || 0,
            // total_amount will be calculated by trigger
            total_amount: item.unit_price * item.quantity - (item.discount_value || 0),
          }));
          return [4 /*yield*/, supabase.from("invoice_items").insert(items)];
        case 5:
          itemsError = _c.sent().error;
          if (!itemsError) return [3 /*break*/, 7];
          console.error("Error creating invoice items:", itemsError);
          // Rollback - delete the invoice
          return [4 /*yield*/, supabase.from("invoices").delete().eq("id", invoice_1.id)];
        case 6:
          // Rollback - delete the invoice
          _c.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to create invoice items" },
              { status: 500 },
            ),
          ];
        case 7:
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .select(
                "\n        *,\n        patient:profiles!invoices_patient_id_fkey(\n          id,\n          full_name,\n          email,\n          phone\n        ),\n        invoice_items(\n          id,\n          service_id,\n          description,\n          quantity,\n          unit_price,\n          discount_type,\n          discount_value,\n          total_amount,\n          service:services(name)\n        )\n      ",
              )
              .eq("id", invoice_1.id)
              .single(),
          ];
        case 8:
          (_b = _c.sent()), (completeInvoice = _b.data), (fetchError = _b.error);
          if (fetchError) {
            console.error("Error fetching complete invoice:", fetchError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invoice created but failed to fetch complete data" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ invoice: completeInvoice }, { status: 201 }),
          ];
        case 9:
          error_2 = _c.sent();
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
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
