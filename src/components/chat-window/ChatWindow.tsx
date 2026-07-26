import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Pin,
  PinOff,
  Search,
  X,
  Code,
  PenTool,
  Compass,
  Lightbulb,
  ArrowDown,
  Bot,
} from 'lucide-react';
import { ChatSession } from '../../models/chat';
import { User } from '../../models/user';
import { MessageItem } from '../message/MessageItem';
import { TypingIndicator } from '../typing-indicator/TypingIndicator';
import { InputBox } from '../input-box/InputBox';
import { ChatService } from '../../services/chat.service';

interface ChatWindowProps {
  chat: ChatSession | null;
  user: User | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom(true);
  }, [chat?.messages.length, isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  const handleSendMessage = async (text: string, attachments?: any[]) => {
    setIsLoading(true);
    try {
      await ChatService.sendMessage(text, attachments);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    setIsLoading(true);
    try {
      await ChatService.regenerateResponse(messageId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages by in-chat search query
  const filteredMessages = chat?.messages.filter((m) =>
    searchQuery.trim() ? m.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Top Header Bar for Active Chat */}
      {chat && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {chat.title}
            </h2>

            <button
              onClick={() => ChatService.togglePinChat(chat.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                chat.isPinned
                  ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={chat.isPinned ? 'Unpin chat' : 'Pin chat'}
            >
              {chat.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Search within chat */}
            <button
              onClick={() => setShowSearchInChat(!showSearchInChat)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Search messages in conversation"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50">
                  <button
                    onClick={() => {
                      ChatService.exportChatAsPDF(chat);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      ChatService.exportChatAsTXT(chat);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    Export as TXT
                  </button>
                  <button
                    onClick={() => {
                      ChatService.exportChatAsJSON(chat);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar Overlay inside current chat */}
      {showSearchInChat && (
        <div className="px-6 py-2 bg-indigo-50 dark:bg-slate-800/80 border-b border-indigo-200 dark:border-slate-700 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-indigo-500" />
            <input
              type="text"
              placeholder="Filter messages in this chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none w-full"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setShowSearchInChat(false);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 custom-scrollbar"
      >
        {!chat || chat.messages.length === 0 ? (
          /* Empty Chat Welcome Cards */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center p-6 space-y-8 animate-in fade-in zoom-in-95">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-xl">
                <Bot className="w-8 h-8" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                How can I help you today?
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Ask a question, analyze documents, write code, or brainstorm ideas with AI ChatBot.
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
              <StarterCard
                icon={<Code className="w-5 h-5 text-indigo-500" />}
                title="Write & Debug Code"
                subtitle="Generate a TypeScript function or solve a bug"
                onClick={() =>
                  handleSendMessage('Write a clean TypeScript function to process and sort array data with types.')
                }
              />
              <StarterCard
                icon={<PenTool className="w-5 h-5 text-purple-500" />}
                title="Draft Content & Emails"
                subtitle="Compose professional emails or blog outlines"
                onClick={() =>
                  handleSendMessage('Draft a concise, professional follow-up email after a project kickoff meeting.')
                }
              />
              <StarterCard
                icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
                title="Brainstorm Ideas"
                subtitle="Generate creative concepts and strategy plans"
                onClick={() =>
                  handleSendMessage('Give me 5 innovative feature ideas for a modern AI productivity web application.')
                }
              />
              <StarterCard
                icon={<Compass className="w-5 h-5 text-emerald-500" />}
                title="Explain Complex Topics"
                subtitle="Break down quantum computing or system design"
                onClick={() =>
                  handleSendMessage('Explain the core architecture of Microservices vs Monolith in simple terms.')
                }
              />
            </div>
          </div>
        ) : (
          /* Render Messages */
          <>
            {filteredMessages?.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                userAvatar={user?.avatarUrl}
                username={user?.username}
                onRegenerate={handleRegenerate}
                onEdit={(id, newContent) => ChatService.editUserMessage(id, newContent)}
                onDelete={(id) => ChatService.deleteMessage(id)}
                onReaction={(id, status) => ChatService.setReaction(id, status)}
              />
            ))}

            {isLoading && <TypingIndicator modelName={user?.settings.aiProvider === 'gemini' ? 'Gemini AI' : 'AI Assistant'} />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 z-20 p-2.5 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all animate-bounce"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Sticky Input */}
      <InputBox onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

interface StarterCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const StarterCard: React.FC<StarterCardProps> = ({ icon, title, subtitle, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 hover:shadow-md transition-all text-left space-y-1.5 group cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {title}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">{subtitle}</p>
    </button>
  );
};
