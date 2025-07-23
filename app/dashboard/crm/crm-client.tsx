"use client";

import CustomerList from "@/components/crm/customer-management/customer-list";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { CRMProvider } from "@/contexts/crm-context";
import { User } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

interface CRMClientPageProps {
  user: User;
}

export default function CRMClientPage({ user }: CRMClientPageProps) {
  const [currentView, setCurrentView] = useState<
    "customers" | "segments" | "campaigns"
  >("customers");

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "CRM", href: "/dashboard/crm" },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "customers":
        return (
          <CustomerList
            onCustomerSelect={(customer) => {
              console.log("Customer selected:", customer);
            }}
            onCreateCustomer={() => {
              console.log("Create new customer");
            }}
            onEditCustomer={(customer) => {
              console.log("Edit customer:", customer);
            }}
          />
        );
      case "segments":
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Segmentação de Clientes</h2>
            <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
          </div>
        );
      case "campaigns":
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Campanhas de Marketing</h2>
            <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <CRMProvider>
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView("customers")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === "customers"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setCurrentView("segments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === "segments"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Segmentação
              </button>
              <button
                onClick={() => setCurrentView("campaigns")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === "campaigns"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Campanhas
              </button>
            </nav>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </CRMProvider>
    </DashboardLayout>
  );
}
