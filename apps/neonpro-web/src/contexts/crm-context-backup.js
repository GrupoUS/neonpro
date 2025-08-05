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
exports.CRMProvider = CRMProvider;
exports.useCRM = useCRM;
var react_1 = require("react");
// Initial state
var initialState = {
  customers: [],
  segments: [],
  campaigns: [],
  loading: {
    customers: false,
    segments: false,
    campaigns: false,
  },
  errors: {},
  filters: {
    customer_search: "",
    customer_status: "",
    customer_segment: "",
  },
};
// Reducer
function crmReducer(state, action) {
  var _a, _b, _c;
  switch (action.type) {
    case "SET_LOADING":
      return __assign(__assign({}, state), {
        loading: __assign(
          __assign({}, state.loading),
          ((_a = {}), (_a[action.payload.key] = action.payload.value), _a),
        ),
      });
    case "SET_ERROR":
      return __assign(__assign({}, state), {
        errors: __assign(
          __assign({}, state.errors),
          ((_b = {}), (_b[action.payload.key] = action.payload.value), _b),
        ),
      });
    case "SET_CUSTOMERS":
      return __assign(__assign({}, state), { customers: action.payload });
    case "ADD_CUSTOMER":
      return __assign(__assign({}, state), {
        customers: __spreadArray(__spreadArray([], state.customers, true), [action.payload], false),
      });
    case "UPDATE_CUSTOMER":
      return __assign(__assign({}, state), {
        customers: state.customers.map(function (customer) {
          return customer.id === action.payload.id ? action.payload : customer;
        }),
      });
    case "DELETE_CUSTOMER":
      return __assign(__assign({}, state), {
        customers: state.customers.filter(function (customer) {
          return customer.id !== action.payload;
        }),
      });
    case "SET_SEGMENTS":
      return __assign(__assign({}, state), { segments: action.payload });
    case "ADD_SEGMENT":
      return __assign(__assign({}, state), {
        segments: __spreadArray(__spreadArray([], state.segments, true), [action.payload], false),
      });
    case "UPDATE_SEGMENT":
      return __assign(__assign({}, state), {
        segments: state.segments.map(function (segment) {
          return segment.id === action.payload.id ? action.payload : segment;
        }),
      });
    case "DELETE_SEGMENT":
      return __assign(__assign({}, state), {
        segments: state.segments.filter(function (segment) {
          return segment.id !== action.payload;
        }),
      });
    case "SET_CAMPAIGNS":
      return __assign(__assign({}, state), { campaigns: action.payload });
    case "ADD_CAMPAIGN":
      return __assign(__assign({}, state), {
        campaigns: __spreadArray(__spreadArray([], state.campaigns, true), [action.payload], false),
      });
    case "UPDATE_CAMPAIGN":
      return __assign(__assign({}, state), {
        campaigns: state.campaigns.map(function (campaign) {
          return campaign.id === action.payload.id ? action.payload : campaign;
        }),
      });
    case "DELETE_CAMPAIGN":
      return __assign(__assign({}, state), {
        campaigns: state.campaigns.filter(function (campaign) {
          return campaign.id !== action.payload;
        }),
      });
    case "SET_FILTER":
      return __assign(__assign({}, state), {
        filters: __assign(
          __assign({}, state.filters),
          ((_c = {}), (_c[action.payload.key] = action.payload.value), _c),
        ),
      });
    case "RESET_FILTERS":
      return __assign(__assign({}, state), { filters: initialState.filters });
    default:
      return state;
  }
}
// Create context
var CRMContext = (0, react_1.createContext)(null);
function CRMProvider(_a) {
  var children = _a.children;
  var _b = (0, react_1.useReducer)(crmReducer, initialState),
    state = _b[0],
    dispatch = _b[1];
  // Helper functions
  var setLoading = function (key, value) {
    dispatch({ type: "SET_LOADING", payload: { key: key, value: value } });
  };
  var setError = function (key, value) {
    dispatch({ type: "SET_ERROR", payload: { key: key, value: value } });
  };
  var setFilter = function (key, value) {
    dispatch({ type: "SET_FILTER", payload: { key: key, value: value } });
  };
  var resetFilters = function () {
    dispatch({ type: "RESET_FILTERS" });
  };
  // Computed values
  var filteredCustomers = state.customers.filter(function (customer) {
    var _a, _b, _c, _d;
    var matchesSearch =
      !state.filters.customer_search ||
      ((_b = (_a = customer.profile) === null || _a === void 0 ? void 0 : _a.full_name) === null ||
      _b === void 0
        ? void 0
        : _b.toLowerCase().includes(state.filters.customer_search.toLowerCase())) ||
      ((_d = (_c = customer.profile) === null || _c === void 0 ? void 0 : _c.email) === null ||
      _d === void 0
        ? void 0
        : _d.toLowerCase().includes(state.filters.customer_search.toLowerCase()));
    var matchesStatus =
      !state.filters.customer_status || customer.status === state.filters.customer_status;
    return matchesSearch && matchesStatus;
  });
  var totalCustomers = state.customers.length;
  var activeCustomers = state.customers.filter(function (c) {
    return c.status === "active";
  }).length;
  var vipCustomers = state.customers.filter(function (c) {
    return c.status === "vip";
  }).length;
  var contextValue = {
    state: state,
    dispatch: dispatch,
    setLoading: setLoading,
    setError: setError,
    setFilter: setFilter,
    resetFilters: resetFilters,
    filteredCustomers: filteredCustomers,
    totalCustomers: totalCustomers,
    activeCustomers: activeCustomers,
    vipCustomers: vipCustomers,
  };
  return <CRMContext.Provider value={contextValue}>{children}</CRMContext.Provider>;
}
// Hook to use CRM context
function useCRM() {
  var context = (0, react_1.useContext)(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
exports.default = CRMContext;
