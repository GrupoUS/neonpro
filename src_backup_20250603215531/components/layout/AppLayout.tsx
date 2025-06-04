
import React, { useState } from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-background">
        {/* Sidebar para desktop */}
        <DesktopSidebar />

        {/* Mobile navigation */}
        <MobileNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Área de conteúdo */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
