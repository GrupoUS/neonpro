import { type NextRequest, NextResponse } from 'next/server';
import { MarketingROIService } from '@/app/lib/services/marketing-roi-service';
import type {
  MarketingInsightCategory,
  MarketingInsightsRequest,
  MarketingInsightsResponse,
  MarketingInsightType,
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
    const insightType = searchParams.get('type') as MarketingInsightType;
    const category = searchParams.get('category') as MarketingInsightCategory;
    const campaignIds = searchParams
      .get('campaignIds')
      ?.split(',')
      .filter(Boolean);
    const treatmentIds = searchParams
      .get('treatmentIds')
      ?.split(',')
      .filter(Boolean);
    const timeframe = searchParams.get('timeframe') || '30d';

    const requestData: MarketingInsightsRequest = {
      type: insightType,
      category,
      campaignIds,
      treatmentIds,
      timeframe,
      includeRecommendations:
        searchParams.get('includeRecommendations') === 'true',
      includeMetrics: searchParams.get('includeMetrics') === 'true',
    };

    const insights =
      await marketingROIService.generateMarketingInsights(requestData);

    const response: MarketingInsightsResponse = {
      insights,
      metadata: {
        insightType,
        category,
        timeframe,
        generatedAt: new Date().toISOString(),
        totalInsights: insights.length,
        confidenceScore:
          insights.reduce((sum, i) => sum + (i.confidence || 0), 0) /
          insights.length,
      },
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate marketing insights' },
      { status: 500 }
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

    const requestData: MarketingInsightsRequest = await request.json();

    // Validate request data
    if (!requestData.timeframe) {
      return NextResponse.json(
        { error: 'Timeframe is required for detailed insights generation' },
        { status: 400 }
      );
    }

    const insights =
      await marketingROIService.generateMarketingInsights(requestData);

    // Generate deep analytics for POST requests
    const analytics = await marketingROIService.generateDeepAnalytics({
      insights,
      includeCorrelations: true,
      includeTrends: true,
      includeAnomalies: true,
      includeSegmentation: true,
    });

    // Generate actionable recommendations
    const recommendations =
      await marketingROIService.generateActionableRecommendations({
        insights,
        analytics,
        priority: 'high',
      });

    const response: MarketingInsightsResponse = {
      insights,
      analytics,
      recommendations,
      metadata: {
        insightType: requestData.type,
        category: requestData.category,
        timeframe: requestData.timeframe,
        generatedAt: new Date().toISOString(),
        totalInsights: insights.length,
        confidenceScore:
          insights.reduce((sum, i) => sum + (i.confidence || 0), 0) /
          insights.length,
        analyticsDepth: 'comprehensive',
        recommendationsCount: recommendations?.length || 0,
      },
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate comprehensive marketing insights' },
      { status: 500 }
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

    const { insightId, feedback, rating, implemented } = await request.json();

    if (!insightId) {
      return NextResponse.json(
        { error: 'Insight ID is required' },
        { status: 400 }
      );
    }

    // Update insight feedback and tracking
    const updatedInsight = await marketingROIService.updateInsightFeedback(
      insightId,
      {
        feedback,
        rating,
        implemented,
        updatedAt: new Date().toISOString(),
      }
    );

    // Learn from feedback to improve future insights
    const learningResult = await marketingROIService.improveInsightAccuracy(
      insightId,
      { feedback, rating, implemented }
    );

    return NextResponse.json({
      success: true,
      updatedInsight,
      learningResult,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update marketing insight' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const insightId = searchParams.get('insightId');

    if (!insightId) {
      return NextResponse.json(
        { error: 'Insight ID is required' },
        { status: 400 }
      );
    }

    const result = await marketingROIService.deleteInsight(insightId);

    return NextResponse.json({
      success: true,
      deletedInsightId: insightId,
      result,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete marketing insight' },
      { status: 500 }
    );
  }
}
