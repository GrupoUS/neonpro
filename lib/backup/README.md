# NeonPro Backup & Recovery System

**Story 1.8: Sistema de Backup e Recovery**

Sistema completo de backup automático e recuperação de dados para o NeonPro, incluindo monitoramento em tempo real, alertas inteligentes e disaster recovery.

## 🚀 Características Principais

### ✅ Backup Automático
- **Tipos de Backup**: Full, Incremental, Diferencial, Database, Files
- **Agendamento Flexível**: Horário, Diário, Semanal, Mensal
- **Compressão e Criptografia**: Algoritmos otimizados para segurança e performance
- **Retenção Inteligente**: Políticas automáticas de limpeza

### ✅ Storage Multi-Provider
- **Local Storage**: Armazenamento local com permissões configuráveis
- **AWS S3**: Integração completa com Amazon S3
- **Google Cloud Storage**: Suporte nativo ao GCS
- **Azure Blob Storage**: Compatibilidade com Azure

### ✅ Monitoramento e Alertas
- **Métricas em Tempo Real**: Dashboard com estatísticas atualizadas
- **Sistema de Alertas**: Notificações por email, SMS, push e webhook
- **Health Checks**: Verificação contínua da saúde do sistema
- **Performance Tracking**: Histórico de performance e tendências

### ✅ Recovery Avançado
- **Restore Completo**: Restauração total de backups
- **Restore Parcial**: Recuperação seletiva de arquivos
- **Point-in-Time Recovery**: Restauração para momento específico
- **Verificação de Integridade**: Validação automática de backups

### ✅ Disaster Recovery
- **Planos de DR**: Estratégias predefinidas de recuperação
- **Testes Automatizados**: Validação regular dos backups
- **Replicação**: Cópias em múltiplas localizações
- **RTO/RPO Otimizados**: Tempos de recuperação minimizados

## 📦 Instalação

```bash
# Instalar dependências
npm install @supabase/supabase-js
npm install node-cron
npm install aws-sdk
npm install @google-cloud/storage
npm install @azure/storage-blob
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Storage Local
BACKUP_LOCAL_PATH=./backups

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-backup-bucket

# Google Cloud (opcional)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_BUCKET=your-backup-bucket
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Azure (opcional)
AZURE_STORAGE_ACCOUNT=your_storage_account
AZURE_STORAGE_KEY=your_storage_key
AZURE_CONTAINER=your-backup-container

# Criptografia
BACKUP_ENCRYPTION_KEY=your_32_character_encryption_key
```

### Schema do Banco de Dados

Execute o arquivo `database/schema.sql` no seu banco Supabase para criar as tabelas necessárias.

## 🔧 Uso Básico

### Inicialização do Sistema

```typescript
import { BackupSystem, initializeBackupSystem } from './lib/backup';

// Inicializar sistema
const result = await initializeBackupSystem({
  provider: 'LOCAL', // ou 'S3', 'GCS', 'AZURE'
  local: {
    basePath: './backups'
  }
});

if (result.success) {
  console.log('Sistema de backup inicializado!');
}
```

### Configuração de Backup

```typescript
import { getBackupSystem, BackupType, BackupFrequency } from './lib/backup';

const backupSystem = getBackupSystem();

// Backup de arquivos
const fileBackup = await backupSystem.setupFileBackup(
  'Documentos Importantes',
  ['/path/to/documents', '/path/to/configs'],
  {
    frequency: BackupFrequency.DAILY,
    time: '02:00',
    excludePatterns: ['*.tmp', '*.log']
  }
);

// Backup de banco de dados
const dbBackup = await backupSystem.setupDatabaseBackup(
  'NeonPro Database',
  'postgresql://user:pass@localhost:5432/neonpro',
  {
    frequency: BackupFrequency.DAILY,
    time: '01:00',
    retention: 30
  }
);
```

### Execução Manual

```typescript
// Executar backup imediatamente
const result = await backupSystem.runBackupNow(configId, 'user-id');

if (result.success) {
  console.log(`Backup iniciado: ${result.data}`);
}
```

### Monitoramento

