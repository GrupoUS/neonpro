/**
 * Healthcare Quality Assessment API Endpoint
 * Execute comprehensive ≥9.9/10 quality validation for production deployment
 */

import { type NextRequest, NextResponse } from 'next/server';
import { healthcareMonitoring } from '@/lib/monitoring/healthcare-monitoring';
import { healthcareQualityValidator } from '@/lib/quality/healthcare-quality-certification';

export async function POST(request: NextRequest) {
  try {
    console.log('🏥 Starting comprehensive healthcare quality assessment...');

    // Execute comprehensive quality assessment
    const certification =
      await healthcareQualityValidator.executeQualityAssessment();

    // Get assessment summary
    const summary = healthcareQualityValidator.getQualityAssessmentSummary();

    // Log quality assessment completion
    await healthcareMonitoring.monitorPatientSafety(
      'quality_assessment_completed',
      'system',
      'quality_validator',
      {
        overallScore: certification.overallScore,
        productionReady: certification.productionReady,
        criticalIssues: certification.criticalIssues.length,
        timestamp: new Date().toISOString(),
      },
    );

    console.log('🎖️ Healthcare quality assessment completed:', {
      overallScore: certification.overallScore,
      productionReady: certification.productionReady,
      criticalIssues: certification.criticalIssues.length,
    });

    return NextResponse.json({
      success: true,
      certification,
      summary,
      message: certification.productionReady
        ? '✅ Healthcare quality certification achieved - Production ready'
        : `❌ Quality certification failed - Score: ${certification.overallScore}/10 (Required: ≥9.9/10)`,
    });
  } catch (error) {
    console.error('❌ Healthcare quality assessment failed:', error);

    // Log assessment failure
    await healthcareMonitoring.triggerEmergencyAlert(
      'Healthcare quality assessment system failure',
      'critical',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Quality assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    // Get current quality metrics
    const summary = healthcareQualityValidator.getQualityAssessmentSummary();
    const healthcareMetrics = healthcareMonitoring.getMetrics();

    return NextResponse.json({
      success: true,
      summary,
      healthcareMetrics,
      message: 'Current healthcare quality status retrieved',
    });
  } catch (error) {
    console.error('❌ Failed to get quality status:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve quality status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
