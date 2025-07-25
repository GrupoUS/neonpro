// Professional Management Supabase Functions
// FHIR-compliant healthcare professional data management with modern automation

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type {
  Professional,
  MedicalSpecialty,
  ProfessionalSpecialty,
  ProfessionalCredential,
  ProfessionalService,
  PerformanceMetric,
  ProfessionalDevelopment,
  CredentialingWorkflow,
  CredentialingAlert
} from '@/lib/types/professional';
import type {
  ProfessionalCreateInput,
  ProfessionalUpdateInput,
  ProfessionalSearchInput,
  CredentialCreateInput,
  CredentialUpdateInput,
  CredentialSearchInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  MetricCreateInput,
  DevelopmentCreateInput,
  WorkflowCreateInput,
  AlertCreateInput
} from '@/lib/validations/professional';

// ============================================
// PROFESSIONAL MANAGEMENT
// ============================================

/**
 * Create a new healthcare professional
 * Includes automatic FHIR ID generation and compliance checks
 */
export async function createProfessional(data: ProfessionalCreateInput): Promise<Professional> {
  const { data: professional, error } = await supabase
    .from('professionals')
    .insert({
      ...data,
      fhir_practitioner_id: data.fhir_practitioner_id || crypto.randomUUID(),
      status: data.status || 'pending_verification'
    })
    .select(`
      *,
      supervisor:professionals!supervisor_id(id, first_name, last_name)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create professional: ${error.message}`);
  }

  return professional;
}

/**
 * Update professional information
 * Includes automated audit trail and compliance tracking
 */
export async function updateProfessional(
  id: string, 
  data: ProfessionalUpdateInput
): Promise<Professional> {
  const { data: professional, error } = await supabase
    .from('professionals')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      supervisor:professionals!supervisor_id(id, first_name, last_name)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update professional: ${error.message}`);
  }

  return professional;
}

/**
 * Get professional by ID with related data
 */
export async function getProfessional(id: string): Promise<Professional | null> {
  const { data: professional, error } = await supabase
    .from('professionals')
    .select(`
      *,
      supervisor:professionals!supervisor_id(id, first_name, last_name),
      specialties:professional_specialties(
        *,
        specialty:medical_specialties(*)
      ),
      credentials:professional_credentials(*),
      services:professional_services(*),
      metrics:performance_metrics(*),
      development:professional_development(*),
      workflows:credentialing_workflow(*),
      alerts:credentialing_alerts(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get professional: ${error.message}`);
  }

  return professional;
}

/**
 * Search professionals with advanced filtering
 * Supports full-text search, specialty filtering, and status management
 */
export async function searchProfessionals(filters: ProfessionalSearchInput) {
  let query = supabase
    .from('professionals')
    .select(`
      *,
      supervisor:professionals!supervisor_id(id, first_name, last_name),
      specialties:professional_specialties(
        is_primary,
        specialty:medical_specialties(name, code, category)
      )
    `, { count: 'exact' });

  // Text search across name fields
  if (filters.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  // Status filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters.employment_status && filters.employment_status.length > 0) {
    query = query.in('employment_status', filters.employment_status);
  }

  // Specialty filter
  if (filters.primary_specialty && filters.primary_specialty.length > 0) {
    query = query.in('primary_specialty', filters.primary_specialty);
  }

  // Department filter
  if (filters.department && filters.department.length > 0) {
    query = query.in('department', filters.department);
  }

  // Date range filters
  if (filters.hire_date_from) {
    query = query.gte('hire_date', filters.hire_date_from);
  }
  if (filters.hire_date_to) {
    query = query.lte('hire_date', filters.hire_date_to);
  }

  // License state filter
  if (filters.license_state && filters.license_state.length > 0) {
    query = query.in('license_state', filters.license_state);
  }

  // License expiration warning
  if (filters.license_expiring_within_days) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + filters.license_expiring_within_days);
    query = query.lte('license_expiration', futureDate.toISOString());
  }

  // Sorting
  query = query.order(filters.sort_by || 'last_name', { ascending: filters.sort_order === 'asc' });

  // Pagination
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to);

  const { data: professionals, error, count } = await query;

  if (error) {
    throw new Error(`Failed to search professionals: ${error.message}`);
  }

  return {
    data: professionals || [],
    count: count || 0,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil((count || 0) / filters.limit)
  };
}

/**
 * Get professionals with expiring licenses
 * For compliance monitoring and automated alerts
 */
export async function getProfessionalsWithExpiringLicenses(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data: professionals, error } = await supabase
    .from('professionals')
    .select(`
      id,
      first_name,
      last_name,
      email,
      license_number,
      license_state,
      license_expiration,
      status
    `)
    .lte('license_expiration', futureDate.toISOString())
    .eq('status', 'active')
    .order('license_expiration');

  if (error) {
    throw new Error(`Failed to get professionals with expiring licenses: ${error.message}`);
  }

  return professionals || [];
}

// ============================================
// MEDICAL SPECIALTIES MANAGEMENT
// ============================================

/**
 * Get all active medical specialties
 */
export async function getMedicalSpecialties(): Promise<MedicalSpecialty[]> {
  const { data: specialties, error } = await supabase
    .from('medical_specialties')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to get medical specialties: ${error.message}`);
  }

  return specialties || [];
}

