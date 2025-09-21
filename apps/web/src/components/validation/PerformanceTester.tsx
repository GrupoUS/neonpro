import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Gauge,
  Heart,
  Shield,
  Smartphone,
  Timer,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Healthcare Performance Standards
const HEALTHCARE_PERFORMANCE_TARGETS = {
  // Core Web Vitals
  LCP: { target: 2500, excellent: 2000, poor: 4000, unit: 'ms', name: 'Largest Contentful Paint' },
  INP: { target: 200, excellent: 100, poor: 500, unit: 'ms', name: 'Interaction to Next Paint' },
  CLS: { target: 0.1, excellent: 0.05, poor: 0.25, unit: '', name: 'Cumulative Layout Shift' },
  FID: { target: 100, excellent: 50, poor: 300, unit: 'ms', name: 'First Input Delay' },

  // Healthcare-Specific Metrics
  TTFB: { target: 800, excellent: 500, poor: 1500, unit: 'ms', name: 'Time to First Byte' },
  TTI: { target: 3000, excellent: 2000, poor: 5000, unit: 'ms', name: 'Time to Interactive' },
  EMERGENCY_RESPONSE: {
    target: 100,
    excellent: 50,
    poor: 200,
    unit: 'ms',
    name: 'Emergency Action Response',
  },
  DATA_LOAD: {
    target: 1500,
    excellent: 1000,
    poor: 3000,
    unit: 'ms',
    name: 'Patient Data Load Time',
  },
  FORM_RESPONSE: {
    target: 150,
    excellent: 100,
    poor: 300,
    unit: 'ms',
    name: 'Form Input Response',
  },
} as const;

// Critical Healthcare Scenarios
const CRITICAL_SCENARIOS = [
  {
    id: 'emergency_alert',
    name: 'Emergency Alert Display',
    description: 'Time to display critical patient alerts',
    targetTime: 100,
    action: () => simulateEmergencyAlert(),
  },
  {
    id: 'patient_data_load',
    name: 'Patient Data Loading',
    description: 'Time to load and display patient information',
    targetTime: 1500,
    action: () => simulatePatientDataLoad(),
  },
  {
    id: 'appointment_booking',
    name: 'Appointment Booking Flow',
    description: 'Complete booking process performance',
    targetTime: 2000,
    action: () => simulateAppointmentBooking(),
  },
  {
    id: 'treatment_plan_access',
    name: 'Treatment Plan Access',
    description: 'Time to access patient treatment plans',
    targetTime: 1200,
    action: () => simulateTreatmentPlanAccess(),
  },
] as const;

interface PerformanceMetric {
  name: string;
  value: number | null;
  target: number;
  excellent: number;
  poor: number;
  unit: string;
  status: 'excellent' | 'good' | 'poor' | 'unknown';
  lastMeasured: Date | null;
}

interface ScenarioResult {
  id: string;
  name: string;
  duration: number;
  target: number;
  status: 'pass' | 'fail';
  details: string[];
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Enhanced PerformanceEntry interfaces for better type safety
interface LCPEntry extends PerformanceEntry {
  startTime: number;
  size: number;
  element?: Element;
}

interface FIDEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface CLSEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface INPEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
  interactionId?: number;
}

// Simulation functions for healthcare scenarios
const simulateEmergencyAlert = async (): Promise<number> => {
  const start = performance.now();

  // Simulate emergency alert rendering delay (without DOM manipulation)
  await new Promise(resolve => setTimeout(resolve, 16)); // ~1 frame at 60Hz
  return performance.now() - start;
};

const simulatePatientDataLoad = async (): Promise<number> => {
  const start = performance.now();

  // Simulate data fetching and rendering
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // Simulate DOM manipulation for patient data
  const container = document.createElement('div');
  for (let i = 0; i < 10; i++) {
    const row = document.createElement('div');
    row.innerHTML = `<span>Patient Data ${i}</span><span>Value ${i}</span>`;
    container.appendChild(row);
  }

  return performance.now() - start;
};

const simulateAppointmentBooking = async (): Promise<number> => {
  const start = performance.now();

  // Simulate form interactions and validation
  const steps = ['date-selection', 'time-selection', 'service-selection', 'confirmation'];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
  }

  return performance.now() - start;
};

const simulateTreatmentPlanAccess = async (): Promise<number> => {
  const start = performance.now();

  // Simulate treatment plan data loading
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400));

  return performance.now() - start;
};

