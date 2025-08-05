/**
 * Waitlist Management Component
 * Story 2.2: Intelligent conflict detection and resolution - Waitlist interface
 *
 * React component for managing patient waitlists and automated notifications
 */
"use client";
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
exports.default = WaitlistManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
function WaitlistManagement(_a) {
  var treatmentType = _a.treatmentType,
    onPatientAdded = _a.onPatientAdded,
    onNotificationSent = _a.onNotificationSent,
    _b = _a.showAddForm,
    showAddForm = _b === void 0 ? true : _b;
  var _c = (0, react_1.useState)([]),
    waitlistEntries = _c[0],
    setWaitlistEntries = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)(false),
    showForm = _f[0],
    setShowForm = _f[1];
  // Form state
  var _g = (0, react_1.useState)({
      patientId: "",
      treatmentType: treatmentType || "",
      preferredStartDate: "",
      preferredEndDate: "",
      urgencyLevel: "normal",
      specialRequirements: "",
    }),
    formData = _g[0],
    setFormData = _g[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  // Load waitlist entries on component mount
  (0, react_1.useEffect)(() => {
    loadWaitlistEntries();
  }, [treatmentType]);
  var loadWaitlistEntries = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, errorData, result, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            params = new URLSearchParams();
            if (treatmentType) {
              params.append("treatmentType", treatmentType);
            }
            params.append("status", "active");
            params.append("limit", "50");
            return [4 /*yield*/, fetch("/api/scheduling/waitlist?".concat(params.toString()))];
          case 2:
            response = _a.sent();
            if (response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to load waitlist");
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            result = _a.sent();
            setWaitlistEntries(result.data || []);
            return [3 /*break*/, 8];
          case 6:
            err_1 = _a.sent();
            setError(err_1 instanceof Error ? err_1.message : "An unexpected error occurred");
            return [3 /*break*/, 8];
          case 7:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var addToWaitlist = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, errorData, result, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (
              !formData.patientId ||
              !formData.treatmentType ||
              !formData.preferredStartDate ||
              !formData.preferredEndDate
            ) {
              setError("Please fill in all required fields");
              return [2 /*return*/];
            }
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, 8, 9]);
            return [
              4 /*yield*/,
              fetch("/api/scheduling/waitlist", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "add",
                  patientId: formData.patientId,
                  treatmentType: formData.treatmentType,
                  preferredDateRange: {
                    start: formData.preferredStartDate,
                    end: formData.preferredEndDate,
                  },
                  urgencyLevel: formData.urgencyLevel,
                  specialRequirements: formData.specialRequirements
                    ? JSON.parse(formData.specialRequirements)
                    : {},
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to add to waitlist");
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            result = _a.sent();
            // Reset form
            setFormData({
              patientId: "",
              treatmentType: treatmentType || "",
              preferredStartDate: "",
              preferredEndDate: "",
              urgencyLevel: "normal",
              specialRequirements: "",
            });
            setShowForm(false);
            // Reload waitlist
            return [4 /*yield*/, loadWaitlistEntries()];
          case 6:
            // Reload waitlist
            _a.sent();
            if (onPatientAdded) {
              onPatientAdded(result.data);
            }
            return [3 /*break*/, 9];
          case 7:
            err_2 = _a.sent();
            setError(err_2 instanceof Error ? err_2.message : "An unexpected error occurred");
            return [3 /*break*/, 9];
          case 8:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  var sendNotification = (entryId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, errorData, err_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            return [
              4 /*yield*/,
              fetch("/api/scheduling/waitlist", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "notify",
                  patientId: "placeholder", // Required by API but not used for notify action
                  treatmentType: "placeholder", // Required by API but not used for notify action
                  waitlistEntryId: entryId,
                  availableSlots: [], // Would be populated with actual available slots
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to send notification");
          case 4:
            // Reload waitlist to reflect updated notification status
            return [4 /*yield*/, loadWaitlistEntries()];
          case 5:
            // Reload waitlist to reflect updated notification status
            _a.sent();
            if (onNotificationSent) {
              onNotificationSent(entryId);
            }
            return [3 /*break*/, 8];
          case 6:
            err_3 = _a.sent();
            setError(err_3 instanceof Error ? err_3.message : "An unexpected error occurred");
            return [3 /*break*/, 8];
          case 7:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "notified":
        return "bg-blue-100 text-blue-800";
      case "booked":
        return "bg-purple-100 text-purple-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  var getDayName = (dayOfWeek) => {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek];
  };
  return (
    <div className="space-y-6">
      {/* Waitlist Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Users className="w-5 h-5" />
                Waitlist Management
              </card_1.CardTitle>
              <card_1.CardDescription>
                Manage patient waitlists and automated appointment notifications
              </card_1.CardDescription>
            </div>
            <div className="flex gap-2">
              <button_1.Button
                onClick={loadWaitlistEntries}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <lucide_react_1.RefreshCw
                  className={"w-4 h-4 mr-2 ".concat(isLoading ? "animate-spin" : "")}
                />
                Refresh
              </button_1.Button>
              {showAddForm && (
                <button_1.Button onClick={() => setShowForm(!showForm)} size="sm">
                  <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </button_1.Button>
              )}
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardFooter>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {waitlistEntries.length} patient{waitlistEntries.length !== 1 ? "s" : ""} on waitlist
            </span>
            <separator_1.Separator orientation="vertical" className="h-4" />
            <span>
              {
                waitlistEntries.filter(
                  (e) => e.urgencyLevel === "urgent" || e.urgencyLevel === "emergency",
                ).length
              }{" "}
              urgent case
              {waitlistEntries.filter(
                (e) => e.urgencyLevel === "urgent" || e.urgencyLevel === "emergency",
              ).length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </card_1.CardFooter>
      </card_1.Card>

      {/* Error Display */}
      {error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertTitle>Error</alert_1.AlertTitle>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Add to Waitlist Form */}
      {showForm && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.UserPlus className="w-5 h-5" />
              Add Patient to Waitlist
            </card_1.CardTitle>
            <card_1.CardDescription>
              Add a patient to the waitlist with their preferences and urgency level
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label_1.Label htmlFor="patientId">Patient ID</label_1.Label>
                <input_1.Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData(__assign(__assign({}, formData), { patientId: e.target.value }))
                  }
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <label_1.Label htmlFor="treatmentType">Treatment Type</label_1.Label>
                <input_1.Input
                  id="treatmentType"
                  value={formData.treatmentType}
                  onChange={(e) =>
                    setFormData(__assign(__assign({}, formData), { treatmentType: e.target.value }))
                  }
                  placeholder="Enter treatment type"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label_1.Label htmlFor="startDate">Preferred Start Date</label_1.Label>
                <input_1.Input
                  id="startDate"
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) =>
                    setFormData(
                      __assign(__assign({}, formData), { preferredStartDate: e.target.value }),
                    )
                  }
                />
              </div>
              <div>
                <label_1.Label htmlFor="endDate">Preferred End Date</label_1.Label>
                <input_1.Input
                  id="endDate"
                  type="date"
                  value={formData.preferredEndDate}
                  onChange={(e) =>
                    setFormData(
                      __assign(__assign({}, formData), { preferredEndDate: e.target.value }),
                    )
                  }
                />
              </div>
            </div>

            <div>
              <label_1.Label htmlFor="urgencyLevel">Urgency Level</label_1.Label>
              <select_1.Select
                value={formData.urgencyLevel}
                onValueChange={(value) =>
                  setFormData(__assign(__assign({}, formData), { urgencyLevel: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select urgency level" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="low">Low</select_1.SelectItem>
                  <select_1.SelectItem value="normal">Normal</select_1.SelectItem>
                  <select_1.SelectItem value="high">High</select_1.SelectItem>
                  <select_1.SelectItem value="urgent">Urgent</select_1.SelectItem>
                  <select_1.SelectItem value="emergency">Emergency</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div>
              <label_1.Label htmlFor="specialRequirements">
                Special Requirements (JSON)
              </label_1.Label>
              <textarea_1.Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) =>
                  setFormData(
                    __assign(__assign({}, formData), { specialRequirements: e.target.value }),
                  )
                }
                placeholder='{"accessibility": true, "language": "spanish"}'
                rows={3}
              />
            </div>
          </card_1.CardContent>
          <card_1.CardFooter className="flex gap-2">
            <button_1.Button onClick={addToWaitlist} disabled={isLoading}>
              {isLoading
                ? <lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                : <lucide_react_1.Plus className="w-4 h-4 mr-2" />}
              Add to Waitlist
            </button_1.Button>
            <button_1.Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </button_1.Button>
          </card_1.CardFooter>
        </card_1.Card>
      )}

      {/* Waitlist Entries */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Current Waitlist</card_1.CardTitle>
          <card_1.CardDescription>
            Patients waiting for available appointments, sorted by priority
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {isLoading && waitlistEntries.length === 0
            ? <div className="text-center py-8">
                <lucide_react_1.RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading waitlist...</p>
              </div>
            : waitlistEntries.length === 0
              ? <div className="text-center py-8">
                  <lucide_react_1.Users className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No patients on waitlist</p>
                </div>
              : <scroll_area_1.ScrollArea className="h-96">
                  <div className="space-y-4">
                    {waitlistEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Patient: {entry.patientId}</span>
                              <badge_1.Badge className={getUrgencyColor(entry.urgencyLevel)}>
                                {entry.urgencyLevel}
                              </badge_1.Badge>
                              <badge_1.Badge className={getStatusColor(entry.status)}>
                                {entry.status}
                              </badge_1.Badge>
                            </div>
                            <p className="text-sm text-gray-600">{entry.treatmentType}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Priority: {entry.priorityScore}
                            </div>
                            <div className="text-xs text-gray-500">
                              Notifications: {entry.notificationCount}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Preferred dates:</span>
                            <div className="text-gray-600">
                              {formatDate(entry.preferredDateRange.start.toString())} -{" "}
                              {formatDate(entry.preferredDateRange.end.toString())}
                            </div>
                          </div>

                          {entry.preferredTimeSlots && entry.preferredTimeSlots.length > 0 && (
                            <div>
                              <span className="font-medium">Preferred times:</span>
                              <div className="text-gray-600">
                                {entry.preferredTimeSlots.map((slot, index) => (
                                  <div key={index}>
                                    {slot.dayOfWeek !== undefined &&
                                      "".concat(getDayName(slot.dayOfWeek), " ")}
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {Object.keys(entry.specialRequirements).length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Special requirements:</span>
                            <div className="text-sm text-gray-600">
                              {Object.entries(entry.specialRequirements).map((_a) => {
                                var key = _a[0],
                                  value = _a[1];
                                return (
                                  <badge_1.Badge key={key} variant="outline" className="mr-1 mt-1">
                                    {key}: {String(value)}
                                  </badge_1.Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            {entry.lastNotificationAt && (
                              <>Last notified: {formatDate(entry.lastNotificationAt.toString())}</>
                            )}
                          </div>

                          {entry.status === "active" && (
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendNotification(entry.id)}
                              disabled={isLoading}
                            >
                              <lucide_react_1.Send className="w-3 h-3 mr-1" />
                              Notify
                            </button_1.Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </scroll_area_1.ScrollArea>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
