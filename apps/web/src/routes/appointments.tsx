import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

function AppointmentsPage() {
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, status, patient_id, patients!inner(full_name)')
        .order('start_time', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>Próximas consultas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className='text-sm text-muted-foreground'>Carregando...</p>}
          {error && <p className='text-sm text-red-500'>Erro ao carregar agendamentos.</p>}
          {!isLoading && (appointments?.length ?? 0) === 0 && (
            <p className='text-sm text-muted-foreground'>Nenhum agendamento encontrado.</p>
          )}
          {!isLoading && (appointments?.length ?? 0) > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paciente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments!.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.start_time).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{new Date(a.end_time).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{a.status ?? '—'}</TableCell>
                    <TableCell>{(a as any).patients?.full_name ?? a.patient_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <div className='mt-4'>
        <Link to='/dashboard' className='text-sm text-muted-foreground hover:underline'>← Voltar ao Dashboard</Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
});
