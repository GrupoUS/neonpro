# 🔐 Sistema de Gerenciamento de Sessões e Segurança

## Visão Geral

O NeonPro implementa um sistema avançado de gerenciamento de sessões e segurança que oferece proteção robusta contra ameaças, monitoramento em tempo real e conformidade com a LGPD.

## 🎯 Funcionalidades Principais

### Gerenciamento de Sessões
- **Sessões Multi-Dispositivo**: Controle de múltiplas sessões simultâneas
- **Renovação Automática**: Tokens rotativos para máxima segurança
- **Expiração Inteligente**: Timeout baseado em atividade
- **Persistência Configurável**: Redis + Supabase para performance

### Segurança Avançada
- **Fingerprinting de Dispositivos**: Identificação única baseada em características do dispositivo
- **Detecção de Atividades Suspeitas**: Algoritmos de ML para identificar comportamentos anômalos
- **Geolocalização**: Análise de risco baseada em localização
- **Blacklist de IPs**: Bloqueio automático de IPs maliciosos

### Auditoria e Conformidade
- **Logs Completos**: Registro detalhado de todas as atividades
- **Conformidade LGPD**: Anonimização e retenção de dados
- **Relatórios de Segurança**: Dashboards e alertas em tempo real
- **Exportação de Dados**: Relatórios para auditoria

## 🏗️ Arquitetura

### Componentes Principais

```
📁 src/lib/auth/session/
├── 📄 types.ts              # Definições de tipos TypeScript
├── 📄 session-manager.ts    # Gerenciador principal de sessões
├── 📄 security-monitor.ts   # Monitor de segurança
├── 📄 device-manager.ts     # Gerenciador de dispositivos
├── 📄 audit-logger.ts       # Sistema de auditoria
├── 📄 config.ts             # Configurações do sistema
├── 📄 utils.ts              # Utilitários e helpers
├── 📄 index.ts              # Ponto de entrada principal
├── 📁 database/
│   ├── 📄 schema.sql        # Schema do banco de dados
│   └── 📄 migration.ts      # Scripts de migração
├── 📁 examples/
│   └── 📄 implementation-example.ts # Exemplos de implementação
└── 📁 __tests__/
    └── 📄 session-system.test.ts # Testes unitários
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `user_sessions`
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- clinic_id: UUID (FK)
- session_token: TEXT (encrypted)
- refresh_token: TEXT (encrypted)
- device_id: UUID (FK)
- ip_address: INET
- user_agent: TEXT
- location: JSONB
- expires_at: TIMESTAMPTZ
- last_activity: TIMESTAMPTZ
- security_score: INTEGER
- status: session_status
```

#### `device_registrations`
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- clinic_id: UUID (FK)
- device_fingerprint: JSONB
- device_name: TEXT
- platform: TEXT
- is_trusted: BOOLEAN
- first_seen: TIMESTAMPTZ
- last_seen: TIMESTAMPTZ
- usage_count: INTEGER
- status: device_status
```

#### `session_audit_logs`
```sql
- id: UUID (PK)
- session_id: UUID (FK)
- user_id: UUID (FK)
- clinic_id: UUID (FK)
- event_type: audit_event_type
- event_data: JSONB
- ip_address: INET
- user_agent: TEXT
- timestamp: TIMESTAMPTZ
- risk_score: INTEGER
```

#### `security_events`
```sql
- id: UUID (PK)
- session_id: UUID (FK)
- user_id: UUID (FK)
- clinic_id: UUID (FK)
- event_type: security_event_type
- threat_level: threat_level
- description: TEXT
- event_data: JSONB
- ip_address: INET
- resolved: BOOLEAN
- timestamp: TIMESTAMPTZ
```

## 🚀 Implementação

### 1. Inicialização do Sistema

```typescript
import { SessionSystem } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

// Configurar dependências
const supabase = createClient(url, key);
const redis = new Redis(redisUrl);

// Inicializar sistema
const sessionSystem = new SessionSystem();
await sessionSystem.initialize({ supabase, redis, config });
```

### 2. Criação de Sessão

```typescript
const result = await sessionSystem.createSession({
  userId: 'user-uuid',
  clinicId: 'clinic-uuid',
  deviceFingerprint: {
    userAgent: req.headers['user-agent'],
    screen: { width: 1920, height: 1080 },
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    platform: 'Web'
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});

if (result.success) {
  // Configurar cookie
  res.cookie('session_token', result.session.sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 60 * 1000 // 30 minutos
  });
}
```

### 3. Validação de Sessão

```typescript
const validation = await sessionSystem.validateSession(sessionToken);

if (validation.valid) {
  // Sessão válida
  const session = validation.session;
  
  if (validation.needsRenewal) {
    // Renovar sessão
    const renewal = await sessionSystem.renewSession(sessionToken);
    // Atualizar cookie com novo token
  }
} else {
  // Sessão inválida - redirecionar para login
  res.redirect('/login');
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Segurança
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_encryption_key

# Geolocalização (opcional)
IP_GEOLOCATION_API_KEY=your_api_key
```

### Configurações do Sistema

```typescript
const config: SessionConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  renewalThreshold: 0.25, // Renovar quando 25% do tempo restante
  maxConcurrentSessions: 3,
  requireDeviceVerification: true,
  enableLocationTracking: true,
  enableDeviceFingerprinting: true,
  tokenRotationInterval: 15 * 60 * 1000, // 15 minutos
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 dias
  maxSessionDuration: 8 * 60 * 60 * 1000, // 8 horas
  cleanupInterval: 60 * 60 * 1000, // 1 hora
  retainExpiredSessions: 24 * 60 * 60 * 1000, // 24 horas
  redis: {
    enabled: true,
    keyPrefix: 'neonpro:session:',
    ttl: 1800 // 30 minutos
  },
  lgpd: {
    enabled: true,
    consentRequired: true,
    dataRetentionDays: 365,
    anonymizeAfterDays: 1095
  }
};
```

## 🔍 Monitoramento e Eventos

### Eventos do Sistema

```typescript
// Escutar eventos de segurança
sessionSystem.on('security_event', (event) => {
  console.log('🚨 Security Event:', event);
  
  if (event.threatLevel === 'high') {
    // Notificar equipe de segurança
    notifySecurityTeam(event);
  }
});

// Atividade suspeita
sessionSystem.on('suspicious_activity', (activity) => {
  if (activity.riskScore > 80) {
    // Terminar sessão automaticamente
    sessionSystem.terminateSession(activity.sessionId, 'high_risk_activity');
  }
});
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm test src/lib/auth/session

# Testes com cobertura
npm run test:coverage src/lib/auth/session
```

## 🚀 Deploy e Migração

### 1. Executar Migração do Banco

```bash
# Via script
node src/lib/auth/session/database/migration.js migrate

# Verificar status
node src/lib/auth/session/database/migration.js status
```

## 📋 Checklist de Implementação

- [x] ✅ Estrutura de tipos TypeScript
- [x] ✅ Gerenciador de sessões principal
- [x] ✅ Monitor de segurança
- [x] ✅ Gerenciador de dispositivos
- [x] ✅ Sistema de auditoria
- [x] ✅ Configurações flexíveis
- [x] ✅ Utilitários e helpers
- [x] ✅ Schema do banco de dados
- [x] ✅ Scripts de migração
- [x] ✅ Exemplos de implementação
- [x] ✅ Testes unitários
- [x] ✅ Documentação completa

---

**Desenvolvido com foco em segurança, performance e conformidade para o NeonPro** 🔐
