"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ShoppingCart, 
  UserPlus, 
  FileText, 
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'order' | 'user' | 'payment' | 'document' | 'delivery' | 'alert' | 'success';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  avatar?: string;
}

const iconMap = {
  order: ShoppingCart,
  user: UserPlus,
  payment: CreditCard,
  document: FileText,
  delivery: Package,
  alert: AlertCircle,
  success: CheckCircle
};

const colorMap = {
  order: 'text-blue-600 bg-blue-100',
  user: 'text-green-600 bg-green-100',
  payment: 'text-purple-600 bg-purple-100',
  document: 'text-gray-600 bg-gray-100',
  delivery: 'text-yellow-600 bg-yellow-100',
  alert: 'text-red-600 bg-red-100',
  success: 'text-emerald-600 bg-emerald-100'
};

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function RecentActivity({ 
  activities, 
  maxItems = 5,
  className 
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={cn("glass-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <button className="text-sm text-grupous-secondary hover:text-grupous-secondary/80 transition-colors">
          View all
        </button>
      </div>

      {/* Activity List */}
      <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {displayedActivities.map((activity) => {
          const Icon = iconMap[activity.type];
          const colorClass = colorMap[activity.type];

          return (
            <motion.div
              key={activity.id}
              variants={item}
              className="flex items-start gap-4 group cursor-pointer"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Icon */}
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                colorClass,
                "group-hover:scale-110"
              )}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                {activity.user && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    by {activity.user}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                {activity.timestamp}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
}