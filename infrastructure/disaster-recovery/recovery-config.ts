import { RecoveryConfiguration } from './recovery-orchestrator';

export const HEALTHCARE_RECOVERY_CONFIG: RecoveryConfiguration = {
  recovery_strategies: {
    database_failure: {
      primary_backup_location: 's3://neonpro-backups/database/primary',
      secondary_backup_location: 's3://neonpro-backups/database/secondary',
      point_in_time_recovery_enabled: true,
      automatic_failover_enabled: true,
      replica_databases: [
        'postgresql://replica-1.neonpro.healthcare:5432/neonpro',
        'postgresql://replica-2.neonpro.healthcare:5432/neonpro'
      ]
    },

    service_failure: {
      dependency_map: {
        'universal-chat': ['database', 'cache-management', 'feature-flags', 'compliance-automation'],
        'compliance-automation': ['database', 'monitoring'],
        'no-show-prediction': ['database', 'cache-management', 'monitoring'],
        'appointment-optimization': ['database', 'cache-management', 'no-show-prediction'],
        'feature-flags': ['database'],
        'cache-management': ['redis'],
        'monitoring': ['database']
      },
      graceful_degradation_levels: {
        'universal-chat': ['basic-responses', 'offline-mode', 'emergency-only'],
        'compliance-automation': ['essential-checks-only', 'manual-review-required'],
        'no-show-prediction': ['historical-data-only', 'disabled'],
        'appointment-optimization': ['basic-scheduling-only', 'manual-scheduling'],
        'feature-flags': ['default-enabled', 'all-disabled'],
        'cache-management': ['database-only', 'no-caching'],
        'monitoring': ['basic-logging-only', 'disabled']
      },
      circuit_breaker_thresholds: {
        'universal-chat': 5, // 5 consecutive failures triggers circuit breaker
        'compliance-automation': 3, // Critical for healthcare compliance
        'no-show-prediction': 10,
        'appointment-optimization': 10,
        'feature-flags': 15,
        'cache-management': 20,
        'monitoring': 25
      },
      auto_restart_attempts: 3,
      manual_intervention_threshold_minutes: 15
    },

    infrastructure_failure: {
      multi_region_setup: true,
      load_balancer_failover: true,
      cdn_backup_regions: ['us-east-1', 'us-west-2', 'sa-east-1'],
      auto_scaling_policies: {
        cpu_threshold: 70,
        memory_threshold: 80,
        scale_up_cooldown_minutes: 5,
        scale_down_cooldown_minutes: 15,
        max_instances: 20,
        min_instances: 2
      }
    },

    data_corruption: {
      corruption_detection_methods: [
        'checksum_validation',
        'referential_integrity_checks',
        'healthcare_data_validation',
        'lgpd_compliance_verification'
      ],
      data_validation_checksums: true,
      rollback_safe_points: 24, // 24 hourly safe points
      data_integrity_verification: true
    }
  },

  healthcare_priorities: {
    emergency_services: [
      'universal-chat', // Critical for patient communication
      'compliance-automation' // Essential for LGPD/ANVISA compliance
    ],
    critical_data_types: [
      'patient_medical_records',
      'active_chat_sessions',
      'compliance_audit_logs',
      'emergency_contacts',
      'medication_data',
      'appointment_schedules'
    ],
    maximum_downtime_minutes: 5, // Maximum acceptable downtime for healthcare
    patient_safety_protocols: [
      'notify_emergency_contacts',
      'activate_backup_communication_channels',
      'escalate_to_medical_staff',
      'maintain_audit_trail',
      'ensure_data_privacy_compliance'
    ]
  },

  recovery_objectives: {
    rto_minutes: 5,  // Recovery Time Objective: 5 minutes max
    rpo_minutes: 15, // Recovery Point Objective: Max 15 minutes data loss
    maximum_data_loss_minutes: 30 // Absolute maximum data loss tolerance
  },

  backup_configuration: {
    database_backup_frequency_minutes: 15, // Every 15 minutes for healthcare
    service_state_backup_frequency_minutes: 30,
    retention_days: 90, // 90 days retention for compliance
    backup_locations: [
      's3://neonpro-backups-primary/production',
      's3://neonpro-backups-secondary/production',
      'gcs://neonpro-dr-backups/production' // Google Cloud for geo-redundancy
    ]
  }
};

