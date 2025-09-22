import { supabase } from '@/integrations/supabase/client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neonpro/ui';
import { type SharedAnimatedListItem } from '@neonpro/ui';
import { ExpandableCard } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

export type NormalizedNotification =
  & Required<
    Pick<SharedAnimatedListItem, 'id' | 'title' | 'message' | 'type' | 'link'>
  >
  & {
    createdAt: string;
    read: boolean;
  };

import { formatBRL } from '@neonpro/utils';
function formatCurrencyBRL(value: number) {
  return formatBRL(value);
}

function getReadStore() {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = localStorage.getItem('notifications:read');
    const parsed: string[] = raw ? JSON.parse(raw) : [];
    return new Set<string>(parsed);
  } catch {
    return new Set<string>();
  }
}

function setReadStore(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('notifications:read', JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

export interface NotificationCardProps {
  title?: string;
  pollIntervalMs?: number | false; // false disables polling
  maxItems?: number;
}

export default function NotificationCard({
  title = 'Notificações',
  pollIntervalMs = 30000,
  maxItems = 8,
}: NotificationCardProps) {
  const navigate = useNavigate();
  const [readIds, setReadIds] = React.useState<.*>(() => => getReadStore());

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboardNotifications'],
    queryFn: async (): Promise<NormalizedNotification[]> => {
      // Aggregate from existing tables: appointments, patients, financial_transactions
      const [apptRes, patientRes, finRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, created_at, start_time, status')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('patients')
          .select('id, created_at, full_name')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('financial_transactions')
          .select('id, created_at, amount, transaction_type')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (apptRes.error) throw apptRes.error;
      if (patientRes.error) throw patientRes.error;
      if (finRes.error) throw finRes.error;

      const nowRead = getReadStore();

      const appt: NormalizedNotification[] = (apptRes.data ?? []).map(
        (a: any) => ({
          id: `appointment:${a.id}`,
          title: a.status === 'cancelled'
            ? 'Consulta cancelada'
            : 'Consulta agendada',
          message: a.start_time
            ? new Date(a.start_time).toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            })
            : 'Consulta atualizada',
          type: 'appointment',
          link: '/appointments',
          createdAt: a.created_at ?? new Date().toISOString(),
          read: nowRead.has(`appointment:${a.id}`),
        }),
      );

      const patients: NormalizedNotification[] = (patientRes.data ?? []).map(
        (p: any) => ({
          id: `patient:${p.id}`,
          title: 'Novo paciente cadastrado',
          message: p.full_name ?? 'Paciente',
          type: 'patient',
          link: `/patients/${p.id}`,
          createdAt: p.created_at ?? new Date().toISOString(),
          read: nowRead.has(`patient:${p.id}`),
        }),
      );

      const fins: NormalizedNotification[] = (finRes.data ?? []).map(
        (f: any) => ({
          id: `finance:${f.id}`,
          title: f.transaction_type === 'income'
            ? 'Pagamento recebido'
            : 'Movimentação financeira',
          message: f.amount != null
            ? formatCurrencyBRL(Number(f.amount))
            : 'Transação',
          type: 'finance',
          link: '/financial',
          createdAt: f.created_at ?? new Date().toISOString(),
          read: nowRead.has(`finance:${f.id}`),
        }),
      );

      return [...appt, ...patients, ...fins]
        .filter(n => !!n.createdAt)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, maxItems);
    },
    refetchInterval: pollIntervalMs === false ? false : pollIntervalMs,
  });

  const items = (data ?? []) as readonly NormalizedNotification[];

  const onClickItem = (_n: any) => {
    const id = String(n.id);
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    setReadStore(updated);
    // Navigate to resource
    try {
      navigate({ to: n.link as any });
    } catch {
      // ignore if router not available in test
    }
  };

  return (<ExpandableCardProvider className='grid-cols-1'>
      <ExpandableCard
        id='notifications-main'
        className='w-full h-full'
        expandedContent={
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Todas as Notificações</h3>
            <div className='max-h-96 overflow-y-auto space-y-3'>
              {items.map((n, idx) => (
                <div
                  key={`${n.id}-${idx}`}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    n.read
                      ? 'bg-gray-50 dark:bg-gray-800 opacity-75'
                      : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-sm font-medium'>{n.title}</span>
                        <Badge
                          variant='outline'
                          className='text-[10px] capitalize'
                        >
                          {n.type}
                        </Badge>
                      </div>
                      <div className='text-sm text-muted-foreground mb-2'>
                        {n.message}
                      </div>
                      <div className='flex justify-between items-center'>
                        <time className='text-xs text-muted-foreground'>
                          {new Date(n.createdAt).toLocaleString('pt-BR')}
                        </time>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => onClickItem(n)}
                          className='ml-2'
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <Card>
          <CardHeader className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>{title}</CardTitle>
              <CardDescription>
                Clientes, agendamentos e financeiro
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                variant={isFetching ? 'secondary' : 'outline'}
                className='text-xs'
              >
                {isFetching ? 'Atualizando…' : 'Atualizado'}
              </Badge>
              <Button
                size='sm'
                variant='outline'
                onClick={() => refetch()}
                aria-label='Atualizar notificações'
              >
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {items.slice(0, 3).map((n, idx) => (
                <div
                  key={`${n.id}-preview-${idx}`}
                  className={`p-2 rounded transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                    n.read ? 'opacity-60' : ''
                  }`}
                  onClick={() => onClickItem(n)}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium truncate'>
                          {n.title}
                        </span>
                        <Badge
                          variant='outline'
                          className='text-[10px] capitalize'
                        >
                          {n.type}
                        </Badge>
                      </div>
                      <div className='text-xs text-muted-foreground truncate'>
                        {n.message}
                      </div>
                    </div>
                    <time className='text-[11px] text-muted-foreground shrink-0'>
                      {new Date(n.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
              ))}
              {items.length > 3 && (
                <div className='text-center pt-2 border-t'>
                  <span className='text-xs text-muted-foreground'>
                    Clique no card para ver todas as {items.length} notificações
                  </span>
                </div>
              )}
              {items.length === 0 && !isLoading && (
                <p className='text-xs text-muted-foreground text-center py-4'>
                  Sem notificações recentes.
                </p>
              )}
              {isLoading && (
                <p className='text-xs text-muted-foreground text-center py-4'>
                  Carregando notificações...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </ExpandableCard>
    </ExpandableCardProvider>
  );
}
