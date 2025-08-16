'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SubscriptionAlert } from './subscription-alert';

interface SubscriptionNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SubscriptionNotificationContextType {
  notifications: SubscriptionNotification[];
  addNotification: (notification: Omit<SubscriptionNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const SubscriptionNotificationContext = createContext<
  SubscriptionNotificationContextType | undefined
>(undefined);

export function SubscriptionNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<
    SubscriptionNotification[]
  >([]);

  const addNotification = (
    notification: Omit<SubscriptionNotification, 'id'>,
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    notifications.forEach((notification) => {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });
  }, [notifications]);

  return (
    <SubscriptionNotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <SubscriptionAlert
            key={notification.id}
            type={notification.type}
            title={notification.title}
            description={notification.description}
            action={notification.action}
            className="max-w-sm"
          />
        ))}
      </div>
    </SubscriptionNotificationContext.Provider>
  );
}

export function useSubscriptionNotifications() {
  const context = useContext(SubscriptionNotificationContext);
  if (context === undefined) {
    throw new Error(
      'useSubscriptionNotifications must be used within a SubscriptionNotificationProvider',
    );
  }
  return context;
}
