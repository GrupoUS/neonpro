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
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      searchParams,
      startDate,
      endDate,
      period,
      _a,
      financialSummary,
      summaryError,
      _b,
      revenueByPeriod,
      revenueError,
      _c,
      revenueByService,
      serviceRevenueError,
      _d,
      paymentMethodStats,
      paymentStatsError,
      methodStats,
      _e,
      topPatients,
      patientsError,
      patientRevenue,
      topPatientsArray,
      _f,
      outstandingInvoices,
      outstandingError,
      outstandingAnalysis_1,
      now_1,
      monthlyTrendsStartDate,
      _g,
      monthlyTrends,
      _trendsError,
      error_1;
    return __generator(this, (_h) => {
      switch (_h.label) {
        case 0:
          _h.trys.push([0, 10, undefined, 11]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _h.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _h.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          startDate =
            searchParams.get("start_date") ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          endDate = searchParams.get("end_date") || new Date().toISOString().split("T")[0];
          period = searchParams.get("period") || "daily";
          return [
            4 /*yield*/,
            supabase.rpc("get_financial_summary", {
              start_date: startDate,
              end_date: endDate,
            }),
          ];
        case 3:
          (_a = _h.sent()), (financialSummary = _a.data), (summaryError = _a.error);
          if (summaryError) {
            console.error("Error fetching financial summary:", summaryError);
          }
          return [
            4 /*yield*/,
            supabase.rpc("get_revenue_by_period", {
              start_date: startDate,
              end_date: endDate,
              period_type: period,
            }),
          ];
        case 4:
          (_b = _h.sent()), (revenueByPeriod = _b.data), (revenueError = _b.error);
          if (revenueError) {
            console.error("Error fetching revenue by period:", revenueError);
          }
          return [
            4 /*yield*/,
            supabase.rpc("get_revenue_by_service", {
              start_date: startDate,
              end_date: endDate,
            }),
          ];
        case 5:
          (_c = _h.sent()), (revenueByService = _c.data), (serviceRevenueError = _c.error);
          if (serviceRevenueError) {
            console.error("Error fetching revenue by service:", serviceRevenueError);
          }
          return [
            4 /*yield*/,
            supabase
              .from("payments")
              .select("method, amount, status")
              .gte("payment_date", startDate)
              .lte("payment_date", endDate)
              .eq("status", "completed"),
          ];
        case 6:
          (_d = _h.sent()), (paymentMethodStats = _d.data), (paymentStatsError = _d.error);
          methodStats = {};
          if (!paymentStatsError && paymentMethodStats) {
            methodStats = paymentMethodStats.reduce((acc, payment) => {
              var method = payment.method;
              if (!acc[method]) {
                acc[method] = { count: 0, total_amount: 0 };
              }
              acc[method].count += 1;
              acc[method].total_amount += payment.amount;
              return acc;
            }, {});
          }
          return [
            4 /*yield*/,
            supabase
              .from("payments")
              .select(
                "\n        amount,\n        invoice:invoices(\n          patient_id,\n          patient:profiles!invoices_patient_id_fkey(\n            id,\n            full_name,\n            email\n          )\n        )\n      ",
              )
              .gte("payment_date", startDate)
              .lte("payment_date", endDate)
              .eq("status", "completed"),
          ];
        case 7:
          (_e = _h.sent()), (topPatients = _e.data), (patientsError = _e.error);
          patientRevenue = {};
          if (!patientsError && topPatients) {
            patientRevenue = topPatients.reduce((acc, payment) => {
              var invoice = payment.invoice;
              var patientId = invoice === null || invoice === void 0 ? void 0 : invoice.patient_id;
              if (
                patientId &&
                (invoice === null || invoice === void 0 ? void 0 : invoice.patient)
              ) {
                if (!acc[patientId]) {
                  acc[patientId] = {
                    patient: Array.isArray(invoice.patient) ? invoice.patient[0] : invoice.patient,
                    total_revenue: 0,
                    payments_count: 0,
                  };
                }
                acc[patientId].total_revenue += payment.amount;
                acc[patientId].payments_count += 1;
              }
              return acc;
            }, {});
          }
          topPatientsArray = Object.values(patientRevenue)
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, 10);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .select(
                "\n        id,\n        invoice_number,\n        total_amount,\n        issue_date,\n        due_date,\n        status,\n        patient:profiles!invoices_patient_id_fkey(\n          full_name,\n          email\n        ),\n        payments:payments!inner(amount)\n      ",
              )
              .in("status", ["pending", "overdue"])
              .order("due_date", { ascending: true }),
          ];
        case 8:
          (_f = _h.sent()), (outstandingInvoices = _f.data), (outstandingError = _f.error);
          outstandingAnalysis_1 = {
            total_outstanding: 0,
            overdue_count: 0,
            overdue_amount: 0,
            upcoming_due: 0,
            by_age: {
              current: { count: 0, amount: 0 },
              "1-30": { count: 0, amount: 0 },
              "31-60": { count: 0, amount: 0 },
              "61-90": { count: 0, amount: 0 },
              "90+": { count: 0, amount: 0 },
            },
          };
          if (!outstandingError && outstandingInvoices) {
            now_1 = new Date();
            outstandingInvoices.forEach((invoice) => {
              var _a;
              var paidAmount =
                ((_a = invoice.payments) === null || _a === void 0
                  ? void 0
                  : _a.reduce((sum, p) => sum + p.amount, 0)) || 0;
              var remainingAmount = invoice.total_amount - paidAmount;
              if (remainingAmount > 0) {
                outstandingAnalysis_1.total_outstanding += remainingAmount;
                var dueDate = new Date(invoice.due_date);
                var daysPastDue = Math.floor(
                  (now_1.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                if (daysPastDue > 0) {
                  outstandingAnalysis_1.overdue_count += 1;
                  outstandingAnalysis_1.overdue_amount += remainingAmount;
                  // Categorize by age
                  if (daysPastDue <= 30) {
                    outstandingAnalysis_1.by_age["1-30"].count += 1;
                    outstandingAnalysis_1.by_age["1-30"].amount += remainingAmount;
                  } else if (daysPastDue <= 60) {
                    outstandingAnalysis_1.by_age["31-60"].count += 1;
                    outstandingAnalysis_1.by_age["31-60"].amount += remainingAmount;
                  } else if (daysPastDue <= 90) {
                    outstandingAnalysis_1.by_age["61-90"].count += 1;
                    outstandingAnalysis_1.by_age["61-90"].amount += remainingAmount;
                  } else {
                    outstandingAnalysis_1.by_age["90+"].count += 1;
                    outstandingAnalysis_1.by_age["90+"].amount += remainingAmount;
                  }
                } else {
                  outstandingAnalysis_1.by_age.current.count += 1;
                  outstandingAnalysis_1.by_age.current.amount += remainingAmount;
                  // Check if due in next 30 days
                  if (daysPastDue >= -30) {
                    outstandingAnalysis_1.upcoming_due += remainingAmount;
                  }
                }
              }
            });
          }
          monthlyTrendsStartDate = new Date();
          monthlyTrendsStartDate.setMonth(monthlyTrendsStartDate.getMonth() - 12);
          return [
            4 /*yield*/,
            supabase.rpc("get_revenue_by_period", {
              start_date: monthlyTrendsStartDate.toISOString().split("T")[0],
              end_date: endDate,
              period_type: "monthly",
            }),
          ];
        case 9:
          (_g = _h.sent()), (monthlyTrends = _g.data), (_trendsError = _g.error);
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              financial_summary: (financialSummary === null || financialSummary === void 0
                ? void 0
                : financialSummary[0]) || {
                total_revenue: 0,
                pending_invoices: 0,
                overdue_invoices: 0,
                paid_invoices: 0,
                total_outstanding: outstandingAnalysis_1.total_outstanding,
                monthly_revenue: 0,
                daily_revenue: 0,
                period: { start_date: startDate, end_date: endDate },
              },
              revenue_by_period: revenueByPeriod || [],
              revenue_by_service: revenueByService || [],
              payment_method_stats: methodStats,
              top_patients: topPatientsArray,
              outstanding_analysis: outstandingAnalysis_1,
              monthly_trends: monthlyTrends || [],
              period: {
                start_date: startDate,
                end_date: endDate,
                type: period,
              },
            }),
          ];
        case 10:
          error_1 = _h.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
