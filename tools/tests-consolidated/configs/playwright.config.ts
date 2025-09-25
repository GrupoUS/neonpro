import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração consolidada do Playwright
 * Seguindo princípios KISS - configuração simples e eficiente
 */
export default defineConfig({
  // Diretório de testes E2E
  testDir: '../e2e',

  // Configuração de execução
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Relatórios simples
  reporter: [
    ['html', { outputFolder: '../../reports/playwright' }],
    ['json', { outputFile: '../../reports/playwright/results.json' }],
  ],

  // Configuração global
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Projetos de teste (browsers essenciais)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile essencial para healthcare
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Web server local para testes
  webServer: {
    command: 'bun run --filter @neonpro/web dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
