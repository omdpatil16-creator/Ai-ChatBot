import { Message } from './message';

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  model: string;
  messages: Message[];
  tags?: string[];
  systemPrompt?: string;
}
