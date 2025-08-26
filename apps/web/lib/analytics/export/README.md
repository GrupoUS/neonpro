# Analytics Export System - STORY-SUB-002 Task 7

Comprehensive export system for analytics data with support for multiple formats (PDF, Excel, CSV,
JSON) and advanced customization options.

## 🚀 Features

### Export Formats

- **PDF Reports**: Professional formatted reports with charts and branding
- **Excel Workbooks**: Multi-sheet workbooks with formatting and formulas
- **CSV Data**: Clean, structured data exports
- **JSON Data**: Raw data exports for API integration

### Report Types

- **Revenue Analytics**: Revenue metrics, trends, and forecasts
- **Conversion Analytics**: Funnel analysis and conversion rates
- **Trial Analytics**: Trial-to-paid conversion insights
- **Cohort Analysis**: User cohort behavior and retention
- **Forecast Reports**: Predictive analytics and projections
- **Comprehensive Reports**: All-in-one analytics overview

### Advanced Features

- 🎨 **Custom Branding**: Logo, colors, fonts, and styling
- 📊 **Interactive Charts**: Embedded charts in PDF reports
- 🔄 **Real-time Progress**: Live export progress tracking
- 📧 **Email Notifications**: Completion notifications
- 🔐 **Security**: Role-based access and data filtering
- ⚡ **Performance**: Streaming exports for large datasets
- 📱 **Responsive UI**: Modern React components

## 📁 Project Structure

```
lib/analytics/export/
├── types.ts              # TypeScript types and Zod schemas
├── service.ts            # Core export service implementation
├── index.ts              # Main export file
└── README.md             # This documentation

components/analytics/export/
├── export-dashboard.tsx  # Main export UI component
└── index.ts              # Component exports

app/api/analytics/export/
└── route.ts              # API endpoints for export requests
```

## 🛠️ Installation & Setup

### Dependencies

The export system requires the following packages:

```bash
# Core dependencies
npm install jspdf xlsx

# Type definitions
npm install --save-dev @types/jspdf
```

### Environment Variables

Add to your `.env.local`:

```env
# Supabase configuration (for file storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Export configuration
EXPORT_MAX_FILE_SIZE=50MB
EXPORT_RATE_LIMIT=10
EXPORT_STORAGE_BUCKET=analytics-exports
```

## 📖 Usage

### Basic Export Service

```typescript
import { AnalyticsExportService } from '@/lib/analytics/export';

const exportService = new AnalyticsExportService();

// Generate PDF export
const pdfResult = await exportService.generatePDFExport({
  format: 'pdf',
  reportType: 'revenue',
  dateRange: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  },
  includeSummary: true,
});

// Generate Excel export
const excelResult = await exportService.generateExcelExport({
  format: 'excel',
  reportType: 'comprehensive',
  dateRange: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  },
});
```

### React Component Usage

```typescript
import { ExportDashboard } from '@/components/analytics/export';

function AnalyticsPage() {
  const handleExportComplete = (response) => {
    console.log('Export completed:', response);
  };

  const handleExportError = (error) => {
    console.error('Export failed:', error);
  };

  return (
    <ExportDashboard
      defaultDateRange={{
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }}
      onExportComplete={handleExportComplete}
      onExportError={handleExportError}
    />
  );
}
```

### API Endpoints

#### Create Export Request

```typescript
// POST /api/analytics/export
const response = await fetch('/api/analytics/export', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    config: {
      format: 'pdf',
      reportType: 'revenue',
      dateRange: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      includeSummary: true,
      customization: {
        title: 'Monthly Revenue Report',
        subtitle: 'January 2024',
      },
    },
    pdfOptions: {
      orientation: 'portrait',
      pageSize: 'A4',
    },
    notifyOnComplete: true,
    email: 'user@example.com',
  }),
});

const result = await response.json();
console.log('Export ID:', result.id);
```

#### Check Export Status

```typescript
// GET /api/analytics/export/[id]
const response = await fetch(`/api/analytics/export/${exportId}`);
const status = await response.json();

console.log('Status:', status.status);
console.log('Progress:', status.progress);
console.log('Download URL:', status.downloadUrl);
```

#### Cancel Export

```typescript
// DELETE /api/analytics/export/[id]
const response = await fetch(`/api/analytics/export/${exportId}`, {
  method: 'DELETE',
});
```

## 🎨 Customization Options

### PDF Customization

