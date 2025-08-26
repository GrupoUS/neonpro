# 🛡️ NeonPro Security Module

## Visão Geral

Este módulo implementa um sistema completo de segurança de sessão para o NeonPro, incluindo proteção
CSRF, anti-hijacking, gerenciamento de timeout e controle de sessões concorrentes.

## 📁 Estrutura do Módulo

```
lib/security/
├── csrf-protection.ts              # Proteção CSRF
├── session-hijacking-protection.ts  # Anti-hijacking
├── session-timeout-manager.ts       # Gerenciamento de timeout
├── integrated-session-security.ts   # Integração unificada
├── session-security-middleware.ts   # Middleware global
├── hooks/
│   └── useSessionSecurity.ts        # Hooks React
└── README.md                        # Este arquivo
```

## 🚀 Início Rápido

### 1. Configuração Inicial

```typescript
import { IntegratedSessionSecurity } from "@/lib/security/integrated-session-security";

// Inicializar segurança de sessão
const sessionSecurity = new IntegratedSessionSecurity();

// No login do usuário
const result = await sessionSecurity.initializeSessionSecurity(
  userId,
  sessionId,
  request,
  {
    maxConcurrentSessions: 3,
    timeoutMinutes: 30,
    enableCSRF: true,
    enableHijackingProtection: true,
  },
);
```

### 2. Uso em APIs

```typescript
import { SessionSecurityMiddleware } from "@/lib/security/session-security-middleware";

// Em rotas de API
const middleware = new SessionSecurityMiddleware();
const result = await middleware.checkSecurity(request, userId, sessionId);

if (!result.allowed) {
  return NextResponse.json({ error: result.reason }, { status: 403 });
}
```

### 3. Uso em Componentes React

```typescript
import { useCSRFToken, useSessionSecurity } from '@/lib/security/hooks/useSessionSecurity';

function MyComponent() {
  const { csrfToken } = useCSRFToken(sessionId);
  const { securityStatus, updateActivity } = useSessionSecurity(sessionId);

  // Usar token CSRF em requisições
  const handleSubmit = async (data) => {
    const response = await fetch('/api/protected', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  return (
    <div>
      <p>Status: {securityStatus}</p>
      <button onClick={updateActivity}>Atualizar Atividade</button>
    </div>
  );
}
```

## 🔧 Componentes Principais

### CSRFProtection

**Propósito:** Proteção contra ataques Cross-Site Request Forgery

```typescript
import { CSRFProtection } from "./csrf-protection";

const csrf = new CSRFProtection();

// Gerar token
const token = await csrf.generateToken(sessionId, userAgent, clientIP);

// Validar token
const isValid = await csrf.validateToken(token, sessionId);

// Invalidar tokens
await csrf.invalidateTokensForSession(sessionId);
```

**Configurações:**

- `tokenLength`: Tamanho do token (padrão: 32)
- `expirationHours`: Expiração em horas (padrão: 24)
- `validateUserAgent`: Validar user-agent (padrão: true)
- `validateIP`: Validar IP (padrão: true)

### SessionHijackingProtection

**Propósito:** Detecção e prevenção de sequestro de sessão

```typescript
import { SessionHijackingProtection } from "./session-hijacking-protection";

const hijackingProtection = new SessionHijackingProtection();

// Criar fingerprint
const fingerprint = await hijackingProtection.createFingerprint(
  userId,
  sessionId,
  request,
);

// Verificar sessão
const result = await hijackingProtection.checkSession(
  userId,
  sessionId,
  request,
);

// result.action: 'allow' | 'challenge' | 'block' | 'terminate'
// result.riskScore: 0-10
```

**Risk Score:**

- 0-2: Allow (permitir)
- 3-5: Challenge (desafio adicional)
- 6-7: Block (bloquear temporariamente)
- 8+: Terminate (terminar sessão)

### SessionTimeoutManager

**Propósito:** Gerenciamento inteligente de timeout de sessão

