# 💳 Sistema de Assinaturas NeonPro

Sistema completo de assinaturas SaaS integrado com Stripe para o NeonPro - plataforma de gestão de clínicas estéticas.

## 🎯 Visão Geral

O sistema de assinaturas permite que os usuários do NeonPro escolham entre diferentes planos de acordo com suas necessidades, processem pagamentos de forma segura via Stripe, e tenham acesso controlado às funcionalidades baseado no seu plano ativo.

### Planos Disponíveis

| Plano | Preço | Pacientes | Recursos |
|-------|-------|-----------|----------|
| **Starter** | R$ 99/mês | Até 500 | Agendamento básico, Controle financeiro simples |
| **Professional** | R$ 199/mês | Até 2.000 | Agendamento avançado, Relatórios, API |
| **Enterprise** | R$ 399/mês | Ilimitados | Multi-clínicas, Customização, Suporte 24/7 |

## 🚀 Quick Start

### 1. Configuração Inicial

```bash
# 1. Clone e instale dependências
git clone [repo]
cd neonpro
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves Stripe e Supabase

# 3. Execute setup automático
npm run setup:subscriptions

# 4. Inicie o servidor
npm run dev
```

### 2. Teste o Sistema

```bash
# Teste completo do sistema
npm run test:subscriptions

# Testes específicos
npm run test:stripe    # Testa integração Stripe
npm run test:db       # Testa banco de dados
```

### 3. Acesse as Páginas

