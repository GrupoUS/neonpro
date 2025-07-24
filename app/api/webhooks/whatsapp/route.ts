import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import crypto from 'crypto';

/**
 * WhatsApp Business Webhook Handler - Research-Backed Implementation
 * 
 * Handles WhatsApp Business API webhook events for:
 * - Message delivery status updates
 * - Incoming messages and media
 * - Customer profile updates
 * - Business account status changes
 * - Template message status updates
 * 
 * Security: Verifies webhook signature using App Secret
 * Based on Meta's WhatsApp Business API documentation and healthcare compliance
 */

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: WhatsAppContact[];
      messages?: WhatsAppMessage[];
      statuses?: WhatsAppStatus[];
    };
    field: string;
  }>;
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  image?: {
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };
  document?: {
    mime_type: string;
    sha256: string;
    id: string;
    filename: string;
    caption?: string;
  };
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
    voice: boolean;
  };
  video?: {
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };
  location?: {
    longitude: number;
    latitude: number;
    name?: string;
    address?: string;
  };
  contacts?: any[];
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'interactive' | 'button' | 'system';
  context?: {
    from: string;
    id: string;
    forwarded?: boolean;
    frequently_forwarded?: boolean;
  };
}

interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: {
      details: string;
    };
  }>;
}

/**
 * Verify WhatsApp webhook signature
 * Based on Meta's webhook security documentation
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  appSecret: string
): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}

/**
 * Log webhook event for compliance and audit trail
 */
async function logWebhookEvent(
  supabase: any,
  eventType: string,
  eventData: any,
  profileId: string | null,
  phoneNumberId: string
) {
  try {
    await supabase
      .from('social_media_webhook_logs')
      .insert({
        platform: 'whatsapp',
        event_type: eventType,
        event_data: {
          ...eventData,
          phone_number_id: phoneNumberId
        },
        profile_id: profileId,
        processed_at: new Date().toISOString(),
        status: 'processed'
      });
  } catch (error) {
    console.error('Failed to log WhatsApp webhook event:', error);
  }
}

/**
 * Process incoming WhatsApp messages
 */
