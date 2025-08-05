// =====================================================
// SessionWarning Component - Session Expiration Warnings
// Story 1.4: Session Management & Security
// =====================================================
'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionWarning = SessionWarning;
var react_1 = require("react");
var auth_1 = require("@/hooks/auth");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// =====================================================
// MAIN COMPONENT
// =====================================================
function SessionWarning(_a) {
    var _this = this;
    var className = _a.className, _b = _a.warningThreshold, warningThreshold = _b === void 0 ? 5 : _b, // 5 minutes
    _c = _a.criticalThreshold, // 5 minutes
    criticalThreshold = _c === void 0 ? 2 : _c, // 2 minutes
    _d = _a.autoShow, // 2 minutes
    autoShow = _d === void 0 ? true : _d, _e = _a.showAsDialog, showAsDialog = _e === void 0 ? true : _e, _f = _a.showAsAlert, showAsAlert = _f === void 0 ? false : _f, onExtend = _a.onExtend, onLogout = _a.onLogout, onDismiss = _a.onDismiss;
    var _g = (0, auth_1.useSession)(), isAuthenticated = _g.isAuthenticated, isExpiringSoon = _g.isExpiringSoon, isExpired = _g.isExpired, extendSession = _g.extendSession, logout = _g.logout;
    var _h = (0, auth_1.useSessionTimeout)(), timeRemainingMinutes = _h.timeRemainingMinutes, timeRemainingFormatted = _h.timeRemainingFormatted;
    var _j = (0, react_1.useState)(false), isVisible = _j[0], setIsVisible = _j[1];
    var _k = (0, react_1.useState)(false), isDismissed = _k[0], setIsDismissed = _k[1];
    var _l = (0, react_1.useState)('none'), lastWarningLevel = _l[0], setLastWarningLevel = _l[1];
    // Determine warning level
    var getWarningLevel = function () {
        if (!isAuthenticated)
            return 'none';
        if (isExpired)
            return 'expired';
        if (timeRemainingMinutes <= criticalThreshold)
            return 'critical';
        if (timeRemainingMinutes <= warningThreshold)
            return 'warning';
        return 'none';
    };
    var warningLevel = getWarningLevel();
    // Auto-show logic
    (0, react_1.useEffect)(function () {
        if (!autoShow || !isAuthenticated)
            return;
        var shouldShow = warningLevel !== 'none' && !isDismissed;
        // Reset dismissal if warning level escalates
        if (warningLevel !== lastWarningLevel && warningLevel !== 'none') {
            setIsDismissed(false);
            setIsVisible(shouldShow);
        }
        else if (shouldShow && !isVisible) {
            setIsVisible(true);
        }
        setLastWarningLevel(warningLevel);
    }, [warningLevel, isDismissed, autoShow, isAuthenticated, lastWarningLevel, isVisible]);
    // Handle actions
    var handleExtend = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, extendSession()];
                case 1:
                    _a.sent();
                    onExtend === null || onExtend === void 0 ? void 0 : onExtend();
                    setIsVisible(false);
                    setIsDismissed(false);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to extend session:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleLogout = function () {
        logout();
        onLogout === null || onLogout === void 0 ? void 0 : onLogout();
        setIsVisible(false);
    };
    var handleDismiss = function () {
        setIsVisible(false);
        setIsDismissed(true);
        onDismiss === null || onDismiss === void 0 ? void 0 : onDismiss();
    };
    // Get warning configuration based on level
    var getWarningConfig = function (level) {
        switch (level) {
            case 'expired':
                return {
                    title: 'Session Expired',
                    description: 'Your session has expired. Please log in again to continue.',
                    variant: 'destructive',
                    icon: lucide_react_1.AlertTriangle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    showExtend: false,
                    showLogout: true
                };
            case 'critical':
                return {
                    title: 'Session Expiring Soon',
                    description: "Your session will expire in ".concat((timeRemainingFormatted === null || timeRemainingFormatted === void 0 ? void 0 : timeRemainingFormatted.minutes) || 0, " minutes and ").concat((timeRemainingFormatted === null || timeRemainingFormatted === void 0 ? void 0 : timeRemainingFormatted.seconds) || 0, " seconds. Extend now to avoid losing your work."),
                    variant: 'destructive',
                    icon: lucide_react_1.AlertTriangle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    showExtend: true,
                    showLogout: true
                };
            case 'warning':
                return {
                    title: 'Session Warning',
                    description: "Your session will expire in ".concat((timeRemainingFormatted === null || timeRemainingFormatted === void 0 ? void 0 : timeRemainingFormatted.minutes) || 0, " minutes. Consider extending your session to continue working."),
                    variant: 'default',
                    icon: lucide_react_1.Clock,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    showExtend: true,
                    showLogout: false
                };
            default:
                return null;
        }
    };
    var config = getWarningConfig(warningLevel);
    if (!config || !isVisible || warningLevel === 'none') {
        return null;
    }
    var IconComponent = config.icon;
    var progressValue = Math.max(0, (timeRemainingMinutes / warningThreshold) * 100);
    // Dialog variant
    if (showAsDialog) {
        return (<dialog_1.Dialog open={isVisible} onOpenChange={function (open) { return !open && handleDismiss(); }}>
        <dialog_1.DialogContent className={(0, utils_1.cn)('sm:max-w-md', className)}>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="flex items-center gap-2">
              <IconComponent className={(0, utils_1.cn)('h-5 w-5', config.color)}/>
              {config.title}
              <badge_1.Badge variant={config.variant} className="ml-auto">
                {warningLevel.toUpperCase()}
              </badge_1.Badge>
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription className="text-left">
              {config.description}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          {/* Time Progress */}
          {timeRemainingFormatted && warningLevel !== 'expired' && (<div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Time Remaining</span>
                <span className={(0, utils_1.cn)('font-mono', config.color)}>
                  {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
                </span>
              </div>
              <progress_1.Progress value={progressValue} className="h-2"/>
            </div>)}

          <dialog_1.DialogFooter className="flex-col sm:flex-row gap-2">
            {config.showExtend && (<button_1.Button onClick={handleExtend} className="flex-1">
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
                Extend Session
              </button_1.Button>)}
            
            {config.showLogout && (<button_1.Button variant="outline" onClick={handleLogout} className="flex-1">
                <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
                Logout
              </button_1.Button>)}
            
            {warningLevel === 'warning' && (<button_1.Button variant="ghost" onClick={handleDismiss} className="flex-1">
                <lucide_react_1.X className="h-4 w-4 mr-2"/>
                Dismiss
              </button_1.Button>)}
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>);
    }
    // Alert variant
    if (showAsAlert) {
        return (<alert_1.Alert variant={config.variant} className={(0, utils_1.cn)('relative', config.bgColor, config.borderColor, className)}>
        <IconComponent className="h-4 w-4"/>
        <alert_1.AlertTitle className="flex items-center justify-between">
          {config.title}
          <badge_1.Badge variant={config.variant} className="ml-2">
            {warningLevel.toUpperCase()}
          </badge_1.Badge>
        </alert_1.AlertTitle>
        <alert_1.AlertDescription className="mt-2">
          {config.description}
        </alert_1.AlertDescription>
        
        {/* Time Progress */}
        {timeRemainingFormatted && warningLevel !== 'expired' && (<div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Time Remaining</span>
              <span className={(0, utils_1.cn)('font-mono', config.color)}>
                {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
              </span>
            </div>
            <progress_1.Progress value={progressValue} className="h-2"/>
          </div>)}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {config.showExtend && (<button_1.Button size="sm" onClick={handleExtend}>
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
              Extend
            </button_1.Button>)}
          
          {config.showLogout && (<button_1.Button size="sm" variant="outline" onClick={handleLogout}>
              <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
              Logout
            </button_1.Button>)}
          
          {warningLevel === 'warning' && (<button_1.Button size="sm" variant="ghost" onClick={handleDismiss}>
              <lucide_react_1.X className="h-4 w-4 mr-2"/>
              Dismiss
            </button_1.Button>)}
        </div>
        
        {/* Close button for alert */}
        <button_1.Button variant="ghost" size="sm" onClick={handleDismiss} className="absolute top-2 right-2 h-6 w-6 p-0">
          <lucide_react_1.X className="h-4 w-4"/>
        </button_1.Button>
      </alert_1.Alert>);
    }
    return null;
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = SessionWarning;
