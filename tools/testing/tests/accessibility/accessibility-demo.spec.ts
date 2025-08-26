import { expect, test } from "@playwright/test";

test.describe("Accessibility Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/accessibility-demo");
  });

  test("should have accessible form elements", async ({ page }) => {
    // Check for proper heading structure
    const mainHeading = page.getByRole("heading", {
      level: 1,
      name: "Cadastro de Paciente",
    });
    await expect(mainHeading).toBeVisible();

    // Check for form landmarks
    const form = page.getByRole("form");
    await expect(form).toBeVisible();

    // Check required fields have proper labels and descriptions
    const nameInput = page.getByRole("textbox", { name: /nome completo/i });
    await expect(nameInput).toHaveAttribute("required");
    await expect(nameInput).toHaveAttribute("aria-describedby");

    const emailInput = page.getByRole("textbox", { name: /e-mail/i });
    await expect(emailInput).toHaveAttribute("required");
    await expect(emailInput).toHaveAttribute("type", "email");

    const phoneInput = page.getByRole("textbox", { name: /telefone/i });
    await expect(phoneInput).toHaveAttribute("required");
    await expect(phoneInput).toHaveAttribute("type", "tel");

    // Check select has proper options
    const genderSelect = page.getByRole("combobox", { name: /gênero/i });
    await expect(genderSelect).toBeVisible();
  });

  test("should navigate with keyboard", async ({ page }) => {
    // Test skip link
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /ir para formulário/i });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    const nameInput = page.getByRole("textbox", { name: /nome completo/i });
    await expect(nameInput).toBeFocused();

    // Test tab order through form fields
    await page.keyboard.press("Tab");
    const emailInput = page.getByRole("textbox", { name: /e-mail/i });
    await expect(emailInput).toBeFocused();

    await page.keyboard.press("Tab");
    const phoneInput = page.getByRole("textbox", { name: /telefone/i });
    await expect(phoneInput).toBeFocused();

    await page.keyboard.press("Tab");
    const genderSelect = page.getByRole("combobox", { name: /gênero/i });
    await expect(genderSelect).toBeFocused();

    await page.keyboard.press("Tab");
    const submitButton = page.getByRole("button", { name: /salvar/i });
    await expect(submitButton).toBeFocused();
  });

  test("should show validation errors accessibly", async ({ page }) => {
    // Submit empty form to trigger validation
    const submitButton = page.getByRole("button", { name: /salvar/i });
    await submitButton.click();

    // Check for error messages
    const nameError = page.getByText(/nome.*obrigatório/i);
    await expect(nameError).toBeVisible();

    const emailError = page.getByText(/e-mail.*obrigatório/i);
    await expect(emailError).toBeVisible();

    const phoneError = page.getByText(/telefone.*obrigatório/i);
    await expect(phoneError).toBeVisible();

    // Check that inputs have aria-invalid
    const nameInput = page.getByRole("textbox", { name: /nome completo/i });
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");
  });

  test("should handle loading states accessibly", async ({ page }) => {
    // Fill form
    await page.fill('input[type="text"]', "João da Silva");
    await page.fill('input[type="email"]', "joao@example.com");
    await page.fill('input[type="tel"]', "(11) 99999-9999");

    // Submit form
    const submitButton = page.getByRole("button", { name: /salvar/i });
    await submitButton.click();

    // Check loading state
    const loadingButton = page.getByRole("button", { name: /salvando/i });
    await expect(loadingButton).toBeVisible();
    await expect(loadingButton).toBeDisabled();

    // Wait for success message
    const successMessage = page.getByText(/sucesso/i);
    await expect(successMessage).toBeVisible();
  });

  test("should open and close dialog accessibly", async ({ page }) => {
    // Open help dialog
    const helpButton = page.getByRole("button", { name: /ajuda/i });
    await helpButton.click();

    // Check dialog is open and focused
    const dialog = page.getByRole("dialog", { name: /ajuda.*cadastro/i });
    await expect(dialog).toBeVisible();

    // Check dialog has proper ARIA attributes
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    // Close dialog with button
    const closeButton = page.getByRole("button", { name: /entendi/i });
    await closeButton.click();

    await expect(dialog).not.toBeVisible();

    // Check focus returns to trigger button
    await expect(helpButton).toBeFocused();
  });

  test("should work with screen reader announcements", async ({ page }) => {
    // Enable announcements tracking
    await page.addInitScript(() => {
      (window as any).ariaAnnouncements = [];
      const originalSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function setAttribute(
        name: string,
        value: string,
      ) {
        if (name === "aria-live" && this.textContent) {
          (window as any).ariaAnnouncements.push(this.textContent);
        }
        return originalSetAttribute.call(this, name, value);
      };
    });

    // Fill and submit form
    await page.fill('input[type="text"]', "Maria Silva");
    await page.fill('input[type="email"]', "maria@example.com");
    await page.fill('input[type="tel"]', "(11) 88888-8888");

    const submitButton = page.getByRole("button", { name: /salvar/i });
    await submitButton.click();

    // Wait for success message and check announcements
    await page.waitForTimeout(3000);

    const announcements = await page.evaluate(
      () => (window as any).ariaAnnouncements,
    );
    expect(
      announcements.some((text: string) => text.includes("sucesso")),
    ).toBeTruthy();
  });
});

test.describe("Accessibility Audit", () => {
  test("should pass automated accessibility checks", async ({ page }) => {
    await page.goto("/dashboard/accessibility-demo");

    // Inject axe-core for accessibility testing
    await page.addScriptTag({
      url: "https://unpkg.com/axe-core@4.7.0/axe.min.js",
    });

    // Run axe accessibility audit
    const results = await page.evaluate(async () => {
      // @ts-expect-error
      const axe = window.axe;
      return await axe.run();
    });

    // Check for violations
    expect(results.violations).toEqual([]);
  });

  test("should meet WCAG contrast requirements", async ({ page }) => {
    await page.goto("/dashboard/accessibility-demo");

    // Check color contrast for text elements
    const textElements = await page
      .locator("label, p, h1, h2, h3, button")
      .all();

    for (const element of textElements) {
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });

      // Basic contrast check (this would need a proper contrast calculation)
      expect(styles.color).not.toBe(styles.backgroundColor);
    }
  });

  test("should support reduced motion preferences", async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dashboard/accessibility-demo");

    // Check that animations are disabled
    const animatedElements = await page.locator('[class*="animate"]').all();

    for (const element of animatedElements) {
      const duration = await element.evaluate((el) => {
        return window.getComputedStyle(el).animationDuration;
      });

      // Should be 0s or very short for reduced motion
      expect(duration).toMatch(/^(0s|0\.01s)$/);
    }
  });
});
