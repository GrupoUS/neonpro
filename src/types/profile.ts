
import { Database } from '../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Interface baseada na estrutura real da tabela profiles
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateUserProfileData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  senha: string; // Para criar novo usuário
}

export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
}

export type { ProfileRow, ProfileInsert, ProfileUpdate };
