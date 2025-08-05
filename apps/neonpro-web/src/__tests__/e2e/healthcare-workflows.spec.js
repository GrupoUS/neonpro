/**
 * Healthcare E2E Tests - Critical Patient Workflows
 * Tests using synthetic data for LGPD compliance
 */
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
// Synthetic test data (LGPD compliant)
var TEST_PATIENT = {
  name: "João Silva Test",
  email: "joao.test@example.com",
  phone: "11999999999",
  cpf: "12345678901", // Synthetic CPF
  birth_date: "1980-01-01",
};
var TEST_DOCTOR = {
  name: "Dr. Maria Santos Test",
  email: "dra.maria.test@hospital.com",
  crm: "CRM12345",
  specialty: "Cardiologia",
};
test_1.test.describe("Healthcare Critical Workflows", () => {
  test_1.test.beforeEach((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Login with test user
            return [4 /*yield*/, page.goto("/login")];
          case 1:
            // Login with test user
            _c.sent();
            return [4 /*yield*/, page.fill("[data-testid=email]", "admin.test@neonpro.com")];
          case 2:
            _c.sent();
            return [4 /*yield*/, page.fill("[data-testid=password]", "test123456")];
          case 3:
            _c.sent();
            return [4 /*yield*/, page.click("[data-testid=login-button]")];
          case 4:
            _c.sent();
            // Wait for dashboard to load
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=dashboard]")).toBeVisible(),
            ];
          case 5:
            // Wait for dashboard to load
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("Patient Registration and Management", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Navigate to patients
            return [4 /*yield*/, page.click("[data-testid=nav-patients]")];
          case 1:
            // Navigate to patients
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(page.locator("h1")).toContainText("Pacientes")];
          case 2:
            _c.sent();
            // Create new patient
            return [4 /*yield*/, page.click("[data-testid=new-patient-button]")];
          case 3:
            // Create new patient
            _c.sent();
            // Fill patient form
            return [4 /*yield*/, page.fill("[data-testid=patient-name]", TEST_PATIENT.name)];
          case 4:
            // Fill patient form
            _c.sent();
            return [4 /*yield*/, page.fill("[data-testid=patient-email]", TEST_PATIENT.email)];
          case 5:
            _c.sent();
            return [4 /*yield*/, page.fill("[data-testid=patient-phone]", TEST_PATIENT.phone)];
          case 6:
            _c.sent();
            return [4 /*yield*/, page.fill("[data-testid=patient-cpf]", TEST_PATIENT.cpf)];
          case 7:
            _c.sent();
            return [
              4 /*yield*/,
              page.fill("[data-testid=patient-birth-date]", TEST_PATIENT.birth_date),
            ];
          case 8:
            _c.sent();
            // Submit form
            return [4 /*yield*/, page.click("[data-testid=save-patient-button]")];
          case 9:
            // Submit form
            _c.sent();
            // Verify patient was created
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=success-message]")).toBeVisible(),
            ];
          case 10:
            // Verify patient was created
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("text=".concat(TEST_PATIENT.name))).toBeVisible(),
            ];
          case 11:
            _c.sent();
            // Search for patient
            return [4 /*yield*/, page.fill("[data-testid=patient-search]", TEST_PATIENT.name)];
          case 12:
            // Search for patient
            _c.sent();
            return [4 /*yield*/, page.keyboard.press("Enter")];
          case 13:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("text=".concat(TEST_PATIENT.name))).toBeVisible(),
            ];
          case 14:
            _c.sent();
            // View patient details
            return [
              4 /*yield*/,
              page.click(
                "[data-testid=patient-".concat(TEST_PATIENT.name.replace(/\s+/g, "-"), "]"),
              ),
            ];
          case 15:
            // View patient details
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("h1")).toContainText(TEST_PATIENT.name),
            ];
          case 16:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("Appointment Scheduling Workflow", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var tomorrow, dateString;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Navigate to appointments
            return [4 /*yield*/, page.click("[data-testid=nav-appointments]")];
          case 1:
            // Navigate to appointments
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("h1")).toContainText("Agendamentos"),
            ];
          case 2:
            _c.sent();
            // Create new appointment
            return [4 /*yield*/, page.click("[data-testid=new-appointment-button]")];
          case 3:
            // Create new appointment
            _c.sent();
            // Select patient (assuming TEST_PATIENT exists)
            return [4 /*yield*/, page.click("[data-testid=patient-select]")];
          case 4:
            // Select patient (assuming TEST_PATIENT exists)
            _c.sent();
            return [
              4 /*yield*/,
              page.fill("[data-testid=patient-search-input]", TEST_PATIENT.name),
            ];
          case 5:
            _c.sent();
            return [
              4 /*yield*/,
              page.click("[data-testid=patient-option-".concat(TEST_PATIENT.name, "]")),
            ];
          case 6:
            _c.sent();
            // Select doctor
            return [4 /*yield*/, page.click("[data-testid=doctor-select]")];
          case 7:
            // Select doctor
            _c.sent();
            return [
              4 /*yield*/,
              page.click("[data-testid=doctor-option-".concat(TEST_DOCTOR.name, "]")),
            ];
          case 8:
            _c.sent();
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateString = tomorrow.toISOString().split("T")[0];
            return [4 /*yield*/, page.fill("[data-testid=appointment-date]", dateString)];
          case 9:
            _c.sent();
            return [4 /*yield*/, page.selectOption("[data-testid=appointment-time]", "09:00")];
          case 10:
            _c.sent();
            return [
              4 /*yield*/,
              page.selectOption("[data-testid=appointment-type]", "consultation"),
            ];
          case 11:
            _c.sent();
            // Submit appointment
            return [4 /*yield*/, page.click("[data-testid=save-appointment-button]")];
          case 12:
            // Submit appointment
            _c.sent();
            // Verify appointment was created
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=success-message]")).toBeVisible(),
            ];
          case 13:
            // Verify appointment was created
            _c.sent();
            // Check appointment appears in calendar
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("text=".concat(TEST_PATIENT.name))).toBeVisible(),
            ];
          case 14:
            // Check appointment appears in calendar
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("text=".concat(TEST_DOCTOR.name))).toBeVisible(),
            ];
          case 15:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("Dashboard Healthcare Metrics", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var metricsLoadTime, finalLoadTime;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Navigate to dashboard
            return [4 /*yield*/, page.click("[data-testid=nav-dashboard]")];
          case 1:
            // Navigate to dashboard
            _c.sent();
            // Check key healthcare metrics are displayed
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=total-patients]")).toBeVisible(),
            ];
          case 2:
            // Check key healthcare metrics are displayed
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=today-appointments]")).toBeVisible(),
            ];
          case 3:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=pending-results]")).toBeVisible(),
            ];
          case 4:
            _c.sent();
            return [4 /*yield*/, page.evaluate(() => performance.now())];
          case 5:
            metricsLoadTime = _c.sent();
            return [4 /*yield*/, page.waitForSelector("[data-testid=dashboard-metrics]")];
          case 6:
            _c.sent();
            return [4 /*yield*/, page.evaluate(() => performance.now())];
          case 7:
            finalLoadTime = _c.sent();
            // Healthcare systems should load within 2 seconds
            (0, test_1.expect)(finalLoadTime - metricsLoadTime).toBeLessThan(2000);
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("Patient Portal Access", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Test patient portal functionality
            return [4 /*yield*/, page.goto("/patient-portal")];
          case 1:
            // Test patient portal functionality
            _c.sent();
            // Login as patient
            return [4 /*yield*/, page.fill("[data-testid=patient-email]", TEST_PATIENT.email)];
          case 2:
            // Login as patient
            _c.sent();
            return [4 /*yield*/, page.fill("[data-testid=patient-cpf]", TEST_PATIENT.cpf)];
          case 3:
            _c.sent();
            return [4 /*yield*/, page.click("[data-testid=patient-login-button]")];
          case 4:
            _c.sent();
            // Verify patient can see their appointments
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=patient-appointments]")).toBeVisible(),
            ];
          case 5:
            // Verify patient can see their appointments
            _c.sent();
            // Verify patient can see their medical history
            return [4 /*yield*/, page.click("[data-testid=medical-history-tab]")];
          case 6:
            // Verify patient can see their medical history
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=medical-history-list]")).toBeVisible(),
            ];
          case 7:
            _c.sent();
            // Test appointment rescheduling
            return [4 /*yield*/, page.click("[data-testid=reschedule-appointment]")];
          case 8:
            // Test appointment rescheduling
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=reschedule-modal]")).toBeVisible(),
            ];
          case 9:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("Healthcare Compliance Features", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Test LGPD compliance features
            return [4 /*yield*/, page.goto("/privacy")];
          case 1:
            // Test LGPD compliance features
            _c.sent();
            return [4 /*yield*/, (0, test_1.expect)(page.locator("text=LGPD")).toBeVisible()];
          case 2:
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("text=Consentimento")).toBeVisible(),
            ];
          case 3:
            _c.sent();
            // Test audit log access (admin only)
            return [4 /*yield*/, page.goto("/admin/audit-logs")];
          case 4:
            // Test audit log access (admin only)
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=audit-logs-table]")).toBeVisible(),
            ];
          case 5:
            _c.sent();
            // Verify sensitive data is masked
            return [4 /*yield*/, (0, test_1.expect)(page.locator("text=***")).toBeVisible()];
          case 6:
            // Verify sensitive data is masked
            _c.sent(); // CPF should be masked
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("System Performance and Health", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var response, health, apiStart, apiResponse, apiTime;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, page.request.get("/api/health")];
          case 1:
            response = _c.sent();
            (0, test_1.expect)(response.ok()).toBeTruthy();
            return [4 /*yield*/, response.json()];
          case 2:
            health = _c.sent();
            (0, test_1.expect)(health.status).toBe("healthy");
            (0, test_1.expect)(health.services.database.status).toBe("healthy");
            apiStart = Date.now();
            return [4 /*yield*/, page.request.get("/api/trpc/patients.list")];
          case 3:
            apiResponse = _c.sent();
            apiTime = Date.now() - apiStart;
            (0, test_1.expect)(apiResponse.ok()).toBeTruthy();
            (0, test_1.expect)(apiTime).toBeLessThan(1000); // API should respond within 1 second
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, test_1.test)("Mobile Responsiveness - Patient Portal", (_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var appointmentForm;
      var page = _b.page;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            // Set mobile viewport
            return [4 /*yield*/, page.setViewportSize({ width: 375, height: 667 })];
          case 1:
            // Set mobile viewport
            _c.sent();
            // Test mobile patient portal
            return [4 /*yield*/, page.goto("/patient-portal")];
          case 2:
            // Test mobile patient portal
            _c.sent();
            // Verify mobile navigation works
            return [4 /*yield*/, page.click("[data-testid=mobile-menu-button]")];
          case 3:
            // Verify mobile navigation works
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=mobile-menu]")).toBeVisible(),
            ];
          case 4:
            _c.sent();
            // Test appointment booking on mobile
            return [4 /*yield*/, page.click("[data-testid=book-appointment-mobile]")];
          case 5:
            // Test appointment booking on mobile
            _c.sent();
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.locator("[data-testid=appointment-form]")).toBeVisible(),
            ];
          case 6:
            _c.sent();
            appointmentForm = page.locator("[data-testid=appointment-form]");
            return [4 /*yield*/, (0, test_1.expect)(appointmentForm).toBeVisible()];
          case 7:
            _c.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
});