```typescript
// Obter métricas em tempo real
const metrics = await backupSystem.monitor.getRealTimeMetrics();
console.log('Backups ativos:', metrics.data.activeBackups);
console.log('Taxa de sucesso:', metrics.data.successRate);

// Obter alertas ativos
const alerts = await backupSystem.monitor.getActiveAlerts();
console.log('Alertas:', alerts.data);

// Health check
const health = await backupSystem.monitor.performHealthCheck();
console.log('Status geral:', health.overall);
```

### Recovery

```typescript
// Listar pontos de recuperação
const recoveryPoints = await backupSystem.recover.getRecoveryPoints();

// Solicitar recovery
const recoveryRequest = await backupSystem.recover.createRecoveryRequest(
  backupId,
  'FULL_RESTORE',
  {
    targetPath: '/restore/path',
    overwrite: true,
    priority: 'HIGH'
  },
  'user-id'
);

// Acompanhar progresso
const status = await backupSystem.recover.getRecoveryStatus(recoveryRequest.data.id);
console.log('Progresso:', status.data.progress);
```

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  BackupManager  │────│ StorageManager  │────│ SchedulerService│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐
         │MonitoringService│────│ RecoveryService │
         └─────────────────┘    └─────────────────┘
```

### Fluxo de Backup

1. **Agendamento**: SchedulerService agenda backups baseado na configuração
2. **Execução**: BackupManager executa o backup conforme o tipo
3. **Storage**: StorageManager gerencia upload para o provider configurado
4. **Monitoramento**: MonitoringService acompanha progresso e métricas
5. **Notificação**: Sistema envia alertas conforme configuração

### Fluxo de Recovery

1. **Solicitação**: Usuário solicita recovery através da API
2. **Validação**: Sistema valida integridade e disponibilidade
3. **Execução**: RecoveryService executa restore conforme tipo
4. **Verificação**: Sistema verifica integridade dos dados restaurados
5. **Notificação**: Usuário é notificado sobre conclusão

## 📊 Tipos de Backup

### Full Backup
- Backup completo de todos os dados
- Maior tempo e espaço, mas recovery mais rápido
- Recomendado semanalmente

### Incremental Backup
- Apenas dados alterados desde último backup
- Menor tempo e espaço, recovery mais lento
- Recomendado diariamente

### Differential Backup
- Dados alterados desde último full backup
- Meio termo entre full e incremental
- Recomendado para estratégias híbridas

### Database Backup
- Backup específico para bancos de dados
- Inclui schema, dados e configurações
- Suporte a PostgreSQL, MySQL, MongoDB

### Files Backup
- Backup de arquivos e diretórios
- Suporte a filtros e exclusões
- Preserva permissões e metadados

## 🔐 Segurança

### Criptografia
- **Algoritmo**: AES-256-GCM
- **Chaves**: Rotação automática de chaves
- **Transporte**: TLS 1.3 para uploads
- **Armazenamento**: Chaves separadas dos dados

### Controle de Acesso
- **Autenticação**: Integração com Supabase Auth
- **Autorização**: RLS (Row Level Security)
- **Auditoria**: Log completo de todas as operações
- **Permissões**: Controle granular por usuário/role

### Compliance
- **LGPD**: Anonimização e direito ao esquecimento
- **SOX**: Retenção e integridade de dados
- **HIPAA**: Criptografia e controle de acesso
- **ISO 27001**: Gestão de segurança da informação

## 📈 Monitoramento

### Métricas Disponíveis
- **Backups**: Total, sucessos, falhas, taxa de sucesso
- **Performance**: Tempo médio, throughput, latência
- **Storage**: Uso total, crescimento, distribuição
- **Sistema**: CPU, memória, disco, rede

### Alertas Configuráveis
- **Falhas**: Backup falhou ou demorou muito
- **Espaço**: Pouco espaço em disco
- **Performance**: Degradação de performance
- **Agendamento**: Backup atrasado ou perdido

### Dashboards
- **Tempo Real**: Métricas atualizadas continuamente
- **Histórico**: Tendências e análises temporais
- **Alertas**: Central de alertas e notificações
- **Recovery**: Status e histórico de recoveries

## 🚨 Disaster Recovery

### Estratégias
- **3-2-1 Rule**: 3 cópias, 2 mídias, 1 offsite
- **Hot Standby**: Réplica ativa em tempo real
- **Warm Standby**: Réplica com delay mínimo
- **Cold Standby**: Backup para recuperação manual

### RTO/RPO Targets
- **RTO (Recovery Time Objective)**: < 4 horas
- **RPO (Recovery Point Objective)**: < 1 hora
- **MTTR (Mean Time To Recovery)**: < 2 horas
- **MTBF (Mean Time Between Failures)**: > 720 horas

### Testes de DR
- **Automatizados**: Testes regulares de integridade
- **Manuais**: Simulações de disaster recovery
- **Documentados**: Relatórios de todos os testes
- **Melhorias**: Otimizações baseadas nos resultados

## 🔧 Configurações Avançadas

### Performance Tuning

```typescript
const config = {
  performance: {
    maxConcurrentBackups: 3,
    compressionLevel: 9,
    chunkSize: 2097152, // 2MB
    timeout: 7200, // 2 horas
    retryAttempts: 3,
    retryDelay: 30000 // 30 segundos
  }
};
```

### Retenção Customizada

```typescript
const retention = {
  daily: 14,    // 14 dias
  weekly: 8,    // 8 semanas
  monthly: 24,  // 24 meses
  yearly: 10,   // 10 anos
  custom: [
    { pattern: 'first-of-month', keep: 60 },
    { pattern: 'last-of-year', keep: 'forever' }
  ]
};
```

### Filtros Avançados

```typescript
const filters = {
  includePatterns: [
    '**/*.sql',
    '**/*.json',
    'config/**'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/tmp/**',
    '**/*.log'
  ],
  sizeLimit: 1073741824, // 1GB
  modifiedSince: '2024-01-01'
};
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Backup Falha
```bash
# Verificar logs
tail -f /var/log/neonpro/backup.log

# Verificar espaço em disco
df -h

# Verificar permissões
ls -la /backup/path
```

