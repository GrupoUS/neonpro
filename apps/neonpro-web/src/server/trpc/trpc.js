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
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.publicProcedure = exports.createTRPCRouter = void 0;
var server_1 = require("@trpc/server");
var superjson_1 = require("superjson");
var zod_1 = require("zod");
// Initialize tRPC with healthcare context
var t = server_1.initTRPC.context().create({
  transformer: superjson_1.default,
  errorFormatter: (_a) => {
    var shape = _a.shape,
      error = _a.error;
    return __assign(__assign({}, shape), {
      data: __assign(__assign({}, shape.data), {
        zodError: error.cause instanceof zod_1.ZodError ? error.cause.flatten() : null,
        healthcareCompliant: true,
        timestamp: new Date().toISOString(),
      }),
    });
  },
});
// Export tRPC utilities
exports.createTRPCRouter = t.router;
exports.publicProcedure = t.procedure;
exports.middleware = t.middleware;