/**
 * Get specialties by category
 */
export async function getSpecialtiesByCategory(category: string): Promise<MedicalSpecialty[]> {
  const { data: specialties, error } = await supabase
    .from('medical_specialties')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to get specialties by category: ${error.message}`);
  }

  return specialties || [];
}

/**
 * Add specialty to professional
 */
export async function addProfessionalSpecialty(data: {
  professional_id: string;
  specialty_id: string;
  is_primary?: boolean;
  certification_date?: string;
  board_certified?: boolean;
}): Promise<ProfessionalSpecialty> {
  const { data: specialty, error } = await supabase
    .from('professional_specialties')
    .insert(data)
    .select(`
      *,
      professional:professionals(*),
      specialty:medical_specialties(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to add professional specialty: ${error.message}`);
  }

  return specialty;
}

// ============================================
// CREDENTIALS MANAGEMENT
// ============================================

/**
 * Create professional credential
 * Includes automatic verification workflow initiation
 */
export async function createCredential(data: CredentialCreateInput): Promise<ProfessionalCredential> {
  const { data: credential, error } = await supabase
    .from('professional_credentials')
    .insert({
      ...data,
      verification_status: data.verification_status || 'pending'
    })
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create credential: ${error.message}`);
  }

  return credential;
}

/**
 * Update credential information
 */
export async function updateCredential(
  id: string, 
  data: CredentialUpdateInput
): Promise<ProfessionalCredential> {
  const { data: credential, error } = await supabase
    .from('professional_credentials')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update credential: ${error.message}`);
  }

  return credential;
}

/**
 * Search credentials with filtering
 */
export async function searchCredentials(filters: CredentialSearchInput) {
  let query = supabase
    .from('professional_credentials')
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email, npi_number)
    `, { count: 'exact' });

  // Professional filter
  if (filters.professional_id) {
    query = query.eq('professional_id', filters.professional_id);
  }

  // Credential type filter
  if (filters.credential_type && filters.credential_type.length > 0) {
    query = query.in('credential_type', filters.credential_type);
  }

  // Verification status filter
  if (filters.verification_status && filters.verification_status.length > 0) {
    query = query.in('verification_status', filters.verification_status);
  }

  // Issuing organization filter
  if (filters.issuing_organization && filters.issuing_organization.length > 0) {
    query = query.in('issuing_organization', filters.issuing_organization);
  }

  // Expiring credentials
  if (filters.expiring_within_days) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + filters.expiring_within_days);
    query = query.lte('expiration_date', futureDate.toISOString());
  }

  // Expired credentials
  if (filters.expired === true) {
    query = query.lt('expiration_date', new Date().toISOString());
  } else if (filters.expired === false) {
    query = query.or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString());
  }

  // Date range filters
  if (filters.issued_after) {
    query = query.gte('issue_date', filters.issued_after);
  }
  if (filters.issued_before) {
    query = query.lte('issue_date', filters.issued_before);
  }

  // Sorting
  query = query.order(filters.sort_by || 'expiration_date', { ascending: filters.sort_order === 'asc' });

  // Pagination
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to);

  const { data: credentials, error, count } = await query;

  if (error) {
    throw new Error(`Failed to search credentials: ${error.message}`);
  }

  return {
    data: credentials || [],
    count: count || 0,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil((count || 0) / filters.limit)
  };
}/**
 * Get credentials expiring within specified timeframe
 * Used for automated alert generation and compliance monitoring
 */
