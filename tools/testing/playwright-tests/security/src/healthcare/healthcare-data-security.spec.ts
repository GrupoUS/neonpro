/**
 * Healthcare Data Security Tests
 *
 * Focused security testing for healthcare data handling,
 * encryption, and medical information protection.
 */

import { expect, test } from "@playwright/test";

interface EncryptionTestCase {
  field: string;
  testValue: string;
  shouldBeEncrypted: boolean;
  sensitivity: "low" | "medium" | "high" | "critical";
}

interface AccessTestCase {
  role: string;
  resource: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  shouldAllow: boolean;
  expectedStatus: number;
}

const HEALTHCARE_DATA_TESTS: EncryptionTestCase[] = [
  {
    field: "cpf",
    testValue: "123.456.789-00",
    shouldBeEncrypted: true,
    sensitivity: "critical",
  },
  {
    field: "medicalHistory",
    testValue: "Paciente com histórico de diabetes tipo 2",
    shouldBeEncrypted: true,
    sensitivity: "critical",
  },
  {
    field: "phoneNumber",
    testValue: "(11) 99999-9999",
    shouldBeEncrypted: true,
    sensitivity: "high",
  },
  {
    field: "email",
    testValue: "patient@example.com",
    shouldBeEncrypted: true,
    sensitivity: "medium",
  },
  {
    field: "name",
    testValue: "João Silva Santos",
    shouldBeEncrypted: false,
    sensitivity: "low",
  },
  {
    field: "procedureNotes",
    testValue: "Aplicação de toxina botulínica tipo A",
    shouldBeEncrypted: true,
    sensitivity: "critical",
  },
];

const RBAC_ACCESS_TESTS: AccessTestCase[] = [
  // Doctor access
  {
    role: "doctor",
    resource: "/api/patients/123/medical-history",
    method: "GET",
    shouldAllow: true,
    expectedStatus: 200,
  },
  {
    role: "doctor",
    resource: "/api/procedures",
    method: "POST",
    shouldAllow: true,
    expectedStatus: 201,
  },
  {
    role: "doctor",
    resource: "/api/admin/system-config",
    method: "GET",
    shouldAllow: false,
    expectedStatus: 403,
  },

  // Nurse access
  {
    role: "nurse",
    resource: "/api/patients/123/basic-info",
    method: "GET",
    shouldAllow: true,
    expectedStatus: 200,
  },
  {
    role: "nurse",
    resource: "/api/patients/123/medical-history",
    method: "GET",
    shouldAllow: false,
    expectedStatus: 403,
  },
  {
    role: "nurse",
    resource: "/api/procedures",
    method: "POST",
    shouldAllow: false,
    expectedStatus: 403,
  },

  // Receptionist access
  {
    role: "receptionist",
    resource: "/api/appointments",
    method: "GET",
    shouldAllow: true,
    expectedStatus: 200,
  },
  {
    role: "receptionist",
    resource: "/api/patients/123/medical-history",
    method: "GET",
    shouldAllow: false,
    expectedStatus: 403,
  },
  {
    role: "receptionist",
    resource: "/api/patients",
    method: "POST",
    shouldAllow: true,
    expectedStatus: 201,
  },

  // Admin access
  {
    role: "admin",
    resource: "/api/admin/system-config",
    method: "GET",
    shouldAllow: true,
    expectedStatus: 200,
  },
  {
    role: "admin",
    resource: "/api/admin/user-management",
    method: "PUT",
    shouldAllow: true,
    expectedStatus: 200,
  },
  {
    role: "admin",
    resource: "/api/patients/123/medical-history",
    method: "GET",
    shouldAllow: true,
    expectedStatus: 200,
  },
];

