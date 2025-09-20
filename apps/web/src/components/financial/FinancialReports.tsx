import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Filter,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

export interface FinancialReportsProps {
  onReportGenerate?: (reportType: string) => void;
  onExport?: (format: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  onReportGenerate,
  onExport,
  className,
  'data-testid': testId,
}) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'revenue',
      name: 'Revenue Report',
      description: 'Detailed revenue analysis by period',
      icon: TrendingUp,
      estimatedTime: '2-3 minutes',
      format: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Overview of financial performance',
      icon: DollarSign,
      estimatedTime: '1-2 minutes',
      format: ['PDF', 'Excel'],
    },
    {
      id: 'budget-analysis',
      name: 'Budget Analysis',
      description: 'Budget vs actual comparison',
      icon: PieChart,
      estimatedTime: '3-4 minutes',
      format: ['PDF', 'Excel', 'PowerPoint'],
    },
    {
      id: 'trend-analysis',
      name: 'Trend Analysis',
      description: 'Financial trends over time',
      icon: BarChart3,
      estimatedTime: '2-3 minutes',
      format: ['PDF', 'Excel'],
    },
  ];

  const handleGenerateReport = useCallback(async (reportType: string) => {
    setIsGenerating(true);
    setSelectedReport(reportType);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onReportGenerate) {
        onReportGenerate(reportType);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [onReportGenerate]);

  const handleExport = useCallback((format: string) => {
    if (onExport) {
      onExport(format);
    }
  }, [onExport]);

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          Financial Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {reportTypes.map(report => {
            const IconComponent = report.icon;
            const isSelected = selectedReport === report.id;
            const isCurrentlyGenerating = isGenerating && isSelected;

            return (
              <div
                key={report.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-3 flex-1'>
                    <IconComponent className='h-5 w-5 mt-1 text-primary' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>{report.name}</h3>
                      <p className='text-sm text-gray-600 mt-1'>
                        {report.description}
                      </p>
                      <div className='flex items-center gap-4 mt-2'>
                        <div className='flex items-center gap-1 text-xs text-gray-500'>
                          <Calendar className='h-3 w-3' />
                          {report.estimatedTime}
                        </div>
                        <div className='flex items-center gap-1'>
                          {report.format.map(format => (
                            <Badge
                              key={format}
                              variant='secondary'
                              className='text-xs'
                            >
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={isGenerating}
                      className='min-w-[100px]'
                    >
                      {isCurrentlyGenerating
                        ? (
                          <>
                            <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2' />
                            Generating...
                          </>
                        )
                        : (
                          'Generate'
                        )}
                    </Button>

                    {isSelected && !isGenerating && (
                      <div className='flex gap-1'>
                        {report.format.map(format => (
                          <Button
                            key={format}
                            size='sm'
                            variant='outline'
                            onClick={() => handleExport(format)}
                            className='text-xs px-2'
                          >
                            <Download className='h-3 w-3 mr-1' />
                            {format}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className='my-6' />

        <div className='space-y-3'>
          <h4 className='font-medium flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            Quick Actions
          </h4>
          <div className='grid grid-cols-2 gap-2'>
            <Button variant='outline' size='sm'>
              Schedule Reports
            </Button>
            <Button variant='outline' size='sm'>
              Custom Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialReports;
