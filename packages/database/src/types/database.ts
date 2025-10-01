/**
 * Database Types
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

// Database schema types
export interface Database {
  public: {
    Tables: {
      architecture_configs: {
        Row: {
          id: string
          name: string
          environment: 'development' | 'staging' | 'production'
          edge_enabled: boolean
          supabase_functions_enabled: boolean
          bun_enabled: boolean
          performance_metrics: {
            edgeTTFB: number
            realtimeUIPatch: number
            copilotToolRoundtrip: number
            buildTime: number
            bundleSize: {
              main: number
              vendor: number
              total: number
            }
            uptime: number
            timestamp: string
          }
          compliance_status: {
            lgpd: {
              compliant: boolean
              lastAudit: string
              nextAudit: string
              issues: string[]
            }
            anvisa: {
              compliant: boolean
              lastAudit: string
              nextAudit: string
              issues: string[]
            }
            cfm: {
              compliant: boolean
              lastAudit: string
              nextAudit: string
              issues: string[]
            }
            wcag: {
              level: string
              compliant: boolean
              lastAudit: string
              issues: string[]
            }
            timestamp: string
          }
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['architecture_configs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['architecture_configs']['Insert']>
      }
      package_manager_configs: {
        Row: {
          id: string
          name: string
          package_manager: 'npm' | 'pnpm' | 'yarn' | 'bun'
          build_performance: {
            buildTime: number
            bundleSize: {
              main: number
              vendor: number
              total: number
            }
            timestamp: string
          }
          bundle_size: {
            main: number
            vendor: number
            total: number
            timestamp: string
          }
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['package_manager_configs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['package_manager_configs']['Insert']>
      }
      migration_states: {
        Row: {
          id: string
          name: string
          environment: 'development' | 'staging' | 'production'
          phase: 'setup' | 'tests' | 'implementation' | 'integration' | 'polish'
          status: 'pending' | 'in_progress' | 'completed' | 'failed'
          progress: number
          start_time: string
          end_time: string | null
          tasks: {
            id: string
            name: string
            status: 'pending' | 'in_progress' | 'completed' | 'failed'
            start_time: string | null
            end_time: string | null
            error: string | null
          }[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['migration_states']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['migration_states']['Insert']>
      }
      performance_metrics: {
        Row: {
          id: string
          name: string
          environment: 'development' | 'staging' | 'production'
          edge_performance: {
            ttfb: number
            cacheHitRate: number
            coldStartFrequency: number
            timestamp: string
          }
          realtime_performance: {
            uiPatchTime: number
            connectionLatency: number
            messageDeliveryTime: number
            timestamp: string
          }
          ai_performance: {
            copilotToolRoundtrip: number
            modelInferenceTime: number
            responseGenerationTime: number
            timestamp: string
          }
          build_performance: {
            buildTime: number
            bundleSize: {
              main: number
              vendor: number
              total: number
            }
            timestamp: string
          }
          system_performance: {
            uptime: number
            memoryUsage: number
            cpuUsage: number
            diskUsage: number
            timestamp: string
          }
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['performance_metrics']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['performance_metrics']['Insert']>
      }
      compliance_statuses: {
        Row: {
          id: string
          name: string
          environment: 'development' | 'staging' | 'production'
          lgpd: {
            framework: 'LGPD'
            compliant: boolean
            lastAudit: string
            nextAudit: string
            score: number
            checks: {
              id: string
              checkType: 'audit_trail' | 'data_encryption' | 'access_control' | 'data_minimization' | 'consent_management'
              framework: 'LGPD'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'LGPD'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          anvisa: {
            framework: 'ANVISA'
            compliant: boolean
            lastAudit: string
            nextAudit: string
            score: number
            checks: {
              id: string
              checkType: 'documentation' | 'quality_management' | 'clinical_evaluation' | 'post_market_surveillance'
              framework: 'ANVISA'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'ANVISA'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          cfm: {
            framework: 'CFM'
            compliant: boolean
            lastAudit: string
            nextAudit: string
            score: number
            checks: {
              id: string
              checkType: 'risk_assessment' | 'professional_conduct' | 'patient_safety' | 'medical_records'
              framework: 'CFM'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'CFM'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          wcag: {
            level: '2.1 AA+'
            compliant: boolean
            lastAudit: string
            score: number
            checks: {
              id: string
              checkType: 'accessibility' | 'keyboard_navigation' | 'screen_reader' | 'color_contrast'
              framework: 'LGPD'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'WCAG'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          overall_score: number
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['compliance_statuses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['compliance_statuses']['Insert']>
      }
      compliance_checks: {
        Row: {
          id: string
          status_id: string
          check_type: string
          framework: 'LGPD' | 'ANVISA' | 'CFM' | 'WCAG'
          status: 'compliant' | 'non_compliant' | 'pending'
          severity: 'low' | 'medium' | 'high' | 'critical'
          score: number
          last_checked: string
          next_check: string
          issues_found: number
          issues_resolved: number
          description: string
          recommendations: string[]
          tags: string[]
          assignee: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['compliance_checks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['compliance_checks']['Insert']>
      }
      compliance_issues: {
        Row: {
          id: string
          status_id: string
          regulation: 'LGPD' | 'ANVISA' | 'CFM' | 'WCAG'
          requirement: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'open' | 'in_progress' | 'resolved'
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['compliance_issues']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['compliance_issues']['Insert']>
      }
      performance_metrics_history: {
        Row: {
          id: string
          metrics_id: string
          metric_type: 'edgePerformance' | 'realtimePerformance' | 'aiPerformance' | 'buildPerformance' | 'systemPerformance'
          metric: any
          timestamp: string
        }
        Insert: Omit<Database['public']['Tables']['performance_metrics_history']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['performance_metrics_history']['Insert']>
      }
    }
    Views: {
      architecture_configs_with_metrics: {
        Row: {
          id: string
          name: string
          environment: 'development' | 'staging' | 'production'
          edge_enabled: boolean
          supabase_functions_enabled: boolean
          bun_enabled: boolean
          performance_metrics: {
            edgeTTFB: number
            realtimeUIPatch: number
            copilotToolRoundtrip: number
            buildTime: number
            bundleSize: {
              main: number
              vendor: number
              total: number
            }
            uptime: number
            timestamp: string
          }
          compliance_status: {
            lgpd: {
              compliant: boolean
              lastAudit: string
              nextAudit: string
              issues: string[]
            }
            anvisa: {
              compliant: boolean
              lastAudit: string
              nextAudit: string
              issues: string[]
            }
            cfm: {
              compliant: boolean
              lastAudit: string
              nextAudit: string
              issues: string[]
            }
            wcag: {
              level: string
              compliant: boolean
              lastAudit: string
              issues: string[]
            }
            timestamp: string
          }
          created_at: string
          updated_at: string
          edge_performance: {
            ttfb: number
            cacheHitRate: number
            coldStartFrequency: number
            timestamp: string
          }
          realtime_performance: {
            uiPatchTime: number
            connectionLatency: number
            messageDeliveryTime: number
            timestamp: string
          }
          ai_performance: {
            copilotToolRoundtrip: number
            modelInferenceTime: number
            responseGenerationTime: number
            timestamp: string
          }
          build_performance: {
            buildTime: number
            bundleSize: {
              main: number
              vendor: number
              total: number
            }
            timestamp: string
          }
          system_performance: {
            uptime: number
            memoryUsage: number
            cpuUsage: number
            diskUsage: number
            timestamp: string
          }
        }
      }
      compliance_statuses_with_checks: {
        Row: {
          id: string
          name: string
          environment: 'development' | 'staging' | 'production'
          lgpd: {
            framework: 'LGPD'
            compliant: boolean
            lastAudit: string
            nextAudit: string
            score: number
            checks: {
              id: string
              checkType: 'audit_trail' | 'data_encryption' | 'access_control' | 'data_minimization' | 'consent_management'
              framework: 'LGPD'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'LGPD'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          anvisa: {
            framework: 'ANVISA'
            compliant: boolean
            lastAudit: string
            nextAudit: string
            score: number
            checks: {
              id: string
              checkType: 'documentation' | 'quality_management' | 'clinical_evaluation' | 'post_market_surveillance'
              framework: 'ANVISA'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'ANVISA'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          cfm: {
            framework: 'CFM'
            compliant: boolean
            lastAudit: string
            nextAudit: string
            score: number
            checks: {
              id: string
              checkType: 'risk_assessment' | 'professional_conduct' | 'patient_safety' | 'medical_records'
              framework: 'CFM'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'CFM'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          wcag: {
            level: '2.1 AA+'
            compliant: boolean
            lastAudit: string
            score: number
            checks: {
              id: string
              checkType: 'accessibility' | 'keyboard_navigation' | 'screen_reader' | 'color_contrast'
              framework: 'LGPD'
              status: 'compliant' | 'non_compliant' | 'pending'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              lastChecked: string
              nextCheck: string
              issuesFound: number
              issuesResolved: number
              description: string
              recommendations: string[]
              tags: string[]
              assignee: string
            }[]
            issues: {
              id: string
              regulation: 'WCAG'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in_progress' | 'resolved'
              createdAt: string
              resolvedAt: string | null
            }[]
          }
          overall_score: number
          last_updated: string
          created_at: string
          updated_at: string
          total_checks: number
          compliant_checks: number
          non_compliant_checks: number
          pending_checks: number
        }
      }
    }
    Functions: {
      record_performance_metric: {
        Args: {
          metrics_id: string
          metric_type: 'edgePerformance' | 'realtimePerformance' | 'aiPerformance' | 'buildPerformance' | 'systemPerformance'
          metric: any
        }
        Returns: boolean
      }
      run_compliance_check: {
        Args: {
          status_id: string
          framework: 'LGPD' | 'ANVISA' | 'CFM' | 'WCAG'
          check_type: string
        }
        Returns: {
          id: string
          check_type: string
          framework: string
          status: 'compliant' | 'non_compliant' | 'pending'
          severity: 'low' | 'medium' | 'high' | 'critical'
          score: number
          issuesFound: number
          issuesResolved: number
          description: string
          recommendations: string[]
          tags: string[]
          assignee: string
        }
      }
    }
    Enums: {
      environment: 'development' | 'staging' | 'production'
      phase: 'setup' | 'tests' | 'implementation' | 'integration' | 'polish'
      status: 'pending' | 'in_progress' | 'completed' | 'failed'
      framework: 'LGPD' | 'ANVISA' | 'CFM' | 'WCAG'
      check_type: 'audit_trail' | 'data_encryption' | 'access_control' | 'data_minimization' | 'consent_management' | 'documentation' | 'quality_management' | 'clinical_evaluation' | 'post_market_surveillance' | 'risk_assessment' | 'professional_conduct' | 'patient_safety' | 'medical_records' | 'accessibility' | 'keyboard_navigation' | 'screen_reader' | 'color_contrast'
      metric_type: 'edgePerformance' | 'realtimePerformance' | 'aiPerformance' | 'buildPerformance' | 'systemPerformance'
      severity: 'low' | 'medium' | 'high' | 'critical'
      issue_status: 'open' | 'in_progress' | 'resolved'
      check_status: 'compliant' | 'non_compliant' | 'pending'
      package_manager: 'npm' | 'pnpm' | 'yarn' | 'bun'
    }
  }
}
