import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { dataProtection } from '../middleware/lgpd-middleware';

const patients = new Hono();

// Apply data protection to all client routes
patients.use('*', dataProtection.clientView);

// Get all clients (with data protection validation)
patients.get('/', async c => {
  try {
    const items = await prisma.patient.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        clinic: {
          select: { id: true, name: true },
        },
      },
      where: {
        // Only return active patients with valid LGPD consent
        isActive: true,
        lgpdConsentGiven: true,
      },
    });
    return c.json({ items });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return c.json({ error: 'Failed to fetch patients' }, 500);
  }
});

// Get specific patient by ID (with LGPD consent validation)
patients.get('/:patientId', async c => {
  try {
    const patientId = c.req.param('patientId');

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        clinic: {
          select: { id: true, name: true },
        },
      },
    });

    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    // Additional LGPD compliance check
    if (!patient.lgpdConsentGiven) {
      return c.json({
        error: 'Patient has not provided LGPD consent',
        code: 'LGPD_CONSENT_REQUIRED',
      }, 403);
    }

    return c.json({ patient });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return c.json({ error: 'Failed to fetch patient' }, 500);
  }
});

export default patients;
