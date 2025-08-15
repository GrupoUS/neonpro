# NeonPro Backup System - Developer Guide

## Story 1.8: Sistema de Backup e Recovery

This guide provides comprehensive information for developers working with the NeonPro Backup & Recovery System.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [API Reference](#api-reference)
4. [Integration Examples](#integration-examples)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)

## 🏗️ Architecture Overview

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  BackupManager  │────│ StorageManager  │────│ SchedulerService│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│MonitoringService│    │ RecoveryService │    │   AuditLogger   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Configuration**: Backup configurations are stored in Supabase
2. **Scheduling**: Cron jobs trigger backups based on schedules
3. **Execution**: BackupManager coordinates the backup process
4. **Storage**: Files are uploaded to configured storage providers
5. **Monitoring**: Real-time metrics and alerts are generated
6. **Recovery**: On-demand restoration from backup points

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd neonpro/lib/backup

# Run setup script
node setup.js

# Or manual setup
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Basic Usage

```typescript
import { BackupSystem } from './lib/backup';

// Initialize the backup system
const backupSystem = new BackupSystem();
await backupSystem.initialize();

// Create a backup configuration
const config = await backupSystem.manager.createConfig({
  name: 'Daily Database Backup',
  type: 'FULL',
  source_type: 'DATABASE',
  source_config: {
    connection_string: process.env.DATABASE_URL,
  },
  storage_provider: 'LOCAL',
  storage_config: {
    path: './backups',
  },
  schedule_frequency: 'DAILY',
  schedule_time: '02:00',
  enabled: true,
});

// Run a manual backup
const backup = await backupSystem.manager.runManualBackup(config.id);
console.log('Backup started:', backup.id);
```

## 📚 API Reference

### BackupManager

#### Methods

```typescript
// Configuration Management
createConfig(data: CreateBackupConfigData): Promise<BackupConfig>
updateConfig(id: string, data: UpdateBackupConfigData): Promise<BackupConfig>
deleteConfig(id: string): Promise<void>
getConfig(id: string): Promise<BackupConfig | null>
listConfigs(filters?: ConfigFilters): Promise<BackupConfig[]>

// Backup Operations
runManualBackup(configId: string): Promise<BackupRecord>
runQuickBackup(type: BackupType, source: string): Promise<BackupRecord>
cancelBackup(backupId: string): Promise<void>
getBackupStatus(backupId: string): Promise<BackupRecord | null>
listBackups(filters?: BackupFilters): Promise<BackupRecord[]>

// Metrics and Monitoring
getMetrics(): Promise<BackupMetrics>
getSystemHealth(): Promise<SystemHealth>
```

### StorageManager

```typescript
// Storage Operations
upload(provider: StorageProvider, key: string, data: Buffer): Promise<UploadResult>
download(provider: StorageProvider, key: string): Promise<Buffer>
delete(provider: StorageProvider, key: string): Promise<void>
list(provider: StorageProvider, prefix?: string): Promise<StorageItem[]>
exists(provider: StorageProvider, key: string): Promise<boolean>

// Provider Management
addProvider(config: StorageProviderConfig): Promise<void>
removeProvider(providerId: string): Promise<void>
testConnection(providerId: string): Promise<ConnectionTestResult>
```

### RecoveryService

```typescript
// Recovery Operations
createRecovery(request: CreateRecoveryRequest): Promise<RecoveryRequest>
cancelRecovery(recoveryId: string): Promise<void>
getRecoveryStatus(recoveryId: string): Promise<RecoveryRequest | null>
listRecoveries(filters?: RecoveryFilters): Promise<RecoveryRequest[]>

// Recovery Points
listRecoveryPoints(configId: string): Promise<RecoveryPoint[]>
validateRecoveryPoint(backupId: string): Promise<ValidationResult>
```

## 🔧 Integration Examples

### React Component Integration

```typescript
import { useBackupSystem } from '@/hooks/use-backup-system';
import { BackupDashboard } from '@/components/backup/backup-dashboard';

function MyBackupPage() {
  const {
    configs,
    backups,
    metrics,
    createConfig,
    runManualBackup
  } = useBackupSystem();

  const handleCreateBackup = async () => {
    const config = await createConfig({
      name: 'My Backup',
      type: 'INCREMENTAL',
      source_type: 'FILES',
      source_config: { paths: ['/app/data'] },
      storage_provider: 'LOCAL'
    });

    await runManualBackup(config.id);
  };

  return (
    <div>
      <BackupDashboard />
      <button onClick={handleCreateBackup}>
        Create Backup
      </button>
    </div>
  );
}
```

### API Route Integration (Next.js)

```typescript
// pages/api/backup/[...slug].ts
import { BackupSystem } from '@/lib/backup';

const backupSystem = new BackupSystem();

export default async function handler(req, res) {
  const { slug } = req.query;
  const [action, id] = slug;

  switch (action) {
    case 'create':
      const config = await backupSystem.manager.createConfig(req.body);
      res.json(config);
      break;

    case 'run':
      const backup = await backupSystem.manager.runManualBackup(id);
      res.json(backup);
      break;

    case 'status':
      const status = await backupSystem.manager.getBackupStatus(id);
      res.json(status);
      break;

    default:
      res.status(404).json({ error: 'Not found' });
  }
}
```

### Webhook Integration

```typescript
// Webhook for backup completion notifications
import { BackupSystem } from '@/lib/backup';

const backupSystem = new BackupSystem();

// Listen for backup events
backupSystem.on('backup:completed', async (backup) => {
  // Send notification
  await fetch('https://hooks.slack.com/your-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Backup ${backup.id} completed successfully!`,
    }),
  });
});

