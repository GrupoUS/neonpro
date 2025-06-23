"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { AuthProviderAlternative, useAuthAlternative } from "@/contexts/auth-context-alternative";
import { OAuthDebug } from "@/components/debug/oauth-debug";

function TestOriginal() {
  const { signInWithGoogle, user, session, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTest = async () => {
    setIsLoading(true);
    setResult("Testing original implementation...");
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult("✅ OAuth initiated successfully");
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Original Implementation</CardTitle>
        <CardDescription>Current popup-based OAuth implementation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div><strong>Loading:</strong> {loading ? "Yes" : "No"}</div>
          <div><strong>User:</strong> {user ? user.email : "None"}</div>
          <div><strong>Session:</strong> {session ? "Active" : "None"}</div>
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Original OAuth"}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TestAlternative() {
  const { signInWithGoogle, user, session, loading } = useAuthAlternative();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTest = async () => {
    setIsLoading(true);
    setResult("Testing alternative implementation...");
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult("✅ OAuth initiated successfully (redirect method)");
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alternative Implementation</CardTitle>
        <CardDescription>Simplified redirect-based OAuth implementation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div><strong>Loading:</strong> {loading ? "Yes" : "No"}</div>
          <div><strong>User:</strong> {user ? user.email : "None"}</div>
          <div><strong>Session:</strong> {session ? "Active" : "None"}</div>
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Alternative OAuth"}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TestContent() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">OAuth Implementation Testing</h1>
          <p className="text-muted-foreground">
            Compare different OAuth implementations to find the most reliable approach
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AuthProvider>
            <TestOriginal />
          </AuthProvider>
          
          <AuthProviderAlternative>
            <TestAlternative />
          </AuthProviderAlternative>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Original Implementation (Popup):</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Uses popup window for OAuth</li>
                <li>PostMessage communication between popup and parent</li>
                <li>More complex but better UX (no page redirect)</li>
                <li>Callback: <code>/auth/popup-callback</code></li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Alternative Implementation (Redirect):</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Uses direct page redirect for OAuth</li>
                <li>Simpler implementation, more reliable</li>
                <li>Page redirects during OAuth flow</li>
                <li>Callback: <code>/auth/callback-alternative</code></li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded">
              <h4 className="font-semibold text-yellow-800">Google OAuth Console Configuration:</h4>
              <div className="text-sm text-yellow-700 mt-2">
                <div><strong>Authorized redirect URIs:</strong></div>
                <div>• https://neonpro.vercel.app/auth/popup-callback</div>
                <div>• https://neonpro.vercel.app/auth/callback-alternative</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AuthProvider>
        <OAuthDebug />
      </AuthProvider>
    </div>
  );
}

export default function TestOAuthPage() {
  return <TestContent />;
}
