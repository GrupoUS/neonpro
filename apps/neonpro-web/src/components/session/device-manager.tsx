'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeviceManagement } from '@/hooks/use-session';
import {
  Smartphone,
  Monitor,
  Tablet,
  Shield,
  ShieldCheck,
  Trash2,
  Edit,
  MapPin,
  Clock,
  AlertTriangle,
  Plus
} from 'lucide-react';
import {
  DeviceInfo,
  DeviceType
} from '@/types/session';

interface DeviceManagerProps {
  userId: string;
  className?: string;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({ 
  userId, 
  className = '' 
}) => {
  const {
    devices,
    loading,
    error,
    trustDevice,
    untrustDevice,
    removeDevice,
    registerDevice,
    refreshDevices
  } = useDeviceManagement(userId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'DESKTOP' as DeviceType,
    trusted: false
  });

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'MOBILE':
        return <Smartphone className="h-5 w-5" />;
      case 'TABLET':
        return <Tablet className="h-5 w-5" />;
      case 'DESKTOP':
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getDeviceTypeColor = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'MOBILE': return 'bg-blue-100 text-blue-800';
      case 'TABLET': return 'bg-purple-100 text-purple-800';
      case 'DESKTOP': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSeen = (timestamp: string) => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleTrustToggle = async (device: DeviceInfo) => {
    try {
      if (device.trusted) {
        await untrustDevice(device.id);
      } else {
        await trustDevice(device.id);
      }
      await refreshDevices();
    } catch (error) {
      console.error('Failed to toggle device trust:', error);
    }
  };

  const handleRemoveDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      await removeDevice(selectedDevice.id);
      await refreshDevices();
      setShowRemoveDialog(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error('Failed to remove device:', error);
    }
  };

  const handleAddDevice = async () => {
    try {
      await registerDevice({
        user_id: userId,
        device_name: newDevice.name,
        device_type: newDevice.type,
        trusted: newDevice.trusted,
        ip_address: '0.0.0.0', // Will be set by the API
        user_agent: navigator.userAgent,
        last_seen: new Date().toISOString()
      });
      
      await refreshDevices();
      setShowAddDialog(false);
      setNewDevice({ name: '', type: 'DESKTOP', trusted: false });
    } catch (error) {
      console.error('Failed to add device:', error);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Device Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Device Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load devices: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Management
              <Badge variant="secondary" className="ml-2">
                {devices.length}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDevices}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">No Devices Found</p>
              <p className="text-sm">Add a device to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {device.device_name}
                      </h3>
                      <Badge 
                        className={getDeviceTypeColor(device.device_type)}
                        variant="secondary"
                      >
                        {device.device_type}
                      </Badge>
                      {device.trusted && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastSeen(device.last_seen)}
                      </div>
                      
                      {device.ip_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {device.ip_address}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-full ${
                          device.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {device.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={device.trusted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTrustToggle(device)}
                    >
                      {device.trusted ? (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Trusted
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Trust
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowRemoveDialog(true);
                      }}
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

      {/* Add Device Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Register a new device for this user account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                value={newDevice.name}
                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Laptop"
              />
            </div>
            
            <div>
              <Label htmlFor="device-type">Device Type</Label>
              <select
                id="device-type"
                value={newDevice.type}
                onChange={(e) => setNewDevice(prev => ({ ...prev, type: e.target.value as DeviceType }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="DESKTOP">Desktop</option>
                <option value="MOBILE">Mobile</option>
                <option value="TABLET">Tablet</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trusted"
                checked={newDevice.trusted}
                onChange={(e) => setNewDevice(prev => ({ ...prev, trusted: e.target.checked }))}
              />
              <Label htmlFor="trusted">Mark as trusted device</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDevice}
              disabled={!newDevice.name.trim()}
            >
              Add Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Device Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this device? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceIcon(selectedDevice.device_type)}
                <div>
                  <h3 className="font-medium">{selectedDevice.device_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDevice.device_type} • Last seen {formatLastSeen(selectedDevice.last_seen)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveDevice}>
              Remove Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceManager;