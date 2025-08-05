"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SegmentBuilder;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var zod_1 = require("zod");
// import { CreateSegmentSchema } from '@/lib/validations/segmentation';
var CreateSegmentSchema = zod_1.z.object({
  name: zod_1.z.string().min(1),
  description: zod_1.z.string().optional(),
  criteria: zod_1.z.array(
    zod_1.z.object({
      field: zod_1.z.string(),
      operator: zod_1.z.string(),
      value: zod_1.z.string(),
      logicalOperator: zod_1.z.enum(["AND", "OR"]).optional(),
    }),
  ),
  ai_model_config: zod_1.z.object({
    model_type: zod_1.z.string(),
    confidence_threshold: zod_1.z.number(),
    update_frequency: zod_1.z.string(),
  }),
});
function SegmentBuilder() {
  var _this = this;
  var _a = (0, react_1.useState)(""),
    segmentName = _a[0],
    setSegmentName = _a[1];
  var _b = (0, react_1.useState)(""),
    segmentDescription = _b[0],
    setSegmentDescription = _b[1];
  var _c = (0, react_1.useState)([{ id: "1", field: "", operator: "", value: "" }]),
    criteria = _c[0],
    setCriteria = _c[1];
  var _d = (0, react_1.useState)(null),
    preview = _d[0],
    setPreview = _d[1];
  var _e = (0, react_1.useState)(false),
    isBuilding = _e[0],
    setIsBuilding = _e[1];
  var _f = (0, react_1.useState)([]),
    validationErrors = _f[0],
    setValidationErrors = _f[1];
  var fieldOptions = [
    { value: "age", label: "Age" },
    { value: "gender", label: "Gender" },
    { value: "location", label: "Location" },
    { value: "service_history", label: "Service History" },
    { value: "appointment_frequency", label: "Appointment Frequency" },
    { value: "last_visit", label: "Last Visit" },
    { value: "total_spent", label: "Total Spent" },
    { value: "preferred_practitioner", label: "Preferred Practitioner" },
    { value: "communication_preference", label: "Communication Preference" },
    { value: "membership_status", label: "Membership Status" },
  ];
  var operatorOptions = {
    age: [
      { value: "equals", label: "Equals" },
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
    ],
    gender: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
    location: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "starts_with", label: "Starts with" },
    ],
    service_history: [
      { value: "contains", label: "Contains" },
      { value: "not_contains", label: "Does not contain" },
      { value: "count_greater_than", label: "Count greater than" },
    ],
    appointment_frequency: [
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "equals", label: "Equals" },
    ],
    last_visit: [
      { value: "within_days", label: "Within last X days" },
      { value: "before_days", label: "Before X days ago" },
      { value: "between_dates", label: "Between dates" },
    ],
    total_spent: [
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
    ],
    preferred_practitioner: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
    communication_preference: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
    ],
    membership_status: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
  };
  var addCriteria = function () {
    var newCriteria = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: "",
      logicalOperator: "AND",
    };
    setCriteria(__spreadArray(__spreadArray([], criteria, true), [newCriteria], false));
  };
  var removeCriteria = function (id) {
    setCriteria(
      criteria.filter(function (c) {
        return c.id !== id;
      }),
    );
  };
  var updateCriteria = function (id, field, value) {
    setCriteria(
      criteria.map(function (c) {
        var _a;
        return c.id === id ? __assign(__assign({}, c), ((_a = {}), (_a[field] = value), _a)) : c;
      }),
    );
  };
  var validateSegment = function () {
    var errors = [];
    if (!segmentName.trim()) {
      errors.push("Segment name is required");
    }
    if (criteria.length === 0) {
      errors.push("At least one criteria is required");
    }
    criteria.forEach(function (criterion, index) {
      if (!criterion.field) {
        errors.push("Criteria ".concat(index + 1, ": Field is required"));
      }
      if (!criterion.operator) {
        errors.push("Criteria ".concat(index + 1, ": Operator is required"));
      }
      if (!criterion.value) {
        errors.push("Criteria ".concat(index + 1, ": Value is required"));
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };
  var generatePreview = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockPreview, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!validateSegment()) return [2 /*return*/];
            setIsBuilding(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simulate API call for segment preview
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1500);
              }),
            ];
          case 2:
            // Simulate API call for segment preview
            _a.sent();
            mockPreview = {
              estimatedSize: Math.floor(Math.random() * 500) + 50,
              characteristics: {
                averageAge: Math.floor(Math.random() * 20) + 25,
                genderDistribution: {
                  male: Math.floor(Math.random() * 40) + 30,
                  female: Math.floor(Math.random() * 40) + 30,
                  other: Math.floor(Math.random() * 10) + 5,
                },
                locationDistribution: {
                  "São Paulo": Math.floor(Math.random() * 40) + 30,
                  "Rio de Janeiro": Math.floor(Math.random() * 30) + 20,
                  "Belo Horizonte": Math.floor(Math.random() * 20) + 15,
                  Other: Math.floor(Math.random() * 15) + 10,
                },
                servicePreferences: {
                  "Facial Treatments": Math.floor(Math.random() * 35) + 25,
                  "Body Treatments": Math.floor(Math.random() * 30) + 20,
                  "Aesthetic Procedures": Math.floor(Math.random() * 25) + 15,
                  "Wellness Services": Math.floor(Math.random() * 20) + 10,
                },
              },
            };
            setPreview(mockPreview);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to generate preview:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsBuilding(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var saveSegment = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var segmentData, validatedData, response, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!validateSegment()) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            segmentData = {
              name: segmentName,
              description: segmentDescription,
              criteria: criteria.filter(function (c) {
                return c.field && c.operator && c.value;
              }),
              ai_model_config: {
                model_type: "demographic_clustering",
                confidence_threshold: 0.8,
                update_frequency: "daily",
              },
            };
            validatedData = CreateSegmentSchema.parse(segmentData);
            return [
              4 /*yield*/,
              fetch("/api/segmentation/segments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validatedData),
              }),
            ];
          case 2:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to save segment");
            // Reset form
            setSegmentName("");
            setSegmentDescription("");
            setCriteria([{ id: "1", field: "", operator: "", value: "" }]);
            setPreview(null);
            setValidationErrors([]);
            alert("Segment saved successfully!");
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Failed to save segment:", error_2);
            alert("Failed to save segment. Please try again.");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var exportSegment = function () {
    var exportData = {
      name: segmentName,
      description: segmentDescription,
      criteria: criteria,
      preview: preview,
      createdAt: new Date().toISOString(),
    };
    var blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "segment-".concat(segmentName.replace(/\s+/g, "-").toLowerCase(), ".json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      {/* Segment Builder Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Custom Segment Builder</card_1.CardTitle>
          <card_1.CardDescription>
            Create targeted patient segments using drag-and-drop criteria builder
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="segment-name">Segment Name</label_1.Label>
              <input_1.Input
                id="segment-name"
                value={segmentName}
                onChange={function (e) {
                  return setSegmentName(e.target.value);
                }}
                placeholder="e.g., High-Value Customers"
              />
            </div>
            <div>
              <label_1.Label htmlFor="segment-description">Description</label_1.Label>
              <textarea_1.Textarea
                id="segment-description"
                value={segmentDescription}
                onChange={function (e) {
                  return setSegmentDescription(e.target.value);
                }}
                placeholder="Describe this segment..."
                rows={3}
              />
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Criteria Builder */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Segment Criteria</card_1.CardTitle>
          <card_1.CardDescription>
            Define the conditions that determine segment membership
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {criteria.map(function (criterion, index) {
            var _a;
            return (
              <div key={criterion.id} className="border rounded-lg p-4 space-y-4">
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <select_1.Select
                      value={criterion.logicalOperator || "AND"}
                      onValueChange={function (value) {
                        return updateCriteria(criterion.id, "logicalOperator", value);
                      }}
                    >
                      <select_1.SelectTrigger className="w-20">
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="AND">AND</select_1.SelectItem>
                        <select_1.SelectItem value="OR">OR</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label_1.Label>Field</label_1.Label>
                    <select_1.Select
                      value={criterion.field}
                      onValueChange={function (value) {
                        return updateCriteria(criterion.id, "field", value);
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select field" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {fieldOptions.map(function (option) {
                          return (
                            <select_1.SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label>Operator</label_1.Label>
                    <select_1.Select
                      value={criterion.operator}
                      onValueChange={function (value) {
                        return updateCriteria(criterion.id, "operator", value);
                      }}
                      disabled={!criterion.field}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select operator" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {criterion.field &&
                          ((_a = operatorOptions[criterion.field]) === null || _a === void 0
                            ? void 0
                            : _a.map(function (option) {
                                return (
                                  <select_1.SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </select_1.SelectItem>
                                );
                              }))}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label>Value</label_1.Label>
                    <input_1.Input
                      value={criterion.value}
                      onChange={function (e) {
                        return updateCriteria(criterion.id, "value", e.target.value);
                      }}
                      placeholder="Enter value"
                    />
                  </div>

                  <div className="flex items-end">
                    <button_1.Button
                      variant="outline"
                      size="sm"
                      onClick={function () {
                        return removeCriteria(criterion.id);
                      }}
                      disabled={criteria.length === 1}
                    >
                      <lucide_react_1.Trash2 className="h-4 w-4" />
                    </button_1.Button>
                  </div>
                </div>
              </div>
            );
          })}

          <button_1.Button variant="outline" onClick={addCriteria} className="w-full">
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Add Criteria
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map(function (error, index) {
                return <li key={index}>{error}</li>;
              })}
            </ul>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Preview Section */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Segment Preview</card_1.CardTitle>
          <card_1.CardDescription>
            Preview segment size and characteristics before saving
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex gap-2 mb-4">
            <button_1.Button onClick={generatePreview} disabled={isBuilding}>
              <lucide_react_1.Eye className="h-4 w-4 mr-2" />
              {isBuilding ? "Generating..." : "Generate Preview"}
            </button_1.Button>
          </div>

          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="text-2xl font-bold">{preview.estimatedSize}</div>
                    <div className="text-sm text-muted-foreground">Estimated Patients</div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="text-2xl font-bold">{preview.characteristics.averageAge}</div>
                    <div className="text-sm text-muted-foreground">Average Age</div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">Gender Distribution</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Male</span>
                        <span>{preview.characteristics.genderDistribution.male}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Female</span>
                        <span>{preview.characteristics.genderDistribution.female}%</span>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">Top Services</div>
                    <div className="space-y-1">
                      {Object.entries(preview.characteristics.servicePreferences)
                        .slice(0, 2)
                        .map(function (_a) {
                          var service = _a[0],
                            percentage = _a[1];
                          return (
                            <div key={service} className="flex justify-between text-sm">
                              <span className="truncate">{service}</span>
                              <span>{percentage}%</span>
                            </div>
                          );
                        })}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Actions */}
      <div className="flex gap-2">
        <button_1.Button onClick={saveSegment} disabled={!preview}>
          Save Segment
        </button_1.Button>
        <button_1.Button variant="outline" onClick={exportSegment} disabled={!preview}>
          <lucide_react_1.Download className="h-4 w-4 mr-2" />
          Export
        </button_1.Button>
        <button_1.Button variant="outline" disabled={!preview}>
          <lucide_react_1.Share2 className="h-4 w-4 mr-2" />
          Share
        </button_1.Button>
      </div>
    </div>
  );
}
