import { createFileRoute } from '@tanstack/react-router';
import { TelemedicineDashboard } from '@/components/telemedicine/routes/TelemedicineDashboard';

export const Route = createFileRoute('/telemedicine/')({
  component: TelemedicineDashboard,
});