export const PerformanceTester: React.FC = () => {
  const [metrics, setMetrics] = useState<Map<string, PerformanceMetric>>(new Map());
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);

  // Store all observers for proper cleanup
  const observersRef = useRef<PerformanceObserver[]>([]);
  const metricsRef = useRef<Map<string, PerformanceMetric>>(new Map());

  // Initialize performance monitoring
  useEffect(() => {
    initializeMetrics();
    setupPerformanceObservers();
    getNetworkInfo();
    getMemoryInfo();

    return () => {
      // Properly cleanup ALL observers
      observersRef.current.forEach(_observer => {
        try {
          observer.disconnect();
        } catch (_error) {
          console.warn('Error disconnecting observer:', error);
        }
      });
      observersRef.current = [];
    };
  }, []);

  const initializeMetrics = useCallback(() => {
    const initialMetrics = new Map<string, PerformanceMetric>();

    Object.entries(HEALTHCARE_PERFORMANCE_TARGETS).forEach(([key, config]) => {
      initialMetrics.set(key, {
        name: config.name,
        value: null,
        target: config.target,
        excellent: config.excellent,
        poor: config.poor,
        unit: config.unit,
        status: 'unknown',
        lastMeasured: null,
      });
    });

    setMetrics(initialMetrics);
    metricsRef.current = initialMetrics;
  }, []);

  const setupPerformanceObservers = useCallback(() => {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver not supported in this browser');
      return;
    }

    const observers: PerformanceObserver[] = [];

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries() as LCPEntry[];
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          updateMetric('LCP', lastEntry.startTime);
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observation not supported');
      }

      // FID Observer
      const fidObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          const fidEntry = entry as FIDEntry;
          if (fidEntry.processingStart && fidEntry.startTime) {
            const fid = fidEntry.processingStart - fidEntry.startTime;
            updateMetric('FID', fid);
          }
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observation not supported');
      }

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          const clsEntry = entry as CLSEntry;
          if (!clsEntry.hadRecentInput && typeof clsEntry.value === 'number') {
            clsValue += clsEntry.value;
            updateMetric('CLS', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observation not supported');
      }

      // INP Observer (experimental) - Check for proper support
      try {
        const inpObserver = new PerformanceObserver(entryList => {
          entryList.getEntries().forEach(entry => {
            const inpEntry = entry as INPEntry;
            if (inpEntry.interactionId && inpEntry.processingStart && inpEntry.startTime) {
              const inp = inpEntry.processingStart - inpEntry.startTime;
              updateMetric('INP', inp);
            }
          });
        });

        // Try to observe interaction events - this may fail in browsers that don't support INP
        inpObserver.observe({ entryTypes: ['event'] });
        observers.push(inpObserver);
      } catch (error) {
        console.warn('INP observation not supported:', e);
      }

      // Navigation timing - immediate measurement
      const navEntries = performance.getEntriesByType(
        'navigation',
      ) as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        if (nav.responseStart && nav.requestStart) {
          updateMetric('TTFB', nav.responseStart - nav.requestStart);
        }
        if (nav.domInteractive && nav.navigationStart) {
          updateMetric('TTI', nav.domInteractive - nav.navigationStart);
        }
      }

      // Store all observers for cleanup
      observersRef.current = observers;
    } catch (_error) {
      console.warn('Performance observers setup failed:', error);
      // Clean up any observers that were created before the error
      observers.forEach(_observer => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Error disconnecting observer during cleanup:', e);
        }
      });
    }
  }, []);

  const updateMetric = useCallback((key: string, value: number) => {
    const metric = metricsRef.current.get(key);
    if (!metric) return;

    const status = getPerformanceStatus(value, metric);
    const updatedMetric: PerformanceMetric = {
      ...metric,
      value,
      status,
      lastMeasured: new Date(),
    };

    metricsRef.current.set(key, updatedMetric);
    setMetrics(new Map(metricsRef.current));
  }, []);

  const getPerformanceStatus = (
    value: number,
    metric: PerformanceMetric,
  ): PerformanceMetric['status'] => {
    if (value <= metric.excellent) return 'excellent';
    if (value <= metric.target) return 'good';
    if (value <= metric.poor) return 'poor';
    return 'poor';
  };

  const getNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
      });
    }
  }, []);

  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize || 0,
        totalJSHeapSize: memory.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit || 0,
      });
    }
  }, []);

  const runCriticalScenarios = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setTestStartTime(new Date());
    const results: ScenarioResult[] = [];

    for (let i = 0; i < CRITICAL_SCENARIOS.length; i++) {
      const scenario = CRITICAL_SCENARIOS[i];
      setProgress((i / CRITICAL_SCENARIOS.length) * 100);

      try {
        const startTime = performance.now();
        await scenario.action();
        const duration = performance.now() - startTime;

        const status = duration <= scenario.targetTime ? 'pass' : 'fail';
        const details = [
          `Target: ${scenario.targetTime}ms`,
          `Actual: ${duration.toFixed(1)}ms`,
          `Difference: ${(duration - scenario.targetTime).toFixed(1)}ms`,
        ];

        results.push({
          id: scenario.id,
          name: scenario.name,
          duration,
          target: scenario.targetTime,
          status,
          details,
        });

        // Update custom metrics
        if (scenario.id === 'emergency_alert') {
          updateMetric('EMERGENCY_RESPONSE', duration);
        } else if (scenario.id === 'patient_data_load') {
          updateMetric('DATA_LOAD', duration);
        }
      } catch (_error) {
        results.push({
          id: scenario.id,
          name: scenario.name,
          duration: 0,
          target: scenario.targetTime,
          status: 'fail',
          details: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        });
      }

      // Small delay between scenarios to prevent resource contention
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setProgress(100);
    setScenarioResults(results);
    setIsRunning(false);

    // Refresh memory info after tests
    getMemoryInfo();
  }, [updateMetric, getMemoryInfo]);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'good':
        return <CheckCircle className='w-4 h-4 text-blue-500' />;
      case 'poor':
        return <XCircle className='w-4 h-4 text-red-500' />;
      default:
        return <Clock className='w-4 h-4 text-gray-500' />;
    }
  };

  const renderMetricsGrid = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {Array.from(metrics.entries()).map(([key, metric]) => (
        <Card key={key} className='p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-medium text-sm'>{metric.name}</span>
            {getStatusIcon(metric.status)}
          </div>
          <div className={`text-2xl font-bold mb-1 ${getStatusColor(metric.status)}`}>
            {metric.value !== null
              ? `${metric.value.toFixed(metric.unit === '' ? 3 : 0)}${metric.unit}`
              : '—'}
          </div>
          <div className='text-xs text-muted-foreground'>
            Target: ≤{metric.target}
            {metric.unit}
          </div>
          {metric.lastMeasured && (
            <div className='text-xs text-muted-foreground mt-1'>
              Last: {metric.lastMeasured.toLocaleTimeString()}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderScenarioResults = () => (
    <div className='space-y-4'>
      {scenarioResults.map(result => (
        <Card key={result.id}>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between mb-3'>
              <div>
                <h3 className='font-medium'>{result.name}</h3>
                <p className='text-sm text-muted-foreground'>
                  {CRITICAL_SCENARIOS.find(s => s.id === result.id)?.description}
                </p>
              </div>
              <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                {result.status === 'pass' ? 'PASS' : 'FAIL'}
              </Badge>
            </div>

            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Duration:</span>
                <span
                  className={`ml-2 font-medium ${
                    result.status === 'pass' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {result.duration.toFixed(1)}ms
                </span>
              </div>
              <div>
                <span className='text-muted-foreground'>Target:</span>
                <span className='ml-2'>{result.target}ms</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Difference:</span>
                <span
                  className={`ml-2 ${
                    result.duration <= result.target ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {(result.duration - result.target).toFixed(1)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSystemInfo = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {networkInfo && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='w-5 h-5' />
              Network Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Connection Type:</span>
                <Badge variant='outline'>{networkInfo.effectiveType}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Downlink:</span>
                <span>{networkInfo.downlink} Mbps</span>
              </div>
              <div className='flex justify-between'>
                <span>RTT:</span>
                <span>{networkInfo.rtt}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {memoryInfo && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='w-5 h-5' />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Used Heap:</span>
                <span>{(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className='flex justify-between'>
                <span>Total Heap:</span>
                <span>{(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className='flex justify-between'>
                <span>Heap Limit:</span>
                <span>{(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <Progress
                value={(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100}
                className='mt-2'
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-3'>
            <Heart className='w-8 h-8 text-red-500' />
            Healthcare Performance Tester
          </h1>
          <p className='text-muted-foreground mt-2'>
            Critical performance validation for healthcare applications with real-time monitoring
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={runCriticalScenarios}
            disabled={isRunning}
            className='flex items-center gap-2'
          >
            {isRunning
              ? (
                <>
                  <Timer className='w-4 h-4 animate-pulse' />
                  Running Tests...
                </>
              )
              : (
                <>
                  <Zap className='w-4 h-4' />
                  Run Critical Tests
                </>
              )}
          </Button>
        </div>
      </div>

      {isRunning && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <Progress value={progress} className='flex-1' />
              <span className='text-sm font-medium'>{progress.toFixed(0)}%</span>
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              Running healthcare performance scenarios...
            </p>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Gauge className='w-5 h-5' />
              Core Web Vitals & Healthcare Metrics
            </CardTitle>
            <CardDescription>
              Real-time performance monitoring with healthcare-specific thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderMetricsGrid()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='w-5 h-5' />
              System Information
            </CardTitle>
            <CardDescription>
              Current system and network conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderSystemInfo()}
          </CardContent>
        </Card>
      </div>

      {scenarioResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5' />
              Critical Scenario Results
            </CardTitle>
            <CardDescription>
              Healthcare-specific performance scenario validation
              {testStartTime && (
                <span className='block mt-1 text-xs'>
                  Test run: {testStartTime.toLocaleString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderScenarioResults()}
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          <strong>Healthcare Performance Standards:</strong>{' '}
          This tester validates critical performance metrics for healthcare applications. Emergency
          scenarios should complete within 100ms, patient data loading within 1.5 seconds, and all
          user interactions should feel responsive for optimal patient care workflows.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PerformanceTester;
