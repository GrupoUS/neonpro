# NeonPro Chat Accessibility Guide

## Visão Geral

Este guia documenta as características de acessibilidade implementadas nos componentes de chat do NeonPro, seguindo as diretrizes WCAG 2.1 AA+ para garantir que a interface seja utilizável por todos os usuários, incluindo pessoas com deficiências.

## Características Implementadas

### 1. Suporte a Leitores de Tela

- **ARIA Labels**: Todos os componentes interativos possuem rótulos ARIA adequados
- **Live Regions**: Anúncios automáticos para mudanças de estado
- **Semantic HTML**: Uso correto de elementos semânticos HTML5
- **Screen Reader Only**: Conteúdo específico para leitores de tela

### 2. Navegação por Teclado

- **Focus Management**: Gerenciamento adequado de foco
- **Keyboard Shortcuts**: Atalhos de teclado para ações comuns
- **Focus Trap**: Armadilha de foco para modais
- **Skip Links**: Links para pular navegação

### 3. Alto Contraste

- **Theme Support**: Suporte a temas de alto contraste
- **Color Variables**: Variáveis CSS para fácil personalização
- **System Preferences**: Detecção automática de preferências do sistema

### 4. Redução de Movimento

- **Prefers Reduced Motion**: Respeita preferências de redução de movimento
- **Animation Control**: Controle sobre animações e transições
- **Performance**: Melhor desempenho com animações reduzidas

### 5. Tamanho de Texto

- **Resizable Text**: Suporte a redimensionamento de texto
- **Zoom Support**: Compatibilidade com zoom do navegador
- **Touch Targets**: Alvos de toque adequados para dispositivos móveis

### 6. Acessibilidade Cognitiva

- **Clear Instructions**: Instruções claras e simples
- **Consistent Navigation**: Navegação consistente
- **Error Handling**: Mensagens de erro acessíveis

## Componentes Acessíveis

### AccessibleChatMessage

```tsx
<AccessibleChatMessage
  message={message}
  isUser={false}
  onAction={action => console.log(action)}
/>
```

**Características:**

- Estrutura semântica com `<article>`
- ARIA labels e descriptions adequados
- Suporte a teclado completo
- Expansão de conteúdo longo
- Ações de copiar, falar e reportar

### AccessibilitySettingsPanel

```tsx
<AccessibilitySettingsPanel />
```

**Características:**

- Painel de configurações flutuante
- Suporte a alto contraste
- Controle de tamanho de texto
- Redução de movimento
- Modo teclado

### ScreenReaderAnnouncer

```tsx
<ScreenReaderAnnouncer
  message='Nova mensagem recebida'
  priority='polite'
  timeout={5000}
/>
```

**Características:**

- Anúncios para leitores de tela
- Prioridade configurável (polite/assertive)
- Timeout automático
- Suporte a múltiplos anúncios

## CSS de Acessibilidade

### Classes Utilitárias

```css
/* Alto contraste */
.high-contrast {
  --primary: #000000;
  --secondary: #ffffff;
  --background: #ffffff;
  --text: #000000;
}

/* Redução de movimento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Tamanho de texto */
[data-font-size="small"] { font-size: 14px; }
[data-font-size="medium"] { font-size: 16px; }
[data-font-size="large"] { font-size: 18px; }
[data-font-size="x-large"] { font-size: 20px; }
```

## Testes de Acessibilidade

### Testes Automatizados

```tsx
// Teste de atributos ARIA
test('renders with proper ARIA attributes', () => {
  const { container } = render(<AccessibleChatMessage message={mockMessage} />)
  const messageElement = container.querySelector('[role="assistant"]')
  expect(messageElement).toHaveAttribute('aria-labelledby')
  expect(messageElement).toHaveAttribute('aria-describedby')
})

// Teste de navegação por teclado
test('supports keyboard navigation', () => {
  const { container } = render(<AccessibleChatMessage message={mockMessage} />)
  const buttons = container.querySelectorAll('button')
  buttons.forEach(button => {
    expect(button).toHaveAttribute('tabindex', '0')
  })
})
```

### Lista de Verificação WCAG 2.1 AA+

#### Perceivable (Perceptível)

- [x] Alternativas textuais para conteúdo não textual
- [x] Legendas para conteúdo de mídia
- [x] Conteúdo em áudio pode ser pausado
- [x] Cores não são o único meio de conveying informação
- [x] Contraste de cor mínimo 4.5:1
- [x] Texto pode ser redimensionado até 200%
- [x] Texto de imagem não é usado para fins puramente decorativos
- [x] Conteúdo estruturado com cabeçalhos adequados

