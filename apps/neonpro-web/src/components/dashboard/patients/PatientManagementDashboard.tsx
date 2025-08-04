'use client';

/**
 * Patient Management Dashboard Component
 * 
 * Main dashboard for patient management with search, filtering,
 * and FHIR-compliant patient records display.
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Users, UserPlus, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { PatientRegistrationForm } from './PatientRegistrationForm';
import { PatientSearch } from './PatientSearch';
import { PatientTable } from './PatientTable';
import { PatientStatsCards } from './PatientStatsCards';
import { useAuth } from '@/contexts/auth-context';
import { searchPatients } from '@/lib/supabase/patients';
import type { PatientSearchParams } from '@/lib/validations/patient';
import type { PatientDB } from '@/lib/types/fhir';

export function PatientManagementDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<(PatientDB & { consents_count: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({
    limit: 25,
    offset: 0,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Load patients data
  const loadPatients = useCallback(async (params: PatientSearchParams) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await searchPatients(params, user.id);
      setPatients(result.patients);
      setTotalCount(result.total_count);
      setHasNextPage(result.has_next_page);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    loadPatients(searchParams);
  }, [loadPatients, searchParams]);

  // Handle search
  const handleSearch = (newParams: Partial<PatientSearchParams>) => {
    const updatedParams = { 
      ...searchParams, 
      ...newParams, 
      offset: 0 // Reset to first page when searching
    };
    setSearchParams(updatedParams);
  };

  // Handle pagination
  const handlePageChange = (newOffset: number) => {
    const updatedParams = { ...searchParams, offset: newOffset };
    setSearchParams(updatedParams);
  };

  // Handle successful patient registration
  const handleRegistrationSuccess = (patientId: string) => {
    setIsRegistrationOpen(false);
    loadPatients(searchParams); // Reload patients list
    toast.success('Patient registered successfully');
  };

  // Stats data (calculated from current patients)
  const stats = {
    total_patients: totalCount,
    active_patients: patients.filter(p => p.active).length,
    new_this_month: patients.filter(p => {
      const createdDate = new Date(p.created_at);
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return createdDate >= firstOfMonth;
    }).length,
    with_consents: patients.filter(p => p.consents_count > 0).length
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Register New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
              </DialogHeader>
              <PatientRegistrationForm
                onSuccess={handleRegistrationSuccess}
                onCancel={() => setIsRegistrationOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {totalCount} Total Patients
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <PatientStatsCards stats={stats} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patient Records
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          {/* Search and Filters */}
          <PatientSearch 
            onSearch={handleSearch}
            searchParams={searchParams}
            isLoading={isLoading}
          />

          {/* Patient Table */}
          <PatientTable
            patients={patients}
            isLoading={isLoading}
            searchParams={searchParams}
            totalCount={totalCount}
            hasNextPage={hasNextPage}
            onPageChange={handlePageChange}
            onSort={(field, order) => handleSearch({ sort_by: field, sort_order: order })}
          />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Appointments</CardTitle>
              <CardDescription>
                View and manage patient appointments integrated with patient records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <Calendar className="h-12 w-12 mx-auto" />
                  <p>Appointment management coming soon</p>
                  <p className="text-sm">This will integrate with the existing appointment system</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Reports</CardTitle>
              <CardDescription>
                Generate LGPD-compliant reports and analytics for patient data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto" />
                  <p>Report generation coming soon</p>
                  <p className="text-sm">FHIR-compliant and LGPD-compliant reporting</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}