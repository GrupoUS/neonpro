
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FloatingChatbot } from '@/components/chatbot/FloatingChatbot';

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-sacha-gold rounded-lg flex items-center justify-center shadow-sacha-gold">
                    <span className="text-sacha-dark font-bold text-sm">U</span>
                  </div>
                  <span className="font-bold text-xl text-gradient-sacha text-sacha-brand">
                    Universo da Sacha
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <FloatingChatbot />
    </SidebarProvider>
  );
};

export default Layout;
