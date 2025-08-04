import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { validatePatientSession } from '@/lib/auth-advanced/patient-portal-validation';

// GET /api/patient-portal/evaluations/stats - Get patient evaluation statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Validate patient session
    const { session, patient } = await validatePatientSession(supabase);
    if (!session || !patient) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const period = searchParams.get('period') || '6months'; // 3months, 6months, 1year, all
    const professionalId = searchParams.get('professional_id');

    // Calculate date range
    let dateFilter = '';
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(2020, 0, 1); // All time
    }

    // Base query
    let baseQuery = supabase
      .from('patient_evaluations')
      .select('*')
      .eq('patient_id', patient.id)
      .gte('created_at', startDate.toISOString());

    if (professionalId) {
      baseQuery = baseQuery.eq('professional_id', professionalId);
    }

    // Get evaluation counts by status
    const { data: statusCounts } = await supabase
      .from('patient_evaluations')
      .select('status')
      .eq('patient_id', patient.id)
      .gte('created_at', startDate.toISOString());

    const statusStats = {
      pending: statusCounts?.filter(e => e.status === 'pending').length || 0,
      completed: statusCounts?.filter(e => e.status === 'completed').length || 0,
      expired: statusCounts?.filter(e => e.status === 'expired').length || 0
    };

    // Get completed evaluations for ratings analysis
    const { data: completedEvaluations } = await baseQuery
      .eq('status', 'completed')
      .not('overall_rating', 'is', null)
      .order('created_at', { ascending: false });

    // Calculate rating statistics
    let ratingStats = {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      trendData: [] as Array<{ date: string; rating: number; month: string }>
    };

    if (completedEvaluations && completedEvaluations.length > 0) {
      const ratings = completedEvaluations.map(e => e.overall_rating);
      ratingStats.averageRating = Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2));
      ratingStats.totalRatings = ratings.length;

      // Rating distribution
      ratings.forEach(rating => {
        ratingStats.ratingDistribution[rating as keyof typeof ratingStats.ratingDistribution]++;
      });

      // Trend data (monthly averages)
      const monthlyRatings: { [key: string]: number[] } = {};
      completedEvaluations.forEach(evaluation => {
        const date = new Date(evaluation.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
        
        if (!monthlyRatings[monthKey]) {
          monthlyRatings[monthKey] = [];
        }
        monthlyRatings[monthKey].push(evaluation.overall_rating);
      });

      ratingStats.trendData = Object.entries(monthlyRatings)
        .map(([monthKey, ratings]) => ({
          date: monthKey,
          rating: Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)),
          month: new Date(monthKey + '-01').toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-12); // Last 12 months
    }

    // Get evaluations by professional
    const { data: professionalStats } = await supabase
      .from('patient_evaluations')
      .select(`
        professional_id,
        overall_rating,
        professional:professionals(
          id,
          name,
          specialty
        )
      `)
      .eq('patient_id', patient.id)
      .eq('status', 'completed')
      .not('overall_rating', 'is', null)
      .gte('created_at', startDate.toISOString());

    // Group by professional
    const professionalRatings: { [key: string]: any } = {};
    professionalStats?.forEach(evaluation => {
      const profId = evaluation.professional_id;
      if (!professionalRatings[profId]) {
        professionalRatings[profId] = {
          professional: evaluation.professional,
          ratings: [],
          totalEvaluations: 0
        };
      }
      professionalRatings[profId].ratings.push(evaluation.overall_rating);
      professionalRatings[profId].totalEvaluations++;
    });

    const professionalSummary = Object.values(professionalRatings).map((prof: any) => ({
      professional: prof.professional,
      averageRating: Number((prof.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / prof.ratings.length).toFixed(2)),
      totalEvaluations: prof.totalEvaluations,
      lastEvaluation: completedEvaluations?.find(e => e.professional_id === prof.professional.id)?.created_at
    }));

    // Get recent feedback
    const { data: recentFeedback } = await supabase
      .from('patient_evaluations')
      .select(`
        id,
        overall_rating,
        feedback_text,
        completed_at,
        professional:professionals(
          name,
          specialty
        ),
        treatment:treatments(
          name,
          procedure_name
        )
      `)
      .eq('patient_id', patient.id)
      .eq('status', 'completed')
      .not('feedback_text', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5);

    // Calculate satisfaction score (percentage of 4-5 star ratings)
    const satisfactionScore = ratingStats.totalRatings > 0 
      ? Number(((ratingStats.ratingDistribution[4] + ratingStats.ratingDistribution[5]) / ratingStats.totalRatings * 100).toFixed(1))
      : 0;

    // Get upcoming evaluations
    const { data: upcomingEvaluations } = await supabase
      .from('patient_evaluations')
      .select(`
        id,
        expires_at,
        professional:professionals(
          name,
          specialty
        ),
        treatment:treatments(
          name,
          procedure_name
        )
      `)
      .eq('patient_id', patient.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })
      .limit(5);

    return NextResponse.json({
      summary: {
        totalEvaluations: statusStats.completed,
        pendingEvaluations: statusStats.pending,
        expiredEvaluations: statusStats.expired,
        averageRating: ratingStats.averageRating,
        satisfactionScore
      },
      ratingStats,
      professionalSummary,
      recentFeedback: recentFeedback || [],
      upcomingEvaluations: upcomingEvaluations || [],
      period,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation statistics' },
      { status: 500 }
    );
  }
}