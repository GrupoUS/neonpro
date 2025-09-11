import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { lgpdAuditMiddleware, lgpdMiddleware } from '../middleware/lgpd-middleware';

const appointments = new Hono();

// Apply LGPD audit logging to all appointment routes
appointments.use('*', lgpdAuditMiddleware());

// Get all appointments (with LGPD consent validation)
appointments.get('/', lgpdMiddleware.appointments, async c => {
  try {
    const items = await prisma.appointment.findMany({
      take: 10,
      orderBy: { startTime: 'desc' }, // Fixed field name: startsAt -> startTime
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phonePrimary: true,
            lgpdConsentGiven: true, // Include LGPD consent status
          },
        },
        clinic: {
          select: { id: true, name: true },
        },
        professional: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        },
      },
      where: {
        // Only return appointments for patients with LGPD consent
        patient: {
          lgpdConsentGiven: true,
          isActive: true,
        },
      },
    });
    return c.json({ items });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

// Get appointments for a specific patient (with LGPD consent validation)
appointments.get('/patient/:patientId', lgpdMiddleware.appointments, async c => {
  try {
    const patientId = c.req.param('patientId');

    const items = await prisma.appointment.findMany({
      where: {
        patientId,
        patient: {
          lgpdConsentGiven: true,
          isActive: true,
        },
      },
      orderBy: { startTime: 'desc' },
      include: {
        clinic: {
          select: { id: true, name: true },
        },
        professional: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        },
      },
    });

    return c.json({ items });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return c.json({ error: 'Failed to fetch patient appointments' }, 500);
  }
});

export default appointments;
