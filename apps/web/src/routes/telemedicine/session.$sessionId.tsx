import { TelemedicineSession } from '@/components/telemedicine/routes/TelemedicineSession';
import { createFileRoute } from '@tanstack/react-router';

export const _Route = createFileRoute('/telemedicine/session/$sessionId')({
  component: TelemedicineSession,
});
