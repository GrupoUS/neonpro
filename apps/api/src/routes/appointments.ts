import { Hono } from 'hono';
import { prisma } from '../lib/prisma';

const appointments = new Hono();

appointments.get('/', async c => {
  const items = await prisma.appointment.findMany({
    take: 10,
    orderBy: { startsAt: 'desc' },
    include: { patient: true, clinic: true },
  });
  return c.json({ items });
});

export default appointments;
