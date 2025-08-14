import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// GET /api/dashboard/evaluations - Get evaluation analytics for professionals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to determine access level
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, clinic_id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const period = searchParams.get('period') || '30days';
    const professionalId = searchParams.get('professional_id');
    
    // Date range calculation
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build base query with clinic filter
    let baseQuery = supabase
      .from('patient_evaluations')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .gte('created_at', startDate.toISOString());

    // Filter by professional if specified (and user has permission)
    if (professionalId) {
      // Check if user can access this professional's data
      if (profile.role === 'PROFESSIONAL') {
        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (!professional || professional.id !== professionalId) {
          return NextResponse.json(
            { error: 'Access denied to this professional data' },
            { status: 403 }
          );
        }
      }
      
      baseQuery = baseQuery.eq('professional_id', professionalId);
    } else if (profile.role === 'PROFESSIONAL') {
      // For professionals, only show their own evaluations
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      if (professional) {
        baseQuery = baseQuery.eq('professional_id', professional.id);
      }
    }

    // Get evaluation overview
    const { data: allEvaluations } = await baseQuery;
    
    const completedEvaluations = allEvaluations?.filter(e => e.status === 'completed') || [];
    const pendingEvaluations = allEvaluations?.filter(e => e.status === 'pending') || [];
    const expiredEvaluations = allEvaluations?.filter(e => e.status === 'expired') || [];

    // Calculate overall metrics
    const totalEvaluations = completedEvaluations.length;
    const averageRating = totalEvaluations > 0 
      ? Number((completedEvaluations.reduce((sum, e) => sum + (e.overall_rating || 0), 0) / totalEvaluations).toFixed(2))
      : 0;
    
    const responseRate = allEvaluations && allEvaluations.length > 0
      ? Number((completedEvaluations.length / allEvaluations.length * 100).toFixed(1))
      : 0;

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    completedEvaluations.forEach(e => {
      if (e.overall_rating >= 1 && e.overall_rating <= 5) {
        ratingDistribution[e.overall_rating as keyof typeof ratingDistribution]++;
      }
    });

    // NPS calculation (4-5 stars = promoters, 1-2 stars = detractors)
    const promoters = ratingDistribution[4] + ratingDistribution[5];
    const detractors = ratingDistribution[1] + ratingDistribution[2];
    const npsScore = totalEvaluations > 0 
      ? Number(((promoters - detractors) / totalEvaluations * 100).toFixed(1))
      : 0;

    // Daily trend data
    const dailyTrends: { [key: string]: { completed: number; ratings: number[] } } = {};
    completedEvaluations.forEach(evaluation => {
      const date = new Date(evaluation.completed_at).toISOString().split('T')[0];
      if (!dailyTrends[date]) {
        dailyTrends[date] = { completed: 0, ratings: [] };
      }
      dailyTrends[date].completed++;
      if (evaluation.overall_rating) {
        dailyTrends[date].ratings.push(evaluation.overall_rating);
      }
    });

    const trendData = Object.entries(dailyTrends)
      .map(([date, data]) => ({
        date,
        evaluationsCompleted: data.completed,
        averageRating: data.ratings.length > 0 
          ? Number((data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length).toFixed(2))
          : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get professional performance (if clinic admin/manager)
    let professionalPerformance: any[] = [];
    if (profile.role === 'CLINIC_ADMIN' || profile.role === 'CLINIC_MANAGER') {
      const { data: professionalStats } = await supabase
        .from('patient_evaluations')
        .select(`
          professional_id,
          overall_rating,
          status,
          professional:professionals(
            id,
            name,
            specialty,
            average_rating,
            total_evaluations
          )
        `)
        .eq('clinic_id', profile.clinic_id)
        .gte('created_at', startDate.toISOString());

      // Group by professional
      const professionalsMap: { [key: string]: any } = {};
      professionalStats?.forEach(evaluation => {
        const profId = evaluation.professional_id;
        if (!professionalsMap[profId]) {
          professionalsMap[profId] = {
            professional: evaluation.professional,
            completed: 0,
            pending: 0,
            expired: 0,
            ratings: [],
            totalSent: 0
          };
        }
        
        professionalsMap[profId].totalSent++;
        
        if (evaluation.status === 'completed' && evaluation.overall_rating) {
          professionalsMap[profId].completed++;
          professionalsMap[profId].ratings.push(evaluation.overall_rating);
        } else if (evaluation.status === 'pending') {
          professionalsMap[profId].pending++;
        } else if (evaluation.status === 'expired') {
          professionalsMap[profId].expired++;
        }
      });

      professionalPerformance = Object.values(professionalsMap).map((prof: any) => ({
        professional: prof.professional,
        evaluationsSent: prof.totalSent,
        evaluationsCompleted: prof.completed,
        responseRate: prof.totalSent > 0 ? Number((prof.completed / prof.totalSent * 100).toFixed(1)) : 0,
        averageRating: prof.ratings.length > 0 
          ? Number((prof.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / prof.ratings.length).toFixed(2))
          : 0,
        pending: prof.pending,
        expired: prof.expired
      }));
    }

    // Get recent feedback with text
    const { data: recentFeedback } = await supabase
      .from('patient_evaluations')
      .select(`
        id,
        overall_rating,
        feedback_text,
        completed_at,
        patient:patient_profiles(
          first_name,
          last_name
        ),
        professional:professionals(
          name,
          specialty
        ),
        treatment:treatments(
          name,
          procedure_name
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .eq('status', 'completed')
      .not('feedback_text', 'is', null)
      .gte('created_at', startDate.toISOString())
      .order('completed_at', { ascending: false })
      .limit(10);

    // Get pending evaluations requiring attention
    const { data: pendingEvaluationsData } = await supabase
      .from('patient_evaluations')
      .select(`
        id,
        expires_at,
        sent_at,
        patient:patient_profiles(
          first_name,
          last_name,
          email,
          phone
        ),
        professional:professionals(
          name,
          specialty
        ),
        treatment:treatments(
          name,
          procedure_name
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })
      .limit(20);

    return NextResponse.json({
      summary: {
        totalEvaluations,
        averageRating,
        responseRate,
        npsScore,
        pendingCount: pendingEvaluations.length,
        expiredCount: expiredEvaluations.length
      },
      ratingDistribution,
      trendData,
      professionalPerformance,
      recentFeedback: recentFeedback || [],
      pendingEvaluations: pendingEvaluationsData || [],
      period,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching evaluation analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation analytics' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/evaluations - Send evaluation request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, clinic_id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const {
      patient_id,
      professional_id,
      treatment_id,
      template_id,
      expires_in_days = 7
    } = body;

    // Validate required fields
    if (!patient_id || !professional_id) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_id, professional_id' },
        { status: 400 }
      );
    }

    // Check if professional belongs to same clinic
    const { data: professional } = await supabase
      .from('professionals')
      .select('id, clinic_id')
      .eq('id', professional_id)
      .single();

    if (!professional || professional.clinic_id !== profile.clinic_id) {
      return NextResponse.json(
        { error: 'Professional not found or access denied' },
        { status: 403 }
      );
    }

    // Check if patient belongs to same clinic
    const { data: patient } = await supabase
      .from('patient_profiles')
      .select('id, clinic_id')
      .eq('id', patient_id)
      .single();

    if (!patient || patient.clinic_id !== profile.clinic_id) {
      return NextResponse.json(
        { error: 'Patient not found or access denied' },
        { status: 403 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Create evaluation
    const { data: evaluation, error: evalError } = await supabase
      .from('patient_evaluations')
      .insert({
        patient_id,
        professional_id,
        treatment_id,
        clinic_id: profile.clinic_id,
        template_id,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        sent_at: new Date().toISOString(),
        created_by: profile.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (evalError) {
      throw evalError;
    }

    // Create default questions if no template specified
    if (!template_id) {
      const defaultQuestions = [
        {
          evaluation_id: evaluation.id,
          question_text: 'Como você avalia o atendimento recebido?',
          question_type: 'rating',
          is_required: true,
          order_index: 1
        },
        {
          evaluation_id: evaluation.id,
          question_text: 'O profissional foi atencioso e esclareceu suas dúvidas?',
          question_type: 'rating',
          is_required: true,
          order_index: 2
        },
        {
          evaluation_id: evaluation.id,
          question_text: 'Você recomendaria nossos serviços?',
          question_type: 'boolean',
          is_required: true,
          order_index: 3
        },
        {
          evaluation_id: evaluation.id,
          question_text: 'Deixe seus comentários e sugestões:',
          question_type: 'text',
          is_required: false,
          order_index: 4
        }
      ];

      await supabase
        .from('patient_evaluation_questions')
        .insert(defaultQuestions);
    }

    return NextResponse.json({
      message: 'Evaluation request sent successfully',
      evaluation_id: evaluation.id,
      expires_at: evaluation.expires_at
    });

  } catch (error) {
    console.error('Error sending evaluation request:', error);
    return NextResponse.json(
      { error: 'Failed to send evaluation request' },
      { status: 500 }
    );
  }
}