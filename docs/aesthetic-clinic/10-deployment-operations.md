# Deployment & Operations Guide

## 🚀 Deployment Architecture

The aesthetic clinic system implements a robust deployment strategy ensuring high availability, scalability, and compliance with healthcare data protection requirements across all environments.

## 🏗️ Deployment Architecture

### Environment Structure
```
Production: Highly available, multi-region deployment with full compliance
Staging: Production-identical for testing and validation
Development: Feature development and testing
CI/CD: Automated testing and deployment pipelines
```

## 🌍 Environment Configuration

### Environment Variables Setup
```bash
# .env.production
# Core Infrastructure
NODE_ENV=production
PORT=3001
DEPLOY_ENV=production

# Database Configuration
DATABASE_URL="postgresql://user:password@prod-db.cluster.amazonaws.com:5432/neonpro?sslmode=require"
DATABASE_REPLICA_URL="postgresql://user:password@prod-replica.cluster.amazonaws.com:5432/neonpro?sslmode=require"
REDIS_URL="redis://prod-redis.amazonaws.com:6379/0"

# Security & Encryption
JWT_SECRET="${JWT_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY_32_BYTES}"
API_KEY_HASH_SALT="${API_KEY_HASH_SALT}"

# Healthcare Compliance
COMPLIANCE_ENV=production
ANVISA_API_KEY="${ANVISA_API_KEY}"
CFM_API_KEY="${CFM_API_KEY}"
LGPD_DATA_RETENTION_DAYS=2555

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN="${SENTRY_DSN}"
DATADOG_API_KEY="${DATADOG_API_KEY}"
PROMETHEUS_ENDPOINT="https://prometheus.example.com"

# Email & Notifications
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY="${SENDGRID_API_KEY}"
WHATSAPP_API_KEY="${WHATSAPP_API_KEY}"

# Storage & CDN
AWS_S3_BUCKET="neonpro-production"
AWS_S3_REGION="us-east-1"
CDN_DOMAIN="https://cdn.neonpro.com.br"

# AI Services
OPENAI_API_KEY="${OPENAI_API_KEY}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
```

### Staging Configuration
```bash
# .env.staging
NODE_ENV=staging
PORT=3001
DEPLOY_ENV=staging

# Database - Lower spec but production-like
DATABASE_URL="postgresql://user:password@staging-db.cluster.amazonaws.com:5432/neonpro_staging?sslmode=require"
REDIS_URL="redis://staging-redis.amazonaws.com:6379/0"

# Use test keys for external services
ANVISA_API_KEY="test-anvisa-key"
CFM_API_KEY="test-cfm-key"
SENDGRID_API_KEY="test-sendgrid-key"

# Reduced monitoring
LOG_LEVEL=debug
SENTRY_DSN="${SENTRY_STAGING_DSN}"
```

## 🐳 Container Orchestration

### Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@db:5432/neonpro
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    networks:
      - neonpro-network

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    networks:
      - neonpro-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: neonpro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - neonpro-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - neonpro-network

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    depends_on:
      - db
    networks:
      - neonpro-network

volumes:
  postgres_data:
  redis_data:

networks:
  neonpro-network:
    driver: bridge
```

### Production Dockerfile
```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## ☸️ Kubernetes Deployment

### Production Deployment
```yaml
# k8s/production/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neonpro-api
  namespace: neonpro-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: neonpro-api
  template:
    metadata:
      labels:
        app: neonpro-api
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: api
        image: neonpro/api:latest
        ports:
        - containerPort: 3001
        envFrom:
        - secretRef:
            name: neonpro-secrets
        - configMapRef:
            name: neonpro-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: tmp
        emptyDir: {}
      imagePullSecrets:
      - name: regcred
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - neonpro-api
              topologyKey: kubernetes.io/hostname
```

### Database StatefulSet
```yaml
# k8s/production/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: neonpro-production
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        envFrom:
        - secretRef:
            name: postgres-secrets
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: gp2
      resources:
        requests:
          storage: 100Gi
```

### Ingress Configuration
```yaml
# k8s/production/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: neonpro-ingress
  namespace: neonpro-production
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: "internet-facing"
    alb.ingress.kubernetes.io/target-type: "ip"
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: "443"
    alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:us-east-1:123456789012:certificate/abc123"
    alb.ingress.kubernetes.io/security-groups: "sg-1234567890abcdef0"
    alb.ingress.kubernetes.io/waf-acl-id: "arn:aws:wafv2:us-east-1:123456789012:global/acl/abc123/abc123"
spec:
  rules:
  - host: api.neonpro.com.br
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: neonpro-api
            port:
              number: 3001
  - host: neonpro.com.br
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: neonpro-web
            port:
              number: 3000
```

## 🔒 Security Configuration

### Network Policies
```yaml
# k8s/production/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: neonpro-network-policy
  namespace: neonpro-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: neonpro-production
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - ipBlock:
        cidr: 10.0.0.0/8
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: neonpro-production
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - ipBlock:
        cidr: 10.0.0.0/8
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
```

### RBAC Configuration
```yaml
# k8s/production/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: neonpro-api
  namespace: neonpro-production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: neonpro-api
  namespace: neonpro-production
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: neonpro-api
  namespace: neonpro-production
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: neonpro-api
subjects:
- kind: ServiceAccount
  name: neonpro-api
  namespace: neonpro-production
```

