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
exports.CRMProvider = CRMProvider;
exports.useCRM = useCRM;
var client_1 = require("@/app/utils/supabase/client");
var react_1 = require("react");
var sonner_1 = require("sonner");
// Reducer
var crmReducer = (state, action) => {
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
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer,
        ),
      });
    case "DELETE_CUSTOMER":
      return __assign(__assign({}, state), {
        customers: state.customers.filter((customer) => customer.id !== action.payload),
      });
    case "SET_SEGMENTS":
      return __assign(__assign({}, state), { segments: action.payload });
    case "ADD_SEGMENT":
      return __assign(__assign({}, state), {
        segments: __spreadArray(__spreadArray([], state.segments, true), [action.payload], false),
      });
    case "UPDATE_SEGMENT":
      return __assign(__assign({}, state), {
        segments: state.segments.map((segment) =>
          segment.id === action.payload.id ? action.payload : segment,
        ),
      });
    case "DELETE_SEGMENT":
      return __assign(__assign({}, state), {
        segments: state.segments.filter((segment) => segment.id !== action.payload),
      });
    case "SET_CAMPAIGNS":
      return __assign(__assign({}, state), { campaigns: action.payload });
    case "ADD_CAMPAIGN":
      return __assign(__assign({}, state), {
        campaigns: __spreadArray(__spreadArray([], state.campaigns, true), [action.payload], false),
      });
    case "UPDATE_CAMPAIGN":
      return __assign(__assign({}, state), {
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === action.payload.id ? action.payload : campaign,
        ),
      });
    case "DELETE_CAMPAIGN":
      return __assign(__assign({}, state), {
        campaigns: state.campaigns.filter((campaign) => campaign.id !== action.payload),
      });
    case "SET_FILTER":
      return __assign(__assign({}, state), {
        filters: __assign(
          __assign({}, state.filters),
          ((_c = {}), (_c[action.payload.key] = action.payload.value), _c),
        ),
      });
    default:
      return state;
  }
};
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
// Create context
var CRMContext = (0, react_1.createContext)(undefined);
// Provider component
function CRMProvider(_a) {
  var children = _a.children;
  var _b = (0, react_1.useReducer)(crmReducer, initialState),
    state = _b[0],
    dispatch = _b[1];
  var supabase = (0, client_1.createClient)();
  // Customer functions
  var loadCustomers = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_1;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            dispatch({
              type: "SET_LOADING",
              payload: { key: "customers", value: true },
            });
            dispatch({
              type: "SET_ERROR",
              payload: { key: "customers", value: undefined },
            });
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              supabase
                .from("customers")
                .select(
                  "\n          *,\n          profile:profiles(\n            name,\n            email,\n            phone\n          )\n        ",
                )
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "SET_CUSTOMERS", payload: data || [] });
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            console.error("Error loading customers:", error_1);
            dispatch({
              type: "SET_ERROR",
              payload: { key: "customers", value: "Erro ao carregar clientes" },
            });
            sonner_1.toast.error("Erro ao carregar clientes");
            return [3 /*break*/, 5];
          case 4:
            dispatch({
              type: "SET_LOADING",
              payload: { key: "customers", value: false },
            });
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var createCustomer = (customerData) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("customers").insert([customerData]).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "ADD_CUSTOMER", payload: data });
            sonner_1.toast.success("Cliente criado com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_2 = _b.sent();
            console.error("Error creating customer:", error_2);
            sonner_1.toast.error("Erro ao criar cliente");
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var updateCustomer = (customer) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("customers").update(customer).eq("id", customer.id).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "UPDATE_CUSTOMER", payload: data });
            sonner_1.toast.success("Cliente atualizado com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_3 = _b.sent();
            console.error("Error updating customer:", error_3);
            sonner_1.toast.error("Erro ao atualizar cliente");
            throw error_3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var deleteCustomer = (customerId) =>
    __awaiter(this, void 0, void 0, function () {
      var error, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, supabase.from("customers").delete().eq("id", customerId)];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            dispatch({ type: "DELETE_CUSTOMER", payload: customerId });
            sonner_1.toast.success("Cliente excluído com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error deleting customer:", error_4);
            sonner_1.toast.error("Erro ao excluir cliente");
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Segment functions
  var loadSegments = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            dispatch({
              type: "SET_LOADING",
              payload: { key: "segments", value: true },
            });
            dispatch({
              type: "SET_ERROR",
              payload: { key: "segments", value: undefined },
            });
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              supabase
                .from("customer_segments")
                .select("*")
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "SET_SEGMENTS", payload: data || [] });
            return [3 /*break*/, 5];
          case 3:
            error_5 = _b.sent();
            console.error("Error loading segments:", error_5);
            dispatch({
              type: "SET_ERROR",
              payload: { key: "segments", value: "Erro ao carregar segmentos" },
            });
            sonner_1.toast.error("Erro ao carregar segmentos");
            return [3 /*break*/, 5];
          case 4:
            dispatch({
              type: "SET_LOADING",
              payload: { key: "segments", value: false },
            });
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var createSegment = (segmentData) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("customer_segments").insert([segmentData]).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "ADD_SEGMENT", payload: data });
            sonner_1.toast.success("Segmento criado com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_6 = _b.sent();
            console.error("Error creating segment:", error_6);
            sonner_1.toast.error("Erro ao criar segmento");
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var updateSegment = (segment) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_7;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("customer_segments")
                .update(segment)
                .eq("id", segment.id)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "UPDATE_SEGMENT", payload: data });
            sonner_1.toast.success("Segmento atualizado com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_7 = _b.sent();
            console.error("Error updating segment:", error_7);
            sonner_1.toast.error("Erro ao atualizar segmento");
            throw error_7;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var deleteSegment = (segmentId) =>
    __awaiter(this, void 0, void 0, function () {
      var error, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, supabase.from("customer_segments").delete().eq("id", segmentId)];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            dispatch({ type: "DELETE_SEGMENT", payload: segmentId });
            sonner_1.toast.success("Segmento excluído com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Error deleting segment:", error_8);
            sonner_1.toast.error("Erro ao excluir segmento");
            throw error_8;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Campaign functions
  var loadCampaigns = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_9;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            dispatch({
              type: "SET_LOADING",
              payload: { key: "campaigns", value: true },
            });
            dispatch({
              type: "SET_ERROR",
              payload: { key: "campaigns", value: undefined },
            });
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              supabase
                .from("marketing_campaigns")
                .select("*")
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "SET_CAMPAIGNS", payload: data || [] });
            return [3 /*break*/, 5];
          case 3:
            error_9 = _b.sent();
            console.error("Error loading campaigns:", error_9);
            dispatch({
              type: "SET_ERROR",
              payload: { key: "campaigns", value: "Erro ao carregar campanhas" },
            });
            sonner_1.toast.error("Erro ao carregar campanhas");
            return [3 /*break*/, 5];
          case 4:
            dispatch({
              type: "SET_LOADING",
              payload: { key: "campaigns", value: false },
            });
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var createCampaign = (campaignData) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_10;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("marketing_campaigns").insert([campaignData]).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "ADD_CAMPAIGN", payload: data });
            sonner_1.toast.success("Campanha criada com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_10 = _b.sent();
            console.error("Error creating campaign:", error_10);
            sonner_1.toast.error("Erro ao criar campanha");
            throw error_10;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var updateCampaign = (campaign) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_11;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("marketing_campaigns")
                .update(campaign)
                .eq("id", campaign.id)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dispatch({ type: "UPDATE_CAMPAIGN", payload: data });
            sonner_1.toast.success("Campanha atualizada com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_11 = _b.sent();
            console.error("Error updating campaign:", error_11);
            sonner_1.toast.error("Erro ao atualizar campanha");
            throw error_11;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var deleteCampaign = (campaignId) =>
    __awaiter(this, void 0, void 0, function () {
      var error, error_12;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("marketing_campaigns").delete().eq("id", campaignId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            dispatch({ type: "DELETE_CAMPAIGN", payload: campaignId });
            sonner_1.toast.success("Campanha excluída com sucesso");
            return [3 /*break*/, 3];
          case 2:
            error_12 = _a.sent();
            console.error("Error deleting campaign:", error_12);
            sonner_1.toast.error("Erro ao excluir campanha");
            throw error_12;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Filter functions
  var setFilter = (key, value) => {
    dispatch({ type: "SET_FILTER", payload: { key: key, value: value } });
  };
  var clearFilters = () => {
    dispatch({
      type: "SET_FILTER",
      payload: { key: "customer_search", value: "" },
    });
    dispatch({
      type: "SET_FILTER",
      payload: { key: "customer_status", value: "" },
    });
    dispatch({
      type: "SET_FILTER",
      payload: { key: "customer_segment", value: "" },
    });
  };
  // Filtered customers (computed property)
  var filteredCustomers = state.customers.filter((customer) => {
    var _a, _b, _c, _d, _e, _f;
    // Search filter
    if (state.filters.customer_search) {
      var search = state.filters.customer_search.toLowerCase();
      var matchesSearch =
        ((_b = (_a = customer.profile) === null || _a === void 0 ? void 0 : _a.name) === null ||
        _b === void 0
          ? void 0
          : _b.toLowerCase().includes(search)) ||
        ((_d = (_c = customer.profile) === null || _c === void 0 ? void 0 : _c.email) === null ||
        _d === void 0
          ? void 0
          : _d.toLowerCase().includes(search)) ||
        ((_f = (_e = customer.profile) === null || _e === void 0 ? void 0 : _e.phone) === null ||
        _f === void 0
          ? void 0
          : _f.includes(search));
      if (!matchesSearch) return false;
    }
    // Status filter
    if (state.filters.customer_status && customer.status !== state.filters.customer_status) {
      return false;
    }
    return true;
  });
  // Load initial data
  (0, react_1.useEffect)(() => {
    loadCustomers();
    loadSegments();
    loadCampaigns();
  }, []);
  var contextValue = {
    state: state,
    // Customer actions
    loadCustomers: loadCustomers,
    createCustomer: createCustomer,
    updateCustomer: updateCustomer,
    deleteCustomer: deleteCustomer,
    // Segment actions
    loadSegments: loadSegments,
    createSegment: createSegment,
    updateSegment: updateSegment,
    deleteSegment: deleteSegment,
    // Campaign actions
    loadCampaigns: loadCampaigns,
    createCampaign: createCampaign,
    updateCampaign: updateCampaign,
    deleteCampaign: deleteCampaign,
    // Filter actions
    setFilter: setFilter,
    clearFilters: clearFilters,
    // Computed properties
    filteredCustomers: filteredCustomers,
  };
  return <CRMContext.Provider value={contextValue}>{children}</CRMContext.Provider>;
}
// Custom hook
function useCRM() {
  var context = (0, react_1.useContext)(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
