import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import crypto from 'crypto';

/**
 * HubSpot Webhook Handler - Research-Backed Implementation
 * 
 * Handles HubSpot webhook events for:
 * - Contact property updates and lifecycle changes
 * - Deal creation, updates, and stage changes
 * - Company property updates
 * - Email engagement events (opens, clicks, bounces)
 * - Form submissions and conversions
 * - Custom object updates
 * 
 * Security: Verifies webhook signature using App Secret
 * Based on HubSpot's official webhook documentation and CRM best practices
 */

interface HubSpotWebhookPayload {
  eventId: number;
  subscriptionId: number;
  portalId: number;
  occurredAt: number;
  subscriptionType: string;
  attemptNumber: number;
  objectId: number;
  changeSource: string;
  changeFlag: string;
  appId?: number;
  eventDetails?: {
    objectId: number;
    propertyName?: string;
    propertyValue?: any;
    sourceId?: string;
    sourceLabel?: string;
    userId?: number;
    userEmail?: string;
  };
}

interface HubSpotContactEvent {
  objectId: number;
  propertyName: string;
  propertyValue: any;
  previousValue?: any;
  changeSource: string;
  timestamp: number;
}

interface HubSpotDealEvent {
  objectId: number;
  propertyName: string;
  propertyValue: any;
  previousValue?: any;
  dealstage?: string;
  amount?: number;
  dealname?: string;
  closedate?: string;
  changeSource: string;
  timestamp: number;
}

