# Computer Vision Analysis System Documentation

## Overview

The Computer Vision Analysis System is a comprehensive solution for analyzing before/after medical images using TensorFlow.js and advanced computer vision algorithms. The system provides real-time analysis, performance monitoring, sharing capabilities, and detailed reporting.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│ • Vision Analysis Page (/app/vision/analysis/page.tsx)     │
│ • Analysis Results Component                                │
│ • Configuration Management                                  │
│ • Export/Share Components                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Hooks Layer                            │
├─────────────────────────────────────────────────────────────┤
│ • useVisionAnalysis (Analysis Management)                  │
│ • useVisionConfig (Configuration Management)               │
│ • Performance Monitoring                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                             │
├─────────────────────────────────────────────────────────────┤
│ • /api/vision/analysis (CRUD Operations)                   │
│ • /api/vision/performance (Metrics)                        │
│ • /api/vision/export (Data Export)                         │
│ • /api/vision/share (Sharing)                              │
│ • /api/vision/config (Configuration)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│ • VisionAnalysisEngine (Core Analysis)                     │
│ • TensorFlow.js Integration                                 │
│ • Image Processing Pipeline                                 │
│ • Performance Monitoring                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│ • Supabase PostgreSQL                                      │
│ • Row Level Security (RLS)                                 │
│ • Real-time Subscriptions                                  │
│ • File Storage                                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### `vision_analyses`
Stores the main analysis results and metadata.

```sql
CREATE TABLE vision_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  treatment_id TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  accuracy_score DECIMAL(5,4) NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processing_time INTEGER NOT NULL CHECK (processing_time > 0),
  improvement_percentage DECIMAL(5,2),
  change_metrics JSONB NOT NULL DEFAULT '{}',
  annotations JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `analysis_performance_metrics`
Tracks performance metrics for monitoring and optimization.

```sql
CREATE TABLE analysis_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES vision_analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  processing_time INTEGER NOT NULL,
  accuracy_score DECIMAL(5,4) NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL,
  memory_usage_mb INTEGER,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `analysis_shares`
Manages sharing of analysis results.

```sql
CREATE TABLE analysis_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES vision_analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type share_type_enum NOT NULL DEFAULT 'private',
  share_url TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  allowed_emails TEXT[],
  include_images BOOLEAN DEFAULT true,
  include_annotations BOOLEAN DEFAULT true,
  include_metrics BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enums

```sql
CREATE TYPE share_type_enum AS ENUM ('public', 'private', 'professional');
CREATE TYPE export_format_enum AS ENUM ('json', 'csv', 'pdf', 'excel');
CREATE TYPE activity_type_enum AS ENUM ('analysis_created', 'analysis_updated', 'analysis_shared', 'analysis_exported', 'config_updated');
```

## API Endpoints

### Analysis Management

#### `POST /api/vision/analysis`
Creates a new vision analysis.

**Request Body:**
```typescript
{
  patientId: string;
  treatmentId?: string;
  beforeImage: string; // Base64 encoded
  afterImage: string;  // Base64 encoded
}
```

**Response:**
```typescript
{
  success: boolean;
  analysis: VisionAnalysisResult;
  performance: {
    accuracyScore: number;
    processingTime: number;
  };
  meetsAccuracyTarget: boolean;
  meetsProcessingTimeTarget: boolean;
}
```

#### `GET /api/vision/analysis`
Retrieves analysis history with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `patientId`: Filter by patient ID
- `treatmentId`: Filter by treatment ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `minAccuracy`: Minimum accuracy score
- `sortBy`: Sort field (createdAt, accuracyScore, processingTime)
- `sortOrder`: Sort order (asc, desc)

### Performance Monitoring

#### `GET /api/vision/performance`
Retrieves aggregated performance metrics.

**Query Parameters:**
- `timeRange`: Time range (1h, 24h, 7d, 30d, 90d)
- `groupBy`: Grouping (hour, day, week, month)
- `includeTimeSeries`: Include detailed time-series data

#### `POST /api/vision/performance`
Records performance metrics for an analysis.

### Export & Sharing

#### `POST /api/vision/export`
Exports analysis data in various formats.

**Request Body:**
```typescript
{
  analysisIds: string[];
  format: 'json' | 'csv' | 'pdf' | 'excel';
  includeImages?: boolean;
  includeAnnotations?: boolean;
  includeMetrics?: boolean;
}
```

#### `POST /api/vision/share`
Creates a shareable link for analysis results.

**Request Body:**
```typescript
{
  analysisId: string;
  shareType: 'public' | 'private' | 'professional';
  expiresAt?: string;
  password?: string;
  allowedEmails?: string[];
  includeImages?: boolean;
  includeAnnotations?: boolean;
  includeMetrics?: boolean;
}
```

## Core Classes

### VisionAnalysisEngine

The main engine for computer vision analysis.

```typescript
class VisionAnalysisEngine {
  private model: tf.LayersModel | null = null;
  private supabase: SupabaseClient;
  
