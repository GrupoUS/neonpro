/**
 * Subscription Upgrade Prompt Component
 *
 * Modal component that displays upgrade prompts when users hit subscription limits
 * or when their subscription has expired. Provides clear CTAs for upgrading.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradePrompt = UpgradePrompt;
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var dialog_1 = require("../ui/dialog");
var progress_1 = require("../ui/progress");
var separator_1 = require("../ui/separator");
var upgradeReasons = {
  expired: {
    title: "Subscription Expired",
    description:
      "Your subscription has expired. Renew now to continue accessing all premium features.",
    urgency: "critical",
    icon: lucide_react_1.AlertTriangle,
    badge: "Action Required",
    features: [
      "Full patient management system",
      "Unlimited appointments",
      "Advanced reporting",
      "Priority support",
    ],
    ctaPrimary: "Renew Subscription",
    ctaSecondary: "View Plans",
  },
  cancelled: {
    title: "Subscription Cancelled",
    description:
      "Your subscription was cancelled. Reactivate to restore access to premium features.",
    urgency: "high",
    icon: lucide_react_1.AlertTriangle,
    badge: "Reactivate",
    features: [
      "Patient records and history",
      "Appointment scheduling",
      "Financial reports",
      "Multi-clinic support",
    ],
    ctaPrimary: "Reactivate Plan",
    ctaSecondary: "Browse Plans",
  },
  trial_ended: {
    title: "Free Trial Ended",
    description:
      "Your free trial has ended. Upgrade now to continue using NeonPro without limitations.",
    urgency: "high",
    icon: lucide_react_1.Sparkles,
    badge: "Trial Complete",
    features: [
      "Unlimited patient records",
      "Advanced analytics",
      "Custom workflows",
      "Premium integrations",
    ],
    ctaPrimary: "Start Paid Plan",
    ctaSecondary: "Extend Trial",
  },
  feature_limit: {
    title: "Feature Upgrade Required",
    description:
      "This feature requires a higher subscription tier. Upgrade to unlock advanced capabilities.",
    urgency: "medium",
    icon: lucide_react_1.Crown,
    badge: "Premium Feature",
    features: [
      "Advanced reporting suite",
      "Custom dashboard widgets",
      "API access",
      "White-label options",
    ],
    ctaPrimary: "Upgrade Plan",
    ctaSecondary: "Learn More",
  },
  usage_limit: {
    title: "Usage Limit Reached",
    description:
      "You've reached your plan's usage limit. Upgrade to continue without restrictions.",
    urgency: "medium",
    icon: lucide_react_1.TrendingUp,
    badge: "Limit Reached",
    features: [
      "Higher usage limits",
      "Unlimited storage",
      "Advanced features",
      "Priority processing",
    ],
    ctaPrimary: "Increase Limits",
    ctaSecondary: "Manage Usage",
  },
};
var urgencyConfig = {
  low: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    badgeVariant: "outline",
  },
  medium: {
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    badgeVariant: "outline",
  },
  high: {
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    badgeVariant: "destructive",
  },
  critical: {
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    badgeVariant: "destructive",
  },
};
function UpgradePrompt(_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    reason = _a.reason,
    _b = _a.currentPlan,
    currentPlan = _b === void 0 ? "Free" : _b,
    _c = _a.suggestedPlan,
    suggestedPlan = _c === void 0 ? "Professional" : _c,
    usageMetrics = _a.usageMetrics,
    onUpgrade = _a.onUpgrade,
    onExtendTrial = _a.onExtendTrial,
    className = _a.className;
  var _d = (0, react_1.useState)(false),
    isUpgrading = _d[0],
    setIsUpgrading = _d[1];
  var _e = (0, react_1.useState)(false),
    isExtending = _e[0],
    setIsExtending = _e[1];
  var config = upgradeReasons[reason];
  var urgency = urgencyConfig[config.urgency];
  var Icon = config.icon;
  var handleUpgrade = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!onUpgrade) return [2 /*return*/];
            setIsUpgrading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onUpgrade()];
          case 2:
            _a.sent();
            onClose();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Upgrade failed:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsUpgrading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleExtendTrial = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!onExtendTrial) return [2 /*return*/];
            setIsExtending(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onExtendTrial()];
          case 2:
            _a.sent();
            onClose();
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Trial extension failed:", error_2);
            return [3 /*break*/, 5];
          case 4:
            setIsExtending(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var usagePercentage = usageMetrics
    ? Math.round((usageMetrics.current / usageMetrics.limit) * 100)
    : 0;
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className={(0, utils_1.cn)("sm:max-w-lg", className)}>
        <dialog_1.DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={(0, utils_1.cn)("p-2 rounded-lg", urgency.bgColor)}>
                <Icon className={(0, utils_1.cn)("h-5 w-5", urgency.color)} />
              </div>
              <div>
                <dialog_1.DialogTitle className="text-xl font-semibold">
                  {config.title}
                </dialog_1.DialogTitle>
                <badge_1.Badge variant={urgency.badgeVariant} className="mt-1">
                  {config.badge}
                </badge_1.Badge>
              </div>
            </div>
            <button_1.Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <lucide_react_1.X className="h-4 w-4" />
            </button_1.Button>
          </div>
          <dialog_1.DialogDescription className="text-base mt-4">
            {config.description}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Usage Metrics */}
          {usageMetrics && (
            <div className={(0, utils_1.cn)("p-4 rounded-lg", urgency.bgColor)}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{usageMetrics.label}</span>
                <span className="text-sm text-muted-foreground">
                  {usageMetrics.current} / {usageMetrics.limit}
                </span>
              </div>
              <progress_1.Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {usagePercentage >= 100
                  ? "You've reached your limit"
                  : "".concat(100 - usagePercentage, "% remaining")}
              </p>
            </div>
          )}

          {/* Current vs Suggested Plan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium text-sm text-muted-foreground">Current Plan</h4>
              <p className="font-semibold">{currentPlan}</p>
            </div>
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <h4 className="font-medium text-sm text-primary">Recommended</h4>
              <p className="font-semibold text-primary">{suggestedPlan}</p>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <lucide_react_1.Zap className="h-4 w-4 mr-2 text-primary" />
              What you'll get with {suggestedPlan}
            </h4>
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full mr-3" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <separator_1.Separator />

        <dialog_1.DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row">
          {config.ctaSecondary && (
            <button_1.Button
              variant="outline"
              onClick={reason === "trial_ended" ? handleExtendTrial : onClose}
              disabled={isUpgrading || isExtending}
              className="w-full sm:w-auto"
            >
              {isExtending ? "Extending..." : config.ctaSecondary}
            </button_1.Button>
          )}
          <button_1.Button
            onClick={handleUpgrade}
            disabled={isUpgrading || isExtending || !onUpgrade}
            className="w-full sm:w-auto"
          >
            {isUpgrading ? "Processing..." : config.ctaPrimary}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
exports.default = UpgradePrompt;
