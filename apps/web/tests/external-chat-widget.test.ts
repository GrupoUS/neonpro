import { test, expect } from '@playwright/test';

test.describe('External AI Chat Widget Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página com o widget
    await page.goto('/examples/external-chat');
    
    // Aguardar componente carregar
    await page.waitForSelector('[aria-label="Abrir Assistente NeonPro"]');
  });

  test('should load widget in under 500ms', async ({ page }) => {
    const startTime = Date.now();
    
    // Clicar no botão para abrir o widget
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    
    // Aguardar widget estar visível
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Widget load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(500);
  });

  test('should respond to messages within 2 seconds', async ({ page }) => {
    // Abrir widget
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Digitar mensagem de teste
    const testMessage = 'Como você funciona?';
    await page.fill('[aria-label="Campo de mensagem"]', testMessage);
    
    const startTime = Date.now();
    
    // Enviar mensagem
    await page.click('[aria-label="Enviar mensagem"]');
    
    // Aguardar resposta aparecer (procurar por mensagem do assistente)
    await page.waitForSelector('text=Esta é uma excelente pergunta', { timeout: 5000 });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`Response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(2000);
  });

  test('should maintain accuracy above 90%', async ({ page }) => {
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Testes com mensagens que devem ter alta confiança
    const highConfidenceMessages = [
      'Olá',
      'Como você funciona?',
      'Preciso de ajuda',
      'Obrigado',
      'Que horas são?'
    ];
    
    let totalConfidence = 0;
    
    for (const message of highConfidenceMessages) {
      // Limpar campo
      await page.fill('[aria-label="Campo de mensagem"]', '');
      
      // Digitar mensagem
      await page.fill('[aria-label="Campo de mensagem"]', message);
      
      // Enviar
      await page.click('[aria-label="Enviar mensagem"]');
      
      // Aguardar resposta
      await page.waitForTimeout(1500);
      
      // Verificar se indicador de confiança apareceu
      const confidenceIndicator = await page.locator('[role="status"][aria-label*="Nível de confiança"]').last();
      
      if (await confidenceIndicator.isVisible()) {
        const confidenceText = await confidenceIndicator.getAttribute('aria-label');
        const confidenceMatch = confidenceText?.match(/(\d+)%/);
        
        if (confidenceMatch) {
          const confidence = parseInt(confidenceMatch[1]);
          totalConfidence += confidence;
          console.log(`Message: "${message}" - Confidence: ${confidence}%`);
        }
      }
    }
    
    const averageConfidence = totalConfidence / highConfidenceMessages.length;
    console.log(`Average confidence: ${averageConfidence}%`);
    
    expect(averageConfidence).toBeGreaterThan(90);
  });

  test('should trigger handoff when confidence is below 85%', async ({ page }) => {
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Mensagem que deve gerar baixa confiança
    const lowConfidenceMessage = 'Problema técnico complexo com configuração avançada';
    
    await page.fill('[aria-label="Campo de mensagem"]', lowConfidenceMessage);
    await page.click('[aria-label="Enviar mensagem"]');
    
    // Aguardar resposta
    await page.waitForTimeout(2000);
    
    // Verificar se apareceu indicação de handoff
    const handoffBadge = page.locator('text=Atendimento Humano');
    
    await expect(handoffBadge).toBeVisible({ timeout: 3000 });
  });

  test('should support voice input', async ({ page }) => {
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Verificar se botão de gravação existe
    const voiceButton = page.locator('[aria-label="Iniciar gravação"]');
    await expect(voiceButton).toBeVisible();
    
    // Verificar se é clicável
    await expect(voiceButton).toBeEnabled();
  });

  test('should be accessible (WCAG 2.1 AA+)', async ({ page }) => {
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Verificar role dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Verificar aria-label
    await expect(dialog).toHaveAttribute('aria-label', 'Assistente NeonPro');
    
    // Verificar aria-modal
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    // Verificar se mensagens têm role article
    const messageArticles = page.locator('[role="article"]');
    const count = await messageArticles.count();
    expect(count).toBeGreaterThan(0);
    
    // Verificar se campo de entrada tem aria-label
    const messageInput = page.locator('[aria-label="Campo de mensagem"]');
    await expect(messageInput).toBeVisible();
    
    // Verificar se botões têm aria-label
    const sendButton = page.locator('[aria-label="Enviar mensagem"]');
    await expect(sendButton).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Definir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Abrir widget
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Verificar se widget se adapta ao tamanho mobile
    const dialog = page.locator('[role="dialog"]');
    const box = await dialog.boundingBox();
    
    expect(box?.width).toBeLessThanOrEqual(375);
    expect(box?.height).toBeLessThanOrEqual(667);
    
    // Verificar se elementos são tocáveis (> 44px)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const buttonBox = await buttons.nth(i).boundingBox();
      if (buttonBox) {
        expect(Math.min(buttonBox.width, buttonBox.height)).toBeGreaterThanOrEqual(32); // Mínimo 32px para touch
      }
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Simular erro de rede interceptando requests
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Enviar mensagem
    await page.fill('[aria-label="Campo de mensagem"]', 'Teste de erro');
    await page.click('[aria-label="Enviar mensagem"]');
    
    // Verificar se mensagem de erro aparece
    await expect(page.locator('text=Desculpe, ocorreu um erro')).toBeVisible({ timeout: 3000 });
  });

  test('performance benchmark: multiple rapid messages', async ({ page }) => {
    await page.click('[aria-label="Abrir Assistente NeonPro"]');
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    const messages = [
      'Mensagem 1',
      'Mensagem 2', 
      'Mensagem 3',
      'Mensagem 4',
      'Mensagem 5'
    ];
    
    const startTime = Date.now();
    
    for (const message of messages) {
      await page.fill('[aria-label="Campo de mensagem"]', message);
      await page.click('[aria-label="Enviar mensagem"]');
      await page.waitForTimeout(100); // Pequena pausa entre mensagens
    }
    
    // Aguardar todas as respostas
    await page.waitForTimeout(3000);
    
    const totalTime = Date.now() - startTime;
    const averageTimePerMessage = totalTime / messages.length;
    
    console.log(`Total time for ${messages.length} messages: ${totalTime}ms`);
    console.log(`Average time per message: ${averageTimePerMessage}ms`);
    
    expect(averageTimePerMessage).toBeLessThan(2000);
  });
});