## 📊 Monitoring & Logging

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'neonpro-api'
    static_configs:
      - targets: ['neonpro-api:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Alert Rules
```yaml
# monitoring/alert_rules.yml
groups:
  - name: neonpro-alerts
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value }} errors per second"

    - alert: HighResponseTime
      expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High response time detected"
        description: "95th percentile response time is {{ $value }} seconds"

    - alert: DatabaseConnectionsHigh
      expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Database connections high"
        description: "Database connection usage is {{ $value }}%"

    - alert: MemoryUsageHigh
      expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage"
        description: "Memory usage is {{ $value }}%"
```

### Grafana Dashboards
```json
// monitoring/grafana/dashboards/neonpro-dashboard.json
{
  "dashboard": {
    "id": null,
    "title": "NeonPro Aesthetic Clinic",
    "tags": ["neonpro", "aesthetic-clinic"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ status }}"
          }
        ],
        "yaxes": [{ "format": "short" }]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "yaxes": [{ "format": "s" }]
      },
      {
        "id": 3,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active Connections"
          }
        ],
        "yaxes": [{ "format": "short" }]
      },
      {
        "id": 4,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ],
        "yaxes": [{ "format": "percent" }]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "10s"
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
      
      - name: Build application
        run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run OWASP dependency check
        run: npm audit --audit-level=high

  deploy-staging:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: neonpro-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f apps/api/Dockerfile .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/neonpro-api api=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -n neonpro-staging
          kubectl rollout status deployment/neonpro-api -n neonpro-staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Wait for staging validation
        run: |
          echo "Waiting for manual approval..."
          sleep 300
      
      - name: Deploy to production
        run: |
          kubectl set image deployment/neonpro-api api=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -n neonpro-production
          kubectl rollout status deployment/neonpro-api -n neonpro-production
```

## 📈 Performance Optimization

### Horizontal Pod Autoscaler
```yaml
# k8s/production/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: neonpro-api-hpa
  namespace: neonpro-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: neonpro-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

### Vertical Pod Autoscaler
```yaml
# k8s/production/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: neonpro-api-vpa
  namespace: neonpro-production
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: neonpro-api
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: "api"
      minAllowed:
        cpu: "250m"
        memory: "512Mi"
      maxAllowed:
        cpu: "2000m"
        memory: "4Gi"
```

## 🔧 Infrastructure as Code

### Terraform Configuration
```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_eks_cluster" "cluster" {
  name = "neonpro-cluster"
}

data "aws_eks_cluster_auth" "auth" {
  name = "neonpro-cluster"
}

provider "kubernetes" {
  host = data.aws_eks_cluster.cluster.endpoint
  token = data.aws_eks_cluster_auth.auth.token
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
}

resource "aws_db_instance" "postgres" {
  identifier        = "neonpro-postgres"
  engine           = "postgres"
  engine_version    = "15"
  instance_class   = "db.m6g.large"
  allocated_storage = 100
  storage_type     = "gp3"
  
  db_name  = "neonpro"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window         = "04:00-05:00"
  maintenance_window    = "sun:05:00-sun:06:00"
  
  storage_encrypted = true
  kms_key_id       = aws_kms_key.db.arn
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {
    Environment = "production"
    Project     = "neonpro"
  }
}

resource "aws_elasticache_replication_group" "redis" {
  description          = "NeonPro Redis Cluster"
  replication_group_id = "neonpro-redis"
  node_type            = "cache.m6g.large"
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = 2
  
  automatic_failover_enabled = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Environment = "production"
    Project     = "neonpro"
  }
}

resource "aws_s3_bucket" "assets" {
  bucket = "neonpro-assets"
  
  tags = {
    Environment = "production"
    Project     = "neonpro"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

## 🚨 Disaster Recovery

### Backup Strategy
```yaml
# k8s/production/backup-cronjob.yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: neonpro-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command: ["/bin/sh", "-c"]
            args:
            - |
              pg_dump -h postgres -U postgres -d neonpro | gzip > /backup/neonpro-$(date +%Y%m%d).sql.gz
              aws s3 cp /backup/neonpro-$(date +%Y%m%d).sql.gz s3://neonpro-backups/postgres/
            envFrom:
            - secretRef:
                name: postgres-secrets
            - secretRef:
                name: aws-credentials
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup-volume
            emptyDir: {}
```

### Restore Procedure
```bash
#!/bin/bash
# scripts/restore-from-backup.sh

set -e

BACKUP_DATE=$1
if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <YYYYMMDD>"
  exit 1
fi

echo "Starting restore from backup $BACKUP_DATE"

# Download backup from S3
aws s3 cp s3://neonpro-backups/postgres/neonpro-$BACKUP_DATE.sql.gz ./backup.sql.gz

# Extract backup
gunzip backup.sql.gz

# Create temporary database
createdb -h postgres -U postgres neonpro-restore

# Restore backup
psql -h postgres -U postgres -d neonpro-restore < backup.sql

# Verify restore
psql -h postgres -U postgres -d neonpro-restore -c "SELECT COUNT(*) FROM aesthetic_client_profiles;"

echo "Restore completed successfully"
echo "To promote restored database, run:"
echo "ALTER DATABASE neonpro RENAME TO neonpro-backup;"
echo "ALTER DATABASE neonpro-restore RENAME TO neonpro;"
```

This comprehensive deployment and operations guide ensures the aesthetic clinic system maintains high availability, security, and compliance while supporting scalable operations in production environments.