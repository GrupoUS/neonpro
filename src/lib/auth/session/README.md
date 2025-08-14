# 🔐 Session Management & Security System

## 📋 Visão Geral

Sistema completo de gerenciamento de sessões inteligente com monitoramento de segurança avançado para o NeonPro. Oferece controle de acesso seguro, prevenção contra acesso não autorizado e conformidade total com a LGPD.

## ✨ Funcionalidades Principais

### 🎯 Gerenciamento de Sessões
- **Timeout Inteligente**: Renovação automática baseada em atividade
- **Controle de Sessões Concorrentes**: Limite configurável por usuário
- **Rastreamento por Dispositivo**: Identificação única de dispositivos
- **Sincronização Multi-dispositivo**: Estado consistente entre dispositivos
- **Preservação de Sessão**: Recuperação após desconexões temporárias

### 🛡️ Segurança Avançada
- **Detecção de Atividade Suspeita**: Análise comportamental em tempo real
- **Monitoramento de Segurança**: Eventos e alertas automáticos
- **Fingerprinting de Dispositivos**: Identificação única e segura
- **Geolocalização Inteligente**: Detecção de acessos impossíveis
- **Blacklist de IPs**: Bloqueio automático de endereços suspeitos

### 📊 Auditoria e Conformidade
- **Trilha de Auditoria Completa**: Registro detalhado de todas as atividades
- **Conformidade LGPD**: Gestão de consentimentos e retenção de dados
- **Relatórios de Segurança**: Análises e estatísticas detalhadas
- **Anonimização Automática**: Proteção de dados sensíveis

## 🏗️ Arquitetura

```
src/lib/auth/session/
├── types.ts              # Definições de tipos TypeScript
├── session-manager.ts    # Gerenciador principal de sessões
├── security-monitor.ts   # Monitor de segurança e detecção
├── device-manager.ts     # Gerenciamento de dispositivos
├── audit-logger.ts       # Sistema de auditoria e logs
├── config.ts            # Configurações do sistema
├── utils.ts             # Utilitários e helpers
├── index.ts             # Ponto de entrada principal
├── database/
│   └── schema.sql       # Schema do banco de dados
└── __tests__/
    └── session-system.test.ts  # Testes abrangentes
```

## 🚀 Instalação e Configuração

### 1. Dependências

```bash
npm install @supabase/supabase-js redis crypto-js
npm install -D @types/crypto-js
```

### 2. Configuração do Banco de Dados

```sql
-- Execute o schema SQL no Supabase
\i src/lib/auth/session/database/schema.sql
```

### 3. Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (opcional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Segurança
SESSION_SECRET=your_session_secret_key
ENCRYPTION_KEY=your_encryption_key
```

## 💻 Uso Básico

### Inicialização do Sistema

```typescript
import { SessionSystem } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

// Configurar clientes
const supabase = createClient(url, key);
const redis = new Redis(process.env.REDIS_URL);

// Inicializar sistema de sessões
const sessionSystem = new SessionSystem();

