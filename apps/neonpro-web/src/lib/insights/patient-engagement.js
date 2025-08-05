"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientEngagementInsights = exports.PatientEngagementInsights = void 0;
var PatientEngagementInsights = /** @class */ (function () {
    function PatientEngagementInsights() {
        this.metrics = new Map();
    }
    PatientEngagementInsights.prototype.addPatientMetrics = function (metrics) {
        this.metrics.set(metrics.patient_id, metrics);
    };
    PatientEngagementInsights.prototype.analyzePatientEngagement = function (patientId) {
        var metrics = this.metrics.get(patientId);
        if (!metrics) {
            return null;
        }
        var insights = this.generateInsights(metrics);
        var nextActions = this.generateNextActions(metrics, insights);
        return {
            patient_id: patientId,
            current_score: metrics.engagement_score,
            trend: this.calculateTrend(metrics),
            insights: insights,
            next_actions: nextActions
        };
    };
    PatientEngagementInsights.prototype.generateInsights = function (metrics) {
        var insights = [];
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
    };
    PatientEngagementInsights.prototype.generateNextActions = function (metrics, insights) {
        var actions = [];
        // Add actions based on insights
        insights.forEach(function (insight) {
            if (insight.priority === 'critical' || insight.priority === 'high') {
                actions.push.apply(actions, insight.recommendations.slice(0, 2));
            }
        });
        // Add general actions based on metrics
        var daysSinceLastInteraction = this.getDaysSinceLastInteraction(metrics.last_interaction);
        if (daysSinceLastInteraction > 30) {
            actions.push('Schedule wellness check-in');
        }
        if (metrics.response_rate < 0.5) {
            actions.push('Review and optimize communication timing');
        }
        return actions;
    };
    PatientEngagementInsights.prototype.calculateTrend = function (metrics) {
        // Simplified trend calculation - in real implementation, this would use historical data
        if (metrics.engagement_score > 70)
            return 'increasing';
        if (metrics.engagement_score < 40)
            return 'decreasing';
        return 'stable';
    };
    PatientEngagementInsights.prototype.getDaysSinceLastInteraction = function (lastInteraction) {
        var lastDate = new Date(lastInteraction);
        var now = new Date();
        var diffTime = Math.abs(now.getTime() - lastDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    PatientEngagementInsights.prototype.getBulkAnalysis = function (patientIds) {
        var _this = this;
        return patientIds
            .map(function (id) { return _this.analyzePatientEngagement(id); })
            .filter(function (analysis) { return analysis !== null; });
    };
    PatientEngagementInsights.prototype.getEngagementSummary = function () {
        var allMetrics = Array.from(this.metrics.values());
        var total = allMetrics.length;
        if (total === 0) {
            return {
                total_patients: 0,
                high_engagement: 0,
                medium_engagement: 0,
                low_engagement: 0,
                average_score: 0
            };
        }
        var high = allMetrics.filter(function (m) { return m.engagement_score >= 70; }).length;
        var medium = allMetrics.filter(function (m) { return m.engagement_score >= 40 && m.engagement_score < 70; }).length;
        var low = allMetrics.filter(function (m) { return m.engagement_score < 40; }).length;
        var average = allMetrics.reduce(function (sum, m) { return sum + m.engagement_score; }, 0) / total;
        return {
            total_patients: total,
            high_engagement: high,
            medium_engagement: medium,
            low_engagement: low,
            average_score: Math.round(average * 10) / 10
        };
    };
    return PatientEngagementInsights;
}());
exports.PatientEngagementInsights = PatientEngagementInsights;
exports.patientEngagementInsights = new PatientEngagementInsights();
