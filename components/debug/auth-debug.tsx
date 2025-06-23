"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function AuthDebug() {
  const { user, session, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkAuthState = async () => {
    try {
      // Check localStorage
      const localStorageKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('supabase')) {
          localStorageKeys.push({
            key,
            value: localStorage.getItem(key)?.substring(0, 100) + '...'
          });
        }
      }

      // Check environment variables (client-side)
      const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      };

      // Check current URL and params
      const urlInfo = {
        origin: window.location.origin,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      };

      setDebugInfo({
        localStorage: localStorageKeys,
        environment: envVars,
        url: urlInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({ error: error.message });
    }
  };

  const clearAuthData = () => {
    // Clear all Supabase-related localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('supabase')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload page
    window.location.reload();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Auth Debug Panel
          <Badge variant={loading ? "secondary" : user ? "default" : "destructive"}>
            {loading ? "Loading" : user ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auth State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">User State</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Session State</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(session ? {
                access_token: session.access_token ? 'Present' : 'Missing',
                refresh_token: session.refresh_token ? 'Present' : 'Missing',
                expires_at: session.expires_at,
                user_id: session.user?.id
              } : null, null, 2)}
            </pre>
          </div>
        </div>

        {/* Debug Actions */}
        <div className="flex gap-2">
          <Button onClick={checkAuthState} variant="outline" size="sm">
            Check Auth State
          </Button>
          <Button onClick={clearAuthData} variant="destructive" size="sm">
            Clear Auth Data
          </Button>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div>
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => window.location.href = '/login'} 
              variant="outline" 
              size="sm"
            >
              Go to Login
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="outline" 
              size="sm"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth/callback'} 
              variant="outline" 
              size="sm"
            >
              Test Callback
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
