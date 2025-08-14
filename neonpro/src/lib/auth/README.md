# 🔐 Sistema de Autenticação e Segurança Avançado

## 📋 Visão Geral

Sistema completo de autenticação e segurança para aplicações web modernas, implementando gerenciamento de sessões, monitoramento de segurança em tempo real, controle de dispositivos e detecção de ameaças.

## 🏗️ Arquitetura do Sistema

```
src/lib/auth/
├── 📁 core/                    # Módulos principais
│   ├── session-manager.ts      # Gerenciamento de sessões
│   ├── security-monitor.ts     # Monitoramento de segurança
│   ├── device-manager.ts       # Controle de dispositivos
│   ├── types.ts               # Definições de tipos
│   └── index.ts               # Exportações principais
├── 📁 components/              # Componentes React
│   ├── SessionStatus.tsx      # Status da sessão
│   ├── SecurityAlerts.tsx     # Alertas de segurança
│   ├── DeviceManager.tsx      # Gerenciador de dispositivos
│   ├── SessionMetrics.tsx     # Métricas de sessão
│   ├── types.ts               # Tipos dos componentes
│   └── index.ts               # Exportações dos componentes
├── 📁 middleware/              # Middlewares
│   ├── auth-middleware.ts      # Middleware de autenticação
│   ├── security-middleware.ts  # Middleware de segurança
│   └── index.ts               # Exportações dos middlewares
├── 📁 api/                     # Rotas da API
│   ├── session-routes.ts       # Rotas de sessão
│   ├── security-routes.ts      # Rotas de segurança
│   ├── device-routes.ts        # Rotas de dispositivos
│   └── index.ts               # Exportações das rotas
├── 📁 tests/                   # Testes
│   ├── session-manager.test.ts # Testes do SessionManager
│   ├── security-monitor.test.ts# Testes do SecurityMonitor
│   ├── device-manager.test.ts  # Testes do DeviceManager
│   └── index.ts               # Utilitários de teste
└── README.md                   # Esta documentação
```

## 🚀 Funcionalidades Principais

### 🔑 Gerenciamento de Sessões
- ✅ Criação e validação de sessões seguras
- ✅ Controle de sessões concorrentes
- ✅ Extensão automática de sessões
- ✅ Timeout configurável
- ✅ Rastreamento de atividade
- ✅ Métricas de sessão em tempo real

### 🛡️ Monitoramento de Segurança
- ✅ Detecção de ameaças em tempo real
- ✅ Alertas de segurança automáticos
- ✅ Análise de comportamento anômalo
- ✅ Bloqueio automático de IPs suspeitos
- ✅ Limitação de taxa (Rate Limiting)
- ✅ Relatórios de segurança

### 📱 Controle de Dispositivos
- ✅ Registro e validação de dispositivos
- ✅ Fingerprinting de dispositivos
- ✅ Sistema de confiança de dispositivos
- ✅ Bloqueio/desbloqueio de dispositivos
- ✅ Análise de dispositivos
- ✅ Rastreamento de localização

### 🔒 Middlewares de Segurança
- ✅ Autenticação baseada em token
- ✅ Controle de acesso por função (RBAC)
- ✅ Verificação de MFA
- ✅ Detecção de SQL Injection
- ✅ Proteção contra XSS
- ✅ Cabeçalhos de segurança

## 📦 Instalação e Configuração

### 1. Importação dos Módulos

```typescript
import {
  SessionManager,
  SecurityMonitor,
  DeviceManager,
  createAuthMiddleware,
  createSecurityMiddleware,
} from '@/lib/auth';
```

### 2. Configuração Básica

```typescript
// Configuração de segurança
const securityConfig = {
  enableRealTimeMonitoring: true,
  threatDetectionLevel: 'medium',
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
  enableGeolocationTracking: true,
  enableDeviceFingerprinting: true,
};

// Configuração de sessão
const sessionConfig = {
  maxSessions: 5,
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  requireMFA: false,
  requireTrustedDevice: false,
  allowConcurrentSessions: true,
};

// Inicialização dos managers
const securityMonitor = new SecurityMonitor(securityConfig);
const sessionManager = new SessionManager(sessionConfig, securityMonitor);
const deviceManager = new DeviceManager();
```

### 3. Configuração de Middlewares

```typescript
// Middleware de autenticação
const authMiddleware = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ['user', 'admin'],
  requireMFA: false,
  requireTrustedDevice: false,
  logSecurityEvents: true,
});

// Middleware de segurança
const securityMiddleware = createSecurityMiddleware({
  enableThreatDetection: true,
  enableAnomalyDetection: true,
  enableRateLimiting: true,
  addSecurityHeaders: true,
});
```

