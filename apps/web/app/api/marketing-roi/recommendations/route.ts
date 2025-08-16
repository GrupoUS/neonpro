import { type NextRequest, NextResponse } from 'next/server';
import { MarketingROIService } from '@/app/lib/services/marketing-roi-service';
import type {
  MarketingOptimizationPriority,
  MarketingOptimizationStrategy,
  OptimizationRecommendationsRequest,
  OptimizationRecommendationsResponse,
} from '@/app/types/marketing-roi';
import { createClient } from '@/app/utils/supabase/server';

const marketingROIService = new MarketingROIService();

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const campaignIds = searchParams
      .get('campaignIds')
      ?.split(',')
      .filter(Boolean);
    const treatmentIds = searchParams
      .get('treatmentIds')
      ?.split(',')
      .filter(Boolean);
    const priority = searchParams.get(
      'priority',
    ) as MarketingOptimizationPriority | null;
    const strategy = searchParams.get(
      'strategy',
    ) as MarketingOptimizationStrategy | null;

    const requestData: OptimizationRecommendationsRequest = {
      campaignIds,
      treatmentIds,
      filters: {
        priority: priority || undefined,
        strategy: strategy || undefined,
        minImpact: searchParams.get('minImpact')
          ? Number.parseFloat(searchParams.get('minImpact')!)
          : undefined,
        maxImplementationCost: searchParams.get('maxImplementationCost')
          ? Number.parseFloat(searchParams.get('maxImplementationCost')!)
          : undefined,
      },
    };

    const recommendations =
      await marketingROIService.getOptimizationRecommendations(requestData);

    const response: OptimizationRecommendationsResponse = {
      recommendations,
      metadata: {
        totalRecommendations: recommendations.length,
        highPriorityCount: recommendations.filter((r) => r.priority === 'high')
          .length,
        averageImpact:
          recommendations.reduce((sum, r) => sum + r.expectedImpact, 0) /
          recommendations.length,
        totalImplementationCost: recommendations.reduce(
          (sum, r) => sum + (r.implementationCost || 0),
          0,
        ),
      },
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch marketing ROI recommendations' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData: OptimizationRecommendationsRequest =
      await request.json();

    // Validate request data
    if (!(requestData.campaignIds || requestData.treatmentIds)) {
      return NextResponse.json(
        { error: 'Either campaignIds or treatmentIds must be provided' },
        { status: 400 },
      );
    }

    const recommendations =
      await marketingROIService.getOptimizationRecommendations(requestData);

    // Generate comprehensive analysis
    const analysis = await marketingROIService.generateOptimizationInsights({
      recommendations,
      timeframe: '90d',
      includeMarketComparison: true,
    });

    const response: OptimizationRecommendationsResponse = {
      recommendations,
      analysis,
      metadata: {
        totalRecommendations: recommendations.length,
        highPriorityCount: recommendations.filter((r) => r.priority === 'high')
          .length,
        averageImpact:
          recommendations.reduce((sum, r) => sum + r.expectedImpact, 0) /
          recommendations.length,
        totalImplementationCost: recommendations.reduce(
          (sum, r) => sum + (r.implementationCost || 0),
          0,
        ),
        estimatedTimeframe: Math.max(
          ...recommendations.map((r) => r.timeframe || 30),
        ),
      },
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate marketing ROI recommendations' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, status, feedback } = await request.json();

    if (!(recommendationId && status)) {
      return NextResponse.json(
        { error: 'Recommendation ID and status are required' },
        { status: 400 },
      );
    }

    const updatedRecommendation =
      await marketingROIService.updateRecommendationStatus(
        recommendationId,
        status,
        feedback,
      );

    return NextResponse.json({
      success: true,
      recommendation: updatedRecommendation,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update marketing ROI recommendation' },
      { status: 500 },
    );
  }
}
