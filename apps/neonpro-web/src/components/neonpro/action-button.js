"use strict";
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionButton = void 0;
/**
 * NEONPROV1 Design System - ActionButton Component
 * Healthcare-optimized buttons with NEONPROV1 styling
 */
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
exports.ActionButton = react_1.default.forwardRef(function (_a, ref) {
  var children = _a.children,
    className = _a.className,
    _b = _a.variant,
    variant = _b === void 0 ? "primary" : _b,
    _c = _a.loading,
    loading = _c === void 0 ? false : _c,
    disabled = _a.disabled,
    Icon = _a.icon,
    _d = _a.iconPosition,
    iconPosition = _d === void 0 ? "left" : _d,
    _e = _a.fullWidth,
    fullWidth = _e === void 0 ? false : _e,
    props = __rest(_a, [
      "children",
      "className",
      "variant",
      "loading",
      "disabled",
      "icon",
      "iconPosition",
      "fullWidth",
    ]);
  var getVariantStyles = function () {
    var variants = {
      primary: (0, utils_1.cn)(
        "neon-button-primary",
        "bg-neon-primary hover:bg-blue-700 focus:ring-neon-accent",
        "text-white font-medium",
        "disabled:bg-slate-300 disabled:text-slate-500",
      ),
      secondary: (0, utils_1.cn)(
        "neon-button-secondary",
        "bg-neon-secondary hover:bg-blue-600 focus:ring-neon-accent",
        "text-white font-medium",
        "disabled:bg-slate-300 disabled:text-slate-500",
      ),
      success: (0, utils_1.cn)(
        "bg-healthcare-completed hover:bg-green-700 focus:ring-green-400",
        "text-white font-medium",
        "disabled:bg-slate-300 disabled:text-slate-500",
      ),
      warning: (0, utils_1.cn)(
        "bg-healthcare-urgent hover:bg-orange-700 focus:ring-orange-400",
        "text-white font-medium",
        "disabled:bg-slate-300 disabled:text-slate-500",
      ),
      danger: (0, utils_1.cn)(
        "bg-healthcare-critical hover:bg-red-700 focus:ring-red-400",
        "text-white font-medium",
        "disabled:bg-slate-300 disabled:text-slate-500",
      ),
      ghost: (0, utils_1.cn)(
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
        "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
        "border-0 focus:ring-neon-accent",
        "disabled:text-slate-400 disabled:hover:bg-transparent",
      ),
      outline: (0, utils_1.cn)(
        "bg-transparent hover:bg-neon-primary hover:text-white",
        "text-neon-primary border-neon-primary border-2",
        "focus:ring-neon-accent",
        "disabled:text-slate-400 disabled:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-400",
      ),
    };
    return variants[variant];
  };
  var isDisabled = disabled || loading;
  return (
    <button_1.Button
      ref={ref}
      className={(0, utils_1.cn)(
        "neon-transition neon-focus",
        "px-4 py-2 rounded-md font-medium",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        getVariantStyles(),
        {
          "w-full": fullWidth,
        },
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin" />}

        {Icon && !loading && iconPosition === "left" && <Icon className="w-4 h-4" />}

        {children && (
          <span
            className={(0, utils_1.cn)("truncate", {
              "sr-only": loading && !children,
            })}
          >
            {children}
          </span>
        )}

        {Icon && !loading && iconPosition === "right" && <Icon className="w-4 h-4" />}
      </div>
    </button_1.Button>
  );
});
exports.ActionButton.displayName = "ActionButton";