  async initialize(): Promise<void>
  async loadModel(): Promise<void>
  async analyzeBeforeAfter(beforeImage: string, afterImage: string, options?: AnalysisOptions): Promise<VisionAnalysisResult>
  async saveAnalysisResult(result: VisionAnalysisResult): Promise<string>
  private preprocessImage(imageData: string): tf.Tensor
  private calculateChangeMetrics(beforeFeatures: tf.Tensor, afterFeatures: tf.Tensor): ChangeMetrics
  private generateAnnotations(beforeImage: tf.Tensor, afterImage: tf.Tensor, changeMap: tf.Tensor): Annotation[]
}
```

### Key Methods

#### `analyzeBeforeAfter()`
Performs comprehensive before/after image analysis:

1. **Image Preprocessing**: Normalizes and resizes images
2. **Feature Extraction**: Uses TensorFlow.js model to extract features
3. **Change Detection**: Compares features to identify changes
4. **Metrics Calculation**: Computes improvement percentages
5. **Annotation Generation**: Creates visual annotations for changes
6. **Quality Assessment**: Validates accuracy and confidence scores

## React Hooks

### useVisionAnalysis

Manages vision analysis state and operations.

```typescript
interface UseVisionAnalysisReturn {
  // State
  currentAnalysis: VisionAnalysisResult | null;
  analysisHistory: VisionAnalysisResult[];
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
  
  // Actions
  startAnalysis: (data: AnalysisRequest) => Promise<void>;
  loadAnalysisHistory: (filters?: AnalysisFilters) => Promise<void>;
  exportAnalysis: (analysisIds: string[], format: ExportFormat, options?: ExportOptions) => Promise<void>;
  shareAnalysis: (analysisId: string, options: ShareOptions) => Promise<string>;
  clearCurrentAnalysis: () => void;
  clearError: () => void;
}
```

### useVisionConfig

Manages user configuration and preferences.

```typescript
interface UseVisionConfigReturn {
  // State
  config: VisionAnalysisConfig;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  
  // Actions
  updateConfig: (updates: Partial<VisionAnalysisConfig>) => void;
  saveConfig: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  discardChanges: () => void;
  loadConfig: () => Promise<void>;
}
```

## Configuration System

### VisionAnalysisConfig

```typescript
interface VisionAnalysisConfig {
  analysis: {
    accuracyThreshold: number;        // Minimum accuracy (0.85)
    confidenceThreshold: number;      // Minimum confidence (0.80)
    processingTimeLimit: number;      // Max processing time (30000ms)
    enableRealTimeProgress: boolean;  // Show progress updates
    autoSaveResults: boolean;         // Auto-save to database
  };
  
  imageProcessing: {
    maxImageSize: number;             // Max image size (5MB)
    allowedFormats: string[];         // ['jpeg', 'jpg', 'png']
    enableImageOptimization: boolean; // Optimize before processing
    compressionQuality: number;       // JPEG quality (0.8)
  };
  
  notifications: {
    enableSuccessNotifications: boolean;
    enableErrorNotifications: boolean;
    enableProgressNotifications: boolean;
    notificationDuration: number;     // Duration in ms (5000)
  };
  
  export: {
    defaultFormat: ExportFormat;      // 'pdf'
    includeImagesDefault: boolean;    // true
    includeAnnotationsDefault: boolean; // true
    includeMetricsDefault: boolean;   // true
    maxExportSize: number;            // 50MB
  };
  
  privacy: {
    enableAnalyticsTracking: boolean; // false
    enablePerformanceMonitoring: boolean; // true
    dataRetentionDays: number;        // 90
    allowDataSharing: boolean;        // false
  };
  