#### Recovery Lento
```bash
# Verificar rede
ping storage-provider.com

# Verificar I/O
iostat -x 1

# Verificar CPU
top -p backup-process-pid
```

#### Alertas Falsos
```typescript
// Ajustar thresholds
const alertConfig = {
  failureRate: 0.05, // 5%
  maxBackupTime: 7200, // 2 horas
  minFreeSpace: 5368709120 // 5GB
};
```

### Logs e Debugging

```typescript
// Habilitar debug
process.env.DEBUG = 'backup:*';

// Logs estruturados
const logger = {
  level: 'debug',
  format: 'json',
  transports: [
    { type: 'file', filename: 'backup.log' },
    { type: 'console', colorize: true }
  ]
};
```

## 📚 API Reference

### BackupManager
- `createConfig(config, userId)` - Criar configuração
- `updateConfig(id, config, userId)` - Atualizar configuração
- `deleteConfig(id, userId)` - Deletar configuração
- `executeBackup(configId, userId)` - Executar backup
- `listBackups(filters, pagination)` - Listar backups

### StorageManager
- `upload(path, data, options)` - Upload de arquivo
- `download(path, options)` - Download de arquivo
- `delete(path)` - Deletar arquivo
- `list(prefix)` - Listar arquivos
- `exists(path)` - Verificar existência

### MonitoringService
- `getRealTimeMetrics()` - Métricas em tempo real
- `calculateMetrics(period)` - Calcular métricas
- `getActiveAlerts()` - Alertas ativos
- `createAlert(type, severity, message)` - Criar alerta
- `performHealthCheck()` - Health check

### RecoveryService
- `createRecoveryRequest(backupId, type, options)` - Solicitar recovery
- `getRecoveryStatus(requestId)` - Status do recovery
- `cancelRecovery(requestId, userId)` - Cancelar recovery
- `getRecoveryPoints(configId)` - Pontos de recuperação

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte, envie um email para backup-support@neonpro.com ou abra uma issue no GitHub.

---

**NeonPro Backup & Recovery System** - Proteção completa para seus dados críticos 🛡️
