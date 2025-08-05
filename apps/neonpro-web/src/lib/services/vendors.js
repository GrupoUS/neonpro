// lib/services/vendors.ts
// Service layer for vendor management
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
exports.VendorService = void 0;
var client_1 = require("@/lib/supabase/client");
var supabase = await (0, client_1.createClient)();
var VendorService = /** @class */ (() => {
  function VendorService() {}
  /**
   * Get all vendors with optional filtering
   */
  VendorService.getVendors = function (filters_1) {
    return __awaiter(this, arguments, void 0, function (filters, page, pageSize) {
      var query, from, to, _a, vendors, error, count, error_1;
      if (page === void 0) {
        page = 1;
      }
      if (pageSize === void 0) {
        pageSize = 20;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = supabase
              .from("vendors")
              .select("*", { count: "exact" })
              .is("deleted_at", null)
              .order("company_name");
            // Apply filters
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
              query = query.or(
                "company_name.ilike.%"
                  .concat(filters.search, "%,vendor_code.ilike.%")
                  .concat(filters.search, "%,contact_person.ilike.%")
                  .concat(filters.search, "%"),
              );
            }
            if (filters === null || filters === void 0 ? void 0 : filters.vendor_type) {
              query = query.eq("vendor_type", filters.vendor_type);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined
            ) {
              query = query.eq("is_active", filters.is_active);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.payment_method) {
              query = query.eq("payment_method", filters.payment_method);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.requires_approval) !==
              undefined
            ) {
              query = query.eq("requires_approval", filters.requires_approval);
            }
            from = (page - 1) * pageSize;
            to = from + pageSize - 1;
            query = query.range(from, to);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (vendors = _a.data), (error = _a.error), (count = _a.count);
            if (error) {
              console.error("Error fetching vendors:", error);
              throw new Error("Failed to fetch vendors: ".concat(error.message));
            }
            return [
              2 /*return*/,
              {
                vendors: vendors || [],
                total: count || 0,
              },
            ];
          case 2:
            error_1 = _b.sent();
            console.error("Error in getVendors:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get vendor by ID
   */
  VendorService.getVendorById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, vendor, error, error_2;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("vendors").select("*").eq("id", id).is("deleted_at", null).single(),
            ];
          case 1:
            (_a = _b.sent()), (vendor = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") {
                return [2 /*return*/, null]; // Vendor not found
              }
              console.error("Error fetching vendor:", error);
              throw new Error("Failed to fetch vendor: ".concat(error.message));
            }
            return [2 /*return*/, vendor];
          case 2:
            error_2 = _b.sent();
            console.error("Error in getVendorById:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create new vendor
   */
  VendorService.createVendor = function (vendorData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, vendor, error, _b, _c, _d, error_3;
      var _e;
      var _f;
      return __generator(this, (_g) => {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 3, , 4]);
            _c = (_b = supabase.from("vendors")).insert;
            _d = [__assign({}, vendorData)];
            _e = {};
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _c
                .apply(_b, [
                  [
                    __assign.apply(
                      void 0,
                      _d.concat([
                        ((_e.created_by =
                          (_f = _g.sent().data.user) === null || _f === void 0 ? void 0 : _f.id),
                        _e),
                      ]),
                    ),
                  ],
                ])
                .select()
                .single(),
            ];
          case 2:
            (_a = _g.sent()), (vendor = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating vendor:", error);
              throw new Error("Failed to create vendor: ".concat(error.message));
            }
            return [2 /*return*/, vendor];
          case 3:
            error_3 = _g.sent();
            console.error("Error in createVendor:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update existing vendor
   */
  VendorService.updateVendor = function (id, vendorData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, vendor, error, _b, _c, _d, error_4;
      var _e;
      var _f;
      return __generator(this, (_g) => {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 3, , 4]);
            _c = (_b = supabase.from("vendors")).update;
            _d = [__assign({}, vendorData)];
            _e = {};
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _c
                .apply(_b, [
                  __assign.apply(
                    void 0,
                    _d.concat([
                      ((_e.updated_by =
                        (_f = _g.sent().data.user) === null || _f === void 0 ? void 0 : _f.id),
                      (_e.updated_at = new Date().toISOString()),
                      _e),
                    ]),
                  ),
                ])
                .eq("id", id)
                .is("deleted_at", null)
                .select()
                .single(),
            ];
          case 2:
            (_a = _g.sent()), (vendor = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating vendor:", error);
              throw new Error("Failed to update vendor: ".concat(error.message));
            }
            return [2 /*return*/, vendor];
          case 3:
            error_4 = _g.sent();
            console.error("Error in updateVendor:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Soft delete vendor
   */
  VendorService.deleteVendor = function (id, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error, _a, _b, error_5;
      var _c;
      var _d;
      return __generator(this, (_e) => {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 3, , 4]);
            _b = (_a = supabase.from("vendors")).update;
            _c = {
              deleted_at: new Date().toISOString(),
            };
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _b
                .apply(_a, [
                  ((_c.deleted_by =
                    (_d = _e.sent().data.user) === null || _d === void 0 ? void 0 : _d.id),
                  (_c.deleted_reason = reason || "Deleted by user"),
                  (_c.updated_at = new Date().toISOString()),
                  _c),
                ])
                .eq("id", id),
            ];
          case 2:
            error = _e.sent().error;
            if (error) {
              console.error("Error deleting vendor:", error);
              throw new Error("Failed to delete vendor: ".concat(error.message));
            }
            return [3 /*break*/, 4];
          case 3:
            error_5 = _e.sent();
            console.error("Error in deleteVendor:", error_5);
            throw error_5;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Toggle vendor active status
   */
  VendorService.toggleVendorStatus = function (id, isActive) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, vendor, error, _b, _c, error_6;
      var _d;
      var _e;
      return __generator(this, (_f) => {
        switch (_f.label) {
          case 0:
            _f.trys.push([0, 3, , 4]);
            _c = (_b = supabase.from("vendors")).update;
            _d = {
              is_active: isActive,
            };
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _c
                .apply(_b, [
                  ((_d.updated_by =
                    (_e = _f.sent().data.user) === null || _e === void 0 ? void 0 : _e.id),
                  (_d.updated_at = new Date().toISOString()),
                  _d),
                ])
                .eq("id", id)
                .is("deleted_at", null)
                .select()
                .single(),
            ];
          case 2:
            (_a = _f.sent()), (vendor = _a.data), (error = _a.error);
            if (error) {
              console.error("Error toggling vendor status:", error);
              throw new Error("Failed to toggle vendor status: ".concat(error.message));
            }
            return [2 /*return*/, vendor];
          case 3:
            error_6 = _f.sent();
            console.error("Error in toggleVendorStatus:", error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if vendor code is unique
   */
  VendorService.isVendorCodeUnique = function (vendorCode, excludeId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_7;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = supabase
              .from("vendors")
              .select("id")
              .eq("vendor_code", vendorCode)
              .is("deleted_at", null);
            if (excludeId) {
              query = query.neq("id", excludeId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error checking vendor code uniqueness:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, data.length === 0];
          case 2:
            error_7 = _b.sent();
            console.error("Error in isVendorCodeUnique:", error_7);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate next vendor code
   */
  VendorService.generateVendorCode = function () {
    return __awaiter(this, arguments, void 0, function (prefix) {
      var _a, data, error, lastCode, numericPart, nextNumber, error_8;
      if (prefix === void 0) {
        prefix = "VEND";
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("vendors")
                .select("vendor_code")
                .like("vendor_code", "".concat(prefix, "%"))
                .is("deleted_at", null)
                .order("vendor_code", { ascending: false })
                .limit(1),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error generating vendor code:", error);
              return [2 /*return*/, "".concat(prefix, "001")];
            }
            if (!data || data.length === 0) {
              return [2 /*return*/, "".concat(prefix, "001")];
            }
            lastCode = data[0].vendor_code;
            numericPart = lastCode.replace(prefix, "");
            nextNumber = parseInt(numericPart) + 1;
            return [2 /*return*/, "".concat(prefix).concat(nextNumber.toString().padStart(3, "0"))];
          case 2:
            error_8 = _b.sent();
            console.error("Error in generateVendorCode:", error_8);
            return [2 /*return*/, "".concat(prefix, "001")];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active vendors for dropdown selection
   */
  VendorService.getActiveVendorsForSelection = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, vendors, error, error_9;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("vendors")
                .select("id, vendor_code, company_name")
                .eq("is_active", true)
                .is("deleted_at", null)
                .order("company_name"),
            ];
          case 1:
            (_a = _b.sent()), (vendors = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching active vendors:", error);
              throw new Error("Failed to fetch active vendors: ".concat(error.message));
            }
            return [
              2 /*return*/,
              vendors.map((vendor) => ({
                id: vendor.id,
                label: "".concat(vendor.vendor_code, " - ").concat(vendor.company_name),
                value: vendor.id,
              })),
            ];
          case 2:
            error_9 = _b.sent();
            console.error("Error in getActiveVendorsForSelection:", error_9);
            throw error_9;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get vendor statistics
   */
  VendorService.getVendorStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, totalResult, activeResult, inactiveResult, typesResult, typeDistribution, error_10;
      var _b;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              Promise.all([
                supabase
                  .from("vendors")
                  .select("id", { count: "exact", head: true })
                  .is("deleted_at", null),
                supabase
                  .from("vendors")
                  .select("id", { count: "exact", head: true })
                  .eq("is_active", true)
                  .is("deleted_at", null),
                supabase
                  .from("vendors")
                  .select("id", { count: "exact", head: true })
                  .eq("is_active", false)
                  .is("deleted_at", null),
                supabase.from("vendors").select("vendor_type").is("deleted_at", null),
              ]),
            ];
          case 1:
            (_a = _c.sent()),
              (totalResult = _a[0]),
              (activeResult = _a[1]),
              (inactiveResult = _a[2]),
              (typesResult = _a[3]);
            typeDistribution =
              ((_b = typesResult.data) === null || _b === void 0
                ? void 0
                : _b.reduce((acc, vendor) => {
                    acc[vendor.vendor_type] = (acc[vendor.vendor_type] || 0) + 1;
                    return acc;
                  }, {})) || {};
            return [
              2 /*return*/,
              {
                total: totalResult.count || 0,
                active: activeResult.count || 0,
                inactive: inactiveResult.count || 0,
                typeDistribution: typeDistribution,
              },
            ];
          case 2:
            error_10 = _c.sent();
            console.error("Error in getVendorStats:", error_10);
            return [
              2 /*return*/,
              {
                total: 0,
                active: 0,
                inactive: 0,
                typeDistribution: {},
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return VendorService;
})();
exports.VendorService = VendorService;
