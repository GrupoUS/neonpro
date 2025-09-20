import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/google-calendar/webhook')({
  POST: async ({ request }) => {
    try {
      const headers = request.headers;
      const channelId = headers.get('x-goog-channel-id');
      const resourceId = headers.get('x-goog-resource-id');
      const resourceState = headers.get('x-goog-resource-state');

      // Verify this is a Google notification
      if (!channelId || !resourceId) {
        return json({ error: 'Invalid notification' }, { status: 400 });
      }

      // Handle sync notifications
      if (resourceState === 'sync') {
        // Initial sync notification
        return json({ status: 'sync_received' });
      }

      if (resourceState === 'exists') {
        // Calendar change notification
        // In a real implementation, you would:
        // 1. Find the integration by channel ID
        // 2. Sync changes from Google Calendar
        // 3. Update local appointments accordingly
        
        console.log('Calendar change notification:', {
          channelId,
          resourceId,
          resourceState,
        });

        // For now, just acknowledge receipt
        return json({ status: 'notification_received' });
      }

      return json({ status: 'unhandled_state' });
    } catch (error) {
      console.error('Error handling webhook:', error);
      return json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },

  // Google requires a GET request for webhook verification
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const challenge = url.searchParams.get('challenge');

      if (challenge) {
        // Return the challenge to verify webhook
        return new Response(challenge, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }

      return json({ error: 'Missing challenge' }, { status: 400 });
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return json(
        { error: 'Verification failed' },
        { status: 500 }
      );
    }
  },
});