/**
 * Waitlist Management Component
 * Story 2.2: Intelligent conflict detection and resolution - Waitlist interface
 * 
 * React component for managing patient waitlists and automated notifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Bell, 
  Calendar, 
  Users, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  UserPlus,
  Send,
  RefreshCw
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types matching our backend service
interface WaitlistEntry {
  id: string;
  patientId: string;
  treatmentType: string;
  preferredProfessionalId?: string;
  preferredDateRange: {
    start: Date;
    end: Date;
  };
  preferredTimeSlots: TimeSlot[];
  priorityScore: number;
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  specialRequirements: Record<string, any>;
  notificationCount: number;
  lastNotificationAt?: Date;
  status: 'active' | 'notified' | 'booked' | 'expired' | 'cancelled';
}

interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  dayOfWeek?: number; // 0-6, where 0 is Sunday
}

interface WaitlistManagementProps {
  treatmentType?: string;
  onPatientAdded?: (entry: WaitlistEntry) => void;
  onNotificationSent?: (entryId: string) => void;
  showAddForm?: boolean;
}

export default function WaitlistManagement({
  treatmentType,
  onPatientAdded,
  onNotificationSent,
  showAddForm = true
}: WaitlistManagementProps) {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    treatmentType: treatmentType || '',
    preferredStartDate: '',
    preferredEndDate: '',
    urgencyLevel: 'normal' as const,
    specialRequirements: ''
  });
  
  const supabase = createClientComponentClient();

  // Load waitlist entries on component mount
  useEffect(() => {
    loadWaitlistEntries();
  }, [treatmentType]);

  const loadWaitlistEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (treatmentType) {
        params.append('treatmentType', treatmentType);
      }
      params.append('status', 'active');
      params.append('limit', '50');

      const response = await fetch(`/api/scheduling/waitlist?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load waitlist');
      }

      const result = await response.json();
      setWaitlistEntries(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWaitlist = async () => {
    if (!formData.patientId || !formData.treatmentType || !formData.preferredStartDate || !formData.preferredEndDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scheduling/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          patientId: formData.patientId,
          treatmentType: formData.treatmentType,
          preferredDateRange: {
            start: formData.preferredStartDate,
            end: formData.preferredEndDate
          },
          urgencyLevel: formData.urgencyLevel,
          specialRequirements: formData.specialRequirements ? JSON.parse(formData.specialRequirements) : {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to waitlist');
      }

      const result = await response.json();
      
      // Reset form
      setFormData({
        patientId: '',
        treatmentType: treatmentType || '',
        preferredStartDate: '',
        preferredEndDate: '',
        urgencyLevel: 'normal',
        specialRequirements: ''
      });
      setShowForm(false);
      
      // Reload waitlist
      await loadWaitlistEntries();
      
      if (onPatientAdded) {
        onPatientAdded(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async (entryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scheduling/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'notify',
          patientId: 'placeholder', // Required by API but not used for notify action
          treatmentType: 'placeholder', // Required by API but not used for notify action
          waitlistEntryId: entryId,
          availableSlots: [] // Would be populated with actual available slots
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      // Reload waitlist to reflect updated notification status
      await loadWaitlistEntries();
      
      if (onNotificationSent) {
        onNotificationSent(entryId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'notified': return 'bg-blue-100 text-blue-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      {/* Waitlist Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Waitlist Management
              </CardTitle>
              <CardDescription>
                Manage patient waitlists and automated appointment notifications
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={loadWaitlistEntries} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {showAddForm && (
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardFooter>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{waitlistEntries.length} patient{waitlistEntries.length !== 1 ? 's' : ''} on waitlist</span>
            <Separator orientation="vertical" className="h-4" />
            <span>
              {waitlistEntries.filter(e => e.urgencyLevel === 'urgent' || e.urgencyLevel === 'emergency').length} urgent case{waitlistEntries.filter(e => e.urgencyLevel === 'urgent' || e.urgencyLevel === 'emergency').length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add to Waitlist Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Patient to Waitlist
            </CardTitle>
            <CardDescription>
              Add a patient to the waitlist with their preferences and urgency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <Label htmlFor="treatmentType">Treatment Type</Label>
                <Input
                  id="treatmentType"
                  value={formData.treatmentType}
                  onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
                  placeholder="Enter treatment type"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Preferred Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Preferred End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.preferredEndDate}
                  onChange={(e) => setFormData({ ...formData, preferredEndDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="urgencyLevel">Urgency Level</Label>
              <Select 
                value={formData.urgencyLevel} 
                onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="specialRequirements">Special Requirements (JSON)</Label>
              <Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                placeholder='{"accessibility": true, "language": "spanish"}'
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={addToWaitlist} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add to Waitlist
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Waitlist Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Current Waitlist</CardTitle>
          <CardDescription>
            Patients waiting for available appointments, sorted by priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && waitlistEntries.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading waitlist...</p>
            </div>
          ) : waitlistEntries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No patients on waitlist</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {waitlistEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Patient: {entry.patientId}</span>
                          <Badge className={getUrgencyColor(entry.urgencyLevel)}>
                            {entry.urgencyLevel}
                          </Badge>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{entry.treatmentType}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Priority: {entry.priorityScore}</div>
                        <div className="text-xs text-gray-500">
                          Notifications: {entry.notificationCount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Preferred dates:</span>
                        <div className="text-gray-600">
                          {formatDate(entry.preferredDateRange.start.toString())} - {formatDate(entry.preferredDateRange.end.toString())}
                        </div>
                      </div>
                      
                      {entry.preferredTimeSlots && entry.preferredTimeSlots.length > 0 && (
                        <div>
                          <span className="font-medium">Preferred times:</span>
                          <div className="text-gray-600">
                            {entry.preferredTimeSlots.map((slot, index) => (
                              <div key={index}>
                                {slot.dayOfWeek !== undefined && `${getDayName(slot.dayOfWeek)} `}
                                {slot.startTime} - {slot.endTime}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {Object.keys(entry.specialRequirements).length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium">Special requirements:</span>
                        <div className="text-sm text-gray-600">
                          {Object.entries(entry.specialRequirements).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="mr-1 mt-1">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <div className="text-xs text-gray-500">
                        {entry.lastNotificationAt && (
                          <>Last notified: {formatDate(entry.lastNotificationAt.toString())}</>
                        )}
                      </div>
                      
                      {entry.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendNotification(entry.id)}
                          disabled={isLoading}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Notify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}