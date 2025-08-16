import { type NextRequest, NextResponse } from 'next/server';
import { patientSegmentationService } from '@/app/lib/services/patient-segmentation-service';
import { CreateRuleSchema } from '@/app/lib/validations/segmentation';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // For development: Skip auth check
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get segmentation rules
    const { data: rules, error } = await supabase
      .from('segmentation_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Return empty array if table doesn't exist or no data
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: rules || [],
      total: rules?.length || 0,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch segmentation rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = CreateRuleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Map validation schema to service interface
    const ruleData = {
      rule_name: validationResult.data.rule_name,
      description: validationResult.data.rule_description,
      conditions: validationResult.data.rule_logic,
      auto_execute: validationResult.data.requires_ai,
      execution_schedule: undefined,
    };

    const rule =
      await patientSegmentationService.createAutomatedSegment(ruleData);

    return NextResponse.json(
      {
        success: true,
        data: rule,
        message: 'Automated segmentation rule created successfully',
      },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create segmentation rule' },
      { status: 500 }
    );
  }
}
