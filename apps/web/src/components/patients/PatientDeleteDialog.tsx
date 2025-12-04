/**
 * Patient Delete Dialog Component
 * Confirmation dialog for patient deletion with LGPD compliance info
 * Explains the anonymization process
 */

import { useDeletePatient } from '@/hooks/usePatients';
import type { Database } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button
} from '@neonpro/ui';
import { AlertTriangle, Info, Loader2, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

type PatientRow = Database['public']['Tables']['patients']['Row'];

interface PatientDeleteDialogProps {
  patient: PatientRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDeleteDialog({ patient, open, onOpenChange }: PatientDeleteDialogProps) {
  const deletePatient = useDeletePatient();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deletePatient.mutateAsync(patient.id);
      onOpenChange(false);
      // Navigate back to patients list after successful deletion
      navigate({ to: '/patients' });
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-2xl'>
        <AlertDialogHeader>
          <div className='flex items-center gap-2 mb-2'>
            <div className='w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='w-5 h-5 text-destructive' />
            </div>
            <AlertDialogTitle className='text-xl'>Remover Paciente</AlertDialogTitle>
          </div>
          <AlertDialogDescription className='space-y-4 text-base'>
            <p>
              Você está prestes a remover o paciente{' '}
              <strong className='text-foreground'>{patient.full_name}</strong> do sistema.
            </p>

            <div className='bg-muted/50 border border-border rounded-lg p-4 space-y-3'>
              <div className='flex items-start gap-2'>
                <Shield className='w-5 h-5 text-primary mt-0.5' />
                <div className='space-y-1'>
                  <p className='font-medium text-foreground'>
                    Conformidade LGPD - Direito ao Apagamento
                  </p>
                  <p className='text-sm'>
                    Esta ação está em conformidade com o Art. 18, III da LGPD (Direito ao Apagamento).
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-start gap-2'>
                <Info className='w-5 h-5 text-info mt-0.5 flex-shrink-0' />
                <div className='space-y-2 text-sm'>
                  <p className='font-medium text-foreground'>O que acontecerá:</p>
                  <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                    <li>
                      <strong>Dados pessoais</strong> serão anonimizados (nome, CPF, RG, contatos, endereço)
                    </li>
                    <li>
                      <strong>Histórico médico</strong> será preservado por segurança e requisitos legais
                    </li>
                    <li>
                      <strong>Trilha de auditoria</strong> será mantida para conformidade (obrigatório por 7 anos)
                    </li>
                    <li>
                      <strong>Consentimentos LGPD</strong> serão revogados
                    </li>
                    <li>
                      O paciente será marcado como <Badge variant='secondary'>Inativo</Badge>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='bg-warning/10 border border-warning/30 rounded-lg p-4'>
              <div className='flex items-start gap-2'>
                <AlertTriangle className='w-5 h-5 text-warning mt-0.5 flex-shrink-0' />
                <div className='space-y-1'>
                  <p className='font-medium text-warning'>Ação Irreversível</p>
                  <p className='text-sm text-muted-foreground'>
                    Os dados pessoais não poderão ser recuperados após a anonimização.
                    Apenas o histórico médico e a trilha de auditoria serão mantidos.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className='gap-2'>
          <AlertDialogCancel asChild>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={deletePatient.isPending}
            >
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deletePatient.isPending}
            >
              {deletePatient.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Confirmar Remoção
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
