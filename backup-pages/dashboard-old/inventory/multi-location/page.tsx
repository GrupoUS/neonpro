import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { MultiLocationStockOverview, StockTransferManager } from '@/components/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Building2, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Multi-Location Inventory | NeonPro',
  description: 'Manage inventory across multiple clinic locations',
};

function InventoryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MultiLocationInventoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Multi-Location Inventory</h1>
          <p className="text-muted-foreground">
            Manage inventory across all clinic locations with real-time tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Locations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<InventoryLoadingSkeleton />}>
            <MultiLocationStockOverview />
          </Suspense>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transfer Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Transfer inventory between locations and track all movements
              </p>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }>
                <StockTransferManager />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location-Specific Inventory</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage inventory for each clinic location
              </p>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }>
                <MultiLocationStockOverview showLocationFilter={true} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}