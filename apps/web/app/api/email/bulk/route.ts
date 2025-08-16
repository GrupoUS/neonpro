import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import EmailService from '@/app/lib/services/email-service';
import { EmailMessageSchema } from '@/app/types/email';
import { createClient } from '@/app/utils/supabase/server';

const BulkEmailSchema = z.object({
  messages: z
    .array(EmailMessageSchema)
    .min(1, 'At least one message is required'),
  batchSize: z.number().min(1).max(100).optional().default(10),
  delayBetweenBatches: z.number().min(0).max(60_000).optional().default(1000), // Max 1 minute delay
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to verify clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Check if user has permission for bulk sending
    if (!['admin', 'manager', 'marketer'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions for bulk email sending' },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();

    try {
      BulkEmailSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationError.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 },
        );
      }
      throw validationError;
    }

    const { messages, batchSize } = body;

    // Check rate limits
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { count: recentEmailCount } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .gte('created_at', oneHourAgo.toISOString());

    // Get email settings for rate limits
    const { data: settings } = await supabase
      .from('email_settings')
      .select('delivery_optimization')
      .eq('clinic_id', profile.clinic_id)
      .single();

    const hourlyLimit =
      settings?.delivery_optimization?.rateLimit?.emailsPerHour || 1000;
    const dailyLimit =
      settings?.delivery_optimization?.rateLimit?.emailsPerDay || 10_000;

    if ((recentEmailCount || 0) + messages.length > hourlyLimit) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: `Hourly limit of ${hourlyLimit} emails would be exceeded`,
        },
        { status: 429 },
      );
    }

    // Check daily limit
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { count: dailyEmailCount } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .gte('created_at', oneDayAgo.toISOString());

    if ((dailyEmailCount || 0) + messages.length > dailyLimit) {
      return NextResponse.json(
        {
          error: 'Daily rate limit exceeded',
          details: `Daily limit of ${dailyLimit} emails would be exceeded`,
        },
        { status: 429 },
      );
    }

    // Initialize email service
    const emailService = new EmailService(supabase, profile.clinic_id);

    // Get provider configurations
    const { data: providerConfigs } = await supabase
      .from('email_providers')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (!providerConfigs || providerConfigs.length === 0) {
      return NextResponse.json(
        { error: 'No email providers configured' },
        { status: 503 },
      );
    }

    // Initialize providers
    await emailService.initializeProviders(
      providerConfigs.map((config) => ({
        provider: config.provider,
        name: config.name,
        settings: config.settings,
        isActive: config.is_active,
        priority: config.priority,
        dailyLimit: config.daily_limit,
        monthlyLimit: config.monthly_limit,
        rateLimit: config.rate_limit,
      })),
    );

    // Create bulk email campaign record
    const campaignId = crypto.randomUUID();
    await supabase.from('email_campaigns').insert([
      {
        id: campaignId,
        clinic_id: profile.clinic_id,
        created_by: session.user.id,
        name: `Bulk Campaign ${new Date().toLocaleDateString()}`,
        status: 'sending',
        total_recipients: messages.length,
        batch_size: batchSize,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      },
    ]);

    // Send bulk emails
    const result = await emailService.sendBulkEmail(
      messages,
      undefined,
      batchSize,
    );

    // Log each email send attempt
    const emailLogs = result.results.map((emailResult, index) => ({
      id: crypto.randomUUID(),
      clinic_id: profile.clinic_id,
      user_id: session.user.id,
      campaign_id: campaignId,
      message_id: emailResult.messageId,
      recipient_email: emailResult.email,
      subject: messages[index]?.subject || '',
      template_id: messages[index]?.templateId,
      status: emailResult.success ? 'sent' : 'failed',
      error_message: emailResult.error,
      metadata: {
        batch_index: Math.floor(index / batchSize),
        priority: messages[index]?.priority,
        tags: messages[index]?.tags,
      },
      created_at: new Date().toISOString(),
    }));

    // Batch insert email logs
    if (emailLogs.length > 0) {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert(emailLogs);

      if (logError) {
      }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'completed',
        sent_count: result.totalSent,
        failed_count: result.totalFailed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    // Return results with campaign ID
    return NextResponse.json({
      ...result,
      campaignId,
      metadata: {
        totalMessages: messages.length,
        batchSize,
        batches: Math.ceil(messages.length / batchSize),
        rateLimits: {
          hourlyUsed: (recentEmailCount || 0) + result.totalSent,
          hourlyLimit,
          dailyUsed: (dailyEmailCount || 0) + result.totalSent,
          dailyLimit,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check bulk email campaign status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');

    if (!campaignId) {
      // Return recent campaigns
      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return NextResponse.json({ campaigns });
    }

    // Get specific campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (campaignError) {
      if (campaignError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 },
        );
      }
      throw campaignError;
    }

    // Get campaign email logs
    const { data: emailLogs } = await supabase
      .from('email_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: true });

    // Get campaign analytics
    const { data: events } = await supabase
      .from('email_events')
      .select('*')
      .in('message_id', emailLogs?.map((log) => log.message_id) || [])
      .eq('clinic_id', profile.clinic_id);

    return NextResponse.json({
      campaign,
      emailLogs: emailLogs || [],
      events: events || [],
      analytics: {
        sent: emailLogs?.filter((log) => log.status === 'sent').length || 0,
        failed: emailLogs?.filter((log) => log.status === 'failed').length || 0,
        delivered:
          events?.filter((event) => event.event === 'delivered').length || 0,
        opened: events?.filter((event) => event.event === 'opened').length || 0,
        clicked:
          events?.filter((event) => event.event === 'clicked').length || 0,
        bounced:
          events?.filter((event) => event.event === 'bounced').length || 0,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
