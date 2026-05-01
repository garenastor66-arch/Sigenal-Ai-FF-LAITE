export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  memory: string; // A summarized memory of everything AI knows about the user
  lastMemoryUpdate: number;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}
