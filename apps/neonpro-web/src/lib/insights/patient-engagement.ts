// lib/insights/patient-engagement.ts
export interface EngagementMetrics {
  patient_id: string;
  engagement_score: number;
  last_interaction: string;
  preferred_channel: 'email' | 'sms' | 'app' | 'phone';
  response_rate: number;
  appointment_adherence: number;
  portal_usage: number;
  satisfaction_score?: number;
}

export interface EngagementInsight {
  type: 'high_risk' | 'improving' | 'stable' | 'excellent';
  message: string;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EngagementAnalysis {
  patient_id: string;
  current_score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  insights: EngagementInsight[];
  next_actions: string[];
}

export class PatientEngagementInsights {
  private metrics: Map<string, EngagementMetrics> = new Map();

  addPatientMetrics(metrics: EngagementMetrics): void {
    this.metrics.set(metrics.patient_id, metrics);
  }

  analyzePatientEngagement(patientId: string): EngagementAnalysis | null {
    const metrics = this.metrics.get(patientId);
    if (!metrics) {
      return null;
    }

    const insights = this.generateInsights(metrics);
    const nextActions = this.generateNextActions(metrics, insights);

    return {
      patient_id: patientId,
      current_score: metrics.engagement_score,
      trend: this.calculateTrend(metrics),
      insights,
      next_actions: nextActions
    };
  }

  private generateInsights(metrics: EngagementMetrics): EngagementInsight[] {
    const insights: EngagementInsight[] = [];

    // High risk insight
    if (metrics.engagement_score < 30) {
      insights.push({
        type: 'high_risk',
        message: 'Patient shows very low engagement levels',
        recommendations: [
          'Schedule a personal follow-up call',
          'Review communication preferences',
          'Consider alternative engagement strategies'
        ],
        priority: 'critical'
      });
    }

    // Appointment adherence insight
    if (metrics.appointment_adherence < 0.7) {
      insights.push({
        type: 'high_risk',
        message: 'Low appointment adherence rate',
        recommendations: [
          'Send reminder notifications 24h before appointments',
          'Offer flexible scheduling options',
          'Discuss barriers to attendance'
        ],
        priority: 'high'
      });
    }

    // Portal usage insight
    if (metrics.portal_usage < 0.3) {
      insights.push({
        type: 'improving',
        message: 'Low patient portal engagement',
        recommendations: [
          'Provide portal navigation training',
          'Highlight portal benefits and features',
          'Send educational materials about self-service options'
        ],
        priority: 'medium'
      });
    }

    // Excellent engagement
    if (metrics.engagement_score > 80) {
      insights.push({
        type: 'excellent',
        message: 'Patient shows excellent engagement',
        recommendations: [
          'Continue current communication strategy',
          'Consider patient as advocate for others',
          'Gather feedback for best practices'
        ],
        priority: 'low'
      });
    }

    return insights;
  }

  private generateNextActions(metrics: EngagementMetrics, insights: EngagementInsight[]): string[] {
    const actions: string[] = [];

    // Add actions based on insights
    insights.forEach(insight => {
      if (insight.priority === 'critical' || insight.priority === 'high') {
        actions.push(...insight.recommendations.slice(0, 2));
      }
    });

    // Add general actions based on metrics
    const daysSinceLastInteraction = this.getDaysSinceLastInteraction(metrics.last_interaction);
    if (daysSinceLastInteraction > 30) {
      actions.push('Schedule wellness check-in');
    }

    if (metrics.response_rate < 0.5) {
      actions.push('Review and optimize communication timing');
    }

    return actions;
  }

  private calculateTrend(metrics: EngagementMetrics): 'increasing' | 'decreasing' | 'stable' {
    // Simplified trend calculation - in real implementation, this would use historical data
    if (metrics.engagement_score > 70) return 'increasing';
    if (metrics.engagement_score < 40) return 'decreasing';
    return 'stable';
  }

  private getDaysSinceLastInteraction(lastInteraction: string): number {
    const lastDate = new Date(lastInteraction);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getBulkAnalysis(patientIds: string[]): EngagementAnalysis[] {
    return patientIds
      .map(id => this.analyzePatientEngagement(id))
      .filter((analysis): analysis is EngagementAnalysis => analysis !== null);
  }

  getEngagementSummary(): {
    total_patients: number;
    high_engagement: number;
    medium_engagement: number;
    low_engagement: number;
    average_score: number;
  } {
    const allMetrics = Array.from(this.metrics.values());
    const total = allMetrics.length;
    
    if (total === 0) {
      return {
        total_patients: 0,
        high_engagement: 0,
        medium_engagement: 0,
        low_engagement: 0,
        average_score: 0
      };
    }

    const high = allMetrics.filter(m => m.engagement_score >= 70).length;
    const medium = allMetrics.filter(m => m.engagement_score >= 40 && m.engagement_score < 70).length;
    const low = allMetrics.filter(m => m.engagement_score < 40).length;
    const average = allMetrics.reduce((sum, m) => sum + m.engagement_score, 0) / total;

    return {
      total_patients: total,
      high_engagement: high,
      medium_engagement: medium,
      low_engagement: low,
      average_score: Math.round(average * 10) / 10
    };
  }
}

export const patientEngagementInsights = new PatientEngagementInsights();
