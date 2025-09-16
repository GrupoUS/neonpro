import { supabase } from '@/integrations/supabase/client';
import { Button } from '@neonpro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckCircle, Chrome, XCircle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/test-auth')({
  component: TestAuth,
});

function TestAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const testGoogleAuth = async () => {
    setIsLoading(true);
    setResult('');
    setStatus('idle');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/test-auth`,
        },
      });

      if (error) {
        setResult(`Error: ${error.message}`);
        setStatus('error');
      } else {
        setResult('Google authentication initiated successfully!');
        setStatus('success');
      }
    } catch (err) {
      setResult(`Unexpected error: ${err}`);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setResult('');
    setStatus('idle');

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setResult(`Session error: ${error.message}`);
        setStatus('error');
      } else {
        setResult(`Supabase connection successful! Session: ${data.session ? 'Active' : 'None'}`);
        setStatus('success');
      }
    } catch (err) {
      setResult(`Connection error: ${err}`);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-full h-full bg-gradient-to-br from-background via-background/95 to-accent/10 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button
            onClick={testSupabaseConnection}
            className='w-full'
            disabled={isLoading}
            variant='outline'
          >
            Test Supabase Connection
          </Button>

          <Button
            onClick={testGoogleAuth}
            className='w-full'
            disabled={isLoading}
          >
            <Chrome className='mr-2 h-4 w-4' />
            Test Google Authentication
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : status === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <div className='flex items-start gap-2'>
                {status === 'success' && <CheckCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />}
                {status === 'error' && <XCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />}
                <p className='text-sm font-medium'>{result}</p>
              </div>
            </div>
          )}

          <div className='text-center'>
            <Button variant='link' asChild>
              <Link to='/'>← Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