## 🔧 Uso dos Componentes

### SessionStatus Component

```tsx
import { SessionStatus } from '@/lib/auth/components';

function App() {
  return (
    <SessionStatus
      sessionId="session-123"
      showExtendButton={true}
      showTerminateButton={true}
      autoRefresh={true}
      refreshInterval={30000}
      onSessionExpired={() => console.log('Session expired')}
      onSessionExtended={() => console.log('Session extended')}
    />
  );
}
```

### SecurityAlerts Component

```tsx
import { SecurityAlerts } from '@/lib/auth/components';

function SecurityDashboard() {
  return (
    <SecurityAlerts
      userId="user-123"
      showFilters={true}
      autoRefresh={true}
      refreshInterval={10000}
      maxAlerts={50}
      onAlertDismissed={(alertId) => console.log('Alert dismissed:', alertId)}
    />
  );
}
```

### DeviceManager Component

```tsx
import { DeviceManager } from '@/lib/auth/components';

function DeviceManagement() {
  return (
    <DeviceManager
      userId="user-123"
      showTrustActions={true}
      showBlockActions={true}
      showRemoveActions={true}
      autoRefresh={true}
      onDeviceUpdated={(device) => console.log('Device updated:', device)}
    />
  );
}
```

### SessionMetrics Component

```tsx
import { SessionMetrics } from '@/lib/auth/components';

function Analytics() {
  return (
    <SessionMetrics
      userId="user-123"
      showCharts={true}
      showExportButton={true}
      defaultPeriod="7d"
      autoRefresh={true}
      refreshInterval={60000}
    />
  );
}
```

## 🛠️ API Routes

### Rotas de Sessão

```typescript
// GET /api/auth/sessions/:sessionId
// POST /api/auth/sessions
// PUT /api/auth/sessions/:sessionId/activity
// PUT /api/auth/sessions/:sessionId/extend
// DELETE /api/auth/sessions/:sessionId
// GET /api/auth/users/:userId/sessions
// DELETE /api/auth/users/:userId/sessions
// POST /api/auth/sessions/validate
// GET /api/auth/sessions/metrics
// DELETE /api/auth/sessions/cleanup
```

### Rotas de Segurança

```typescript
// GET /api/auth/security/alerts
// POST /api/auth/security/events
// PUT /api/auth/security/alerts/:alertId/dismiss
// GET /api/auth/security/metrics
// POST /api/auth/security/report-suspicious
// GET /api/auth/security/risk-assessment
// POST /api/auth/security/block-ip
// DELETE /api/auth/security/unblock-ip/:ip
// GET /api/auth/security/blocked-ips
// GET /api/auth/security/reports
```

### Rotas de Dispositivos

```typescript
// POST /api/auth/devices/register
// GET /api/auth/devices/:deviceId
// GET /api/auth/users/:userId/devices
// PUT /api/auth/devices/:deviceId/trust
// PUT /api/auth/devices/:deviceId/block
// PUT /api/auth/devices/:deviceId
// DELETE /api/auth/devices/:deviceId
// POST /api/auth/devices/validate
// GET /api/auth/devices/analytics
```

## 🧪 Testes

### Executar Testes

```bash
# Executar todos os testes
npm test src/lib/auth/tests/

# Executar testes específicos
npm test src/lib/auth/tests/session-manager.test.ts
npm test src/lib/auth/tests/security-monitor.test.ts
npm test src/lib/auth/tests/device-manager.test.ts

# Executar com coverage
npm test -- --coverage src/lib/auth/
```

### Utilitários de Teste

```typescript
import { TestUtils, IntegrationTestUtils } from '@/lib/auth/tests';

// Criar dados mock
const mockSession = TestUtils.createMockSessionData();
const mockDevice = TestUtils.createMockDeviceRegistration();
const mockEvent = TestUtils.createMockSecurityEvent();

// Configurar sistema completo para testes de integração
const authSystem = await IntegrationTestUtils.setupAuthSystem();

// Simular fluxo de usuário
const workflow = await IntegrationTestUtils.simulateUserWorkflow(
  authSystem,
  'test-user-123'
);
```

## 🔒 Configurações de Segurança

### Níveis de Detecção de Ameaças

- **low**: Detecção básica de ameaças
- **medium**: Detecção moderada com alertas
- **high**: Detecção avançada com bloqueios automáticos
- **critical**: Máxima segurança com bloqueios imediatos

### Configurações de Rate Limiting

