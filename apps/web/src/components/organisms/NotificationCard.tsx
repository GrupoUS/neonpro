import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@neonpro/ui';
import { SharedAnimatedList, type SharedAnimatedListItem } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@tanstack/react-router';

export type NormalizedNotification = Required<Pick<SharedAnimatedListItem, 'id' | 'title' | 'message' | 'type' | 'link'>> & {
  createdAt: string;
  read: boolean;
};

function formatCurrencyBRL(value: number) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
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

export default function NotificationCard({ title = 'Notificações', pollIntervalMs = 30000, maxItems = 8 }: NotificationCardProps) {
  const navigate = useNavigate();
  const [readIds, setReadIds] = React.useState<Set<string>>(() => getReadStore());

  const { data, isLoading, error, refetch, isFetching } = useQuery({
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

      const appt: NormalizedNotification[] = (apptRes.data ?? []).map((a: any) => ({
        id: `appointment:${a.id}`,
        title: a.status === 'cancelled' ? 'Consulta cancelada' : 'Consulta agendada',
        message: a.start_time
          ? new Date(a.start_time).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
          : 'Consulta atualizada',
        type: 'appointment',
        link: '/appointments',
        createdAt: a.created_at ?? new Date().toISOString(),
        read: nowRead.has(`appointment:${a.id}`),
      }));

      const patients: NormalizedNotification[] = (patientRes.data ?? []).map((p: any) => ({
        id: `patient:${p.id}`,
        title: 'Novo paciente cadastrado',
        message: p.full_name ?? 'Paciente',
        type: 'patient',
        link: `/patients/${p.id}`,
        createdAt: p.created_at ?? new Date().toISOString(),
        read: nowRead.has(`patient:${p.id}`),
      }));

      const fins: NormalizedNotification[] = (finRes.data ?? []).map((f: any) => ({
        id: `finance:${f.id}`,
        title: f.transaction_type === 'income' ? 'Pagamento recebido' : 'Movimentação financeira',
        message: f.amount != null ? formatCurrencyBRL(Number(f.amount)) : 'Transação',
        type: 'finance',
        link: '/financial',
        createdAt: f.created_at ?? new Date().toISOString(),
        read: nowRead.has(`finance:${f.id}`),
      }));

      return [...appt, ...patients, ...fins]
        .filter(n => !!n.createdAt)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, maxItems);
    },
    refetchInterval: pollIntervalMs === false ? false : pollIntervalMs,
  });

  const items = (data ?? []) as readonly NormalizedNotification[];

  const onClickItem = (n: NormalizedNotification) => {
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

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">{title}</CardTitle>
          <CardDescription>Clientes, agendamentos e financeiro</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isFetching ? 'secondary' : 'outline'} className="text-xs">
            {isFetching ? 'Atualizando…' : 'Atualizado'}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => refetch()} aria-label="Atualizar notificações">
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SharedAnimatedList
          items={items}
          loading={isLoading}
          error={(error as any)?.message ?? null}
          ariaLabel="Lista de notificações"
          renderItem={(n) => (
            <button
              type="button"
              onClick={() => onClickItem(n as NormalizedNotification)}
              className={`w-full text-left ${ (n as NormalizedNotification).read ? 'opacity-60' : '' }`}
              aria-label={(n as NormalizedNotification).title}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{(n as NormalizedNotification).title}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{(n as NormalizedNotification).type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {(n as NormalizedNotification).message}
                  </div>
                </div>
                <time className="text-[11px] text-muted-foreground shrink-0" dateTime={new Date((n as NormalizedNotification).createdAt).toISOString()}>
                  {new Date((n as NormalizedNotification).createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
            </button>
          )}
        />
      </CardContent>
    </Card>
  );
}
