import { createFileRoute } from '@tanstack/react-router';

import { GoogleCalendarService } from '@/services/google-calendar';

export const Route = createFileRoute('/api/google-calendar/connect')({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const clinicId = url.searchParams.get('clinicId');
      const lgpdConsent = url.searchParams.get('lgpdConsent') === 'true';

      if (!userId || !clinicId) {
        throw new Error('Missing required parameters');
      }

      const service = new GoogleCalendarService({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET!,
        redirectUri: `${window.location.origin}/google-calendar/auth`,
      });

      // Create state with user info
      const state = btoa(
        JSON.stringify({
          userId,
          clinicId,
          lgpdConsent,
          timestamp: Date.now(),
        }),
      );

      const authUrl = service.client.getAuthUrl(state);

      return json({ authUrl });
    } catch (_error) {
      console.error('Error generating auth URL:', error);
      return json({ error: 'Failed to generate auth URL' }, { status: 500 });
    }
  },
});
