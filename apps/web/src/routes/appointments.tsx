import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/molecules/table';
import { supabase } from '@/integrations/supabase/client';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

function AppointmentsPage() {
  // Mock data since appointments table doesn't exist yet in database schema
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      // Return mock data for now
      return [
        {
          id: '1',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          status: 'Agendado',
          patient_name: 'Paciente Exemplo'
        }
      ];
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
                    <TableCell>{a.patient_name}</TableCell>
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