#### Operable (Operável)

- [x] Todas as funcionalidades disponíveis por teclado
- [x] Não há armadilhas de foco de teclado
- [x] Tempo suficiente para ler e interagir
- [x] Nenhuma interação causa convulsões
- [x] Múltiplos caminhos para navegação
- [x] Títulos de página descritivos
- [x] Ordem de foco lógica
- [x] Funcionalidade de links é previsível

#### Understandable (Compreensível)

- [x] Idioma da página é identificado
- [x] Conteúdo incompreensível é explicado
- [x] Entrada de dados é explicada
- [x] Navegação consistente
- [x] Erros são identificados e explicados
- [x] Labels de formulário são claras
- [x] Contexto de navegação é mantido

#### Robust (Robusto)

- [x] Compatibilidade com leitores de tela
- [x] Atributos ARIA são usados corretamente
- [x] Validação de marcação
- [x] Compatibilidade com tecnologias assistivas
- [x] Estados e propriedades são programaticamente determináveis

## Melhores Práticas

### 1. Design Inclusivo

- Envolva usuários com deficiências no processo de design
- Considere diferentes tipos de deficiência desde o início
- Teste com múltiplas tecnologias assistivas

### 2. Desenvolvimento Acessível

- Use HTML semântico sempre que possível
- Forneça alternativas textuais para conteúdo não textual
- Garanta que todos os elementos interativos sejam alcançáveis por teclado

### 3. Teste Contínuo

- Realize testes automatizados de acessibilidade
- Teste manualmente com leitores de tela
- Valide com diferentes navegadores e dispositivos

### 4. Documentação

- Documente todas as características de acessibilidade
- Forneça guias para usuários com deficiências
- Mantenha a documentação atualizada

## Suporte a Navegadores

### Navegadores Compatíveis

- **Chrome**: Versão 90+ (recomendado)
- **Firefox**: Versão 88+ (recomendado)
- **Safari**: Versão 14+ (recomendado)
- **Edge**: Versão 90+ (recomendado)

### Tecnologias Assistivas Suportadas

- **Screen Readers**: NVDA, JAWS, VoiceOver, TalkBack
- **Software de Ampliação**: ZoomText, MAGic
- **Reconhecimento de Voz**: Dragon NaturallySpeaking
- **Dispositivos Braille**: Displays braille compatíveis

## Personalização

### Temas Personalizados

```tsx
// Criar tema personalizado
const customTheme = {
  primary: '#AC9469',
  secondary: '#112031',
  background: '#D2D0C8',
  text: '#112031',
  border: '#B4AC9C',
  focus: '#AC9469',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
}
```

### Configurações de Usuário

```tsx
// Salvar preferências do usuário
const saveUserPreferences = (preferences: AccessibilitySettings) => {
  localStorage.setItem('accessibility-preferences', JSON.stringify(preferences))
}

// Carregar preferências do usuário
const loadUserPreferences = (): AccessibilitySettings => {
  const saved = localStorage.getItem('accessibility-preferences')
  return saved ? JSON.parse(saved) : defaultSettings
}
```

## Monitoramento e Manutenção

### Auditorias Regulares

- Realize auditorias de acessibilidade trimestrais
- Monitore novas diretrizes WCAG
- Atualize componentes conforme necessário

### Feedback dos Usuários

- Colete feedback de usuários com deficiências
- Implemente melhorias baseadas no feedback
- Mantenha um canal de comunicação aberto

### Atualizações e Melhorias

- Mantenha-se atualizado com as melhores práticas
- Implemente novas tecnologias assistivas
- Melhore continuamente a experiência do usuário

## Referências

### Padrões e Diretrizes

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA](https://www.w3.org/TR/wai-aria/)
- [Section 508](https://www.section508.gov/)
- [EN 301 549](https://www.etsi.org/)

### Ferramentas de Teste

- [axe DevTools](https://www.deque.com/axe/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA](https://www.nvaccess.org/)
- [VoiceOver](https://www.apple.com/accessibility/mac/vision/)

### Recursos de Aprendizagem

- [WebAIM](https://webaim.org/)
- [A11Y Project](https://www.a11yproject.com/)
- [Smashing Magazine - Accessibility](https://www.smashingmagazine.com/category/accessibility/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Contato e Suporte

Para questões de acessibilidade ou relatórios de problemas:

- **Email**: accessibility@neonpro.com
- **Telefone**: (11) 9999-9999
- **Slack**: #acessibilidade-neonpro

---

_Este guia é mantido pela equipe de desenvolvimento do NeonPro e é atualizado regularmente para refletir as melhores práticas de acessibilidade._
