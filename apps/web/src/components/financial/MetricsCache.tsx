import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';

export interface MetricsCacheProps {
  onCacheUpdate?: (stats: any) => void;
  className?: string;
  'data-testid'?: string;
}

export const MetricsCache: React.FC<MetricsCacheProps> = ({
  onCacheUpdate,className,
  'data-testid': testId, }) => {
  const [cacheStats, setCacheStats] = useState({
    size: 0,
    hitRate: 0,
    keys: [] as string[],
    memory: 0,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      // Mock cache stats
      const stats = {
        size: 15,
        hitRate: 85.5,
        keys: [
          'financial_metrics_monthly',
          'financial_metrics_weekly',
          'dashboard_data_cache',
        ],
        memory: 1024 * 45, // 45KB
      };

      setCacheStats(stats);

      if (onCacheUpdate) {
        onCacheUpdate(stats);
      }
    } catch (_error) {
      console.error('Failed to refresh cache stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearCache = async () => {
    try {
      // Mock cache clear
      setCacheStats({
        size: 0,
        hitRate: 0,
        keys: [],
        memory: 0,
      });
    } catch (_error) {
      console.error('Failed to clear cache:', error);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  };

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            Metrics Cache
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshStats}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={clearCache}
              disabled={cacheStats.size === 0}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{cacheStats.size}</div>
            <div className='text-sm text-gray-500'>Cache Entries</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{cacheStats.hitRate.toFixed(1)}%</div>
            <div className='text-sm text-gray-500'>Hit Rate</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{formatBytes(cacheStats.memory)}</div>
            <div className='text-sm text-gray-500'>Memory Used</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{cacheStats.keys.length}</div>
            <div className='text-sm text-gray-500'>Active Keys</div>
          </div>
        </div>

        {cacheStats.keys.length > 0 && (<div>
            <h4 className='font-medium mb-2'>Cache Keys</h4>
            <div className='flex flex-wrap gap-2'>
              {cacheStats.keys.map((key, _index) => (
                <Badge key={index} variant='secondary'>
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCache;
