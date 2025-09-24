/**
 * Exemplo de teste E2E consolidado
 * Testa fluxos completos do usuário
 */

import { expect, test } from '@playwright/test'

test.describe('Healthcare Platform E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup comum para E2E
    await page.goto('/')
  })

  test('Patient Registration Journey', async ({ page }) => {
    // Teste E2E completo de registro de paciente

    // 1. Acessar página de registro
    await page.click('[data-testid="register-button"]')

    // 2. Preencher formulário
    await page.fill('[data-testid="name-input"]', 'João Silva')
    await page.fill('[data-testid="email-input"]', 'joao@example.com')
    await page.fill('[data-testid="cpf-input"]', '123.456.789-09')

    // 3. Aceitar termos LGPD
    await page.check('[data-testid="lgpd-consent"]')

    // 4. Submeter
    await page.click('[data-testid="submit-registration"]')

    // 5. Verificar sucesso
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('Appointment Booking Flow', async ({ page }) => {
    // Simular login primeiro
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'patient@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // Navegar para agendamento
    await page.click('[data-testid="appointments-menu"]')
    await page.click('[data-testid="new-appointment"]')

    // Selecionar profissional
    await page.selectOption('[data-testid="professional-select"]', 'dr-silva')

    // Selecionar data
    await page.click('[data-testid="date-picker"]')
    await page.click('[data-testid="available-slot-10am"]')

    // Confirmar agendamento
    await page.click('[data-testid="confirm-appointment"]')

    // Verificar confirmação
    await expect(page.locator('[data-testid="appointment-confirmed"]')).toBeVisible()
  })

  test('Healthcare Professional Dashboard', async ({ page }) => {
    // Login como profissional
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'doctor@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // Verificar dashboard
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="appointments-today"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-list"]')).toBeVisible()

    // Testar navegação
    await page.click('[data-testid="patients-menu"]')
    await expect(page.locator('[data-testid="patients-grid"]')).toBeVisible()
  })

  test('Mobile Responsiveness - Patient App', async ({ page }) => {
    // Simular mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Testar menu mobile
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Testar navegação mobile
    await page.click('[data-testid="appointments-mobile"]')
    await expect(page.locator('[data-testid="appointments-list"]')).toBeVisible()
  })

  test('LGPD Compliance - Data Export', async ({ page }) => {
    // Login como paciente
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'patient@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // Navegar para configurações
    await page.click('[data-testid="profile-menu"]')
    await page.click('[data-testid="privacy-settings"]')

    // Solicitar exportação de dados
    await page.click('[data-testid="export-data-button"]')

    // Verificar confirmação
    await expect(page.locator('[data-testid="export-confirmation"]')).toBeVisible()
  })
})
