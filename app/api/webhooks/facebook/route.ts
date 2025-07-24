import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import crypto from 'crypto';

/**
 * Facebook Pages Webhook Handler - Research-Backed Implementation
 * 
 * Handles Facebook Pages webhook events for:
 * - Page posts and updates
 * - Page likes and follows
 * - Message events and conversations
 * - Page insights and analytics
 * - Permissions and access changes
 * 
 * Security: Verifies webhook signature using App Secret
 * Based on Meta's Graph API webhook documentation and Next.js patterns
 */

interface FacebookWebhookEntry {
  id: string;
  time: number;
  changes?: Array<{
    field: string;
    value: any;
  }>;
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text?: string;
      attachments?: any[];
    };
  }>;
}

interface FacebookWebhookPayload {
  object: string;
  entry: FacebookWebhookEntry[];
}

interface FacebookPostEvent {
  post_id: string;
  verb: 'add' | 'edited' | 'remove';
  item: 'post' | 'photo' | 'video' | 'link';
  created_time?: number;
  message?: string;
  link?: string;
  picture?: string;
  from?: {
    id: string;
    name: string;
  };
}

interface FacebookPageEvent {
  page_id: string;
  category: string;
  name?: string;
  fan_count?: number;
  talking_about_count?: number;
  were_here_count?: number;
}

interface FacebookEngagementEvent {
  post_id: string;
  reaction_type?: string;
  comment_id?: string;
  parent_id?: string;
  from: {
    id: string;
    name?: string;
  };
  message?: string;
  created_time: number;
  verb: 'add' | 'remove' | 'edit';
}

/**
 * Verify Facebook webhook signature
 * Based on Meta's webhook security guidelines
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
 * Log webhook event for audit trail and compliance
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
        platform: 'facebook',
        event_type: eventType,
        event_data: eventData,
        profile_id: profileId,
        processed_at: new Date().toISOString(),
        status: 'processed'
      });
  } catch (error) {
    console.error('Failed to log Facebook webhook event:', error);
  }
}

/**
 * Process Facebook page post events
 */
async function processPostEvent(
  supabase: any,
  change: any,
  pageId: string
) {
  const postData = change.value as FacebookPostEvent;
  
  try {
    // Find the page account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', pageId)
      .eq('platform', 'facebook')
      .single();

    if (!account) {
      console.warn(`Facebook page not found: ${pageId}`);
      return;
    }

    if (postData.verb === 'add' || postData.verb === 'edited') {
      // Create or update post record
      const { error } = await supabase
        .from('social_media_posts')
        .upsert({
          platform: 'facebook',
          platform_post_id: postData.post_id,
          account_id: account.id,
          profile_id: account.profile_id,
          content: postData.message || '',
          media_type: postData.item,
          media_url: postData.link || postData.picture,
          published_at: postData.created_time 
            ? new Date(postData.created_time * 1000).toISOString()
            : new Date().toISOString(),
          status: 'published',
          platform_data: postData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'platform_post_id,platform'
        });

      if (error) {
        console.error('Failed to update Facebook post:', error);
      }
    } else if (postData.verb === 'remove') {
      // Mark post as deleted
      await supabase
        .from('social_media_posts')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('platform_post_id', postData.post_id)
        .eq('platform', 'facebook');
    }

    await logWebhookEvent(
      supabase,
      `post_${postData.verb}`,
      postData,
      account.profile_id
    );

  } catch (error) {
    console.error('Error processing Facebook post event:', error);
  }
}

/**
 * Process Facebook page likes and follows
 */
