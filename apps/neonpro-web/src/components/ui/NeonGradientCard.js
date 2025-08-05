'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonGradientCard = void 0;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var utils_1 = require("@/lib/utils");
var gradientClasses = {
    primary: 'from-primary/20 via-primary/10 to-transparent',
    secondary: 'from-secondary/20 via-secondary/10 to-transparent',
    accent: 'from-accent/20 via-accent/10 to-transparent',
    success: 'from-success/20 via-success/10 to-transparent',
    warning: 'from-warning/20 via-warning/10 to-transparent',
    danger: 'from-danger/20 via-danger/10 to-transparent',
};
var borderGradients = {
    primary: 'from-primary via-secondary to-accent',
    secondary: 'from-secondary via-accent to-primary',
    accent: 'from-accent via-primary to-secondary',
    success: 'from-success via-success/70 to-success/40',
    warning: 'from-warning via-warning/70 to-warning/40',
    danger: 'from-danger via-danger/70 to-danger/40',
};
var NeonGradientCard = function (_a) {
    var children = _a.children, className = _a.className, _b = _a.gradient, gradient = _b === void 0 ? 'primary' : _b, _c = _a.animated, animated = _c === void 0 ? true : _c, _d = _a.hover, hover = _d === void 0 ? true : _d;
    var motionProps = animated ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
            duration: 0.5,
            type: 'spring',
            stiffness: 400,
            damping: 17
        },
        whileHover: hover ? {
            scale: 1.02,
            y: -5,
            transition: {
                duration: 0.2,
                type: 'spring',
                stiffness: 400,
                damping: 17
            }
        } : undefined,
    } : {};
    return (<framer_motion_1.motion.div {...motionProps} className={(0, utils_1.cn)('relative overflow-hidden rounded-xl backdrop-blur-sm', 'bg-gradient-to-br', gradientClasses[gradient], 'border border-white/10', 'shadow-2xl shadow-black/25', animated && 'animate-glow-scale', className)}>
      {/* Animated border gradient */}
      <div className={(0, utils_1.cn)('absolute inset-0 rounded-xl opacity-75', 'bg-gradient-to-r', borderGradients[gradient], animated && 'animate-background-position-spin')} style={{
            padding: '1px',
            backgroundSize: '200% 200%',
        }}>
        <div className="h-full w-full rounded-xl bg-gray-900/95 backdrop-blur-sm"/>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Glow effect overlay */}
      <div className={(0, utils_1.cn)('absolute inset-0 rounded-xl pointer-events-none', 'bg-gradient-to-r', borderGradients[gradient], 'opacity-0 transition-opacity duration-300', hover && 'group-hover:opacity-20')}/>
    </framer_motion_1.motion.div>);
};
exports.NeonGradientCard = NeonGradientCard;
