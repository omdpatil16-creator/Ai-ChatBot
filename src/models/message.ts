export interface Attachment {
  id: string;
  name: string;
  type: string; // e.g. 'image/png', 'application/pdf', 'text/plain'
  size: number;
  dataUrl: string; // Base64 data url
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO string or human formatted
  attachments?: Attachment[];
  likeStatus?: 'like' | 'dislike' | null;
  isEdited?: boolean;
  error?: string;
  modelUsed?: string;
}