interface HubSpotEmailEvent {
  objectId: number;
  emailId: string;
  campaignId?: string;
  eventType: 'SENT' | 'DELIVERED' | 'OPEN' | 'CLICK' | 'BOUNCE' | 'SPAM_REPORT' | 'UNSUBSCRIBE';
  timestamp: number;
  recipient: string;
  url?: string;
  userAgent?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Verify HubSpot webhook signature
 * Based on HubSpot's webhook security documentation
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  clientSecret: string,
  requestUri: string,
  httpMethod: string,
  timestamp: string
): boolean {
  if (!signature) return false;
  
  const sourceString = httpMethod + requestUri + payload + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', clientSecret)
    .update(sourceString)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * Log webhook event for audit trail and compliance
 */
async function logWebhookEvent(
  supabase: any,
  eventType: string,
  eventData: any,
  profileId: string | null,
  portalId: number
) {
  try {
    await supabase
      .from('marketing_webhook_logs')
      .insert({
        platform: 'hubspot',
        event_type: eventType,
        event_data: {
          ...eventData,
          portal_id: portalId
        },
        profile_id: profileId,
        processed_at: new Date().toISOString(),
        status: 'processed'
      });
  } catch (error) {
    console.error('Failed to log HubSpot webhook event:', error);
  }
}

/**
 * Process HubSpot contact property updates
 */
async function processContactUpdate(
  supabase: any,
  payload: HubSpotWebhookPayload
) {
  try {
    // Find the HubSpot connection in our database
    const { data: connection } = await supabase
      .from('marketing_connections')
      .select('id, profile_id, account_id')
      .eq('platform_account_id', payload.portalId.toString())
      .eq('platform', 'hubspot')
      .single();

    if (!connection) {
      console.warn(`HubSpot portal not found: ${payload.portalId}`);
      return;
    }

    const contactEvent: HubSpotContactEvent = {
      objectId: payload.objectId,
      propertyName: payload.eventDetails?.propertyName || 'unknown',
      propertyValue: payload.eventDetails?.propertyValue,
      changeSource: payload.changeSource,
      timestamp: payload.occurredAt
    };

    // Record contact analytics for CRM insights
    await supabase
      .from('marketing_analytics')
      .insert({
        platform: 'hubspot',
        connection_id: connection.id,
        profile_id: connection.profile_id,
        metric_type: 'contact_update',
        metric_value: 1,
        campaign_data: {
          contact_id: payload.objectId,
          property_name: contactEvent.propertyName,
          property_value: contactEvent.propertyValue,
          change_source: contactEvent.changeSource,
          user_id: payload.eventDetails?.userId,
          user_email: payload.eventDetails?.userEmail
        },
        recorded_at: new Date().toISOString()
      });

    // If this is a lifecycle stage change, record it specifically
    if (contactEvent.propertyName === 'lifecyclestage') {
      await supabase
        .from('marketing_analytics')
        .insert({
          platform: 'hubspot',
          connection_id: connection.id,
          profile_id: connection.profile_id,
          metric_type: 'lifecycle_stage_change',
          metric_value: 1,
          campaign_data: {
            contact_id: payload.objectId,
            new_stage: contactEvent.propertyValue,
            previous_stage: payload.eventDetails?.sourceLabel,
            timestamp: payload.occurredAt
          },
          recorded_at: new Date().toISOString()
        });
    }

    await logWebhookEvent(
      supabase,
      'contact_property_change',
      contactEvent,
      connection.profile_id,
      payload.portalId
    );

  } catch (error) {
    console.error('Error processing HubSpot contact update:', error);
  }
}

/**
 * Process HubSpot deal updates
 */
async function processDealUpdate(
  supabase: any,
  payload: HubSpotWebhookPayload
) {
  try {
    // Find the HubSpot connection in our database
    const { data: connection } = await supabase
      .from('marketing_connections')
      .select('id, profile_id, account_id')
      .eq('platform_account_id', payload.portalId.toString())
      .eq('platform', 'hubspot')
      .single();

    if (!connection) {
      console.warn(`HubSpot portal not found: ${payload.portalId}`);
      return;
    }

    const dealEvent: HubSpotDealEvent = {
      objectId: payload.objectId,
      propertyName: payload.eventDetails?.propertyName || 'unknown',
      propertyValue: payload.eventDetails?.propertyValue,
      changeSource: payload.changeSource,
      timestamp: payload.occurredAt
    };

    // Record deal analytics for sales pipeline insights
    await supabase
      .from('marketing_analytics')
      .insert({
        platform: 'hubspot',
        connection_id: connection.id,
        profile_id: connection.profile_id,
        metric_type: 'deal_update',
        metric_value: 1,
        campaign_data: {
          deal_id: payload.objectId,
          property_name: dealEvent.propertyName,
          property_value: dealEvent.propertyValue,
          change_source: dealEvent.changeSource,
          user_id: payload.eventDetails?.userId,
          user_email: payload.eventDetails?.userEmail
        },
        recorded_at: new Date().toISOString()
      });

    // If this is a deal stage change, record it specifically for pipeline analytics
    if (dealEvent.propertyName === 'dealstage') {
      await supabase
        .from('marketing_analytics')
        .insert({
          platform: 'hubspot',
          connection_id: connection.id,
          profile_id: connection.profile_id,
          metric_type: 'deal_stage_change',
          metric_value: 1,
          campaign_data: {
            deal_id: payload.objectId,
            new_stage: dealEvent.propertyValue,
            previous_stage: payload.eventDetails?.sourceLabel,
            timestamp: payload.occurredAt
          },
          recorded_at: new Date().toISOString()
        });
    }

    // If this is a deal amount change, record the financial impact
    if (dealEvent.propertyName === 'amount' && dealEvent.propertyValue) {
      await supabase
        .from('marketing_analytics')
        .insert({
          platform: 'hubspot',
          connection_id: connection.id,
          profile_id: connection.profile_id,
          metric_type: 'deal_value_change',
          metric_value: parseFloat(dealEvent.propertyValue) || 0,
          campaign_data: {
            deal_id: payload.objectId,
            new_amount: dealEvent.propertyValue,
            timestamp: payload.occurredAt
          },
          recorded_at: new Date().toISOString()
        });
    }

    await logWebhookEvent(
      supabase,
      'deal_property_change',
      dealEvent,
      connection.profile_id,
      payload.portalId
    );

  } catch (error) {
    console.error('Error processing HubSpot deal update:', error);
  }
}

/**
 * Process HubSpot company updates
 */
async function processCompanyUpdate(
  supabase: any,
  payload: HubSpotWebhookPayload
) {
  try {
    // Find the HubSpot connection in our database
    const { data: connection } = await supabase
      .from('marketing_connections')
      .select('id, profile_id, account_id')
      .eq('platform_account_id', payload.portalId.toString())
      .eq('platform', 'hubspot')
      .single();

    if (!connection) {
      console.warn(`HubSpot portal not found: ${payload.portalId}`);
      return;
    }

    // Record company analytics for account-based marketing insights
    await supabase
      .from('marketing_analytics')
      .insert({
        platform: 'hubspot',
        connection_id: connection.id,
        profile_id: connection.profile_id,
        metric_type: 'company_update',
        metric_value: 1,
        campaign_data: {
          company_id: payload.objectId,
          property_name: payload.eventDetails?.propertyName,
          property_value: payload.eventDetails?.propertyValue,
          change_source: payload.changeSource,
          user_id: payload.eventDetails?.userId,
          user_email: payload.eventDetails?.userEmail
        },
        recorded_at: new Date().toISOString()
      });

    await logWebhookEvent(
      supabase,
      'company_property_change',
      payload,
      connection.profile_id,
      payload.portalId
    );

  } catch (error) {
    console.error('Error processing HubSpot company update:', error);
  }
}

/**
 * Process HubSpot email engagement events
 */
async function processEmailEvent(
  supabase: any,
  payload: HubSpotWebhookPayload,
  eventType: string
) {
  try {
    // Find the HubSpot connection in our database
    const { data: connection } = await supabase
      .from('marketing_connections')
      .select('id, profile_id, account_id')
      .eq('platform_account_id', payload.portalId.toString())
      .eq('platform', 'hubspot')
      .single();

    if (!connection) {
      console.warn(`HubSpot portal not found: ${payload.portalId}`);
      return;
    }

    // Record email engagement for marketing campaign analytics
    await supabase
      .from('marketing_analytics')
      .insert({
        platform: 'hubspot',
        connection_id: connection.id,
        profile_id: connection.profile_id,
        metric_type: `email_${eventType.toLowerCase()}`,
        metric_value: 1,
        campaign_data: {
          contact_id: payload.objectId,
          email_id: payload.eventDetails?.sourceId,
          event_type: eventType,
          timestamp: payload.occurredAt,
          user_agent: payload.eventDetails?.sourceLabel
        },
        recorded_at: new Date().toISOString()
      });

    await logWebhookEvent(
      supabase,
      `email_${eventType.toLowerCase()}`,
      payload,
      connection.profile_id,
      payload.portalId
    );

  } catch (error) {
    console.error('Error processing HubSpot email event:', error);
  }
}

/**
 * POST handler for HubSpot webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hubspot-signature-256');
    const requestUri = request.url;
    const timestamp = request.headers.get('x-hubspot-request-timestamp') || '';
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    
    if (!clientSecret) {
      console.error('HubSpot Client Secret not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(rawBody, signature, clientSecret, requestUri, 'POST', timestamp)) {
      console.warn('HubSpot webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload: HubSpotWebhookPayload[] = JSON.parse(rawBody);
    const supabase = await createClient();
    
    // Process each webhook event
    for (const event of payload) {
      console.log(`Processing HubSpot webhook: ${event.subscriptionType} for object ${event.objectId}`);
      
      switch (event.subscriptionType) {
        case 'contact.propertyChange':
          await processContactUpdate(supabase, event);
          break;
          
        case 'deal.propertyChange':
          await processDealUpdate(supabase, event);
          break;
          
        case 'company.propertyChange':
          await processCompanyUpdate(supabase, event);
          break;
          
        case 'contact.creation':
          await processContactUpdate(supabase, event);
          break;
          
        case 'deal.creation':
          await processDealUpdate(supabase, event);
          break;
          
        case 'company.creation':
          await processCompanyUpdate(supabase, event);
          break;
          
        case 'email.sent':
          await processEmailEvent(supabase, event, 'SENT');
          break;
          
        case 'email.delivered':
          await processEmailEvent(supabase, event, 'DELIVERED');
          break;
          
        case 'email.open':
          await processEmailEvent(supabase, event, 'OPEN');
          break;
          
        case 'email.click':
          await processEmailEvent(supabase, event, 'CLICK');
          break;
          
        case 'email.bounce':
          await processEmailEvent(supabase, event, 'BOUNCE');
          break;
          
        case 'email.unsubscribe':
          await processEmailEvent(supabase, event, 'UNSUBSCRIBE');
          break;
          
        default:
          console.log(`Unhandled HubSpot webhook subscription type: ${event.subscriptionType}`);
          await logWebhookEvent(
            supabase,
            `unhandled_${event.subscriptionType}`,
            event,
            null,
            event.portalId
          );
      }
    }
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('HubSpot webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}