import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Search,
  Settings,
  LogOut,
  Download,
  Sparkles,
  MoreVertical,
  Bot,
  X,
} from 'lucide-react';
import { ChatSession } from '../../models/chat';
import { User } from '../../models/user';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  user: User | null;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  user,
  isOpen,
  onCloseMobile,
  onOpenSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const recentChats = filteredChats.filter((c) => !c.isPinned);

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (chatId: string) => {
    if (editTitle.trim()) {
      ChatService.renameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleExport = (chat: ChatSession, format: 'txt' | 'json' | 'pdf', e: React.MouseEvent) => {
    e.stopPropagation();
    if (format === 'txt') ChatService.exportChatAsTXT(chat);
    if (format === 'json') ChatService.exportChatAsJSON(chat);
    if (format === 'pdf') ChatService.exportChatAsPDF(chat);
    setActiveMenuId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top App Header & New Chat */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-100 text-base tracking-tight">AI ChatBot</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              ChatService.createChat();
              if (window.innerWidth < 768) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          {/* Search Filter Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Pinned Section */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Pin className="w-3 h-3 text-indigo-400" /> Pinned
              </p>
              {pinnedChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  editingChatId={editingChatId}
                  editTitle={editTitle}
                  activeMenuId={activeMenuId}
                  onSelect={() => {
                    ChatService.selectChat(chat.id);
                    if (window.innerWidth < 768) onCloseMobile();
                  }}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    ChatService.togglePinChat(chat.id);
                  }}
                  onStartRename={handleStartRename}
                  onSaveRename={handleSaveRename}
                  onDelete={(e) => {
                    e.stopPropagation();
                    ChatService.deleteChat(chat.id);
                  }}
                  onExport={handleExport}
                  onMenuToggle={(id, e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === id ? null : id);
                  }}
                  setEditTitle={setEditTitle}
                />
              ))}
            </div>
          )}

          {/* Recent Section */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Recent Conversations
            </p>
            {recentChats.length === 0 ? (
              <p className="px-2 py-3 text-xs text-slate-500 text-center italic">
                No conversations found
              </p>
            ) : (
              recentChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  editingChatId={editingChatId}
                  editTitle={editTitle}
                  activeMenuId={activeMenuId}
                  onSelect={() => {
                    ChatService.selectChat(chat.id);
                    if (window.innerWidth < 768) onCloseMobile();
                  }}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    ChatService.togglePinChat(chat.id);
                  }}
                  onStartRename={handleStartRename}
                  onSaveRename={handleSaveRename}
                  onDelete={(e) => {
                    e.stopPropagation();
                    ChatService.deleteChat(chat.id);
                  }}
                  onExport={handleExport}
                  onMenuToggle={(id, e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === id ? null : id);
                  }}
                  setEditTitle={setEditTitle}
                />
              ))
            )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.username?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => AuthService.logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface ChatItemProps {
  chat: ChatSession;
  isActive: boolean;
  editingChatId: string | null;
  editTitle: string;
  activeMenuId: string | null;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onStartRename: (chat: ChatSession, e: React.MouseEvent) => void;
  onSaveRename: (chatId: string) => void;
  onDelete: (e: React.MouseEvent) => void;
  onExport: (chat: ChatSession, format: 'txt' | 'json' | 'pdf', e: React.MouseEvent) => void;
  onMenuToggle: (id: string, e: React.MouseEvent) => void;
  setEditTitle: (val: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isActive,
  editingChatId,
  editTitle,
  activeMenuId,
  onSelect,
  onTogglePin,
  onStartRename,
  onSaveRename,
  onDelete,
  onExport,
  onMenuToggle,
  setEditTitle,
}) => {
  const isEditing = editingChatId === chat.id;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
        isActive
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
          : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />

        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => onSaveRename(chat.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveRename(chat.id)}
            autoFocus
            className="w-full px-1.5 py-0.5 rounded bg-slate-800 border border-indigo-500 text-xs text-slate-100 focus:outline-none"
          />
        ) : (
          <span className="truncate">{chat.title}</span>
        )}
      </div>

      {/* Action Popover Trigger */}
      <div className="relative flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePin}
          title={chat.isPinned ? 'Unpin' : 'Pin'}
          className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50"
        >
          {chat.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={(e) => onMenuToggle(chat.id, e)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Menu Popover */}
        {activeMenuId === chat.id && (
          <div className="absolute right-0 top-6 w-36 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1 z-50">
            <button
              onClick={(e) => onStartRename(chat, e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-700/60"
            >
              <Edit2 className="w-3 h-3" /> Rename
            </button>
            <button
              onClick={(e) => onExport(chat, 'txt', e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-700/60"
            >
              <Download className="w-3 h-3" /> Export TXT
            </button>
            <button
              onClick={(e) => onExport(chat, 'pdf', e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-700/60"
            >
              <Download className="w-3 h-3" /> Export PDF
            </button>
            <button
              onClick={(e) => onDelete(e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-950/40 border-t border-slate-700/60 mt-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
