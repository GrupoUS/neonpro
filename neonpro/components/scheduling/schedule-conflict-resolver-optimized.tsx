'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, AlertTriangle, CheckCircle2, X, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Types for conflict resolution with healthcare compliance
interface ConflictData {
  id: string;
  type: 'scheduling' | 'resource' | 'professional' | 'patient';
  severity: 'low' | 'medium' | 'high' | 'critical';
  appointmentId: string;
  patientId: string;
  professionalId: string;
  conflictTime: string;
  description: string;
  suggestedResolutions: Resolution[];
  metadata: {
    lgpdConsent: boolean;
    clinicalPriority: number;
    emergencyFlag: boolean;
  };
}

interface Resolution {
  id: string;
  type: 'reschedule' | 'reassign' | 'cancel' | 'override';
  description: string;
  impact: string;
  estimatedTime: number;
  complianceImpact: 'none' | 'low' | 'medium' | 'high';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  cached?: boolean;
}

// Optimized API hooks with caching and debouncing
const useOptimizedConflictApi = () => {
  const queryClient = useQueryClient();
  const requestCache = useRef(new Map<string, Promise<any>>());
  const batchQueue = useRef<Array<{ id: string; resolve: Function; reject: Function }>>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string, filters: any) => {
      return queryClient.invalidateQueries({ queryKey: ['conflicts', 'search', searchTerm, filters] });
    }, 300),
    [queryClient]
  );

  // Request deduplication
  const deduplicatedRequest = useCallback(async (key: string, requestFn: () => Promise<any>) => {
    if (requestCache.current.has(key)) {
      return requestCache.current.get(key);
    }

    const promise = requestFn().finally(() => {
      requestCache.current.delete(key);
    });

    requestCache.current.set(key, promise);
    return promise;
  }, []);

  // Batch request processing
  const processBatch = useCallback(() => {
    if (batchQueue.current.length === 0) return;

    const batch = [...batchQueue.current];
    batchQueue.current = [];

    // Process batch of conflict checks
    const batchRequest = fetch('/api/scheduling/conflicts/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: batch.map(item => ({ id: item.id })),
        timestamp: new Date().toISOString()
      })
    })
    .then(res => res.json())
    .then(data => {
      batch.forEach((item, index) => {
        if (data.results && data.results[index]) {
          item.resolve(data.results[index]);
        } else {
          item.reject(new Error('Batch request failed'));
        }
      });
    })
    .catch(error => {
      batch.forEach(item => item.reject(error));
    });

    return batchRequest;
  }, []);

  // Batched conflict check
  const batchedConflictCheck = useCallback((conflictId: string): Promise<ConflictData> => {
    return new Promise((resolve, reject) => {
      batchQueue.current.push({ id: conflictId, resolve, reject });

      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }

      batchTimer.current = setTimeout(processBatch, 50); // 50ms batch window
    });
  }, [processBatch]);

  return {
    debouncedSearch,
    deduplicatedRequest,
    batchedConflictCheck
  };
};

