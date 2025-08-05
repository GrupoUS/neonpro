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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.createServerClient = createClient;
exports.createLegacyServerClient = createClient;
exports.createOptimizedServerClient = createOptimizedServerClient;
// app/utils/supabase/server.ts
// Task 1.3 - CONNECTION POOLING OPTIMIZATION
// Updated server client with connection pooling integration
var ssr_1 = require("@supabase/ssr");
var headers_1 = require("next/headers");
var connection_pool_manager_1 = require("@/lib/supabase/connection-pool-manager");
function createClient() {
  return __awaiter(this, void 0, void 0, function () {
    var cookieStore;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, (0, headers_1.cookies)()];
        case 1:
          cookieStore = _a.sent();
          return [
            2 /*return*/,
            (0, ssr_1.createServerClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
              cookies: {
                get: function (name) {
                  var _a;
                  return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                },
                set: function (name, value, options) {
                  try {
                    cookieStore.set(__assign({ name: name, value: value }, options));
                  } catch (error) {
                    // Ocorre em Server Actions quando se tenta setar um cookie.
                    // A middleware se encarregará de atualizar os cookies.
                  }
                },
                remove: function (name, options) {
                  try {
                    cookieStore.set(__assign({ name: name, value: "" }, options));
                  } catch (error) {
                    // Ocorre em Server Actions quando se tenta remover um cookie.
                  }
                },
              },
            }),
          ];
      }
    });
  });
}
// New optimized server client factory with pooling
function createOptimizedServerClient(clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var poolManager;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          poolManager = (0, connection_pool_manager_1.getConnectionPoolManager)();
          return [4 /*yield*/, poolManager.getServerClient(clinicId)];
        case 1:
          return [2 /*return*/, _a.sent()];
      }
    });
  });
}
