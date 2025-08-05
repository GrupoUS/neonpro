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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterPanel = FilterPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var popover_1 = require("@/components/ui/popover");
var calendar_1 = require("@/components/ui/calendar");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var collapsible_1 = require("@/components/ui/collapsible");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var DATE_PRESETS = [
  {
    label: "Today",
    value: {
      from: new Date(),
      to: new Date(),
      preset: "today",
    },
    description: "Current day",
  },
  {
    label: "Yesterday",
    value: {
      from: (0, date_fns_1.subDays)(new Date(), 1),
      to: (0, date_fns_1.subDays)(new Date(), 1),
      preset: "yesterday",
    },
    description: "Previous day",
  },
  {
    label: "Last 7 Days",
    value: {
      from: (0, date_fns_1.subDays)(new Date(), 6),
      to: new Date(),
      preset: "last7days",
    },
    description: "Past week including today",
  },
  {
    label: "Last 30 Days",
    value: {
      from: (0, date_fns_1.subDays)(new Date(), 29),
      to: new Date(),
      preset: "last30days",
    },
    description: "Past month including today",
  },
  {
    label: "This Week",
    value: {
      from: (0, date_fns_1.startOfWeek)(new Date()),
      to: (0, date_fns_1.endOfWeek)(new Date()),
      preset: "thisweek",
    },
    description: "Current week (Mon-Sun)",
  },
  {
    label: "This Month",
    value: {
      from: (0, date_fns_1.startOfMonth)(new Date()),
      to: (0, date_fns_1.endOfMonth)(new Date()),
      preset: "thismonth",
    },
    description: "Current calendar month",
  },
  {
    label: "Last Month",
    value: {
      from: (0, date_fns_1.startOfMonth)((0, date_fns_1.subDays)(new Date(), 30)),
      to: (0, date_fns_1.endOfMonth)((0, date_fns_1.subDays)(new Date(), 30)),
      preset: "lastmonth",
    },
    description: "Previous calendar month",
  },
  {
    label: "Quarter to Date",
    value: {
      from: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
      to: new Date(),
      preset: "qtd",
    },
    description: "Current quarter to date",
  },
  {
    label: "Year to Date",
    value: {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
      preset: "ytd",
    },
    description: "Current year to date",
  },
];
var DEPARTMENT_OPTIONS = [
  { value: "all", label: "All Departments" },
  { value: "reception", label: "Reception" },
  { value: "consultation", label: "Consultation" },
  { value: "treatment", label: "Treatment" },
  { value: "surgery", label: "Surgery" },
  { value: "laboratory", label: "Laboratory" },
  { value: "radiology", label: "Radiology" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "billing", label: "Billing" },
  { value: "administration", label: "Administration" },
];
var PROVIDER_OPTIONS = [
  { value: "all", label: "All Providers" },
  { value: "dr-silva", label: "Dr. Silva" },
  { value: "dr-santos", label: "Dr. Santos" },
  { value: "dr-oliveira", label: "Dr. Oliveira" },
  { value: "dr-costa", label: "Dr. Costa" },
  { value: "dr-ferreira", label: "Dr. Ferreira" },
];
var PATIENT_TYPE_OPTIONS = [
  { value: "all", label: "All Patients" },
  { value: "new", label: "New Patients" },
  { value: "returning", label: "Returning Patients" },
  { value: "emergency", label: "Emergency" },
  { value: "scheduled", label: "Scheduled" },
  { value: "walk-in", label: "Walk-in" },
];
var METRIC_CATEGORIES = [
  { value: "financial", label: "Financial", icon: lucide_react_1.TrendingUp },
  { value: "operational", label: "Operational", icon: lucide_react_1.BarChart3 },
  { value: "clinical", label: "Clinical", icon: lucide_react_1.Users },
  { value: "satisfaction", label: "Satisfaction", icon: lucide_react_1.Star },
  { value: "efficiency", label: "Efficiency", icon: lucide_react_1.Clock },
];
function FilterPanel(_a) {
  var _b, _c, _d, _e, _f, _g, _h, _j, _k;
  var filters = _a.filters,
    onFiltersChange = _a.onFiltersChange,
    clinicId = _a.clinicId,
    userId = _a.userId,
    _l = _a.className,
    className = _l === void 0 ? "" : _l,
    _m = _a.isCollapsible,
    isCollapsible = _m === void 0 ? true : _m,
    _o = _a.showPresets,
    showPresets = _o === void 0 ? true : _o,
    _p = _a.showSaveLoad,
    showSaveLoad = _p === void 0 ? true : _p;
  var _q = (0, react_1.useState)(!isCollapsible),
    isExpanded = _q[0],
    setIsExpanded = _q[1];
  var _r = (0, react_1.useState)([]),
    savedPresets = _r[0],
    setSavedPresets = _r[1];
  var _s = (0, react_1.useState)(false),
    showDatePicker = _s[0],
    setShowDatePicker = _s[1];
  var _t = (0, react_1.useState)(false),
    showSaveDialog = _t[0],
    setShowSaveDialog = _t[1];
  var _u = (0, react_1.useState)(""),
    presetName = _u[0],
    setPresetName = _u[1];
  var _v = (0, react_1.useState)(""),
    presetDescription = _v[0],
    setPresetDescription = _v[1];
  // Load saved presets
  (0, react_1.useEffect)(() => {
    var loadPresets = () =>
      __awaiter(this, void 0, void 0, function () {
        var mockPresets;
        return __generator(this, (_a) => {
          try {
            mockPresets = generateMockPresets(clinicId, userId);
            setSavedPresets(mockPresets);
          } catch (err) {
            console.error("Failed to load filter presets:", err);
          }
          return [2 /*return*/];
        });
      });
    loadPresets();
  }, [clinicId, userId]);
  // Handle filter changes
  var updateFilters = (updates) => {
    onFiltersChange(__assign(__assign({}, filters), updates));
  };
  // Handle date range selection
  var handleDatePresetSelect = (preset) => {
    updateFilters({ dateRange: preset.value });
  };
  var handleCustomDateRange = (from, to) => {
    if (from && to) {
      updateFilters({
        dateRange: {
          from: from,
          to: to,
          preset: "custom",
        },
      });
    }
  };
  // Handle department selection
  var handleDepartmentChange = (department, checked) => {
    var currentDepartments = filters.departments || [];
    var newDepartments;
    if (department === "all") {
      newDepartments = checked ? DEPARTMENT_OPTIONS.slice(1).map((d) => d.value) : [];
    } else {
      if (checked) {
        newDepartments = __spreadArray(
          __spreadArray(
            [],
            currentDepartments.filter((d) => d !== "all"),
            true,
          ),
          [department],
          false,
        );
      } else {
        newDepartments = currentDepartments.filter((d) => d !== department && d !== "all");
      }
    }
    updateFilters({ departments: newDepartments });
  };
  // Handle provider selection
  var handleProviderChange = (provider, checked) => {
    var currentProviders = filters.providers || [];
    var newProviders;
    if (provider === "all") {
      newProviders = checked ? PROVIDER_OPTIONS.slice(1).map((p) => p.value) : [];
    } else {
      if (checked) {
        newProviders = __spreadArray(
          __spreadArray(
            [],
            currentProviders.filter((p) => p !== "all"),
            true,
          ),
          [provider],
          false,
        );
      } else {
        newProviders = currentProviders.filter((p) => p !== provider && p !== "all");
      }
    }
    updateFilters({ providers: newProviders });
  };
  // Handle metric category selection
  var handleCategoryChange = (category, checked) => {
    var currentCategories = filters.categories || [];
    var newCategories;
    if (checked) {
      newCategories = __spreadArray(__spreadArray([], currentCategories, true), [category], false);
    } else {
      newCategories = currentCategories.filter((c) => c !== category);
    }
    updateFilters({ categories: newCategories });
  };
  // Save filter preset
  var handleSavePreset = () =>
    __awaiter(this, void 0, void 0, function () {
      var newPreset, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!presetName.trim()) return [2 /*return*/];
            newPreset = {
              id: "preset-".concat(Date.now()),
              name: presetName,
              description: presetDescription,
              filters: __assign({}, filters),
              createdBy: userId,
              createdAt: new Date(),
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 500))];
          case 2:
            // Simulate API call
            _a.sent();
            setSavedPresets((prev) =>
              __spreadArray(__spreadArray([], prev, true), [newPreset], false),
            );
            setShowSaveDialog(false);
            setPresetName("");
            setPresetDescription("");
            return [3 /*break*/, 4];
          case 3:
            err_1 = _a.sent();
            console.error("Failed to save preset:", err_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Load filter preset
  var handleLoadPreset = (preset) => {
    onFiltersChange(preset.filters);
  };
  // Delete filter preset
  var handleDeletePreset = (presetId) =>
    __awaiter(this, void 0, void 0, function () {
      var err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 300))];
          case 1:
            // Simulate API call
            _a.sent();
            setSavedPresets((prev) => prev.filter((p) => p.id !== presetId));
            return [3 /*break*/, 3];
          case 2:
            err_2 = _a.sent();
            console.error("Failed to delete preset:", err_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Reset filters
  var handleResetFilters = () => {
    var defaultFilters = {
      dateRange: {
        from: (0, date_fns_1.subDays)(new Date(), 29),
        to: new Date(),
        preset: "last30days",
      },
      departments: [],
      providers: [],
      patientTypes: [],
      categories: [],
      compareWith: undefined,
    };
    onFiltersChange(defaultFilters);
  };
  // Export filters
  var handleExportFilters = () => {
    var dataStr = JSON.stringify(filters, null, 2);
    var dataBlob = new Blob([dataStr], { type: "application/json" });
    var url = URL.createObjectURL(dataBlob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-filters-".concat(
      (0, date_fns_1.format)(new Date(), "yyyy-MM-dd"),
      ".json",
    );
    link.click();
    URL.revokeObjectURL(url);
  };
  // Count active filters
  var activeFilterCount =
    (((_b = filters.departments) === null || _b === void 0 ? void 0 : _b.length) || 0) +
    (((_c = filters.providers) === null || _c === void 0 ? void 0 : _c.length) || 0) +
    (((_d = filters.patientTypes) === null || _d === void 0 ? void 0 : _d.length) || 0) +
    (((_e = filters.categories) === null || _e === void 0 ? void 0 : _e.length) || 0) +
    (filters.compareWith ? 1 : 0);
  var content = (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="space-y-2">
        <label_1.Label className="text-sm font-medium flex items-center gap-2">
          <lucide_react_1.Calendar className="h-4 w-4" />
          Date Range
        </label_1.Label>

        <div className="grid grid-cols-2 gap-2">
          {DATE_PRESETS.slice(0, 6).map((preset) => {
            var _a;
            return (
              <button_1.Button
                key={preset.label}
                variant={
                  ((_a = filters.dateRange) === null || _a === void 0 ? void 0 : _a.preset) ===
                  preset.value.preset
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="text-xs h-8"
                onClick={() => handleDatePresetSelect(preset)}
              >
                {preset.label}
              </button_1.Button>
            );
          })}
        </div>

        <popover_1.Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <popover_1.PopoverTrigger asChild>
            <button_1.Button variant="outline" size="sm" className="w-full text-xs h-8">
              <lucide_react_1.Calendar className="h-3 w-3 mr-2" />
              {((_f = filters.dateRange) === null || _f === void 0 ? void 0 : _f.from) &&
              ((_g = filters.dateRange) === null || _g === void 0 ? void 0 : _g.to)
                ? ""
                    .concat((0, date_fns_1.format)(filters.dateRange.from, "MMM dd"), " - ")
                    .concat((0, date_fns_1.format)(filters.dateRange.to, "MMM dd"))
                : "Custom Range"}
            </button_1.Button>
          </popover_1.PopoverTrigger>
          <popover_1.PopoverContent className="w-auto p-0" align="start">
            <calendar_1.Calendar
              mode="range"
              selected={{
                from: (_h = filters.dateRange) === null || _h === void 0 ? void 0 : _h.from,
                to: (_j = filters.dateRange) === null || _j === void 0 ? void 0 : _j.to,
              }}
              onSelect={(range) => {
                if (
                  (range === null || range === void 0 ? void 0 : range.from) &&
                  (range === null || range === void 0 ? void 0 : range.to)
                ) {
                  handleCustomDateRange(range.from, range.to);
                  setShowDatePicker(false);
                }
              }}
              numberOfMonths={2}
            />
          </popover_1.PopoverContent>
        </popover_1.Popover>
      </div>

      <separator_1.Separator />

      {/* Compare With */}
      <div className="space-y-2">
        <label_1.Label className="text-sm font-medium">Compare With</label_1.Label>
        <select_1.Select
          value={filters.compareWith || "none"}
          onValueChange={(value) =>
            updateFilters({ compareWith: value === "none" ? undefined : value })
          }
        >
          <select_1.SelectTrigger className="h-8 text-xs">
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="none">No Comparison</select_1.SelectItem>
            <select_1.SelectItem value="previous-period">Previous Period</select_1.SelectItem>
            <select_1.SelectItem value="previous-year">Previous Year</select_1.SelectItem>
            <select_1.SelectItem value="budget">Budget</select_1.SelectItem>
            <select_1.SelectItem value="target">Target</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      <separator_1.Separator />

      {/* Metric Categories */}
      <div className="space-y-2">
        <label_1.Label className="text-sm font-medium flex items-center gap-2">
          <lucide_react_1.Tag className="h-4 w-4" />
          Metric Categories
        </label_1.Label>
        <div className="space-y-2">
          {METRIC_CATEGORIES.map((category) => {
            var _a;
            var Icon = category.icon;
            var isChecked =
              ((_a = filters.categories) === null || _a === void 0
                ? void 0
                : _a.includes(category.value)) || false;
            return (
              <div key={category.value} className="flex items-center space-x-2">
                <checkbox_1.Checkbox
                  id={"category-".concat(category.value)}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCategoryChange(category.value, !!checked)}
                />
                <label
                  htmlFor={"category-".concat(category.value)}
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Icon className="h-3 w-3" />
                  {category.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <separator_1.Separator />

      {/* Departments */}
      <collapsible_1.Collapsible>
        <collapsible_1.CollapsibleTrigger asChild>
          <button_1.Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
            <label_1.Label className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Building className="h-4 w-4" />
              Departments
              {filters.departments && filters.departments.length > 0 && (
                <badge_1.Badge variant="secondary" className="text-xs">
                  {filters.departments.length}
                </badge_1.Badge>
              )}
            </label_1.Label>
            <lucide_react_1.ChevronDown className="h-4 w-4" />
          </button_1.Button>
        </collapsible_1.CollapsibleTrigger>
        <collapsible_1.CollapsibleContent className="space-y-2 mt-2">
          <scroll_area_1.ScrollArea className="h-32">
            <div className="space-y-2">
              {DEPARTMENT_OPTIONS.map((dept) => {
                var _a, _b;
                var isChecked =
                  dept.value === "all"
                    ? ((_a = filters.departments) === null || _a === void 0
                        ? void 0
                        : _a.length) ===
                      DEPARTMENT_OPTIONS.length - 1
                    : ((_b = filters.departments) === null || _b === void 0
                        ? void 0
                        : _b.includes(dept.value)) || false;
                return (
                  <div key={dept.value} className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id={"dept-".concat(dept.value)}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleDepartmentChange(dept.value, !!checked)}
                    />
                    <label
                      htmlFor={"dept-".concat(dept.value)}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dept.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </scroll_area_1.ScrollArea>
        </collapsible_1.CollapsibleContent>
      </collapsible_1.Collapsible>

      <separator_1.Separator />

      {/* Providers */}
      <collapsible_1.Collapsible>
        <collapsible_1.CollapsibleTrigger asChild>
          <button_1.Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
            <label_1.Label className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Users className="h-4 w-4" />
              Providers
              {filters.providers && filters.providers.length > 0 && (
                <badge_1.Badge variant="secondary" className="text-xs">
                  {filters.providers.length}
                </badge_1.Badge>
              )}
            </label_1.Label>
            <lucide_react_1.ChevronDown className="h-4 w-4" />
          </button_1.Button>
        </collapsible_1.CollapsibleTrigger>
        <collapsible_1.CollapsibleContent className="space-y-2 mt-2">
          <scroll_area_1.ScrollArea className="h-32">
            <div className="space-y-2">
              {PROVIDER_OPTIONS.map((provider) => {
                var _a, _b;
                var isChecked =
                  provider.value === "all"
                    ? ((_a = filters.providers) === null || _a === void 0 ? void 0 : _a.length) ===
                      PROVIDER_OPTIONS.length - 1
                    : ((_b = filters.providers) === null || _b === void 0
                        ? void 0
                        : _b.includes(provider.value)) || false;
                return (
                  <div key={provider.value} className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id={"provider-".concat(provider.value)}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleProviderChange(provider.value, !!checked)}
                    />
                    <label
                      htmlFor={"provider-".concat(provider.value)}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {provider.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </scroll_area_1.ScrollArea>
        </collapsible_1.CollapsibleContent>
      </collapsible_1.Collapsible>

      <separator_1.Separator />

      {/* Patient Types */}
      <div className="space-y-2">
        <label_1.Label className="text-sm font-medium">Patient Types</label_1.Label>
        <select_1.Select
          value={((_k = filters.patientTypes) === null || _k === void 0 ? void 0 : _k[0]) || "all"}
          onValueChange={(value) => updateFilters({ patientTypes: value === "all" ? [] : [value] })}
        >
          <select_1.SelectTrigger className="h-8 text-xs">
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            {PATIENT_TYPE_OPTIONS.map((type) => (
              <select_1.SelectItem key={type.value} value={type.value}>
                {type.label}
              </select_1.SelectItem>
            ))}
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      {/* Saved Presets */}
      {showPresets && savedPresets.length > 0 && (
        <>
          <separator_1.Separator />
          <div className="space-y-2">
            <label_1.Label className="text-sm font-medium">Saved Presets</label_1.Label>
            <div className="space-y-1">
              {savedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 border rounded text-xs"
                >
                  <div className="flex-1">
                    <div className="font-medium">{preset.name}</div>
                    {preset.description && (
                      <div className="text-muted-foreground text-xs">{preset.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <lucide_react_1.Upload className="h-3 w-3" />
                    </button_1.Button>
                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <lucide_react_1.Trash2 className="h-3 w-3" />
                    </button_1.Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <separator_1.Separator />
      <div className="flex items-center gap-2">
        <button_1.Button
          size="sm"
          variant="outline"
          onClick={handleResetFilters}
          className="flex-1"
        >
          <lucide_react_1.RefreshCw className="h-3 w-3 mr-2" />
          Reset
        </button_1.Button>

        {showSaveLoad && (
          <>
            <button_1.Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}>
              <lucide_react_1.Save className="h-3 w-3 mr-2" />
              Save
            </button_1.Button>
            <button_1.Button size="sm" variant="outline" onClick={handleExportFilters}>
              <lucide_react_1.Download className="h-3 w-3" />
            </button_1.Button>
          </>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="space-y-2 p-3 border rounded bg-muted">
          <label_1.Label className="text-sm font-medium">Save Filter Preset</label_1.Label>
          <input_1.Input
            placeholder="Preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="h-8 text-xs"
          />
          <input_1.Input
            placeholder="Description (optional)"
            value={presetDescription}
            onChange={(e) => setPresetDescription(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <button_1.Button size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save
            </button_1.Button>
            <button_1.Button size="sm" variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </button_1.Button>
          </div>
        </div>
      )}
    </div>
  );
  if (isCollapsible) {
    return (
      <card_1.Card className={className}>
        <card_1.CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <badge_1.Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </badge_1.Badge>
              )}
            </card_1.CardTitle>
            <button_1.Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded
                ? <lucide_react_1.ChevronUp className="h-3 w-3" />
                : <lucide_react_1.ChevronDown className="h-3 w-3" />}
            </button_1.Button>
          </div>
        </card_1.CardHeader>

        {isExpanded && (
          <card_1.CardContent className="pt-0">
            <scroll_area_1.ScrollArea className="h-96">{content}</scroll_area_1.ScrollArea>
          </card_1.CardContent>
        )}
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader className="pb-2">
        <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
          <lucide_react_1.Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <badge_1.Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </badge_1.Badge>
          )}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="pt-0">{content}</card_1.CardContent>
    </card_1.Card>
  );
}
// Helper function to generate mock presets
function generateMockPresets(clinicId, userId) {
  return [
    {
      id: "preset-1",
      name: "Monthly Financial Review",
      description: "Financial metrics for current month",
      filters: {
        dateRange: {
          from: (0, date_fns_1.startOfMonth)(new Date()),
          to: (0, date_fns_1.endOfMonth)(new Date()),
          preset: "thismonth",
        },
        categories: ["financial"],
        departments: ["billing", "administration"],
        providers: [],
        patientTypes: [],
        compareWith: "previous-period",
      },
      isDefault: true,
      createdBy: userId,
      createdAt: new Date(),
    },
    {
      id: "preset-2",
      name: "Operational Dashboard",
      description: "Key operational metrics",
      filters: {
        dateRange: {
          from: (0, date_fns_1.subDays)(new Date(), 6),
          to: new Date(),
          preset: "last7days",
        },
        categories: ["operational", "efficiency"],
        departments: ["reception", "consultation", "treatment"],
        providers: [],
        patientTypes: [],
        compareWith: undefined,
      },
      createdBy: userId,
      createdAt: new Date(),
    },
  ];
}
