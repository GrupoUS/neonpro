# 🔬 Computer Vision Analysis System

> Advanced before/after medical image analysis powered by TensorFlow.js and Next.js

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## ✨ Features

### 🎯 Core Analysis
- **Real-time Image Analysis**: Advanced computer vision algorithms for before/after comparison
- **Accuracy Scoring**: Precision metrics with 95%+ target accuracy
- **Change Detection**: Detailed improvement percentage calculations
- **Visual Annotations**: AI-generated annotations highlighting key changes
- **Performance Monitoring**: Sub-30-second processing time targets

### 📊 Analytics & Reporting
- **Performance Metrics**: Comprehensive tracking of analysis accuracy and speed
- **Export Capabilities**: Multiple formats (PDF, Excel, CSV, JSON)
- **Sharing System**: Secure link sharing with access controls
- **Historical Analysis**: Complete analysis history with filtering
- **Real-time Progress**: Live updates during analysis processing

### 🔒 Security & Privacy
- **Row Level Security**: Supabase RLS for data isolation
- **User Authentication**: Secure access control
- **Data Encryption**: End-to-end encryption for sensitive data
- **GDPR Compliance**: Data retention and deletion policies
- **Access Controls**: Granular permissions for sharing

### ⚙️ Configuration
- **Customizable Thresholds**: Adjustable accuracy and confidence settings
- **Image Processing**: Configurable compression and optimization
- **Notification System**: Customizable alerts and notifications
- **Advanced Settings**: Debug mode and experimental features

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Modern browser with WebGL support

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd neonpro
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   VISION_MODEL_URL=https://your-model-url/model.json
   VISION_ACCURACY_THRESHOLD=0.85
   VISION_PROCESSING_TIME_LIMIT=30000
   ```

3. **Database Setup**
   ```bash
   # Apply the vision analysis schema
   psql -h your-db-host -U postgres -d your-database -f migrations/20241201_vision_analysis_schema.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open http://localhost:3000
   - Navigate to `/vision/analysis` for the main interface

## 📁 Project Structure

```
├── app/
│   ├── api/vision/              # API endpoints
│   │   ├── analysis/           # CRUD operations
│   │   ├── performance/        # Metrics tracking
│   │   ├── export/            # Data export
│   │   ├── share/             # Sharing system
│   │   └── config/            # Configuration
│   └── vision/
│       └── analysis/          # Main analysis page
├── components/vision/          # React components
├── hooks/                     # Custom React hooks
│   ├── useVisionAnalysis.ts   # Analysis management
│   └── useVisionConfig.ts     # Configuration
├── lib/vision/                # Core business logic
│   └── analysis-engine.ts     # TensorFlow.js engine
├── migrations/                # Database migrations
├── __tests__/                 # Test suites
│   ├── api/                   # API tests
│   ├── components/            # Component tests
│   ├── hooks/                 # Hook tests
│   └── integration/           # E2E tests
└── docs/                      # Documentation
```

## 🔧 API Reference

### Analysis Endpoints

#### Create Analysis
```http
POST /api/vision/analysis
Content-Type: application/json

{
  "patientId": "patient-123",
  "treatmentId": "treatment-456",
  "beforeImage": "data:image/jpeg;base64,...",
  "afterImage": "data:image/jpeg;base64,..."
}
```

#### Get Analysis History
```http
GET /api/vision/analysis?page=1&limit=10&patientId=patient-123
```

#### Export Analysis
```http
POST /api/vision/export
Content-Type: application/json

{
  "analysisIds": ["analysis-123"],
  "format": "pdf",
  "includeImages": true,
  "includeAnnotations": true
}
```

#### Share Analysis
```http
POST /api/vision/share
Content-Type: application/json

{
  "analysisId": "analysis-123",
  "shareType": "professional",
  "expiresAt": "2024-12-31T23:59:59Z",
  "allowedEmails": ["doctor@example.com"]
}
```

### Performance Monitoring

#### Get Metrics
```http
GET /api/vision/performance?timeRange=7d&groupBy=day
```

#### Record Metrics
```http
POST /api/vision/performance
Content-Type: application/json

{
  "analysisId": "analysis-123",
  "processingTime": 15000,
  "accuracyScore": 0.96,
  "confidenceScore": 0.94
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests
npm test -- --testPathPattern="__tests__/(api|hooks|components)"

# Integration tests
npm test -- --testPathPattern="__tests__/integration"

# Vision engine tests
npm test -- --testPathPattern="vision.*test"
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Performance Targets

| Metric | Target | Threshold |
|--------|--------|-----------|
| **Accuracy** | 95% | 85% minimum |
| **Processing Time** | 15s | 30s maximum |
| **Confidence** | 90% | 80% minimum |
| **Memory Usage** | 256MB | 512MB maximum |
| **API Response** | 200ms | 1s maximum |

## 🔍 Usage Examples

### Basic Analysis

```typescript
import { useVisionAnalysis } from '@/hooks/useVisionAnalysis';

