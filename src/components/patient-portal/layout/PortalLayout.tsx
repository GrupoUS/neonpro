'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Menu, X, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PortalNavigation } from './PortalNavigation';
import { PortalHeader } from './PortalHeader';
import { patientPortalAuth } from '@/lib/services/patient-portal-auth';
import type { PatientSession } from '@/types/patient-portal';

interface PortalLayoutProps {
  children: React.ReactNode;
  patient?: PatientSession;
  clinicBranding?: {
    name: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export function PortalLayout({ 
  children, 
  patient,
  clinicBranding = {
    name: 'NeonPro',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6'
  }
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Apply clinic branding to CSS variables
  useEffect(() => {
    if (clinicBranding?.primaryColor) {
      document.documentElement.style.setProperty('--portal-primary', clinicBranding.primaryColor);
    }
    if (clinicBranding?.secondaryColor) {
      document.documentElement.style.setProperty('--portal-secondary', clinicBranding.secondaryColor);
    }
  }, [clinicBranding]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await patientPortalAuth.logout();
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com segurança.",
      });
      
      router.push('/portal');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Não foi possível realizar o logout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPatientInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl lg:shadow-none">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              {clinicBranding?.logo ? (
                <img 
                  src={clinicBranding.logo} 
                  alt={clinicBranding.name}
                  className="h-8 w-8 rounded-md"
                />
              ) : (
                <div 
                  className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: clinicBranding.primaryColor }}
                >
                  {clinicBranding.name.charAt(0)}
                </div>
              )}
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Portal {clinicBranding.name}
              </span>
            </div>
            
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Patient Info */}
          {patient && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient.avatar_url} />
                  <AvatarFallback 
                    className="text-white font-medium"
                    style={{ backgroundColor: clinicBranding.primaryColor }}
                  >
                    {getPatientInitials(patient.patient_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {patient.patient_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {patient.email}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="mt-1 text-xs"
                  >
                    {patient.clinic_name}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <PortalNavigation 
            pathname={pathname}
            onNavigate={() => setSidebarOpen(false)}
            primaryColor={clinicBranding.primaryColor}
          />

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/portal/settings')}
                className="flex-1 justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <PortalHeader
          patient={patient}
          notifications={notifications}
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => router.push('/portal/notifications')}
          primaryColor={clinicBranding.primaryColor}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}