```typescript
import { SessionTimeoutManager } from "./session-timeout-manager";

const timeoutManager = new SessionTimeoutManager();

// Configurar timeout
await timeoutManager.setSessionTimeout(userId, sessionId, {
  timeoutMinutes: 30,
  warningMinutes: [5, 2, 1],
});

// Verificar status
const status = await timeoutManager.checkSessionTimeout(userId, sessionId);

// Estender sessão
await timeoutManager.extendSession(userId, sessionId, 15);
```

**Configurações:**

- `timeoutMinutes`: Timeout em minutos (padrão: 30)
- `warningMinutes`: Avisos antes da expiração (padrão: [5, 2, 1])
- `maxExtensions`: Máximo de extensões (padrão: 3)
- `extendOnActivity`: Estender automaticamente com atividade (padrão: true)

## 🎣 Hooks React

### useSessionSecurity

**Hook principal para gerenciamento de segurança**

```typescript
const {
  isSecurityActive, // boolean: se a segurança está ativa
  securityStatus, // string: status atual da segurança
  lastActivity, // Date: última atividade registrada
  updateActivity, // function: atualizar atividade
  extendSession, // function: estender sessão
  terminateSession, // function: terminar sessão
  error, // string: erro se houver
} = useSessionSecurity(sessionId);
```

### useCSRFToken

**Hook para gerenciamento de tokens CSRF**

```typescript
const {
  csrfToken, // string: token CSRF atual
  isLoading, // boolean: se está carregando
  error, // string: erro se houver
  refreshToken, // function: renovar token
} = useCSRFToken(sessionId);
```

### useSessionTimeout

**Hook para controle de timeout**

```typescript
const {
  timeRemaining, // number: tempo restante em minutos
  warningLevel, // 'none' | 'low' | 'medium' | 'high'
  isExpired, // boolean: se a sessão expirou
  extendTimeout, // function: estender timeout
} = useSessionTimeout(sessionId);
```

## 🔒 Middleware Global

O middleware global (`middleware.ts`) aplica proteções automaticamente:

```typescript
// Rotas protegidas (aplicação automática)
const PROTECTED_ROUTES = [
  "/api/patients",
  "/api/appointments",
  "/api/medical-records",
  "/dashboard",
  "/patients",
  "/appointments",
];

// Rotas isentas
const EXEMPT_ROUTES = ["/api/auth", "/api/public", "/login", "/register"];
```

**Headers de Segurança Aplicados:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 📊 Eventos de Segurança

O sistema registra automaticamente eventos de segurança:

```typescript
// Tipos de eventos
type SecurityEventType =
  | "csrf_validation_failed"
  | "session_hijacking_detected"
  | "session_timeout_warning"
  | "session_terminated"
  | "concurrent_session_limit"
  | "suspicious_activity";

// Consultar eventos
const events = await getSecurityEvents(userId, {
  startDate: new Date("2025-01-01"),
  endDate: new Date(),
  eventTypes: ["session_hijacking_detected"],
});
```

## 🛠️ Configuração Avançada

### Configurações por Usuário

```typescript
// Configurar segurança específica para um usuário
await setUserSecurityConfig(userId, {
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 60,
  enableCSRFProtection: true,
  enableHijackingProtection: true,
  hijackingRiskThreshold: 6,
  enableRateLimiting: true,
  rateLimitRequests: 100,
  rateLimitWindowMinutes: 15,
});
```

### IPs Confiáveis

```typescript
// Adicionar IP confiável
await addTrustedIP(userId, "192.168.1.100", "Office Network");

// Remover IP confiável
await removeTrustedIP(userId, "192.168.1.100");

// Listar IPs confiáveis
const trustedIPs = await getTrustedIPs(userId);
```

### Blacklist de Sessões

```typescript
// Adicionar sessão à blacklist
await addToSessionBlacklist(sessionId, "Suspicious activity detected");

// Verificar se sessão está na blacklist
const isBlacklisted = await isSessionBlacklisted(sessionId);

// Remover da blacklist
await removeFromSessionBlacklist(sessionId);
```

## 🧪 Testes

### Testando Proteção CSRF

