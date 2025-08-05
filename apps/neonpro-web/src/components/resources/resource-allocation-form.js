// =====================================================
// Resource Allocation Form Component
// Story 2.4: Smart Resource Management - Frontend
// =====================================================
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
exports.default = ResourceAllocationForm;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var outline_1 = require("@heroicons/react/24/outline");
var sonner_1 = require("sonner");
function ResourceAllocationForm(_a) {
  var _b, _c, _d, _e, _f, _g;
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    clinicId = _a.clinicId,
    defaultValues = _a.defaultValues,
    onSuccess = _a.onSuccess;
  var _h = (0, react_1.useState)({
      resource_id: "",
      start_time: "",
      end_time: "",
      allocation_type: "appointment",
      notes: "",
    }),
    formData = _h[0],
    setFormData = _h[1];
  var _j = (0, react_1.useState)([]),
    resources = _j[0],
    setResources = _j[1];
  var _k = (0, react_1.useState)([]),
    conflicts = _k[0],
    setConflicts = _k[1];
  var _l = (0, react_1.useState)(false),
    loading = _l[0],
    setLoading = _l[1];
  var _m = (0, react_1.useState)(false),
    checking = _m[0],
    setChecking = _m[1];
  // =====================================================
  // Effects
  // =====================================================
  (0, react_1.useEffect)(() => {
    if (open) {
      fetchResources();
      if (defaultValues) {
        setFormData((prev) => __assign(__assign({}, prev), defaultValues));
      }
    }
  }, [open, defaultValues]);
  (0, react_1.useEffect)(() => {
    if (formData.resource_id && formData.start_time && formData.end_time) {
      checkConflicts();
    }
  }, [formData.resource_id, formData.start_time, formData.end_time]);
  // =====================================================
  // Data Fetching
  // =====================================================
  var fetchResources = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/resources?clinic_id=".concat(clinicId, "&status=available")),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setResources(data.data);
            } else {
              sonner_1.toast.error("Failed to fetch available resources");
            }
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching resources:", error_1);
            sonner_1.toast.error("Error loading resources");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var checkConflicts = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setChecking(true);
            return [
              4 /*yield*/,
              fetch("/api/resources/allocations/conflicts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  resource_id: formData.resource_id,
                  start_time: formData.start_time,
                  end_time: formData.end_time,
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setConflicts(data.data.conflicts || []);
            }
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Error checking conflicts:", error_2);
            return [3 /*break*/, 5];
          case 4:
            setChecking(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // =====================================================
  // Form Handlers
  // =====================================================
  var handleInputChange = (field, value) => {
    setFormData((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  var handleSubmit = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!formData.resource_id || !formData.start_time || !formData.end_time) {
              sonner_1.toast.error("Please fill in all required fields");
              return [2 /*return*/];
            }
            if (conflicts.length > 0) {
              sonner_1.toast.error("Please resolve conflicts before creating allocation");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            setLoading(true);
            return [
              4 /*yield*/,
              fetch("/api/resources/allocations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(__assign({ clinic_id: clinicId }, formData)),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            if (data.success) {
              sonner_1.toast.success("Resource allocation created successfully");
              onOpenChange(false);
              onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
              resetForm();
            } else {
              sonner_1.toast.error(data.error || "Failed to create allocation");
            }
            return [3 /*break*/, 6];
          case 4:
            error_3 = _a.sent();
            console.error("Error creating allocation:", error_3);
            sonner_1.toast.error("Error creating allocation");
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var resetForm = () => {
    setFormData({
      resource_id: "",
      start_time: "",
      end_time: "",
      allocation_type: "appointment",
      notes: "",
    });
    setConflicts([]);
  };
  // =====================================================
  // UI Helpers
  // =====================================================
  var getSelectedResource = () => resources.find((r) => r.id === formData.resource_id);
  var formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString();
  };
  var getConflictSeverity = (confidence) => {
    if (confidence >= 0.8) return "high";
    if (confidence >= 0.5) return "medium";
    return "low";
  };
  // =====================================================
  // Render Components
  // =====================================================
  var ConflictAlert = (_a) => {
    var conflict = _a.conflict;
    return (
      <div
        className={"p-3 rounded-md border ".concat(
          getConflictSeverity(conflict.confidence_score) === "high"
            ? "bg-red-50 border-red-200"
            : getConflictSeverity(conflict.confidence_score) === "medium"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-blue-50 border-blue-200",
        )}
      >
        <div className="flex items-start space-x-2">
          <outline_1.AlertTriangleIcon
            className={"h-5 w-5 mt-0.5 ".concat(
              getConflictSeverity(conflict.confidence_score) === "high"
                ? "text-red-500"
                : getConflictSeverity(conflict.confidence_score) === "medium"
                  ? "text-yellow-500"
                  : "text-blue-500",
            )}
          />
          <div className="flex-1">
            <div className="font-medium text-sm">Conflict with {conflict.resource_name}</div>
            <div className="text-sm text-gray-600 mt-1">{conflict.reason}</div>
            {conflict.alternative_time && (
              <div className="text-sm text-blue-600 mt-1">
                <strong>Suggested:</strong> {formatDateTime(conflict.alternative_time)}
              </div>
            )}
            <div className="mt-2">
              <badge_1.Badge
                variant={
                  getConflictSeverity(conflict.confidence_score) === "high"
                    ? "destructive"
                    : getConflictSeverity(conflict.confidence_score) === "medium"
                      ? "secondary"
                      : "default"
                }
              >
                {Math.round(conflict.confidence_score * 100)}% confidence
              </badge_1.Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // =====================================================
  // Main Render
  // =====================================================
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Create Resource Allocation</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Allocate a resource for an appointment or maintenance period
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Selection */}
          <div className="space-y-2">
            <label_1.Label htmlFor="resource">Resource *</label_1.Label>
            <select_1.Select
              value={formData.resource_id}
              onValueChange={(value) => handleInputChange("resource_id", value)}
            >
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select a resource" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {resources.map((resource) => (
                  <select_1.SelectItem key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type})
                    {resource.location && " - ".concat(resource.location)}
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>
            {getSelectedResource() && (
              <div className="text-sm text-gray-600 mt-2">
                <div>
                  Type: {(_b = getSelectedResource()) === null || _b === void 0 ? void 0 : _b.type}
                </div>
                <div>
                  Capacity:{" "}
                  {(_c = getSelectedResource()) === null || _c === void 0 ? void 0 : _c.capacity}
                </div>
                {((_d = getSelectedResource()) === null || _d === void 0
                  ? void 0
                  : _d.cost_per_hour) && (
                  <div>
                    Cost: $
                    {(_e = getSelectedResource()) === null || _e === void 0
                      ? void 0
                      : _e.cost_per_hour}
                    /hour
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="start_time">Start Time *</label_1.Label>
              <input_1.Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="end_time">End Time *</label_1.Label>
              <input_1.Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Allocation Type */}
          <div className="space-y-2">
            <label_1.Label htmlFor="allocation_type">Allocation Type</label_1.Label>
            <select_1.Select
              value={formData.allocation_type}
              onValueChange={(value) => handleInputChange("allocation_type", value)}
            >
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select allocation type" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="appointment">Appointment</select_1.SelectItem>
                <select_1.SelectItem value="maintenance">Maintenance</select_1.SelectItem>
                <select_1.SelectItem value="cleaning">Cleaning</select_1.SelectItem>
                <select_1.SelectItem value="training">Training</select_1.SelectItem>
                <select_1.SelectItem value="emergency">Emergency</select_1.SelectItem>
                <select_1.SelectItem value="blocked">Blocked</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Appointment ID (if applicable) */}
          {formData.allocation_type === "appointment" && (
            <div className="space-y-2">
              <label_1.Label htmlFor="appointment_id">Appointment ID</label_1.Label>
              <input_1.Input
                id="appointment_id"
                value={formData.appointment_id || ""}
                onChange={(e) => handleInputChange("appointment_id", e.target.value)}
                placeholder="Optional - link to specific appointment"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label_1.Label htmlFor="notes">Notes</label_1.Label>
            <textarea_1.Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Conflict Checking */}
          {checking && (
            <div className="text-center py-4 text-gray-600">Checking for conflicts...</div>
          )}

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg text-red-600 flex items-center">
                  <outline_1.AlertTriangleIcon className="h-5 w-5 mr-2" />
                  Scheduling Conflicts Detected
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Please review and resolve these conflicts before proceeding
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <ConflictAlert key={index} conflict={conflict} />
                ))}
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Duration and Cost Calculation */}
          {formData.start_time && formData.end_time && getSelectedResource() && (
            <card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Duration:</strong>{" "}
                    {Math.round(
                      (new Date(formData.end_time).getTime() -
                        new Date(formData.start_time).getTime()) /
                        (1000 * 60),
                    )}{" "}
                    minutes
                  </div>
                  {((_f = getSelectedResource()) === null || _f === void 0
                    ? void 0
                    : _f.cost_per_hour) && (
                    <div>
                      <strong>Estimated Cost:</strong> $
                      {Math.round(
                        ((new Date(formData.end_time).getTime() -
                          new Date(formData.start_time).getTime()) /
                          (1000 * 60 * 60)) *
                          (((_g = getSelectedResource()) === null || _g === void 0
                            ? void 0
                            : _g.cost_per_hour) || 0) *
                          100,
                      ) / 100}
                    </div>
                  )}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </form>

        <dialog_1.DialogFooter>
          <button_1.Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </button_1.Button>
          <button_1.Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || conflicts.length > 0}
          >
            {loading ? "Creating..." : "Create Allocation"}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
