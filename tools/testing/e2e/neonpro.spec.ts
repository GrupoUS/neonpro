import { test, expect } from '@playwright/test';

test.describe('NeonPro Healthcare Platform', () => {
  test.skip('homepage loads correctly', async ({ page }) => {
    // Este teste será executado quando o servidor local estiver rodando
    await page.goto('http://localhost:3000');
    
    // Verificar se a página principal carrega
    await expect(page).toHaveTitle(/NeonPro/);
    
    // Verificar se elementos básicos estão presentes
    await expect(page.locator('body')).toBeVisible();
  });

  test.skip('login page is accessible', async ({ page }) => {
    // Teste de acesso à página de login
    await page.goto('http://localhost:3000/login');
    
    // Verificar elementos do formulário de login
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('external link - Playwright documentation', async ({ page }) => {
    // Teste que funciona sem servidor local - verifica se os browsers estão funcionando
    await page.goto('https://playwright.dev/');
    
    await expect(page).toHaveTitle(/Playwright/);
    await expect(page.locator('h1')).toBeVisible();
  });
});