// Intelligent cache management with TTL
const useCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateConflictCache = useCallback((conflictId?: string) => {
    if (conflictId) {
      queryClient.invalidateQueries({ queryKey: ['conflicts', conflictId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    }
  }, [queryClient]);

  const setCachedData = useCallback((key: string[], data: any, ttl: number = 300000) => {
    queryClient.setQueryData(key, data);
    // Set TTL for automatic invalidation
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: key });
    }, ttl);
  }, [queryClient]);

  return { invalidateConflictCache, setCachedData };
};// Main component with optimized API usage
const ScheduleConflictResolverOptimized: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    dateRange: 'today'
  });
  const [selectedConflicts, setSelectedConflicts] = useState<string[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  const { debouncedSearch, deduplicatedRequest, batchedConflictCheck } = useOptimizedConflictApi();
  const { invalidateConflictCache, setCachedData } = useCacheManager();

  // Optimized conflicts query with caching
  const {
    data: conflictsData,
    isLoading: conflictsLoading,
    error: conflictsError,
    refetch: refetchConflicts
  } = useQuery({
    queryKey: ['conflicts', 'list', searchTerm, filters],
    queryFn: async () => {
      const cacheKey = `conflicts-${JSON.stringify({ searchTerm, filters })}`;
      
      return deduplicatedRequest(cacheKey, async () => {
        const response = await fetch('/api/scheduling/conflicts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            search: searchTerm,
            filters,
            includeResolutions: true,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result: ApiResponse<ConflictData[]> = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch conflicts');
        }

        return result.data;
      });
    },
    staleTime: 60000, // 1 minute cache
    gcTime: 300000,   // 5 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      // Smart retry logic for healthcare applications
      if (error?.message?.includes('403') || error?.message?.includes('401')) {
        return false; // Don't retry auth errors
      }
      return failureCount < 3;
    }
  });

  // Optimized resolution mutation with batch processing
  const resolveConflictsMutation = useMutation({
    mutationFn: async (resolutionData: {
      conflictIds: string[];
      resolutionType: string;
      metadata: any;
    }) => {
      setIsResolving(true);
      
      const response = await fetch('/api/scheduling/conflicts/resolve-batch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-LGPD-Consent': 'true' // Healthcare compliance header
        },
        body: JSON.stringify({
          ...resolutionData,
          timestamp: new Date().toISOString(),
          batchSize: resolutionData.conflictIds.length
        })
      });

      if (!response.ok) {
        throw new Error(`Resolution failed: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to resolve conflicts');
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant caches
      invalidateConflictCache();
      setSelectedConflicts([]);
      setIsResolving(false);
      
      toast.success(`Successfully resolved ${data.resolvedCount} conflicts`, {
        description: `${data.rescheduled} rescheduled, ${data.cancelled} cancelled`
      });
    },
    onError: (error: Error) => {
      setIsResolving(false);
      toast.error('Failed to resolve conflicts', {
        description: error.message
      });
    }
  });

  // Debounced search handler
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    debouncedSearch(value, filters);
  }, [filters, debouncedSearch]);

  // Optimized filter change handler
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    // Cache previous results while loading new ones
    const currentData = conflictsData;
    if (currentData) {
      setCachedData(['conflicts', 'list', searchTerm, newFilters], currentData, 30000);
    }
  }, [conflictsData, searchTerm, setCachedData]);

  // Memoized conflict statistics
  const conflictStats = useMemo(() => {
    if (!conflictsData) return null;
    
    return {
      total: conflictsData.length,
      critical: conflictsData.filter(c => c.severity === 'critical').length,
      high: conflictsData.filter(c => c.severity === 'high').length,
      pending: conflictsData.filter(c => !c.suggestedResolutions.length).length
    };
  }, [conflictsData]);

  // Batch resolution handler
  const handleBatchResolve = useCallback(async (resolutionType: string) => {
    if (selectedConflicts.length === 0) {
      toast.warning('Please select conflicts to resolve');
      return;
    }

    const selectedData = conflictsData?.filter(c => selectedConflicts.includes(c.id)) || [];
    const hasEmergency = selectedData.some(c => c.metadata.emergencyFlag);
    
    if (hasEmergency) {
      toast.warning('Emergency cases require individual resolution for compliance');
      return;
    }

    await resolveConflictsMutation.mutateAsync({
      conflictIds: selectedConflicts,
      resolutionType,
      metadata: {
        batchProcessed: true,
        lgpdCompliant: true,
        processingTime: new Date().toISOString()
      }
    });
  }, [selectedConflicts, conflictsData, resolveConflictsMutation]);

  // Real-time conflict detection (optimized)
  useEffect(() => {
    const eventSource = new EventSource('/api/scheduling/conflicts/stream');
    
    eventSource.onmessage = (event) => {
      const newConflict = JSON.parse(event.data);
      
      // Update cache with new conflict
      if (conflictsData) {
        const updatedData = [newConflict, ...conflictsData];
        setCachedData(['conflicts', 'list', searchTerm, filters], updatedData, 60000);
      }
      
      // Show notification for critical conflicts
      if (newConflict.severity === 'critical') {
        toast.error(`Critical conflict detected: ${newConflict.description}`, {
          action: {
            label: 'Resolve',
            onClick: () => setSelectedConflicts([newConflict.id])
          }
        });
      }
    };

    eventSource.onerror = () => {
      console.warn('Conflict stream disconnected, falling back to polling');
      // Fallback to periodic refresh
      const interval = setInterval(() => {
        refetchConflicts();
      }, 30000);
      
      return () => clearInterval(interval);
    };

    return () => {
      eventSource.close();
    };
  }, [conflictsData, searchTerm, filters, setCachedData, refetchConflicts]);

  return (
    <div className="space-y-6 p-6">[Content continues...]      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conflictStats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {conflictStats?.critical || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {conflictStats?.high || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Resolution</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {conflictStats?.pending || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimized Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conflict Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conflicts by patient, professional, or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange({ ...filters, severity: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ ...filters, type: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="scheduling">Scheduling</option>
                <option value="resource">Resource</option>
                <option value="professional">Professional</option>
                <option value="patient">Patient</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ ...filters, dateRange: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedConflicts.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  {selectedConflicts.length} conflicts selected
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchResolve('reschedule')}
                  disabled={isResolving}
                >
                  Batch Reschedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchResolve('reassign')}
                  disabled={isResolving}
                >
                  Batch Reassign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConflicts([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Handling */}
      {conflictsError && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load conflicts: {conflictsError.message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchConflicts()}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Optimized Conflicts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Conflicts</CardTitle>
        </CardHeader>
        <CardContent>
          {conflictsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : conflictsData && conflictsData.length > 0 ? (
            <div className="space-y-4">
              {conflictsData.map((conflict) => (
                <ConflictCard
                  key={conflict.id}
                  conflict={conflict}
                  isSelected={selectedConflicts.includes(conflict.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedConflicts(prev => [...prev, conflict.id]);
                    } else {
                      setSelectedConflicts(prev => prev.filter(id => id !== conflict.id));
                    }
                  }}
                  onResolve={async (resolutionType) => {
                    await resolveConflictsMutation.mutateAsync({
                      conflictIds: [conflict.id],
                      resolutionType,
                      metadata: {
                        individualResolution: true,
                        emergencyFlag: conflict.metadata.emergencyFlag,
                        clinicalPriority: conflict.metadata.clinicalPriority
                      }
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No conflicts found</p>
              <p className="text-sm">All appointments are properly scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Optimized Conflict Card Component
const ConflictCard: React.FC<{
  conflict: ConflictData;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onResolve: (resolutionType: string) => Promise<void>;
}> = React.memo(({ conflict, isSelected, onSelect, onResolve }) => {
  const [isResolving, setIsResolving] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const handleResolve = async (resolutionType: string) => {
    setIsResolving(true);
    try {
      await onResolve(resolutionType);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1"
            disabled={conflict.metadata.emergencyFlag} // Emergency cases require individual handling
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={conflict.severity === 'critical' ? 'destructive' : 'secondary'}>
                {conflict.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{conflict.type}</Badge>
              {conflict.metadata.emergencyFlag && (
                <Badge variant="destructive">EMERGENCY</Badge>
              )}
            </div>
            
            <h4 className="font-medium mb-1">{conflict.description}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Time: {new Date(conflict.conflictTime).toLocaleString()}
            </p>
            
            {conflict.suggestedResolutions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggested Resolutions:</p>
                {conflict.suggestedResolutions.map((resolution) => (
                  <div key={resolution.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div>
                      <p className="text-sm font-medium">{resolution.description}</p>
                      <p className="text-xs text-muted-foreground">{resolution.impact}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(resolution.type)}
                      disabled={isResolving}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(!isSelected)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

ConflictCard.displayName = 'ConflictCard';

export default ScheduleConflictResolverOptimized;
export type { ConflictData, Resolution, ApiResponse };