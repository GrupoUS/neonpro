# Mobile API System

Sistema abrangente de APIs otimizadas para aplicações móveis, incluindo sincronização offline, notificações push, cache inteligente, compressão de dados e otimizações de performance.

## 📋 Visão Geral

O Mobile API System é uma solução completa para desenvolvimento de aplicações móveis que precisam de:

- **APIs Otimizadas**: Requisições otimizadas para diferentes condições de rede
- **Sincronização Offline**: Sistema robusto de sync bidirecional com resolução de conflitos
- **Cache Inteligente**: Cache multinível com compressão e criptografia
- **Push Notifications**: Sistema completo de notificações push com analytics
- **Compressão de Dados**: Algoritmos avançados para reduzir tráfego de rede
- **Segurança**: Criptografia, validação de assinatura e sanitização de dados

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                 UnifiedMobileApiManager                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ MobileApiSystem │  │   CacheManager  │  │ OfflineSync  │ │
│  │                 │  │                 │  │   Manager    │ │
│  │ • Authentication│  │ • Multi-level   │  │ • Bi-directional │
│  │ • Request Opt.  │  │ • Compression   │  │ • Conflict Res.  │
│  │ • Rate Limiting │  │ • Encryption    │  │ • Queue Mgmt     │
│  │ • Security      │  │ • TTL Management│  │ • Background     │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ PushNotifications│  │  MobileApiUtils │                  │
│  │    Manager      │  │                 │                  │
│  │                 │  │ • Compression   │                  │
│  │ • FCM/APNS      │  │ • Security      │                  │
│  │ • Device Mgmt   │  │ • Performance   │                  │
│  │ • Analytics     │  │ • Network Utils │                  │
│  │ • Batching      │  │ • Validation    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Uso Básico

### Inicialização

```typescript
import { createMobileApiManager, defaultMobileApiConfig } from '@/lib/mobile-api';

// Configuração personalizada
const config = {
  ...defaultMobileApiConfig,
  api: {
    baseUrl: 'https://api.neonpro.com.br',
    timeout: 30000,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    security: {
      encryptionKey: process.env.ENCRYPTION_KEY!,
      signatureValidation: true,
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000
      }
    }
  },
  pushNotifications: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    fcmServerKey: process.env.FCM_SERVER_KEY!,
    syncNotifications: true
  }
};

// Criar e inicializar o manager
const mobileApi = createMobileApiManager(config);
await mobileApi.initialize();
```

### Fazendo Requisições API

```typescript
// Requisição GET simples
const response = await mobileApi.request({
  endpoint: '/pacientes',
  method: 'GET',
  headers: {},
  cache: {
    enabled: true,
    ttl: 300000 // 5 minutos
  }
});

// Requisição POST com dados
const createResponse = await mobileApi.request({
  endpoint: '/pacientes',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: {
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999'
  },
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6
  },
  security: {
    encryptPayload: true,
    signatureValidation: true
  }
});

// Requisição otimizada para rede lenta
const optimizedResponse = await mobileApi.request({
  endpoint: '/agendamentos',
  method: 'GET',
  headers: {},
  networkCondition: 'slow',
  timeout: 10000,
  retryAttempts: 2,
  cache: { enabled: true }
});
```

### Autenticação

```typescript
// Login
const authResult = await mobileApi.authenticate({
  email: 'usuario@email.com',
  password: 'senha123'
});

if (authResult.success) {
  console.log('Token:', authResult.token);
  console.log('User:', authResult.user);
}

// Refresh token
const refreshResult = await mobileApi.refreshToken();

// Logout
await mobileApi.logout();
```

### Sincronização Offline

```typescript
// Verificar status de sincronização
const syncStatus = mobileApi.getSyncStatus();
console.log('Status:', syncStatus.status);
console.log('Operações pendentes:', syncStatus.pendingOperations);

// Forçar sincronização
const forceSyncResult = await mobileApi.forceSync();
if (forceSyncResult.status === 'completed') {
  console.log('Sincronização concluída com sucesso');
}

// Os dados são automaticamente sincronizados em background
// quando a conectividade é restaurada
```

### Notificações Push

```typescript
// Registrar dispositivo
const deviceRegistration = {
  token: 'fcm-device-token',
  platform: 'android',
  userId: 'user-123',
  preferences: {
    agendamentos: true,
    lembretes: true,
    promocoes: false
  }
};

const registered = await mobileApi.registerDevice(deviceRegistration);

// Enviar notificação
const notificationSent = await mobileApi.sendNotification('device-id', {
  title: 'Lembrete de Consulta',
  body: 'Sua consulta é amanhã às 14:00',
  data: {
    type: 'appointment_reminder',
    appointmentId: 'apt-123'
  }
});
```

