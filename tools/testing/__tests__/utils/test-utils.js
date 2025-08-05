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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  ((m, exports) => {
    for (var p in m)
      if (p !== "default" && !Object.hasOwn(exports, p)) __createBinding(exports, m, p);
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
var react_1 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
// Create a custom render function that includes providers
var AllTheProviders = (_a) => {
  var children = _a.children;
  var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>
  );
};
var customRender = (ui, options) =>
  (0, react_1.render)(ui, __assign({ wrapper: AllTheProviders }, options));
exports.render = customRender;
__exportStar(require("@testing-library/react"), exports);
