/**
 * Subscription Types for NeonPro Healthcare System
 * Defines types for subscription management and user profiles
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'professional';
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionStatus {
  id: string;
  userId: string;
  tier: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  features: string[];
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
  };
  usage: {
    users: number;
    projects: number;
    storage: number;
  };
  metadata: {
    source: string;
    environment: string;
  };
}