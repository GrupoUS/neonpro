// lib/types/communication.ts
export type Message = {
  id: string;
  content: string;
  sender_id: string;
  thread_id: string;
  created_at: string;
  updated_at?: string;
};

export type Thread = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  participants?: string[];
};

export type CommunicationError = {
  code: string;
  message: string;
  details?: any;
};
