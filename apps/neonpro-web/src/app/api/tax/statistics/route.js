// Tax Statistics API Endpoint
// Story 5.5: Get Brazilian tax statistics and insights
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      clinicId,
      startDate,
      endDate,
      _b,
      clinic,
      clinicError,
      dateFilters,
      taxQuery_1,
      _c,
      taxCalculations,
      taxError,
      nfeQuery_1,
      _d,
      nfeDocuments,
      nfeError,
      stats_1,
      error_1;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _e.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          startDate = searchParams.get("start_date");
          endDate = searchParams.get("end_date");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", clinicId).single(),
          ];
        case 3:
          (_b = _e.sent()), (clinic = _b.data), (clinicError = _b.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found or access denied" },
                { status: 404 },
              ),
            ];
          }
          dateFilters = [];
          if (startDate) dateFilters.push(["created_at", "gte", startDate]);
          if (endDate) dateFilters.push(["created_at", "lte", endDate]);
          taxQuery_1 = supabase.from("tax_calculations").select("*").eq("clinic_id", clinicId);
          dateFilters.forEach((_a) => {
            var column = _a[0],
              operator = _a[1],
              value = _a[2];
            taxQuery_1 = taxQuery_1.filter(column, operator, value);
          });
          return [4 /*yield*/, taxQuery_1];
        case 4:
          (_c = _e.sent()), (taxCalculations = _c.data), (taxError = _c.error);
          if (taxError) {
            console.error("Error fetching tax calculations:", taxError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch tax calculations" },
                { status: 500 },
              ),
            ];
          }
          nfeQuery_1 = supabase.from("nfe_documents").select("*").eq("clinic_id", clinicId);
          dateFilters.forEach((_a) => {
            var column = _a[0],
              operator = _a[1],
              value = _a[2];
            nfeQuery_1 = nfeQuery_1.filter(column, operator, value);
          });
          return [4 /*yield*/, nfeQuery_1];
        case 5:
          (_d = _e.sent()), (nfeDocuments = _d.data), (nfeError = _d.error);
          if (nfeError) {
            console.error("Error fetching NFe documents:", nfeError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch NFe documents" },
                { status: 500 },
              ),
            ];
          }
          stats_1 = {
            tax_calculations: {
              total: taxCalculations.length,
              total_base_amount: taxCalculations.reduce(
                (sum, calc) => sum + (calc.base_amount || 0),
                0,
              ),
              total_tax_amount: taxCalculations.reduce((sum, calc) => {
                var taxes = calc.taxes || {};
                return (
                  sum + Object.values(taxes).reduce((taxSum, tax) => taxSum + (tax.amount || 0), 0)
                );
              }, 0),
              total_final_amount: taxCalculations.reduce(
                (sum, calc) => sum + (calc.total_amount || 0),
                0,
              ),
              by_service_type: {},
            },
            nfe_documents: {
              total: nfeDocuments.length,
              by_status: nfeDocuments.reduce((acc, nfe) => {
                acc[nfe.status] = (acc[nfe.status] || 0) + 1;
                return acc;
              }, {}),
              total_value: nfeDocuments.reduce((sum, nfe) => {
                var totals = nfe.totals || {};
                return sum + (totals.total || 0);
              }, 0),
              authorized_count: nfeDocuments.filter((nfe) => nfe.status === "authorized").length,
              cancelled_count: nfeDocuments.filter((nfe) => nfe.status === "cancelled").length,
            },
            compliance: {
              authorization_rate:
                nfeDocuments.length > 0
                  ? (nfeDocuments.filter((nfe) => nfe.status === "authorized").length /
                      nfeDocuments.length) *
                    100
                  : 0,
              average_processing_time: 0, // TODO: Calculate based on actual processing times
              pending_authorizations: nfeDocuments.filter((nfe) => nfe.status === "draft").length,
            },
          };
          // Calculate service type breakdown
          taxCalculations.forEach((calc) => {
            var serviceType = calc.service_type || "unknown";
            if (!stats_1.tax_calculations.by_service_type[serviceType]) {
              stats_1.tax_calculations.by_service_type[serviceType] = {
                count: 0,
                total_base: 0,
                total_tax: 0,
                total_final: 0,
              };
            }
            var serviceStats = stats_1.tax_calculations.by_service_type[serviceType];
            serviceStats.count++;
            serviceStats.total_base += calc.base_amount || 0;
            serviceStats.total_final += calc.total_amount || 0;
            var taxes = calc.taxes || {};
            serviceStats.total_tax += Object.values(taxes).reduce(
              (sum, tax) => sum + (tax.amount || 0),
              0,
            );
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                clinic_id: clinicId,
                period: {
                  start_date: startDate,
                  end_date: endDate,
                },
                statistics: stats_1,
              },
            }),
          ];
        case 6:
          error_1 = _e.sent();
          console.error("Tax statistics error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
