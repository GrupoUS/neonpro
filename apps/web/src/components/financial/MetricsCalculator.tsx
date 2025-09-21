import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Play } from 'lucide-react';
import React, { useState } from 'react';

export interface MetricsCalculatorProps {
  onCalculate?: (result: any) => void;
  className?: string;
  'data-testid'?: string;
}

export const MetricsCalculator: React.FC<MetricsCalculatorProps> = ({
  onCalculate,
  className,
  'data-testid': testId,
}) => {
  const [period, setPeriod] = useState<string>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      // Mock calculation
      const result = {
        period,
        startDate,
        endDate,
        metrics: {
          revenue: 150000,
          expenses: 80000,
          profit: 70000,
        },
      };

      if (onCalculate) {
        onCalculate(result);
      }
    } catch (_error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calculator className='h-5 w-5' />
          Metrics Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium'>Period</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='daily'>Daily</SelectItem>
              <SelectItem value='weekly'>Weekly</SelectItem>
              <SelectItem value='monthly'>Monthly</SelectItem>
              <SelectItem value='yearly'>Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm font-medium'>Start Date</label>
          <Input
            type='date'
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className='text-sm font-medium'>End Date</label>
          <Input
            type='date'
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCalculate}
          disabled={isCalculating || !startDate || !endDate}
          className='w-full'
        >
          <Play className='h-4 w-4 mr-2' />
          {isCalculating ? 'Calculating...' : 'Calculate Metrics'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MetricsCalculator;
