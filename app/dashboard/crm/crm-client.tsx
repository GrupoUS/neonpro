"use client";

import {
  CustomerAnalytics,
  CustomerManagement,
  LeadTracking,
} from "@/components/crm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

interface CRMClientPageProps {
  user: User;
}

export default function CRMClientPage({ user }: CRMClientPageProps) {
  const [activeTab, setActiveTab] = useState("customers");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Customer Relationship Management
          </h1>
          <p className="text-muted-foreground">
            Gerencie relacionamentos com clientes, leads e análises
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          CRM v2.2
        </Badge>
      </div>

      {/* CRM Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Visualize e gerencie informações detalhadas dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acompanhamento de Leads</CardTitle>
              <CardDescription>
                Monitore e converta leads em clientes ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadTracking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises de Clientes</CardTitle>
              <CardDescription>
                Insights e métricas de relacionamento com clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
