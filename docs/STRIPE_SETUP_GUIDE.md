# 🎯 Guia de Configuração Stripe Dashboard - NeonPro

Este guia te ajuda a configurar os produtos e preços no Stripe Dashboard para o sistema de assinaturas do NeonPro.

## 📋 Pré-requisitos

- ✅ Conta Stripe criada e verificada
- ✅ Acesso ao Stripe Dashboard
- ✅ Variáveis de ambiente configuradas no `.env.local`
- ✅ Sistema de assinaturas implementado no NeonPro

## 🚀 Passo a Passo - Configuração Completa

### 1. Acesso ao Dashboard Stripe

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. Certifique-se de estar no **modo correto**:
   - **Test Mode** para desenvolvimento
   - **Live Mode** para produção

### 2. Criar Produtos

#### 2.1 Produto Starter
```bash
Nome: NeonPro Starter
Descrição: Para clínicas pequenas - Até 500 pacientes
```

1. Vá para **Products** no menu lateral
2. Clique **+ Add product**
3. Preencha:
   - **Name**: `NeonPro Starter`
   - **Description**: `Para clínicas pequenas - Até 500 pacientes`
   - **Image**: (opcional) Upload logo do NeonPro
4. Clique **Save product**

#### 2.2 Produto Professional
```bash
Nome: NeonPro Professional
Descrição: Para clínicas em crescimento - Até 2.000 pacientes
```

Repita o processo anterior com:
- **Name**: `NeonPro Professional`
- **Description**: `Para clínicas em crescimento - Até 2.000 pacientes`

#### 2.3 Produto Enterprise
```bash
Nome: NeonPro Enterprise
Descrição: Para grandes clínicas - Pacientes ilimitados
```

Repita o processo anterior com:
- **Name**: `NeonPro Enterprise`
- **Description**: `Para grandes clínicas - Pacientes ilimitados`

### 3. Criar Preços (Prices)

Para cada produto criado, você precisa criar um preço mensal:

#### 3.1 Preço Starter
1. No produto **NeonPro Starter**, clique **Add price**
2. Configure:
   - **Price**: `R$ 99.00`
   - **Currency**: `BRL`
   - **Billing period**: `Monthly`
   - **Usage type**: `Licensed` (cobrança fixa)
3. **IMPORTANTE**: Após criar, copie o **Price ID** gerado
4. **O Price ID deve ser**: `price_starter_monthly` (ou anote o ID real)

#### 3.2 Preço Professional
Repita o processo com:
- **Price**: `R$ 199.00`
- **Currency**: `BRL`
- **Billing period**: `Monthly`
- **Price ID esperado**: `price_professional_monthly`

#### 3.3 Preço Enterprise
Repita o processo com:
- **Price**: `R$ 399.00`
- **Currency**: `BRL`
- **Billing period**: `Monthly`
- **Price ID esperado**: `price_enterprise_monthly`

### 4. Configurar Webhooks

#### 4.1 Criar Webhook Endpoint

1. Vá para **Developers** → **Webhooks**
2. Clique **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/webhooks/stripe`
   - **Events to send**: Selecione os seguintes eventos:

```bash
Eventos Essenciais:
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ customer.subscription.trial_will_end
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ invoice.created
✅ customer.created
✅ customer.updated
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
```

4. Clique **Add endpoint**
5. **IMPORTANTE**: Copie o **Webhook signing secret** gerado

#### 4.2 Para Desenvolvimento Local (usando ngrok)

Se estiver testando localmente:

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Expor porta local
ngrok http 3000

# 3. Usar URL gerada no webhook
# Exemplo: https://abc123.ngrok.io/api/webhooks/stripe
```

### 5. Atualizar Variáveis de Ambiente

Após criar produtos e webhooks, atualize seu `.env.local`:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_publishable_key
STRIPE_SECRET_KEY=sk_test_sua_secret_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# IDs dos Preços (IMPORTANTE: use os IDs reais gerados)
STRIPE_STARTER_PRICE_ID=price_1A2B3C...
STRIPE_PROFESSIONAL_PRICE_ID=price_1D2E3F...
STRIPE_ENTERPRISE_PRICE_ID=price_1G2H3I...
```

### 6. Atualizar Código (se necessário)

Se os Price IDs gerados forem diferentes dos esperados, atualize o arquivo:
`lib/services/subscription-service.ts`

```typescript
export const NEONPRO_PLANS = {
  STARTER: {
    // ... outras propriedades
    stripePriceId: 'price_1A2B3C...' // Seu ID real aqui
  },
  PROFESSIONAL: {
    // ... outras propriedades  
    stripePriceId: 'price_1D2E3F...' // Seu ID real aqui
  },
  ENTERPRISE: {
    // ... outras propriedades
    stripePriceId: 'price_1G2H3I...' // Seu ID real aqui
  }
};
```

## ✅ Verificação da Configuração

Execute o script de teste para verificar se tudo está funcionando:

```bash
# Teste completo do sistema
node scripts/test-stripe-subscriptions.js

# Ou se preferir via npm
npm run test:stripe
```

### O que o teste deve mostrar:

```bash
✅ Variáveis de ambiente configuradas
✅ API endpoints respondendo
✅ Conexão com Stripe funcionando
✅ 3/3 planos encontrados no Stripe
✅ Webhook endpoint configurado
```

## 🔧 Configurações Adicionais Recomendadas

### 7.1 Configurações de Conta Stripe

1. **Business Settings**:
   - **Company name**: NeonPro
   - **Country**: Brazil
   - **Currency**: BRL

2. **Tax Settings**:
   - Configure impostos brasileiros se aplicável
   - Ative coleta de CPF/CNPJ se necessário

3. **Email Settings**:
   - Configure emails de cobrança personalizados
   - Ative notificações de webhook failures

### 7.2 Configurações de Checkout

1. Vá para **Settings** → **Checkout**
2. Configure:
   - **Logo**: Upload logo do NeonPro
   - **Brand color**: Cor principal do NeonPro
   - **Allow customers to**: ✅ Save payment methods

### 7.3 Portal do Cliente

1. Vá para **Settings** → **Customer portal**
2. Ative funcionalidades:
   - ✅ Update payment methods
   - ✅ View billing history
   - ✅ Download invoices
   - ✅ Cancel subscriptions (opcional)

## 🚨 Checklist de Produção

Antes de ir para produção:

- [ ] Produtos criados com informações corretas
- [ ] Preços configurados em BRL
- [ ] Webhooks configurados com URL de produção
- [ ] Variáveis de ambiente atualizadas
- [ ] Teste de checkout completo realizado
- [ ] Teste de webhook funcionando
- [ ] Configurações de impostos (se aplicável)
- [ ] Portal do cliente configurado
- [ ] Emails de cobrança personalizados

## 🆘 Troubleshooting

### Problema: "Price not found"
- Verifique se os Price IDs no código correspondem aos criados no Stripe
- Confira se está no modo correto (test/live)

### Problema: "Webhook signature invalid"  
- Verifique se o STRIPE_WEBHOOK_SECRET está correto
- Teste com ngrok se estiver em desenvolvimento local

### Problema: "Currency not supported"
- Certifique-se de que sua conta Stripe suporta BRL
- Verifique se os preços foram criados em BRL

### Problema: Checkout não carrega
- Verifique se NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY está correto
- Confirme se a key é do ambiente correto (test/live)

## 📞 Suporte

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Através do dashboard Stripe
- **NeonPro Support**: Via issues do GitHub do projeto

---

**🎉 Configuração completa! Seu sistema de assinaturas está pronto para funcionar!**
