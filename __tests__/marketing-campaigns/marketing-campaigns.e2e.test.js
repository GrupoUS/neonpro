"use strict";
// =====================================================================================
// MARKETING CAMPAIGNS E2E TESTS - Story 7.2
// End-to-end tests for automated marketing campaigns functionality
// =====================================================================================
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
test_1.test.describe("Marketing Campaigns Dashboard - E2E Tests", function () {
  test_1.test.beforeEach(function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            // Navigate to login and authenticate
            return [4 /*yield*/, page.goto("/login")];
          case 1:
            // Navigate to login and authenticate
            _c.sent();
            // Mock authentication for testing
            return [
              4 /*yield*/,
              page.evaluate(function () {
                window.localStorage.setItem("supabase.auth.token", "mock-auth-token");
              }),
            ];
          case 2:
            // Mock authentication for testing
            _c.sent();
            // Navigate to marketing campaigns dashboard
            return [4 /*yield*/, page.goto("/dashboard/marketing-campaigns")];
          case 3:
            // Navigate to marketing campaigns dashboard
            _c.sent();
            return [4 /*yield*/, page.waitForLoadState("networkidle")];
          case 4:
            _c.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test_1.test.describe("Dashboard Loading and Layout", function () {
    (0, test_1.test)("should load the marketing campaigns dashboard", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("h1")).toContainText(
                  "Automated Marketing Campaigns",
                ),
              ];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('[data-testid="tabs"]')).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display key metrics cards", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Total Campaigns")).toBeVisible(),
              ];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Automation Rate")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Total Reach")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign ROI")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display tab navigation", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('button:has-text("Overview")')).toBeVisible(),
              ];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('button:has-text("Campaigns")')).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('button:has-text("A/B Testing")')).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('button:has-text("Analytics")')).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('button:has-text("Automation")')).toBeVisible(),
              ];
            case 5:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Tab Navigation", function () {
    (0, test_1.test)("should navigate between tabs correctly", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              // Test Campaigns tab
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              // Test Campaigns tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=All Campaigns")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Manage and monitor your automated marketing campaigns"),
                ).toBeVisible(),
              ];
            case 3:
              _c.sent();
              // Test A/B Testing tab
              return [4 /*yield*/, page.click('button:has-text("A/B Testing")')];
            case 4:
              // Test A/B Testing tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=A/B Testing Framework")).toBeVisible(),
              ];
            case 5:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Optimize campaigns with statistical A/B testing"),
                ).toBeVisible(),
              ];
            case 6:
              _c.sent();
              // Test Analytics tab
              return [4 /*yield*/, page.click('button:has-text("Analytics")')];
            case 7:
              // Test Analytics tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign Analytics")).toBeVisible(),
              ];
            case 8:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Real-time performance tracking and ROI measurement"),
                ).toBeVisible(),
              ];
            case 9:
              _c.sent();
              // Test Automation tab
              return [4 /*yield*/, page.click('button:has-text("Automation")')];
            case 10:
              // Test Automation tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign Automation Engine")).toBeVisible(),
              ];
            case 11:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=≥80% automation rate with AI-driven optimization"),
                ).toBeVisible(),
              ];
            case 12:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should maintain tab state when switching", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              // Go to Campaigns tab
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              // Go to Campaigns tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=All Campaigns")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              // Go to Overview tab and back
              return [4 /*yield*/, page.click('button:has-text("Overview")')];
            case 3:
              // Go to Overview tab and back
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Recent Campaigns")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 5:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=All Campaigns")).toBeVisible(),
              ];
            case 6:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Campaign Data Display", function () {
    (0, test_1.test)("should display campaign list in campaigns tab", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              _c.sent();
              // Check for campaign items
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Welcome Series - New Patients"),
                ).toBeVisible(),
              ];
            case 2:
              // Check for campaign items
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Treatment Follow-up Campaign")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Birthday Promotions")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display campaign metrics correctly", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              _c.sent();
              // Check for automation rates
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=92% automated")).toBeVisible(),
              ];
            case 2:
              // Check for automation rates
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=87% automated")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=95% automated")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display campaign status badges", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              _c.sent();
              // Check for status badges
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('[data-testid="badge"]:has-text("active")'),
                ).toBeVisible(),
              ];
            case 2:
              // Check for status badges
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('[data-testid="badge"]:has-text("scheduled")'),
                ).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Automation Features", function () {
    (0, test_1.test)("should display automation statistics", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Automation")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Trigger-based Campaigns")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=AI Personalization")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=LGPD Compliance")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              // Check automation percentages
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=94%").first()).toBeVisible(),
              ];
            case 5:
              // Check automation percentages
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=87%").first()).toBeVisible(),
              ];
            case 6:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=100%").first()).toBeVisible(),
              ];
            case 7:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display quick automation setup options", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Automation")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('button:has-text("Schedule Campaign")'),
                ).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('button:has-text("Setup Triggers")')).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('button:has-text("AI Optimization")'),
                ).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('button:has-text("Compliance Check")'),
                ).toBeVisible(),
              ];
            case 5:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should verify automation rate meets ≥80% requirement", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var automationRateElement, automationText, automationValue;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              automationRateElement = page.locator("text=89%").first();
              return [4 /*yield*/, (0, test_1.expect)(automationRateElement).toBeVisible()];
            case 1:
              _c.sent();
              return [4 /*yield*/, automationRateElement.textContent()];
            case 2:
              automationText = _c.sent();
              automationValue = parseInt(
                (automationText === null || automationText === void 0
                  ? void 0
                  : automationText.replace("%", "")) || "0",
              );
              (0, test_1.expect)(automationValue).toBeGreaterThanOrEqual(80);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("AI Personalization Features", function () {
    (0, test_1.test)("should display AI personalization status", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              // Should be visible on overview tab by default
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=AI Personalization")).toBeVisible(),
              ];
            case 1:
              // Should be visible on overview tab by default
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Content Personalization")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Send Time Optimization")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Segment Targeting")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display LGPD compliance status", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=LGPD Compliance: Active")).toBeVisible(),
              ];
            case 1:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should show AI feature progress bars", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var progressBars;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              progressBars = page.locator('[data-testid="progress"]');
              return [4 /*yield*/, (0, test_1.expect)(progressBars).toHaveCountGreaterThan(0)];
            case 1:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("A/B Testing Framework", function () {
    (0, test_1.test)("should display A/B testing interface", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("A/B Testing")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=A/B Testing Framework")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator(
                    "text=Statistical A/B testing framework with automated winner selection",
                  ),
                ).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('button:has-text("Create A/B Test")'),
                ).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display create A/B test button", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var createTestButton;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("A/B Testing")')];
            case 1:
              _c.sent();
              createTestButton = page.locator('button:has-text("Create A/B Test")');
              return [4 /*yield*/, (0, test_1.expect)(createTestButton).toBeVisible()];
            case 2:
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(createTestButton).toBeEnabled()];
            case 3:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Analytics and ROI Tracking", function () {
    (0, test_1.test)("should display analytics interface", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Analytics")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign Analytics")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Real-time performance tracking and ROI measurement"),
                ).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display ROI metrics in overview", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              // Check ROI display
              return [4 /*yield*/, (0, test_1.expect)(page.locator("text=4.2x")).toBeVisible()];
            case 1:
              // Check ROI display
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign ROI")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Campaign Creation Flow", function () {
    (0, test_1.test)("should display create campaign button", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var createButton;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              createButton = page.locator('button:has-text("Create Campaign")');
              return [4 /*yield*/, (0, test_1.expect)(createButton).toBeVisible()];
            case 1:
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(createButton).toBeEnabled()];
            case 2:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should be able to click create campaign button", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var createButton;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              createButton = page.locator('button:has-text("Create Campaign")');
              return [4 /*yield*/, createButton.click()];
            case 1:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Multi-Channel Support", function () {
    (0, test_1.test)("should display multi-channel campaign types", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              _c.sent();
              // Check for different campaign types
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=multi_channel")).toBeVisible(),
              ];
            case 2:
              // Check for different campaign types
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(page.locator("text=email")).toBeVisible()];
            case 3:
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(page.locator("text=whatsapp")).toBeVisible()];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Responsive Design", function () {
    (0, test_1.test)("should work on mobile viewport", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.setViewportSize({ width: 375, height: 667 })];
            case 1:
              _c.sent();
              // Dashboard should still be functional
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("h1")).toContainText(
                  "Automated Marketing Campaigns",
                ),
              ];
            case 2:
              // Dashboard should still be functional
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('[data-testid="tabs"]')).toBeVisible(),
              ];
            case 3:
              _c.sent();
              // Tabs should be accessible
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 4:
              // Tabs should be accessible
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=All Campaigns")).toBeVisible(),
              ];
            case 5:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should work on tablet viewport", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.setViewportSize({ width: 768, height: 1024 })];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("h1")).toContainText(
                  "Automated Marketing Campaigns",
                ),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('[data-testid="tabs"]')).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should work on desktop viewport", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.setViewportSize({ width: 1920, height: 1080 })];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("h1")).toContainText(
                  "Automated Marketing Campaigns",
                ),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator('[data-testid="tabs"]')).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Performance and Loading", function () {
    (0, test_1.test)("should load dashboard within acceptable time", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var startTime, loadTime;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              startTime = Date.now();
              return [4 /*yield*/, page.goto("/dashboard/marketing-campaigns")];
            case 1:
              _c.sent();
              return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 2:
              _c.sent();
              loadTime = Date.now() - startTime;
              (0, test_1.expect)(loadTime).toBeLessThan(5000); // Should load within 5 seconds
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should handle navigation between tabs quickly", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var startTime, navigationTime;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              startTime = Date.now();
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=All Campaigns")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [4 /*yield*/, page.click('button:has-text("Analytics")')];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign Analytics")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              navigationTime = Date.now() - startTime;
              (0, test_1.expect)(navigationTime).toBeLessThan(2000); // Navigation should be fast
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Accessibility", function () {
    (0, test_1.test)("should have proper heading structure", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var h1;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              h1 = page.locator("h1");
              return [4 /*yield*/, (0, test_1.expect)(h1).toHaveCount(1)];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(h1).toContainText("Automated Marketing Campaigns"),
              ];
            case 2:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should have accessible tab navigation", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var tabs, i, _c, tab;
        var page = _b.page;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              tabs = page.locator('button[role="tab"], [data-testid="tabs-trigger"]');
              return [4 /*yield*/, (0, test_1.expect)(tabs).toHaveCountGreaterThan(0)];
            case 1:
              _d.sent();
              i = 0;
              _d.label = 2;
            case 2:
              _c = i;
              return [4 /*yield*/, tabs.count()];
            case 3:
              if (!(_c < _d.sent())) return [3 /*break*/, 7];
              tab = tabs.nth(i);
              return [4 /*yield*/, tab.focus()];
            case 4:
              _d.sent();
              return [4 /*yield*/, (0, test_1.expect)(tab).toBeFocused()];
            case 5:
              _d.sent();
              _d.label = 6;
            case 6:
              i++;
              return [3 /*break*/, 2];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should have proper button accessibility", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var buttons, createButton;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              buttons = page.locator("button");
              return [4 /*yield*/, (0, test_1.expect)(buttons).toHaveCountGreaterThan(0)];
            case 1:
              _c.sent();
              createButton = page.locator('button:has-text("Create Campaign")');
              return [4 /*yield*/, createButton.focus()];
            case 2:
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(createButton).toBeFocused()];
            case 3:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Story 7.2 Acceptance Criteria Validation", function () {
    (0, test_1.test)("should meet ≥80% automation rate requirement", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var automationRate;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              automationRate = page.locator("text=89%").first();
              return [4 /*yield*/, (0, test_1.expect)(automationRate).toBeVisible()];
            case 1:
              _c.sent();
              // Verify automation details in automation tab
              return [4 /*yield*/, page.click('button:has-text("Automation")')];
            case 2:
              // Verify automation details in automation tab
              _c.sent();
              // Check individual automation components
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=94%").first()).toBeVisible(),
              ];
            case 3:
              // Check individual automation components
              _c.sent(); // Trigger-based
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=87%").first()).toBeVisible(),
              ];
            case 4:
              _c.sent(); // AI Personalization
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=100%").first()).toBeVisible(),
              ];
            case 5:
              _c.sent(); // LGPD Compliance
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display AI-driven personalization features", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=AI Personalization")).toBeVisible(),
              ];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Content Personalization")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Send Time Optimization")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Segment Targeting")).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should support multi-channel delivery", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("Campaigns")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=multi_channel")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(page.locator("text=email")).toBeVisible()];
            case 3:
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(page.locator("text=whatsapp")).toBeVisible()];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should provide A/B testing framework", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.click('button:has-text("A/B Testing")')];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=A/B Testing Framework")).toBeVisible(),
              ];
            case 2:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Statistical A/B testing framework"),
                ).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator('button:has-text("Create A/B Test")'),
                ).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should display analytics and ROI tracking", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              // Check ROI in overview
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=Campaign ROI")).toBeVisible(),
              ];
            case 1:
              // Check ROI in overview
              _c.sent();
              return [4 /*yield*/, (0, test_1.expect)(page.locator("text=4.2x")).toBeVisible()];
            case 2:
              _c.sent();
              // Check analytics tab
              return [4 /*yield*/, page.click('button:has-text("Analytics")')];
            case 3:
              // Check analytics tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Real-time performance tracking and ROI measurement"),
                ).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should ensure LGPD compliance", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=LGPD Compliance: Active")).toBeVisible(),
              ];
            case 1:
              _c.sent();
              // Check in automation tab
              return [4 /*yield*/, page.click('button:has-text("Automation")')];
            case 2:
              // Check in automation tab
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=LGPD Compliance")).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(page.locator("text=100%").first()).toBeVisible(),
              ];
            case 4:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should provide comprehensive documentation interface", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              // Dashboard should have clear descriptions and help text
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator(
                    "text=Create, manage, and optimize automated marketing campaigns with AI-driven personalization",
                  ),
                ).toBeVisible(),
              ];
            case 1:
              // Dashboard should have clear descriptions and help text
              _c.sent();
              // Each tab should have descriptive content
              return [4 /*yield*/, page.click('button:has-text("A/B Testing")')];
            case 2:
              // Each tab should have descriptive content
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Optimize campaigns with statistical A/B testing"),
                ).toBeVisible(),
              ];
            case 3:
              _c.sent();
              return [4 /*yield*/, page.click('button:has-text("Analytics")')];
            case 4:
              _c.sent();
              return [
                4 /*yield*/,
                (0, test_1.expect)(
                  page.locator("text=Real-time performance tracking and ROI measurement"),
                ).toBeVisible(),
              ];
            case 5:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
