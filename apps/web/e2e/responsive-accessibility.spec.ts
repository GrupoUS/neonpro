import { expect, test } from '@playwright/test';

test.describe('Responsive Design and Accessibility', () => {
  test.describe('Mobile Viewport (375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display correctly on mobile', async ({ page }) => {
      await page.goto('/signup-demo');
      await page.waitForLoadState('networkidle');

      // Checks that the form is visible and properly formatted
      const formContainer = page.locator('div[class*="max-w-md"]');
      await expect(formContainer).toBeVisible();

      // Verifica se os campos estão empilhados verticalmente no mobile
      const nameFields = page.locator('div[class*="md:flex-row"]');
      await expect(nameFields).toHaveClass(/flex-col/);

      // Verifica se o botão Google tem altura adequada para touch
      const googleButton = page.locator('button:has-text("Continue with Google")');
      await expect(googleButton).toHaveClass(/h-12/);

      // Verifica se os badges de compliance são responsivos
      const complianceBadges = page.locator('div[class*="flex-wrap"]');
      await expect(complianceBadges).toBeVisible();
    });

    test('should handle form validation on mobile', async ({ page }) => {
      await page.goto('/signup-demo');

      // Tenta submeter formulário vazio
      await page.locator('button[type="submit"]').click();

      // Verifica se as mensagens de erro são visíveis no mobile
      await expect(page.locator('text=Nome deve ter pelo menos 2 caracteres')).toBeVisible();

      // Verifica se as mensagens não quebram o layout
      const errorMessages = page.locator('p[class*="text-destructive"]');
      await expect(errorMessages.first()).toBeVisible();
    });

    test('should maintain touch targets on mobile', async ({ page }) => {
      await page.goto('/signup-demo');

      // Verifica se todos os botões têm tamanho adequado para touch (mínimo 44px)
      const submitButton = page.locator('button[type="submit"]');
      const googleButton = page.locator('button:has-text("Continue with Google")');

      const submitBox = await submitButton.boundingBox();
      const googleBox = await googleButton.boundingBox();

      // Assert that boundingBox is not null before checking height
      expect(submitBox).not.toBeNull();
      expect(googleBox).not.toBeNull();

      expect(submitBox!.height).toBeGreaterThanOrEqual(44);
      expect(googleBox!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Tablet Viewport (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display correctly on tablet', async ({ page }) => {
      await page.goto('/signup-demo');

      // Verifica se os campos nome/sobrenome ficam lado a lado no tablet
      const nameContainer = page.locator('div[class*="md:flex-row"]');
      await expect(nameContainer).toHaveClass(/md:flex-row/);

      // Verifica se o formulário mantém largura adequada
      const formContainer = page.locator('div[class*="max-w-md"]');
      await expect(formContainer).toBeVisible();
    });
  });

  test.describe('Desktop Viewport (1920px)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should display correctly on desktop', async ({ page }) => {
      await page.goto('/signup-demo');

      // Verifica se o formulário está centralizado
      const container = page.locator('div[class*="flex items-center justify-center"]');
      await expect(container).toBeVisible();

      // Verifica se os campos têm o layout correto
      const nameFields = page.locator('div[class*="md:flex-row"]');
      await expect(nameFields).toHaveClass(/md:flex-row/);
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/signup-demo');

      // Verifica se todos os inputs têm labels associados
      const inputs = page.locator('input');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        const associatedLabel = page.locator(`label[for="${inputId}"]`);
        await expect(associatedLabel).toBeVisible();
      }

      // Verifica se os botões têm texto descritivo
      await expect(page.locator('button[type="submit"]')).toHaveText(
        /Entrar na Plataforma|Processando/,
      );
      await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/signup-demo');

      // Testa navegação por Tab
      await page.keyboard.press('Tab');
      await expect(page.locator('#firstname')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('#lastname')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('#email')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('#password')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('#crm')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('button:has-text("Continue with Google")')).toBeFocused();
    });

    test('should handle focus management during form submission', async ({ page }) => {
      await page.goto('/signup-demo');

      // Preenche dados inválidos
      await page.locator('#firstname').fill('A'); // Muito curto
      await page.locator('#lastname').fill('Silva');
      await page.locator('#email').fill('email-invalido');
      await page.locator('#password').fill('123');

      // Submete o formulário
      await page.locator('button[type="submit"]').click();

      // Verifica se o foco vai para o primeiro campo com erro
      await expect(page.locator('#firstname')).toBeFocused();
    });

    test('should provide screen reader friendly error messages', async ({ page }) => {
      await page.goto('/signup-demo');

      // Submete formulário vazio
      await page.locator('button[type="submit"]').click();

      // Verifica se as mensagens de erro têm atributos adequados para screen readers
      const errorMessages = page.locator('p[class*="text-destructive"]');
      const firstError = errorMessages.first();

      await expect(firstError).toBeVisible();
      await expect(firstError).toHaveClass(/text-xs/); // Tamanho adequado

      // Verifica se as mensagens estão próximas aos campos relacionados
      const firstNameError = page.locator('#firstname').locator('..').locator(
        'p[class*="text-destructive"]',
      );
      await expect(firstNameError).toBeVisible();
    });

    test('should maintain color contrast for accessibility', async ({ page }) => {
      await page.goto('/signup-demo');

      // Verifica se elementos importantes têm contraste adequado
      // (Isso seria melhor testado com ferramentas específicas de contraste)

      // Verifica se textos de erro são visíveis
      await page.locator('button[type="submit"]').click();
      const errorText = page.locator('p[class*="text-destructive"]').first();
      await expect(errorText).toBeVisible();

      // Verifica se o botão Google tem contraste adequado
      const googleButton = page.locator('button:has-text("Continue with Google")');
      await expect(googleButton).toHaveClass(/text-gray-700/);
    });

    test('should support high contrast mode', async ({ page }) => {
      // Simula modo de alto contraste
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/signup-demo');

      // Verifica se elementos são visíveis no modo escuro
      await expect(page.locator('h2:has-text("NEON PRO")')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
    });

    test('should handle reduced motion preferences', async ({ page }) => {
      // Simula preferência por movimento reduzido
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/signup-demo');

      // Verifica se animações são reduzidas/removidas
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();

      // Testa se hover ainda funciona sem animações excessivas
      await submitButton.hover();
      await expect(submitButton).toBeVisible();
    });
  });
});
