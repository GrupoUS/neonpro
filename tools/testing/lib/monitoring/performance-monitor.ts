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
    complianceValidationTime: 0
  };

  static startMeasurement(operation: keyof HealthcarePerformanceMetrics): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.metrics[operation] = duration;
      
      // Healthcare-specific thresholds
      if (operation === 'patientDataLoadTime' && duration > 500) {
        console.warn('Patient data load time exceeds healthcare standard (500ms)');
      }
    };
  }

  static getMetrics(): HealthcarePerformanceMetrics {
    return { ...this.metrics };
  }

  static isHealthcareCompliant(): boolean {
    return (
      this.metrics.patientDataLoadTime < 500 &&
      this.metrics.apiResponseTime < 200 &&
      this.metrics.securityCheckTime < 100
    );
  }
}

export default PerformanceMonitor;