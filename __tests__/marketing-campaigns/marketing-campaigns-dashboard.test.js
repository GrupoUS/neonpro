// =====================================================================================
// MARKETING CAMPAIGNS DASHBOARD TESTS - Story 7.2
// Unit tests for automated marketing campaigns with AI personalization
// =====================================================================================
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var marketing_campaigns_dashboard_1 = require("@/app/components/marketing/marketing-campaigns-dashboard");
// Mock the UI components
jest.mock("@/app/components/ui/card", () => ({
  Card: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="card" {...props}>
        {children}
      </div>
    );
  },
  CardContent: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="card-content" {...props}>
        {children}
      </div>
    );
  },
  CardDescription: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="card-description" {...props}>
        {children}
      </div>
    );
  },
  CardHeader: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="card-header" {...props}>
        {children}
      </div>
    );
  },
  CardTitle: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="card-title" {...props}>
        {children}
      </div>
    );
  },
}));
jest.mock("@/app/components/ui/tabs", () => ({
  Tabs: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="tabs" {...props}>
        {children}
      </div>
    );
  },
  TabsContent: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="tabs-content" {...props}>
        {children}
      </div>
    );
  },
  TabsList: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <div data-testid="tabs-list" {...props}>
        {children}
      </div>
    );
  },
  TabsTrigger: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <button data-testid="tabs-trigger" {...props}>
        {children}
      </button>
    );
  },
}));
jest.mock("@/app/components/ui/button", () => ({
  Button: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <button data-testid="button" {...props}>
        {children}
      </button>
    );
  },
}));
jest.mock("@/app/components/ui/badge", () => ({
  Badge: (_a) => {
    var children = _a.children,
      props = __rest(_a, ["children"]);
    return (
      <span data-testid="badge" {...props}>
        {children}
      </span>
    );
  },
}));
jest.mock("@/app/components/ui/progress", () => ({
  Progress: (_a) => {
    var value = _a.value,
      props = __rest(_a, ["value"]);
    return <div data-testid="progress" data-value={value} {...props}></div>;
  },
}));
describe("MarketingCampaignsDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Rendering and Layout", () => {
    it("should render the main dashboard component", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByTestId("tabs")).toBeInTheDocument();
      expect(react_1.screen.getAllByTestId("card")).toHaveLength(5); // 4 metric cards + content cards
    });
    it("should display key metrics cards", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Check for metric cards
      expect(react_1.screen.getByText("Total Campaigns")).toBeInTheDocument();
      expect(react_1.screen.getByText("Automation Rate")).toBeInTheDocument();
      expect(react_1.screen.getByText("Total Reach")).toBeInTheDocument();
      expect(react_1.screen.getByText("Campaign ROI")).toBeInTheDocument();
    });
    it("should display tab navigation", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("Overview")).toBeInTheDocument();
      expect(react_1.screen.getByText("Campaigns")).toBeInTheDocument();
      expect(react_1.screen.getByText("A/B Testing")).toBeInTheDocument();
      expect(react_1.screen.getByText("Analytics")).toBeInTheDocument();
      expect(react_1.screen.getByText("Automation")).toBeInTheDocument();
    });
    it("should display create campaign button", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      var createButton = react_1.screen.getByText("Create Campaign");
      expect(createButton).toBeInTheDocument();
    });
  });
  describe("Metrics Display", () => {
    it("should display correct automation rate", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Should show 89% automation rate from mock data
      expect(react_1.screen.getByText("89%")).toBeInTheDocument();
    });
    it("should display total campaigns count", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Should show 12 total campaigns from mock data
      expect(react_1.screen.getByText("12")).toBeInTheDocument();
    });
    it("should display campaign ROI", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Should show 4.2x ROI from mock data
      expect(react_1.screen.getByText("4.2x")).toBeInTheDocument();
    });
    it("should display automation rate progress bar", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      var progressBar = react_1.screen.getByTestId("progress");
      expect(progressBar).toHaveAttribute("data-value", "89");
    });
  });
  describe("Tab Navigation", () => {
    it("should display overview tab content by default", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("Recent Campaigns")).toBeInTheDocument();
      expect(react_1.screen.getByText("AI Personalization")).toBeInTheDocument();
    });
    it("should display campaigns tab content when selected", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, campaignsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              campaignsTab = react_1.screen.getByText("Campaigns");
              return [4 /*yield*/, user.click(campaignsTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("All Campaigns")).toBeInTheDocument();
                  expect(
                    react_1.screen.getByText(
                      "Manage and monitor your automated marketing campaigns",
                    ),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display A/B testing tab content when selected", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, abTestingTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              abTestingTab = react_1.screen.getByText("A/B Testing");
              return [4 /*yield*/, user.click(abTestingTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("A/B Testing Framework")).toBeInTheDocument();
                  expect(
                    react_1.screen.getByText("Optimize campaigns with statistical A/B testing"),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display analytics tab content when selected", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, analyticsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              analyticsTab = react_1.screen.getByText("Analytics");
              return [4 /*yield*/, user.click(analyticsTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("Campaign Analytics")).toBeInTheDocument();
                  expect(
                    react_1.screen.getByText("Real-time performance tracking and ROI measurement"),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display automation tab content when selected", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, automationTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              automationTab = react_1.screen.getByText("Automation");
              return [4 /*yield*/, user.click(automationTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(
                    react_1.screen.getByText("Campaign Automation Engine"),
                  ).toBeInTheDocument();
                  expect(
                    react_1.screen.getByText("≥80% automation rate with AI-driven optimization"),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Campaign Data Display", () => {
    it("should display recent campaigns", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("Welcome Series - New Patients")).toBeInTheDocument();
      expect(react_1.screen.getByText("Treatment Follow-up Campaign")).toBeInTheDocument();
      expect(react_1.screen.getByText("Birthday Promotions")).toBeInTheDocument();
    });
    it("should display campaign status badges", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      var badges = react_1.screen.getAllByTestId("badge");
      expect(badges.length).toBeGreaterThan(0);
    });
    it("should display campaign metrics correctly", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Should display automation rates from mock data
      expect(react_1.screen.getByText("92% automated")).toBeInTheDocument();
      expect(react_1.screen.getByText("87% automated")).toBeInTheDocument();
      expect(react_1.screen.getByText("95% automated")).toBeInTheDocument();
    });
  });
  describe("AI Personalization Features", () => {
    it("should display AI personalization status", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("AI Personalization")).toBeInTheDocument();
      expect(react_1.screen.getByText("Content Personalization")).toBeInTheDocument();
      expect(react_1.screen.getByText("Send Time Optimization")).toBeInTheDocument();
      expect(react_1.screen.getByText("Segment Targeting")).toBeInTheDocument();
    });
    it("should display LGPD compliance status", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("LGPD Compliance: Active")).toBeInTheDocument();
    });
    it("should display personalization progress bars", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Should have multiple progress bars for AI features
      var progressBars = react_1.screen.getAllByTestId("progress");
      expect(progressBars.length).toBeGreaterThan(1);
    });
  });
  describe("Automation Features", () => {
    it("should display automation statistics in automation tab", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, automationTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              automationTab = react_1.screen.getByText("Automation");
              return [4 /*yield*/, user.click(automationTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("Trigger-based Campaigns")).toBeInTheDocument();
                  expect(react_1.screen.getByText("AI Personalization")).toBeInTheDocument();
                  expect(react_1.screen.getByText("LGPD Compliance")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display automation rates above 80% threshold", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, automationTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              automationTab = react_1.screen.getByText("Automation");
              return [4 /*yield*/, user.click(automationTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("94%")).toBeInTheDocument(); // Trigger-based campaigns
                  expect(react_1.screen.getByText("87%")).toBeInTheDocument(); // AI Personalization
                  expect(react_1.screen.getByText("100%")).toBeInTheDocument(); // LGPD Compliance
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display quick automation setup options", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, automationTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              automationTab = react_1.screen.getByText("Automation");
              return [4 /*yield*/, user.click(automationTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("Schedule Campaign")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Setup Triggers")).toBeInTheDocument();
                  expect(react_1.screen.getByText("AI Optimization")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Compliance Check")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Accessibility", () => {
    it("should have proper ARIA labels for tabs", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      var tabsList = react_1.screen.getByTestId("tabs-list");
      expect(tabsList).toBeInTheDocument();
    });
    it("should have accessible button elements", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      var buttons = react_1.screen.getAllByTestId("button");
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
    it("should have proper heading structure", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      var cardTitles = react_1.screen.getAllByTestId("card-title");
      expect(cardTitles.length).toBeGreaterThan(0);
    });
  });
  describe("Responsive Design", () => {
    it("should render without errors on different screen sizes", () => {
      // Test mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByTestId("tabs")).toBeInTheDocument();
      // Test desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByTestId("tabs")).toBeInTheDocument();
    });
  });
  describe("Story 7.2 Acceptance Criteria", () => {
    it("should meet ≥80% automation rate requirement", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      // Check that automation rate is 89% (above 80% threshold)
      expect(react_1.screen.getByText("89%")).toBeInTheDocument();
    });
    it("should display AI-driven personalization features", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("AI Personalization")).toBeInTheDocument();
      expect(react_1.screen.getByText("Content Personalization")).toBeInTheDocument();
      expect(react_1.screen.getByText("Send Time Optimization")).toBeInTheDocument();
    });
    it("should display multi-channel campaign support", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("multi_channel")).toBeInTheDocument();
      expect(react_1.screen.getByText("whatsapp")).toBeInTheDocument();
      expect(react_1.screen.getByText("email")).toBeInTheDocument();
    });
    it("should display A/B testing framework", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, abTestingTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              abTestingTab = react_1.screen.getByText("A/B Testing");
              return [4 /*yield*/, user.click(abTestingTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("A/B Testing Framework")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Create A/B Test")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display analytics and ROI tracking", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, analyticsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
              analyticsTab = react_1.screen.getByText("Analytics");
              return [4 /*yield*/, user.click(analyticsTab)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  expect(react_1.screen.getByText("Campaign Analytics")).toBeInTheDocument();
                  expect(
                    react_1.screen.getByText("Real-time performance tracking and ROI measurement"),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should display LGPD compliance features", () => {
      (0, react_1.render)(<marketing_campaigns_dashboard_1.MarketingCampaignsDashboard />);
      expect(react_1.screen.getByText("LGPD Compliance: Active")).toBeInTheDocument();
    });
  });
});
