// Chat Settings Service: server persistence via Supabase
// - default_chat_model stored on public.profiles
// - graceful fallback if column is missing

import { supabase } from '@/integrations/supabase/client';

export async function fetchDefaultChatModel(
  userId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('default_chat_model')
      .eq('id', userId)
      .single();

    if (error) {
      // Column may not exist yet; treat as null
      console.warn('[chat-settings] fetch default model error:', error.message);
      return null;
    }

    return (data as any)?.default_chat_model ?? null;
  } catch (error) {
    console.warn('[chat-settings] fetch default model failed:', error);
    return null;
  }
}

export async function updateDefaultChatModel(
  userId: string,
  model: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ default_chat_model: model } as any)
      .eq('id', userId);

    if (error) {
      console.warn(
        '[chat-settings] update default model error:',
        error.message,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[chat-settings] update default model failed:', error);
    return false;
  }
}

export type ProviderKey = 'openai' | 'anthropic' | 'google';
const HIDDEN_KEY = 'neonpro-hidden-providers';

export function getHiddenProviders(): ProviderKey[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as ProviderKey[];
    return [];
  } catch {
    return [];
  }
}

export function setHiddenProviders(hidden: ProviderKey[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
  } catch {
    // ignore
  }
}
