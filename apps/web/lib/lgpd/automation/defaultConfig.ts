import { LGPDAutomationConfig } from './index'

/**
 * Default configuration for LGPD Automation System
 * 
 * This configuration provides sensible defaults for all automation modules.
 * Customize these settings based on your organization's specific requirements.
 */
export const defaultLGPDAutomationConfig: LGPDAutomationConfig = {
  consent_automation: {
    auto_renewal_enabled: true,
    renewal_notice_days: [30, 7, 1], // Send notices 30, 7, and 1 days before expiration
    granular_tracking_enabled: true,
    inheritance_enabled: true,
    batch_processing_enabled: true,
    batch_size: 100,
    processing_interval_minutes: 15,
    notification_settings: {
      email_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      webhook_enabled: true
    },
    analytics_enabled: true,
    audit_trail_enabled: true,
    performance_monitoring: true,
    error_recovery_enabled: true
  },
  
  data_subject_rights: {
    auto_processing_enabled: true,
    identity_verification_required: true,
    response_time_hours: {
      access: 720, // 30 days
      rectification: 720, // 30 days
      deletion: 720, // 30 days
      portability: 720 // 30 days
    },
    notification_settings: {
      email_enabled: true,
      sms_enabled: false,
      webhook_enabled: true
    },
    data_export_formats: ['json', 'csv', 'pdf'],
    secure_download_enabled: true,
    download_expiry_hours: 72,
    audit_trail_enabled: true,
    compliance_monitoring: true,
    batch_processing_enabled: true,
    batch_size: 50,
    processing_interval_minutes: 30
  },
  
  compliance_monitoring: {
    real_time_enabled: true,
    monitoring_interval_minutes: 5,
    alert_thresholds: {
      consent_compliance: 95, // Alert if below 95%
      response_time_compliance: 90, // Alert if below 90%
      data_retention_compliance: 98, // Alert if below 98%
      breach_response_compliance: 100, // Alert if below 100%
      documentation_compliance: 95, // Alert if below 95%
      third_party_compliance: 90 // Alert if below 90%
    },
    notification_settings: {
      email_enabled: true,
      sms_enabled: true, // Critical alerts via SMS
      webhook_enabled: true,
      dashboard_enabled: true
    },
    auto_resolution_enabled: true,
    escalation_enabled: true,
    escalation_delay_minutes: 30,
    dashboard_refresh_seconds: 30,
    historical_data_retention_days: 365,
    performance_monitoring: true
  },
  
  data_retention: {
    auto_execution_enabled: true,
    approval_required: true,
    execution_window: {
      start_hour: 2, // 2 AM
      end_hour: 6,   // 6 AM
      timezone: 'America/Sao_Paulo'
    },
    backup_before_deletion: true,
    verification_enabled: true,
    notification_settings: {
      email_enabled: true,
      webhook_enabled: true
    },
    batch_size: 1000,
    processing_interval_minutes: 60,
    safety_checks_enabled: true,
    rollback_enabled: true,
    audit_trail_enabled: true,
    performance_monitoring: true,
    archive_enabled: true,
    archive_retention_years: 7
  },
  
  breach_detection: {
    real_time_enabled: true,
    monitoring_interval_seconds: 30,
    detection_rules: {
      failed_login_threshold: 5,
      failed_login_window_minutes: 15,
      unusual_access_pattern_enabled: true,
      data_export_monitoring: true,
      admin_action_monitoring: true,
      api_abuse_detection: true,
      sql_injection_detection: true,
      xss_detection: true
    },
    notification_settings: {
      email_enabled: true,
      sms_enabled: true,
      webhook_enabled: true,
      anpd_notification_enabled: true
    },
    auto_containment_enabled: true,
    incident_response_enabled: true,
    forensics_enabled: true,
    audit_trail_enabled: true,
    performance_monitoring: true,
    false_positive_learning: true
  },
  
  data_minimization: {
    auto_analysis_enabled: true,
    analysis_interval_hours: 24,
    approval_required: true,
    minimization_types: {
      anonymization_enabled: true,
      pseudonymization_enabled: true,
      aggregation_enabled: true,
      deletion_enabled: true,
      masking_enabled: true,
      encryption_enabled: true
    },
    notification_settings: {
      email_enabled: true,
      webhook_enabled: true
    },
    batch_processing_enabled: true,
    batch_size: 500,
    safety_checks_enabled: true,
    backup_enabled: true,
    audit_trail_enabled: true,
    performance_monitoring: true,
    opportunity_threshold: 0.1, // 10% data reduction opportunity
    business_impact_assessment: true
  },
  
  third_party_compliance: {
    auto_monitoring_enabled: true,
    assessment_interval_hours: 168, // Weekly assessments
    compliance_validation_enabled: true,
    data_transfer_monitoring: true,
    agreement_monitoring: true,
    notification_settings: {
      email_enabled: true,
      webhook_enabled: true
    },
    risk_thresholds: {
      low: 30,
      medium: 60,
      high: 80,
      critical: 95
    },
    auto_suspension_enabled: false, // Manual review required
    audit_trail_enabled: true,
    performance_monitoring: true,
    contract_renewal_monitoring: true,
    renewal_notice_days: [90, 30, 7]
  },
  
  audit_reporting: {
    auto_generation_enabled: true,
    report_schedules: {
      daily_summary: true,
      weekly_detailed: true,
      monthly_comprehensive: true,
      quarterly_executive: true,
      annual_compliance: true
    },
    export_formats: ['pdf', 'excel', 'json'],
    notification_settings: {
      email_enabled: true,
      webhook_enabled: true
    },
    dashboard_enabled: true,
    dashboard_refresh_minutes: 15,
    historical_retention_years: 7,
    encryption_enabled: true,
    digital_signature_enabled: true,
    audit_trail_enabled: true,
    performance_monitoring: true,
    executive_summary_enabled: true
  },
  
  global_settings: {
    auto_start_all: true,
    unified_logging: true,
    cross_module_alerts: true,
    performance_monitoring: true,
    error_recovery: true,
    backup_enabled: true,
    maintenance_mode: false
  }
}

