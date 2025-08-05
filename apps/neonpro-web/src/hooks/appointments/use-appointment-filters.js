// hooks/appointments/use-appointment-filters.ts
// Custom hook for appointment filters with URL state management
// Story 1.1 Task 6 - Appointment Filtering and Search
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppointmentFilters = useAppointmentFilters;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
// Default filter values
var defaultFilters = {
  professional_id: undefined,
  service_type_id: undefined,
  status: undefined,
  date_from: undefined,
  date_to: undefined,
  search_query: undefined,
};
function useAppointmentFilters() {
  var router = (0, navigation_1.useRouter)();
  var searchParams = (0, navigation_1.useSearchParams)();
  var _a = (0, react_1.useState)(false),
    isInitialized = _a[0],
    setIsInitialized = _a[1];
  // Parse URL parameters to filters
  var parseFiltersFromURL = (0, react_1.useCallback)(
    function () {
      var professional_id = searchParams.get("professional") || undefined;
      var service_type_id = searchParams.get("service") || undefined;
      var statusParam = searchParams.get("status");
      var date_from = searchParams.get("date_from")
        ? new Date(searchParams.get("date_from"))
        : undefined;
      var date_to = searchParams.get("date_to") ? new Date(searchParams.get("date_to")) : undefined;
      var search_query = searchParams.get("search") || undefined;
      // Parse multiple status values
      var status;
      if (statusParam) {
        var statusArray = statusParam.split(",");
        status = statusArray.length > 0 ? statusArray : undefined;
      }
      return {
        professional_id: professional_id,
        service_type_id: service_type_id,
        status: status,
        date_from: date_from,
        date_to: date_to,
        search_query: search_query,
      };
    },
    [searchParams],
  );
  // Initialize filters from URL
  var _b = (0, react_1.useState)(function () {
      if (typeof window === "undefined") return defaultFilters;
      return parseFiltersFromURL();
    }),
    filters = _b[0],
    setFilters = _b[1];
  // Update filters when URL changes
  (0, react_1.useEffect)(
    function () {
      if (isInitialized) {
        var newFilters = parseFiltersFromURL();
        setFilters(newFilters);
      } else {
        setIsInitialized(true);
      }
    },
    [searchParams, parseFiltersFromURL, isInitialized],
  ); // Update URL with new filter parameters
  var updateURL = (0, react_1.useCallback)(
    function (newFilters) {
      var _a;
      var params = new URLSearchParams(searchParams);
      // Update or remove professional filter
      if (newFilters.professional_id) {
        params.set("professional", newFilters.professional_id);
      } else {
        params.delete("professional");
      }
      // Update or remove service filter
      if (newFilters.service_type_id) {
        params.set("service", newFilters.service_type_id);
      } else {
        params.delete("service");
      }
      // Update or remove status filter
      if (newFilters.status && Array.isArray(newFilters.status) && newFilters.status.length > 0) {
        params.set("status", newFilters.status.join(","));
      } else if (typeof newFilters.status === "string") {
        params.set("status", newFilters.status);
      } else {
        params.delete("status");
      }
      // Update or remove date filters
      if (newFilters.date_from) {
        params.set("date_from", newFilters.date_from.toISOString().split("T")[0]);
      } else {
        params.delete("date_from");
      }
      if (newFilters.date_to) {
        params.set("date_to", newFilters.date_to.toISOString().split("T")[0]);
      } else {
        params.delete("date_to");
      }
      // Update or remove search query
      if ((_a = newFilters.search_query) === null || _a === void 0 ? void 0 : _a.trim()) {
        params.set("search", newFilters.search_query.trim());
      } else {
        params.delete("search");
      }
      // Update URL without causing navigation
      var newURL = ""
        .concat(window.location.pathname)
        .concat(params.toString() ? "?".concat(params.toString()) : "");
      router.replace(newURL, { scroll: false });
    },
    [searchParams, router],
  ); // Update individual filter
  var updateFilter = (0, react_1.useCallback)(
    function (key, value) {
      var _a;
      var newFilters = __assign(__assign({}, filters), ((_a = {}), (_a[key] = value), _a));
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL],
  );
  // Update multiple filters at once
  var updateFilters = (0, react_1.useCallback)(
    function (newFilters) {
      var updatedFilters = __assign(__assign({}, filters), newFilters);
      setFilters(updatedFilters);
      updateURL(updatedFilters);
    },
    [filters, updateURL],
  );
  // Clear all filters
  var clearFilters = (0, react_1.useCallback)(
    function () {
      setFilters(defaultFilters);
      updateURL(defaultFilters);
    },
    [updateURL],
  );
  // Check if any filters are active
  var hasActiveFilters = (0, react_1.useMemo)(
    function () {
      return Object.values(filters).some(function (value) {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== "";
      });
    },
    [filters],
  );
  // Get active filter count
  var activeFilterCount = (0, react_1.useMemo)(
    function () {
      var _a;
      var count = 0;
      if (filters.professional_id) count++;
      if (filters.service_type_id) count++;
      if (filters.status && (Array.isArray(filters.status) ? filters.status.length > 0 : true))
        count++;
      if (filters.date_from) count++;
      if (filters.date_to) count++;
      if ((_a = filters.search_query) === null || _a === void 0 ? void 0 : _a.trim()) count++;
      return count;
    },
    [filters],
  );
  // Convert filters to API query parameters
  var getAPIQueryParams = (0, react_1.useMemo)(
    function () {
      var _a;
      var params = {};
      if (filters.professional_id) params.professional_id = filters.professional_id;
      if (filters.service_type_id) params.service_type_id = filters.service_type_id;
      if (filters.status) {
        params.status = Array.isArray(filters.status) ? filters.status.join(",") : filters.status;
      }
      if (filters.date_from) params.date_from = filters.date_from.toISOString().split("T")[0];
      if (filters.date_to) params.date_to = filters.date_to.toISOString().split("T")[0];
      if ((_a = filters.search_query) === null || _a === void 0 ? void 0 : _a.trim())
        params.search = filters.search_query.trim();
      return params;
    },
    [filters],
  );
  return {
    // State
    filters: filters,
    hasActiveFilters: hasActiveFilters,
    activeFilterCount: activeFilterCount,
    isInitialized: isInitialized,
    // Actions
    updateFilter: updateFilter,
    updateFilters: updateFilters,
    clearFilters: clearFilters,
    // Utils
    getAPIQueryParams: getAPIQueryParams,
  };
}
