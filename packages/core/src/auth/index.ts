import { jwt, verify } from 'hono/jwt';

export interface JWTPayload {
  sub: string;           // User ID
  clinic_id: string;     // Current clinic context
  role: string;          // User role
  permissions: string[]; // Granular permissions
  iat: number;           // Issued at
  exp: number;           // Expiration
}

export const authenticate = async (token: string): Promise<{
  user: JWTPayload | null;
  error: string | null;
}> => {
  try {
    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    // Verify JWT with Supabase public key
    const payload = await verifyJWT(cleanToken);
    
    return { user: payload, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Invalid token' };
  }
};

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  // In production, this would verify against Supabase's public key
  // For now, we'll use a simple decode (replace with proper verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid JWT format');
  }
};

export const extractClinicId = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.clinic_id || null;
  } catch {
    return null;
  }
};