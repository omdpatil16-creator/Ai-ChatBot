import { ChatSession } from '../models/chat';
import { Message, Attachment } from '../models/message';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { AIService } from './ai.service';

export class ChatService {
  private static chats: ChatSession[] = [];
  private static activeChatId: string | null = null;
  private static listeners: Array<(chats: ChatSession[], activeId: string | null) => void> = [];

  static init(userId: string) {
    let userChats = StorageService.getChats(userId);

    // If user has no chats, create a welcome conversation
    if (userChats.length === 0) {
      const welcomeChat: ChatSession = {
        id: `chat_${Date.now()}`,
        title: 'Welcome & AI Quickstart',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: true,
        model: 'gemini-3.6-flash',
        messages: [
          {
            id: `msg_welcome`,
            chatId: `chat_${Date.now()}`,
            role: 'assistant',
            content: `👋 **Welcome to AI ChatBot!**\n\nI am your intelligent assistant. Here is what you can do:\n\n* 💬 **Multiple Conversations**: Create, rename, pin, or delete chats in the sidebar.\n* 🎙️ **Voice Control**: Click the microphone icon to speak your prompts.\n* 📄 **File & Image Attachments**: Drag and drop images, PDFs, or documents.\n* ⚙️ **Custom Providers**: Switch between Gemini AI, Mock mode, or specialized models.\n* 📤 **Exporting**: Download any chat session as PDF, TXT, or JSON.\n* 🎨 **Theme & Customization**: Toggle dark/light mode and tweak font sizes in Settings.\n\nHow can I help you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'Gemini 3.6 Flash',
          },
        ],
      };
      userChats = [welcomeChat];
      this.saveChatsToStorage(userId, userChats);
    }

    this.chats = userChats;
    this.activeChatId = userChats[0]?.id || null;
    this.notify();
  }

  static subscribe(callback: (chats: ChatSession[], activeId: string | null) => void) {
    this.listeners.push(callback);
    callback(this.chats, this.activeChatId);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notify() {
    this.listeners.forEach((l) => l([...this.chats], this.activeChatId));
  }

  private static saveChatsToStorage(userId: string, userChats: ChatSession[]) {
    // Get all chats from storage, remove current user's chats, add updated userChats, and save
    const allChats = StorageService.getItem<ChatSession[]>('aichat_sessions_v1', []);
    const otherChats = allChats.filter((c) => c.userId !== userId);
    StorageService.saveAllChats([...otherChats, ...userChats]);
  }

  static getActiveChat(): ChatSession | null {
    return this.chats.find((c) => c.id === this.activeChatId) || null;
  }

  static selectChat(chatId: string) {
    this.activeChatId = chatId;
    this.notify();
  }

  static createChat(title?: string, initialMessage?: string): ChatSession {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const newChat: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title || 'New Conversation',
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      model: user.settings.selectedModel || 'gemini-3.6-flash',
      messages: [],
    };

    this.chats.unshift(newChat);
    this.activeChatId = newChat.id;

    if (initialMessage) {
      this.sendMessage(initialMessage);
    } else {
      this.saveChatsToStorage(user.id, this.chats);
      this.notify();
    }

    return newChat;
  }

  static togglePinChat(chatId: string) {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    this.chats = this.chats.map((c) => {
      if (c.id === chatId) {
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    });

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();
  }

  static renameChat(chatId: string, newTitle: string) {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    this.chats = this.chats.map((c) => {
      if (c.id === chatId) {
        return { ...c, title: newTitle, updatedAt: new Date().toISOString() };
      }
      return c;
    });

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();
  }

  static deleteChat(chatId: string) {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    this.chats = this.chats.filter((c) => c.id !== chatId);
    if (this.activeChatId === chatId) {
      this.activeChatId = this.chats[0]?.id || null;
    }

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();
  }

  static async sendMessage(content: string, attachments?: Attachment[]): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    let activeChat = this.getActiveChat();
    if (!activeChat) {
      activeChat = this.createChat();
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      chatId: activeChat.id,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments,
    };

    activeChat.messages.push(userMessage);

    // Auto-update chat title if it's the first user message
    if (activeChat.messages.filter((m) => m.role === 'user').length === 1 && activeChat.title === 'New Conversation') {
      const generatedTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      activeChat.title = generatedTitle;
    }

    activeChat.updatedAt = new Date().toISOString();
    this.saveChatsToStorage(user.id, this.chats);
    this.notify();

    // Call AI Service
    const provider = user.settings.aiProvider || 'gemini';
    const model = user.settings.selectedModel || 'gemini-3.6-flash';
    const systemPrompt = user.settings.systemInstruction;

    const { reply, providerUsed } = await AIService.sendMessage(
      activeChat.messages,
      provider,
      model,
      systemPrompt
    );

    const aiMessage: Message = {
      id: `msg_ai_${Date.now()}`,
      chatId: activeChat.id,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: providerUsed,
    };

    activeChat.messages.push(aiMessage);
    activeChat.updatedAt = new Date().toISOString();

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();

    if (user.settings.autoSpeakResponse) {
      AIService.speakText(reply);
    }
  }

  static async regenerateResponse(messageId: string): Promise<void> {
    const user = AuthService.getCurrentUser();
    const activeChat = this.getActiveChat();
    if (!user || !activeChat) return;

    const msgIdx = activeChat.messages.findIndex((m) => m.id === messageId);
    if (msgIdx === -1) return;

    // Remove old response if it's an assistant message or find the assistant message after user msg
    let historyToUse: Message[] = [];
    if (activeChat.messages[msgIdx].role === 'assistant') {
      historyToUse = activeChat.messages.slice(0, msgIdx);
      activeChat.messages.splice(msgIdx, 1);
    } else {
      historyToUse = activeChat.messages.slice(0, msgIdx + 1);
    }

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();

    const provider = user.settings.aiProvider || 'gemini';
    const model = user.settings.selectedModel || 'gemini-3.6-flash';
    const systemPrompt = user.settings.systemInstruction;

    const { reply, providerUsed } = await AIService.sendMessage(
      historyToUse,
      provider,
      model,
      systemPrompt
    );

    const newAiMessage: Message = {
      id: `msg_ai_${Date.now()}`,
      chatId: activeChat.id,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: providerUsed,
    };

    activeChat.messages.push(newAiMessage);
    activeChat.updatedAt = new Date().toISOString();

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();
  }

  static editUserMessage(messageId: string, newContent: string) {
    const user = AuthService.getCurrentUser();
    const activeChat = this.getActiveChat();
    if (!user || !activeChat) return;

    const idx = activeChat.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    activeChat.messages[idx].content = newContent;
    activeChat.messages[idx].isEdited = true;

    // Truncate messages after this edited message and re-trigger response
    activeChat.messages = activeChat.messages.slice(0, idx + 1);

    this.saveChatsToStorage(user.id, this.chats);
    this.notify();

    // Trigger AI regeneration for edited prompt
    this.regenerateResponse(messageId);
  }

  static deleteMessage(messageId: string) {
    const user = AuthService.getCurrentUser();
    const activeChat = this.getActiveChat();
    if (!user || !activeChat) return;

    activeChat.messages = activeChat.messages.filter((m) => m.id !== messageId);
    this.saveChatsToStorage(user.id, this.chats);
    this.notify();
  }

  static setReaction(messageId: string, status: 'like' | 'dislike' | null) {
    const user = AuthService.getCurrentUser();
    const activeChat = this.getActiveChat();
    if (!user || !activeChat) return;

    const msg = activeChat.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.likeStatus = msg.likeStatus === status ? null : status;
      this.saveChatsToStorage(user.id, this.chats);
      this.notify();
    }
  }

  // Export functions
  static exportChatAsTXT(chat: ChatSession) {
    const lines = [
      `AI ChatBot - ${chat.title}`,
      `Date: ${new Date(chat.createdAt).toLocaleString()}`,
      `--------------------------------------------------\n`,
    ];

    chat.messages.forEach((m) => {
      const sender = m.role === 'user' ? 'USER' : `AI (${m.modelUsed || 'Assistant'})`;
      lines.push(`[${m.timestamp}] ${sender}:\n${m.content}\n\n--------------------------------------------------\n`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static exportChatAsJSON(chat: ChatSession) {
    const blob = new Blob([JSON.stringify(chat, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static exportChatAsPDF(chat: ChatSession) {
    // Generate clean styled printable HTML document and trigger print preview
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${chat.title} - AI ChatBot Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #0f172a; }
          .meta { font-size: 13px; color: #64748b; }
          .message { margin-bottom: 24px; padding: 16px; rounded: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .message.user { background: #f0f9ff; border-color: #bae6fd; }
          .sender { font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #0284c7; }
          .message.user .sender { color: #0369a1; }
          .time { font-weight: normal; font-size: 12px; color: #94a3b8; float: right; }
          .content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${chat.title}</h1>
          <div class="meta">Exported on ${new Date().toLocaleString()} | Total Messages: ${chat.messages.length}</div>
        </div>
        ${chat.messages
          .map(
            (m) => `
          <div class="message ${m.role}">
            <div class="sender">${m.role === 'user' ? 'User' : 'AI Assistant (' + (m.modelUsed || 'Gemini') + ')'} <span class="time">${m.timestamp}</span></div>
            <div class="content">${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
        `
          )
          .join('')}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
