
import { ProfileRow } from '../types/profile';
import { UserProfile } from '../types/profile';

// Função para converter da estrutura do banco para a interface do componente
export const convertToUserProfile = (profile: ProfileRow): UserProfile => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  avatar_url: profile.avatar_url,
  role: profile.role,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
});
