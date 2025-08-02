// Stock Dashboard Page
// Story 11.4: Alertas e Relatórios de Estoque
// Dashboard de performance e métricas de estoque

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import StockDashboardClient from './client';

export const metadata: Metadata = {
  title: 'Dashboard de Estoque | NeonPro',
  description: 'Acompanhe métricas de performance, alertas e análises de estoque em tempo real',
};

// =====================================================
// LOADING COMPONENT
// =====================================================

function StockDashboardLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Recommendations Skeleton */}
        <div className="p-6 border rounded-lg">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE COMPONENT
// =====================================================

export default function StockDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<StockDashboardLoading />}>
        <StockDashboardClient />
      </Suspense>
    </div>
  );
}