backupSystem.on('backup:failed', async (backup, error) => {
  // Send alert
  await fetch('https://hooks.slack.com/your-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Backup ${backup.id} failed: ${error.message}`,
    }),
  });
});
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="BackupManager"

# Run tests with coverage
npm test -- --coverage
```

### Integration Tests

```typescript
// tests/integration/backup-flow.test.ts
import { BackupSystem } from '../src';

describe('Backup Flow Integration', () => {
  let backupSystem: BackupSystem;

  beforeAll(async () => {
    backupSystem = new BackupSystem();
    await backupSystem.initialize();
  });

  test('should create and run backup', async () => {
    const config = await backupSystem.manager.createConfig({
      name: 'Test Backup',
      type: 'FULL',
      source_type: 'FILES',
      source_config: { paths: ['./test-data'] },
      storage_provider: 'LOCAL',
    });

    const backup = await backupSystem.manager.runManualBackup(config.id);
    expect(backup.status).toBe('RUNNING');

    // Wait for completion
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const completed = await backupSystem.manager.getBackupStatus(backup.id);
    expect(completed.status).toBe('COMPLETED');
  });
});
```

### Mock Testing

```typescript
// tests/mocks/storage-provider.mock.ts
export class MockStorageProvider {
  private storage = new Map<string, Buffer>();

  async upload(key: string, data: Buffer): Promise<UploadResult> {
    this.storage.set(key, data);
    return { key, size: data.length, etag: 'mock-etag' };
  }

  async download(key: string): Promise<Buffer> {
    const data = this.storage.get(key);
    if (!data) throw new Error('File not found');
    return data;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
}
```

## 🚀 Deployment

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
DEFAULT_STORAGE_PROVIDER=AWS_S3
MONITORING_ENABLED=true
ALERT_EMAIL_TO=admin@yourcompany.com
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backup-system:
    build: .
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./backups:/app/backups
      - ./logs:/app/logs
    restart: unless-stopped
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neonpro-backup
spec:
  replicas: 1
  selector:
    matchLabels:
      app: neonpro-backup
  template:
    metadata:
      labels:
        app: neonpro-backup
    spec:
      containers:
        - name: backup-system
          image: neonpro/backup-system:latest
          env:
            - name: NODE_ENV
              value: 'production'
            - name: SUPABASE_URL
              valueFrom:
                secretKeyRef:
                  name: backup-secrets
                  key: supabase-url
          volumeMounts:
            - name: backup-storage
              mountPath: /app/backups
      volumes:
        - name: backup-storage
          persistentVolumeClaim:
            claimName: backup-pvc
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Backup Fails with "Permission Denied"

```bash
# Check file permissions
ls -la /path/to/backup/source

# Fix permissions
chmod -R 755 /path/to/backup/source
```

#### 2. Storage Provider Connection Fails

```typescript
// Test storage connection
const result = await backupSystem.storage.testConnection('aws-s3');
if (!result.success) {
  console.error('Connection failed:', result.error);
}
```

#### 3. High Memory Usage During Backup

```typescript
// Reduce chunk size in configuration
const config = {
  performance: {
    chunkSize: 512 * 1024, // 512KB instead of 1MB
    maxConcurrentBackups: 1, // Reduce concurrency
  },
};
```

### Debug Mode

```bash
# Enable debug logging
DEBUG_MODE=true npm start

# Or set log level
LOG_LEVEL=debug npm start
```

### Health Checks

```typescript
// Check system health
const health = await backupSystem.getSystemHealth();
console.log('System status:', health.overall);
console.log('Components:', health.components);
```

## 🤝 Contributing

### Development Setup

```bash
# Fork and clone the repository
git clone <your-fork-url>
cd neonpro/lib/backup

# Install dependencies
npm install

# Set up development environment
cp .env.example .env.development

# Run in development mode
npm run dev
```

### Code Style

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

### Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes and add tests
3. Run the test suite: `npm test`
4. Commit your changes: `git commit -m 'Add my feature'`
5. Push to your fork: `git push origin feature/my-feature`
6. Create a Pull Request

### Testing Guidelines

- Write unit tests for all new functions
- Add integration tests for new features
- Ensure test coverage stays above 80%
- Test with different storage providers
- Test error scenarios and edge cases

---

## 📞 Support

For questions, issues, or contributions:

- 📧 Email: dev@neonpro.com
- 💬 Slack: #backup-system
- 🐛 Issues: GitHub Issues
- 📖 Docs: [Documentation Site](https://docs.neonpro.com/backup)

---

**Story 1.8: Sistema de Backup e Recovery** - Developed with ❤️ by the NeonPro Team
