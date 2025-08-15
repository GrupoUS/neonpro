'use client';

import type React from 'react';
import { createContext, type ReactNode, useContext, useReducer } from 'react';

// Types
export interface Customer {
  id: string;
  profile_id: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
  customer_since: string;
  lifetime_value: number;
  last_treatment?: string;
  last_visit?: string;
  total_visits: number;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'sms';
  notes?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  auto_update: boolean;
  customer_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  target_segment_id?: string;
  target_all_customers: boolean;
  subject?: string;
  content: Record<string, any>;
  schedule_date?: string;
  send_immediately: boolean;
  sent_at?: string;
  total_recipients: number;
  metrics: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// State interface
interface CRMState {
  customers: Customer[];
  segments: CustomerSegment[];
  campaigns: MarketingCampaign[];
  loading: {
    customers: boolean;
    segments: boolean;
    campaigns: boolean;
  };
  errors: {
    customers?: string;
    segments?: string;
    campaigns?: string;
  };
  filters: {
    customer_search: string;
    customer_status: string;
    customer_segment: string;
  };
}

// Actions
type CRMAction =
  | {
      type: 'SET_LOADING';
      payload: { key: keyof CRMState['loading']; value: boolean };
    }
  | {
      type: 'SET_ERROR';
      payload: { key: keyof CRMState['errors']; value?: string };
    }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_SEGMENTS'; payload: CustomerSegment[] }
  | { type: 'ADD_SEGMENT'; payload: CustomerSegment }
  | { type: 'UPDATE_SEGMENT'; payload: CustomerSegment }
  | { type: 'DELETE_SEGMENT'; payload: string }
  | { type: 'SET_CAMPAIGNS'; payload: MarketingCampaign[] }
  | { type: 'ADD_CAMPAIGN'; payload: MarketingCampaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: MarketingCampaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | {
      type: 'SET_FILTER';
      payload: { key: keyof CRMState['filters']; value: string };
    }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: CRMState = {
  customers: [],
  segments: [],
  campaigns: [],
  loading: {
    customers: false,
    segments: false,
    campaigns: false,
  },
  errors: {},
  filters: {
    customer_search: '',
    customer_status: '',
    customer_segment: '',
  },
};

// Reducer
function crmReducer(state: CRMState, action: CRMAction): CRMState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };

    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer
        ),
      };

    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(
          (customer) => customer.id !== action.payload
        ),
      };

    case 'SET_SEGMENTS':
      return { ...state, segments: action.payload };

    case 'ADD_SEGMENT':
      return { ...state, segments: [...state.segments, action.payload] };

    case 'UPDATE_SEGMENT':
      return {
        ...state,
        segments: state.segments.map((segment) =>
          segment.id === action.payload.id ? action.payload : segment
        ),
      };

    case 'DELETE_SEGMENT':
      return {
        ...state,
        segments: state.segments.filter(
          (segment) => segment.id !== action.payload
        ),
      };

    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload };

    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };

    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === action.payload.id ? action.payload : campaign
        ),
      };

    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(
          (campaign) => campaign.id !== action.payload
        ),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };

    default:
      return state;
  }
}

// Context interface
interface CRMContextType {
  state: CRMState;
  dispatch: React.Dispatch<CRMAction>;
  // Helper functions
  setLoading: (key: keyof CRMState['loading'], value: boolean) => void;
  setError: (key: keyof CRMState['errors'], value?: string) => void;
  setFilter: (key: keyof CRMState['filters'], value: string) => void;
  resetFilters: () => void;
  // Computed values
  filteredCustomers: Customer[];
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
}

// Create context
const CRMContext = createContext<CRMContextType | null>(null);

// Provider component
interface CRMProviderProps {
  children: ReactNode;
}

export function CRMProvider({ children }: CRMProviderProps) {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  // Helper functions
  const setLoading = (key: keyof CRMState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  };

  const setError = (key: keyof CRMState['errors'], value?: string) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  };

  const setFilter = (key: keyof CRMState['filters'], value: string) => {
    dispatch({ type: 'SET_FILTER', payload: { key, value } });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  // Computed values
  const filteredCustomers = state.customers.filter((customer) => {
    const matchesSearch =
      !state.filters.customer_search ||
      customer.profile?.full_name
        ?.toLowerCase()
        .includes(state.filters.customer_search.toLowerCase()) ||
      customer.profile?.email
        ?.toLowerCase()
        .includes(state.filters.customer_search.toLowerCase());

    const matchesStatus =
      !state.filters.customer_status ||
      customer.status === state.filters.customer_status;

    return matchesSearch && matchesStatus;
  });

  const totalCustomers = state.customers.length;
  const activeCustomers = state.customers.filter(
    (c) => c.status === 'active'
  ).length;
  const vipCustomers = state.customers.filter((c) => c.status === 'vip').length;

  const contextValue: CRMContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setFilter,
    resetFilters,
    filteredCustomers,
    totalCustomers,
    activeCustomers,
    vipCustomers,
  };

  return (
    <CRMContext.Provider value={contextValue}>{children}</CRMContext.Provider>
  );
}

// Hook to use CRM context
export function useCRM(): CRMContextType {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}

export default CRMContext;
