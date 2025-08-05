import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar preferências do usuário
    const { data: preferences, error } = await supabase
      .from('assistant_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    // Se não existir, retornar preferências padrão
    if (!preferences) {
      const defaultPreferences = {
        language: 'pt-BR',
        personality: 'profissional e amigável',
        temperature: 0.7,
        max_tokens: 2000,
        preferred_model: 'gpt4',
        voice_enabled: false,
        notifications_enabled: true,
        context_memory: true,
        suggestions_enabled: true
      };

      return NextResponse.json({ preferences: defaultPreferences });
    }

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Preferences API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      language,
      personality,
      temperature,
      max_tokens,
      preferred_model,
      voice_enabled,
      notifications_enabled,
      context_memory,
      suggestions_enabled
    } = await request.json();

    // Validações
    if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
      return NextResponse.json({ error: "Temperature must be between 0 and 2" }, { status: 400 });
    }

    if (max_tokens !== undefined && (max_tokens < 1 || max_tokens > 4000)) {
      return NextResponse.json({ error: "Max tokens must be between 1 and 4000" }, { status: 400 });
    }

    if (preferred_model && !['gpt4', 'claude', 'gpt35'].includes(preferred_model)) {
      return NextResponse.json({ error: "Invalid preferred model" }, { status: 400 });
    }

    // Preparar dados para inserção/atualização
    const preferencesData = {
      user_id: user.id,
      ...(language !== undefined && { language }),
      ...(personality !== undefined && { personality }),
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens !== undefined && { max_tokens }),
      ...(preferred_model !== undefined && { preferred_model }),
      ...(voice_enabled !== undefined && { voice_enabled }),
      ...(notifications_enabled !== undefined && { notifications_enabled }),
      ...(context_memory !== undefined && { context_memory }),
      ...(suggestions_enabled !== undefined && { suggestions_enabled })
    };

    // Usar upsert para inserir ou atualizar
    const { data: preferences, error } = await supabase
      .from('assistant_preferences')
      .upsert(preferencesData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving preferences:', error);
      return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
    }

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Save Preferences API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
