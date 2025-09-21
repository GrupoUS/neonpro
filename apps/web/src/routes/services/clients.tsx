import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

function ClientsPage() {
  const [search, setSearch] = useState('');

  const {
    data: clients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clients',_search],
    queryFn: async () => {
      let q = supabase
        .from('patients')
        .select(
          'id, full_name, email, phone_primary, last_visit_date, next_appointment_date, is_active',
        )
        .order('full_name', { ascending: true })
        .limit(100);
      if (search) {
        // simple ilike on name/email/phone
        const term = search.trim();
        if (term.length >= 2) {
          // remove caracteres que quebram a gramática do PostgREST (.or)
          const safe = term.replace(/[(),]/g, '').replace(/[%_]/g, '');
          const pattern = `%${safe}%`;
          q = q.or(
            `full_name.ilike.${pattern},email.ilike.${pattern},phone_primary.ilike.${pattern}`,
          );
        }
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(_() => clients ?? [], [clients]);

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Lista de clientes ativos e cadastro recente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <Input
              placeholder='Buscar por nome, email ou telefone'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {isLoading && <p className='text-sm text-muted-foreground'>Carregando...</p>}
          {error && <p className='text-sm text-red-500'>Erro ao carregar clientes.</p>}
          {!isLoading && rows.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              Nenhum cliente encontrado.
            </p>
          )}
          {!isLoading && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Última visita</TableHead>
                  <TableHead>Próximo tratamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className='font-medium'>{c.full_name}</TableCell>
                    <TableCell>{c.email ?? '—'}</TableCell>
                    <TableCell>{c.phone_primary ?? '—'}</TableCell>
                    <TableCell>
                      {c.last_visit_date
                        ? new Date(c.last_visit_date).toLocaleDateString(
                          'pt-BR',
                        )
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {c.next_appointment_date
                        ? new Date(c.next_appointment_date).toLocaleDateString(
                          'pt-BR',
                        )
                        : '—'}
                    </TableCell>
                    <TableCell>{c.is_active ? 'Ativo' : 'Inativo'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <div className='mt-4'>
        <Link
          to='/dashboard'
          className='text-sm text-muted-foreground hover:underline'
        >
          ← Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

export const _Route = createFileRoute('/services/clients')({
  component: ClientsPage,
});
