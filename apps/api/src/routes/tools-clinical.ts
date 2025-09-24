import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
const app = new Hono();

const NewTreatmentsRequest = z.object({
  clinicId: z.string().min(1),
  fromDate: z.string().optional(),
  locale: z.string().default('pt-BR'),
});

const PatientBalanceRequest = z.object({
  clinicId: z.string().min(1),
  patientId: z.string().min(1),
  locale: z.string().default('pt-BR'),
});

type TreatmentItem = {
  id: string;
  patientId: string;
  provider: string;
  codes: string[];
  consentRequired: boolean;
};

type TreatmentsResponse = { items: TreatmentItem[] };

type BalanceResponse = {
  patientId: string;
  balance: { outstanding: number; credits: number };
  consent: { required: boolean; missing?: string[] };
};

app.post('/treatments/new', zValidator('json', NewTreatmentsRequest), c => {
  const data: TreatmentsResponse = {
    items: [
      {
        id: 't_001',
        patientId: 'p_001',
        provider: 'Dra. Maria',
        codes: ['TRT-FA-01'],
        consentRequired: false,
      },
      {
        id: 't_002',
        patientId: 'p_002',
        provider: 'Dr. João',
        codes: ['TRT-CO-11', 'TRT-CO-15'],
        consentRequired: true,
      },
    ],
  };
  return c.json(data);
});

app.post('/patient/balance', zValidator('json', PatientBalanceRequest), c => {
  const { patientId } = c.req.valid('json');
  const resp: BalanceResponse = {
    patientId,
    balance: { outstanding: 250.0, credits: 50.0 },
    consent: { required: false },
  };
  return c.json(resp);
});

export default app;
