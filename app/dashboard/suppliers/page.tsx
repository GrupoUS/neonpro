// ============================================================================
// Supplier Management Page - Epic 6, Story 6.3
// ============================================================================
// Main supplier management interface with comprehensive search, filtering,
// analytics, and performance tracking for NeonPro clinic management
// ============================================================================

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SupplierManagement } from '@/components/supplier/supplier-management';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Gestão de Fornecedores - NeonPro',
  description: 'Gerencie fornecedores, monitore performance e analise métricas de qualidade e confiabilidade.',
};

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function SupplierManagementLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function getSupplierData(clinicId: string) {
  const supabase = await createClient();

  try {
    // Get supplier statistics
    const { data: suppliersCount, error: countError } = await supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    if (countError) {
      console.error('Error fetching suppliers count:', countError);
    }

    // Get active suppliers count
    const { data: activeSuppliersCount, error: activeCountError } = await supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'active');

    if (activeCountError) {
      console.error('Error fetching active suppliers count:', activeCountError);
    }

    // Get suppliers with performance issues
    const { data: performanceIssuesCount, error: performanceError } = await supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .lt('performance_score', 70);

    if (performanceError) {
      console.error('Error fetching performance issues count:', performanceError);
    }

    // Get average performance score
    const { data: performanceData, error: avgPerformanceError } = await supabase
      .from('suppliers')
      .select('performance_score, quality_rating, reliability_score, cost_competitiveness')
      .eq('clinic_id', clinicId)
      .eq('status', 'active');

    if (avgPerformanceError) {
      console.error('Error fetching performance data:', avgPerformanceError);
    }

    // Calculate average scores
    let averagePerformance = 0;
    if (performanceData && performanceData.length > 0) {
      const totalPerformance = performanceData.reduce((sum, supplier) => {
        return sum + (
          (supplier.performance_score || 0) +
          (supplier.quality_rating || 0) +
          (supplier.reliability_score || 0) +
          (supplier.cost_competitiveness || 0)
        ) / 4;
      }, 0);
      averagePerformance = totalPerformance / performanceData.length;
    }

    return {
      totalSuppliers: suppliersCount?.length || 0,
      activeSuppliers: activeSuppliersCount?.length || 0,
      performanceIssues: performanceIssuesCount?.length || 0,
      averagePerformance: Math.round(averagePerformance),
    };

  } catch (error) {
    console.error('Error fetching supplier data:', error);
    return {
      totalSuppliers: 0,
      activeSuppliers: 0,
      performanceIssues: 0,
      averagePerformance: 0,
    };
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function SupplierManagementPage() {
  // ============================================================================
  // AUTHENTICATION & USER DATA
  // ============================================================================

  const supabase = await createClient();
  
  // Check authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    redirect('/login');
  }

  // Get user data
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/login');
  }

  // For testing purposes, use the demo clinic ID
  // In production, this should be retrieved from user profile
  const clinicId = '89084c3a-9200-4058-a15a-b440d3c60687';

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const supplierStats = await getSupplierData(clinicId);

  // ============================================================================
  // BREADCRUMBS
  // ============================================================================

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Gestão', href: '/dashboard/management' },
    { title: 'Fornecedores' },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de Fornecedores
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie fornecedores, monitore performance e analise métricas de qualidade e confiabilidade.
            </p>
          </div>
        </div>

        {/* Supplier Management Component */}
        <Suspense fallback={<SupplierManagementLoading />}>
          <SupplierManagement 
            clinicId={clinicId}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

// Metadata is exported at the top level
// No need for generateMetadata function