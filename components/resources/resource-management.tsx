// =====================================================
// Resource Management Dashboard Component
// Story 2.4: Smart Resource Management - Frontend
// =====================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  WrenchIcon,
  MapPinIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  SettingsIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// =====================================================
// Types
// =====================================================

type ResourceType = 'room' | 'equipment' | 'staff';
type ResourceStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';

interface Resource {
  id: string;
  clinic_id: string;
  name: string;
  type: ResourceType;
  category?: string;
  location?: string;
  status: ResourceStatus;
  capacity: number;
  cost_per_hour?: number;
  next_maintenance?: string;
  skills?: string[];
  equipment_ids?: string[];
  created_at: string;
  updated_at: string;
}

interface ResourceAllocation {
  id: string;
  resource_id: string;
  appointment_id?: string;
  start_time: string;
  end_time: string;
  status: string;
  allocation_type: string;
  notes?: string;
}

// =====================================================
// Resource Management Dashboard
// =====================================================

interface ResourceManagementProps {
  clinicId: string;
  userRole: string;
}

export default function ResourceManagement({ clinicId, userRole }: ResourceManagementProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    category: 'all'
  });

  // =====================================================
  // Data Fetching
  // =====================================================

  useEffect(() => {
    fetchResources();
  }, [clinicId, filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        clinic_id: clinicId,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category !== 'all' && { category: filters.category })
      });

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();

      if (data.success) {
        setResources(data.data);
      } else {
        toast.error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error loading resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async (resourceId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        resource_id: resourceId,
        start_date: `${today}T00:00:00Z`,
        end_date: `${today}T23:59:59Z`
      });

      const response = await fetch(`/api/resources/allocations?${params}`);
      const data = await response.json();

      if (data.success) {
        setAllocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  // =====================================================
  // Resource Actions
  // =====================================================

  const updateResourceStatus = async (resourceId: string, newStatus: ResourceStatus) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId, status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Resource status updated');
        fetchResources();
      } else {
        toast.error('Failed to update resource status');
      }
    } catch (error) {
      console.error('Error updating resource status:', error);
      toast.error('Error updating resource status');
    }
  };

  // =====================================================
  // UI Helpers
  // =====================================================

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-purple-100 text-purple-800';
      case 'reserved': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'room': return <MapPinIcon className="h-5 w-5" />;
      case 'equipment': return <WrenchIcon className="h-5 w-5" />;
      case 'staff': return <UserIcon className="h-5 w-5" />;
      default: return <SettingsIcon className="h-5 w-5" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // =====================================================
  // Render Components
  // =====================================================

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedResource(resource);
        fetchAllocations(resource.id);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getResourceIcon(resource.type)}
            <CardTitle className="text-lg">{resource.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(resource.status)}>
            {resource.status}
          </Badge>
        </div>
        <CardDescription>
          {resource.type} • {resource.category || 'General'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {resource.location && (
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {resource.location}
            </div>
          )}
          {resource.capacity && (
            <div className="flex items-center text-gray-600">
              <UserIcon className="h-4 w-4 mr-1" />
              Capacity: {resource.capacity}
            </div>
          )}
          {resource.cost_per_hour && (
            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              ${resource.cost_per_hour}/hour
            </div>
          )}
          {resource.next_maintenance && (
            <div className="flex items-center text-yellow-600">
              <AlertTriangleIcon className="h-4 w-4 mr-1" />
              Maintenance due: {new Date(resource.next_maintenance).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {userRole !== 'patient' && (
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateResourceStatus(resource.id, resource.status === 'available' ? 'maintenance' : 'available');
              }}
            >
              {resource.status === 'available' ? 'Set Maintenance' : 'Set Available'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AllocationsList = () => (
    <div className="space-y-3">
      {allocations.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No allocations for today</p>
      ) : (
        allocations.map((allocation) => (
          <Card key={allocation.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {formatTime(allocation.start_time)} - {formatTime(allocation.end_time)}
                </div>
                <div className="text-sm text-gray-600">
                  {allocation.allocation_type} {allocation.appointment_id && '• Appointment'}
                </div>
                {allocation.notes && (
                  <div className="text-sm text-gray-500 mt-1">{allocation.notes}</div>
                )}
              </div>
              <Badge className={
                allocation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                allocation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                allocation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {allocation.status}
              </Badge>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  // =====================================================
  // Main Render
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Management</h1>
          <p className="text-gray-600 mt-2">
            Manage clinic resources, allocations, and optimize utilization
          </p>
        </div>
        {userRole !== 'patient' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>
                  Create a new resource for your clinic
                </DialogDescription>
              </DialogHeader>
              {/* Add Resource Form would go here */}
              <div className="text-center py-4 text-gray-500">
                Resource creation form will be implemented here
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type-filter">Resource Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="room">Rooms</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="treatment_room">Treatment Room</SelectItem>
                  <SelectItem value="consultation_room">Consultation Room</SelectItem>
                  <SelectItem value="laser_equipment">Laser Equipment</SelectItem>
                  <SelectItem value="aesthetic_device">Aesthetic Device</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resources List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resources ({resources.length})</CardTitle>
              <CardDescription>
                Click on a resource to view its allocations and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading resources...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resource Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedResource ? selectedResource.name : 'Resource Details'}
              </CardTitle>
              <CardDescription>
                {selectedResource ? 'Current allocations and status' : 'Select a resource to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedResource ? (
                <Tabs defaultValue="allocations" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="allocations">Today's Schedule</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="allocations" className="mt-4">
                    <AllocationsList />
                  </TabsContent>
                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Type:</strong> {selectedResource.type}
                      </div>
                      <div>
                        <strong>Category:</strong> {selectedResource.category || 'General'}
                      </div>
                      <div>
                        <strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedResource.status)}`}>
                          {selectedResource.status}
                        </Badge>
                      </div>
                      {selectedResource.location && (
                        <div>
                          <strong>Location:</strong> {selectedResource.location}
                        </div>
                      )}
                      {selectedResource.capacity && (
                        <div>
                          <strong>Capacity:</strong> {selectedResource.capacity}
                        </div>
                      )}
                      {selectedResource.cost_per_hour && (
                        <div>
                          <strong>Cost per hour:</strong> ${selectedResource.cost_per_hour}
                        </div>
                      )}
                      {selectedResource.skills && selectedResource.skills.length > 0 && (
                        <div>
                          <strong>Skills:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedResource.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a resource from the list to view its details and current allocations
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}