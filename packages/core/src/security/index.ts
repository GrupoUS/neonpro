// Security utilities
export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const hashPassword = async (password: string): Promise<string> => {
  // In production, use bcrypt or similar
  return btoa(password);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return btoa(password) === hash;
};