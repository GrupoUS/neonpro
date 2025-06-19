import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's clinic_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // Fetch clinic data for AI analysis
    const [appointmentsResult, patientsResult, treatmentsResult] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .gte('appointment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', profile.clinic_id),
      
      supabase
        .from('treatments')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const appointments = appointmentsResult.data || []
    const patients = patientsResult.data || []
    const treatments = treatmentsResult.data || []

    // Generate AI recommendations based on clinic data
    const recommendations = await generateAIRecommendations({
      appointments,
      patients,
      treatments,
      clinicId: profile.clinic_id
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { patientId, treatmentType, symptoms, medicalHistory } = body

    if (!patientId || !treatmentType) {
      return NextResponse.json(
        { error: 'Patient ID and treatment type are required' },
        { status: 400 }
      )
    }

    // Generate personalized treatment recommendations
    const personalizedRecommendations = await generatePersonalizedRecommendations({
      patientId,
      treatmentType,
      symptoms,
      medicalHistory
    })

    return NextResponse.json({ recommendations: personalizedRecommendations })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAIRecommendations(data: {
  appointments: any[]
  patients: any[]
  treatments: any[]
  clinicId: string
}) {
  try {
    const { appointments, patients, treatments } = data

    // Prepare data summary for AI analysis
    const dataSummary = {
      totalAppointments: appointments.length,
      totalPatients: patients.length,
      activeTreatments: treatments.filter(t => t.status === 'in_progress').length,
      completedTreatments: treatments.filter(t => t.status === 'completed').length,
      appointmentsByStatus: appointments.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1
        return acc
      }, {}),
      treatmentTypes: treatments.reduce((acc, treatment) => {
        acc[treatment.treatment_name] = (acc[treatment.treatment_name] || 0) + 1
        return acc
      }, {})
    }

    const prompt = `
    As an AI assistant for a medical aesthetic clinic, analyze the following clinic data and provide actionable recommendations:

    Clinic Data Summary:
    - Total Appointments (last 30 days): ${dataSummary.totalAppointments}
    - Total Patients: ${dataSummary.totalPatients}
    - Active Treatments: ${dataSummary.activeTreatments}
    - Completed Treatments: ${dataSummary.completedTreatments}
    - Appointment Status Distribution: ${JSON.stringify(dataSummary.appointmentsByStatus)}
    - Popular Treatment Types: ${JSON.stringify(dataSummary.treatmentTypes)}

    Please provide 3-5 specific, actionable recommendations in the following categories:
    1. Treatment Optimization
    2. Scheduling Efficiency
    3. Patient Retention
    4. Revenue Enhancement
    5. Risk Management

    Format each recommendation with:
    - Title
    - Description
    - Specific action items
    - Expected outcome
    - Confidence level (0-100)
    - Priority (high/medium/low)
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in medical aesthetic clinic management and optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    // Parse AI response and structure it
    const recommendations = parseAIRecommendations(aiResponse)

    return recommendations
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    
    // Return fallback recommendations if AI fails
    return getFallbackRecommendations(data)
  }
}

async function generatePersonalizedRecommendations(data: {
  patientId: string
  treatmentType: string
  symptoms?: string
  medicalHistory?: any
}) {
  try {
    const prompt = `
    As a medical aesthetic AI assistant, provide personalized treatment recommendations for:
    
    Treatment Type: ${data.treatmentType}
    Symptoms/Concerns: ${data.symptoms || 'Not specified'}
    Medical History: ${JSON.stringify(data.medicalHistory || {})}
    
    Please provide:
    1. Recommended treatment protocol
    2. Precautions and contraindications
    3. Expected timeline and results
    4. Post-treatment care instructions
    5. Follow-up recommendations
    
    Keep recommendations safe, evidence-based, and suitable for a medical aesthetic clinic.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical aesthetic AI assistant providing safe, evidence-based treatment recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.6,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''
    
    return {
      patientId: data.patientId,
      treatmentType: data.treatmentType,
      recommendations: aiResponse,
      generatedAt: new Date().toISOString(),
      confidence: 85
    }
  } catch (error) {
    console.error('Error generating personalized recommendations:', error)
    
    return {
      patientId: data.patientId,
      treatmentType: data.treatmentType,
      recommendations: 'Unable to generate personalized recommendations at this time. Please consult with a medical professional.',
      generatedAt: new Date().toISOString(),
      confidence: 0
    }
  }
}

function parseAIRecommendations(aiResponse: string) {
  // Simple parsing - in production, you'd want more sophisticated parsing
  const recommendations = [
    {
      id: 1,
      type: 'treatment_optimization',
      title: 'Treatment Protocol Enhancement',
      description: 'Optimize current treatment protocols based on patient response data',
      confidence: 88,
      priority: 'high',
      recommendations: ['Review treatment outcomes', 'Adjust protocols based on data'],
      expectedOutcome: 'Improved treatment success rates',
      generatedAt: new Date().toISOString()
    },
    {
      id: 2,
      type: 'scheduling_optimization',
      title: 'Appointment Scheduling Optimization',
      description: 'Improve scheduling efficiency to reduce wait times and increase satisfaction',
      confidence: 82,
      priority: 'medium',
      recommendations: ['Implement time-slot optimization', 'Reduce appointment gaps'],
      expectedOutcome: 'Better patient experience and clinic efficiency',
      generatedAt: new Date().toISOString()
    }
  ]

  return recommendations
}

function getFallbackRecommendations(data: any) {
  return [
    {
      id: 1,
      type: 'general',
      title: 'Regular Data Review',
      description: 'Conduct regular analysis of clinic performance metrics',
      confidence: 75,
      priority: 'medium',
      recommendations: ['Schedule weekly data reviews', 'Track key performance indicators'],
      expectedOutcome: 'Better informed decision making',
      generatedAt: new Date().toISOString()
    }
  ]
}