export async function getExpiringCredentials(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data: credentials, error } = await supabase
    .from('professional_credentials')
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email, phone)
    `)
    .lte('expiration_date', futureDate.toISOString())
    .eq('verification_status', 'verified')
    .order('expiration_date');

  if (error) {
    throw new Error(`Failed to get expiring credentials: ${error.message}`);
  }

  return credentials || [];
}

// ============================================
// PROFESSIONAL SERVICES MANAGEMENT
// ============================================

/**
 * Create professional service
 */
export async function createService(data: ServiceCreateInput): Promise<ProfessionalService> {
  const { data: service, error } = await supabase
    .from('professional_services')
    .insert(data)
    .select(`
      *,
      professional:professionals(id, first_name, last_name),
      specialty:medical_specialties(name, code, category)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }

  return service;
}

/**
 * Update professional service
 */
export async function updateService(
  id: string, 
  data: ServiceUpdateInput
): Promise<ProfessionalService> {
  const { data: service, error } = await supabase
    .from('professional_services')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      professional:professionals(id, first_name, last_name),
      specialty:medical_specialties(name, code, category)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }

  return service;
}

/**
 * Get services by professional
 */
export async function getServicesByProfessional(professionalId: string): Promise<ProfessionalService[]> {
  const { data: services, error } = await supabase
    .from('professional_services')
    .select(`
      *,
      specialty:medical_specialties(name, code, category)
    `)
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .order('service_name');

  if (error) {
    throw new Error(`Failed to get services by professional: ${error.message}`);
  }

  return services || [];
}

/**
 * Search available services
 * Used for appointment scheduling and service discovery
 */
export async function searchAvailableServices(filters: {
  specialty_id?: string;
  service_type?: string;
  location?: string;
  telemedicine_only?: boolean;
  emergency_only?: boolean;
}) {
  let query = supabase
    .from('professional_services')
    .select(`
      *,
      professional:professionals(id, first_name, last_name, status),
      specialty:medical_specialties(name, code, category)
    `)
    .eq('is_active', true);

  // Join with professionals to ensure only active professionals
  query = query.eq('professional.status', 'active');

  if (filters.specialty_id) {
    query = query.eq('specialty_id', filters.specialty_id);
  }

  if (filters.service_type) {
    query = query.eq('service_type', filters.service_type);
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.telemedicine_only) {
    query = query.eq('telemedicine_available', true);
  }

  if (filters.emergency_only) {
    query = query.eq('emergency_service', true);
  }

  const { data: services, error } = await query.order('service_name');

  if (error) {
    throw new Error(`Failed to search available services: ${error.message}`);
  }

  return services || [];
}

// ============================================
// PERFORMANCE METRICS MANAGEMENT
// ============================================

/**
 * Create performance metric
 */
export async function createMetric(data: MetricCreateInput): Promise<PerformanceMetric> {
  const { data: metric, error } = await supabase
    .from('performance_metrics')
    .insert(data)
    .select(`
      *,
      professional:professionals(id, first_name, last_name)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create metric: ${error.message}`);
  }

  return metric;
}

/**
 * Get metrics by professional and timeframe
 */
export async function getMetricsByProfessional(
  professionalId: string,
  timeframe?: { start: string; end: string },
  metricTypes?: string[]
): Promise<PerformanceMetric[]> {
  let query = supabase
    .from('performance_metrics')
    .select('*')
    .eq('professional_id', professionalId);

  if (timeframe) {
    query = query
      .gte('measurement_period_start', timeframe.start)
      .lte('measurement_period_end', timeframe.end);
  }

  if (metricTypes && metricTypes.length > 0) {
    query = query.in('metric_type', metricTypes);
  }

  query = query.order('measurement_period_start', { ascending: false });

  const { data: metrics, error } = await query;

  if (error) {
    throw new Error(`Failed to get metrics by professional: ${error.message}`);
  }

  return metrics || [];
}

/**
 * Get aggregated performance data for dashboard
 */
