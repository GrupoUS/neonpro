"use client";
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
exports.default = AISchedulingOptimizer;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
function AISchedulingOptimizer() {
  var _a = (0, react_1.useState)(""),
    patientId = _a[0],
    setPatientId = _a[1];
  var _b = (0, react_1.useState)(""),
    treatmentType = _b[0],
    setTreatmentType = _b[1];
  var _c = (0, react_1.useState)(""),
    preferredDateStart = _c[0],
    setPreferredDateStart = _c[1];
  var _d = (0, react_1.useState)(""),
    preferredDateEnd = _d[0],
    setPreferredDateEnd = _d[1];
  var _e = (0, react_1.useState)("60"),
    durationMinutes = _e[0],
    setDurationMinutes = _e[1];
  var _f = (0, react_1.useState)(""),
    staffPreference = _f[0],
    setStaffPreference = _f[1];
  var _g = (0, react_1.useState)("normal"),
    priority = _g[0],
    setPriority = _g[1];
  var _h = (0, react_1.useState)(false),
    isLoading = _h[0],
    setIsLoading = _h[1];
  var _j = (0, react_1.useState)(null),
    error = _j[0],
    setError = _j[1];
  var _k = (0, react_1.useState)([]),
    optimizedSlots = _k[0],
    setOptimizedSlots = _k[1];
  var _l = (0, react_1.useState)(null),
    metadata = _l[0],
    setMetadata = _l[1];
  var _m = (0, react_1.useState)([]),
    recommendations = _m[0],
    setRecommendations = _m[1];
  var handleOptimizeScheduling = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!patientId || !treatmentType || !preferredDateStart || !preferredDateEnd) {
              setError("Please fill in all required fields");
              return [2 /*return*/];
            }
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            return [
              4 /*yield*/,
              fetch("/api/ai/scheduling/optimize", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  patient_id: patientId,
                  treatment_type: treatmentType,
                  preferred_date_range: {
                    start: preferredDateStart,
                    end: preferredDateEnd,
                  },
                  duration_minutes: parseInt(durationMinutes),
                  staff_preference: staffPreference || undefined,
                  priority: priority,
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            if (!response.ok) {
              throw new Error(data.error || "Failed to optimize scheduling");
            }
            setOptimizedSlots(data.data.suggested_slots);
            setMetadata(data.data.optimization_metadata);
            setRecommendations(data.data.recommendations);
            return [3 /*break*/, 6];
          case 4:
            err_1 = _a.sent();
            setError(err_1 instanceof Error ? err_1.message : "Failed to optimize scheduling");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var formatTime = (timeString) => new Date(timeString).toLocaleString();
  var getConfidenceColor = (score) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  return (
    <div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.SparklesIcon className="h-5 w-5" />
            AI-Powered Scheduling Optimizer
          </card_1.CardTitle>
          <card_1.CardDescription>
            Leverage machine learning to find optimal appointment slots based on patient
            preferences, staff efficiency, and clinic capacity patterns.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {/* Patient and Treatment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="patient-id">Patient ID</label_1.Label>
              <input_1.Input
                id="patient-id"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
              />
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="treatment-type">Treatment Type</label_1.Label>
              <select_1.Select value={treatmentType} onValueChange={setTreatmentType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select treatment type" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="consultation">Consultation</select_1.SelectItem>
                  <select_1.SelectItem value="dental_cleaning">Dental Cleaning</select_1.SelectItem>
                  <select_1.SelectItem value="root_canal">Root Canal</select_1.SelectItem>
                  <select_1.SelectItem value="filling">Filling</select_1.SelectItem>
                  <select_1.SelectItem value="crown">Crown Procedure</select_1.SelectItem>
                  <select_1.SelectItem value="extraction">Tooth Extraction</select_1.SelectItem>
                  <select_1.SelectItem value="checkup">Regular Checkup</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          {/* Date Range and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="date-start">Preferred Start Date</label_1.Label>
              <input_1.Input
                id="date-start"
                type="datetime-local"
                value={preferredDateStart}
                onChange={(e) => setPreferredDateStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="date-end">Preferred End Date</label_1.Label>
              <input_1.Input
                id="date-end"
                type="datetime-local"
                value={preferredDateEnd}
                onChange={(e) => setPreferredDateEnd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="duration">Duration (minutes)</label_1.Label>
              <select_1.Select value={durationMinutes} onValueChange={setDurationMinutes}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="30">30 minutes</select_1.SelectItem>
                  <select_1.SelectItem value="45">45 minutes</select_1.SelectItem>
                  <select_1.SelectItem value="60">60 minutes</select_1.SelectItem>
                  <select_1.SelectItem value="90">90 minutes</select_1.SelectItem>
                  <select_1.SelectItem value="120">120 minutes</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          {/* Optional Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="staff-preference">Staff Preference (Optional)</label_1.Label>
              <input_1.Input
                id="staff-preference"
                value={staffPreference}
                onChange={(e) => setStaffPreference(e.target.value)}
                placeholder="Enter preferred staff ID"
              />
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="priority">Priority Level</label_1.Label>
              <select_1.Select value={priority} onValueChange={setPriority}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="low">Low Priority</select_1.SelectItem>
                  <select_1.SelectItem value="normal">Normal Priority</select_1.SelectItem>
                  <select_1.SelectItem value="high">High Priority</select_1.SelectItem>
                  <select_1.SelectItem value="urgent">Urgent</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <button_1.Button
            onClick={handleOptimizeScheduling}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Optimizing..." : "Find Optimal Slots"}
          </button_1.Button>

          {error && (
            <alert_1.Alert className="border-red-200 bg-red-50">
              <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
            </alert_1.Alert>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Optimization Results */}
      {optimizedSlots.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.TrendingUpIcon className="h-5 w-5" />
              AI Optimization Results
            </card_1.CardTitle>
            <card_1.CardDescription>
              Recommended appointment slots based on AI analysis of multiple factors
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {/* Metadata Summary */}
            {metadata && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metadata.total_slots_analyzed}</div>
                  <div className="text-sm text-gray-600">Slots Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(metadata.ai_confidence_range.average * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(metadata.patient_preference_influence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Patient Influence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(metadata.staff_efficiency_influence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Staff Efficiency</div>
                </div>
              </div>
            )}

            {/* Optimized Slots */}
            <div className="space-y-3">
              {optimizedSlots.map((slot, index) => (
                <card_1.Card key={slot.slot_id} className="border-l-4 border-l-blue-500">
                  <card_1.CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <badge_1.Badge
                          className={"".concat(getConfidenceColor(slot.confidence_score))}
                        >
                          {Math.round(slot.confidence_score * 100)}% Confidence
                        </badge_1.Badge>
                        {index === 0 && (
                          <badge_1.Badge className="bg-blue-100 text-blue-800">
                            AI Recommended
                          </badge_1.Badge>
                        )}
                      </div>
                      <button_1.Button size="sm">Book Appointment</button_1.Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatTime(slot.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <lucide_react_1.ClockIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">to {formatTime(slot.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <lucide_react_1.UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{slot.staff_name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Patient Score: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.patient_preference_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Staff Score: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.staff_efficiency_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Capacity Score: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.clinic_capacity_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.historical_success_rate * 100)}%
                        </span>
                      </div>
                    </div>

                    {slot.reasons.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Why this slot:</strong> {slot.reasons.join(", ")}
                      </div>
                    )}
                  </card_1.CardContent>
                </card_1.Card>
              ))}
            </div>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <card_1.Card className="bg-blue-50 border-blue-200">
                <card_1.CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <lucide_react_1.SparklesIcon className="h-4 w-4" />
                    AI Recommendations
                  </h4>
                  <ul className="text-sm space-y-1 text-blue-800">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </card_1.CardContent>
              </card_1.Card>
            )}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
