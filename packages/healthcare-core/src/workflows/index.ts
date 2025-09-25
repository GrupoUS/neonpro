/**
 * Healthcare workflows module
 * Placeholder for consolidated healthcare workflows
 */

// Version info
export const WORKFLOWS_VERSION = '1.0.0';

// Empty exports for now - will be populated with consolidated workflows
export type HealthcareWorkflow = {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
};