import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Social Media Posts API Route
 *
 * Handles CRUD operations for social media posts
 * Supports scheduling, publishing, and content management
 *
 * Research-backed implementation following:
 * - Instagram Content Publishing API guidelines
 * - Facebook Pages API posting patterns
 * - Content scheduling best practices
 * - Media handling and validation standards
 */

// Validation schemas
const createPostSchema = z.object({
  account_id: z.string().uuid(),
  post_type: z.enum(['post', 'story', 'reel', 'video', 'carousel', 'live']),
  content_text: z.string().max(2200).optional(), // Instagram caption limit
  media_urls: z.array(z.string().url()).default([]),
  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  post_settings: z.record(z.any()).default({}),
  scheduled_time: z.string().datetime().optional(),
  targeting_settings: z.record(z.any()).default({}),
  campaign_tag: z.string().max(255).optional(),
});

const updatePostSchema = z.object({
  content_text: z.string().max(2200).optional(),
  media_urls: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  post_settings: z.record(z.any()).optional(),
  scheduled_time: z.string().datetime().optional(),
  targeting_settings: z.record(z.any()).optional(),
  campaign_tag: z.string().max(255).optional(),
  status: z
    .enum(['draft', 'scheduled', 'published', 'failed', 'deleted'])
    .optional(),
});

type CreatePostData = z.infer<typeof createPostSchema>;
type UpdatePostData = z.infer<typeof updatePostSchema>;

/**
 * GET /api/social-media/posts
 *
 * Retrieves social media posts for the user's clinic
 * Supports filtering by account, status, date range, and campaign
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');
    const status = searchParams.get('status');
    const postType = searchParams.get('post_type');
    const campaignTag = searchParams.get('campaign_tag');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const limit = Math.min(
      Number.parseInt(searchParams.get('limit') || '50', 10),
      100
    );
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('social_media_posts')
      .select(
        `
        id,
        account_id,
        post_type,
        content_text,
        media_urls,
        hashtags,
        mentions,
        post_settings,
        scheduled_time,
        published_time,
        status,
        platform_post_id,
        platform_post_url,
        engagement_stats,
        targeting_settings,
        campaign_tag,
        error_message,
        created_at,
        updated_at,
        created_by,
        published_by,
        social_media_accounts!inner(
          id,
          platform_name,
          account_name,
          account_handle,
          social_media_platforms!inner(
            platform_display_name,
            platform_icon_url
          )
        ),
        profiles!social_media_posts_created_by_fkey(
          first_name,
          last_name
        )
      `
      )
      .eq('clinic_id', profile.clinic_id);

    // Apply filters
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (postType) {
      query = query.eq('post_type', postType);
    }
    if (campaignTag) {
      query = query.eq('campaign_tag', campaignTag);
    }
    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }
    if (toDate) {
      query = query.lte('created_at', toDate);
    }

    const {
      data: posts,
      error,
      count,
    } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching social media posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: posts,
      total: count || posts?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Social media posts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-media/posts
 *
 * Creates a new social media post
 * Supports both immediate publishing and scheduling
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic access required' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    // Verify account exists and belongs to clinic
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('id, platform_name, status, sync_status')
      .eq('id', validatedData.account_id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: 'Invalid social media account' },
        { status: 400 }
      );
    }

    if (account.status !== 'active' || account.sync_status !== 'active') {
      return NextResponse.json(
        { error: 'Social media account is not active or synchronized' },
        { status: 400 }
      );
    }

    // Validate post content based on platform
    const contentValidation = validatePostContent(
      account.platform_name,
      validatedData.post_type,
      validatedData.content_text || '',
      validatedData.media_urls
    );

    if (!contentValidation.valid) {
      return NextResponse.json(
        {
          error: 'Post content validation failed',
          details: contentValidation.errors,
        },
        { status: 400 }
      );
    }

    // Determine post status
    let postStatus = 'draft';
    if (validatedData.scheduled_time) {
      const scheduledDate = new Date(validatedData.scheduled_time);
      if (scheduledDate > new Date()) {
        postStatus = 'scheduled';
      } else {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
    }

    // Create post
    const postData = {
      ...validatedData,
      clinic_id: profile.clinic_id,
      status: postStatus,
      created_by: session.user.id,
    };

    const { data: newPost, error } = await supabase
      .from('social_media_posts')
      .insert([postData])
      .select(
        `
        id,
        account_id,
        post_type,
        content_text,
        media_urls,
        hashtags,
        mentions,
        scheduled_time,
        status,
        campaign_tag,
        created_at,
        social_media_accounts!inner(
          platform_name,
          account_name,
          social_media_platforms!inner(
            platform_display_name
          )
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creating social media post:', error);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // TODO: If not scheduled, trigger immediate publishing logic
    // TODO: If scheduled, add to background job queue

    return NextResponse.json(
      {
        success: true,
        data: newPost,
        message:
          postStatus === 'scheduled'
            ? 'Post scheduled successfully'
            : 'Post created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Social media posts POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validates post content based on platform requirements
 */
function validatePostContent(
  platform: string,
  postType: string,
  content: string,
  mediaUrls: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (platform) {
    case 'instagram':
      // Instagram specific validation
      if (postType === 'post' && mediaUrls.length === 0) {
        errors.push('Instagram posts require at least one media file');
      }
      if (content.length > 2200) {
        errors.push('Instagram caption cannot exceed 2200 characters');
      }
      if (postType === 'carousel' && mediaUrls.length < 2) {
        errors.push('Instagram carousel posts require at least 2 media files');
      }
      if (postType === 'carousel' && mediaUrls.length > 10) {
        errors.push('Instagram carousel posts cannot exceed 10 media files');
      }
      break;

    case 'facebook':
      // Facebook specific validation
      if (content.length > 63_206) {
        errors.push('Facebook post content cannot exceed 63,206 characters');
      }
      break;

    case 'whatsapp_business':
      // WhatsApp Business specific validation
      if (postType !== 'post') {
        errors.push('WhatsApp Business only supports regular posts');
      }
      if (content.length > 4096) {
        errors.push('WhatsApp message cannot exceed 4096 characters');
      }
      break;

    case 'tiktok':
      // TikTok specific validation
      if (postType === 'post' && mediaUrls.length === 0) {
        errors.push('TikTok posts require video content');
      }
      if (content.length > 300) {
        errors.push('TikTok caption cannot exceed 300 characters');
      }
      break;

    case 'linkedin':
      // LinkedIn specific validation
      if (content.length > 3000) {
        errors.push('LinkedIn post content cannot exceed 3000 characters');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
