import { TelemedicineDashboard } from '@/components/telemedicine/routes/TelemedicineDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/telemedicine/')({
  component: TelemedicineDashboard,
});
