import { type NextRequest, NextResponse } from 'next/server';
import EmailService from '@/app/lib/services/email-service';
import { createClient } from '@/app/utils/supabase/server';

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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const templateId = searchParams.get('templateId');
    const provider = searchParams.get('provider');

    const emailService = new EmailService(supabase, profile.clinic_id);
    const analytics = await emailService.getAnalytics({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      templateId: templateId || undefined,
      provider: provider || undefined,
    });

    return NextResponse.json(analytics);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
