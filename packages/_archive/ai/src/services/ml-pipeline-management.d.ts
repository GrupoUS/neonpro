/**
 * @fileoverview ML Pipeline Management Service
 * @description Comprehensive service for ML model lifecycle, A/B testing, and drift detection
 * @version 1.0.0
 *
 * Constitutional Healthcare Compliance:
 * - LGPD: Full audit trail and data governance for ML operations
 * - ANVISA: ML model validation and performance monitoring for medical AI
 * - CFM: Professional ML model management and quality assurance
 */
import { EnhancedAIService } from "./enhanced-service-base";
declare global {
    function mcp__supabase_mcp__execute_sql(projectId: string, query: string): Promise<unknown>;
    function mcp__supabase_mcp__apply_migration(projectId: string, name: string, query: string): Promise<unknown>;
}
export declare class MLPipelineManagementService extends EnhancedAIService {
}
//# sourceMappingURL=ml-pipeline-management.d.ts.map