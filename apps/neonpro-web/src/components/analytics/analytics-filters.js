/**
 * Analytics Filters Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Provides comprehensive filtering capabilities for analytics data including:
 * - Time range selection (preset and custom ranges)
 * - Patient demographic filters
 * - Procedure type and category filters
 * - Outcome severity and status filters
 * - Provider and location filters
 * - Data source and model version filters
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsFilters = AnalyticsFilters;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var date_picker_1 = require("@/components/ui/date-picker");
var popover_1 = require("@/components/ui/popover");
var lucide_react_1 = require("lucide-react");
// Analytics Engine
var analytics_1 = require("@/lib/analytics");
function AnalyticsFilters(_a) {
    var _this = this;
    var filters = _a.filters, onFiltersChange = _a.onFiltersChange, clinicId = _a.clinicId;
    var _b = (0, react_1.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = (0, react_1.useState)(''), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)([]), filterOptions = _d[0], setFilterOptions = _d[1];
    var _e = (0, react_1.useState)({ start: null, end: null }), customDateRange = _e[0], setCustomDateRange = _e[1];
    /**
     * Load filter options from analytics engine
     */
    var loadFilterOptions = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var options, categories, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
        return __generator(this, function (_8) {
            switch (_8.label) {
                case 0:
                    if (!clinicId)
                        return [2 /*return*/];
                    _8.label = 1;
                case 1:
                    _8.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, analytics_1.AnalyticsUtils.getFilterOptions(clinicId)];
                case 2:
                    options = _8.sent();
                    categories = [
                        {
                            id: 'timeframe',
                            label: 'Time Range',
                            icon: <lucide_react_1.Clock className="w-4 h-4"/>,
                            options: [
                                { value: 'today', label: 'Today' },
                                { value: 'yesterday', label: 'Yesterday' },
                                { value: 'last_7_days', label: 'Last 7 days' },
                                { value: 'last_30_days', label: 'Last 30 days' },
                                { value: 'this_month', label: 'This month' },
                                { value: 'last_month', label: 'Last month' },
                                { value: 'this_quarter', label: 'This quarter' },
                                { value: 'last_quarter', label: 'Last quarter' },
                                { value: 'this_year', label: 'This year' },
                                { value: 'custom', label: 'Custom range' }
                            ]
                        },
                        {
                            id: 'demographics',
                            label: 'Demographics',
                            icon: <lucide_react_1.User className="w-4 h-4"/>,
                            options: [
                                { value: 'age_18_25', label: '18-25 years', count: (_b = (_a = options.demographics) === null || _a === void 0 ? void 0 : _a.age_ranges) === null || _b === void 0 ? void 0 : _b['18-25'] },
                                { value: 'age_26_35', label: '26-35 years', count: (_d = (_c = options.demographics) === null || _c === void 0 ? void 0 : _c.age_ranges) === null || _d === void 0 ? void 0 : _d['26-35'] },
                                { value: 'age_36_45', label: '36-45 years', count: (_f = (_e = options.demographics) === null || _e === void 0 ? void 0 : _e.age_ranges) === null || _f === void 0 ? void 0 : _f['36-45'] },
                                { value: 'age_46_55', label: '46-55 years', count: (_h = (_g = options.demographics) === null || _g === void 0 ? void 0 : _g.age_ranges) === null || _h === void 0 ? void 0 : _h['46-55'] },
                                { value: 'age_56_plus', label: '56+ years', count: (_k = (_j = options.demographics) === null || _j === void 0 ? void 0 : _j.age_ranges) === null || _k === void 0 ? void 0 : _k['56+'] },
                                { value: 'gender_female', label: 'Female', count: (_m = (_l = options.demographics) === null || _l === void 0 ? void 0 : _l.gender) === null || _m === void 0 ? void 0 : _m.female },
                                { value: 'gender_male', label: 'Male', count: (_p = (_o = options.demographics) === null || _o === void 0 ? void 0 : _o.gender) === null || _p === void 0 ? void 0 : _p.male },
                                { value: 'gender_other', label: 'Other', count: (_r = (_q = options.demographics) === null || _q === void 0 ? void 0 : _q.gender) === null || _r === void 0 ? void 0 : _r.other }
                            ]
                        },
                        {
                            id: 'procedures',
                            label: 'Procedures',
                            icon: <lucide_react_1.Stethoscope className="w-4 h-4"/>,
                            options: [
                                { value: 'facial_aesthetics', label: 'Facial Aesthetics', count: (_s = options.procedures) === null || _s === void 0 ? void 0 : _s.facial },
                                { value: 'body_contouring', label: 'Body Contouring', count: (_t = options.procedures) === null || _t === void 0 ? void 0 : _t.body },
                                { value: 'skin_treatments', label: 'Skin Treatments', count: (_u = options.procedures) === null || _u === void 0 ? void 0 : _u.skin },
                                { value: 'injectables', label: 'Injectables', count: (_v = options.procedures) === null || _v === void 0 ? void 0 : _v.injectables },
                                { value: 'laser_treatments', label: 'Laser Treatments', count: (_w = options.procedures) === null || _w === void 0 ? void 0 : _w.laser },
                                { value: 'surgical', label: 'Surgical', count: (_x = options.procedures) === null || _x === void 0 ? void 0 : _x.surgical },
                                { value: 'non_surgical', label: 'Non-Surgical', count: (_y = options.procedures) === null || _y === void 0 ? void 0 : _y.non_surgical }
                            ]
                        },
                        {
                            id: 'outcomes',
                            label: 'Outcomes',
                            icon: <lucide_react_1.Activity className="w-4 h-4"/>,
                            options: [
                                { value: 'excellent', label: 'Excellent', count: (_z = options.outcomes) === null || _z === void 0 ? void 0 : _z.excellent },
                                { value: 'very_good', label: 'Very Good', count: (_0 = options.outcomes) === null || _0 === void 0 ? void 0 : _0.very_good },
                                { value: 'good', label: 'Good', count: (_1 = options.outcomes) === null || _1 === void 0 ? void 0 : _1.good },
                                { value: 'fair', label: 'Fair', count: (_2 = options.outcomes) === null || _2 === void 0 ? void 0 : _2.fair },
                                { value: 'poor', label: 'Poor', count: (_3 = options.outcomes) === null || _3 === void 0 ? void 0 : _3.poor },
                                { value: 'complications', label: 'With Complications', count: (_4 = options.outcomes) === null || _4 === void 0 ? void 0 : _4.complications },
                                { value: 'no_complications', label: 'No Complications', count: (_5 = options.outcomes) === null || _5 === void 0 ? void 0 : _5.no_complications }
                            ]
                        },
                        {
                            id: 'providers',
                            label: 'Providers',
                            icon: <lucide_react_1.User className="w-4 h-4"/>,
                            options: ((_6 = options.providers) === null || _6 === void 0 ? void 0 : _6.map(function (provider) { return ({
                                value: provider.id,
                                label: provider.name,
                                count: provider.procedure_count,
                                description: provider.specialization
                            }); })) || []
                        },
                        {
                            id: 'locations',
                            label: 'Locations',
                            icon: <lucide_react_1.MapPin className="w-4 h-4"/>,
                            options: ((_7 = options.locations) === null || _7 === void 0 ? void 0 : _7.map(function (location) { return ({
                                value: location.id,
                                label: location.name,
                                count: location.procedure_count
                            }); })) || []
                        },
                        {
                            id: 'ai_models',
                            label: 'AI Models',
                            icon: <lucide_react_1.Brain className="w-4 h-4"/>,
                            options: [
                                { value: 'face_detection_v2', label: 'Face Detection v2.0' },
                                { value: 'aesthetic_analysis_v1', label: 'Aesthetic Analysis v1.5' },
                                { value: 'complication_detector_v1', label: 'Complication Detection v1.0' },
                                { value: 'outcome_predictor_v1', label: 'Outcome Predictor v1.2' },
                                { value: 'risk_assessment_v1', label: 'Risk Assessment v1.0' }
                            ]
                        }
                    ];
                    setFilterOptions(categories);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _8.sent();
                    console.error('Failed to load filter options:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [clinicId]);
    (0, react_1.useEffect)(function () {
        loadFilterOptions();
    }, [loadFilterOptions]);
    /**
     * Get active filters grouped by category
     */
    var activeFilters = React.useMemo(function () {
        var grouped = [];
        filters.forEach(function (filter) {
            var category = filterOptions.find(function (cat) { return cat.id === filter.category; });
            if (category) {
                var labels = filter.values.map(function (value) {
                    var option = category.options.find(function (opt) { return opt.value === value; });
                    return (option === null || option === void 0 ? void 0 : option.label) || value;
                });
                grouped.push({
                    category: filter.category,
                    values: filter.values,
                    label: "".concat(category.label, ": ").concat(labels.join(', '))
                });
            }
        });
        return grouped;
    }, [filters, filterOptions]);
    /**
     * Handle filter change
     */
    var handleFilterChange = (0, react_1.useCallback)(function (category, values) {
        var updatedFilters = filters.filter(function (f) { return f.category !== category; });
        if (values.length > 0) {
            updatedFilters.push({
                category: category,
                values: values,
                operator: 'in'
            });
        }
        onFiltersChange(updatedFilters);
    }, [filters, onFiltersChange]);
    /**
     * Handle custom date range
     */
    var handleCustomDateRange = (0, react_1.useCallback)(function () {
        if (customDateRange.start && customDateRange.end) {
            var updatedFilters = filters.filter(function (f) { return f.category !== 'custom_date_range'; });
            updatedFilters.push({
                category: 'custom_date_range',
                values: [
                    customDateRange.start.toISOString(),
                    customDateRange.end.toISOString()
                ],
                operator: 'between'
            });
            onFiltersChange(updatedFilters);
        }
    }, [customDateRange, filters, onFiltersChange]);
    /**
     * Remove specific filter
     */
    var removeFilter = (0, react_1.useCallback)(function (category) {
        var updatedFilters = filters.filter(function (f) { return f.category !== category; });
        onFiltersChange(updatedFilters);
    }, [filters, onFiltersChange]);
    /**
     * Clear all filters
     */
    var clearAllFilters = (0, react_1.useCallback)(function () {
        onFiltersChange([]);
        setCustomDateRange({ start: null, end: null });
    }, [onFiltersChange]);
    /**
     * Filter category component
     */
    var FilterCategory = function (_a) {
        var category = _a.category;
        var currentFilter = filters.find(function (f) { return f.category === category.id; });
        var selectedValues = (currentFilter === null || currentFilter === void 0 ? void 0 : currentFilter.values) || [];
        var filteredOptions = category.options.filter(function (option) {
            return option.label.toLowerCase().includes(searchTerm.toLowerCase());
        });
        return (<div className="space-y-3">
        <div className="flex items-center gap-2">
          {category.icon}
          <label_1.Label className="text-sm font-medium">{category.label}</label_1.Label>
        </div>
        
        {category.id === 'timeframe' && (<div className="space-y-2">
            <select_1.Select value={selectedValues[0] || ''} onValueChange={function (value) { return handleFilterChange(category.id, value ? [value] : []); }}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select time range"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {category.options.map(function (option) { return (<select_1.SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </select_1.SelectItem>); })}
              </select_1.SelectContent>
            </select_1.Select>
            
            {selectedValues.includes('custom') && (<div className="space-y-2 p-3 border rounded">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label_1.Label className="text-xs">Start Date</label_1.Label>
                    <date_picker_1.DatePicker date={customDateRange.start} onDateChange={function (date) { return setCustomDateRange(function (prev) { return (__assign(__assign({}, prev), { start: date })); }); }}/>
                  </div>
                  <div>
                    <label_1.Label className="text-xs">End Date</label_1.Label>
                    <date_picker_1.DatePicker date={customDateRange.end} onDateChange={function (date) { return setCustomDateRange(function (prev) { return (__assign(__assign({}, prev), { end: date })); }); }}/>
                  </div>
                </div>
                <button_1.Button size="sm" onClick={handleCustomDateRange} disabled={!customDateRange.start || !customDateRange.end}>
                  Apply Date Range
                </button_1.Button>
              </div>)}
          </div>)}
        
        {category.id !== 'timeframe' && (<div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredOptions.map(function (option) { return (<div key={option.value} className="flex items-center space-x-2">
                <checkbox_1.Checkbox id={"".concat(category.id, "-").concat(option.value)} checked={selectedValues.includes(option.value)} onCheckedChange={function (checked) {
                        if (checked) {
                            handleFilterChange(category.id, __spreadArray(__spreadArray([], selectedValues, true), [option.value], false));
                        }
                        else {
                            handleFilterChange(category.id, selectedValues.filter(function (v) { return v !== option.value; }));
                        }
                    }}/>
                <label htmlFor={"".concat(category.id, "-").concat(option.value)} className="text-sm flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span>{option.label}</span>
                    {option.count !== undefined && (<span className="text-xs text-gray-500">({option.count})</span>)}
                  </div>
                  {option.description && (<div className="text-xs text-gray-400">{option.description}</div>)}
                </label>
              </div>); })}
          </div>)}
      </div>);
    };
    return (<div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <popover_1.Popover open={isOpen} onOpenChange={setIsOpen}>
            <popover_1.PopoverTrigger asChild>
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                Filters
                {activeFilters.length > 0 && (<badge_1.Badge variant="secondary" className="ml-2">
                    {activeFilters.length}
                  </badge_1.Badge>)}
                <lucide_react_1.ChevronDown className="w-4 h-4 ml-2"/>
              </button_1.Button>
            </popover_1.PopoverTrigger>
            <popover_1.PopoverContent className="w-96 p-0" align="start">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Analytics Filters</h4>
                  {activeFilters.length > 0 && (<button_1.Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <lucide_react_1.RotateCcw className="w-4 h-4 mr-2"/>
                      Clear All
                    </button_1.Button>)}
                </div>
                
                <div className="relative">
                  <lucide_react_1.Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"/>
                  <input_1.Input placeholder="Search filters..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto p-4 space-y-6">
                {filterOptions.map(function (category) { return (<FilterCategory key={category.id} category={category}/>); })}
              </div>
            </popover_1.PopoverContent>
          </popover_1.Popover>
        </div>

        {/* Active filter count */}
        {activeFilters.length > 0 && (<div className="text-sm text-gray-600">
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
          </div>)}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (<div className="flex flex-wrap gap-2">
          {activeFilters.map(function (filter, index) { return (<badge_1.Badge key={index} variant="secondary" className="pl-2 pr-1">
              {filter.label}
              <button_1.Button variant="ghost" size="sm" className="ml-1 h-auto p-0 text-gray-500 hover:text-gray-700" onClick={function () { return removeFilter(filter.category); }}>
                <lucide_react_1.X className="w-3 h-3"/>
              </button_1.Button>
            </badge_1.Badge>); })}
        </div>)}
    </div>);
}