```typescript
const pdfOptions: PDFExportOptions = {
  orientation: 'portrait', // 'portrait' | 'landscape'
  pageSize: 'A4', // 'A4' | 'A3' | 'letter' | 'legal'
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  styling: {
    fontFamily: 'helvetica',
    fontSize: 12,
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
  },
  header: {
    text: 'Analytics Report',
    fontSize: 16,
    alignment: 'center',
  },
  footer: {
    includePageNumbers: true,
    includeTimestamp: true,
  },
  charts: {
    includeCharts: true,
    chartWidth: 400,
    chartHeight: 300,
  },
};
```

### Excel Customization

```typescript
const excelOptions: ExcelExportOptions = {
  worksheets: {
    summary: true,
    revenue: true,
    conversion: true,
    cohorts: true,
    forecasts: true,
    rawData: false,
  },
  formatting: {
    autoWidth: true,
    freezeHeaders: true,
    alternatingRows: true,
    numberFormat: '#,##0.00',
  },
  charts: {
    includeCharts: true,
    chartTypes: ['line', 'bar', 'pie'],
  },
};
```

### CSV Customization

```typescript
const csvOptions: CSVExportOptions = {
  delimiter: ',', // ',' | ';' | '\t' | '|'
  encoding: 'utf8', // 'utf8' | 'utf16' | 'ascii'
  includeHeaders: true,
  compression: 'gzip', // 'none' | 'gzip' | 'zip'
};
```

## 🔐 Security & Permissions

### Authentication

All export endpoints require authentication:

```typescript
// Middleware automatically validates JWT tokens
// User must be authenticated to access export functionality
```

### Data Filtering

Data is automatically filtered based on user permissions:

```typescript
// Users only see data they have access to
// Role-based filtering applied automatically
// Sensitive data excluded based on user role
```

### Rate Limiting

```typescript
// Rate limiting applied per user:
// - 10 exports per hour for regular users
// - 50 exports per hour for premium users
// - 100 exports per hour for admin users
```

## ⚡ Performance Optimization

### Streaming Exports

For large datasets, the system uses streaming exports:

```typescript
// Automatically enabled for datasets > 10,000 rows
// Processes data in chunks to prevent memory issues
// Real-time progress updates
```

### Caching

```typescript
// Export results cached for 1 hour
// Identical requests return cached results
// Cache invalidated when underlying data changes
```

### Background Processing

```typescript
// Large exports processed in background
// User receives notification when complete
// Progress tracking available via API
```

## 📊 Monitoring & Analytics

### Export Metrics

The system tracks comprehensive metrics:

```typescript
interface ExportMetrics {
  totalExports: number;
  exportsByFormat: Record<ExportFormat, number>;
  exportsByReportType: Record<ReportType, number>;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  popularDateRanges: Array<{
    range: string;
    count: number;
  }>;
}
```

### Error Tracking

```typescript
// All errors logged with context:
// - User ID and session
// - Export configuration
// - Error stack trace
// - Performance metrics
```

## 🧪 Testing

### Unit Tests

```bash
# Run export service tests
npm test lib/analytics/export

# Run component tests
npm test components/analytics/export

# Run API tests
npm test app/api/analytics/export
```

### Integration Tests

```bash
# Test full export workflow
npm test:integration export

# Test with different data sizes
npm test:performance export
```

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Supabase storage bucket created
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Error tracking enabled
- [ ] Performance monitoring active

### Scaling Considerations

- **File Storage**: Use CDN for download URLs
- **Processing**: Consider queue system for high volume
- **Memory**: Monitor memory usage for large exports
- **Database**: Optimize analytics queries for export data

## 🔧 Troubleshooting

### Common Issues

1. **Export Timeout**
   - Increase timeout limits for large datasets
   - Use streaming exports for better performance

2. **Memory Issues**
   - Process data in smaller chunks
   - Use streaming for large exports

3. **File Storage Errors**
   - Check Supabase configuration
   - Verify storage bucket permissions

4. **PDF Generation Issues**
   - Ensure jsPDF is properly installed
   - Check font availability

5. **Excel Generation Issues**
   - Verify XLSX library version
   - Check worksheet limits

### Debug Mode

```typescript
// Enable debug logging
process.env.EXPORT_DEBUG = 'true';

// Detailed error messages
process.env.EXPORT_VERBOSE_ERRORS = 'true';
```

## 📝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run tests: `npm test`
5. Start development server: `npm run dev`

### Code Style

- Follow existing TypeScript patterns
- Use Zod for validation schemas
- Include comprehensive error handling
- Add JSDoc comments for public APIs
- Write tests for new functionality

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback

## 📄 License

This export system is part of the NeonPro Analytics platform and follows the project's licensing
terms.

---

**Created**: 2025-01-22\
**Version**: 1.0.0\
**Status**: ✅ Complete - STORY-SUB-002 Task 7