// Emergency contact configuration
export const EMERGENCY_CONTACTS = {
  oncall_engineers: [
    {
      name: 'Primary Oncall',
      phone: '+55-11-99999-0001',
      email: 'oncall-primary@neonpro.healthcare',
      escalation_delay_minutes: 0
    },
    {
      name: 'Secondary Oncall',
      phone: '+55-11-99999-0002', 
      email: 'oncall-secondary@neonpro.healthcare',
      escalation_delay_minutes: 10
    }
  ],
  healthcare_compliance_team: [
    {
      name: 'Compliance Officer',
      phone: '+55-11-99999-0003',
      email: 'compliance@neonpro.healthcare',
      escalation_delay_minutes: 5 // Fast escalation for compliance issues
    }
  ],
  executive_team: [
    {
      name: 'CTO',
      phone: '+55-11-99999-0004',
      email: 'cto@neonpro.healthcare',
      escalation_delay_minutes: 30
    }
  ]
};

// Recovery scripts mapping
export const RECOVERY_SCRIPTS = {
  database: {
    backup: 'npm run db:backup',
    restore: 'npm run db:restore',
    failover: 'npm run db:failover-to-replica',
    integrity_check: 'npm run db:check-integrity'
  },
  services: {
    restart: (service: string) => `npm run service:restart ${service}`,
    rollback: (service: string) => `npm run service:rollback ${service}`,
    health_check: (service: string) => `npm run service:health ${service}`,
    graceful_stop: (service: string) => `npm run service:stop ${service} --graceful`
  },
  infrastructure: {
    lb_failover: 'npm run lb:switch-to-backup',
    cdn_activate_region: (region: string) => `npm run cdn:activate-region ${region}`,
    autoscale_emergency: 'npm run autoscale:emergency-scale-up',
    network_diagnostics: 'npm run network:diagnostics'
  },
  monitoring: {
    enable_debug_logging: 'npm run logs:enable-debug',
    collect_diagnostics: 'npm run diagnostics:collect',
    alert_suppression: 'npm run alerts:suppress-non-critical'
  }
};

// Healthcare-specific recovery workflows
export const HEALTHCARE_WORKFLOWS = {
  patient_data_protection: {
    steps: [
      'isolate_affected_systems',
      'notify_compliance_team', 
      'activate_backup_systems',
      'maintain_audit_trail',
      'verify_data_integrity',
      'resume_normal_operations'
    ],
    max_execution_time_minutes: 20
  },
  
  emergency_patient_access: {
    steps: [
      'activate_emergency_mode',
      'bypass_non_critical_services',
      'ensure_chat_availability',
      'notify_medical_staff',
      'document_emergency_access'
    ],
    max_execution_time_minutes: 3 // Critical - must be very fast
  },

  compliance_incident: {
    steps: [
      'immediate_containment',
      'notify_regulatory_authorities',
      'activate_legal_team',
      'preserve_evidence',
      'implement_corrective_measures',
      'file_incident_report'
    ],
    max_execution_time_minutes: 60
  },

  system_wide_failure: {
    steps: [
      'activate_disaster_recovery_site',
      'redirect_traffic_to_backup',
      'restore_critical_services_first',
      'verify_data_consistency',
      'gradual_service_restoration',
      'full_system_verification'
    ],
    max_execution_time_minutes: 30
  }
};

// Monitoring thresholds for recovery triggers
export const RECOVERY_TRIGGERS = {
  database_health: {
    response_time_threshold_ms: 5000,
    error_rate_threshold_percent: 1,
    connection_failure_threshold: 3
  },
  service_health: {
    response_time_threshold_ms: 10000,
    error_rate_threshold_percent: 5,
    availability_threshold_percent: 95
  },
  infrastructure_health: {
    cpu_usage_threshold_percent: 90,
    memory_usage_threshold_percent: 90,
    disk_usage_threshold_percent: 95,
    network_latency_threshold_ms: 1000
  },
  compliance_alerts: {
    lgpd_violation_severity: 'medium', // Any LGPD violation triggers recovery
    anvisa_violation_severity: 'high',
    cfm_violation_severity: 'high',
    data_breach_severity: 'critical'
  }
};

export default HEALTHCARE_RECOVERY_CONFIG;