// API VALIDATION SCRIPT FOR RETENTION CAMPAIGNS
// Story 7.4: Patient Retention Analytics + Predictions - Task 5 Validation
// =====================================================================================

const API_BASE = 'http://localhost:3000/api/retention-analytics/campaigns';

// Test data
const testCampaign = {
  clinic_id: '22222222-2222-2222-2222-222222222222',
  name: 'Test Retention Campaign',
  target_segments: ['high_churn_risk'],
  intervention_strategy: {
    type: 'personalized_communication',
    channels: ['email'],
    content_template_id: 'retention_001',
    timing: { days_since_last_visit: 30 },
  },
  measurement_criteria: {
    success_metrics: ['retention_rate'],
    target_improvement: 15,
    measurement_window_days: 90,
    abtest_enabled: true,
    abtest_split_percentage: 50,
  },
};

async function validateCampaignAPIs() {
  try {
    const createResponse = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCampaign),
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      const campaignId = created.data?.campaign?.id;

      if (campaignId) {
        const getResponse = await fetch(`${API_BASE}/${campaignId}`);
        if (getResponse.ok) {
        } else {
        }
        const analyticsResponse = await fetch(
          `${API_BASE}/analytics?clinic_id=${testCampaign.clinic_id}`
        );
        if (analyticsResponse.ok) {
        } else {
        }
        const abTestResponse = await fetch(`${API_BASE}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            testDurationDays: 30,
            confidenceLevel: 0.95,
          }),
        });
        if (abTestResponse.ok) {
        } else {
        }
      }
    } else {
    }
    const listResponse = await fetch(
      `${API_BASE}?clinic_id=${testCampaign.clinic_id}`
    );
    if (listResponse.ok) {
    } else {
    }
  } catch (_error) {}
}

// Execute validation if running directly
if (typeof window === 'undefined') {
  validateCampaignAPIs();
}

module.exports = { validateCampaignAPIs };
