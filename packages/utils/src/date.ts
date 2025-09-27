import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatAppointmentDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const formatPatientBirthDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};
