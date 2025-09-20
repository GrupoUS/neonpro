# NeonPro AI Chatbot Frontend

## Implementação Concluída ✅

O frontend do chatbot foi implementado com sucesso no dashboard do NeonPro. O componente `FloatingAIChatSimple` está ativo e funcionando.

## Funcionalidades

### Botão Flutuante

- **Localização**: Canto inferior direito (bottom-6 right-6)
- **Design**: Gradiente NeonPro (#294359 to #AC9469)
- **Ícones**: MessageCircle (fechado) / X (aberto)
- **Animações**: Sparkles pulsante, tooltip no hover
- **Acessibilidade**: ARIA labels, focus ring

### Modal de Chat

- **Dimensões**: 384px (w-96) x 500px (h-[500px])
- **Posição**: Fixed bottom-24 right-6
- **Backdrop**: Blur com click para fechar
- **Escape Key**: Fecha o modal

### Interface de Chat

- **Header**: Branding NeonPro AI com botões Limpar e Fechar
- **Mensagens**: Scroll automático, diferenciação visual user/assistant
- **Input**: Envio por Enter, botão Send, estados disabled
- **Loading**: Animação de pontos pulsantes
- **LGPD**: Aviso de compliance na parte inferior

## Arquivos Implementados

1. **FloatingAIChatSimple** (`/src/components/ui/floating-ai-chat-simple.tsx`)
   - Componente principal do chatbot
   - Sem dependências externas problemáticas
   - Interface completa e funcional

2. **Integração** (`/src/routes/__root.tsx`)
   - Renderizado apenas em páginas protegidas (`showSidebar`)
   - Props configuradas para contexto de procedimentos

## Como Usar

### Para Usuários

1. Acesse qualquer página protegida do dashboard
2. Clique no botão flutuante no canto inferior direito
3. Digite sua mensagem e pressione Enter ou clique em Enviar
4. Use "Limpar" para resetar a conversa
5. Feche com X, Escape ou clicando fora do modal

### Para Desenvolvedores

#### Props Disponíveis

```typescript
interface FloatingAIChatSimpleProps {
  className?: string;
  context?: string; // Default: 'procedures'
  patientId?: string; // Para contexto específico
  userRole?: string; // Default: 'professional'
  lgpdCompliant?: boolean; // Default: true
  onAuditLog?: (action: string, details?: Record<string, any>) => void;
  onEmergencyDetected?: () => void;
}
```

#### Integração com Backend

Para conectar com IA real, substitua a simulação em `handleSendMessage`:

```typescript
// Substituir esta parte:
setTimeout(() => {
  const aiMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: `Resposta simulada...`,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, aiMessage]);
  setIsLoading(false);
}, 1500);

// Por chamada real para API:
try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage.content,
      context,
      patientId,
      userRole,
    }),
  });

  const data = await response.json();
  const aiMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: data.response,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, aiMessage]);
} catch (error) {
  console.error('Chat API error:', error);
} finally {
  setIsLoading(false);
}
```

## Próximos Passos

1. **Integração com Backend**: Conectar com API de IA real
2. **Persistência**: Salvar histórico de conversas
3. **Streaming**: Implementar respostas em tempo real
4. **Contexto Avançado**: Integrar com dados do paciente/procedimento
5. **Analytics**: Rastrear interações para melhorias

## Troubleshooting

### Botão não aparece

- Verifique se está em uma página protegida (com sidebar)
- Confirme que `showSidebar` é true no \_\_root.tsx

### Erros de dependências

- O componente foi criado sem dependências externas problemáticas
- Usa apenas React hooks nativos e Lucide icons

### Problemas de estilo

- Confirme que Tailwind CSS está configurado
- Verifique se as classes de gradiente NeonPro estão disponíveis

## Status: ✅ IMPLEMENTADO E FUNCIONANDO

O chatbot frontend está completamente implementado e pronto para uso. O botão deve estar visível no dashboard do NeonPro.