test.describe("Healthcare Data Encryption Tests", () => {
  test("Patient Data Encryption at Rest", async ({ page }) => {
    // Login as doctor to access patient data
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "123456-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "ValidPassword123!",
    );
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="professional-dashboard"]');

    for (const testCase of HEALTHCARE_DATA_TESTS) {
      await test.step(`Testing encryption for ${testCase.field} (${testCase.sensitivity})`, async () => {
        // Navigate to patient creation/edit form
        await page.goto("/patients/create");

        // Fill form with test data
        if (testCase.field === "cpf") {
          await page.fill('[data-testid="patient-cpf"]', testCase.testValue);
        } else if (testCase.field === "medicalHistory") {
          await page.fill(
            '[data-testid="medical-history"]',
            testCase.testValue,
          );
        } else if (testCase.field === "phoneNumber") {
          await page.fill('[data-testid="patient-phone"]', testCase.testValue);
        } else if (testCase.field === "email") {
          await page.fill('[data-testid="patient-email"]', testCase.testValue);
        } else if (testCase.field === "name") {
          await page.fill('[data-testid="patient-name"]', testCase.testValue);
        }

        // Intercept the API call to check if data is encrypted
        let apiRequestData: unknown;
        page.on("request", (request) => {
          if (
            request.url().includes("/api/patients")
            && request.method() === "POST"
          ) {
            apiRequestData = request.postDataJSON();
          }
        });

        // Submit form
        await page.click('[data-testid="save-patient"]');

        // Wait for request to complete
        await page.waitForTimeout(2000);

        if (apiRequestData && testCase.shouldBeEncrypted) {
          const fieldValue = apiRequestData[testCase.field];

          if (fieldValue) {
            // Encrypted data should not contain the original value
            expect(fieldValue).not.toBe(testCase.testValue);

            // Should be base64 encoded or have encryption markers
            const isEncrypted = fieldValue.startsWith("[ENCRYPTED]")
              || /^[A-Za-z0-9+/=]+$/.test(fieldValue) // Base64 pattern
              || fieldValue.length > testCase.testValue.length * 1.5; // Encrypted is typically longer

            expect(isEncrypted).toBe(true);
          }
        }

        // Clear form for next test
        await page.goto("/patients/create");
      });
    }
  });

  test("Medical Data Encryption in Transit", async ({ page }) => {
    // Monitor all network requests for encryption
    const requests: unknown[] = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/")) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          secure: request.url().startsWith("https://"),
        });
      }
    });

    // Login and navigate through healthcare workflows
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "123456-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "ValidPassword123!",
    );
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="professional-dashboard"]');

    // Access patient data
    await page.goto("/patients/123");
    await page.waitForLoadState("networkidle");

    // Create new procedure
    await page.goto("/procedures/create");
    await page.fill(
      '[data-testid="procedure-notes"]',
      "Sensitive medical procedure notes",
    );
    await page.click('[data-testid="save-procedure"]');

    // Validate all healthcare API requests use HTTPS
    const healthcareRequests = requests.filter(
      (req) =>
        req.url.includes("/api/patients")
        || req.url.includes("/api/procedures")
        || req.url.includes("/api/medical"),
    );

    for (const request of healthcareRequests) {
      expect(request.secure).toBe(true);

      // Should have proper content-type for JSON data
      if (request.method === "POST" || request.method === "PUT") {
        expect(request.headers["content-type"]).toContain("application/json");
      }
    }
  });

  test("Healthcare File Encryption", async ({ page }) => {
    await page.goto("/patients/123/documents/upload");

    // Upload a medical document
    const testFile = Buffer.from("Confidential medical report content");

    await page.setInputFiles('[data-testid="medical-file-upload"]', {
      name: "medical-report.pdf",
      mimeType: "application/pdf",
      buffer: testFile,
    });

    // Intercept upload request
    let uploadData: unknown;
    page.on("request", (request) => {
      if (
        request.url().includes("/api/upload")
        && request.method() === "POST"
      ) {
        uploadData = request.postData();
      }
    });

    await page.click('[data-testid="upload-submit"]');
    await page.waitForTimeout(3000);

    // File content should be encrypted before upload
    if (uploadData) {
      // Should not contain original file content in plain text
      expect(uploadData).not.toContain("Confidential medical report content");
    }

    // Verify file is stored encrypted
    const response = await page.goto("/api/files/medical-report.pdf");
    if (response) {
      const content = await response.text();

      // Should not be able to read original content directly
      expect(content).not.toContain("Confidential medical report content");
    }
  });
});

test.describe("Role-Based Access Control Tests", () => {
  test("RBAC Permission Enforcement", async ({ page }) => {
    for (const testCase of RBAC_ACCESS_TESTS) {
      await test.step(`Testing ${testCase.role} access to ${testCase.resource}`, async () => {
        // Logout and login with specific role
        await page.goto("/auth/logout");
        await page.goto("/auth/professional-login");

        // Use different credentials for different roles
        const credentials = {
          doctor: { reg: "123456-SP", pass: "DoctorPassword123!" },
          nurse: { reg: "789012-SP", pass: "NursePassword123!" },
          receptionist: { reg: "345678-SP", pass: "ReceptionistPassword123!" },
          admin: { reg: "000000-SP", pass: "AdminPassword123!" },
        };

        const cred = credentials[testCase.role as keyof typeof credentials];

        await page.fill('[data-testid="professional-registration"]', cred.reg);
        await page.fill('[data-testid="professional-password"]', cred.pass);
        await page.click('[data-testid="login-button"]');

        // Wait for login to complete
        await page.waitForTimeout(2000);

        // Make API request to test resource
        const response = await page.evaluate(async (testCase) => {
          try {
            const res = await fetch(testCase.resource, {
              method: testCase.method,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
              body: testCase.method !== "GET"
                ? JSON.stringify({
                  testData: "security test",
                })
                : undefined,
            });

            return {
              status: res.status,
              ok: res.ok,
              text: await res.text(),
            };
          } catch (error) {
            return {
              error: error.message,
              status: 0,
            };
          }
        }, testCase);

        if (testCase.shouldAllow) {
          expect(response.status).toBe(testCase.expectedStatus);
        } else {
          expect(response.status).toBe(testCase.expectedStatus);
          expect(response.ok).toBe(false);
        }
      });
    }
  });

  test("Healthcare Data Compartmentalization", async ({ page }) => {
    // Login as nurse (limited access)
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "789012-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "NursePassword123!",
    );
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="professional-dashboard"]');

    // Try to access patient medical history directly
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/patients/123/medical-history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return {
          status: res.status,
          data: res.ok ? await res.json() : undefined,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should be denied access to sensitive medical data
    expect(response.status).toBe(403);

    // Try to access basic patient info (should be allowed)
    const basicInfoResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/patients/123/basic-info", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return {
          status: res.status,
          data: res.ok ? await res.json() : undefined,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should have access to basic patient info
    expect(basicInfoResponse.status).toBe(200);

    // Medical history should not be included in basic info
    if (basicInfoResponse.data) {
      expect(basicInfoResponse.data.medicalHistory).toBeUndefined();
      expect(basicInfoResponse.data.procedureHistory).toBeUndefined();
    }
  });

  test("Cross-Patient Data Isolation", async ({ page }) => {
    // Login as doctor assigned to specific patients
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "123456-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "DoctorPassword123!",
    );
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="professional-dashboard"]');

    // Try to access patient assigned to this doctor (should work)
    const assignedPatientResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/patients/123", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(assignedPatientResponse.status).toBe(200);

    // Try to access patient NOT assigned to this doctor (should fail)
    const unassignedPatientResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/patients/999", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(unassignedPatientResponse.status).toBe(403);
  });
});

