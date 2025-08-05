/**
 * tRPC Patient Router
 * Healthcare-compliant patient management with LGPD audit
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
exports.patientsRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var server_1 = require("@trpc/server");
// Patient schemas
var patientSchema = zod_1.z.object({
  name: zod_1.z.string().min(2).max(100),
  email: zod_1.z.string().email(),
  phone: zod_1.z.string().min(10).max(15),
  birth_date: zod_1.z.string().date(),
  cpf: zod_1.z.string().length(11),
  gender: zod_1.z.enum(["M", "F", "O"]),
  address: zod_1.z.object({
    street: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    zip_code: zod_1.z.string(),
  }),
});
var updatePatientSchema = patientSchema.partial().extend({
  id: zod_1.z.string().uuid(),
});
exports.patientsRouter = (0, trpc_1.createTRPCRouter)({
  // List patients with pagination and filtering
  list: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(20),
        offset: zod_1.z.number().min(0).default(0),
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(["active", "inactive", "all"]).default("active"),
      }),
    )
    .query((_a) =>
      __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase, query, _c, data, error, count;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              supabase = ctx.supabase;
              query = supabase
                .from("patients")
                .select("*", { count: "exact" })
                .range(input.offset, input.offset + input.limit - 1);
              if (input.search) {
                query = query.or(
                  "name.ilike.%".concat(input.search, "%,email.ilike.%").concat(input.search, "%"),
                );
              }
              if (input.status !== "all") {
                query = query.eq("status", input.status);
              }
              return [4 /*yield*/, query];
            case 1:
              (_c = _d.sent()), (data = _c.data), (error = _c.error), (count = _c.count);
              if (error) {
                throw new server_1.TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to fetch patients",
                });
              }
              return [
                2 /*return*/,
                {
                  patients: data || [],
                  total: count || 0,
                  hasMore: input.offset + input.limit < (count || 0),
                },
              ];
          }
        });
      }),
    ),
  // Get single patient by ID
  getById: trpc_1.protectedProcedure
    .input(zod_1.z.object({ id: zod_1.z.string().uuid() }))
    .query((_a) =>
      __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase, _c, data, error;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              supabase = ctx.supabase;
              return [
                4 /*yield*/,
                supabase.from("patients").select("*").eq("id", input.id).single(),
              ];
            case 1:
              (_c = _d.sent()), (data = _c.data), (error = _c.error);
              if (error) {
                throw new server_1.TRPCError({
                  code: "NOT_FOUND",
                  message: "Patient not found",
                });
              }
              return [2 /*return*/, data];
          }
        });
      }),
    ),
  // Create new patient
  create: trpc_1.protectedProcedure.input(patientSchema).mutation((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var supabase, user, _c, data, error;
      var ctx = _b.ctx,
        input = _b.input;
      return __generator(this, (_d) => {
        switch (_d.label) {
          case 0:
            (supabase = ctx.supabase), (user = ctx.user);
            return [
              4 /*yield*/,
              supabase
                .from("patients")
                .insert(
                  __assign(__assign({}, input), {
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                    status: "active",
                  }),
                )
                .select()
                .single(),
            ];
          case 1:
            (_c = _d.sent()), (data = _c.data), (error = _c.error);
            if (error) {
              throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create patient",
              });
            }
            // TODO: Add LGPD audit log
            return [2 /*return*/, data];
        }
      });
    }),
  ),
  // Update patient
  update: trpc_1.protectedProcedure.input(updatePatientSchema).mutation((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var supabase, user, id, updateData, _c, data, error;
      var ctx = _b.ctx,
        input = _b.input;
      return __generator(this, (_d) => {
        switch (_d.label) {
          case 0:
            (supabase = ctx.supabase), (user = ctx.user);
            (id = input.id), (updateData = __rest(input, ["id"]));
            return [
              4 /*yield*/,
              supabase
                .from("patients")
                .update(
                  __assign(__assign({}, updateData), {
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                  }),
                )
                .eq("id", id)
                .select()
                .single(),
            ];
          case 1:
            (_c = _d.sent()), (data = _c.data), (error = _c.error);
            if (error) {
              throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update patient",
              });
            }
            // TODO: Add LGPD audit log
            return [2 /*return*/, data];
        }
      });
    }),
  ),
  // Soft delete patient (LGPD compliance)
  delete: trpc_1.adminProcedure
    .input(zod_1.z.object({ id: zod_1.z.string().uuid() }))
    .mutation((_a) =>
      __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase, user, _c, _data, error;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              (supabase = ctx.supabase), (user = ctx.user);
              return [
                4 /*yield*/,
                supabase
                  .from("patients")
                  .update({
                    status: "inactive",
                    deleted_by: user.id,
                    deleted_at: new Date().toISOString(),
                  })
                  .eq("id", input.id)
                  .select()
                  .single(),
              ];
            case 1:
              (_c = _d.sent()), (_data = _c.data), (error = _c.error);
              if (error) {
                throw new server_1.TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to delete patient",
                });
              }
              // TODO: Add LGPD audit log for deletion
              return [2 /*return*/, { success: true }];
          }
        });
      }),
    ),
});
