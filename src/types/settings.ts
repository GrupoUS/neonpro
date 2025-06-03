
export interface NotificationSettings {
  id: string;
  user_id: string;
  email_appointments: boolean;
  email_reminders: boolean;
  email_marketing: boolean;
  sms_appointments: boolean;
  sms_reminders: boolean;
  push_notifications: boolean;
  reminder_hours_before: number;
  created_at: string;
  updated_at: string;
}

export interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  login_notifications: boolean;
  session_timeout_minutes: number;
  password_changed_at?: string;
  backup_codes?: string[];
  created_at: string;
  updated_at: string;
}

export interface AppearanceSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  sidebar_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettingsFormData {
  notifications?: Partial<NotificationSettings>;
  security?: Partial<SecuritySettings>;
  appearance?: Partial<AppearanceSettings>;
}
