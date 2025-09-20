import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/google-calendar/disconnect')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { userId, clinicId } = body;

      if (!userId || !clinicId) {
        return json({ error: 'Missing userId or clinicId' }, { status: 400 });
      }

      // In a real implementation, you would:
      // 1. Find the Google Calendar integration
      // 2. Delete the integration and all related events
      // 3. Optionally revoke the Google token

      // For now, just return success
      return json({ success: true });
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      return json({ error: 'Failed to disconnect' }, { status: 500 });
    }
  },
});