## 📊 Monitoramento e Analytics

### Estatísticas do Sistema

```typescript
// Estatísticas gerais
const stats = mobileApi.getStats();
console.log('Total de requisições:', stats.totalRequests);
console.log('Taxa de sucesso:', stats.successfulRequests / stats.totalRequests);
console.log('Tempo médio de resposta:', stats.averageResponseTime);
console.log('Cache hits:', stats.cacheHits);
console.log('Dados transferidos:', stats.dataTransferred);

// Métricas de performance
const performance = mobileApi.getPerformanceMetrics();
console.log('Uso de memória:', performance.memoryUsage);
console.log('Latência de rede:', performance.networkLatency);
console.log('Taxa de acerto do cache:', performance.cacheHitRate);
console.log('Taxa de erro:', performance.errorRate);

// Status de saúde do sistema
const health = mobileApi.getHealthStatus();
console.log('Status geral:', health.overall);
console.log('API:', health.api);
console.log('Cache:', health.cache);
console.log('Sync:', health.sync);
console.log('Notificações:', health.notifications);
```

### Analytics de Cache

```typescript
const cacheStats = mobileApi.getCacheStats();
console.log('Entradas no cache:', cacheStats.entries);
console.log('Taxa de acerto:', cacheStats.hitRate);
console.log('Uso de memória:', cacheStats.memoryUsage);
console.log('Ratio de compressão:', cacheStats.compressionRatio);
```

### Analytics de Notificações

```typescript
const notificationAnalytics = mobileApi.getNotificationAnalytics();
console.log('Notificações enviadas:', notificationAnalytics.totalSent);
console.log('Taxa de entrega:', notificationAnalytics.deliveryRate);
console.log('Taxa de abertura:', notificationAnalytics.openRate);
console.log('Dispositivos ativos:', notificationAnalytics.activeDevices);
```

## 🔧 Configuração Avançada

### Estratégias de Cache

```typescript
const cacheConfig = {
  enabled: true,
  strategy: 'lru', // 'lru', 'fifo', 'lfu'
  maxSize: 50 * 1024 * 1024, // 50MB
  defaultTtl: 3600000, // 1 hora
  compression: {
    enabled: true,
    algorithm: 'gzip', // 'gzip', 'brotli', 'lz4'
    level: 6
  },
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    key: 'your-32-character-encryption-key'
  },
  storage: {
    persistent: true,
    indexedDB: true,
    localStorage: true
  }
};
```

### Configuração de Sincronização Offline

```typescript
const offlineSyncConfig = {
  enabled: true,
  syncInterval: 300000, // 5 minutos
  maxRetries: 3,
  conflictResolution: 'server-wins', // 'server-wins', 'client-wins', 'merge'
  batchSize: 50,
  backgroundSync: true,
  syncOnReconnect: true,
  dataIntegrity: {
    checksums: true,
    validation: true
  }
};
```

### Configuração de Compressão

```typescript
const compressionConfig = {
  enabled: true,
  algorithm: 'gzip', // 'gzip', 'brotli', 'lz4'
  level: 6, // 1-9 para gzip/brotli, 1-16 para lz4
  threshold: 1024, // Comprimir apenas dados > 1KB
  mimeTypes: [
    'application/json',
    'text/plain',
    'text/html',
    'application/javascript'
  ]
};
```

### Rate Limiting

```typescript
const rateLimitConfig = {
  enabled: true,
  maxRequests: 100,
  windowMs: 60000, // 1 minuto
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
  keyGenerator: (request) => {
    return `${request.endpoint}:${request.method}`;
  }
};
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Supabase

```sql
-- Sessões de API mobile
CREATE TABLE mobile_api_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  app_version TEXT,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados de sincronização offline
CREATE TABLE offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  operation_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  data JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  priority TEXT DEFAULT 'medium',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Dispositivos para push notifications
CREATE TABLE push_notification_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_token TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  app_version TEXT,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de notificações
CREATE TABLE push_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES push_notification_devices(id),
  notification_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  error_message TEXT
);

-- Métricas de API mobile
CREATE TABLE mobile_api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  data_size INTEGER,
  from_cache BOOLEAN DEFAULT false,
  network_condition TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices para Performance

