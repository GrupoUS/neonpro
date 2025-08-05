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
test_1.test.describe("Accessibility Demo", () => {
  test_1.test.beforeEach((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, page.goto("/dashboard/accessibility-demo")];
          case 1:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should have accessible form elements", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var mainHeading, form, nameInput, emailInput, phoneInput, genderSelect;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            mainHeading = page.getByRole("heading", { level: 1, name: "Cadastro de Paciente" });
            return [
              4 /*yield*/,
              (0, test_1.expect)(mainHeading).toBeVisible(),
              // Check for form landmarks
            ];
          case 1:
            _c.sent();
            form = page.getByRole("form");
            return [
              4 /*yield*/,
              (0, test_1.expect)(form).toBeVisible(),
              // Check required fields have proper labels and descriptions
            ];
          case 2:
            _c.sent();
            nameInput = page.getByRole("textbox", { name: /nome completo/i });
            return [4 /*yield*/, (0, test_1.expect)(nameInput).toHaveAttribute("required")];
          case 3:
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(nameInput).toHaveAttribute("aria-describedby")];
          case 4:
            _c.sent();
            emailInput = page.getByRole("textbox", { name: /e-mail/i });
            return [4 /*yield*/, (0, test_1.expect)(emailInput).toHaveAttribute("required")];
          case 5:
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(emailInput).toHaveAttribute("type", "email")];
          case 6:
            _c.sent();
            phoneInput = page.getByRole("textbox", { name: /telefone/i });
            return [4 /*yield*/, (0, test_1.expect)(phoneInput).toHaveAttribute("required")];
          case 7:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(phoneInput).toHaveAttribute("type", "tel"),
              // Check select has proper options
            ];
          case 8:
            _c.sent();
            genderSelect = page.getByRole("combobox", { name: /gênero/i });
            return [4 /*yield*/, (0, test_1.expect)(genderSelect).toBeVisible()];
          case 9:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should navigate with keyboard", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var skipLink, nameInput, emailInput, phoneInput, genderSelect, submitButton;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Test skip link
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 1:
            // Test skip link
            _c.sent();
            skipLink = page.getByRole("link", { name: /ir para formulário/i });
            return [4 /*yield*/, (0, test_1.expect)(skipLink).toBeFocused()];
          case 2:
            _c.sent();
            return [4 /*yield*/, page.keyboard.press("Enter")];
          case 3:
            _c.sent();
            nameInput = page.getByRole("textbox", { name: /nome completo/i });
            return [
              4 /*yield*/,
              (0, test_1.expect)(nameInput).toBeFocused(),
              // Test tab order through form fields
            ];
          case 4:
            _c.sent();
            // Test tab order through form fields
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 5:
            // Test tab order through form fields
            _c.sent();
            emailInput = page.getByRole("textbox", { name: /e-mail/i });
            return [4 /*yield*/, (0, test_1.expect)(emailInput).toBeFocused()];
          case 6:
            _c.sent();
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 7:
            _c.sent();
            phoneInput = page.getByRole("textbox", { name: /telefone/i });
            return [4 /*yield*/, (0, test_1.expect)(phoneInput).toBeFocused()];
          case 8:
            _c.sent();
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 9:
            _c.sent();
            genderSelect = page.getByRole("combobox", { name: /gênero/i });
            return [4 /*yield*/, (0, test_1.expect)(genderSelect).toBeFocused()];
          case 10:
            _c.sent();
            return [4 /*yield*/, page.keyboard.press("Tab")];
          case 11:
            _c.sent();
            submitButton = page.getByRole("button", { name: /salvar/i });
            return [4 /*yield*/, (0, test_1.expect)(submitButton).toBeFocused()];
          case 12:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should show validation errors accessibly", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var submitButton, nameError, emailError, phoneError, nameInput;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            submitButton = page.getByRole("button", { name: /salvar/i });
            return [
              4 /*yield*/,
              submitButton.click(),
              // Check for error messages
            ];
          case 1:
            _c.sent();
            nameError = page.getByText(/nome.*obrigatório/i);
            return [4 /*yield*/, (0, test_1.expect)(nameError).toBeVisible()];
          case 2:
            _c.sent();
            emailError = page.getByText(/e-mail.*obrigatório/i);
            return [4 /*yield*/, (0, test_1.expect)(emailError).toBeVisible()];
          case 3:
            _c.sent();
            phoneError = page.getByText(/telefone.*obrigatório/i);
            return [
              4 /*yield*/,
              (0, test_1.expect)(phoneError).toBeVisible(),
              // Check that inputs have aria-invalid
            ];
          case 4:
            _c.sent();
            nameInput = page.getByRole("textbox", { name: /nome completo/i });
            return [
              4 /*yield*/,
              (0, test_1.expect)(nameInput).toHaveAttribute("aria-invalid", "true"),
            ];
          case 5:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should handle loading states accessibly", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var submitButton, loadingButton, successMessage;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Fill form
            return [4 /*yield*/, page.fill('input[type="text"]', "João da Silva")];
          case 1:
            // Fill form
            _c.sent();
            return [4 /*yield*/, page.fill('input[type="email"]', "joao@example.com")];
          case 2:
            _c.sent();
            return [
              4 /*yield*/,
              page.fill('input[type="tel"]', "(11) 99999-9999"),
              // Submit form
            ];
          case 3:
            _c.sent();
            submitButton = page.getByRole("button", { name: /salvar/i });
            return [
              4 /*yield*/,
              submitButton.click(),
              // Check loading state
            ];
          case 4:
            _c.sent();
            loadingButton = page.getByRole("button", { name: /salvando/i });
            return [4 /*yield*/, (0, test_1.expect)(loadingButton).toBeVisible()];
          case 5:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(loadingButton).toBeDisabled(),
              // Wait for success message
            ];
          case 6:
            _c.sent();
            successMessage = page.getByText(/sucesso/i);
            return [4 /*yield*/, (0, test_1.expect)(successMessage).toBeVisible()];
          case 7:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should open and close dialog accessibly", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var helpButton, dialog, closeButton;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            helpButton = page.getByRole("button", { name: /ajuda/i });
            return [
              4 /*yield*/,
              helpButton.click(),
              // Check dialog is open and focused
            ];
          case 1:
            _c.sent();
            dialog = page.getByRole("dialog", { name: /ajuda.*cadastro/i });
            return [
              4 /*yield*/,
              (0, test_1.expect)(dialog).toBeVisible(),
              // Check dialog has proper ARIA attributes
            ];
          case 2:
            _c.sent();
            // Check dialog has proper ARIA attributes
            return [
              4 /*yield*/,
              (0, test_1.expect)(dialog).toHaveAttribute("aria-modal", "true"),
              // Close dialog with button
            ];
          case 3:
            // Check dialog has proper ARIA attributes
            _c.sent();
            closeButton = page.getByRole("button", { name: /entendi/i });
            return [4 /*yield*/, closeButton.click()];
          case 4:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(dialog).not.toBeVisible(),
              // Check focus returns to trigger button
            ];
          case 5:
            _c.sent();
            // Check focus returns to trigger button
            return [4 /*yield*/, (0, test_1.expect)(helpButton).toBeFocused()];
          case 6:
            // Check focus returns to trigger button
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should work with screen reader announcements", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var submitButton, announcements;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Enable announcements tracking
            return [
              4 /*yield*/,
              page.addInitScript(() => {
                window.ariaAnnouncements = [];
                var originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function (name, value) {
                  if (name === "aria-live" && this.textContent) {
                    window.ariaAnnouncements.push(this.textContent);
                  }
                  return originalSetAttribute.call(this, name, value);
                };
              }),
              // Fill and submit form
            ];
          case 1:
            // Enable announcements tracking
            _c.sent();
            // Fill and submit form
            return [4 /*yield*/, page.fill('input[type="text"]', "Maria Silva")];
          case 2:
            // Fill and submit form
            _c.sent();
            return [4 /*yield*/, page.fill('input[type="email"]', "maria@example.com")];
          case 3:
            _c.sent();
            return [4 /*yield*/, page.fill('input[type="tel"]', "(11) 88888-8888")];
          case 4:
            _c.sent();
            submitButton = page.getByRole("button", { name: /salvar/i });
            return [
              4 /*yield*/,
              submitButton.click(),
              // Wait for success message and check announcements
            ];
          case 5:
            _c.sent();
            // Wait for success message and check announcements
            return [4 /*yield*/, page.waitForTimeout(3000)];
          case 6:
            // Wait for success message and check announcements
            _c.sent();
            return [4 /*yield*/, page.evaluate(() => window.ariaAnnouncements)];
          case 7:
            announcements = _c.sent();
            (0, test_1.expect)(announcements.some((text) => text.includes("sucesso"))).toBeTruthy();
            return [2 /*return*/];
        }
      });
    }),
  );
});
test_1.test.describe("Accessibility Audit", () => {
  (0, test_1.test)("should pass automated accessibility checks", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var results;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              page.goto("/dashboard/accessibility-demo"),
              // Inject axe-core for accessibility testing
            ];
          case 1:
            _c.sent();
            // Inject axe-core for accessibility testing
            return [
              4 /*yield*/,
              page.addScriptTag({
                url: "https://unpkg.com/axe-core@4.7.0/axe.min.js",
              }),
              // Run axe accessibility audit
            ];
          case 2:
            // Inject axe-core for accessibility testing
            _c.sent();
            return [
              4 /*yield*/,
              page.evaluate(() =>
                __awaiter(void 0, void 0, void 0, function () {
                  var axe;
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        axe = window.axe;
                        return [4 /*yield*/, axe.run()];
                      case 1:
                        return [2 /*return*/, _a.sent()];
                    }
                  });
                }),
              ),
              // Check for violations
            ];
          case 3:
            results = _c.sent();
            // Check for violations
            (0, test_1.expect)(results.violations).toEqual([]);
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should meet WCAG contrast requirements", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var textElements, _i, textElements_1, element, styles;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              page.goto("/dashboard/accessibility-demo"),
              // Check color contrast for text elements
            ];
          case 1:
            _c.sent();
            return [4 /*yield*/, page.locator("label, p, h1, h2, h3, button").all()];
          case 2:
            textElements = _c.sent();
            (_i = 0), (textElements_1 = textElements);
            _c.label = 3;
          case 3:
            if (!(_i < textElements_1.length)) return [3 /*break*/, 6];
            element = textElements_1[_i];
            return [
              4 /*yield*/,
              element.evaluate((el) => {
                var computed = window.getComputedStyle(el);
                return {
                  color: computed.color,
                  backgroundColor: computed.backgroundColor,
                  fontSize: computed.fontSize,
                };
              }),
              // Basic contrast check (this would need a proper contrast calculation)
            ];
          case 4:
            styles = _c.sent();
            // Basic contrast check (this would need a proper contrast calculation)
            (0, test_1.expect)(styles.color).not.toBe(styles.backgroundColor);
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("should support reduced motion preferences", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var animatedElements, _i, animatedElements_1, element, duration;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Set reduced motion preference
            return [4 /*yield*/, page.emulateMedia({ reducedMotion: "reduce" })];
          case 1:
            // Set reduced motion preference
            _c.sent();
            return [
              4 /*yield*/,
              page.goto("/dashboard/accessibility-demo"),
              // Check that animations are disabled
            ];
          case 2:
            _c.sent();
            return [4 /*yield*/, page.locator('[class*="animate"]').all()];
          case 3:
            animatedElements = _c.sent();
            (_i = 0), (animatedElements_1 = animatedElements);
            _c.label = 4;
          case 4:
            if (!(_i < animatedElements_1.length)) return [3 /*break*/, 7];
            element = animatedElements_1[_i];
            return [
              4 /*yield*/,
              element.evaluate((el) => window.getComputedStyle(el).animationDuration),
              // Should be 0s or very short for reduced motion
            ];
          case 5:
            duration = _c.sent();
            // Should be 0s or very short for reduced motion
            (0, test_1.expect)(duration).toMatch(/^(0s|0\.01s)$/);
            _c.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            return [2 /*return*/];
        }
      });
    }),
  );
});
