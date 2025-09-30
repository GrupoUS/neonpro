/**
 * Database Types
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

// Database type for Supabase
export type Database = {
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
            edge_ttfb: number
            realtime_ui_patch: number
            copilot_tool_roundtrip: number
            build_time: number
            bundle_size: {
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
              last_audit: string
              next_audit: string
              issues: string[]
            }
            anvisa: {
              compliant: boolean
              last_audit: string
              next_audit: string
              issues: string[]
            }
            cfm: {
              compliant: boolean
              last_audit: string
              next_audit: string
              issues: string[]
            }
            wcag: {
              level: '2.1 AA+' | '2.1 AAA'
              compliant: boolean
              last_audit: string
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
          environment: 'development' | 'staging' | 'production'
          package_manager: {
            primary: 'bun' | 'pnpm' | 'npm' | 'yarn'
            version: string
            lock_file: 'bun.lockb' | 'pnpm-lock.yaml' | 'package-lock.json' | 'yarn.lock'
            registry: string
            fallback?: 'bun' | 'pnpm' | 'npm' | 'yarn'
            scopes?: string[]
          }
          build_performance: {
            build_time: number
            install_time: number
            bundle_size: number
            cache_hit_rate: number
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
          version: string
          environment: 'development' | 'staging' | 'production'
          migration: {
            phase: 'planning' | 'setup' | 'configuration' | 'migration' | 'validation' | 'completed' | 'failed' | 'rollback'
            status: 'pending' | 'in_progress' | 'paused' | 'failed' | 'completed' | 'rolled_back'
            progress: {
              current_step: string
              total_steps: number
              completed_steps: number
              percentage: number
              estimated_time_remaining?: number
              last_updated: string
            }
            started_at: string
            estimated_duration?: number
            actual_duration?: number
            completed_at?: string
            error?: string
            rollback_data?: Record<string, any>
          }
          description?: string
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
            cache_hit_rate: number
            cold_start_frequency: number
            region_latency: Record<string, number>
            timestamp: string
          }
          realtime_performance: {
            ui_patch_time: number
            connection_latency: number
            message_delivery_time: number
            subscription_setup_time: number
            timestamp: string
          }
          ai_performance: {
            copilot_tool_roundtrip: number
            model_inference_time: number
            response_generation_time: number
            timestamp: string
          }
          build_performance: {
            build_time: number
            install_time: number
            bundle_size: {
              main: number
              vendor: number
              total: number
            }
            cache_hit_rate: number
            timestamp: string
          }
          system_performance: {
            uptime: number
            memory_usage: number
            cpu_usage: number
            disk_usage: number
            timestamp: string
          }
          metadata?: Record<string, any>
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
            framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
            compliant: boolean
            last_audit: string
            next_audit: string
            score: number
            checks: {
              id: string
              check_type: 'audit_trail' | 'documentation' | 'risk_assessment' | 'data_protection' | 'access_control' | 'encryption' | 'backup' | 'training'
              framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              last_checked: string
              next_check: string
              issues_found: number
              issues_resolved: number
              description: string
              recommendations: string[]
              tags?: string[]
              assignee?: string
            }[]
            issues: {
              id: string
              regulation: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in-progress' | 'resolved' | 'closed'
              created_at: string
              resolved_at?: string
            }[]
          }
          anvisa: {
            framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
            compliant: boolean
            last_audit: string
            next_audit: string
            score: number
            checks: {
              id: string
              check_type: 'audit_trail' | 'documentation' | 'risk_assessment' | 'data_protection' | 'access_control' | 'encryption' | 'backup' | 'training'
              framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              last_checked: string
              next_check: string
              issues_found: number
              issues_resolved: number
              description: string
              recommendations: string[]
              tags?: string[]
              assignee?: string
            }[]
            issues: {
              id: string
              regulation: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in-progress' | 'resolved' | 'closed'
              created_at: string
              resolved_at?: string
            }[]
          }
          cfm: {
            framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
            compliant: boolean
            last_audit: string
            next_audit: string
            score: number
            checks: {
              id: string
              check_type: 'audit_trail' | 'documentation' | 'risk_assessment' | 'data_protection' | 'access_control' | 'encryption' | 'backup' | 'training'
              framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              last_checked: string
              next_check: string
              issues_found: number
              issues_resolved: number
              description: string
              recommendations: string[]
              tags?: string[]
              assignee?: string
            }[]
            issues: {
              id: string
              regulation: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              requirement: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in-progress' | 'resolved' | 'closed'
              created_at: string
              resolved_at?: string
            }[]
          }
          wcag: {
            level: '2.1 AA+' | '2.1 AAA'
            compliant: boolean
            last_audit: string
            score: number
            checks: {
              id: string
              check_type: 'audit_trail' | 'documentation' | 'risk_assessment' | 'data_protection' | 'access_control' | 'encryption' | 'backup' | 'training'
              framework: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR'
              status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
              severity: 'low' | 'medium' | 'high' | 'critical'
              score: number
              last_checked: string
              next_check: string
              issues_found: number
              issues_resolved: number
              description: string
              recommendations: string[]
              tags?: string[]
              assignee?: string
            }[]
            issues: {
              id: string
              guideline: string
              description: string
              severity: 'low' | 'medium' | 'high' | 'critical'
              status: 'open' | 'in-progress' | 'resolved' | 'closed'
              created_at: string
              resolved_at?: string
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
      audit_logs: {
        Row: {
          id: string
          clinic_id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details: Record<string, any>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
