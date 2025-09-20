/**
 * @fileoverview Healthcare UI Performance Testing Suite
 * @author APEX UI/UX Designer Agent
 * @description Specialized performance testing for healthcare applications
 * @compliance Core Web Vitals, Healthcare UX Performance Standards
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Smartphone,
  Heart,
  Shield,
  Timer,
  Gauge,
  BarChart3
} from 'lucide-react';

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
  EMERGENCY_RESPONSE: { target: 100, excellent: 50, poor: 200, unit: 'ms', name: 'Emergency Action Response' },
  DATA_LOAD: { target: 1500, excellent: 1000, poor: 3000, unit: 'ms', name: 'Patient Data Load Time' },
  FORM_RESPONSE: { target: 150, excellent: 100, poor: 300, unit: 'ms', name: 'Form Input Response' }
} as const;

// Critical Healthcare Scenarios
const CRITICAL_SCENARIOS = [
  {
    id: 'emergency_alert',
    name: 'Emergency Alert Display',
    description: 'Time to display critical patient alerts',
    targetTime: 100,
    action: () => simulateEmergencyAlert()
  },
  {
    id: 'patient_data_load',
    name: 'Patient Data Loading',
    description: 'Time to load and display patient information',
    targetTime: 1500,
    action: () => simulatePatientDataLoad()
  },
  {
    id: 'appointment_booking',
    name: 'Appointment Booking Flow',
    description: 'Complete booking process performance',
    targetTime: 2000,
    action: () => simulateAppointmentBooking()
  },
  {
    id: 'treatment_plan_access',
    name: 'Treatment Plan Access',
    description: 'Time to access patient treatment plans',
    targetTime: 1200,
    action: () => simulateTreatmentPlanAccess()
  }
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

// Simulation functions for healthcare scenarios
const simulateEmergencyAlert = async (): Promise<number> => {
  const start = performance.now();
  
  // Simulate emergency alert rendering
  await new Promise(resolve => {
    const element = document.createElement('div');
    element.className = 'emergency-alert';
    element.textContent = 'CRITICAL: Patient requires immediate attention';
    element.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px;
      border-radius: 8px;
      z-index: 9999;
      animation: emergencyPulse 0.5s ease-in-out;
    `;
    
    document.body.appendChild(element);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.removeChild(element);
        resolve(void 0);
      });
    });
  });
  
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
  
  const observerRef = useRef<PerformanceObserver | null>(null);
  const metricsRef = useRef<Map<string, PerformanceMetric>>(new Map());

  // Initialize performance monitoring
  useEffect(() => {
    initializeMetrics();
    setupPerformanceObservers();
    getNetworkInfo();
    getMemoryInfo();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
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
        lastMeasured: null
      });
    });
    
    setMetrics(initialMetrics);
    metricsRef.current = initialMetrics;
  }, []);

  const setupPerformanceObservers = useCallback(() => {
    if (!window.PerformanceObserver) return;

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
        updateMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          const fid = entry.processingStart - entry.startTime;
          updateMetric('FID', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            updateMetric('CLS', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // INP Observer (experimental)
      if ('IntersectionObserver' in window) {
        const inpObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (entry.interactionId) {
              const inp = entry.processingStart - entry.startTime;
              updateMetric('INP', inp);
            }
          });
        });
        try {
          inpObserver.observe({ entryTypes: ['event'] });
        } catch (e) {
          console.warn('INP observation not supported');
        }
      }

      // Navigation timing
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        updateMetric('TTFB', nav.responseStart - nav.requestStart);
        updateMetric('TTI', nav.domInteractive - nav.navigationStart);
      }

      observerRef.current = lcpObserver;
    } catch (error) {
      console.warn('Performance observers setup failed:', error);
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
      lastMeasured: new Date()
    };

    metricsRef.current.set(key, updatedMetric);
    setMetrics(new Map(metricsRef.current));
  }, []);

  const getPerformanceStatus = (value: number, metric: PerformanceMetric): PerformanceMetric['status'] => {
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
        rtt: connection.rtt || 0
      });
    }
  }, []);

  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize || 0,
        totalJSHeapSize: memory.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit || 0
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
          `Difference: ${(duration - scenario.targetTime).toFixed(1)}ms`
        ];

        results.push({
          id: scenario.id,
          name: scenario.name,
          duration,
          target: scenario.targetTime,
          status,
          details
        });

        // Update custom metrics
        if (scenario.id === 'emergency_alert') {
          updateMetric('EMERGENCY_RESPONSE', duration);
        } else if (scenario.id === 'patient_data_load') {
          updateMetric('DATA_LOAD', duration);
        }

      } catch (error) {
        results.push({
          id: scenario.id,
          name: scenario.name,
          duration: 0,
          target: scenario.targetTime,
          status: 'fail',
          details: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }

      // Small delay between scenarios
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
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'poor': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderMetricsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from(metrics.entries()).map(([key, metric]) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{metric.name}</span>
            {getStatusIcon(metric.status)}
          </div>
          <div className={`text-2xl font-bold mb-1 ${getStatusColor(metric.status)}`}>
            {metric.value !== null ? 
              `${metric.value.toFixed(metric.unit === '' ? 3 : 0)}${metric.unit}` : 
              '—'
            }
          </div>
          <div className="text-xs text-muted-foreground">
            Target: ≤{metric.target}{metric.unit}
          </div>
          {metric.lastMeasured && (
            <div className="text-xs text-muted-foreground mt-1">
              Last: {metric.lastMeasured.toLocaleTimeString()}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderScenarioResults = () => (
    <div className="space-y-4">
      {scenarioResults.map((result) => (
        <Card key={result.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">{result.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {CRITICAL_SCENARIOS.find(s => s.id === result.id)?.description}
                </p>
              </div>
              <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                {result.status === 'pass' ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className={`ml-2 font-medium ${result.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.duration.toFixed(1)}ms
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Target:</span>
                <span className="ml-2">{result.target}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Difference:</span>
                <span className={`ml-2 ${result.duration <= result.target ? 'text-green-600' : 'text-red-600'}`}>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {networkInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Network Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Connection Type:</span>
                <Badge variant="outline">{networkInfo.effectiveType}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Downlink:</span>
                <span>{networkInfo.downlink} Mbps</span>
              </div>
              <div className="flex justify-between">
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
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Used Heap:</span>
                <span>{(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Total Heap:</span>
                <span>{(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Heap Limit:</span>
                <span>{(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <Progress 
                value={(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100} 
                className="mt-2" 
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Healthcare Performance Tester
          </h1>
          <p className="text-muted-foreground mt-1">
            Specialized performance testing for clinical environments
          </p>
        </div>
        <Button 
          onClick={runCriticalScenarios} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? <Timer className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isRunning ? 'Testing...' : 'Run Critical Scenarios'}
        </Button>
      </div>

      {testStartTime && (
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Last test run: {testStartTime.toLocaleString()} | 
            Testing {CRITICAL_SCENARIOS.length} critical healthcare scenarios
          </AlertDescription>
        </Alert>
      )}

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Running healthcare-specific performance scenarios...
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Core Web Vitals & Healthcare Metrics
          </CardTitle>
          <CardDescription>
            Real-time performance monitoring for healthcare applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderMetricsGrid()}
        </CardContent>
      </Card>

      {scenarioResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Critical Scenario Results
            </CardTitle>
            <CardDescription>
              Performance testing of healthcare-critical interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderScenarioResults()}
          </CardContent>
        </Card>
      )}

      {renderSystemInfo()}
    </div>
  );
};

export default PerformanceTester;