/**
 * Development/Testing configuration with relaxed settings
 */
export const developmentLGPDAutomationConfig: LGPDAutomationConfig = {
  ...defaultLGPDAutomationConfig,
  
  consent_automation: {
    ...defaultLGPDAutomationConfig.consent_automation,
    processing_interval_minutes: 5, // More frequent for testing
    notification_settings: {
      email_enabled: false, // Disable emails in dev
      sms_enabled: false,
      in_app_enabled: true,
      webhook_enabled: false
    }
  },
  
  data_subject_rights: {
    ...defaultLGPDAutomationConfig.data_subject_rights,
    response_time_hours: {
      access: 24, // Shorter for testing
      rectification: 24,
      deletion: 24,
      portability: 24
    },
    processing_interval_minutes: 10,
    notification_settings: {
      email_enabled: false,
      sms_enabled: false,
      webhook_enabled: false
    }
  },
  
  compliance_monitoring: {
    ...defaultLGPDAutomationConfig.compliance_monitoring,
    monitoring_interval_minutes: 1, // More frequent monitoring
    notification_settings: {
      email_enabled: false,
      sms_enabled: false,
      webhook_enabled: false,
      dashboard_enabled: true
    }
  },
  
  data_retention: {
    ...defaultLGPDAutomationConfig.data_retention,
    approval_required: false, // Auto-approve in dev
    notification_settings: {
      email_enabled: false,
      webhook_enabled: false
    }
  },
  
  breach_detection: {
    ...defaultLGPDAutomationConfig.breach_detection,
    notification_settings: {
      email_enabled: false,
      sms_enabled: false,
      webhook_enabled: false,
      anpd_notification_enabled: false // Don't notify ANPD in dev
    }
  },
  
  data_minimization: {
    ...defaultLGPDAutomationConfig.data_minimization,
    analysis_interval_hours: 1, // More frequent analysis
    approval_required: false, // Auto-approve in dev
    notification_settings: {
      email_enabled: false,
      webhook_enabled: false
    }
  },
  
  third_party_compliance: {
    ...defaultLGPDAutomationConfig.third_party_compliance,
    assessment_interval_hours: 24, // Daily in dev
    notification_settings: {
      email_enabled: false,
      webhook_enabled: false
    }
  },
  
  audit_reporting: {
    ...defaultLGPDAutomationConfig.audit_reporting,
    notification_settings: {
      email_enabled: false,
      webhook_enabled: false
    }
  }
}

/**
 * Production configuration with enhanced security and monitoring
 */
export const productionLGPDAutomationConfig: LGPDAutomationConfig = {
  ...defaultLGPDAutomationConfig,
  
  compliance_monitoring: {
    ...defaultLGPDAutomationConfig.compliance_monitoring,
    alert_thresholds: {
      consent_compliance: 98, // Stricter in production
      response_time_compliance: 95,
      data_retention_compliance: 99,
      breach_response_compliance: 100,
      documentation_compliance: 98,
      third_party_compliance: 95
    }
  },
  
  breach_detection: {
    ...defaultLGPDAutomationConfig.breach_detection,
    detection_rules: {
      ...defaultLGPDAutomationConfig.breach_detection.detection_rules,
      failed_login_threshold: 3, // Stricter in production
      failed_login_window_minutes: 10
    }
  },
  
  data_retention: {
    ...defaultLGPDAutomationConfig.data_retention,
    approval_required: true, // Always require approval in production
    safety_checks_enabled: true,
    verification_enabled: true
  },
  
  data_minimization: {
    ...defaultLGPDAutomationConfig.data_minimization,
    approval_required: true, // Always require approval in production
    business_impact_assessment: true,
    safety_checks_enabled: true
  }
}

/**
 * Helper function to get configuration based on environment
 */
export function getLGPDAutomationConfig(environment: 'development' | 'production' | 'default' = 'default'): LGPDAutomationConfig {
  switch (environment) {
    case 'development':
      return developmentLGPDAutomationConfig
    case 'production':
      return productionLGPDAutomationConfig
    default:
      return defaultLGPDAutomationConfig
  }
}