```sql
-- Índices para sessões
CREATE INDEX idx_mobile_sessions_user_id ON mobile_api_sessions(user_id);
CREATE INDEX idx_mobile_sessions_device_id ON mobile_api_sessions(device_id);
CREATE INDEX idx_mobile_sessions_expires_at ON mobile_api_sessions(expires_at);

-- Índices para sync queue
CREATE INDEX idx_sync_queue_user_id ON offline_sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON offline_sync_queue(status);
CREATE INDEX idx_sync_queue_timestamp ON offline_sync_queue(timestamp);
CREATE INDEX idx_sync_queue_priority ON offline_sync_queue(priority);

-- Índices para dispositivos
CREATE INDEX idx_push_devices_user_id ON push_notification_devices(user_id);
CREATE INDEX idx_push_devices_token ON push_notification_devices(device_token);
CREATE INDEX idx_push_devices_active ON push_notification_devices(is_active);

-- Índices para métricas
CREATE INDEX idx_api_metrics_user_id ON mobile_api_metrics(user_id);
CREATE INDEX idx_api_metrics_endpoint ON mobile_api_metrics(endpoint);
CREATE INDEX idx_api_metrics_timestamp ON mobile_api_metrics(timestamp);
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test mobile-api

# Executar testes específicos
npm test mobile-api-system.test.ts
npm test cache-manager.test.ts
npm test offline-sync.test.ts
npm test push-notifications.test.ts
npm test utils.test.ts

# Executar testes com coverage
npm test mobile-api -- --coverage
```

## 📈 Performance e Otimizações

### Benchmarks

- **Requisições API**: < 100ms (rede rápida), < 500ms (rede lenta)
- **Cache Hit Rate**: > 80% para dados frequentemente acessados
- **Compressão**: 60-80% redução no tamanho dos dados
- **Sincronização**: < 5s para 100 operações pendentes
- **Notificações**: < 2s para entrega (FCM/APNS)

### Otimizações Implementadas

1. **Request Batching**: Agrupa múltiplas requisições
2. **Intelligent Caching**: Cache multinível com TTL dinâmico
3. **Data Compression**: Algoritmos adaptativos baseados no conteúdo
4. **Network Adaptation**: Otimizações baseadas na condição da rede
5. **Background Sync**: Sincronização não-bloqueante
6. **Memory Management**: Limpeza automática e otimização de memória

## 🔍 Troubleshooting

### Problemas Comuns

#### Cache não funcionando
```typescript
// Verificar configuração
const cacheStats = mobileApi.getCacheStats();
if (!cacheStats.enabled) {
  console.log('Cache está desabilitado');
}

// Limpar cache corrompido
await mobileApi.clearCache();
```

#### Sincronização offline falhando
```typescript
// Verificar status de sync
const syncStatus = mobileApi.getSyncStatus();
if (syncStatus.status === 'error') {
  console.log('Erros de sync:', syncStatus.errors);
  
  // Resetar fila de sync
  await mobileApi.resetSyncQueue();
}
```

#### Notificações não sendo entregues
```typescript
// Verificar analytics
const analytics = mobileApi.getNotificationAnalytics();
if (analytics.deliveryRate < 0.8) {
  console.log('Taxa de entrega baixa:', analytics.deliveryRate);
  
  // Verificar tokens de dispositivo
  // Verificar configuração FCM/APNS
}
```

#### Performance degradada
```typescript
// Verificar métricas
const performance = mobileApi.getPerformanceMetrics();
if (performance.averageResponseTime > 1000) {
  console.log('Resposta lenta detectada');
  
  // Otimizar cache
  // Verificar compressão
  // Analisar condições de rede
}
```

### Logs e Debugging

```typescript
// Habilitar logs detalhados
const debugConfig = {
  ...config,
  debug: true,
  logLevel: 'verbose'
};

// Monitorar eventos do sistema
mobileApi.on('requestCompleted', (metrics) => {
  console.log('Request metrics:', metrics);
});

mobileApi.on('cacheHit', (key) => {
  console.log('Cache hit:', key);
});

mobileApi.on('syncCompleted', (status) => {
  console.log('Sync completed:', status);
});
```

## 📚 Referências

- [Supabase Documentation](https://supabase.com/docs)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [APNS Documentation](https://developer.apple.com/documentation/usernotifications)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## 🤝 Contribuição

Para contribuir com o Mobile API System:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente os testes
4. Garanta que todos os testes passem
5. Submeta um pull request

## 📄 Licença

Este projeto está licenciado sob a MIT License.