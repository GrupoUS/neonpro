interface WarmupTarget {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  expectedStatusCode?: number;
  timeout?: number;
}

class FunctionWarmer {
  private targets: WarmupTarget[] = [];
  private warmupInterval: NodeJS.Timeout | null = null;
  private isWarming = false;

  constructor() {
    this.setupDefaultTargets();
  }

  private setupDefaultTargets() {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    this.targets = [
      {
        url: `${baseUrl}/api/health`,
        method: 'GET',
        expectedStatusCode: 200,
        timeout: 5000,
      },
      {
        url: `${baseUrl}/api/v1/health`,
        method: 'GET',
        expectedStatusCode: 200,
        timeout: 5000,
      },
      {
        url: `${baseUrl}/api/auth/validate`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'warmup-token' }),
        expectedStatusCode: 401, // Expected failure for warmup
        timeout: 5000,
      },
    ];
  }

  public startWarmup(intervalMinutes: number = 5) {
    if (this.warmupInterval) {
      this.stopWarmup();
    }

    this.warmupInterval = setInterval(() => {
      this.performWarmup();
    }, intervalMinutes * 60 * 1000);

    // Initial warmup
    this.performWarmup();
  }

  public stopWarmup() {
    if (this.warmupInterval) {
      clearInterval(this.warmupInterval);
      this.warmupInterval = null;
    }
  }

  private async performWarmup() {
    if (this.isWarming) return;

    this.isWarming = true;
    const results = [];

    try {
      for (const target of this.targets) {
        const result = await this.warmupTarget(target);
        results.push(result);
      }

      console.log('Function warmup completed:', {
        timestamp: new Date().toISOString(),
        results: results.filter(r => r.success).length,
        failures: results.filter(r => !r.success).length,
        totalTargets: this.targets.length,
      });
    } catch (error) {
      console.error('Warmup error:', error);
    } finally {
      this.isWarming = false;
    }
  }

  private async warmupTarget(target: WarmupTarget): Promise<{
    url: string;
    success: boolean;
    duration: number;
    statusCode?: number;
    error?: string;
  }> {
    const start = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), target.timeout || 5000);

      const response = await fetch(target.url, {
        method: target.method,
        headers: target.headers,
        body: target.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = performance.now() - start;

      const expectedStatus = target.expectedStatusCode || 200;
      const success = response.status === expectedStatus;

      return {
        url: target.url,
        success,
        duration,
        statusCode: response.status,
      };
    } catch (error) {
      const duration = performance.now() - start;
      return {
        url: target.url,
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public addTarget(target: WarmupTarget) {
    this.targets.push(target);
  }

  public removeTarget(url: string) {
    this.targets = this.targets.filter(t => t.url !== url);
  }

  public getTargets(): WarmupTarget[] {
    return [...this.targets];
  }
}

export const functionWarmer = new FunctionWarmer();

// Auto-start in production
if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
  functionWarmer.startWarmup(5); // Warm every 5 minutes
}
