import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = 'BRL',
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}
