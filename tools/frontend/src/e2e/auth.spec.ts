import { test, expect } from "@playwright/test";

// NOTE: This assumes a dev server is running and renders the landing page.
// For CI, configure webServer in playwright.config.ts

test("auth happy path: shows form and switches modes", async ({ page }) => {
  await page.goto("/");

  // Should see tab buttons
  const entrar = page.getByRole("tab", { name: /Entrar/i });
  const criar = page.getByRole("tab", { name: /Criar conta/i });
  const recuperar = page.getByRole("tab", { name: /Recuperar/i });

  await expect(entrar).toBeVisible();
  await expect(criar).toBeVisible();
  await expect(recuperar).toBeVisible();

  // Switch to forgot
  await recuperar.click();
  await expect(recuperar).toHaveAttribute("aria-selected", "true");

  // Fill email and submit (no real backend; just UI smoke)
  await page.getByLabel("E-mail").fill("dr.teste@clinica.com.br");
  await page.getByRole("button", { name: /Enviar link/i }).click();
});