- **Preços**: [http://localhost:3000/pricing](http://localhost:3000/pricing)
- **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Gerenciar Assinatura**: [http://localhost:3000/dashboard/subscription/manage](http://localhost:3000/dashboard/subscription/manage)

## 📁 Estrutura do Código

```
neonpro/
├── app/
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── create-checkout-session/route.ts    # Criar sessão de checkout
│   │   │   └── create-billing-portal-session/route.ts  # Portal de cobrança
│   │   ├── webhooks/stripe/route.ts                # Webhooks Stripe
│   │   └── subscription/current/route.ts           # API de assinatura atual
│   ├── pricing/page.tsx                            # Página de planos
│   └── dashboard/subscription/
│       ├── success/page.tsx                        # Sucesso do pagamento
│       ├── manage/page.tsx                         # Gerenciar assinatura
│       └── expired/page.tsx                        # Assinatura expirada
├── components/
│   ├── auth/subscription-guard.tsx                 # Proteção por assinatura
│   └── dashboard/subscription-info.tsx             # Info da assinatura
├── hooks/
│   └── use-subscription.tsx                        # Hook de assinatura
├── lib/
│   ├── stripe.ts                                   # Configuração Stripe
│   └── services/subscription-service.ts            # Lógica de negócio
├── scripts/
│   ├── setup-subscriptions.js                     # Setup automático
│   ├── test-stripe-subscriptions.js               # Testes Stripe
│   └── test-database-schema.js                    # Testes banco
└── supabase/migrations/
    └── 20250721130000_create_subscriptions_schema.sql  # Schema do banco
```

## 🛠️ Configuração

### Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

### Configuração do Stripe Dashboard

Siga o guia detalhado em [docs/STRIPE_SETUP_GUIDE.md](./docs/STRIPE_SETUP_GUIDE.md) para:

1. ✅ Criar produtos no Stripe
2. ✅ Configurar preços mensais  
3. ✅ Configurar webhooks
4. ✅ Obter as chaves de API

### Schema do Banco de Dados

O sistema usa as seguintes tabelas principais:

- **`user_subscriptions`** - Assinaturas dos usuários
- **`subscription_plans`** - Planos disponíveis
- **`billing_events`** - Histórico de cobrança
- **`active_subscriptions`** - View de assinaturas ativas
- **`user_subscriptions_view`** - View para API

Para aplicar o schema:
```bash
# Aplicar migration
npx supabase db push

# Ou executar manualmente no SQL Editor do Supabase
# o arquivo: supabase/migrations/20250721130000_create_subscriptions_schema.sql
```

## 🔧 Funcionalidades

### Para Usuários

- ✅ **Seleção de Planos** - Interface clara para escolher planos
- ✅ **Checkout Seguro** - Processamento via Stripe Checkout
- ✅ **Gestão de Assinatura** - Portal de cobrança integrado
- ✅ **Histórico de Pagamentos** - Visualização de faturas
- ✅ **Cancelamento** - Processo simples de cancelamento

### Para Desenvolvedores

- ✅ **Webhook Handling** - Sincronização automática com Stripe
- ✅ **Route Protection** - Proteção baseada em assinatura
- ✅ **React Hooks** - `useSubscription()` para estado global
- ✅ **TypeScript** - Tipagem completa em todo sistema
- ✅ **Testes Automatizados** - Scripts de validação completos

### Para Administradores

- ✅ **Dashboard Admin** - Métricas de assinaturas em `/dashboard/admin/subscriptions`
- ✅ **Relatórios** - Taxa de conversão, cancelamentos, receita
- ✅ **Monitoramento** - Assinaturas expirando, novos usuários

## 🧪 Testes

### Scripts de Teste Disponíveis

```bash
# Setup e validação completa
npm run setup:subscriptions    # Configuração automática

# Testes específicos  
npm run test:stripe           # Testa integração Stripe
npm run test:db               # Testa schema do banco
npm run test:subscriptions   # Testa sistema completo

# Testes de desenvolvimento
npm run test                  # Jest unit tests
npm run test:e2e             # Playwright e2e tests
```

### Validação Manual

1. **Fluxo de Checkout**:
   - Acesse `/pricing`
   - Selecione um plano
   - Complete o checkout (use cartão de teste Stripe)
   - Verifique redirecionamento para `/dashboard/subscription/success`

2. **Portal de Cobrança**:
   - Acesse `/dashboard/subscription/manage`
   - Teste atualização de método de pagamento
   - Verifique download de faturas

3. **Proteção de Rotas**:
   - Teste acesso sem assinatura
   - Verifique redirecionamentos apropriados

## 📊 Monitoramento

### Métricas Importantes

- **Taxa de Conversão**: Visitantes → Assinantes
- **Churn Rate**: Cancelamentos mensais
- **MRR**: Receita recorrente mensal
- **Lifetime Value**: Valor médio por cliente

### Logs e Debug

- **Webhook Events**: Logs em `/api/webhooks/stripe`
- **Database Queries**: Logs de query no Supabase
- **Error Tracking**: Integração com Sentry (opcional)

## 🚨 Troubleshooting

### Problemas Comuns

#### "Price not found" 
```bash
# Soluções:
1. Verificar Price IDs no Stripe Dashboard
2. Atualizar IDs em lib/services/subscription-service.ts
3. Confirmar modo test/live correto
```

#### "Webhook signature invalid"
```bash
# Soluções:
1. Verificar STRIPE_WEBHOOK_SECRET
2. Testar com ngrok em desenvolvimento
3. Confirmar URL webhook no Stripe Dashboard
```

#### "Database connection failed"
```bash
# Soluções:
1. Verificar variáveis Supabase
2. Aplicar migration: npx supabase db push
3. Executar: npm run test:db
```

### Debug Mode

```bash
# Executar com debug ativado
DEBUG=stripe:* npm run dev

# Logs detalhados dos webhooks
STRIPE_LOG_LEVEL=debug npm run dev
```

## 🔐 Segurança

### Implementações de Segurança

- ✅ **Webhook Verification** - Verificação de assinatura Stripe
- ✅ **Route Protection** - Middleware de autenticação
- ✅ **RLS Policies** - Row Level Security no Supabase
- ✅ **Input Validation** - Zod validation em forms
- ✅ **CSRF Protection** - Tokens em formulários

### Boas Práticas

- 🔒 Never log sensitive data (payment info, keys)
- 🔒 Use environment variables para secrets
- 🔒 Validate webhook signatures sempre
- 🔒 Implement rate limiting em produção
- 🔒 Monitor for suspicious activity

## 🚀 Deploy

### Preparação para Produção

1. **Configurar Stripe Live Mode**:
   ```bash
   # Atualizar .env com keys live
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Configurar Webhooks Produção**:
   - URL: `https://seu-dominio.com/api/webhooks/stripe`
   - Events: mesmos do desenvolvimento

3. **Deploy Database**:
   ```bash
   # Aplicar migration em produção
   npx supabase db push --remote
   ```

### Checklist de Deploy

- [ ] ✅ Variáveis de ambiente produção configuradas
- [ ] ✅ Webhook endpoint produção configurado
- [ ] ✅ Migration aplicada em produção
- [ ] ✅ Teste de checkout produção realizado
- [ ] ✅ Monitoramento de logs configurado
- [ ] ✅ Backup de dados configurado

## 📚 Recursos Adicionais

### Documentação

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### Ferramentas Recomendadas

- **Stripe CLI** - Para testes locais de webhook
- **ngrok** - Para tunnel local em desenvolvimento
- **Postman** - Para testar API endpoints
- **Supabase CLI** - Para gerenciar banco de dados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Execute os testes (`npm run test:subscriptions`)
4. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
5. Push para a branch (`git push origin feature/nova-funcionalidade`)
6. Abra um Pull Request

---

**🎉 Sistema de Assinaturas NeonPro - Pronto para Produção!**

Para suporte, abra uma issue ou entre em contato através do [suporte@neonpro.com](mailto:suporte@neonpro.com).
