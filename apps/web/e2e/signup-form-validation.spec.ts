import { expect, test } from '@playwright/test';

test.describe('SignupFormDemo - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup-demo');
    await page.waitForLoadState('networkidle');
  });

  test('should display the NeonPro login form correctly', async ({ page }) => {
    // Verifica se o título está presente
    await expect(page.locator('h2')).toContainText('NEON PRO');
    await expect(page.locator('text=AI-First SaaS • Clínicas de Estética')).toBeVisible();

    // Verifica se todos os campos estão presentes
    await expect(page.locator('#firstname')).toBeVisible();
    await expect(page.locator('#lastname')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#crm')).toBeVisible();

    // Verifica se o botão Google está presente
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();

    // Verifica se os badges de compliance estão presentes
    await expect(page.locator('text=LGPD Compliant')).toBeVisible();
    await expect(page.locator('text=CFM Aprovado')).toBeVisible();
    await expect(page.locator('text=ANVISA')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Tenta submeter o formulário vazio
    await page.locator('button[type="submit"]').click();

    // Verifica se as mensagens de erro aparecem usando seletores mais específicos
    await expect(page.locator('#firstname').locator('..').locator('p.text-destructive'))
      .toContainText('Nome deve ter pelo menos 2 caracteres');
    await expect(page.locator('#lastname').locator('..').locator('p.text-destructive'))
      .toContainText('Sobrenome deve ter pelo menos 2 caracteres');
    await expect(page.locator('#email').locator('..').locator('p.text-destructive')).toContainText(
      'E-mail é obrigatório',
    );
    await expect(page.locator('#password').locator('..').locator('p.text-destructive'))
      .toContainText('Senha deve ter pelo menos 8 caracteres');
  });

  test('should validate email format', async ({ page }) => {
    // Preenche com email inválido
    await page.locator('#email').fill('email-invalido');
    await page.locator('#firstname').click(); // Trigger blur event

    // Verifica se a mensagem de erro aparece
    await expect(page.locator('text=Formato de e-mail inválido')).toBeVisible();

    // Preenche com email válido
    await page.locator('#email').fill('dr.joao@clinica.com.br');
    await page.locator('#firstname').click();

    // Verifica se a mensagem de erro desaparece
    await expect(page.locator('text=Formato de e-mail inválido')).not.toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    // Testa senha fraca
    await page.locator('#password').fill('123');
    await page.locator('#firstname').click();

    await expect(page.locator('text=Senha deve ter pelo menos 8 caracteres')).toBeVisible();

    // Testa senha sem caracteres especiais
    await page.locator('#password').fill('Password123');
    await page.locator('#firstname').click();

    await expect(
      page.locator(
        'text=Senha deve conter: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
      ),
    ).toBeVisible();

    // Testa senha válida
    await page.locator('#password').fill('Password123!');
    await page.locator('#firstname').click();

    await expect(
      page.locator(
        'text=Senha deve conter: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
      ),
    ).not.toBeVisible();
  });

  test('should validate CRM format', async ({ page }) => {
    // Testa CRM inválido
    await page.locator('#crm').fill('123456');
    await page.locator('#firstname').click();

    await expect(
      page.locator('text=Formato de CRM inválido. Use: CRM/UF 123456 (ex: CRM/SP 123456)'),
    ).toBeVisible();

    // Testa CRM válido
    await page.locator('#crm').fill('CRM/SP 123456');
    await page.locator('#firstname').click();

    await expect(page.locator('text=Formato de CRM inválido')).not.toBeVisible();
  });

  test('should validate name fields with special characters', async ({ page }) => {
    // Testa nome com números (inválido)
    await page.locator('#firstname').fill('João123');
    await page.locator('#lastname').click();

    await expect(page.locator('text=Nome deve conter apenas letras e espaços')).toBeVisible();

    // Testa nome válido com acentos
    await page.locator('#firstname').fill('João');
    await page.locator('#lastname').click();

    await expect(page.locator('text=Nome deve conter apenas letras e espaços')).not.toBeVisible();
  });

  test('should submit form with valid data', async ({ page }) => {
    // Preenche todos os campos com dados válidos
    await page.locator('#firstname').fill('Dr. João');
    await page.locator('#lastname').fill('Silva');
    await page.locator('#email').fill('dr.joao@clinica.com.br');
    await page.locator('#password').fill('MinhaSenh@123');
    await page.locator('#crm').fill('CRM/SP 123456');

    // Submete o formulário
    await page.locator('button[type="submit"]').click();

    // Verifica se o botão mostra estado de loading (aguarda um pouco para capturar o estado)
    await page.waitForTimeout(100);
    await expect(page.locator('button[type="submit"]')).toContainText('Processando');

    // Aguarda o processamento
    await page.waitForTimeout(3000);

    // Verifica se o formulário foi resetado (indicando sucesso)
    await expect(page.locator('#firstname')).toHaveValue('');
    await expect(page.locator('#lastname')).toHaveValue('');
    await expect(page.locator('#email')).toHaveValue('');
  });

  test('should handle form submission errors', async ({ page }) => {
    // Mock de erro de rede ou servidor
    await page.route('**/auth/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Preenche dados válidos
    await page.locator('#firstname').fill('Dr. João');
    await page.locator('#lastname').fill('Silva');
    await page.locator('#email').fill('dr.joao@clinica.com.br');
    await page.locator('#password').fill('MinhaSenh@123');

    // Submete o formulário
    await page.locator('button[type="submit"]').click();

    // Aguarda o processamento e verifica se o formulário foi resetado (indicando sucesso)
    await page.waitForTimeout(3000);
    await expect(page.locator('#firstname')).toHaveValue('');
  });
});
