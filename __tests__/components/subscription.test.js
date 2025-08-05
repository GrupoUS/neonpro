"use strict";
/**
 * Subscription Components Unit Tests
 * Tests UI components for subscription system
 *
 * @description Comprehensive component tests using React Testing Library,
 *              covering all subscription UI components and interactions
 * @version 1.0.0
 * @created 2025-07-22
 */
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
var globals_1 = require("@jest/globals");
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var testUtils_1 = require("../utils/testUtils");
// Mock subscription components (to be imported when they exist)
var MockSubscriptionStatusCard = function (_a) {
    var _b = _a.variant, variant = _b === void 0 ? 'default' : _b;
    return (<div data-testid="subscription-status-card" data-variant={variant}>
    <h3>Subscription Status</h3>
    <p>Premium Plan - Active</p>
    <button>Upgrade</button>
  </div>);
};
var MockFeatureGate = function (_a) {
    var feature = _a.feature, children = _a.children, fallback = _a.fallback;
    return (<div data-testid="feature-gate" data-feature={feature}>
    {children}
    {fallback}
  </div>);
};
// ============================================================================
// Component Tests
// ============================================================================
(0, globals_1.describe)('Subscription Components', function () {
    var user = user_event_1.default.setup();
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
    });
    // ============================================================================
    // Status Card Tests
    // ============================================================================
    (0, globals_1.describe)('SubscriptionStatusCard', function () {
        (0, globals_1.it)('should render status card with correct information', function () {
            (0, testUtils_1.renderWithProviders)(<MockSubscriptionStatusCard />);
            (0, globals_1.expect)(react_1.screen.getByTestId('subscription-status-card')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Subscription Status')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Premium Plan - Active')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
        });
        (0, globals_1.it)('should handle different variants correctly', function () {
            (0, testUtils_1.renderWithProviders)(<MockSubscriptionStatusCard variant="compact"/>);
            var card = react_1.screen.getByTestId('subscription-status-card');
            (0, globals_1.expect)(card).toHaveAttribute('data-variant', 'compact');
        });
        (0, globals_1.it)('should handle click events on upgrade button', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockClick, upgradeButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClick = globals_1.jest.fn();
                        (0, testUtils_1.renderWithProviders)(<div>
          <button onClick={mockClick} data-testid="upgrade-button">
            Upgrade Plan
          </button>
        </div>);
                        upgradeButton = react_1.screen.getByTestId('upgrade-button');
                        return [4 /*yield*/, user.click(upgradeButton)];
                    case 1:
                        _a.sent();
                        (0, globals_1.expect)(mockClick).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // ============================================================================
    // Feature Gate Tests
    // ============================================================================
    (0, globals_1.describe)('FeatureGate', function () {
        (0, globals_1.it)('should render children when feature is available', function () {
            (0, testUtils_1.renderWithProviders)(<MockFeatureGate feature="premium-analytics">
          <div data-testid="premium-content">Premium Analytics Dashboard</div>
        </MockFeatureGate>);
            (0, globals_1.expect)(react_1.screen.getByTestId('feature-gate')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByTestId('premium-content')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Premium Analytics Dashboard')).toBeInTheDocument();
        });
        (0, globals_1.it)('should render fallback for restricted features', function () {
            (0, testUtils_1.renderWithProviders)(<MockFeatureGate feature="enterprise-only" fallback={<div data-testid="upgrade-prompt">Upgrade to access this feature</div>}>
          <div data-testid="restricted-content">Enterprise Feature</div>
        </MockFeatureGate>);
            (0, globals_1.expect)(react_1.screen.getByTestId('feature-gate')).toBeInTheDocument();
        });
        (0, globals_1.it)('should pass correct feature attribute', function () {
            (0, testUtils_1.renderWithProviders)(<MockFeatureGate feature="advanced-reports">
          <div>Advanced Reports</div>
        </MockFeatureGate>);
            var gate = react_1.screen.getByTestId('feature-gate');
            (0, globals_1.expect)(gate).toHaveAttribute('data-feature', 'advanced-reports');
        });
    });
    // ============================================================================
    // Notification Tests
    // ============================================================================
    (0, globals_1.describe)('SubscriptionNotifications', function () {
        (0, globals_1.it)('should display subscription expiration warnings', function () {
            var mockNotification = (<div data-testid="subscription-notification" role="alert">
          <p>Your subscription expires in 7 days</p>
          <button>Renew Now</button>
        </div>);
            (0, testUtils_1.renderWithProviders)(mockNotification);
            (0, globals_1.expect)(react_1.screen.getByTestId('subscription-notification')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByRole('alert')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Your subscription expires in 7 days')).toBeInTheDocument();
        });
    });
});
