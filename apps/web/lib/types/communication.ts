// lib/types/communication.ts
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  thread_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  participants?: string[];
}

export interface CommunicationError {
  code: string;
  message: string;
  details?: any;
}
