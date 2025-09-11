import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

function PatientsPage() {
  const [search, setSearch] = useState('');

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients', search],
    queryFn: async () => {
      let q = supabase
        .from('patients')
        .select('id, full_name, email, phone_primary, last_visit_date, next_appointment_date, is_active')
        .order('full_name', { ascending: true })
        .limit(100);
      if (search) {
        // simple ilike on name/email/phone
        q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone_primary.ilike.%${search}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(() => patients ?? [], [patients]);

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
          <CardDescription>Lista de pacientes ativos e cadastro recente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <Input placeholder='Buscar por nome, email ou telefone' value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isLoading && <p className='text-sm text-muted-foreground'>Carregando...</p>}
          {error && <p className='text-sm text-red-500'>Erro ao carregar pacientes.</p>}
          {!isLoading && rows.length === 0 && <p className='text-sm text-muted-foreground'>Nenhum paciente encontrado.</p>}
          {!isLoading && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Última visita</TableHead>
                  <TableHead>Próxima consulta</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='font-medium'>{p.full_name}</TableCell>
                    <TableCell>{p.email ?? '—'}</TableCell>
                    <TableCell>{p.phone_primary ?? '—'}</TableCell>
                    <TableCell>{p.last_visit_date ? new Date(p.last_visit_date).toLocaleDateString('pt-BR') : '—'}</TableCell>
                    <TableCell>{p.next_appointment_date ? new Date(p.next_appointment_date).toLocaleDateString('pt-BR') : '—'}</TableCell>
                    <TableCell>{p.is_active ? 'Ativo' : 'Inativo'}</TableCell>
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

export const Route = createFileRoute('/patients')({
  component: PatientsPage,
});
