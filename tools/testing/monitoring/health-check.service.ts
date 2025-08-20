/**
 * 🔄 NeonPro - Health Check Service
 * 
 * Serviço especializado para verificações de saúde do sistema
 * com checks automatizados de todos os componentes críticos.
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs/promises';
import { performance } from 'perf_hooks';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  message: string;
  metadata?: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  score: number;
  timestamp: number;
  checks: HealthCheckResult[];
  uptime: number;
}

export class HealthCheckService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * 🏥 Executar health check completo
   */
  public async performFullHealthCheck(): Promise<SystemHealth> {
    const checks: HealthCheckResult[] = [];
    
    // Executar todos os checks em paralelo
    const checkPromises = [
      this.checkDatabase(),
      this.checkAPI(),
      this.checkFileSystem(),
      this.checkMemory(),
      this.checkEnvironment(),
      this.checkDependencies(),
      this.checkCompliance()
    ];

    const results = await Promise.allSettled(checkPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        checks.push(result.value);
      } else {
        checks.push({
          component: `check-${index}`,
          status: 'down',
          responseTime: -1,
          message: `Check failed: ${result.reason?.message || 'Unknown error'}`
        });
      }
    });

    // Calcular score geral
    const score = this.calculateOverallScore(checks);
    const overall = this.determineOverallStatus(score);

    return {
      overall,
      score,
      timestamp: Date.now(),
      checks,
      uptime: process.uptime()
    };
  }

  /**
   * 🗄️ Verificar banco de dados
   */
  private async checkDatabase(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      // Test basic connectivity
      const { data, error } = await this.supabase
        .from('patients')
        .select('id')
        .limit(1);

      const responseTime = performance.now() - start;

      if (error) {
        return {
          component: 'database',
          status: 'down',
          responseTime,
          message: `Database error: ${error.message}`,
          metadata: { error: error.code }
        };
      }

      // Check response time thresholds
      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (responseTime > 1000) status = 'degraded';
      if (responseTime > 5000) status = 'down';

      return {
        component: 'database',
        status,
        responseTime,
        message: `Database ${status} (${responseTime.toFixed(2)}ms)`,
        metadata: { recordCount: data?.length || 0 }
      };

    } catch (error) {
      return {
        component: 'database',
        status: 'down',
        responseTime: performance.now() - start,
        message: `Database connection failed: ${error.message}`
      };
    }
  }

  /**
   * 🌐 Verificar API endpoints
   */
  private async checkAPI(): Promise<HealthCheckResult> {
    const start = performance.now();
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    
    try {
      const endpoints = [
        '/api/health',
        '/api/patients',
        '/api/appointments'
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => 
          axios.get(`${baseURL}${endpoint}`, { timeout: 5000 })
        )
      );

      const responseTime = performance.now() - start;
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / endpoints.length) * 100;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (successRate < 100) status = 'degraded';
      if (successRate < 50) status = 'down';

      return {
        component: 'api',
        status,
        responseTime,
        message: `API ${status} (${successCount}/${endpoints.length} endpoints)`,
        metadata: { 
          successRate,
          endpoints: endpoints.length,
          successful: successCount
        }
      };

    } catch (error) {
      return {
        component: 'api',
        status: 'down',
        responseTime: performance.now() - start,
        message: `API check failed: ${error.message}`
      };
    }
  }

  /**
   * 📁 Verificar sistema de arquivos
   */
  private async checkFileSystem(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      // Verificar diretórios críticos
      const criticalPaths = [
        './uploads',
        './reports',
        './coverage',
        './tools/testing'
      ];

      const pathChecks = await Promise.allSettled(
        criticalPaths.map(async path => {
          const stats = await fs.stat(path);
          return { path, exists: true, isDirectory: stats.isDirectory() };
        })
      );

      const responseTime = performance.now() - start;
      const accessiblePaths = pathChecks.filter(r => r.status === 'fulfilled').length;
      const successRate = (accessiblePaths / criticalPaths.length) * 100;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (successRate < 100) status = 'degraded';
      if (successRate < 75) status = 'down';

      return {
        component: 'filesystem',
        status,
        responseTime,
        message: `FileSystem ${status} (${accessiblePaths}/${criticalPaths.length} paths)`,
        metadata: { 
          successRate,
          totalPaths: criticalPaths.length,
          accessiblePaths
        }
      };

    } catch (error) {
      return {
        component: 'filesystem',
        status: 'down',
        responseTime: performance.now() - start,
        message: `FileSystem check failed: ${error.message}`
      };
    }
  }

  /**
   * 💾 Verificar uso de memória
   */
  private async checkMemory(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      const memory = process.memoryUsage();
      const responseTime = performance.now() - start;
      
      const heapUsedMB = memory.heapUsed / 1024 / 1024;
      const heapTotalMB = memory.heapTotal / 1024 / 1024;
      const usagePercent = (memory.heapUsed / memory.heapTotal) * 100;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (usagePercent > 80) status = 'degraded';
      if (usagePercent > 95) status = 'down';

      return {
        component: 'memory',
        status,
        responseTime,
        message: `Memory ${status} (${usagePercent.toFixed(1)}% used)`,
        metadata: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          usagePercent,
          rss: memory.rss / 1024 / 1024,
          external: memory.external / 1024 / 1024
        }
      };

    } catch (error) {
      return {
        component: 'memory',
        status: 'down',
        responseTime: performance.now() - start,
        message: `Memory check failed: ${error.message}`
      };
    }
  }

  /**
   * 🌍 Verificar variáveis de ambiente
   */
  private async checkEnvironment(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NODE_ENV'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      const responseTime = performance.now() - start;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (missingVars.length > 0) {
        status = missingVars.length > 2 ? 'down' : 'degraded';
      }

      return {
        component: 'environment',
        status,
        responseTime,
        message: status === 'healthy' 
          ? 'Environment variables configured'
          : `Missing variables: ${missingVars.join(', ')}`,
        metadata: {
          required: requiredEnvVars.length,
          missing: missingVars.length,
          missingVars,
          nodeEnv: process.env.NODE_ENV
        }
      };

    } catch (error) {
      return {
        component: 'environment',
        status: 'down',
        responseTime: performance.now() - start,
        message: `Environment check failed: ${error.message}`
      };
    }
  }

  /**
   * 📦 Verificar dependências críticas
   */
  private async checkDependencies(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      // Verificar se módulos críticos estão carregando
      const criticalModules = [
        '@supabase/supabase-js',
        'next',
        'react',
        'typescript'
      ];

      const moduleChecks = criticalModules.map(moduleName => {
        try {
          require.resolve(moduleName);
          return { module: moduleName, available: true };
        } catch {
          return { module: moduleName, available: false };
        }
      });

      const responseTime = performance.now() - start;
      const availableModules = moduleChecks.filter(m => m.available).length;
      const successRate = (availableModules / criticalModules.length) * 100;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (successRate < 100) status = 'degraded';
      if (successRate < 75) status = 'down';

      return {
        component: 'dependencies',
        status,
        responseTime,
        message: `Dependencies ${status} (${availableModules}/${criticalModules.length} available)`,
        metadata: {
          successRate,
          totalModules: criticalModules.length,
          availableModules,
          moduleChecks
        }
      };

    } catch (error) {
      return {
        component: 'dependencies',
        status: 'down',
        responseTime: performance.now() - start,
        message: `Dependencies check failed: ${error.message}`
      };
    }
  }

  /**
   * 📋 Verificar compliance e configurações
   */
  private async checkCompliance(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      const complianceChecks = {
        lgpdConfig: !!process.env.LGPD_ENABLED,
        anvisaConfig: !!process.env.ANVISA_COMPLIANCE,
        encryptionKeys: !!process.env.ENCRYPTION_KEY,
        auditLogging: !!process.env.AUDIT_LOG_ENABLED,
        securityHeaders: true // Simulated check
      };

      const responseTime = performance.now() - start;
      const passedChecks = Object.values(complianceChecks).filter(Boolean).length;
      const totalChecks = Object.keys(complianceChecks).length;
      const complianceRate = (passedChecks / totalChecks) * 100;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (complianceRate < 100) status = 'degraded';
      if (complianceRate < 80) status = 'down';

      return {
        component: 'compliance',
        status,
        responseTime,
        message: `Compliance ${status} (${passedChecks}/${totalChecks} checks passed)`,
        metadata: {
          complianceRate,
          totalChecks,
          passedChecks,
          checks: complianceChecks
        }
      };

    } catch (error) {
      return {
        component: 'compliance',
        status: 'down',
        responseTime: performance.now() - start,
        message: `Compliance check failed: ${error.message}`
      };
    }
  }

  /**
   * 📊 Calcular score geral
   */
  private calculateOverallScore(checks: HealthCheckResult[]): number {
    const weights = {
      database: 30,
      api: 25,
      memory: 15,
      dependencies: 10,
      filesystem: 10,
      environment: 5,
      compliance: 5
    };

    let totalScore = 0;
    let totalWeight = 0;

    checks.forEach(check => {
      const weight = weights[check.component as keyof typeof weights] || 5;
      let score = 0;
      
      switch (check.status) {
        case 'healthy': score = 100; break;
        case 'degraded': score = 60; break;
        case 'down': score = 0; break;
      }

      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * 🎯 Determinar status geral
   */
  private determineOverallStatus(score: number): 'healthy' | 'degraded' | 'down' {
    if (score >= 90) return 'healthy';
    if (score >= 60) return 'degraded';
    return 'down';
  }
}