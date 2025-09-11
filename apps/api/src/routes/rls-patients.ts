import { Hono } from 'hono';
import { rlsHealthcareMiddleware, patientAccessMiddleware } from '../middleware/rls-middleware';
import { lgpdAuditMiddleware } from '../middleware/lgpd-middleware';

const rlsPatients = new Hono();

// Apply RLS and LGPD middleware to all routes
rlsPatients.use('*', rlsHealthcareMiddleware.patientAccess);
rlsPatients.use('*', lgpdAuditMiddleware());

/**
 * Get patients using RLS-aware queries
 * This route demonstrates how to use Supabase RLS instead of Prisma
 */
rlsPatients.get('/', async c => {
  try {
    const rlsQuery = c.get('rlsQuery');
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    if (!rlsQuery) {
      return c.json({ error: 'RLS query builder not available' }, 500);
    }

    // Use RLS-aware query - this will automatically apply Row Level Security policies
    const { data: patients, error } = await rlsQuery.getPatients({
      limit: 20,
      includeInactive: false, // Only active patients
    });

    if (error) {
      console.error('RLS query error:', error);
      return c.json({ 
        error: 'Failed to fetch patients with RLS',
        details: error.message 
      }, 500);
    }

    // Log successful access
    console.log(`RLS Patient Access: User ${userId} (${userRole}) accessed ${patients?.length || 0} patients`);

    return c.json({ 
      patients: patients || [],
      meta: {
        count: patients?.length || 0,
        rlsApplied: true,
        userId,
        userRole,
      }
    });
  } catch (error) {
    console.error('Error in RLS patients route:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * Get specific patient by ID using RLS
 */
rlsPatients.get('/:patientId', patientAccessMiddleware(), async c => {
  try {
    const patientId = c.req.param('patientId');
    const rlsQuery = c.get('rlsQuery');
    const userId = c.get('userId');

    // Use RLS-aware query for single patient
    const { data: patient, error } = await rlsQuery.client
      .from('patients')
      .select(`
        *,
        clinic:clinics(id, name),
        consent_records(
          id,
          consent_type,
          purpose,
          status,
          given_at,
          expires_at
        )
      `)
      .eq('id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ 
          error: 'Patient not found or access denied',
          code: 'PATIENT_NOT_FOUND_OR_ACCESS_DENIED'
        }, 404);
      }
      
      console.error('RLS patient query error:', error);
      return c.json({ 
        error: 'Failed to fetch patient with RLS',
        details: error.message 
      }, 500);
    }

    // Additional LGPD compliance check
    if (!patient.lgpd_consent_given) {
      return c.json({
        error: 'Patient has not provided LGPD consent',
        code: 'LGPD_CONSENT_REQUIRED',
        patientId
      }, 403);
    }

    // Log successful access
    console.log(`RLS Patient Detail Access: User ${userId} accessed patient ${patientId}`);

    return c.json({ 
      patient,
      meta: {
        rlsApplied: true,
        lgpdCompliant: true,
        accessedBy: userId,
      }
    });
  } catch (error) {
    console.error('Error in RLS patient detail route:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * Get patient appointments using RLS
 */
rlsPatients.get('/:patientId/appointments', patientAccessMiddleware(), async c => {
  try {
    const patientId = c.req.param('patientId');
    const rlsQuery = c.get('rlsQuery');
    const userId = c.get('userId');

    // Query parameters
    const limit = parseInt(c.req.query('limit') || '10');
    const status = c.req.query('status');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    // Use RLS-aware appointment query
    const { data: appointments, error } = await rlsQuery.getAppointments({
      patientId,
      limit,
      status,
      startDate,
      endDate,
    });

    if (error) {
      console.error('RLS appointments query error:', error);
      return c.json({ 
        error: 'Failed to fetch appointments with RLS',
        details: error.message 
      }, 500);
    }

    // Log successful access
    console.log(`RLS Appointment Access: User ${userId} accessed ${appointments?.length || 0} appointments for patient ${patientId}`);

    return c.json({ 
      appointments: appointments || [],
      meta: {
        count: appointments?.length || 0,
        patientId,
        rlsApplied: true,
        filters: { status, startDate, endDate },
        accessedBy: userId,
      }
    });
  } catch (error) {
    console.error('Error in RLS patient appointments route:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * Get patient consent records using RLS
 */
rlsPatients.get('/:patientId/consent', patientAccessMiddleware(), async c => {
  try {
    const patientId = c.req.param('patientId');
    const purpose = c.req.query('purpose');
    const rlsQuery = c.get('rlsQuery');
    const userId = c.get('userId');

    // Use RLS-aware consent query
    const { data: consentRecords, error } = await rlsQuery.getConsentRecords(patientId, purpose);

    if (error) {
      console.error('RLS consent query error:', error);
      return c.json({ 
        error: 'Failed to fetch consent records with RLS',
        details: error.message 
      }, 500);
    }

    // Log successful access
    console.log(`RLS Consent Access: User ${userId} accessed consent records for patient ${patientId}`);

    return c.json({ 
      consentRecords: consentRecords || [],
      meta: {
        count: consentRecords?.length || 0,
        patientId,
        purpose,
        rlsApplied: true,
        accessedBy: userId,
      }
    });
  } catch (error) {
    console.error('Error in RLS patient consent route:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default rlsPatients;