async function processIncomingMessage(
  supabase: any,
  message: WhatsAppMessage,
  phoneNumberId: string
) {
  try {
    // Find the WhatsApp account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', phoneNumberId)
      .eq('platform', 'whatsapp')
      .single();

    if (!account) {
      console.warn(`WhatsApp account not found: ${phoneNumberId}`);
      return;
    }

    // Extract message content based on type
    let messageContent = '';
    let mediaUrl = '';
    let mediaType = message.type;

    switch (message.type) {
      case 'text':
        messageContent = message.text?.body || '';
        break;
      case 'image':
        messageContent = message.image?.caption || '';
        mediaUrl = message.image?.id || '';
        break;
      case 'document':
        messageContent = `Document: ${message.document?.filename || 'Unknown'} - ${message.document?.caption || ''}`;
        mediaUrl = message.document?.id || '';
        break;
      case 'audio':
        messageContent = `Audio message ${message.audio?.voice ? '(voice note)' : ''}`;
        mediaUrl = message.audio?.id || '';
        break;
      case 'video':
        messageContent = message.video?.caption || 'Video message';
        mediaUrl = message.video?.id || '';
        break;
      case 'location':
        messageContent = `Location: ${message.location?.name || 'Shared location'} - ${message.location?.address || ''}`;
        break;
      default:
        messageContent = `${message.type} message`;
    }

    // Store the incoming message for customer service tracking
    const { error } = await supabase
      .from('social_media_analytics')
      .insert({
        platform: 'whatsapp',
        account_id: account.id,
        profile_id: account.profile_id,
        metric_type: 'message_received',
        metric_value: 1,
        engagement_data: {
          message_id: message.id,
          customer_wa_id: message.from,
          message_type: message.type,
          message_content: messageContent,
          media_url: mediaUrl,
          timestamp: message.timestamp,
          context: message.context,
          is_forwarded: message.context?.forwarded || false,
          is_frequently_forwarded: message.context?.frequently_forwarded || false
        },
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record WhatsApp message:', error);
    }

    await logWebhookEvent(
      supabase,
      'message_received',
      message,
      account.profile_id,
      phoneNumberId
    );

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
  }
}

/**
 * Process WhatsApp contact updates
 */
async function processContactUpdate(
  supabase: any,
  contact: WhatsAppContact,
  phoneNumberId: string
) {
  try {
    // Find the WhatsApp account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', phoneNumberId)
      .eq('platform', 'whatsapp')
      .single();

    if (!account) {
      console.warn(`WhatsApp account not found: ${phoneNumberId}`);
      return;
    }

    // Update contact information for CRM integration
    await supabase
      .from('social_media_analytics')
      .insert({
        platform: 'whatsapp',
        account_id: account.id,
        profile_id: account.profile_id,
        metric_type: 'contact_update',
        metric_value: 1,
        engagement_data: {
          wa_id: contact.wa_id,
          profile_name: contact.profile.name,
          updated_at: new Date().toISOString()
        },
        recorded_at: new Date().toISOString()
      });

    await logWebhookEvent(
      supabase,
      'contact_update',
      contact,
      account.profile_id,
      phoneNumberId
    );

  } catch (error) {
    console.error('Error processing WhatsApp contact update:', error);
  }
}

/**
 * Process WhatsApp message status updates
 */
async function processStatusUpdate(
  supabase: any,
  status: WhatsAppStatus,
  phoneNumberId: string
) {
  try {
    // Find the WhatsApp account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', phoneNumberId)
      .eq('platform', 'whatsapp')
      .single();

    if (!account) {
      console.warn(`WhatsApp account not found: ${phoneNumberId}`);
      return;
    }

    // Record delivery status for marketing campaign tracking
    await supabase
      .from('social_media_analytics')
      .insert({
        platform: 'whatsapp',
        account_id: account.id,
        profile_id: account.profile_id,
        metric_type: `message_${status.status}`,
        metric_value: 1,
        engagement_data: {
          message_id: status.id,
          recipient_id: status.recipient_id,
          status: status.status,
          timestamp: status.timestamp,
          conversation: status.conversation,
          pricing: status.pricing,
          errors: status.errors,
          billable: status.pricing?.billable || false
        },
        recorded_at: new Date().toISOString()
      });

    // If there are errors, log them separately for troubleshooting
    if (status.errors && status.errors.length > 0) {
      await logWebhookEvent(
        supabase,
        'message_error',
        {
          message_id: status.id,
          errors: status.errors
        },
        account.profile_id,
        phoneNumberId
      );
    }

    await logWebhookEvent(
      supabase,
      `status_${status.status}`,
      status,
      account.profile_id,
      phoneNumberId
    );

  } catch (error) {
    console.error('Error processing WhatsApp status update:', error);
  }
}

/**
 * GET handler for webhook verification (required by WhatsApp)
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }
  
  console.warn('WhatsApp webhook verification failed');
  return NextResponse.json(
    { error: 'Webhook verification failed' },
    { status: 403 }
  );
}

/**
 * POST handler for webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    
    if (!appSecret) {
      console.error('WhatsApp App Secret not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(rawBody, signature, appSecret)) {
      console.warn('WhatsApp webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload: WhatsAppWebhookPayload = JSON.parse(rawBody);
    
    // Validate payload structure
    if (payload.object !== 'whatsapp_business_account') {
      console.warn('Invalid WhatsApp webhook object type:', payload.object);
      return NextResponse.json(
        { error: 'Invalid webhook object' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Process each entry in the webhook payload
    for (const entry of payload.entry) {
      const businessAccountId = entry.id;
      
      for (const change of entry.changes) {
        const value = change.value;
        const phoneNumberId = value.metadata.phone_number_id;
        
        console.log(`Processing WhatsApp webhook: ${change.field} for phone ${phoneNumberId}`);
        
        // Validate messaging product
        if (value.messaging_product !== 'whatsapp') {
          console.warn('Invalid messaging product:', value.messaging_product);
          continue;
        }
        
        // Process incoming messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            await processIncomingMessage(supabase, message, phoneNumberId);
          }
        }
        
        // Process contact updates
        if (value.contacts && value.contacts.length > 0) {
          for (const contact of value.contacts) {
            await processContactUpdate(supabase, contact, phoneNumberId);
          }
        }
        
        // Process status updates
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            await processStatusUpdate(supabase, status, phoneNumberId);
          }
        }
        
        // Log unhandled fields for future enhancement
        if (!value.messages && !value.contacts && !value.statuses) {
          await logWebhookEvent(
            supabase,
            `unhandled_${change.field}`,
            value,
            null,
            phoneNumberId
          );
        }
      }
    }
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('WhatsApp webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}