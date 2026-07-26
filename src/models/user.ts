export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  aiProvider: 'gemini' | 'mock' | 'openai' | 'claude';
  selectedModel: string;
  systemInstruction: string;
  autoSpeakResponse: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  settings: UserSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  fontSize: 'md',
  language: 'English',
  notificationsEnabled: true,
  soundEnabled: true,
  aiProvider: 'gemini',
  selectedModel: 'gemini-3.6-flash',
  systemInstruction: 'You are a helpful, intelligent, and friendly AI Assistant similar to ChatGPT. Provide clear markdown answers, concise code snippets with syntax highlighting, and helpful explanations.',
  autoSpeakResponse: false,
};
