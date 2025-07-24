import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import crypto from 'crypto';

/**
 * Instagram Webhook Handler - Research-Backed Implementation
 * 
 * Handles Instagram webhook events for:
 * - Account updates and permissions changes
 * - Media creation, updates, and deletion
 * - Comment and mention notifications
 * - Story updates and insights
 * 
 * Security: Verifies webhook signature using App Secret
 * Based on Meta's official webhook documentation and Next.js best practices
 */

interface InstagramWebhookEntry {
  id: string;
  time: number;
  changes: Array<{
    field: string;
    value: any;
  }>;
}

interface InstagramWebhookPayload {
  object: string;
  entry: InstagramWebhookEntry[];
}

interface InstagramMediaEvent {
  media_id: string;
  media_product_type: string;
  media_type: string;
  caption?: string;
  permalink?: string;
  timestamp: string;
}

interface InstagramCommentEvent {
  comment_id: string;
  parent_id?: string;
  media_id: string;
  text: string;
  from: {
    id: string;
    username?: string;
  };
  timestamp: string;
}

interface InstagramAccountEvent {
  account_id: string;
  account_username?: string;
  followers_count?: number;
  following_count?: number;
  media_count?: number;
}

/**
 * Verify Instagram webhook signature
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
 * Log webhook event for audit trail
 */
async function logWebhookEvent(
  supabase: any,
  eventType: string,
  eventData: any,
  profileId: string | null
) {
  try {
    await supabase
      .from('social_media_webhook_logs')
      .insert({
        platform: 'instagram',
        event_type: eventType,
        event_data: eventData,
        profile_id: profileId,
        processed_at: new Date().toISOString(),
        status: 'processed'
      });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

/**
 * Process Instagram media events (posts, stories, reels)
 */
async function processMediaEvent(
  supabase: any,
  change: any,
  accountId: string
) {
  const mediaData = change.value as InstagramMediaEvent;
  
  try {
    // Find the account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', accountId)
      .eq('platform', 'instagram')
      .single();

    if (!account) {
      console.warn(`Instagram account not found: ${accountId}`);
      return;
    }

    // Create or update post record
    const { error } = await supabase
      .from('social_media_posts')
      .upsert({
        platform: 'instagram',
        platform_post_id: mediaData.media_id,
        account_id: account.id,
        profile_id: account.profile_id,
        content: mediaData.caption || '',
        media_type: mediaData.media_type,
        media_url: mediaData.permalink,
        published_at: mediaData.timestamp,
        status: 'published',
        platform_data: mediaData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'platform_post_id,platform'
      });

    if (error) {
      console.error('Failed to update Instagram post:', error);
    }

    await logWebhookEvent(
      supabase,
      'media_update',
      mediaData,
      account.profile_id
    );

  } catch (error) {
    console.error('Error processing Instagram media event:', error);
  }
}

/**
 * Process Instagram comment events
 */
async function processCommentEvent(
  supabase: any,
  change: any,
  accountId: string
) {
  const commentData = change.value as InstagramCommentEvent;
  
  try {
    // Find the account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', accountId)
      .eq('platform', 'instagram')
      .single();

    if (!account) {
      console.warn(`Instagram account not found: ${accountId}`);
      return;
    }

    // Create engagement record for the comment
    const { error } = await supabase
      .from('social_media_analytics')
      .insert({
        platform: 'instagram',
        account_id: account.id,
        profile_id: account.profile_id,
        post_id: commentData.media_id,
        metric_type: 'comment',
        metric_value: 1,
        engagement_data: {
          comment_id: commentData.comment_id,
          comment_text: commentData.text,
          commenter_id: commentData.from.id,
          commenter_username: commentData.from.username,
          parent_comment_id: commentData.parent_id,
          timestamp: commentData.timestamp
        },
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record Instagram comment:', error);
    }

    await logWebhookEvent(
      supabase,
      'comment_created',
      commentData,
      account.profile_id
    );

  } catch (error) {
    console.error('Error processing Instagram comment event:', error);
  }
}

/**
 * Process Instagram account events
 */
async function processAccountEvent(
  supabase: any,
  change: any,
  accountId: string
) {
  const accountData = change.value as InstagramAccountEvent;
  
  try {
    // Update account metrics
    const { error } = await supabase
      .from('social_media_accounts')
      .update({
        account_metadata: {
          ...accountData,
          last_webhook_update: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('platform_account_id', accountId)
      .eq('platform', 'instagram');

    if (error) {
      console.error('Failed to update Instagram account:', error);
    }

    // Record account analytics if metrics are provided
    if (accountData.followers_count !== undefined) {
      await supabase
        .from('social_media_analytics')
        .insert({
          platform: 'instagram',
          account_id: accountData.account_id,
          metric_type: 'followers',
          metric_value: accountData.followers_count,
          recorded_at: new Date().toISOString()
        });
    }

    await logWebhookEvent(
      supabase,
      'account_update',
      accountData,
      null
    );

  } catch (error) {
    console.error('Error processing Instagram account event:', error);
  }
}

/**
 * GET handler for webhook verification (required by Instagram)
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  
  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Instagram webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }
  
  console.warn('Instagram webhook verification failed');
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
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    
    if (!appSecret) {
      console.error('Instagram App Secret not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(rawBody, signature, appSecret)) {
      console.warn('Instagram webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload: InstagramWebhookPayload = JSON.parse(rawBody);
    
    // Validate payload structure
    if (payload.object !== 'instagram') {
      console.warn('Invalid Instagram webhook object type:', payload.object);
      return NextResponse.json(
        { error: 'Invalid webhook object' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Process each entry in the webhook payload
    for (const entry of payload.entry) {
      const accountId = entry.id;
      
      for (const change of entry.changes) {
        console.log(`Processing Instagram webhook: ${change.field} for account ${accountId}`);
        
        switch (change.field) {
          case 'media':
            await processMediaEvent(supabase, change, accountId);
            break;
            
          case 'comments':
            await processCommentEvent(supabase, change, accountId);
            break;
            
          case 'mentions':
            await processCommentEvent(supabase, change, accountId);
            break;
            
          case 'story_insights':
            await processMediaEvent(supabase, change, accountId);
            break;
            
          case 'account':
            await processAccountEvent(supabase, change, accountId);
            break;
            
          default:
            console.log(`Unhandled Instagram webhook field: ${change.field}`);
            await logWebhookEvent(
              supabase,
              `unhandled_${change.field}`,
              change.value,
              null
            );
        }
      }
    }
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('Instagram webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}