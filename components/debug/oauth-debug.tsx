"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function OAuthDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Monitor auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event} - Session: ${session ? 'EXISTS' : 'NULL'}`);
      setSession(session);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      addLog(`Initial session check: ${session ? 'EXISTS' : 'NULL'}`);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testGoogleOAuth = async () => {
    addLog("=== Testing Google OAuth ===");
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        addLog(`OAuth URL Error: ${error.message}`);
      } else {
        addLog(`OAuth URL Generated: ${data.url ? 'SUCCESS' : 'FAILED'}`);
        if (data.url) {
          addLog(`URL: ${data.url}`);
        }
      }
    } catch (err: any) {
      addLog(`OAuth Test Error: ${err.message}`);
    }
  };

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    addLog(`Session Check - Session: ${session ? 'EXISTS' : 'NULL'}, Error: ${error ? error.message : 'NONE'}`);
    if (session) {
      addLog(`User: ${session.user.email}`);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50"
      >
        OAuth Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col">
      <div className="bg-gray-100 px-4 py-2 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">OAuth Debug Console</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="text-sm">
            <strong>Session Status:</strong> {session ? '✅ Active' : '❌ None'}
          </div>
          {session && (
            <div className="text-xs text-gray-600">
              User: {session.user.email}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={testGoogleOAuth}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Test OAuth
          </button>
          <button
            onClick={checkSession}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Check Session
          </button>
          <button
            onClick={clearLogs}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 font-mono">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