async function processLikeEvent(
  supabase: any,
  change: any,
  pageId: string
) {
  const engagementData = change.value as FacebookEngagementEvent;
  
  try {
    // Find the page account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', pageId)
      .eq('platform', 'facebook')
      .single();

    if (!account) {
      console.warn(`Facebook page not found: ${pageId}`);
      return;
    }

    // Record engagement analytics
    const { error } = await supabase
      .from('social_media_analytics')
      .insert({
        platform: 'facebook',
        account_id: account.id,
        profile_id: account.profile_id,
        post_id: engagementData.post_id,
        metric_type: engagementData.reaction_type || 'like',
        metric_value: engagementData.verb === 'add' ? 1 : -1,
        engagement_data: {
          user_id: engagementData.from.id,
          user_name: engagementData.from.name,
          action: engagementData.verb,
          timestamp: engagementData.created_time
        },
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record Facebook engagement:', error);
    }

    await logWebhookEvent(
      supabase,
      `${engagementData.reaction_type || 'like'}_${engagementData.verb}`,
      engagementData,
      account.profile_id
    );

  } catch (error) {
    console.error('Error processing Facebook like event:', error);
  }
}

/**
 * Process Facebook comment events
 */
async function processCommentEvent(
  supabase: any,
  change: any,
  pageId: string
) {
  const commentData = change.value as FacebookEngagementEvent;
  
  try {
    // Find the page account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', pageId)
      .eq('platform', 'facebook')
      .single();

    if (!account) {
      console.warn(`Facebook page not found: ${pageId}`);
      return;
    }

    // Record comment analytics
    const { error } = await supabase
      .from('social_media_analytics')
      .insert({
        platform: 'facebook',
        account_id: account.id,
        profile_id: account.profile_id,
        post_id: commentData.post_id,
        metric_type: 'comment',
        metric_value: commentData.verb === 'add' ? 1 : (commentData.verb === 'remove' ? -1 : 0),
        engagement_data: {
          comment_id: commentData.comment_id,
          comment_text: commentData.message,
          commenter_id: commentData.from.id,
          commenter_name: commentData.from.name,
          parent_comment_id: commentData.parent_id,
          action: commentData.verb,
          timestamp: commentData.created_time
        },
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record Facebook comment:', error);
    }

    await logWebhookEvent(
      supabase,
      `comment_${commentData.verb}`,
      commentData,
      account.profile_id
    );

  } catch (error) {
    console.error('Error processing Facebook comment event:', error);
  }
}

/**
 * Process Facebook page events (fan count, etc.)
 */
async function processPageEvent(
  supabase: any,
  change: any,
  pageId: string
) {
  const pageData = change.value as FacebookPageEvent;
  
  try {
    // Update page metrics
    const { error } = await supabase
      .from('social_media_accounts')
      .update({
        account_metadata: {
          ...pageData,
          last_webhook_update: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('platform_account_id', pageId)
      .eq('platform', 'facebook');

    if (error) {
      console.error('Failed to update Facebook page:', error);
    }

    // Record page analytics if metrics are provided
    if (pageData.fan_count !== undefined) {
      await supabase
        .from('social_media_analytics')
        .insert({
          platform: 'facebook',
          account_id: pageId,
          metric_type: 'followers',
          metric_value: pageData.fan_count,
          recorded_at: new Date().toISOString()
        });
    }

    await logWebhookEvent(
      supabase,
      'page_update',
      pageData,
      null
    );

  } catch (error) {
    console.error('Error processing Facebook page event:', error);
  }
}

/**
 * Process Facebook Messenger events
 */
async function processMessagingEvent(
  supabase: any,
  messaging: any,
  pageId: string
) {
  try {
    // Find the page account in our database
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, profile_id')
      .eq('platform_account_id', pageId)
      .eq('platform', 'facebook')
      .single();

    if (!account) {
      console.warn(`Facebook page not found: ${pageId}`);
      return;
    }

    for (const message of messaging) {
      if (message.message) {
        // Record message event for customer service analytics
        await supabase
          .from('social_media_analytics')
          .insert({
            platform: 'facebook',
            account_id: account.id,
            profile_id: account.profile_id,
            metric_type: 'message',
            metric_value: 1,
            engagement_data: {
              message_id: message.message.mid,
              sender_id: message.sender.id,
              recipient_id: message.recipient.id,
              message_text: message.message.text,
              attachments: message.message.attachments,
              timestamp: message.timestamp
            },
            recorded_at: new Date().toISOString()
          });

        await logWebhookEvent(
          supabase,
          'message_received',
          message,
          account.profile_id
        );
      }
    }

  } catch (error) {
    console.error('Error processing Facebook messaging event:', error);
  }
}

/**
 * GET handler for webhook verification (required by Facebook)
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  
  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Facebook webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }
  
  console.warn('Facebook webhook verification failed');
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
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appSecret) {
      console.error('Facebook App Secret not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(rawBody, signature, appSecret)) {
      console.warn('Facebook webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload: FacebookWebhookPayload = JSON.parse(rawBody);
    
    // Validate payload structure
    if (payload.object !== 'page') {
      console.warn('Invalid Facebook webhook object type:', payload.object);
      return NextResponse.json(
        { error: 'Invalid webhook object' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Process each entry in the webhook payload
    for (const entry of payload.entry) {
      const pageId = entry.id;
      
      // Process messaging events (Messenger)
      if (entry.messaging) {
        await processMessagingEvent(supabase, entry.messaging, pageId);
      }
      
      // Process page changes
      if (entry.changes) {
        for (const change of entry.changes) {
          console.log(`Processing Facebook webhook: ${change.field} for page ${pageId}`);
          
          switch (change.field) {
            case 'feed':
              await processPostEvent(supabase, change, pageId);
              break;
              
            case 'likes':
            case 'reactions':
              await processLikeEvent(supabase, change, pageId);
              break;
              
            case 'comments':
              await processCommentEvent(supabase, change, pageId);
              break;
              
            case 'page':
              await processPageEvent(supabase, change, pageId);
              break;
              
            case 'mentions':
              await processCommentEvent(supabase, change, pageId);
              break;
              
            default:
              console.log(`Unhandled Facebook webhook field: ${change.field}`);
              await logWebhookEvent(
                supabase,
                `unhandled_${change.field}`,
                change.value,
                null
              );
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('Facebook webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}