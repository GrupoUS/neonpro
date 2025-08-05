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
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
test_1.test.describe("Analytics Dashboard E2E", () => {
  test_1.test.beforeEach((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Navigate to dashboard page
            return [4 /*yield*/, page.goto("/dashboard/analytics")];
          case 1:
            // Navigate to dashboard page
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should load and display analytics dashboard", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Wait for dashboard to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Check key metrics are displayed
            ];
          case 1:
            // Wait for dashboard to load
            _c.sent();
            // Check key metrics are displayed
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByText("Total Patients")).toBeVisible(),
            ];
          case 2:
            // Check key metrics are displayed
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(page.getByText("Total Revenue")).toBeVisible()];
          case 3:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByText("Average Ticket")).toBeVisible(),
            ];
          case 4:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByText("Conversion Rate")).toBeVisible(),
              // Check charts are rendered
            ];
          case 5:
            _c.sent();
            // Check charts are rendered
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("revenue-chart")).toBeVisible(),
            ];
          case 6:
            // Check charts are rendered
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("patients-chart")).toBeVisible(),
            ];
          case 7:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("cohort-chart")).toBeVisible(),
            ];
          case 8:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should filter data by date range", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var initialCount, newCount;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Wait for dashboard to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Get initial patient count
            ];
          case 1:
            // Wait for dashboard to load
            _c.sent();
            return [
              4 /*yield*/,
              page
                .getByTestId("total-patients-value")
                .textContent(),
              // Open date filters
            ];
          case 2:
            initialCount = _c.sent();
            // Open date filters
            return [4 /*yield*/, page.getByLabel("Start Date").fill("2024-02-01")];
          case 3:
            // Open date filters
            _c.sent();
            return [
              4 /*yield*/,
              page
                .getByLabel("End Date")
                .fill("2024-02-28"),
              // Apply filters
            ];
          case 4:
            _c.sent();
            // Apply filters
            return [
              4 /*yield*/,
              page
                .getByRole("button", { name: "Apply Filters" })
                .click(),
              // Wait for data to update
            ];
          case 5:
            // Apply filters
            _c.sent();
            // Wait for data to update
            return [
              4 /*yield*/,
              page.waitForResponse("**/api/analytics/data**"),
              // Verify data has changed
            ];
          case 6:
            // Wait for data to update
            _c.sent();
            return [4 /*yield*/, page.getByTestId("total-patients-value").textContent()];
          case 7:
            newCount = _c.sent();
            (0, test_1.expect)(newCount).not.toBe(initialCount);
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should export data to PDF", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var downloadPromise, download, _c;
      var page = _b.page;
      return __generator(this, (_d) => {
        switch (_d.label) {
          case 0:
            // Wait for dashboard to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Start download promise before clicking
            ];
          case 1:
            // Wait for dashboard to load
            _d.sent();
            downloadPromise = page.waitForDownload();
            // Click export PDF button
            return [
              4 /*yield*/,
              page
                .getByRole("button", { name: "Export PDF" })
                .click(),
              // Wait for download to complete
            ];
          case 2:
            // Click export PDF button
            _d.sent();
            return [
              4 /*yield*/,
              downloadPromise,
              // Verify download
            ];
          case 3:
            download = _d.sent();
            // Verify download
            (0, test_1.expect)(download.suggestedFilename()).toContain(".pdf");
            _c = test_1.expect;
            return [4 /*yield*/, download.path()];
          case 4:
            _c.apply(void 0, [_d.sent()]).toBeTruthy();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should export data to Excel", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var downloadPromise, download;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Wait for dashboard to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Start download promise
            ];
          case 1:
            // Wait for dashboard to load
            _c.sent();
            downloadPromise = page.waitForDownload();
            // Click export Excel button
            return [
              4 /*yield*/,
              page
                .getByRole("button", { name: "Export Excel" })
                .click(),
              // Wait for download
            ];
          case 2:
            // Click export Excel button
            _c.sent();
            return [
              4 /*yield*/,
              downloadPromise,
              // Verify download
            ];
          case 3:
            download = _c.sent();
            // Verify download
            (0, test_1.expect)(download.suggestedFilename()).toContain(".xlsx");
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should handle mobile viewport", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Set mobile viewport
            return [
              4 /*yield*/,
              page.setViewportSize({ width: 375, height: 667 }),
              // Wait for dashboard to load
            ];
          case 1:
            // Set mobile viewport
            _c.sent();
            // Wait for dashboard to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Check mobile-specific UI elements
            ];
          case 2:
            // Wait for dashboard to load
            _c.sent();
            // Check mobile-specific UI elements
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("mobile-menu-toggle")).toBeVisible(),
            ];
          case 3:
            // Check mobile-specific UI elements
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("mobile-filters")).toBeVisible(),
              // Test mobile navigation
            ];
          case 4:
            _c.sent();
            // Test mobile navigation
            return [4 /*yield*/, page.getByTestId("mobile-menu-toggle").click()];
          case 5:
            // Test mobile navigation
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("mobile-navigation")).toBeVisible(),
            ];
          case 6:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should handle error states gracefully", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Mock API error
            return [
              4 /*yield*/,
              page.route("**/api/analytics/data", (route) =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          route.fulfill({
                            status: 500,
                            contentType: "application/json",
                            body: JSON.stringify({ error: "Database connection failed" }),
                          }),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
              // Navigate to dashboard
            ];
          case 1:
            // Mock API error
            _c.sent();
            // Navigate to dashboard
            return [
              4 /*yield*/,
              page.goto("/dashboard/analytics"),
              // Verify error state is displayed
            ];
          case 2:
            // Navigate to dashboard
            _c.sent();
            // Verify error state is displayed
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-error")).toBeVisible(),
            ];
          case 3:
            // Verify error state is displayed
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByText("Database connection failed")).toBeVisible(),
              // Test retry functionality
            ];
          case 4:
            _c.sent();
            // Test retry functionality
            return [4 /*yield*/, page.getByRole("button", { name: "Retry" }).click()];
          case 5:
            // Test retry functionality
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should handle loading states", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Slow down API response to test loading state
            return [
              4 /*yield*/,
              page.route("**/api/analytics/data", (route) =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2000))]; // 2 second delay
                      case 1:
                        _a.sent(); // 2 second delay
                        return [4 /*yield*/, route.continue()];
                      case 2:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
              // Navigate to dashboard
            ];
          case 1:
            // Slow down API response to test loading state
            _c.sent();
            // Navigate to dashboard
            return [
              4 /*yield*/,
              page.goto("/dashboard/analytics"),
              // Verify loading state is shown
            ];
          case 2:
            // Navigate to dashboard
            _c.sent();
            // Verify loading state is shown
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-loading")).toBeVisible(),
            ];
          case 3:
            // Verify loading state is shown
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByText("Loading analytics...")).toBeVisible(),
              // Wait for data to load
            ];
          case 4:
            _c.sent();
            // Wait for data to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
            ];
          case 5:
            // Wait for data to load
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-loading")).not.toBeVisible(),
            ];
          case 6:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should handle real-time data updates", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var _initialPatients, _initialRevenue;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Wait for initial load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Get initial values
            ];
          case 1:
            // Wait for initial load
            _c.sent();
            return [4 /*yield*/, page.getByTestId("total-patients-value").textContent()];
          case 2:
            _initialPatients = _c.sent();
            return [
              4 /*yield*/,
              page
                .getByTestId("total-revenue-value")
                .textContent(),
              // Click refresh button
            ];
          case 3:
            _initialRevenue = _c.sent();
            // Click refresh button
            return [
              4 /*yield*/,
              page
                .getByRole("button", { name: "Refresh Data" })
                .click(),
              // Wait for refresh to complete
            ];
          case 4:
            // Click refresh button
            _c.sent();
            // Wait for refresh to complete
            return [
              4 /*yield*/,
              page.waitForResponse("**/api/analytics/data**"),
              // Verify data is refreshed (values should be the same or updated)
            ];
          case 5:
            // Wait for refresh to complete
            _c.sent();
            // Verify data is refreshed (values should be the same or updated)
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("total-patients-value")).toBeVisible(),
            ];
          case 6:
            // Verify data is refreshed (values should be the same or updated)
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("total-revenue-value")).toBeVisible(),
            ];
          case 7:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should maintain filters across page refreshes", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Set filters
            return [4 /*yield*/, page.getByLabel("Start Date").fill("2024-02-01")];
          case 1:
            // Set filters
            _c.sent();
            return [
              4 /*yield*/,
              page
                .getByLabel("End Date")
                .fill("2024-02-28"),
              // Select treatment filter
            ];
          case 2:
            _c.sent();
            // Select treatment filter
            return [4 /*yield*/, page.getByLabel("Treatments").click()];
          case 3:
            // Select treatment filter
            _c.sent();
            return [
              4 /*yield*/,
              page
                .getByRole("option", { name: "Facial" })
                .click(),
              // Apply filters
            ];
          case 4:
            _c.sent();
            // Apply filters
            return [
              4 /*yield*/,
              page
                .getByRole("button", { name: "Apply Filters" })
                .click(),
              // Refresh page
            ];
          case 5:
            // Apply filters
            _c.sent();
            // Refresh page
            return [
              4 /*yield*/,
              page.reload(),
              // Verify filters are maintained
            ];
          case 6:
            // Refresh page
            _c.sent();
            // Verify filters are maintained
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByLabel("Start Date")).toHaveValue("2024-02-01"),
            ];
          case 7:
            // Verify filters are maintained
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByLabel("End Date")).toHaveValue("2024-02-28"),
            ];
          case 8:
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(page.getByText("Facial")).toBeVisible()];
          case 9:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should be accessible", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var focusedElement;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Run accessibility checks
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByTestId("analytics-dashboard")).toBeVisible(),
              // Check for proper heading structure
            ];
          case 1:
            // Run accessibility checks
            _c.sent();
            // Check for proper heading structure
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByRole("heading", { level: 1 })).toBeVisible(),
            ];
          case 2:
            // Check for proper heading structure
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByRole("heading", { level: 2 })).toBeVisible(),
              // Check for proper labels
            ];
          case 3:
            _c.sent();
            // Check for proper labels
            return [4 /*yield*/, (0, test_1.expect)(page.getByLabel("Start Date")).toBeVisible()];
          case 4:
            // Check for proper labels
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(page.getByLabel("End Date")).toBeVisible()];
          case 5:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByLabel("Treatments")).toBeVisible(),
              // Test keyboard navigation
            ];
          case 6:
            _c.sent();
            // Test keyboard navigation
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 7:
            // Test keyboard navigation
            _c.sent();
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 8:
            _c.sent();
            return [
              4 /*yield*/,
              page.keyboard.press("Enter"),
              // Verify focus management
            ];
          case 9:
            _c.sent();
            return [
              4 /*yield*/,
              page.evaluate(() => {
                var _a;
                return (_a = document.activeElement) === null || _a === void 0
                  ? void 0
                  : _a.tagName;
              }),
            ];
          case 10:
            focusedElement = _c.sent();
            (0, test_1.expect)(["BUTTON", "INPUT", "SELECT"]).toContain(focusedElement);
            return [2 /*return*/];
        }
      });
    }),
  );
});
