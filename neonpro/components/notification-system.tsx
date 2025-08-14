'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// =====================================================================================
// NOTIFICATION SYSTEM
// Real-time notification management with performance optimization
// =====================================================================================

type NotificationType = 'success' | 'error' | 'warning' | 'info';
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  timestamp: number;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// =====================================================================================
// NOTIFICATION PROVIDER
// =====================================================================================

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
  position?: NotificationPosition;
  enableSound?: boolean;
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right',
  enableSound = false
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.3;
    }
  }, [enableSound]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const playNotificationSound = useCallback((type: NotificationType) => {
    if (!enableSound || !audioRef.current) return;
    
    try {
      // Different sounds for different types could be implemented here
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [enableSound]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const duration = notification.duration ?? defaultDuration;

    const newNotification: Notification = {
      ...notification,
      id,
      timestamp,
      dismissible: notification.dismissible ?? true
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit the number of notifications
      if (updated.length > maxNotifications) {
        const removed = updated.slice(maxNotifications);
        removed.forEach(notif => {
          const timeout = timeoutsRef.current.get(notif.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(notif.id);
          }
        });
        return updated.slice(0, maxNotifications);
      }
      return updated;
    });

    // Play sound
    playNotificationSound(notification.type);

    // Auto-dismiss if duration is set
    if (duration > 0) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, duration);
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, [defaultDuration, maxNotifications, playNotificationSound]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer position={position} />
    </NotificationContext.Provider>
  );
}

// =====================================================================================
// NOTIFICATION CONTAINER
// =====================================================================================

interface NotificationContainerProps {
  position: NotificationPosition;
}

function NotificationContainer({ position }: NotificationContainerProps) {
  const { notifications } = useNotifications();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (notifications.length === 0) return null;

  return (
    <div className={cn(
      'fixed z-50 flex flex-col gap-2 max-w-sm w-full',
      positionClasses[position]
    )}>
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
        />
      ))}
    </div>
  );
}

// =====================================================================================
// NOTIFICATION ITEM
// =====================================================================================

interface NotificationItemProps {
  notification: Notification;
  index: number;
}

function NotificationItem({ notification, index }: NotificationItemProps) {
  const { removeNotification, markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 200);
  }, [notification.id, removeNotification]);

  const handleClick = useCallback(() => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  }, [notification.id, notification.read, markAsRead]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 ease-in-out cursor-pointer',
        'hover:shadow-md',
        getColorClasses(),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isExiting ? 'translate-x-full opacity-0' : '',
        !notification.read ? 'ring-2 ring-blue-200' : ''
      )}
      style={{
        transform: `translateY(${index * 4}px)`,
        zIndex: 1000 - index
      }}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </h4>
                {notification.message && (
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                )}
              </div>
              
              {!notification.read && (
                <Badge variant="secondary" className="ml-2 h-2 w-2 p-0 bg-blue-500" />
              )}
            </div>
            
            {notification.action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.action!.onClick();
                  }}
                >
                  {notification.action.label}
                </Button>
              </div>
            )}
          </div>
          
          {notification.dismissible && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================================
// NOTIFICATION BELL COMPONENT
// =====================================================================================

interface NotificationBellProps {
  className?: string;
  showCount?: boolean;
}

export function NotificationBell({ className, showCount = true }: NotificationBellProps) {
  const { notifications, getUnreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = getUnreadCount();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn('relative', className)}
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {showCount && unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b">
            <h3 className="font-semibold">Notificações</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className="p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {notification.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================================================
// HOOKS
// =====================================================================================

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience hooks for different notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'error', title, message, duration: 0, ...options });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}

export default NotificationProvider;