function AnalysisComponent() {
  const { startAnalysis, currentAnalysis, isAnalyzing, progress } = useVisionAnalysis();
  
  const handleAnalysis = async () => {
    await startAnalysis({
      patientId: 'patient-123',
      treatmentId: 'treatment-456',
      beforeImage: beforeImageBase64,
      afterImage: afterImageBase64
    });
  };
  
  return (
    <div>
      <button onClick={handleAnalysis} disabled={isAnalyzing}>
        {isAnalyzing ? `Analyzing... ${progress}%` : 'Start Analysis'}
      </button>
      
      {currentAnalysis && (
        <div>
          <h3>Results</h3>
          <p>Accuracy: {(currentAnalysis.accuracyScore * 100).toFixed(1)}%</p>
          <p>Improvement: {currentAnalysis.improvementPercentage}%</p>
          <p>Processing Time: {(currentAnalysis.processingTime / 1000).toFixed(1)}s</p>
        </div>
      )}
    </div>
  );
}
```

### Configuration Management

```typescript
import { useVisionConfig } from '@/hooks/useVisionConfig';

function ConfigComponent() {
  const { config, updateConfig, saveConfig, hasUnsavedChanges } = useVisionConfig();
  
  const handleThresholdChange = (threshold: number) => {
    updateConfig({
      analysis: {
        ...config.analysis,
        accuracyThreshold: threshold
      }
    });
  };
  
  return (
    <div>
      <label>
        Accuracy Threshold:
        <input
          type="range"
          min="0.5"
          max="1"
          step="0.01"
          value={config.analysis.accuracyThreshold}
          onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
        />
        {(config.analysis.accuracyThreshold * 100).toFixed(0)}%
      </label>
      
      {hasUnsavedChanges && (
        <button onClick={saveConfig}>Save Changes</button>
      )}
    </div>
  );
}
```

### Export & Share

```typescript
const { exportAnalysis, shareAnalysis } = useVisionAnalysis();

// Export to PDF
const handleExport = async () => {
  await exportAnalysis(
    ['analysis-123'], 
    'pdf', 
    { 
      includeImages: true, 
      includeAnnotations: true 
    }
  );
};

// Share with professionals
const handleShare = async () => {
  const shareUrl = await shareAnalysis('analysis-123', {
    shareType: 'professional',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    allowedEmails: ['doctor@example.com'],
    includeImages: true
  });
  
  console.log('Share URL:', shareUrl);
};
```

## 🐛 Troubleshooting

### Common Issues

#### "Model Loading Failed"
- Check TensorFlow.js model URL accessibility
- Verify browser WebGL support
- Clear browser cache

#### "Analysis Accuracy Too Low"
- Ensure high-quality input images
- Check proper lighting conditions
- Verify before/after image alignment

#### "Processing Time Exceeded"
- Reduce image file size
- Check system memory availability
- Verify GPU acceleration is enabled

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const config = {
  advanced: {
    enableDebugMode: true
  }
};
```

## 📈 Monitoring

### Key Metrics Dashboard

Access real-time metrics at `/vision/analytics`:

- Analysis volume and success rates
- Average processing times
- Accuracy distribution
- Error rates and types
- User engagement metrics

### Performance Alerts

Configured alerts for:
- Processing time > 30s
- Accuracy < 85%
- Error rate > 5%
- Memory usage > 80%

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Run tests**: `npm test`
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript strict mode
- Maintain 90%+ test coverage
- Use conventional commit messages
- Update documentation for new features
- Ensure accessibility compliance

## 📚 Documentation

- **[Complete System Documentation](./docs/vision-analysis-system.md)** - Comprehensive technical guide
- **[API Reference](./docs/api-reference.md)** - Detailed API documentation
- **[Testing Guide](./docs/testing-guide.md)** - Testing strategies and examples
- **[Deployment Guide](./docs/deployment-guide.md)** - Production deployment instructions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js Team** - For the amazing ML framework
- **Supabase Team** - For the excellent backend-as-a-service
- **Next.js Team** - For the powerful React framework
- **Medical Imaging Community** - For domain expertise and feedback

---

**Built with ❤️ for advancing medical image analysis**

*For support, please open an issue or contact the development team.*