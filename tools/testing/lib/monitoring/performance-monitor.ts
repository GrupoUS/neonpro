// Performance monitor with healthcare-specific metrics
export interface HealthcarePerformanceMetrics {
  patientDataLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  securityCheckTime: number;
  complianceValidationTime: number;
}

export class PerformanceMonitor {
  private static metrics: HealthcarePerformanceMetrics = {
    patientDataLoadTime: 0,
    apiResponseTime: 0,
    databaseQueryTime: 0,
    securityCheckTime: 0,
    complianceValidationTime: 0,
  };

  static startMeasurement(
    operation: keyof HealthcarePerformanceMetrics,
  ): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      PerformanceMonitor.metrics[operation] = duration;

      // Healthcare-specific thresholds
      if (operation === 'patientDataLoadTime' && duration > 500) {}
    };
  }

  static getMetrics(): HealthcarePerformanceMetrics {
    return { ...PerformanceMonitor.metrics };
  }

  static isHealthcareCompliant(): boolean {
    return (
      PerformanceMonitor.metrics.patientDataLoadTime < 500
      && PerformanceMonitor.metrics.apiResponseTime < 200
      && PerformanceMonitor.metrics.securityCheckTime < 100
    );
  }
}

export default PerformanceMonitor;
