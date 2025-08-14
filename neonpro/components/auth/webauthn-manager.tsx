/**
 * WebAuthn Manager Component
 * TASK-002: Multi-Factor Authentication Enhancement
 * 
 * Provides UI for WebAuthn credential management including:
 * - Registration of new credentials
 * - Viewing existing credentials
 * - Removing credentials
 * - Testing browser compatibility
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Fingerprint, Shield, Smartphone, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { webAuthnClient, type WebAuthnCapabilities } from '@/lib/auth/webauthn-client';

interface WebAuthnCredential {
  id: string;
  credential_id: string;
  device_type: 'platform' | 'cross-platform';
  device_name?: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
}

export function WebAuthnManager() {
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [capabilities, setCapabilities] = useState<WebAuthnCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkCapabilities();
    loadCredentials();
  }, []);

  const checkCapabilities = async () => {
    try {
      const caps = await webAuthnClient.checkCapabilities();
      setCapabilities(caps);
    } catch (error) {
      console.error('Failed to check WebAuthn capabilities:', error);
    }
  };

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/auth/webauthn/credentials');
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!capabilities?.supported) {
      setError('WebAuthn is not supported in this browser');
      return;
    }

    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await webAuthnClient.registerCredential(deviceName || undefined);
      
      if (result.success) {
        setSuccess('WebAuthn credential registered successfully!');
        setDeviceName('');
        await loadCredentials();
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleRemove = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/credentials/${credentialId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Credential removed successfully');
        await loadCredentials();
      } else {
        setError('Failed to remove credential');
      }
    } catch (error) {
      setError('Failed to remove credential');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'platform':
        return <Fingerprint className="h-4 w-4" />;
      case 'cross-platform':
        return <Shield className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getDeviceTypeLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'platform':
        return 'Built-in (Touch ID, Face ID, Windows Hello)';
      case 'cross-platform':
        return 'Security Key';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading WebAuthn settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Browser Compatibility Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            WebAuthn Security
          </CardTitle>
          <CardDescription>
            Passwordless authentication using biometrics or security keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {capabilities && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {capabilities.supported ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  WebAuthn Support: {capabilities.supported ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {capabilities.platformAuthenticatorAvailable ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">
                  Platform Authenticator: {capabilities.platformAuthenticatorAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          )}

          {!capabilities?.supported && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your browser does not support WebAuthn. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add New Credential */}
      {capabilities?.supported && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Authenticator
            </CardTitle>
            <CardDescription>
              Register a new biometric authenticator or security key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name (Optional)</Label>
              <Input
                id="deviceName"
                placeholder="e.g., iPhone Touch ID, YubiKey 5"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                disabled={registering}
              />
            </div>

            <Button 
              onClick={handleRegister} 
              disabled={registering}
              className="w-full"
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Register New Authenticator
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Your Authenticators</CardTitle>
          <CardDescription>
            Manage your registered biometric authenticators and security keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No authenticators registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((credential) => (
                <div
                  key={credential.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(credential.device_type)}
                    <div>
                      <div className="font-medium">
                        {credential.device_name || 'Unnamed Device'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getDeviceTypeLabel(credential.device_type)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added: {new Date(credential.created_at).toLocaleDateString()}
                        {credential.last_used_at && (
                          <span className="ml-2">
                            Last used: {new Date(credential.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={credential.is_active ? 'default' : 'secondary'}>
                      {credential.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(credential.credential_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}