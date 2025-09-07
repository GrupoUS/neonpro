# Playwright E2E Testing Guide (NeonPro Healthcare)

> Purpose: End-to-end (E2E) testing patterns for the NeonPro platform using Playwright. Healthcare-first: reliability, accessibility, privacy (LGPD), and safety.

## Principles

- Test critical patient and clinic workflows from the user’s perspective
- Prefer stable selectors (roles, labels, test ids) over CSS/xpaths
- Keep tests deterministic; stub flaky externals (AI, payments, email)
- Enforce accessibility and mobile responsiveness on critical flows
- Isolate data: use per-test users/fixtures; clean up consistently

## Project Setup (reference)

```ts
// tests/e2e/playwright.config.ts (example)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
});
```

## Test Data & Authentication

- Use seeded accounts with the minimum permissions for each flow
- Prefer test-only endpoints or helpers to create domain objects
- For Supabase Auth, create a helper to programmatically sign in via API

```ts
// tests/e2e/utils/auth.ts
import { APIRequestContext, request } from "@playwright/test";

export async function loginViaApi(baseURL: string, email: string, password: string) {
  const context: APIRequestContext = await request.newContext();
  const res = await context.post(`${baseURL}/api/auth/login`, { data: { email, password } });
  if (!res.ok()) {
    await context.dispose();
    throw new Error("Login failed");
  }
  const { accessToken } = await res.json();
  await context.dispose(); // ensure API context is released
  return accessToken;
}

// Inject token before any page scripts run. Adjust storage key to your app.
export async function applyAuthTokenToPage(page: import("@playwright/test").Page, token: string) {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("accessToken", t as string);
    } catch {}
  }, token);
}

// Alternative: use cookies if your app reads auth from cookies
export async function applyAuthCookie(
  context: import("@playwright/test").BrowserContext,
  token: string,
  baseURL: string,
) {
  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: "accessToken",
      value: token,
      domain: url.hostname,
      path: "/",
      httpOnly: false,
      secure: false,
    },
  ]);
}
```

## Patient Management Workflow (E2E)

```ts
// tests/e2e/patient.spec.ts
import { expect, test } from "@playwright/test";

const PATIENT = { name: "Maria Souza", cpf: "123.456.789-00", birth: "1990-01-10" };

test("create, view and update a patient profile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Pacientes" }).click();
  await page.getByRole("button", { name: "Novo Paciente" }).click();

  await page.getByLabel("Nome completo").fill(PATIENT.name);
  await page.getByLabel("CPF").fill(PATIENT.cpf);
  await page.getByLabel("Data de nascimento").fill(PATIENT.birth);
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Paciente criado com sucesso")).toBeVisible();
  await page.getByRole("link", { name: PATIENT.name }).click();

  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nome completo").fill(PATIENT.name + " Atualizado");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Atualizado")).toBeVisible();
});
```

## Appointment Scheduling Flow (E2E)

```ts
// tests/e2e/appointment.spec.ts
import { expect, test } from "@playwright/test";

test("schedule and cancel an appointment", async ({ page }) => {
  await page.goto("/agenda");
  await page.getByRole("button", { name: "Novo agendamento" }).click();

  await page.getByLabel("Paciente").click();
  await page.getByRole("option", { name: "Maria Souza" }).click();
  await page.getByLabel("Data").fill("2025-10-02");
  await page.getByLabel("Hora").fill("14:00");
  await page.getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Agendamento confirmado")).toBeVisible();

  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await expect(page.getByText("Agendamento cancelado")).toBeVisible();
});
```

## AI Chat Testing (Deterministic)

- Stub AI responses to avoid network/cost and ensure determinism
- Validate: prompt assembly, tool-calls, UI streaming, and safety filters

```ts
// tests/e2e/ai-chat.spec.ts
import { expect, test } from "@playwright/test";

test("AI chat suggests pre/pos-procedure instructions", async ({ page }) => {
  await page.route("/api/ai/chat", async route => {
    const body = { messages: [{ role: "assistant", content: "Hidrate-se e evite sol por 48h." }] };
    await route.fulfill({
      status: 200,
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    });
  });

  await page.goto("/chat");
  await page.getByRole("textbox", { name: "Mensagem" }).fill("Cuidados pós-peeling?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Hidrate-se e evite sol por 48h.")).toBeVisible();
});
```

## Accessibility Testing (Playwright + Axe)

- Check WCAG 2.1 AA on critical screens
- Focus management, labels, roles, contrast, keyboard nav

```ts
// tests/e2e/a11y.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("patients page has no critical a11y violations", async ({ page }) => {
  await page.goto("/pacientes");
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"]) // example: if handled via dedicated tests
    .analyze();

  const critical = a11y.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
});
```

## Mobile Responsiveness

```ts
// Use projects in config (Pixel 7, iPhone 14) or set viewport per test
import { devices, test } from "@playwright/test";

test.use({ ...devices["iPhone 14"] });

test("patient form works on iPhone viewport", async ({ page }) => {
  await page.goto("/pacientes/novo");
  await page.getByLabel("Nome completo").fill("Paciente Mobile");
  await page.getByRole("button", { name: "Salvar" }).click();
});
```

## Data Privacy (LGPD) Checks

- Never display sensitive data without consent
- Ensure PII masking in notifications/logs/screenshots
- Sanitize traces; avoid storing secrets in artifacts

## Tips

- Use `test.step()` to improve trace readability
- Group tests by domain; keep files short and specific
- Prefer `getByRole/getByLabel` and `data-testid` for stability
- Record traces only on failure to keep CI fast
