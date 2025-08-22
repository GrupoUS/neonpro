import type React from 'react';
import { Header } from '../components/header';
import { HealthcareSidebar } from '../components/healthcare-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <HealthcareSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 overflow-auto p-6 bg-bg-secondary/30">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
