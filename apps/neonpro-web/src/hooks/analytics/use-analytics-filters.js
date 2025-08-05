"use strict";
/**
 * Analytics Filters Utility Hook for NeonPro
 *
 * Centralized hook for managing analytics filters across all dashboard components:
 * - Date range selection with presets
 * - Metric filtering and segmentation
 * - Customer segment filters
 * - Subscription tier filters
 * - Geographic and demographic filters
 *
 * Provides consistent filtering interface for all analytics hooks.
 */
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
exports.useAnalyticsFilters = useAnalyticsFilters;
exports.useFilterPresets = useFilterPresets;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
// Default filter configuration
var DEFAULT_FILTERS = {
    dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        preset: '30d'
    },
    segments: [],
    metrics: {
        metrics: ['revenue', 'subscriptions', 'churn'],
        aggregation: 'sum'
    },
    customFilters: {}
};
/**
 * Main analytics filters hook
 */
function useAnalyticsFilters(initialFilters) {
    var searchParams = (0, navigation_1.useSearchParams)();
    var _a = (0, react_1.useState)(__assign(__assign({}, DEFAULT_FILTERS), initialFilters)), filters = _a[0], setFilters = _a[1];
    var _b = (0, react_1.useState)(null), appliedFilters = _b[0], setAppliedFilters = _b[1];
    var _c = (0, react_1.useState)({}), savedFilterSets = _c[0], setSavedFilterSets = _c[1];
    // Load filters from URL on mount
    (0, react_1.useEffect)(function () {
        var urlFilters = parseFiltersFromURL(searchParams);
        if (urlFilters) {
            setFilters(function (prev) { return (__assign(__assign({}, prev), urlFilters)); });
        }
    }, [searchParams]);
    // Validate filters
    var validation = (0, react_1.useMemo)(function () {
        var errors = [];
        var isValid = true;
        // Validate date range
        if (new Date(filters.dateRange.start) > new Date(filters.dateRange.end)) {
            errors.push('Start date must be before end date');
            isValid = false;
        }
        // Validate metrics
        if (filters.metrics.metrics.length === 0) {
            errors.push('At least one metric must be selected');
            isValid = false;
        }
        // Validate date range span (not too large)
        var daysDiff = (new Date(filters.dateRange.end).getTime() - new Date(filters.dateRange.start).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
            errors.push('Date range cannot exceed 365 days');
            isValid = false;
        }
        return { isValid: isValid, errors: errors };
    }, [filters]);
    // Check if filters have changed since last applied
    var hasChanges = (0, react_1.useMemo)(function () {
        if (!appliedFilters)
            return true;
        return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
    }, [filters, appliedFilters]);
    // Actions
    var updateDateRange = (0, react_1.useCallback)(function (dateRange) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { dateRange: __assign(__assign({}, dateRange), (dateRange.preset && dateRange.preset !== 'custom'
                ? getPresetDateRange(dateRange.preset)
                : {})) })); });
    }, []);
    var addSegmentFilter = (0, react_1.useCallback)(function (segment) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { segments: __spreadArray(__spreadArray([], prev.segments.filter(function (s) { return s.type !== segment.type; }), true), [
                segment
            ], false) })); });
    }, []);
    var removeSegmentFilter = (0, react_1.useCallback)(function (type) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { segments: prev.segments.filter(function (s) { return s.type !== type; }) })); });
    }, []);
    var updateMetricFilter = (0, react_1.useCallback)(function (metricFilter) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { metrics: metricFilter })); });
    }, []);
    var setCustomFilter = (0, react_1.useCallback)(function (key, value) {
        setFilters(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), { customFilters: __assign(__assign({}, prev.customFilters), (_a = {}, _a[key] = value, _a)) }));
        });
    }, []);
    var clearCustomFilter = (0, react_1.useCallback)(function (key) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { customFilters: Object.fromEntries(Object.entries(prev.customFilters).filter(function (_a) {
                var k = _a[0];
                return k !== key;
            })) })); });
    }, []);
    var applyFilters = (0, react_1.useCallback)(function () {
        if (validation.isValid) {
            setAppliedFilters(__assign({}, filters));
            // Update URL with current filters
            updateURLWithFilters(filters);
        }
    }, [filters, validation.isValid]);
    var resetFilters = (0, react_1.useCallback)(function () {
        setFilters(DEFAULT_FILTERS);
        setAppliedFilters(null);
    }, []);
    var saveFilterSet = (0, react_1.useCallback)(function (name) {
        var _a;
        var newFilterSets = __assign(__assign({}, savedFilterSets), (_a = {}, _a[name] = __assign({}, filters), _a));
        setSavedFilterSets(newFilterSets);
        // Save to localStorage
        try {
            localStorage.setItem('neonpro-analytics-filters', JSON.stringify(newFilterSets));
        }
        catch (error) {
            console.error('Failed to save filter set:', error);
        }
    }, [filters, savedFilterSets]);
    var loadFilterSet = (0, react_1.useCallback)(function (name) {
        var filterSet = savedFilterSets[name];
        if (filterSet) {
            setFilters(filterSet);
        }
    }, [savedFilterSets]);
    var getFilterSummary = (0, react_1.useCallback)(function () {
        var parts = [];
        // Date range
        if (filters.dateRange.preset && filters.dateRange.preset !== 'custom') {
            parts.push("Last ".concat(getPresetLabel(filters.dateRange.preset)));
        }
        else {
            parts.push("".concat(filters.dateRange.start, " to ").concat(filters.dateRange.end));
        }
        // Metrics
        parts.push("".concat(filters.metrics.metrics.length, " metric").concat(filters.metrics.metrics.length > 1 ? 's' : ''));
        // Segments
        if (filters.segments.length > 0) {
            parts.push("".concat(filters.segments.length, " segment").concat(filters.segments.length > 1 ? 's' : ''));
        }
        // Custom filters
        var customCount = Object.keys(filters.customFilters).length;
        if (customCount > 0) {
            parts.push("".concat(customCount, " custom filter").concat(customCount > 1 ? 's' : ''));
        }
        return parts.join(', ');
    }, [filters]);
    // Load saved filter sets on mount
    (0, react_1.useEffect)(function () {
        try {
            var saved = localStorage.getItem('neonpro-analytics-filters');
            if (saved) {
                setSavedFilterSets(JSON.parse(saved));
            }
        }
        catch (error) {
            console.error('Failed to load saved filters:', error);
        }
    }, []);
    return {
        // State
        filters: filters,
        isValid: validation.isValid,
        errors: validation.errors,
        appliedFilters: appliedFilters,
        hasChanges: hasChanges,
        // Actions
        updateDateRange: updateDateRange,
        addSegmentFilter: addSegmentFilter,
        removeSegmentFilter: removeSegmentFilter,
        updateMetricFilter: updateMetricFilter,
        setCustomFilter: setCustomFilter,
        clearCustomFilter: clearCustomFilter,
        applyFilters: applyFilters,
        resetFilters: resetFilters,
        saveFilterSet: saveFilterSet,
        loadFilterSet: loadFilterSet,
        getFilterSummary: getFilterSummary
    };
}
// Utility functions
function getPresetDateRange(preset) {
    var end = new Date();
    var start = new Date();
    switch (preset) {
        case 'today':
            // Today only
            break;
        case '7d':
            start.setDate(end.getDate() - 7);
            break;
        case '30d':
            start.setDate(end.getDate() - 30);
            break;
        case '90d':
            start.setDate(end.getDate() - 90);
            break;
        case '1y':
            start.setFullYear(end.getFullYear() - 1);
            break;
        default:
            start.setDate(end.getDate() - 30);
    }
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}
function getPresetLabel(preset) {
    switch (preset) {
        case 'today': return 'Today';
        case '7d': return '7 days';
        case '30d': return '30 days';
        case '90d': return '90 days';
        case '1y': return 'year';
        default: return preset;
    }
}
function parseFiltersFromURL(searchParams) {
    try {
        var filtersParam = searchParams.get('filters');
        if (filtersParam) {
            return JSON.parse(decodeURIComponent(filtersParam));
        }
    }
    catch (error) {
        console.error('Failed to parse filters from URL:', error);
    }
    return null;
}
function updateURLWithFilters(filters) {
    try {
        var url = new URL(window.location.href);
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
        window.history.replaceState({}, '', url.toString());
    }
    catch (error) {
        console.error('Failed to update URL with filters:', error);
    }
}
/**
 * Hook for common filter presets
 */
