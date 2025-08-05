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
exports.useRegulatoryCategories = useRegulatoryCategories;
var react_1 = require("react");
var sonner_1 = require("sonner");
function useRegulatoryCategories(options) {
  if (options === void 0) {
    options = {};
  }
  var _a = (0, react_1.useState)([]),
    categories = _a[0],
    setCategories = _a[1];
  var _b = (0, react_1.useState)({}),
    groupedCategories = _b[0],
    setGroupedCategories = _b[1];
  var _c = (0, react_1.useState)([]),
    authorities = _c[0],
    setAuthorities = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var buildQuery = (0, react_1.useCallback)(() => {
    var params = new URLSearchParams();
    if (options.authority) params.set("authority", options.authority);
    if (options.search) params.set("search", options.search);
    return params.toString();
  }, [options]);
  var fetchCategories = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var query, response, data, err_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setLoading(true);
              setError(null);
              query = buildQuery();
              return [4 /*yield*/, fetch("/api/regulatory-documents/categories?".concat(query))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch categories");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setCategories(data.categories);
              setGroupedCategories(data.groupedCategories);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              setError(err_1 instanceof Error ? err_1.message : "Unknown error");
              sonner_1.toast.error("Erro ao carregar categorias regulatórias");
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [buildQuery],
  );
  var fetchAuthorities = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/regulatory-documents/categories", {
                  method: "POST",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch authorities");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setAuthorities(data.authorities);
              return [3 /*break*/, 4];
            case 3:
              err_2 = _a.sent();
              console.error("Error fetching authorities:", err_2);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var refetch = (0, react_1.useCallback)(() => {
    fetchCategories();
    fetchAuthorities();
  }, [fetchCategories, fetchAuthorities]);
  (0, react_1.useEffect)(() => {
    fetchCategories();
    fetchAuthorities();
  }, [fetchCategories, fetchAuthorities]);
  return {
    categories: categories,
    groupedCategories: groupedCategories,
    authorities: authorities,
    loading: loading,
    error: error,
    refetch: refetch,
  };
}
