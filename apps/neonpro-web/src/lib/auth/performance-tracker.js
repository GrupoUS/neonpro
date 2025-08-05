"use strict";
// Performance tracker utilities and monitoring
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
exports.trackAPIPerformance =
  exports.trackAuthPerformance =
  exports.trackLoginPerformance =
  exports.trackPerformance =
  exports.trackMFAVerification =
  exports.performanceTracker =
  exports.PerformanceTracker =
    void 0;
exports.trackOperation = trackOperation;
var PerformanceTracker = /** @class */ (function () {
  function PerformanceTracker() {}
  PerformanceTracker.getInstance = function () {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  };
  PerformanceTracker.prototype.track = function (operation, metadata) {
    var _this = this;
    var startTime = Date.now();
    return {
      end: function (success) {
        if (success === void 0) {
          success = true;
        }
        var duration = Date.now() - startTime;
        var metrics = {
          duration: duration,
          timestamp: startTime,
          operation: operation,
          success: success,
          metadata: metadata,
        };
        _this.logMetrics(metrics);
      },
    };
  };
  PerformanceTracker.prototype.logMetrics = function (metrics) {
    console.log("[PERFORMANCE]", metrics);
    // Em produção, enviar para sistema de monitoramento
    if (process.env.NODE_ENV === "production") {
      // Implementar envio para sistema de monitoramento
    }
  };
  return PerformanceTracker;
})();
exports.PerformanceTracker = PerformanceTracker;
// Instância global
exports.performanceTracker = PerformanceTracker.getInstance();
// Funções utilitárias específicas
var trackMFAVerification = function (data) {
  console.log("[MFA PERFORMANCE]", data);
};
exports.trackMFAVerification = trackMFAVerification;
var trackPerformance = function (metric, value) {
  console.log("[PERFORMANCE]", metric, value);
};
exports.trackPerformance = trackPerformance;
var trackLoginPerformance = function (data) {
  console.log("[LOGIN PERFORMANCE]", data);
};
exports.trackLoginPerformance = trackLoginPerformance;
var trackAuthPerformance = function (operation, duration, success) {
  if (success === void 0) {
    success = true;
  }
  var metrics = {
    duration: duration,
    timestamp: Date.now(),
    operation: "auth.".concat(operation),
    success: success,
  };
  console.log("[AUTH PERFORMANCE]", metrics);
};
exports.trackAuthPerformance = trackAuthPerformance;
var trackAPIPerformance = function (endpoint, method, duration, statusCode) {
  var metrics = {
    duration: duration,
    timestamp: Date.now(),
    operation: "api.".concat(method, ".").concat(endpoint),
    success: statusCode >= 200 && statusCode < 400,
    metadata: { statusCode: statusCode, method: method, endpoint: endpoint },
  };
  console.log("[API PERFORMANCE]", metrics);
};
exports.trackAPIPerformance = trackAPIPerformance;
// Decorator para tracking automático
function trackOperation(operationName) {
  return function (target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;
    descriptor.value = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return __awaiter(this, void 0, void 0, function () {
        var tracker, result, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              tracker = exports.performanceTracker.track(operationName);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, originalMethod.apply(this, args)];
            case 2:
              result = _a.sent();
              tracker.end(true);
              return [2 /*return*/, result];
            case 3:
              error_1 = _a.sent();
              tracker.end(false);
              throw error_1;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    };
    return descriptor;
  };
}
exports.default = exports.performanceTracker;
