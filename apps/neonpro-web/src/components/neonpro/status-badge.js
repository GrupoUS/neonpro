"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBadge = void 0;
/**
 * NEONPROV1 Design System - StatusBadge Component
 * Healthcare status indicators with NEONPROV1 styling
 */
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var StatusBadge = function (_a) {
    var status = _a.status, _b = _a.size, size = _b === void 0 ? 'md' : _b, _c = _a.showIcon, showIcon = _c === void 0 ? true : _c, customLabel = _a.customLabel, _d = _a.pulse, pulse = _d === void 0 ? false : _d, className = _a.className;
    var getStatusConfig = function (status) {
        var configs = {
            critical: {
                label: 'Crítico',
                icon: lucide_react_1.AlertTriangle,
                className: 'neon-status-critical bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
            },
            urgent: {
                label: 'Urgente',
                icon: lucide_react_1.Zap,
                className: 'neon-status-urgent bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800',
            },
            normal: {
                label: 'Normal',
                icon: lucide_react_1.Activity,
                className: 'neon-status-normal bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
            },
            pending: {
                label: 'Pendente',
                icon: lucide_react_1.Clock,
                className: 'neon-status-pending bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
            },
            completed: {
                label: 'Concluído',
                icon: lucide_react_1.CheckCircle,
                className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800',
            },
            cancelled: {
                label: 'Cancelado',
                icon: lucide_react_1.XCircle,
                className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800',
            },
            scheduled: {
                label: 'Agendado',
                icon: lucide_react_1.Clock,
                className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
            },
            'in-progress': {
                label: 'Em Andamento',
                icon: lucide_react_1.AlertCircle,
                className: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-800',
            },
        };
        return configs[status];
    };
    var getSizeClasses = function (size) {
        var sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-xs',
            lg: 'px-3 py-1.5 text-sm',
        };
        return sizes[size];
    };
    var getIconSize = function (size) {
        var iconSizes = {
            sm: 'w-3 h-3',
            md: 'w-3.5 h-3.5',
            lg: 'w-4 h-4',
        };
        return iconSizes[size];
    };
    var config = getStatusConfig(status);
    var Icon = config.icon;
    var label = customLabel || config.label;
    return (<badge_1.Badge className={(0, utils_1.cn)('inline-flex items-center gap-1.5 font-medium rounded-full border', 'transition-all duration-200 ease-in-out', getSizeClasses(size), config.className, {
            'animate-pulse-neon': pulse,
        }, className)}>
      {showIcon && (<Icon className={(0, utils_1.cn)('flex-shrink-0', getIconSize(size))}/>)}
      <span className="truncate">{label}</span>
    </badge_1.Badge>);
};
exports.StatusBadge = StatusBadge;