```typescript
// Teste de geração de token
const token = await csrf.generateToken(
  "session123",
  "Mozilla/5.0...",
  "192.168.1.1",
);
expect(token).toBeDefined();
expect(token.length).toBe(64); // 32 bytes em hex

// Teste de validação
const isValid = await csrf.validateToken(token, "session123");
expect(isValid).toBe(true);

// Teste de token inválido
const isInvalid = await csrf.validateToken("invalid-token", "session123");
expect(isInvalid).toBe(false);
```

### Testando Session Hijacking

```typescript
// Teste de fingerprint normal
const result1 = await hijackingProtection.checkSession(
  userId,
  sessionId,
  request1,
);
expect(result1.action).toBe("allow");
expect(result1.riskScore).toBeLessThan(3);

// Teste de mudança de IP (risco médio)
const request2 = { ...request1, ip: "10.0.0.1" };
const result2 = await hijackingProtection.checkSession(
  userId,
  sessionId,
  request2,
);
expect(result2.action).toBe("challenge");
expect(result2.riskScore).toBeGreaterThan(3);
```

### Testando Timeout

```typescript
// Teste de configuração de timeout
await timeoutManager.setSessionTimeout(userId, sessionId, {
  timeoutMinutes: 1, // 1 minuto para teste
});

// Aguardar expiração
await new Promise((resolve) => setTimeout(resolve, 61000));

// Verificar se expirou
const status = await timeoutManager.checkSessionTimeout(userId, sessionId);
expect(status.isExpired).toBe(true);
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. Token CSRF não encontrado**

```
Erro: CSRF token not found
Solução: Verificar se o token está sendo gerado corretamente no login
```

**2. Sessão bloqueada por hijacking**

```
Erro: Session blocked due to suspicious activity
Solução: Verificar se o IP/User-Agent mudou, adicionar IP aos confiáveis se necessário
```

**3. Timeout muito agressivo**

```
Erro: Session timeout too frequent
Solução: Aumentar timeoutMinutes ou habilitar extendOnActivity
```

**4. Rate limiting ativado**

```
Erro: Too many requests
Solução: Aguardar o reset da janela ou aumentar os limites
```

### Logs de Debug

```typescript
// Habilitar logs detalhados
process.env.SECURITY_DEBUG = "true";

// Logs serão exibidos no console:
// [SECURITY] CSRF token generated for session: session123
// [SECURITY] Fingerprint created with risk score: 2
// [SECURITY] Session timeout set to 30 minutes
```

## 📈 Performance

### Métricas Esperadas

- **Geração de token CSRF**: < 50ms
- **Validação de token CSRF**: < 30ms
- **Criação de fingerprint**: < 100ms
- **Verificação de hijacking**: < 80ms
- **Verificação de timeout**: < 20ms
- **Middleware overhead**: < 10ms

### Otimizações

1. **Cache de fingerprints**: Fingerprints são cacheados por 5 minutos
2. **Batch cleanup**: Limpeza de dados expirados em lotes
3. **Índices de banco**: Índices otimizados para consultas frequentes
4. **Rate limiting inteligente**: Limites adaptativos baseados no comportamento

## 🔄 Manutenção

### Limpeza Automática

O sistema executa limpeza automática:

- **Tokens CSRF expirados**: A cada hora
- **Atividades antigas**: Diariamente (>30 dias)
- **Eventos de segurança**: Semanalmente (>90 dias)
- **Rate limits expirados**: A cada inserção

### Monitoramento

```typescript
// Relatório de segurança do usuário
const summary = await getUserSessionSecuritySummary(userId);

console.log({
  activeSessions: summary.active_sessions,
  securityEvents: summary.security_events_count,
  lastActivity: summary.last_activity,
  riskLevel: summary.risk_level,
});
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação completa em `/docs/STORY_1_5_SESSION_SECURITY_IMPLEMENTATION.md`
2. Verifique os logs de segurança no banco de dados
3. Use o componente de demo em `/security-demo` para testes
4. Consulte os eventos de segurança para diagnóstico

**Implementado por:** APEX Master Developer\
**Versão:** 1.0\
**Última atualização:** Janeiro 2025
