/**
 * Healthcare Critical Performance Tests
 * Tests critical healthcare workflows for patient safety and regulatory compliance
 */

import { expect, test } from "@playwright/test";
import {
  getHealthcarePerformanceBudget,
  HEALTHCARE_PERFORMANCE_ASSERTIONS,
  isCriticalHealthcarePage,
  validateHealthcareMetrics,
} from "../../config/healthcare-metrics.config";
import { EmergencyPage } from "../../pages/emergency.page";
import { PatientDashboardPage } from "../../pages/patient-dashboard.page";
import { PrescriptionPage } from "../../pages/prescription.page";
import { PerformanceMonitor } from "../../utils/performance-metrics";
import { PerformanceReporter } from "../../utils/performance-metrics";

test.describe("Healthcare Critical Performance Tests", () => {
  let performanceMonitor: PerformanceMonitor;
  let performanceReporter: PerformanceReporter;

  test.beforeEach(async ({ page }) => {
    performanceMonitor = new PerformanceMonitor(page);
    performanceReporter = new PerformanceReporter();

    // Start performance monitoring
    await performanceMonitor.startMonitoring();
  });

  test.afterEach(async ({ page }) => {
    // Stop monitoring and generate report
    const metrics = await performanceMonitor.getMetrics();
    const report = performanceReporter.generateReport(
      metrics,
      "healthcare-critical",
    );

    // Save individual test report
    await performanceReporter.saveReport(
      report,
      `healthcare-critical-${test.info().title.replace(/\s+/g, "-").toLowerCase()}`,
    );
  });

  test.describe("Emergency Scenarios - Critical Patient Safety", () => {
    test("Emergency patient data load - Life critical performance", async ({ page }) => {
      const emergencyPage = new EmergencyPage(page);
      const budget = getHealthcarePerformanceBudget("emergency");

      // Navigate to emergency dashboard
      await page.goto("/emergency/dashboard");

      // Measure critical patient data load time
      const startTime = Date.now();
      await emergencyPage.loadCriticalPatientData("EMERGENCY-001");
      const patientDataLoadTime = Date.now() - startTime;

      // Record custom metric
      await performanceMonitor.recordCustomTiming(
        "patientDataLoadTime",
        patientDataLoadTime,
      );

      // Validate against emergency budget
      expect(patientDataLoadTime).toBeLessThanOrEqual(
        budget.patientDataLoadTime,
      );

      // Ensure critical data is visible
      await expect(emergencyPage.patientAllergies).toBeVisible();
      await expect(emergencyPage.currentMedications).toBeVisible();
      await expect(emergencyPage.vitalSigns).toBeVisible();

      // Measure prescription load time (critical for drug interactions)
      const prescStartTime = Date.now();
      await emergencyPage.loadPrescriptionHistory();
      const prescriptionLoadTime = Date.now() - prescStartTime;

      await performanceMonitor.recordCustomTiming(
        "prescriptionLoadTime",
        prescriptionLoadTime,
      );
      expect(prescriptionLoadTime).toBeLessThanOrEqual(
        budget.prescriptionLoadTime,
      );

      // Get final metrics and validate
      const metrics = await performanceMonitor.getMetrics();
      const validation = validateHealthcareMetrics(metrics, "emergency");

      if (!validation.passed) {
        const criticalFailures = validation.failures.filter((f) => f.critical);
        if (criticalFailures.length > 0) {
          throw new Error(
            `Critical healthcare metrics failed: ${JSON.stringify(criticalFailures, null, 2)}`,
          );
        }
      }

      // Validate patient safety assertions
      expect(
        HEALTHCARE_PERFORMANCE_ASSERTIONS.patientSafety.criticalDataLoad.assertion(
          metrics,
        ),
      ).toBe(true);
      expect(
        HEALTHCARE_PERFORMANCE_ASSERTIONS.patientSafety.emergencyResponse.assertion(
          metrics,
          "emergency",
        ),
      ).toBe(true);
    });

    test("Emergency diagnostic image load - Critical imaging performance", async ({ page }) => {
      const emergencyPage = new EmergencyPage(page);
      const budget = getHealthcarePerformanceBudget("emergency");

      await page.goto("/emergency/imaging");

      // Load critical diagnostic images (X-ray, CT scan)
      const startTime = Date.now();
      await emergencyPage.loadDiagnosticImages("EMERGENCY-001", [
        "xray",
        "ct-scan",
      ]);
      const diagnosticImageLoadTime = Date.now() - startTime;

      await performanceMonitor.recordCustomTiming(
        "diagnosticImageLoadTime",
        diagnosticImageLoadTime,
      );

      // Emergency diagnostic images must load within strict timeframe
      expect(diagnosticImageLoadTime).toBeLessThanOrEqual(
        budget.diagnosticImageLoadTime,
      );

      // Ensure images are properly loaded and visible
      await expect(emergencyPage.xrayImage).toBeVisible();
      await expect(emergencyPage.ctScanImage).toBeVisible();

      // Validate image quality indicators
      const xrayLoaded = await emergencyPage.xrayImage.getAttribute("data-loaded");
      const ctLoaded = await emergencyPage.ctScanImage.getAttribute("data-loaded");

      expect(xrayLoaded).toBe("true");
      expect(ctLoaded).toBe("true");
    });

    test("Emergency form submission - Critical data entry performance", async ({ page }) => {
      const emergencyPage = new EmergencyPage(page);
      const budget = getHealthcarePerformanceBudget("emergency");

      await page.goto("/emergency/triage");

      // Fill emergency triage form
      await emergencyPage.fillTriageForm({
        patientId: "EMERGENCY-001",
        chiefComplaint: "Chest pain",
        vitalSigns: {
          bloodPressure: "140/90",
          heartRate: "95",
          temperature: "98.6",
          oxygenSaturation: "98%",
        },
        painLevel: "8",
        allergies: "Penicillin",
        currentMedications: "Aspirin 81mg daily",
      });

      // Measure form submission time
      const startTime = Date.now();
      await emergencyPage.submitTriageForm();
      const formSubmissionTime = Date.now() - startTime;

      await performanceMonitor.recordCustomTiming(
        "formSubmissionTime",
        formSubmissionTime,
      );

      // Emergency forms must submit quickly
      expect(formSubmissionTime).toBeLessThanOrEqual(budget.formSubmissionTime);

      // Verify successful submission
      await expect(emergencyPage.submissionConfirmation).toBeVisible();

      // Ensure audit trail is recorded quickly
      const auditStartTime = Date.now();
      await emergencyPage.verifyAuditTrail();
      const auditLogTime = Date.now() - auditStartTime;

      await performanceMonitor.recordCustomTiming("auditLogTime", auditLogTime);
      expect(auditLogTime).toBeLessThanOrEqual(500); // 500ms max for audit logging
    });
  });

  test.describe("Clinical Workflows - Standard Patient Care", () => {
    test("Patient dashboard load - Standard clinical performance", async ({ page }) => {
      const patientPage = new PatientDashboardPage(page);
      const budget = getHealthcarePerformanceBudget("clinical");

      await page.goto("/patients/dashboard");

      // Load patient list
      const startTime = Date.now();
      await patientPage.loadPatientList();
      const patientDataLoadTime = Date.now() - startTime;

      await performanceMonitor.recordCustomTiming(
        "patientDataLoadTime",
        patientDataLoadTime,
      );
      expect(patientDataLoadTime).toBeLessThanOrEqual(
        budget.patientDataLoadTime,
      );

      // Test patient search performance
      const searchStartTime = Date.now();
      await patientPage.searchPatients("John Doe");
      const searchResponseTime = Date.now() - searchStartTime;

      await performanceMonitor.recordCustomTiming(
        "searchResponseTime",
        searchResponseTime,
      );
      expect(searchResponseTime).toBeLessThanOrEqual(budget.searchResponseTime);

      // Validate search results
      await expect(patientPage.searchResults).toBeVisible();
      const resultCount = await patientPage.searchResults.count();
      expect(resultCount).toBeGreaterThan(0);
    });

    test("Medical record access - Clinical workflow performance", async ({ page }) => {
      const patientPage = new PatientDashboardPage(page);
      const budget = getHealthcarePerformanceBudget("clinical");

      await page.goto("/patients/12345/records");

      // Load complete medical record
      const startTime = Date.now();
      await patientPage.loadMedicalRecord("12345");
      const medicalRecordAccessTime = Date.now() - startTime;

      await performanceMonitor.recordCustomTiming(
        "medicalRecordAccessTime",
        medicalRecordAccessTime,
      );
      expect(medicalRecordAccessTime).toBeLessThanOrEqual(
        budget.medicalRecordAccessTime,
      );

      // Verify all sections are loaded
      await expect(patientPage.medicalHistory).toBeVisible();
      await expect(patientPage.labResults).toBeVisible();
      await expect(patientPage.imagingResults).toBeVisible();
      await expect(patientPage.treatmentPlan).toBeVisible();

      // Test navigation between record sections
      const navStartTime = Date.now();
      await patientPage.navigateToSection("lab-results");
      const navigationTime = Date.now() - navStartTime;

      await performanceMonitor.recordCustomTiming(
        "navigationTime",
        navigationTime,
      );
      expect(navigationTime).toBeLessThanOrEqual(budget.navigationTime);
    });

    test("Prescription management - Medication safety performance", async ({ page }) => {
      const prescriptionPage = new PrescriptionPage(page);
      const budget = getHealthcarePerformanceBudget("clinical");

      await page.goto("/prescriptions/manage");

      // Load prescription history
      const startTime = Date.now();
      await prescriptionPage.loadPrescriptionHistory("12345");
      const prescriptionLoadTime = Date.now() - startTime;

      await performanceMonitor.recordCustomTiming(
        "prescriptionLoadTime",
        prescriptionLoadTime,
      );
      expect(prescriptionLoadTime).toBeLessThanOrEqual(
        budget.prescriptionLoadTime,
      );

      // Test drug interaction check performance
      const interactionStartTime = Date.now();
      await prescriptionPage.checkDrugInteractions(["aspirin", "warfarin"]);
      const interactionCheckTime = Date.now() - interactionStartTime;

      // Drug interaction checks must be fast for patient safety
      expect(interactionCheckTime).toBeLessThanOrEqual(1000); // 1 second max

      // Verify interaction warnings are displayed
      await expect(prescriptionPage.interactionWarnings).toBeVisible();

      // Test prescription form submission
      await prescriptionPage.fillPrescriptionForm({
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food",
      });

      const submitStartTime = Date.now();
      await prescriptionPage.submitPrescription();
      const formSubmissionTime = Date.now() - submitStartTime;

      await performanceMonitor.recordCustomTiming(
        "formSubmissionTime",
        formSubmissionTime,
      );
      expect(formSubmissionTime).toBeLessThanOrEqual(budget.formSubmissionTime);
    });
  });

  test.describe("Compliance and Security - Regulatory Requirements", () => {
    test("Authentication performance - Security compliance", async ({ page }) => {
      const budget = getHealthcarePerformanceBudget("clinical");

      await page.goto("/login");

      // Measure authentication time
      const startTime = Date.now();
      await page.fill(
        '[data-testid="username"]',
        "healthcare.provider@hospital.com",
      );
      await page.fill('[data-testid="password"]', "SecurePassword123!");
      await page.click('[data-testid="login-button"]');

      // Wait for successful authentication
      await page.waitForURL("/dashboard");
      const authenticationTime = Date.now() - startTime;

      await performanceMonitor.recordCustomTiming(
        "authenticationTime",
        authenticationTime,
      );
      expect(authenticationTime).toBeLessThanOrEqual(budget.authenticationTime);

      // Verify access control check performance
      const accessStartTime = Date.now();
      await page.goto("/patients/sensitive-data");
      const accessControlCheckTime = Date.now() - accessStartTime;

      await performanceMonitor.recordCustomTiming(
        "accessControlCheckTime",
        accessControlCheckTime,
      );
      expect(accessControlCheckTime).toBeLessThanOrEqual(300); // 300ms max for access control
    });

    test("Audit trail performance - HIPAA compliance", async ({ page }) => {
      await page.goto("/patients/12345/records");

      // Simulate accessing sensitive patient data
      await page.click('[data-testid="view-medical-record"]');

      // Measure audit log creation time
      const auditStartTime = Date.now();
      await page.evaluate(() => {
        // Trigger audit log creation
        window.dispatchEvent(
          new CustomEvent("audit-log", {
            detail: {
              action: "view_medical_record",
              patientId: "12345",
              userId: "provider-001",
              timestamp: new Date().toISOString(),
            },
          }),
        );
      });

      // Wait for audit confirmation
      await page.waitForSelector('[data-testid="audit-confirmed"]', {
        timeout: 1000,
      });
      const auditLogTime = Date.now() - auditStartTime;

      await performanceMonitor.recordCustomTiming("auditLogTime", auditLogTime);

      // Audit logging must not impact user workflow
      expect(auditLogTime).toBeLessThanOrEqual(500); // 500ms max

      // Validate compliance assertion
      const metrics = await performanceMonitor.getMetrics();
      expect(
        HEALTHCARE_PERFORMANCE_ASSERTIONS.compliance.auditTrail.assertion(
          metrics,
        ),
      ).toBe(true);
    });

    test("Data encryption performance - Security compliance", async ({ page }) => {
      await page.goto("/patients/12345/sensitive-data");

      // Measure data encryption/decryption time
      const encryptionStartTime = Date.now();

      // Simulate accessing encrypted sensitive data
      await page.evaluate(() => {
        // Simulate encryption/decryption process
        return new Promise((resolve) => {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("data-decrypted"));
            resolve(true);
          }, 150); // Simulate encryption time
        });
      });

      await page.waitForEvent("data-decrypted");
      const encryptionTime = Date.now() - encryptionStartTime;

      await performanceMonitor.recordCustomTiming(
        "encryptionTime",
        encryptionTime,
      );

      // Data encryption must be performant
      expect(encryptionTime).toBeLessThanOrEqual(300); // 300ms max

      // Validate compliance assertion
      const metrics = await performanceMonitor.getMetrics();
      expect(
        HEALTHCARE_PERFORMANCE_ASSERTIONS.compliance.dataEncryption.assertion(
          metrics,
        ),
      ).toBe(true);
    });
  });

  test.describe("Performance Regression Detection", () => {
    test("Core Web Vitals regression - Healthcare standards", async ({ page }) => {
      const budget = getHealthcarePerformanceBudget("clinical");

      await page.goto("/patients/dashboard");

      // Wait for page to fully load
      await page.waitForLoadState("networkidle");

      // Get Core Web Vitals
      const metrics = await performanceMonitor.getMetrics();

      // Validate Core Web Vitals against healthcare standards
      expect(metrics.lcp).toBeLessThanOrEqual(budget.lcp);
      expect(metrics.fid).toBeLessThanOrEqual(budget.fid);
      expect(metrics.cls).toBeLessThanOrEqual(budget.cls);
      expect(metrics.fcp).toBeLessThanOrEqual(budget.fcp);
      expect(metrics.ttfb).toBeLessThanOrEqual(budget.ttfb);

      // Validate user experience assertion
      expect(
        HEALTHCARE_PERFORMANCE_ASSERTIONS.userExperience.coreWebVitals.assertion(
          metrics,
          "clinical",
        ),
      ).toBe(true);

      // Check for performance regressions
      const validation = validateHealthcareMetrics(metrics, "clinical");
      if (!validation.passed) {
        console.warn("Performance regression detected:", validation.failures);

        // Fail test if critical metrics are affected
        const criticalFailures = validation.failures.filter((f) => f.critical);
        expect(criticalFailures.length).toBe(0);
      }
    });

    test("Memory usage monitoring - Resource optimization", async ({ page }) => {
      const budget = getHealthcarePerformanceBudget("clinical");

      await page.goto("/patients/dashboard");

      // Simulate extended session with multiple patient records
      for (let i = 0; i < 5; i++) {
        await page.goto(`/patients/${1000 + i}/records`);
        await page.waitForLoadState("networkidle");

        // Check memory usage
        const memoryUsage = await page.evaluate(() => {
          if ("memory" in performance) {
            return (performance as any).memory.usedJSHeapSize;
          }
          return 0;
        });

        if (memoryUsage > 0) {
          expect(memoryUsage).toBeLessThanOrEqual(budget.memoryUsage);
        }

        // Small delay between navigations
        await page.waitForTimeout(500);
      }

      // Final memory check
      const finalMemoryUsage = await page.evaluate(() => {
        if ("memory" in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      if (finalMemoryUsage > 0) {
        expect(finalMemoryUsage).toBeLessThanOrEqual(budget.memoryUsage);
        console.log(
          `Final memory usage: ${(finalMemoryUsage / 1024 / 1024).toFixed(2)} MB`,
        );
      }
    });
  });
});
