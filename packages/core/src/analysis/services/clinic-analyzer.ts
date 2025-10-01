// Simple clinic analyzer for Brazilian aesthetic clinics
// KISS principle: real value for clinic operations

import { SimpleClinicAnalysis, Finding } from '../types/codebase-analysis';
import { FindingType, SeverityLevel } from '../types/finding';

export interface ClinicAnalysisRequest {
  clinicName: string;
  website?: string;
  hasBookingSystem: boolean;
  hasPaymentSystem: boolean;
  patientDataStorage: boolean;     // LGPD relevant
}

export class ClinicAnalyzer {
  static analyze(request: ClinicAnalysisRequest): SimpleClinicAnalysis {
    const findings = this.generateFindings(request);
    const criticalMetrics = this.calculateCriticalMetrics(request, findings);
    
    return {
      id: crypto.randomUUID(),
      clinicName: request.clinicName,
      analysisDate: new Date(),
      
      criticalMetrics,
      findings,
      
      status: this.calculateStatus(criticalMetrics, findings),
      
      brazilianCompliance: {
        lgpd: this.checkLGPDCompliance(request, findings),
        anvisa: this.checkAnvisaCompliance(findings),
        dataLocalization: this.checkDataLocalization(request)
      }
    };
  }
  
  private static generateFindings(request: ClinicAnalysisRequest): Finding[] {
    const findings: Finding[] = [];
    
    // LGPD violations (critical for Brazilian market)
    if (request.patientDataStorage && !this.hasLGPDCompliance()) {
      findings.push({
        id: crypto.randomUUID(),
        type: 'lgpd_violation',
        severity: 'critical',
        description: 'Dados de pacientes sem conformidade LGPD - risco de multa de até R$50 milhões',
        impact: {
          patients: true,    // Privacy breach risk
          revenue: true,     // Heavy fines
          compliance: true   // Legal requirement
        },
        solution: {
          description: 'Implementar conformidade LGPD completa (consentimento, criptografia, política de privacidade)',
          estimatedCost: 15000,    // BRL
          estimatedSavings: 50000, // Avoid fines
          priority: 'high'
        }
      });
    }
    
    // Mobile performance issues (70% of patients use mobile)
    if (request.website && !this.isMobileOptimized()) {
      findings.push({
        id: crypto.randomUUID(),
        type: 'performance_issue',
        severity: 'high',
        description: 'Site não otimizado para mobile - 70% dos pacientes acessam pelo celular',
        impact: {
          patients: true,    // Bad experience
          revenue: true,     // Lost conversions
          compliance: false
        },
        solution: {
          description: 'Otimizar site para mobile (design responsivo, carregamento rápido)',
          estimatedCost: 8000,
          estimatedSavings: 12000, // Increased conversions
          priority: 'high'
        }
      });
    }
    
    // Booking system reliability
    if (!request.hasBookingSystem) {
      findings.push({
        id: crypto.randomUUID(),
        type: 'booking_failure',
        severity: 'high',
        description: 'Sistema de agendamento inexistente ou falho - perda de receita direta',
        impact: {
          patients: true,    // Cannot book appointments
          revenue: true,     // Lost appointments
          compliance: false
        },
        solution: {
          description: 'Implementar sistema de agendamento online confiável com WhatsApp integration',
          estimatedCost: 10000,
          estimatedSavings: 15000, // Recovered appointments
          priority: 'high'
        }
      });
    }
    
    // Payment system security
    if (!request.hasPaymentSystem) {
      findings.push({
        id: crypto.randomUUID(),
        type: 'payment_issue',
        severity: 'medium',
        description: 'Sistema de pagamentos inseguro ou inexistente - risco de fraude',
        impact: {
          patients: false,   // Convenience issue
          revenue: true,     // Payment failures
          compliance: false
        },
        solution: {
          description: 'Implementar sistema de pagamentos seguro (Pix + Stripe com criptografia)',
          estimatedCost: 5000,
          estimatedSavings: 8000, // Reliable payments
          priority: 'medium'
        }
      });
    }
    
    return findings;
  }
  
  private static calculateCriticalMetrics(request: ClinicAnalysisRequest, findings: Finding[]): SimpleClinicAnalysis['criticalMetrics'] {
    const lgpdIssues = findings.filter(f => f.type === 'lgpd_violation').length;
    const performanceIssues = findings.filter(f => f.type === 'performance_issue').length;
    const bookingIssues = findings.filter(f => f.type === 'booking_failure').length;
    const paymentIssues = findings.filter(f => f.type === 'payment_issue').length;
    
    return {
      lgpdCompliance: Math.max(0, 100 - (lgpdIssues * 50)),  // Critical: -50 points per issue
      mobilePerformance: Math.max(0, 100 - (performanceIssues * 25)), // High: -25 points
      bookingReliability: Math.max(0, 100 - (bookingIssues * 30)),    // High: -30 points  
      paymentSecurity: Math.max(0, 100 - (paymentIssues * 20))        // Medium: -20 points
    };
  }
  
  private static calculateStatus(metrics: SimpleClinicAnalysis['criticalMetrics'], findings: Finding[]): SimpleClinicAnalysis['status'] {
    const criticalIssues = findings.filter(f => f.severity === 'critical').length;
    const lowScore = Object.values(metrics).some(score => score < 50);
    
    if (criticalIssues > 0 || lowScore) return 'critical';
    if (findings.filter(f => f.severity === 'high').length > 2) return 'warning';
    return 'healthy';
  }
  
  // Brazilian compliance checks
  private static checkLGPDCompliance(request: ClinicAnalysisRequest, findings: Finding[]): boolean {
    return findings.filter(f => f.type === 'lgpd_violation').length === 0;
  }
  
  private static checkAnvisaCompliance(findings: Finding[]): boolean {
    // Simple ANVISA compliance check for healthcare data
    return findings.filter(f => f.impact.patients && f.severity === 'critical').length === 0;
  }
  
  private static checkDataLocalization(request: ClinicAnalysisRequest): boolean {
    // Brazilian data residency requirement
    return request.patientDataStorage ? false : true; // Simplified check
  }
  
  // Helper methods (simplified)
  private static hasLGPDCompliance(): boolean { return false; } // Simplified for demo
  private static isMobileOptimized(): boolean { return false; } // Simplified for demo
}