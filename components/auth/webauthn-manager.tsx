'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Shield, Smartphone, Usb, Bluetooth, Nfc } from 'lucide-react';

interface WebAuthnCredential {
  id: string;
  credential_id: string;
  name: string;
  created_at: string;
  last_used_at?: string;
  transports: string[];
}

interface WebAuthnManagerProps {
  className?: string;
}

export function WebAuthnManager({ className }: WebAuthnManagerProps) {
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/webauthn/credentials');
      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }
      const data = await response.json();
      setCredentials(data.credentials || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setError('Failed to load WebAuthn credentials');
    } finally {
      setLoading(false);
    }
  };

  const isWebAuthnSupported = () => {
    return typeof window !== 'undefined' && 
           'credentials' in navigator && 
           'create' in navigator.credentials;
  };

  const registerCredential = async () => {
    if (!isWebAuthnSupported()) {
      setError('WebAuthn is not supported in this browser');
      return;
    }

    try {
      setIsRegistering(true);
      setError(null);

      // Get registration options from server
      const optionsResponse = await fetch('/api/auth/webauthn/register/begin', {
        method: 'POST',
      });
      
      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }
      
      const options = await optionsResponse.json();

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          user: {
            ...options.user,
            id: new Uint8Array(options.user.id),
          },
        },
      }) as any;

      if (!credential) {
        throw new Error('No credential was created');
      }

      // Complete registration
      const completeResponse = await fetch('/api/auth/webauthn/register/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          },
          type: credential.type,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete registration');
      }

      // Refresh credentials list
      await fetchCredentials();
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register WebAuthn credential');
    } finally {
      setIsRegistering(false);
    }
  };

  const deleteCredential = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/credentials/${credentialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete credential');
      }

      // Refresh credentials list
      await fetchCredentials();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete credential');
    }
  };

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'usb':
        return <Usb className="h-4 w-4" />;
      case 'ble':
        return <Bluetooth className="h-4 w-4" />;
      case 'nfc':
        return <Nfc className="h-4 w-4" />;
      case 'internal':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isWebAuthnSupported()) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            WebAuthn Security Keys
          </CardTitle>
          <CardDescription>
            Enhance your account security with biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              WebAuthn is not supported in this browser. Please use a modern browser 
              that supports Web Authentication API.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              WebAuthn Security Keys
            </CardTitle>
            <CardDescription>
              Manage your registered security keys and biometric authenticators
            </CardDescription>
          </div>
          <Button
            onClick={registerCredential}
            disabled={isRegistering}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isRegistering ? 'Registering...' : 'Add Security Key'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading credentials...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Security Keys Registered</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a security key or biometric authenticator to enhance your account security
            </p>
            <Button onClick={registerCredential} disabled={isRegistering}>
              <Plus className="h-4 w-4 mr-2" />
              Register Your First Security Key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{credential.name}</h4>
                    <div className="flex gap-1">
                      {credential.transports.map((transport) => (
                        <Badge key={transport} variant="secondary" className="flex items-center gap-1">
                          {getTransportIcon(transport)}
                          {transport}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Created: {formatDate(credential.created_at)}</p>
                    {credential.last_used_at && (
                      <p>Last used: {formatDate(credential.last_used_at)}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCredential(credential.credential_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WebAuthnManager;