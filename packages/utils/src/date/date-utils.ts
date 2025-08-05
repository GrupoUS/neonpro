// Date utilities placeholder
export const formatDate = (date: Date): string => date.toISOString();
export const parseBrazilianDate = (date: string): Date => new Date(date);
export const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());
