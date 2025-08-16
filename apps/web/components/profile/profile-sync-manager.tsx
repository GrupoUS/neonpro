'use client';

import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SyncStatus {
  service: string;
  status: 'synced' | 'pending' | 'error';
  lastSync: string;
}

export default function ProfileSyncManager() {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    { service: 'Google Calendar', status: 'synced', lastSync: '2 minutes ago' },
    { service: 'Microsoft Outlook', status: 'pending', lastSync: '1 hour ago' },
    { service: 'Apple iCloud', status: 'error', lastSync: '1 day ago' },
  ]);

  const handleSync = (service: string) => {
    setSyncStatuses((prev) =>
      prev.map((status) =>
        status.service === service
          ? { ...status, status: 'pending' as const }
          : status,
      ),
    );

    // Simulate sync process
    setTimeout(() => {
      setSyncStatuses((prev) =>
        prev.map((status) =>
          status.service === service
            ? { ...status, status: 'synced' as const, lastSync: 'Just now' }
            : status,
        ),
      );
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Profile Sync Manager
        </CardTitle>
        <CardDescription>
          Manage synchronization with external services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatuses.map((sync) => (
          <div
            key={sync.service}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(sync.status)}
              <div>
                <p className="font-medium">{sync.service}</p>
                <p className="text-sm text-muted-foreground">
                  Last sync: {sync.lastSync}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(sync.status) as any}>
                {sync.status}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSync(sync.service)}
                disabled={sync.status === 'pending'}
              >
                {sync.status === 'pending' ? 'Syncing...' : 'Sync'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