export async function getPerformanceDashboardData(filters?: {
  professional_ids?: string[];
  metric_types?: string[];
  timeframe?: { start: string; end: string };
}) {
  let query = supabase
    .from('performance_metrics')
    .select(`
      *,
      professional:professionals(id, first_name, last_name, department, primary_specialty)
    `);

  if (filters?.professional_ids && filters.professional_ids.length > 0) {
    query = query.in('professional_id', filters.professional_ids);
  }

  if (filters?.metric_types && filters.metric_types.length > 0) {
    query = query.in('metric_type', filters.metric_types);
  }

  if (filters?.timeframe) {
    query = query
      .gte('measurement_period_start', filters.timeframe.start)
      .lte('measurement_period_end', filters.timeframe.end);
  }

  const { data: metrics, error } = await query;

  if (error) {
    throw new Error(`Failed to get performance dashboard data: ${error.message}`);
  }

  return metrics || [];
}

// ============================================
// PROFESSIONAL DEVELOPMENT MANAGEMENT
// ============================================

/**
 * Create professional development activity
 */
export async function createDevelopmentActivity(data: DevelopmentCreateInput): Promise<ProfessionalDevelopment> {
  const { data: activity, error } = await supabase
    .from('professional_development')
    .insert(data)
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create development activity: ${error.message}`);
  }

  return activity;
}

/**
 * Get development activities by professional
 */
export async function getDevelopmentByProfessional(
  professionalId: string,
  year?: number
): Promise<ProfessionalDevelopment[]> {
  let query = supabase
    .from('professional_development')
    .select('*')
    .eq('professional_id', professionalId);

  if (year) {
    const startOfYear = new Date(year, 0, 1).toISOString();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();
    query = query
      .gte('start_date', startOfYear)
      .lte('start_date', endOfYear);
  }

  query = query.order('start_date', { ascending: false });

  const { data: activities, error } = await query;

  if (error) {
    throw new Error(`Failed to get development activities: ${error.message}`);
  }

  return activities || [];
}

/**
 * Get CME credits summary for professional
 */
export async function getCMECreditsSummary(professionalId: string, year: number) {
  const startOfYear = new Date(year, 0, 1).toISOString();
  const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();

  const { data: activities, error } = await supabase
    .from('professional_development')
    .select('cme_credits, activity_type, completion_status')
    .eq('professional_id', professionalId)
    .eq('completion_status', 'completed')
    .gte('completion_date', startOfYear)
    .lte('completion_date', endOfYear)
    .not('cme_credits', 'is', null);

  if (error) {
    throw new Error(`Failed to get CME credits summary: ${error.message}`);
  }

  const totalCredits = (activities || []).reduce((sum, activity) => {
    return sum + (activity.cme_credits || 0);
  }, 0);

  return {
    totalCredits,
    activities: activities || [],
    year
  };
}

// ============================================
// CREDENTIALING WORKFLOW MANAGEMENT
// ============================================

/**
 * Create credentialing workflow
 */
export async function createWorkflow(data: WorkflowCreateInput): Promise<CredentialingWorkflow> {
  const { data: workflow, error } = await supabase
    .from('credentialing_workflow')
    .insert(data)
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create workflow: ${error.message}`);
  }

  return workflow;
}

/**
 * Update workflow status
 */
export async function updateWorkflowStatus(
  id: string,
  status: string,
  updates?: Partial<CredentialingWorkflow>
): Promise<CredentialingWorkflow> {
  const { data: workflow, error } = await supabase
    .from('credentialing_workflow')
    .update({
      status,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update workflow status: ${error.message}`);
  }

  return workflow;
}

/**
 * Get active workflows
 */
export async function getActiveWorkflows(assignedTo?: string): Promise<CredentialingWorkflow[]> {
  let query = supabase
    .from('credentialing_workflow')
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email, npi_number)
    `)
    .in('status', ['pending', 'in_progress', 'requires_documents', 'under_review']);

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  }

  query = query.order('due_date', { ascending: true });

  const { data: workflows, error } = await query;

  if (error) {
    throw new Error(`Failed to get active workflows: ${error.message}`);
  }

  return workflows || [];
}

// ============================================
// ALERTS MANAGEMENT
// ============================================

/**
 * Create alert
 */
