// Brazilian currency formatter
export const formatBRL = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const parseBRL = (value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
};