  advanced: {
    enableDebugMode: boolean;         // false
    customModelUrl?: string;          // Optional custom model
    enableExperimentalFeatures: boolean; // false
    maxConcurrentAnalyses: number;    // 3
  };
}
```

## Performance Requirements

### Accuracy Targets
- **Minimum Accuracy**: 85% (0.85)
- **Target Accuracy**: 95% (0.95)
- **Confidence Threshold**: 80% (0.80)

### Processing Time Targets
- **Maximum Processing Time**: 30 seconds
- **Target Processing Time**: 15 seconds
- **Real-time Progress Updates**: Every 100ms

### Memory Management
- **Maximum Memory Usage**: 512MB per analysis
- **Tensor Cleanup**: Automatic disposal after use
- **Model Caching**: Persistent model loading

## Security

### Authentication
- All endpoints require valid Supabase authentication
- User-specific data isolation via RLS policies
- JWT token validation on every request

### Row Level Security (RLS)

```sql
-- Users can only access their own analyses
CREATE POLICY "Users can view own analyses" ON vision_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON vision_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public access for active shares
CREATE POLICY "Public access to active shares" ON analysis_shares
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
```

### Data Protection
- Image data encrypted in transit and at rest
- Sensitive data (passwords) hashed using bcrypt
- Automatic data cleanup based on retention policies
- GDPR compliance for data export and deletion

## Testing Strategy

### Unit Tests
- **VisionAnalysisEngine**: Core analysis logic
- **API Endpoints**: Request/response handling
- **React Hooks**: State management and side effects
- **Components**: UI behavior and user interactions

### Integration Tests
- **End-to-End Workflows**: Complete analysis pipeline
- **Database Operations**: CRUD operations with RLS
- **File Upload/Download**: Image processing pipeline
- **Authentication**: User session management

### Performance Tests
- **Load Testing**: Multiple concurrent analyses
- **Memory Testing**: Memory usage and cleanup
- **Accuracy Testing**: Model performance validation
- **Processing Time**: Speed benchmarks

## Deployment

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vision Analysis Configuration
VISION_MODEL_URL=https://your-model-url/model.json
VISION_ACCURACY_THRESHOLD=0.85
VISION_PROCESSING_TIME_LIMIT=30000
VISION_MAX_IMAGE_SIZE=5242880

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_METRICS_RETENTION_DAYS=90

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Database Migration

```bash
# Apply the vision analysis schema
psql -h your-db-host -U postgres -d your-database -f migrations/20241201_vision_analysis_schema.sql

# Verify tables and policies
psql -h your-db-host -U postgres -d your-database -c "\dt vision_*"
psql -h your-db-host -U postgres -d your-database -c "\dp vision_*"
```

### Production Checklist

- [ ] Database schema applied with RLS policies
- [ ] Environment variables configured
- [ ] TensorFlow.js model uploaded and accessible
- [ ] Image storage bucket configured
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] Backup strategy implemented
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Rate limiting configured

## Monitoring & Observability

### Key Metrics

1. **Analysis Performance**
   - Average processing time
   - Accuracy distribution
   - Confidence scores
   - Error rates

2. **System Performance**
   - API response times
   - Database query performance
   - Memory usage
   - CPU utilization

3. **User Engagement**
   - Analysis volume
   - Export usage
   - Share activity
   - Configuration changes

### Alerting

- **High Error Rate**: >5% of analyses failing
- **Slow Processing**: >30s average processing time
- **Low Accuracy**: <85% average accuracy
- **High Memory Usage**: >80% memory utilization
- **Database Issues**: Connection failures or slow queries

## Troubleshooting

### Common Issues

#### Analysis Fails with "Model Loading Error"
- Check TensorFlow.js model URL accessibility
- Verify model format compatibility
- Check browser WebGL support
- Clear browser cache and reload

#### Poor Analysis Accuracy
- Verify image quality and resolution
- Check lighting conditions in images
- Ensure proper before/after alignment
- Review accuracy threshold settings

#### Slow Processing Times
- Check system memory availability
- Verify GPU acceleration is enabled
- Reduce image size if necessary
- Check network connectivity for model loading

#### Database Connection Issues
- Verify Supabase credentials
- Check RLS policies are correctly applied
- Ensure user authentication is valid
- Review database connection limits

### Debug Mode

Enable debug mode in configuration to get detailed logging:

```typescript
const config = {
  advanced: {
    enableDebugMode: true
  }
};
```

This will provide:
- Detailed processing steps
- Performance timing information
- Memory usage tracking
- Model prediction confidence
- Error stack traces

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Trend analysis across multiple treatments
   - Comparative analysis between patients
   - Predictive modeling for treatment outcomes

2. **Enhanced Sharing**
   - Collaborative analysis reviews
   - Professional consultation features
   - Integration with medical record systems

3. **Mobile Support**
   - React Native mobile app
   - Offline analysis capabilities
   - Camera integration for direct capture

4. **AI Improvements**
   - Custom model training
   - Transfer learning for specific conditions
   - Multi-modal analysis (text + images)

### Technical Debt

- Migrate to newer TensorFlow.js versions
- Implement proper caching strategies
- Add comprehensive error boundaries
- Optimize bundle size and loading times
- Implement progressive web app features

---

## Support

For technical support or questions about the Vision Analysis System:

- **Documentation**: `/docs/vision-analysis-system.md`
- **API Reference**: `/docs/api-reference.md`
- **Testing Guide**: `/docs/testing-guide.md`
- **Deployment Guide**: `/docs/deployment-guide.md`

---

*Last updated: December 2024*
*Version: 1.0.0*