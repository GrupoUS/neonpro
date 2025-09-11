import { Hono } from 'hono';
import { prisma } from '../lib/prisma';

const patients = new Hono();

patients.get('/', async c => {
  const items = await prisma.patient.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  return c.json({ items });
});

export default patients;
