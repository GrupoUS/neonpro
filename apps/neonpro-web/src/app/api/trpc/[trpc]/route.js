"use strict";
/**
 * tRPC API Route Handler for Next.js App Router
 * Healthcare-compliant API endpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
var fetch_1 = require("@trpc/server/adapters/fetch");
var root_1 = require("@/server/root");
var trpc_1 = require("@/server/trpc");
var handler = function (req) {
  return (0, fetch_1.fetchRequestHandler)({
    endpoint: "/api/trpc",
    req: req,
    router: root_1.appRouter,
    createContext: trpc_1.createTRPCContext,
    onError:
      process.env.NODE_ENV === "development"
        ? function (_a) {
            var path = _a.path,
              error = _a.error;
            console.error(
              "\u274C tRPC failed on "
                .concat(path !== null && path !== void 0 ? path : "<no-path>", ": ")
                .concat(error.message),
            );
          }
        : undefined,
  });
};
exports.GET = handler;
exports.POST = handler;
