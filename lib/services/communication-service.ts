// lib/services/communication-service.ts
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  thread_id: string;
  created_at: string;
}

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export class CommunicationService {
  static async getMessages(threadId: string): Promise<Message[]> {
    return [];
  }

  static async sendMessage(threadId: string, content: string, senderId: string): Promise<Message> {
    return {
      id: Math.random().toString(36),
      content,
      sender_id: senderId,
      thread_id: threadId,
      created_at: new Date().toISOString()
    };
  }

  static async getThreads(): Promise<Thread[]> {
    return [];
  }

  static async createThread(title: string): Promise<Thread> {
    return {
      id: Math.random().toString(36),
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}