function useFilterPresets() {
    return (0, react_1.useMemo)(function () { return ({
        // Date range presets
        datePresets: [
            { label: 'Today', value: 'today' },
            { label: 'Last 7 days', value: '7d' },
            { label: 'Last 30 days', value: '30d' },
            { label: 'Last 90 days', value: '90d' },
            { label: 'Last year', value: '1y' },
            { label: 'Custom range', value: 'custom' }
        ],
        // Metric presets
        metricPresets: [
            { label: 'Core Metrics', metrics: ['revenue', 'subscriptions', 'churn'] },
            { label: 'Growth Metrics', metrics: ['new_subscriptions', 'conversion_rate', 'growth_rate'] },
            { label: 'Retention Metrics', metrics: ['retention_rate', 'churn_rate', 'ltv'] },
            { label: 'Trial Metrics', metrics: ['trial_conversions', 'trial_duration', 'trial_to_paid'] }
        ],
        // Segment presets
        segmentPresets: [
            { label: 'Subscription Tiers', type: 'subscription_tier', values: ['basic', 'pro', 'enterprise'] },
            { label: 'Customer Segments', type: 'customer_segment', values: ['new', 'existing', 'churned'] },
            { label: 'Geographic Regions', type: 'geographic', values: ['north_america', 'europe', 'asia_pacific'] }
        ]
    }); }, []);
}
