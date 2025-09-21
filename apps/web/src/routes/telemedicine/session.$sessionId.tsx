import { createFileRoute } from '@tanstack/react-router';
import { TelemedicineSession } from '@/components/telemedicine/routes/TelemedicineSession';

export const Route = createFileRoute('/telemedicine/session/$sessionId')({
  component: TelemedicineSession,
});