test.describe("Healthcare Compliance Security Tests", () => {
  test("ANVISA Compliance Data Protection", async ({ page }) => {
    await page.goto("/compliance/anvisa");

    // Test that ANVISA-regulated procedure data is properly protected
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/procedures/anvisa-regulated", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return {
          status: res.status,
          data: res.ok ? await res.json() : undefined,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should require specific ANVISA permissions
    if (response.status === 200 && response.data) {
      // Data should include ANVISA compliance metadata
      expect(response.data.anvisaCompliance).toBeDefined();
      expect(response.data.regulatoryTracking).toBeDefined();
    }
  });

  test("CFM Professional Validation Security", async ({ page }) => {
    // Test that CFM professional data is properly validated and protected
    await page.goto("/auth/professional-login");

    // Try to login with invalid CFM registration
    await page.fill('[data-testid="professional-registration"]', "INVALID-CFM");
    await page.fill('[data-testid="professional-password"]', "Password123!");

    const response = page.waitForResponse((res) => res.url().includes("/api/auth/cfm-validate"));
    await page.click('[data-testid="login-button"]');
    const cfmResponse = await response;

    // Should validate CFM registration
    expect(cfmResponse.status()).not.toBe(200);

    // Should show CFM validation error
    const cfmError = await page
      .locator('[data-testid="cfm-validation-error"]')
      .count();
    expect(cfmError).toBeGreaterThan(0);
  });

  test("Medical Device Data Security", async ({ page }) => {
    // Test security for medical device integration data
    await page.goto("/devices/laser-equipment/data");

    const deviceDataResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/devices/laser-001/calibration-data", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return {
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
          data: res.ok ? await res.json() : undefined,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Device data should require special authorization
    if (deviceDataResponse.status === 200) {
      // Should include device security metadata
      expect(deviceDataResponse.data?.deviceSecurity).toBeDefined();
      expect(deviceDataResponse.data?.calibrationCertificate).toBeDefined();
    }

    // Should have medical device specific security headers
    expect(
      deviceDataResponse.headers["x-medical-device-security"],
    ).toBeDefined();
  });

  test("Audit Trail Integrity", async ({ page }) => {
    // Login and perform actions that should be audited
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "123456-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "ValidPassword123!",
    );
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="professional-dashboard"]');

    // Access sensitive patient data
    await page.goto("/patients/123/medical-history");

    // Modify patient data
    await page.goto("/patients/123/edit");
    await page.fill('[data-testid="patient-name"]', "Updated Name");
    await page.click('[data-testid="save-patient"]');

    // Check that audit trail was created
    const auditResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/audit-logs?patient=123&limit=5", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        return {
          status: res.status,
          data: res.ok ? await res.json() : undefined,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    if (auditResponse.status === 200 && auditResponse.data) {
      const logs = auditResponse.data.logs || auditResponse.data;

      // Should have audit entries for our actions
      const accessLog = logs.find(
        (log: unknown) => log.action === "PATIENT_DATA_ACCESS",
      );
      const modifyLog = logs.find(
        (log: unknown) => log.action === "PATIENT_DATA_MODIFY",
      );

      expect(accessLog).toBeDefined();
      expect(modifyLog).toBeDefined();

      // Audit logs should be immutable (read-only)
      if (accessLog) {
        expect(accessLog.timestamp).toBeDefined();
        expect(accessLog.userId).toBeDefined();
        expect(accessLog.patientId).toBe("123");
      }
    }
  });
});
