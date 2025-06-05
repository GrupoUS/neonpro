
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseDebugger } from '@/utils/supabaseDebugger';

export const AuthDebugPanel: React.FC = () => {
  const { user, session, profile, isLoading } = useAuth();
  const { runHealthCheck } = useSupabaseDebugger();

  const handleHealthCheck = async () => {
    await runHealthCheck();
  };

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto z-50 bg-background/95 backdrop-blur-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Loading:</span>
          <Badge variant={isLoading ? "destructive" : "default"}>
            {isLoading ? "True" : "False"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Session:</span>
          <Badge variant={session ? "default" : "destructive"}>
            {session ? "Active" : "None"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>User:</span>
          <Badge variant={user ? "default" : "destructive"}>
            {user ? "Authenticated" : "None"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Profile:</span>
          <Badge variant={profile ? "default" : "secondary"}>
            {profile ? "Loaded" : "None"}
          </Badge>
        </div>
        
        {user && (
          <div className="pt-2 border-t space-y-1">
            <div className="text-xs text-muted-foreground">
              <strong>ID:</strong> {user.id.slice(0, 8)}...
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Email:</strong> {user.email}
            </div>
            {profile && (
              <div className="text-xs text-muted-foreground">
                <strong>Nome:</strong> {profile.name}
              </div>
            )}
          </div>
        )}
        
        <div className="pt-2 border-t">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleHealthCheck}
            className="w-full text-xs"
          >
            Run Health Check
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <strong>Current Path:</strong> {window.location.pathname}
        </div>
      </CardContent>
    </Card>
  );
};
