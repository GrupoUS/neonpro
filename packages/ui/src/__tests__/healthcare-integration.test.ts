/**
 * Healthcare Components Integration Test
 *
 * Simple smoke test to verify healthcare components are properly exported
 * and can be imported without errors.
 */

import { describe, it, expect } from "vitest";

describe("Healthcare Components Integration", () => {
  it("should export healthcare validation utilities", async () => {
    const { healthcareValidationSchemas, DataSensitivity } = await import(
      "../utils/healthcare-validation"
    

    expect(healthcareValidationSchemas).toBeDefined(
    expect(DataSensitivity).toBeDefined(
  }

  it("should export accessibility utilities", async () => {
    const { announceToScreenReader, HealthcarePriority, generateAccessibleId } =
      await import("../utils/accessibility"

    expect(announceToScreenReader).toBeDefined(
    expect(HealthcarePriority).toBeDefined(
    expect(generateAccessibleId).toBeDefined(
  }

  it("should export healthcare theme provider", async () => {
    const { HealthcareThemeProvider, useHealthcareTheme } = await import(
      "../components/healthcare/healthcare-theme-provider"
    

    expect(HealthcareThemeProvider).toBeDefined(
    expect(useHealthcareTheme).toBeDefined(
  }

  it("should export LGPD consent banner", async () => {
    const { LGPDConsentBanner, useLGPDConsent, ConsentType } = await import(
      "../components/healthcare/lgpd-consent-banner"
    

    expect(LGPDConsentBanner).toBeDefined(
    expect(useLGPDConsent).toBeDefined(
    expect(ConsentType).toBeDefined(
  }

  it("should export healthcare form components", async () => {
    const { HealthcareForm } = await import(
      "../components/forms/healthcare-form"
    
    const { HealthcareTextField } = await import(
      "../components/forms/healthcare-text-field"
    
    const { HealthcareSelect } = await import(
      "../components/forms/healthcare-select"
    

    expect(HealthcareForm).toBeDefined(
    expect(HealthcareTextField).toBeDefined(
    expect(HealthcareSelect).toBeDefined(
  }
}
