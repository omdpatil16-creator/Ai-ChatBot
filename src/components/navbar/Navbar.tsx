import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Search,
  Sun,
  Moon,
  Settings,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Plus,
  Bot,
} from 'lucide-react';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

interface NavbarProps {
  user: User | null;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onNewChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onToggleSidebar,
  onOpenSettings,
  onOpenSearch,
  onNewChat,
  theme,
  onToggleTheme,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleProviderChange = (provider: 'gemini' | 'mock' | 'openai' | 'claude') => {
    AuthService.updateSettings({ aiProvider: provider });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Sidebar Toggle & App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
              AI ChatBot
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Quick Model Selection Selector */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Model:</span>
        <select
          value={user?.settings.aiProvider || 'gemini'}
          onChange={(e) => handleProviderChange(e.target.value as any)}
          className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="gemini" className="dark:bg-slate-800">
            Google Gemini 3.6 Flash
          </option>
          <option value="mock" className="dark:bg-slate-800">
            Mock AI Engine (Offline)
          </option>
          <option value="openai" className="dark:bg-slate-800">
            OpenAI GPT-4o (Simulated)
          </option>
          <option value="claude" className="dark:bg-slate-800">
            Claude 3.5 Sonnet (Simulated)
          </option>
        </select>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Global Search */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search Conversations (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Settings Gear */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition-all"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.username?.charAt(0) || 'U'}
              </div>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Popover */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {user?.username}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" /> Profile & Settings
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  AuthService.logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-700/60 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
