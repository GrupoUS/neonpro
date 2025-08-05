// Brazilian date formatting placeholder
export const formatBrazilianDate = (date: Date): string => date.toLocaleDateString('pt-BR');
export const parseBrazilianDate = (dateStr: string): Date => new Date(dateStr);