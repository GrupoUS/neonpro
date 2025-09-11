import { test, expect } from '@playwright/test';

test.describe('Google OAuth Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup-demo');
    await page.waitForLoadState('networkidle');
  });

  test('should display Google Sign-In button correctly', async ({ page }) => {
    const googleButton = page.locator('button:has-text("Continue with Google")');
    
    // Verifica se o botão está visível
    await expect(googleButton).toBeVisible();
    
    // Verifica se o ícone do Google está presente
    await expect(page.locator('svg[class*="IconBrandGoogle"]')).toBeVisible();
    
    // Verifica se o botão tem o estilo correto
    await expect(googleButton).toHaveClass(/bg-white/);
    await expect(googleButton).toHaveClass(/border-2/);
    
    // Verifica se o ícone tem a cor correta do Google
    const googleIcon = page.locator('svg[class*="IconBrandGoogle"]');
    await expect(googleIcon).toHaveClass(/text-\[#4285f4\]/);
  });

  test('should handle Google Sign-In button click', async ({ page }) => {
    // Mock da resposta do Supabase Auth
    await page.route('**/auth/v1/authorize**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          url: 'https://accounts.google.com/oauth/authorize?...',
          provider: 'google'
        })
      });
    });

    const googleButton = page.locator('button:has-text("Continue with Google")');
    
    // Clica no botão Google
    await googleButton.click();
    
    // Verifica se o botão mostra estado de loading
    await expect(page.locator('button:has-text("Signing in...")')).toBeVisible();
    
    // Verifica se o botão fica desabilitado durante o loading
    await expect(googleButton).toBeDisabled();
  });

  test('should handle Google OAuth error', async ({ page }) => {
    // Mock de erro do Supabase Auth
    await page.route('**/auth/v1/authorize**', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'invalid_request',
          error_description: 'OAuth provider error'
        })
      });
    });

    const googleButton = page.locator('button:has-text("Continue with Google")');
    
    // Clica no botão Google
    await googleButton.click();
    
    // Aguarda o processamento
    await page.waitForTimeout(2000);
    
    // Verifica se a mensagem de erro aparece
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('text=An unexpected error occurred')).toBeVisible();
  });

  test('should handle successful Google OAuth redirect', async ({ page }) => {
    // Simula retorno bem-sucedido do Google OAuth
    await page.goto('/signup-demo?code=auth_code&state=oauth_state');
    
    // Mock da troca do código por token
    await page.route('**/auth/v1/token**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          user: {
            id: 'user_123',
            email: 'dr.joao@clinica.com.br',
            user_metadata: {
              name: 'Dr. João Silva'
            }
          }
        })
      });
    });

    // Verifica se não há mensagens de erro
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
    
    // Verifica se o usuário seria redirecionado (em um cenário real)
    // Aqui podemos verificar se elementos específicos da página logada aparecem
  });

  test('should maintain Google button state during form submission', async ({ page }) => {
    // Preenche o formulário
    await page.locator('#firstname').fill('Dr. João');
    await page.locator('#lastname').fill('Silva');
    await page.locator('#email').fill('dr.joao@clinica.com.br');
    await page.locator('#password').fill('MinhaSenh@123');
    
    // Submete o formulário
    await page.locator('button[type="submit"]').click();
    
    // Verifica se o botão Google fica desabilitado durante o submit do formulário
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeDisabled();
    
    // Aguarda o processamento
    await page.waitForTimeout(3000);
    
    // Verifica se o botão Google volta ao estado normal
    await expect(googleButton).toBeEnabled();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simula erro de rede
    await page.route('**/auth/v1/**', route => {
      route.abort('failed');
    });

    const googleButton = page.locator('button:has-text("Continue with Google")');
    
    // Clica no botão Google
    await googleButton.click();
    
    // Aguarda o processamento
    await page.waitForTimeout(2000);
    
    // Verifica se a mensagem de erro de rede aparece
    await expect(page.locator('text=An unexpected error occurred')).toBeVisible();
    
    // Verifica se o botão volta ao estado normal
    await expect(googleButton).toBeEnabled();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
  });

  test('should prevent multiple simultaneous OAuth requests', async ({ page }) => {
    let requestCount = 0;
    
    // Conta quantas requisições são feitas
    await page.route('**/auth/v1/authorize**', route => {
      requestCount++;
      // Simula delay na resposta
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: 'https://accounts.google.com/oauth/authorize' })
        });
      }, 1000);
    });

    const googleButton = page.locator('button:has-text("Continue with Google")');
    
    // Clica múltiplas vezes rapidamente
    await googleButton.click();
    await googleButton.click();
    await googleButton.click();
    
    // Aguarda o processamento
    await page.waitForTimeout(2000);
    
    // Verifica se apenas uma requisição foi feita
    expect(requestCount).toBe(1);
  });

  test('should display correct button text in Portuguese context', async ({ page }) => {
    // Verifica se o texto do botão está em inglês (padrão internacional)
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
    
    // Verifica se não há texto em português no botão Google (mantém padrão internacional)
    await expect(page.locator('button:has-text("Entrar com Google")')).not.toBeVisible();
    
    // Mas verifica se o contexto da página está em português
    await expect(page.locator('text=Acesse sua conta')).toBeVisible();
    await expect(page.locator('text=E-mail Profissional')).toBeVisible();
  });
});
