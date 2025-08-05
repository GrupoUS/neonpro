"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonCard = void 0;
/**
 * NEONPROV1 Design System - NeonCard Component
 * Healthcare-optimized card component with NEONPROV1 styling
 */
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var card_1 = require("@/components/ui/card");
exports.NeonCard = react_1.default.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, _b = _a.variant, variant = _b === void 0 ? 'default' : _b, _c = _a.priority, priority = _c === void 0 ? 'normal' : _c, title = _a.title, description = _a.description, footer = _a.footer, _d = _a.loading, loading = _d === void 0 ? false : _d, onClick = _a.onClick, props = __rest(_a, ["children", "className", "variant", "priority", "title", "description", "footer", "loading", "onClick"]);
    var isInteractive = variant === 'interactive' || !!onClick;
    var cardClassName = (0, utils_1.cn)('neon-card neon-transition', {
        // Interactive variants
        'neon-card-interactive hover:neon-shadow-primary': isInteractive,
        'cursor-pointer': isInteractive,
        // Metric card styling
        'border-l-4 border-l-neon-primary bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900': variant === 'metric',
        // Status card styling with priority
        'border-l-4': variant === 'status',
        'border-l-healthcare-normal': variant === 'status' && priority === 'normal',
        'border-l-healthcare-urgent': variant === 'status' && priority === 'urgent',
        'border-l-healthcare-critical': variant === 'status' && priority === 'critical',
        // Loading state
        'animate-pulse': loading,
        'pointer-events-none': loading,
    }, className);
    var cardContent = (<>
      {(title || description) && (<card_1.CardHeader className="pb-3">
          {title && (<card_1.CardTitle className={(0, utils_1.cn)('text-lg font-semibold', {
                    'text-healthcare-critical': priority === 'critical',
                    'text-healthcare-urgent': priority === 'urgent',
                    'text-neon-primary': priority === 'normal',
                })}>
              {loading ? (<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"/>) : (title)}
            </card_1.CardTitle>)}
          {description && (<card_1.CardDescription className="text-slate-600 dark:text-slate-400">
              {loading ? (<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2"/>) : (description)}
            </card_1.CardDescription>)}
        </card_1.CardHeader>)}
      
      <card_1.CardContent className={(0, utils_1.cn)('pt-0', !title && !description && 'pt-6')}>
        {loading ? (<div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"/>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"/>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"/>
          </div>) : (children)}
      </card_1.CardContent>
      
      {footer && (<card_1.CardFooter className="pt-0">
          {loading ? (<div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full"/>) : (footer)}
        </card_1.CardFooter>)}
    </>);
    return (<card_1.Card ref={ref} className={cardClassName} onClick={onClick} {...props}>
      {cardContent}
    </card_1.Card>);
});
exports.NeonCard.displayName = 'NeonCard';
