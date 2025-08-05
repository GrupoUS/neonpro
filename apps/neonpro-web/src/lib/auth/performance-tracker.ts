// Performance tracker utilities and monitoring

export interface PerformanceMetrics {
  duration: number;
  timestamp: number;
  operation: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  
  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  track(operation: string, metadata?: Record<string, any>): {
    end: (success?: boolean) => void;
  } {
    const startTime = Date.now();
    
    return {
      end: (success = true) => {
        const duration = Date.now() - startTime;
        const metrics: PerformanceMetrics = {
          duration,
          timestamp: startTime,
          operation,
          success,
          metadata,
        };
        
        this.logMetrics(metrics);
      },
    };
  }

  private logMetrics(metrics: PerformanceMetrics): void {
    console.log('[PERFORMANCE]', metrics);
    
    // Em produção, enviar para sistema de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Implementar envio para sistema de monitoramento
    }
  }
}

// Instância global
export const performanceTracker = PerformanceTracker.getInstance();

// Funções utilitárias específicas
export const trackMFAVerification = (data: any) => {
  console.log('[MFA PERFORMANCE]', data);
};

export const trackPerformance = (metric: string, value: number) => {
  console.log('[PERFORMANCE]', metric, value);
};

export const trackLoginPerformance = (data: any) => {
  console.log('[LOGIN PERFORMANCE]', data);
};

export const trackAuthPerformance = (operation: string, duration: number, success: boolean = true) => {
  const metrics: PerformanceMetrics = {
    duration,
    timestamp: Date.now(),
    operation: `auth.${operation}`,
    success,
  };
  console.log('[AUTH PERFORMANCE]', metrics);
};

export const trackAPIPerformance = (endpoint: string, method: string, duration: number, statusCode: number) => {
  const metrics: PerformanceMetrics = {
    duration,
    timestamp: Date.now(),
    operation: `api.${method}.${endpoint}`,
    success: statusCode >= 200 && statusCode < 400,
    metadata: { statusCode, method, endpoint },
  };
  console.log('[API PERFORMANCE]', metrics);
};

// Decorator para tracking automático
export function trackOperation(operationName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracker = performanceTracker.track(operationName);
      
      try {
        const result = await originalMethod.apply(this, args);
        tracker.end(true);
        return result;
      } catch (error) {
        tracker.end(false);
        throw error;
      }
    };

    return descriptor;
  };
}

export default performanceTracker;