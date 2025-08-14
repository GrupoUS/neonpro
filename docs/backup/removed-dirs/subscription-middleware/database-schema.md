# Database Schema - Subscription System

## Core Tables

### 1. profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier subscription_tier_enum DEFAULT 'free',
  subscription_status subscription_status_enum DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  features_enabled JSONB DEFAULT '{}',
  usage_limits JSONB DEFAULT '{}',
  current_usage JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 2. subscription_features Table
```sql
CREATE TABLE subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key VARCHAR(100) NOT NULL UNIQUE,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  tier_requirements subscription_tier_enum[] DEFAULT ARRAY['basic'],
  usage_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```### 3. subscription_usage_logs Table
```sql
CREATE TABLE subscription_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_usage_logs_user_feature (user_id, feature_key, created_at),
  INDEX idx_usage_logs_created_at (created_at)
);
```

## Enums and Types

### Subscription Tier Enum
```sql
CREATE TYPE subscription_tier_enum AS ENUM (
  'free',
  'basic',
  'professional',
  'enterprise'
);
```

### Subscription Status Enum
```sql
CREATE TYPE subscription_status_enum AS ENUM (
  'active',
  'inactive',
  'suspended',
  'cancelled',
  'expired'
);
```