```typescript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,    // 15 minutos
  maxRequests: 100,            // Máximo de 100 requisições
  blockDuration: 60 * 60 * 1000, // Bloqueio por 1 hora
};
```

### Configurações de Alertas

```typescript
const alertThresholds = {
  low: 1,      // 1 evento para alerta baixo
  medium: 3,   // 3 eventos para alerta médio
  high: 5,     // 5 eventos para alerta alto
  critical: 1, // 1 evento para alerta crítico
};
```

## 📊 Métricas e Monitoramento

### Métricas de Sessão
- Total de sessões ativas
- Duração média das sessões
- Taxa de renovação de sessões
- Distribuição geográfica
- Dispositivos mais utilizados

### Métricas de Segurança
- Eventos de segurança por tipo
- Taxa de ameaças detectadas
- IPs bloqueados
- Tentativas de login falhadas
- Pontuação de risco média

### Métricas de Dispositivos
- Dispositivos registrados
- Taxa de confiança média
- Dispositivos bloqueados
- Distribuição por tipo/plataforma

## 🚨 Alertas e Notificações

### Tipos de Alertas
- **Tentativa de login suspeita**
- **Novo dispositivo detectado**
- **Localização anômala**
- **Múltiplas tentativas de login falhadas**
- **Atividade de força bruta**
- **Possível sequestro de sessão**
- **Dispositivo comprometido**

### Severidades
- **info**: Informativo
- **low**: Baixa prioridade
- **medium**: Média prioridade
- **high**: Alta prioridade
- **critical**: Crítica - ação imediata necessária

## 🔧 Configuração Avançada

### Personalização de Fingerprinting

```typescript
const fingerprintConfig = {
  includeUserAgent: true,
  includeScreenResolution: true,
  includeTimezone: true,
  includeLanguage: true,
  includePlugins: false, // Pode impactar performance
  includeFonts: false,   // Pode impactar performance
};
```

### Configuração de Geolocalização

```typescript
const geoConfig = {
  enableTracking: true,
  accuracyThreshold: 100, // metros
  anomalyDistance: 1000,  // km para considerar anômalo
  enableIPGeolocation: true,
  enableGPSTracking: false, // Requer permissão do usuário
};
```

## 📈 Performance e Otimização

### Recomendações
- Use cache Redis para sessões em produção
- Configure limpeza automática de dados expirados
- Implemente paginação para listas grandes
- Use índices de banco de dados apropriados
- Configure rate limiting por IP e usuário

### Monitoramento de Performance

```typescript
// Métricas de performance disponíveis
const metrics = {
  sessionCreationTime: 'Tempo para criar sessão',
  deviceValidationTime: 'Tempo para validar dispositivo',
  securityCheckTime: 'Tempo para verificações de segurança',
  alertProcessingTime: 'Tempo para processar alertas',
};
```

## 🔄 Integração com Outros Sistemas

### Supabase Integration

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Configurar storage para sessões
const sessionStorage = {
  async get(sessionId: string) {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    return data;
  },
  // ... outros métodos
};
```

### Next.js Integration

```typescript
// middleware.ts
import { NextRequest } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  return createAuthMiddleware({
    requireAuth: true,
    allowedRoles: ['user', 'admin'],
  })(request);
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Sessão expira muito rápido**
   - Verifique `sessionTimeout` na configuração
   - Confirme se `extendThreshold` está configurado

2. **Muitos alertas falsos**
   - Ajuste `threatDetectionLevel` para 'low'
   - Revise `alertThresholds`

3. **Dispositivos não são reconhecidos**
   - Verifique se fingerprinting está habilitado
   - Confirme se cookies estão sendo salvos

4. **Rate limiting muito restritivo**
   - Ajuste `maxRequests` e `windowMs`
   - Considere whitelist para IPs confiáveis

### Debug Mode

```typescript
// Habilitar logs detalhados
const debugConfig = {
  enableDebugLogs: true,
  logLevel: 'debug',
  logSecurityEvents: true,
  logPerformanceMetrics: true,
};
```

## 📚 Referências

- [OWASP Security Guidelines](https://owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Device Fingerprinting](https://en.wikipedia.org/wiki/Device_fingerprint)
- [Rate Limiting Strategies](https://en.wikipedia.org/wiki/Rate_limiting)

## 🤝 Contribuição

Para contribuir com este sistema:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente testes para novas funcionalidades
4. Garanta que todos os testes passem
5. Submeta um pull request

## 📄 Licença

Este sistema é parte do projeto NeonPro e segue a licença do projeto principal.

---

**🔐 Sistema de Autenticação e Segurança Avançado - Protegendo sua aplicação com tecnologia de ponta!**