await sessionSystem.initialize({
  supabase,
  redis,
  config: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    maxConcurrentSessions: 3,
    enableLocationTracking: true,
    lgpd: {
      enabled: true,
      consentRequired: true,
      dataRetentionDays: 365,
    },
  },
});
```

### Criação de Sessão

```typescript
const result = await sessionSystem.createSession({
  userId: 'user-uuid',
  clinicId: 'clinic-uuid',
  deviceFingerprint: {
    userAgent: req.headers['user-agent'],
    screen: { width: 1920, height: 1080 },
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    platform: 'Win32',
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  location: {
    latitude: -23.5505,
    longitude: -46.6333,
    city: 'São Paulo',
    country: 'Brazil',
  },
});

if (result.success) {
  const { session, deviceRegistered } = result;
  // Configurar cookies/headers com session.sessionToken
}
```

### Validação de Sessão

```typescript
const validation = await sessionSystem.validateSession(sessionToken);

if (validation.valid) {
  const { session, needsRenewal } = validation;
  
  if (needsRenewal) {
    // Renovar sessão automaticamente
    const renewal = await sessionSystem.renewSession(sessionToken);
    if (renewal.success) {
      // Atualizar token no cliente
    }
  }
} else {
  // Redirecionar para login
  console.log('Sessão inválida:', validation.reason);
}
```

### Atualização de Atividade

```typescript
// Atualizar atividade da sessão
const activity = await sessionSystem.updateActivity(sessionToken, {
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  location: geoLocation, // opcional
});

if (activity.securityAlert) {
  // Lidar com alerta de segurança
  console.log('Atividade suspeita detectada:', activity.securityEvent);
}
```

### Término de Sessão

```typescript
// Logout do usuário
const result = await sessionSystem.terminateSession(
  sessionToken,
  'user_logout'
);

// Término de emergência (todas as sessões)
const emergency = await sessionSystem.terminateAllUserSessions(
  userId,
  'security_breach'
);
```

## 🔧 Configuração Avançada

### Políticas de Sessão Personalizadas

```typescript
const customPolicy = {
  name: 'high_security',
  sessionTimeout: 15 * 60 * 1000, // 15 minutos
  maxConcurrentSessions: 1,
  requireDeviceVerification: true,
  enableLocationTracking: true,
  securityLevel: 'high',
  allowedCountries: ['BR'],
  blockedCountries: [],
  ipWhitelist: ['192.168.1.0/24'],
  deviceTrustRequired: true,
};

await sessionSystem.createSessionPolicy(customPolicy);
```

### Monitoramento de Eventos

```typescript
// Escutar eventos de segurança
sessionSystem.on('security_event', (event) => {
  console.log('Evento de segurança:', event);
  
  if (event.threatLevel === 'high') {
    // Notificar administradores
    notifySecurityTeam(event);
  }
});

// Escutar criação de sessões
sessionSystem.on('session_created', (session) => {
  console.log('Nova sessão criada:', session.id);
});

// Escutar atividade suspeita
sessionSystem.on('suspicious_activity', (activity) => {
  console.log('Atividade suspeita:', activity);
  
  if (activity.riskScore > 80) {
    // Bloquear sessão automaticamente
    sessionSystem.terminateSession(activity.sessionId, 'security_risk');
  }
});
```

## 📊 Relatórios e Análises

### Estatísticas de Sessão

```typescript
// Estatísticas gerais
const stats = await sessionSystem.getSessionStatistics({
  clinicId: 'clinic-uuid',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});

console.log('Sessões ativas:', stats.activeSessions);
console.log('Total de logins:', stats.totalLogins);
console.log('Eventos de segurança:', stats.securityEvents);
```

### Relatórios LGPD

```typescript
// Relatório de conformidade LGPD
const lgpdReport = await sessionSystem.generateLGPDReport({
  clinicId: 'clinic-uuid',
  userId: 'user-uuid', // opcional
  period: 'monthly',
});

console.log('Dados processados:', lgpdReport.dataProcessed);
console.log('Consentimentos:', lgpdReport.consents);
console.log('Solicitações de exclusão:', lgpdReport.deletionRequests);
```

### Auditoria de Dispositivos

```typescript
// Dispositivos do usuário
const devices = await sessionSystem.getUserDevices(userId);

devices.forEach(device => {
  console.log(`Dispositivo: ${device.deviceName}`);
  console.log(`Confiável: ${device.isTrusted}`);
  console.log(`Último acesso: ${device.lastSeenAt}`);
  console.log(`Sessões: ${device.sessionCount}`);
});
```

## 🛡️ Segurança e Boas Práticas

### Configurações de Segurança

```typescript
const securityConfig = {
  // Timeouts
  sessionTimeout: 30 * 60 * 1000,
  renewalThreshold: 0.25, // Renovar quando 25% do tempo restante
  
  // Limites
  maxConcurrentSessions: 3,
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
  
  // Detecção
  enableLocationTracking: true,
  enableDeviceFingerprinting: true,
  suspiciousLocationThreshold: 1000, // km
  
  // Criptografia
  tokenRotationInterval: 15 * 60 * 1000,
  encryptSensitiveData: true,
  
  // LGPD
  lgpd: {
    enabled: true,
    consentRequired: true,
    dataRetentionDays: 365,
    anonymizeAfterDays: 1095,
    allowDataExport: true,
    allowDataDeletion: true,
  },
};
```

### Middleware de Autenticação

```typescript
// Middleware Next.js
export async function authMiddleware(req: NextRequest) {
  const sessionToken = req.cookies.get('session_token')?.value;
  
  if (!sessionToken) {
    return NextResponse.redirect('/login');
  }
  
  const validation = await sessionSystem.validateSession(sessionToken);
  
  if (!validation.valid) {
    return NextResponse.redirect('/login');
  }
  
  // Atualizar atividade
  await sessionSystem.updateActivity(sessionToken, {
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent'),
  });
  
  // Adicionar dados do usuário ao request
  req.user = validation.session;
  
  return NextResponse.next();
}
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test src/lib/auth/session

# Testes com cobertura
npm run test:coverage src/lib/auth/session

# Testes de integração
npm run test:integration
```

### Testes Personalizados

```typescript
import { SessionSystem } from '@/lib/auth/session';
import { createTestClient } from '@/lib/test-utils';

describe('Custom Session Tests', () => {
  let sessionSystem: SessionSystem;
  
  beforeEach(async () => {
    sessionSystem = new SessionSystem();
    await sessionSystem.initialize({
      supabase: createTestClient(),
      config: testConfig,
    });
  });
  
  it('should handle concurrent sessions', async () => {
    // Teste personalizado
  });
});
```

## 📈 Monitoramento e Performance

### Métricas Importantes

- **Tempo de Resposta**: < 100ms para validação de sessão
- **Taxa de Renovação**: Automática quando necessário
- **Detecção de Fraude**: < 1% falsos positivos
- **Disponibilidade**: 99.9% uptime
- **Conformidade LGPD**: 100% dos requisitos atendidos

### Alertas Configuráveis

```typescript
// Configurar alertas
sessionSystem.configureAlerts({
  highRiskSessions: {
    threshold: 80,
    action: 'terminate',
    notify: ['security@clinic.com'],
  },
  suspiciousLocations: {
    threshold: 1000, // km
    action: 'flag',
    notify: ['admin@clinic.com'],
  },
  multipleFailedAttempts: {
    threshold: 5,
    action: 'lockout',
    duration: 15 * 60 * 1000,
  },
});
```

## 🔄 Manutenção

### Limpeza Automática

```typescript
// Configurar limpeza automática
sessionSystem.scheduleCleanup({
  expiredSessions: '0 0 * * *', // Diário à meia-noite
  oldAuditLogs: '0 0 1 * *',   // Mensal
  anonymizeData: '0 0 1 1 *',  // Anual
});
```

### Backup e Recuperação

```typescript
// Backup de dados de sessão
const backup = await sessionSystem.createBackup({
  includeAuditLogs: true,
  includeDeviceData: true,
  encryptBackup: true,
});

// Restaurar backup
await sessionSystem.restoreBackup(backup, {
  validateIntegrity: true,
  preserveExisting: false,
});
```

## 📞 Suporte

Para dúvidas, problemas ou sugestões:

- **Documentação**: Consulte este README e os comentários no código
- **Testes**: Execute os testes para verificar funcionalidade
- **Logs**: Verifique os logs de auditoria para debugging
- **Monitoramento**: Use as métricas e alertas configurados

## 📄 Licença

Este sistema é parte do NeonPro e está sujeito aos termos de licença do projeto principal.

---

**🔐 Session Management & Security System - Segurança e conformidade garantidas para o NeonPro**
