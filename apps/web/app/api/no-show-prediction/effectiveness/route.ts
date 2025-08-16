// Story 11.2: No-Show Prediction Effectiveness API
// Track and analyze prediction accuracy and intervention effectiveness

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

const EffectivenessQuerySchema = z.object({
  clinic_id: z.string().uuid().optional(),
  intervention_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  min_accuracy: z.coerce.number().min(0).max(1).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parsedQuery = EffectivenessQuerySchema.parse(queryParams);

    // Get prediction effectiveness metrics
    let effectivenessQuery = supabase
      .from('no_show_predictions')
      .select(
        `
        id,
        appointment_id,
        patient_id,
        risk_score,
        prediction_date,
        actual_outcome,
        confidence_score,
        model_version,
        appointments!inner(
          id,
          clinic_id,
          scheduled_at,
          status
        ),
        no_show_interventions(
          id,
          intervention_type,
          status,
          outcome,
          effectiveness_score
        )
      `,
      )
      .not('actual_outcome', 'is', null); // Only predictions with known outcomes

    // Apply filters
    if (parsedQuery.clinic_id) {
      effectivenessQuery = effectivenessQuery.eq(
        'appointments.clinic_id',
        parsedQuery.clinic_id,
      );
    }

    if (parsedQuery.date_from) {
      effectivenessQuery = effectivenessQuery.gte(
        'prediction_date',
        parsedQuery.date_from,
      );
    }

    if (parsedQuery.date_to) {
      effectivenessQuery = effectivenessQuery.lte(
        'prediction_date',
        parsedQuery.date_to,
      );
    }

    // Apply pagination
    const offset = (parsedQuery.page - 1) * parsedQuery.limit;
    effectivenessQuery = effectivenessQuery
      .order('prediction_date', { ascending: false })
      .range(offset, offset + parsedQuery.limit - 1);

    const { data: predictions, error: predictionsError } =
      await effectivenessQuery;

    if (predictionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch effectiveness data' },
        { status: 500 },
      );
    }

    // Calculate effectiveness metrics
    const totalPredictions = predictions?.length || 0;
    const correctPredictions =
      predictions?.filter(
        (p) =>
          (p.risk_score > 0.5 && p.actual_outcome === true) ||
          (p.risk_score <= 0.5 && p.actual_outcome === false),
      ).length || 0;

    const overallAccuracy =
      totalPredictions > 0 ? correctPredictions / totalPredictions : 0;

    // Intervention effectiveness by type
    const interventionEffectiveness =
      predictions?.reduce(
        (acc, prediction) => {
          prediction.no_show_interventions?.forEach((intervention) => {
            const type = intervention.intervention_type;
            if (!acc[type]) {
              acc[type] = {
                total: 0,
                successful: 0,
                effectiveness_rate: 0,
                average_score: 0,
                total_score: 0,
              };
            }
            acc[type].total += 1;
            if (intervention.outcome === 'successful') {
              acc[type].successful += 1;
            }
            acc[type].total_score += intervention.effectiveness_score || 0;
            acc[type].effectiveness_rate =
              acc[type].successful / acc[type].total;
            acc[type].average_score = acc[type].total_score / acc[type].total;
          });
          return acc;
        },
        {} as Record<string, any>,
      ) || {};

    // Model performance by version
    const modelPerformance =
      predictions?.reduce(
        (acc, prediction) => {
          const version = prediction.model_version;
          if (!acc[version]) {
            acc[version] = {
              total: 0,
              correct: 0,
              accuracy: 0,
              average_confidence: 0,
              total_confidence: 0,
            };
          }
          acc[version].total += 1;
          acc[version].total_confidence += prediction.confidence_score;

          if (
            (prediction.risk_score > 0.5 &&
              prediction.actual_outcome === true) ||
            (prediction.risk_score <= 0.5 &&
              prediction.actual_outcome === false)
          ) {
            acc[version].correct += 1;
          }

          acc[version].accuracy = acc[version].correct / acc[version].total;
          acc[version].average_confidence =
            acc[version].total_confidence / acc[version].total;
          return acc;
        },
        {} as Record<string, any>,
      ) || {};

    return NextResponse.json({
      predictions: predictions || [],
      effectiveness_metrics: {
        overall_accuracy: overallAccuracy,
        total_predictions: totalPredictions,
        correct_predictions: correctPredictions,
        intervention_effectiveness: interventionEffectiveness,
        model_performance: modelPerformance,
      },
      pagination: {
        page: parsedQuery.page,
        limit: parsedQuery.limit,
        total: totalPredictions,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
