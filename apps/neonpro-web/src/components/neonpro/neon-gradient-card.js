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
exports.NeonGradientCard = void 0;
/**
 * NEONPROV1 Design System - NeonGradientCard Component
 * Advanced card with gradient backgrounds and cosmic animations
 */
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var card_1 = require("@/components/ui/card");
exports.NeonGradientCard = react_1.default.forwardRef(function (_a, ref) {
  var children = _a.children,
    className = _a.className,
    _b = _a.variant,
    variant = _b === void 0 ? "default" : _b,
    _c = _a.priority,
    priority = _c === void 0 ? "normal" : _c,
    title = _a.title,
    description = _a.description,
    footer = _a.footer,
    _d = _a.loading,
    loading = _d === void 0 ? false : _d,
    onClick = _a.onClick,
    _e = _a.glowEffect,
    glowEffect = _e === void 0 ? true : _e,
    _f = _a.animateOnHover,
    animateOnHover = _f === void 0 ? true : _f,
    _g = _a.backgroundAnimation,
    backgroundAnimation = _g === void 0 ? true : _g,
    props = __rest(_a, [
      "children",
      "className",
      "variant",
      "priority",
      "title",
      "description",
      "footer",
      "loading",
      "onClick",
      "glowEffect",
      "animateOnHover",
      "backgroundAnimation",
    ]);
  var isInteractive = !!onClick;
  var getVariantStyles = function () {
    var baseStyles = "relative overflow-hidden transition-all duration-300 ease-out";
    var variants = {
      default: (0, utils_1.cn)(
        baseStyles,
        "bg-gradient-to-br from-white to-slate-50",
        "dark:from-slate-900 dark:to-slate-800",
        "border border-slate-200 dark:border-slate-700",
        "shadow-lg hover:shadow-xl",
        glowEffect && "hover:shadow-slate-200/50 dark:hover:shadow-slate-700/50",
      ),
      primary: (0, utils_1.cn)(
        baseStyles,
        "bg-gradient-to-br from-neon-primary/5 to-neon-secondary/10",
        "dark:from-neon-primary/10 dark:to-neon-secondary/20",
        "border border-neon-primary/20 dark:border-neon-primary/30",
        "shadow-lg hover:shadow-xl",
        glowEffect && "hover:shadow-neon-primary/25",
      ),
      success: (0, utils_1.cn)(
        baseStyles,
        "bg-gradient-to-br from-neon-success/5 to-emerald-400/10",
        "dark:from-neon-success/10 dark:to-emerald-400/20",
        "border border-neon-success/20 dark:border-neon-success/30",
        "shadow-lg hover:shadow-xl",
        glowEffect && "hover:shadow-neon-success/25",
      ),
      warning: (0, utils_1.cn)(
        baseStyles,
        "bg-gradient-to-br from-neon-warning/5 to-amber-400/10",
        "dark:from-neon-warning/10 dark:to-amber-400/20",
        "border border-neon-warning/20 dark:border-neon-warning/30",
        "shadow-lg hover:shadow-xl",
        glowEffect && "hover:shadow-neon-warning/25",
      ),
      danger: (0, utils_1.cn)(
        baseStyles,
        "bg-gradient-to-br from-neon-danger/5 to-red-400/10",
        "dark:from-neon-danger/10 dark:to-red-400/20",
        "border border-neon-danger/20 dark:border-neon-danger/30",
        "shadow-lg hover:shadow-xl",
        glowEffect && "hover:shadow-neon-danger/25",
      ),
      cosmic: (0, utils_1.cn)(
        baseStyles,
        "bg-gradient-to-br from-neon-primary/10 via-neon-accent/5 to-neon-secondary/10",
        "dark:from-neon-primary/20 dark:via-neon-accent/10 dark:to-neon-secondary/20",
        "border border-transparent bg-clip-padding",
        "shadow-xl hover:shadow-2xl",
        glowEffect && "hover:shadow-neon-primary/30",
      ),
    };
    return variants[variant];
  };
  var getPriorityAccent = function () {
    if (variant !== "default") return "";
    var accents = {
      normal: "border-l-4 border-l-neon-success",
      urgent: "border-l-4 border-l-neon-warning",
      critical: "border-l-4 border-l-neon-danger",
    };
    return accents[priority];
  };
  var cardClassName = (0, utils_1.cn)(
    "group relative",
    "rounded-xl",
    getVariantStyles(),
    getPriorityAccent(),
    {
      // Interactive styles
      "cursor-pointer": isInteractive,
      "hover:scale-105 active:scale-100": isInteractive && animateOnHover,
      "motion-reduce:hover:scale-100 motion-reduce:active:scale-100": isInteractive,
      // Loading state
      "animate-pulse": loading,
      "pointer-events-none": loading,
    },
    className,
  );
  return (
    <card_1.Card ref={ref} className={cardClassName} onClick={onClick} {...props}>
      {/* Cosmic background animation */}
      {backgroundAnimation && variant === "cosmic" && !loading && (
        <>
          <div
            className={(0, utils_1.cn)(
              "absolute inset-0 rounded-xl opacity-30",
              "bg-gradient-to-r from-transparent via-neon-primary/10 to-transparent",
              "motion-reduce:opacity-0",
            )}
            style={{
              backgroundSize: "200% 100%",
              animation: "background-position-spin 8s linear infinite",
            }}
          />
          <div
            className={(0, utils_1.cn)(
              "absolute inset-0 rounded-xl opacity-20",
              "bg-gradient-to-br from-neon-accent/20 via-transparent to-neon-secondary/20",
              "animate-pulse",
              "motion-reduce:animate-none motion-reduce:opacity-0",
            )}
          />
        </>
      )}

      {/* Glow effect for primary variants */}
      {glowEffect && variant !== "default" && !loading && (
        <div
          className={(0, utils_1.cn)(
            "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "motion-reduce:opacity-0",
          )}
          style={{
            background:
              variant === "primary"
                ? "radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.1) 0%, transparent 70%)"
                : variant === "success"
                  ? "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)"
                  : variant === "warning"
                    ? "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 70%)"
                    : variant === "danger"
                      ? "radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 70%)"
                      : variant === "cosmic"
                        ? "radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.15) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)"
                        : "none",
          }}
        />
      )}

      {/* Card content */}
      <div className="relative z-10">
        {(title || description) && (
          <card_1.CardHeader className="pb-4">
            {title && (
              <card_1.CardTitle
                className={(0, utils_1.cn)("text-xl font-bold transition-colors duration-200", {
                  "text-healthcare-critical": priority === "critical",
                  "text-healthcare-urgent": priority === "urgent",
                  "text-neon-primary": priority === "normal" || variant === "primary",
                  "text-neon-success": variant === "success",
                  "text-neon-warning": variant === "warning",
                  "text-neon-danger": variant === "danger",
                  "text-gradient-neon": variant === "cosmic",
                })}
              >
                {loading
                  ? <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  : title}
              </card_1.CardTitle>
            )}
            {description && (
              <card_1.CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                {loading
                  ? <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  : description}
              </card_1.CardDescription>
            )}
          </card_1.CardHeader>
        )}

        <card_1.CardContent
          className={(0, utils_1.cn)("relative", !title && !description && "pt-6")}
        >
          {loading
            ? <div className="space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
              </div>
            : children}
        </card_1.CardContent>

        {footer && (
          <card_1.CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {loading
              ? <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
              : footer}
          </card_1.CardFooter>
        )}
      </div>
    </card_1.Card>
  );
});
exports.NeonGradientCard.displayName = "NeonGradientCard";