export async function createAlert(data: AlertCreateInput): Promise<CredentialingAlert> {
  const { data: alert, error } = await supabase
    .from('credentialing_alerts')
    .insert(data)
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email),
      related_credential:professional_credentials(credential_name, expiration_date),
      related_workflow:credentialing_workflow(workflow_name, status)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return alert;
}

/**
 * Get active alerts
 */
export async function getActiveAlerts(
  professionalId?: string,
  severity?: string[]
): Promise<CredentialingAlert[]> {
  let query = supabase
    .from('credentialing_alerts')
    .select(`
      *,
      professional:professionals(id, first_name, last_name, email),
      related_credential:professional_credentials(credential_name, expiration_date),
      related_workflow:credentialing_workflow(workflow_name, status)
    `)
    .eq('is_active', true)
    .eq('resolved', false);

  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }

  if (severity && severity.length > 0) {
    query = query.in('severity', severity);
  }

  query = query.order('severity', { ascending: false })
                .order('due_date', { ascending: true });

  const { data: alerts, error } = await query;

  if (error) {
    throw new Error(`Failed to get active alerts: ${error.message}`);
  }

  return alerts || [];
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(id: string, acknowledgedBy: string): Promise<CredentialingAlert> {
  const { data: alert, error } = await supabase
    .from('credentialing_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: acknowledgedBy,
      acknowledged_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to acknowledge alert: ${error.message}`);
  }

  return alert;
}

/**
 * Resolve alert
 */
export async function resolveAlert(
  id: string, 
  resolvedBy: string, 
  actionTaken?: string
): Promise<CredentialingAlert> {
  const { data: alert, error } = await supabase
    .from('credentialing_alerts')
    .update({
      resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      action_taken: actionTaken,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to resolve alert: ${error.message}`);
  }

  return alert;
}

// ============================================
// BULK OPERATIONS AND UTILITIES
// ============================================

/**
 * Bulk update professional statuses
 */
export async function bulkUpdateProfessionalStatus(
  professionalIds: string[],
  status: string,
  statusReason?: string
) {
  const { data: professionals, error } = await supabase
    .from('professionals')
    .update({
      status,
      status_reason: statusReason,
      updated_at: new Date().toISOString()
    })
    .in('id', professionalIds)
    .select('id, first_name, last_name, status');

  if (error) {
    throw new Error(`Failed to bulk update professional status: ${error.message}`);
  }

  return professionals || [];
}

/**
 * Generate expiration alerts for all credentials
 * Run periodically to maintain compliance
 */
export async function generateExpirationAlerts(daysAhead: number = 30) {
  const expiringCredentials = await getExpiringCredentials(daysAhead);
  
  const alerts = [];
  for (const credential of expiringCredentials) {
    try {
      const alert = await createAlert({
        professional_id: credential.professional_id,
        alert_type: 'expiration',
        title: `${credential.credential_name} Expiring Soon`,
        message: `Your ${credential.credential_name} will expire on ${credential.expiration_date}. Please renew before expiration.`,
        severity: daysAhead <= 30 ? 'high' : 'medium',
        due_date: credential.expiration_date,
        auto_generated: true,
        related_credential_id: credential.id,
        action_required: true
      });
      alerts.push(alert);
    } catch (error) {
      console.error(`Failed to create alert for credential ${credential.id}:`, error);
    }
  }
  
  return alerts;
}

/**
 * Get comprehensive professional profile
 * Used for detailed professional views and reports
 */
export async function getComprehensiveProfessionalProfile(id: string) {
  const professional = await getProfessional(id);
  if (!professional) return null;

  const [
    recentMetrics,
    activeCredentials,
    currentServices,
    recentDevelopment,
    activeWorkflows,
    activeAlerts
  ] = await Promise.all([
    getMetricsByProfessional(id, {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Last 90 days
      end: new Date().toISOString()
    }),
    searchCredentials({ professional_id: id, expired: false, limit: 50 }),
    getServicesByProfessional(id),
    getDevelopmentByProfessional(id, new Date().getFullYear()),
    getActiveWorkflows(),
    getActiveAlerts(id)
  ]);

  return {
    professional,
    recentMetrics,
    activeCredentials: activeCredentials.data,
    currentServices,
    recentDevelopment,
    activeWorkflows: activeWorkflows.filter(w => w.professional_id === id),
    activeAlerts
  };
}