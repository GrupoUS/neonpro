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
exports.useTransactionEntry = useTransactionEntry;
// Temporary transaction hooks for cash flow development
// These will be replaced with proper Supabase implementation
var react_1 = require("react");
function useTransactionEntry(clinicId) {
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(null),
    error = _b[0],
    setError = _b[1];
  var createEntry = (entry) =>
    __awaiter(this, void 0, void 0, function () {
      var newEntry, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 2:
            // Simulate API call
            _a.sent();
            newEntry = __assign(__assign({}, entry), {
              id: Math.random().toString(36).substr(2, 9),
              clinic_id: clinicId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setIsLoading(false);
            return [2 /*return*/, { data: newEntry, error: null }];
          case 3:
            err_1 = _a.sent();
            setError("Failed to create transaction entry");
            setIsLoading(false);
            return [2 /*return*/, { data: null, error: "Failed to create transaction entry" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var updateEntry = (id, updates) =>
    __awaiter(this, void 0, void 0, function () {
      var err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 2:
            // Simulate API call
            _a.sent();
            setIsLoading(false);
            return [2 /*return*/, { data: __assign({ id: id }, updates), error: null }];
          case 3:
            err_2 = _a.sent();
            setError("Failed to update transaction entry");
            setIsLoading(false);
            return [2 /*return*/, { data: null, error: "Failed to update transaction entry" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var deleteEntry = (id) =>
    __awaiter(this, void 0, void 0, function () {
      var err_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 2:
            // Simulate API call
            _a.sent();
            setIsLoading(false);
            return [2 /*return*/, { error: null }];
          case 3:
            err_3 = _a.sent();
            setError("Failed to delete transaction entry");
            setIsLoading(false);
            return [2 /*return*/, { error: "Failed to delete transaction entry" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  return {
    createEntry: createEntry,
    updateEntry: updateEntry,
    deleteEntry: deleteEntry,
    isLoading: isLoading,
    error: error,
  };
}
