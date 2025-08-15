import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get clinic_id from user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 400 });
    }

    // Get service types for this clinic
    const { data: serviceTypes, error } = await supabase
      .from('service_types')
      .select(
        `
        id,
        name,
        description,
        duration_minutes,
        price,
        is_active
      `
      )
      .eq('clinic_id', profile.clinic_id)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(serviceTypes);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
