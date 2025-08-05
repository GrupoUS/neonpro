"use strict";
/**
 * NeonPro - Accessibility Testing Suite
 * Healthcare WCAG 2.1 AA compliance testing with assistive technology support
 *
 * Tests:
 * - NVDA screen reader compatibility
 * - JAWS screen reader compatibility
 * - VoiceOver accessibility
 * - Keyboard navigation
 * - Focus management
 * - Color contrast validation
 * - Healthcare form accessibility
 * - Brazilian localization testing
 */
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
exports.ScreenReaderSimulator = exports.HealthcareFormTester = exports.healthcareAxeConfig = void 0;
var playwright_1 = require("@axe-core/playwright");
var test_1 = require("@playwright/test");
var axe_playwright_1 = require("axe-playwright");
// Healthcare-specific accessibility configuration
var healthcareAxeConfig = {
  tags: ["wcag2a", "wcag2aa", "wcag21aa", "section508", "best-practice"],
  rules: {
    // Healthcare-specific rules
    "color-contrast-enhanced": { enabled: true },
    "focus-order-semantics": { enabled: true },
    "landmark-complementary-is-top-level": { enabled: true },
    "page-has-heading-one": { enabled: true },
    region: { enabled: true },
    "skip-link": { enabled: true },
    // Form accessibility for healthcare
    label: { enabled: true },
    "form-field-multiple-labels": { enabled: true },
    "required-attr": { enabled: true },
    "aria-required-attr": { enabled: true },
    "aria-valid-attr-value": { enabled: true },
    // Table accessibility for patient data
    "table-headers": { enabled: true },
    "th-has-data-cells": { enabled: true },
    "table-fake-caption": { enabled: true },
  },
};
exports.healthcareAxeConfig = healthcareAxeConfig;
// Screen reader simulation helpers
var ScreenReaderSimulator = /** @class */ (function () {
  function ScreenReaderSimulator(page) {
    this.page = page;
  }
  /**
   * Simulate NVDA screen reader navigation
   * Tests virtual PC cursor and browse mode
   */
  ScreenReaderSimulator.prototype.simulateNVDA = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Test virtual cursor navigation (NVDA browse mode)
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+n")];
          case 1:
            // Test virtual cursor navigation (NVDA browse mode)
            _a.sent(); // Toggle browse mode
            return [4 /*yield*/, this.page.keyboard.press("h")];
          case 2:
            _a.sent(); // Navigate by headings
            return [4 /*yield*/, this.page.keyboard.press("k")];
          case 3:
            _a.sent(); // Navigate by links
            return [4 /*yield*/, this.page.keyboard.press("f")];
          case 4:
            _a.sent(); // Navigate by forms
            return [4 /*yield*/, this.page.keyboard.press("t")];
          case 5:
            _a.sent(); // Navigate by tables
            return [4 /*yield*/, this.page.keyboard.press("l")];
          case 6:
            _a.sent(); // Navigate by lists
            // Test NVDA specific commands
            return [4 /*yield*/, this.page.keyboard.press("Insert+f7")];
          case 7:
            // Test NVDA specific commands
            _a.sent(); // Elements list
            return [4 /*yield*/, this.page.keyboard.press("Insert+b")];
          case 8:
            _a.sent(); // Say all
            return [4 /*yield*/, this.page.keyboard.press("Insert+t")];
          case 9:
            _a.sent(); // Read title
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Simulate JAWS screen reader navigation
   * Tests virtual PC cursor and screen reading functions
   */
  ScreenReaderSimulator.prototype.simulateJAWS = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // JAWS virtual cursor navigation
            return [4 /*yield*/, this.page.keyboard.press("Insert+z")];
          case 1:
            // JAWS virtual cursor navigation
            _a.sent(); // Toggle virtual cursor
            return [4 /*yield*/, this.page.keyboard.press("h")];
          case 2:
            _a.sent(); // Next heading
            return [4 /*yield*/, this.page.keyboard.press("Shift+h")];
          case 3:
            _a.sent(); // Previous heading
            return [4 /*yield*/, this.page.keyboard.press("f")];
          case 4:
            _a.sent(); // Next form field
            return [4 /*yield*/, this.page.keyboard.press("t")];
          case 5:
            _a.sent(); // Next table
            return [4 /*yield*/, this.page.keyboard.press("l")];
          case 6:
            _a.sent(); // Next list
            // JAWS specific commands
            return [4 /*yield*/, this.page.keyboard.press("Insert+f6")];
          case 7:
            // JAWS specific commands
            _a.sent(); // Heading list
            return [4 /*yield*/, this.page.keyboard.press("Insert+f5")];
          case 8:
            _a.sent(); // Form fields list
            return [4 /*yield*/, this.page.keyboard.press("Insert+r")];
          case 9:
            _a.sent(); // Say all
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Simulate VoiceOver navigation (macOS)
   * Tests rotor navigation and VoiceOver gestures
   */
  ScreenReaderSimulator.prototype.simulateVoiceOver = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // VoiceOver navigation commands
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+Right")];
          case 1:
            // VoiceOver navigation commands
            _a.sent(); // Next item
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+Left")];
          case 2:
            _a.sent(); // Previous item
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+Command+h")];
          case 3:
            _a.sent(); // Next heading
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+u")];
          case 4:
            _a.sent(); // Open rotor
            // VoiceOver rotor navigation
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+Command+Right")];
          case 5:
            // VoiceOver rotor navigation
            _a.sent(); // Next rotor item
            return [4 /*yield*/, this.page.keyboard.press("Control+Alt+Command+Left")];
          case 6:
            _a.sent(); // Previous rotor item
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Test healthcare-specific announcements
   */
  ScreenReaderSimulator.prototype.testHealthcareAnnouncements = function () {
    return __awaiter(this, void 0, void 0, function () {
      var patientRows, i, _a, row, cpfCell;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.page.locator('[role="row"]')];
          case 1:
            patientRows = _b.sent();
            i = 0;
            _b.label = 2;
          case 2:
            _a = i;
            return [4 /*yield*/, patientRows.count()];
          case 3:
            if (!(_a < _b.sent())) return [3 /*break*/, 9];
            row = patientRows.nth(i);
            return [4 /*yield*/, row.focus()];
          case 4:
            _b.sent();
            // Verify screen reader announcements for patient data
            return [4 /*yield*/, (0, test_1.expect)(row).toHaveAttribute("aria-label")];
          case 5:
            // Verify screen reader announcements for patient data
            _b.sent();
            cpfCell = row.locator("text=/[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}/");
            return [4 /*yield*/, cpfCell.count()];
          case 6:
            if (!(_b.sent() > 0)) return [3 /*break*/, 8];
            return [4 /*yield*/, (0, test_1.expect)(cpfCell).toBeVisible()];
          case 7:
            _b.sent();
            _b.label = 8;
          case 8:
            i++;
            return [3 /*break*/, 2];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  return ScreenReaderSimulator;
})();
exports.ScreenReaderSimulator = ScreenReaderSimulator;
// Healthcare form testing utilities
var HealthcareFormTester = /** @class */ (function () {
  function HealthcareFormTester(page) {
    this.page = page;
  }
  /**
   * Test Brazilian healthcare form patterns
   */
  HealthcareFormTester.prototype.testBrazilianHealthcareForms = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cpfField,
        errorMessage,
        phoneField,
        healthcareFields,
        _i,
        healthcareFields_1,
        field,
        fieldElement;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cpfField = this.page.locator('input[name="cpf"], input[aria-label*="CPF"]');
            return [4 /*yield*/, cpfField.count()];
          case 1:
            if (!(_a.sent() > 0)) return [3 /*break*/, 9];
            return [4 /*yield*/, cpfField.first().focus()];
          case 2:
            _a.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(cpfField.first()).toHaveAttribute("aria-label"),
            ];
          case 3:
            _a.sent();
            return [4 /*yield*/, (0, test_1.expect)(cpfField.first()).toHaveAttribute("required")];
          case 4:
            _a.sent();
            // Test CPF format validation announcement
            return [4 /*yield*/, cpfField.first().fill("12345678900")];
          case 5:
            // Test CPF format validation announcement
            _a.sent();
            return [4 /*yield*/, this.page.keyboard.press("Tab")];
          case 6:
            _a.sent();
            errorMessage = this.page.locator('[role="alert"], [aria-live="polite"]');
            return [4 /*yield*/, errorMessage.count()];
          case 7:
            if (!(_a.sent() > 0)) return [3 /*break*/, 9];
            return [4 /*yield*/, (0, test_1.expect)(errorMessage.first()).toBeVisible()];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            phoneField = this.page.locator('input[type="tel"], input[aria-label*="telefone"]');
            return [4 /*yield*/, phoneField.count()];
          case 10:
            if (!(_a.sent() > 0)) return [3 /*break*/, 13];
            return [4 /*yield*/, phoneField.first().focus()];
          case 11:
            _a.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(phoneField.first()).toHaveAttribute("aria-label"),
            ];
          case 12:
            _a.sent();
            _a.label = 13;
          case 13:
            healthcareFields = ["nome", "cpf", "telefone", "email"];
            (_i = 0), (healthcareFields_1 = healthcareFields);
            _a.label = 14;
          case 14:
            if (!(_i < healthcareFields_1.length)) return [3 /*break*/, 18];
            field = healthcareFields_1[_i];
            fieldElement = this.page.locator(
              '[name="'.concat(field, '"], [aria-label*="').concat(field, '"]'),
            );
            return [4 /*yield*/, fieldElement.count()];
          case 15:
            if (!(_a.sent() > 0)) return [3 /*break*/, 17];
            return [
              4 /*yield*/,
              (0, test_1.expect)(fieldElement.first()).toHaveAttribute("aria-required", "true"),
            ];
          case 16:
            _a.sent();
            _a.label = 17;
          case 17:
            _i++;
            return [3 /*break*/, 14];
          case 18:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Test healthcare form error handling
   */
  HealthcareFormTester.prototype.testHealthcareFormErrors = function () {
    return __awaiter(this, void 0, void 0, function () {
      var errorSummary, errorFields, i, _a, field, errorId, errorMessage;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            errorSummary = this.page.locator('[role="alert"], .error-summary');
            return [4 /*yield*/, errorSummary.count()];
          case 1:
            if (!(_b.sent() > 0)) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              (0, test_1.expect)(errorSummary.first()).toHaveAttribute("aria-live", "polite"),
            ];
          case 2:
            _b.sent();
            return [4 /*yield*/, (0, test_1.expect)(errorSummary.first()).toBeFocused()];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            errorFields = this.page.locator('[aria-invalid="true"], .field-error');
            i = 0;
            _b.label = 5;
          case 5:
            _a = i;
            return [4 /*yield*/, errorFields.count()];
          case 6:
            if (!(_a < _b.sent())) return [3 /*break*/, 11];
            field = errorFields.nth(i);
            return [4 /*yield*/, (0, test_1.expect)(field).toHaveAttribute("aria-describedby")];
          case 7:
            _b.sent();
            return [4 /*yield*/, field.getAttribute("aria-describedby")];
          case 8:
            errorId = _b.sent();
            if (!errorId) return [3 /*break*/, 10];
            errorMessage = this.page.locator("#".concat(errorId));
            return [4 /*yield*/, (0, test_1.expect)(errorMessage).toBeVisible()];
          case 9:
            _b.sent();
            _b.label = 10;
          case 10:
            i++;
            return [3 /*break*/, 5];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  return HealthcareFormTester;
})();
exports.HealthcareFormTester = HealthcareFormTester;
// Main test suite
test_1.test.describe("Healthcare Accessibility Compliance - WCAG 2.1 AA", function () {
  var screenReader;
  var formTester;
  test_1.test.beforeEach(function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            screenReader = new ScreenReaderSimulator(page);
            formTester = new HealthcareFormTester(page);
            // Configure accessibility testing
            return [4 /*yield*/, (0, axe_playwright_1.injectAxe)(page)];
          case 1:
            // Configure accessibility testing
            _c.sent();
            return [4 /*yield*/, (0, axe_playwright_1.configureAxe)(page, healthcareAxeConfig)];
          case 2:
            _c.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test_1.test.describe("Patients Portal Accessibility", function () {
    (0, test_1.test)("should pass WCAG 2.1 AA compliance for patients page", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var accessibilityScanResults;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                new playwright_1.AxeBuilder({ page: page })
                  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
                  .analyze(),
              ];
            case 2:
              accessibilityScanResults = _c.sent();
              (0, test_1.expect)(accessibilityScanResults.violations).toEqual([]);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should support keyboard navigation in patients table", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var skipLink, searchField, patientsTable;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _c.sent();
              // Test skip links
              return [4 /*yield*/, page.keyboard.press("Tab")];
            case 2:
              // Test skip links
              _c.sent();
              skipLink = page.locator('text="Pular para pesquisa"');
              return [4 /*yield*/, skipLink.count()];
            case 3:
              if (!(_c.sent() > 0)) return [3 /*break*/, 7];
              return [4 /*yield*/, (0, test_1.expect)(skipLink).toBeFocused()];
            case 4:
              _c.sent();
              return [4 /*yield*/, page.keyboard.press("Enter")];
            case 5:
              _c.sent();
              searchField = page.locator("#patients-search input");
              return [4 /*yield*/, (0, test_1.expect)(searchField).toBeFocused()];
            case 6:
              _c.sent();
              _c.label = 7;
            case 7:
              patientsTable = page.locator("#patients-table");
              return [4 /*yield*/, patientsTable.focus()];
            case 8:
              _c.sent();
              // Navigate through table rows
              return [4 /*yield*/, page.keyboard.press("ArrowDown")];
            case 9:
              // Navigate through table rows
              _c.sent();
              return [4 /*yield*/, page.keyboard.press("ArrowUp")];
            case 10:
              _c.sent();
              return [4 /*yield*/, page.keyboard.press("Enter")];
            case 11:
              _c.sent(); // Should activate row
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should work with NVDA screen reader", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var firstPatientRow;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _c.sent();
              return [4 /*yield*/, screenReader.simulateNVDA()];
            case 2:
              _c.sent();
              return [4 /*yield*/, screenReader.testHealthcareAnnouncements()];
            case 3:
              _c.sent();
              firstPatientRow = page.locator('[role="row"]').first();
              return [4 /*yield*/, firstPatientRow.focus()];
            case 4:
              _c.sent();
              // Verify aria-label for patient information
              return [
                4 /*yield*/,
                (0, test_1.expect)(firstPatientRow.locator("a")).toHaveAttribute(
                  "aria-describedby",
                ),
              ];
            case 5:
              // Verify aria-label for patient information
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should work with JAWS screen reader", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var headings, i, _c, heading;
        var page = _b.page;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _d.sent();
              return [4 /*yield*/, screenReader.simulateJAWS()];
            case 2:
              _d.sent();
              headings = page.locator("h1, h2, h3, h4, h5, h6");
              i = 0;
              _d.label = 3;
            case 3:
              _c = i;
              return [4 /*yield*/, headings.count()];
            case 4:
              if (!(_c < _d.sent())) return [3 /*break*/, 7];
              heading = headings.nth(i);
              return [4 /*yield*/, (0, test_1.expect)(heading).toBeVisible()];
            case 5:
              _d.sent();
              _d.label = 6;
            case 6:
              i++;
              return [3 /*break*/, 3];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should work with VoiceOver", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var landmarks, _c;
        var page = _b.page;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _d.sent();
              return [4 /*yield*/, screenReader.simulateVoiceOver()];
            case 2:
              _d.sent();
              landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"]');
              _c = test_1.expect;
              return [4 /*yield*/, landmarks.count()];
            case 3:
              _c.apply(void 0, [_d.sent()]).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Healthcare Forms Accessibility", function () {
    (0, test_1.test)("should support Brazilian healthcare form patterns", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients/new")];
            case 1:
              _c.sent();
              return [4 /*yield*/, formTester.testBrazilianHealthcareForms()];
            case 2:
              _c.sent();
              // Test form completion with keyboard only
              return [4 /*yield*/, page.keyboard.press("Tab")];
            case 3:
              // Test form completion with keyboard only
              _c.sent(); // Navigate to first field
              return [4 /*yield*/, page.keyboard.type("Maria da Silva Santos")];
            case 4:
              _c.sent();
              return [4 /*yield*/, page.keyboard.press("Tab")];
            case 5:
              _c.sent();
              return [4 /*yield*/, page.keyboard.type("123.456.789-00")];
            case 6:
              _c.sent();
              return [4 /*yield*/, page.keyboard.press("Tab")];
            case 7:
              _c.sent();
              return [4 /*yield*/, page.keyboard.type("(11) 99999-9999")];
            case 8:
              _c.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should handle healthcare form errors accessibly", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var submitButton;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients/new")];
            case 1:
              _c.sent();
              submitButton = page.locator('button[type="submit"], input[type="submit"]');
              return [4 /*yield*/, submitButton.count()];
            case 2:
              if (!(_c.sent() > 0)) return [3 /*break*/, 5];
              return [4 /*yield*/, submitButton.click()];
            case 3:
              _c.sent();
              return [4 /*yield*/, formTester.testHealthcareFormErrors()];
            case 4:
              _c.sent();
              _c.label = 5;
            case 5:
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Color Contrast and Visual Accessibility", function () {
    (0, test_1.test)("should meet WCAG AA color contrast ratios", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var axeResults;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _c.sent();
              return [
                4 /*yield*/,
                new playwright_1.AxeBuilder({ page: page }).withTags(["color-contrast"]).analyze(),
              ];
            case 2:
              axeResults = _c.sent();
              (0, test_1.expect)(axeResults.violations).toEqual([]);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should support high contrast mode", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var buttons, i, _c, _d, _e, _f, button;
        var page = _b.page;
        return __generator(this, function (_g) {
          switch (_g.label) {
            case 0:
              // Test Windows high contrast mode
              return [
                4 /*yield*/,
                page.emulateMedia({ colorScheme: "dark", forcedColors: "active" }),
              ];
            case 1:
              // Test Windows high contrast mode
              _g.sent();
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 2:
              _g.sent();
              buttons = page.locator("button");
              i = 0;
              _g.label = 3;
            case 3:
              _c = i;
              _e = (_d = Math).min;
              _f = [5];
              return [4 /*yield*/, buttons.count()];
            case 4:
              if (!(_c < _e.apply(_d, _f.concat([_g.sent()])))) return [3 /*break*/, 7];
              button = buttons.nth(i);
              return [4 /*yield*/, (0, test_1.expect)(button).toBeVisible()];
            case 5:
              _g.sent();
              _g.label = 6;
            case 6:
              i++;
              return [3 /*break*/, 3];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Portuguese Localization Accessibility", function () {
    (0, test_1.test)("should provide proper Portuguese language declarations", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var html, portugueseTerms, _i, portugueseTerms_1, term, element;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _c.sent();
              html = page.locator("html");
              return [4 /*yield*/, (0, test_1.expect)(html).toHaveAttribute("lang", "pt-BR")];
            case 2:
              _c.sent();
              portugueseTerms = ["Pacientes", "CPF", "Telefone", "E-mail"];
              (_i = 0), (portugueseTerms_1 = portugueseTerms);
              _c.label = 3;
            case 3:
              if (!(_i < portugueseTerms_1.length)) return [3 /*break*/, 7];
              term = portugueseTerms_1[_i];
              element = page.locator('text="'.concat(term, '"'));
              return [4 /*yield*/, element.count()];
            case 4:
              if (!(_c.sent() > 0)) return [3 /*break*/, 6];
              return [4 /*yield*/, (0, test_1.expect)(element.first()).toBeVisible()];
            case 5:
              _c.sent();
              _c.label = 6;
            case 6:
              _i++;
              return [3 /*break*/, 3];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should format Brazilian data correctly for screen readers", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var cpfElements, phoneElements;
        var page = _b.page;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _c.sent();
              cpfElements = page.locator("text=/[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}/");
              return [4 /*yield*/, cpfElements.count()];
            case 2:
              if (!(_c.sent() > 0)) return [3 /*break*/, 4];
              return [4 /*yield*/, (0, test_1.expect)(cpfElements.first()).toBeVisible()];
            case 3:
              _c.sent();
              _c.label = 4;
            case 4:
              phoneElements = page.locator("text=/\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}/");
              return [4 /*yield*/, phoneElements.count()];
            case 5:
              if (!(_c.sent() > 0)) return [3 /*break*/, 7];
              return [4 /*yield*/, (0, test_1.expect)(phoneElements.first()).toBeVisible()];
            case 6:
              _c.sent();
              _c.label = 7;
            case 7:
              return [2 /*return*/];
          }
        });
      });
    });
  });
  test_1.test.describe("Healthcare-Specific Accessibility Patterns", function () {
    (0, test_1.test)("should announce patient status changes appropriately", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var statusBadges, i, _c, badge;
        var page = _b.page;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _d.sent();
              statusBadges = page.locator('[role="status"], .badge');
              i = 0;
              _d.label = 2;
            case 2:
              _c = i;
              return [4 /*yield*/, statusBadges.count()];
            case 3:
              if (!(_c < _d.sent())) return [3 /*break*/, 6];
              badge = statusBadges.nth(i);
              return [4 /*yield*/, (0, test_1.expect)(badge).toHaveAttribute("aria-label")];
            case 4:
              _d.sent();
              _d.label = 5;
            case 5:
              i++;
              return [3 /*break*/, 2];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    });
    (0, test_1.test)("should provide appropriate healthcare data context", function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var tableHeaders, i, _c, header, table;
        var page = _b.page;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, page.goto("/dashboard/patients")];
            case 1:
              _d.sent();
              tableHeaders = page.locator("th");
              i = 0;
              _d.label = 2;
            case 2:
              _c = i;
              return [4 /*yield*/, tableHeaders.count()];
            case 3:
              if (!(_c < _d.sent())) return [3 /*break*/, 6];
              header = tableHeaders.nth(i);
              return [4 /*yield*/, (0, test_1.expect)(header).toBeVisible()];
            case 4:
              _d.sent();
              _d.label = 5;
            case 5:
              i++;
              return [3 /*break*/, 2];
            case 6:
              table = page.locator('[role="table"]');
              return [4 /*yield*/, table.count()];
            case 7:
              if (!(_d.sent() > 0)) return [3 /*break*/, 9];
              return [4 /*yield*/, (0, test_1.expect)(table.first()).toHaveAttribute("aria-label")];
            case 8:
              _d.sent();
              _d.label = 9;
            case 9:
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
