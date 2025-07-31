'use client';

import { Bell, Menu, Search, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import type { PatientSession } from '@/types/patient-portal';

interface PortalHeaderProps {
  patient?: PatientSession;
  notifications?: number;
  onMenuClick: () => void;
  onNotificationClick: () => void;
  primaryColor?: string;
}

export function PortalHeader({
  patient,
  notifications = 0,
  onMenuClick,
  onNotificationClick,
  primaryColor = '#6366f1'
}: PortalHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
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
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar..."
                className="w-64 pl-10 pr-4 h-9"
              />
            </div>
          </div>

          {/* Date and time */}
          <div className="hidden md:block text-sm text-slate-600 dark:text-slate-300">
            <div className="font-medium">{formatTime(currentTime)}</div>
            <div className="text-xs text-slate-500 capitalize">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Network status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="hidden sm:inline text-xs text-slate-500">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          {/* Search mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden h-9 w-9"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="relative h-9 w-9"
          >
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </Button>

          {/* Patient avatar */}
          {patient && (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-700">
              <Avatar className="h-8 w-8">
                <AvatarImage src={patient.avatar_url} />
                <AvatarFallback 
                  className="text-white text-xs font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  {getPatientInitials(patient.patient_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {patient.patient_name.split(' ')[0]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Portal Paciente
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}