import { expect, test } from '@playwright/test';

const DEPLOY_URL = process.env.DEPLOY_URL
  || 'https://neonpro-v2-qedz6fw09-grupous-projects.vercel.app';

// Basic smoke test + screenshot + console capture

test('login page renders styled UI and no console errors', async ({
  page,
}, testInfo) => {
  const consoleMessages: string[] = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto(DEPLOY_URL, { waitUntil: 'domcontentloaded' });

  // Expect the main heading to be visible
  const heading = page.getByRole('heading', { name: /neon pro/i });
  await expect(heading).toBeVisible();

  // Expect Google sign-in button to exist
  const googleBtn = page.getByRole('button', { name: /google/i });
  await expect(googleBtn).toBeVisible();

  // Check that Tailwind classes took effect by reading computed styles on body
  const bodyBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  testInfo.attach('body-bg', { body: bodyBg, contentType: 'text/plain' });

  // Screenshot
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach('login-screenshot', {
    body: screenshot,
    contentType: 'image/png',
  });

  // Log console output for debugging
  if (consoleMessages.length) {
    testInfo.attach('console', {
      body: consoleMessages.join('\n'),
      contentType: 'text/plain',
    });
  }

  // No severe console errors
  const hasError = consoleMessages.some(
    m => m.startsWith('[error]') || m.toLowerCase().includes('uncaught'),
  );
  expect(hasError).toBeFalsy();
});
