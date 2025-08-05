"use client";
"use strict";
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
exports.default = ConsentWithdrawalManager;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var use_toast_1 = require("@/hooks/use-toast");
function ConsentWithdrawalManager(_a) {
  var _this = this;
  var patientId = _a.patientId,
    clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    consents = _b[0],
    setConsents = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    withdrawing = _d[0],
    setWithdrawing = _d[1];
  var _e = (0, react_1.useState)(""),
    withdrawalReason = _e[0],
    setWithdrawalReason = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedConsentType = _f[0],
    setSelectedConsentType = _f[1];
  var _g = (0, react_1.useState)("active"),
    selectedStatus = _g[0],
    setSelectedStatus = _g[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(
    function () {
      fetchPatientConsents();
    },
    [patientId, clinicId, selectedConsentType, selectedStatus],
  );
  var fetchPatientConsents = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var query, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setLoading(true);
            query = supabase
              .from("patient_consent")
              .select(
                "\n          *,\n          consent_forms (\n            id,\n            title,\n            version,\n            form_type\n          ),\n          patients (\n            id,\n            full_name\n          )\n        ",
              )
              .eq("clinic_id", clinicId);
            if (patientId) {
              query = query.eq("patient_id", patientId);
            }
            if (selectedConsentType !== "all") {
              query = query.eq("consent_type", selectedConsentType);
            }
            if (selectedStatus === "active") {
              query = query.in("status", ["active", "pending"]);
            } else if (selectedStatus !== "all") {
              query = query.eq("status", selectedStatus);
            }
            return [4 /*yield*/, query.order("created_at", { ascending: false })];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching consents:", error);
              toast({
                title: "Error",
                description: "Failed to fetch patient consents",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            setConsents(data || []);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _b.sent();
            console.error("Error:", error_1);
            toast({
              title: "Error",
              description: "An unexpected error occurred",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleWithdrawConsent = function (consentId) {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!withdrawalReason.trim()) {
              toast({
                title: "Error",
                description: "Please provide a reason for withdrawal",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, 5, 6]);
            setWithdrawing(consentId);
            return [
              4 /*yield*/,
              supabase
                .from("patient_consent")
                .update({
                  status: "revoked",
                  withdrawal_date: new Date().toISOString(),
                  withdrawal_reason: withdrawalReason.trim(),
                })
                .eq("id", consentId)
                .select(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error withdrawing consent:", error);
              toast({
                title: "Error",
                description: "Failed to withdraw consent",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            toast({
              title: "Success",
              description: "Consent has been successfully withdrawn",
              variant: "default",
            });
            // Refresh the list
            return [4 /*yield*/, fetchPatientConsents()];
          case 3:
            // Refresh the list
            _b.sent();
            setWithdrawalReason("");
            setWithdrawing(null);
            return [3 /*break*/, 6];
          case 4:
            error_2 = _b.sent();
            console.error("Error:", error_2);
            toast({
              title: "Error",
              description: "An unexpected error occurred",
              variant: "destructive",
            });
            return [3 /*break*/, 6];
          case 5:
            setWithdrawing(null);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var getStatusIcon = function (status) {
    switch (status) {
      case "active":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500" />;
      case "withdrawn":
        return <lucide_react_1.XCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <lucide_react_1.FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  var getStatusBadge = function (status) {
    var variants = {
      active: "default",
      pending: "secondary",
      withdrawn: "destructive",
      expired: "outline",
    };
    return (
      <badge_1.Badge variant={variants[status] || "outline"}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </badge_1.Badge>
    );
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  var canWithdraw = function (consent) {
    return consent.status === "active" || consent.status === "pending";
  };
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Patient Consent Withdrawal</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.XCircle className="h-5 w-5" />
            Patient Consent Withdrawal Management
          </card_1.CardTitle>
          <card_1.CardDescription>
            Manage consent withdrawals and modifications for compliance with LGPD and patient rights
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label_1.Label htmlFor="consent-type">Consent Type</label_1.Label>
              <select_1.Select value={selectedConsentType} onValueChange={setSelectedConsentType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select consent type" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Types</select_1.SelectItem>
                  <select_1.SelectItem value="treatment">Treatment</select_1.SelectItem>
                  <select_1.SelectItem value="photography">Photography</select_1.SelectItem>
                  <select_1.SelectItem value="data_processing">Data Processing</select_1.SelectItem>
                  <select_1.SelectItem value="research">Research</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="flex-1">
              <label_1.Label htmlFor="status">Status</label_1.Label>
              <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                  <select_1.SelectItem value="active">Active (Signed/Pending)</select_1.SelectItem>
                  <select_1.SelectItem value="active">Active</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pending</select_1.SelectItem>
                  <select_1.SelectItem value="revoked">Revoked</select_1.SelectItem>
                  <select_1.SelectItem value="expired">Expired</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          {consents.length === 0
            ? <alert_1.Alert>
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  No consents found matching the selected criteria.
                </alert_1.AlertDescription>
              </alert_1.Alert>
            : <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Patient</table_1.TableHead>
                    <table_1.TableHead>Consent Type</table_1.TableHead>
                    <table_1.TableHead>Form</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Consent Date</table_1.TableHead>
                    <table_1.TableHead>Withdrawal Date</table_1.TableHead>
                    <table_1.TableHead>Actions</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {consents.map(function (consent) {
                    var _a, _b, _c, _d;
                    return (
                      <table_1.TableRow key={consent.id}>
                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            <lucide_react_1.User className="h-4 w-4" />
                            {((_a = consent.patient) === null || _a === void 0
                              ? void 0
                              : _a.full_name) || "Unknown Patient"}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant="outline" className="capitalize">
                            {(_b = consent.consent_type) === null || _b === void 0
                              ? void 0
                              : _b.replace("_", " ")}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div>
                            <div className="font-medium">
                              {(_c = consent.consent_form) === null || _c === void 0
                                ? void 0
                                : _c.form_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              v
                              {(_d = consent.consent_form) === null || _d === void 0
                                ? void 0
                                : _d.form_version}
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>{getStatusBadge(consent.status)}</table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <lucide_react_1.Calendar className="h-3 w-3" />
                            {formatDate(consent.created_at)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {consent.withdrawal_date
                            ? <div>
                                <div className="flex items-center gap-1 text-sm">
                                  <lucide_react_1.Calendar className="h-3 w-3" />
                                  {formatDate(consent.withdrawal_date)}
                                </div>
                                {consent.withdrawal_reason && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {consent.withdrawal_reason}
                                  </div>
                                )}
                              </div>
                            : <span className="text-muted-foreground">-</span>}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {canWithdraw(consent) && (
                            <dialog_1.Dialog>
                              <dialog_1.DialogTrigger asChild>
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <lucide_react_1.XCircle className="h-4 w-4 mr-1" />
                                  Withdraw
                                </button_1.Button>
                              </dialog_1.DialogTrigger>
                              <dialog_1.DialogContent>
                                <dialog_1.DialogHeader>
                                  <dialog_1.DialogTitle>Withdraw Consent</dialog_1.DialogTitle>
                                  <dialog_1.DialogDescription>
                                    Are you sure you want to withdraw this consent? This action
                                    cannot be undone.
                                  </dialog_1.DialogDescription>
                                </dialog_1.DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label_1.Label htmlFor="reason">
                                      Reason for Withdrawal (Required)
                                    </label_1.Label>
                                    <textarea_1.Textarea
                                      id="reason"
                                      placeholder="Please provide a reason for withdrawing this consent..."
                                      value={withdrawalReason}
                                      onChange={function (e) {
                                        return setWithdrawalReason(e.target.value);
                                      }}
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                <dialog_1.DialogFooter>
                                  <button_1.Button
                                    variant="outline"
                                    onClick={function () {
                                      setWithdrawalReason("");
                                      setWithdrawing(null);
                                    }}
                                  >
                                    Cancel
                                  </button_1.Button>
                                  <button_1.Button
                                    variant="destructive"
                                    onClick={function () {
                                      return handleWithdrawConsent(consent.id);
                                    }}
                                    disabled={
                                      withdrawing === consent.id || !withdrawalReason.trim()
                                    }
                                  >
                                    {withdrawing === consent.id
                                      ? "Withdrawing..."
                                      : "Withdraw Consent"}
                                  </button_1.Button>
                                </dialog_1.DialogFooter>
                              </dialog_1.DialogContent>
                            </dialog_1.Dialog>
                          )}
                        </table_1.TableCell>
                      </table_1.TableRow>
                    );
                  })}
                </table_1.TableBody>
              </table_1.Table>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
