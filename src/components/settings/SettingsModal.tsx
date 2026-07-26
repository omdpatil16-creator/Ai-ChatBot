import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Palette,
  Sparkles,
  Database,
  Check,
  RotateCcw,
  Volume2,
  Moon,
  Sun,
  Shield,
  Bot,
} from 'lucide-react';
import { User, DEFAULT_USER_SETTINGS } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

interface SettingsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  isOpen,
  onClose,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'ai' | 'data'>('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [fontSize, setFontSize] = useState(user?.settings.fontSize || 'md');
  const [aiProvider, setAiProvider] = useState(user?.settings.aiProvider || 'gemini');
  const [selectedModel, setSelectedModel] = useState(user?.settings.selectedModel || 'gemini-3.6-flash');
  const [systemInstruction, setSystemInstruction] = useState(
    user?.settings.systemInstruction || DEFAULT_USER_SETTINGS.systemInstruction
  );
  const [autoSpeak, setAutoSpeak] = useState(user?.settings.autoSpeakResponse || false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    AuthService.updateProfile(username, avatarUrl);
    AuthService.updateSettings({
      fontSize,
      aiProvider,
      selectedModel,
      systemInstruction,
      autoSpeakResponse: autoSpeak,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      if (user) {
        StorageService.saveAllChats([]);
        window.location.reload();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Preferences & Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-2">
          <TabButton
            id="profile"
            label="Profile"
            icon={<UserIcon className="w-4 h-4" />}
            activeTab={activeTab}
            onClick={() => setActiveTab('profile')}
          />
          <TabButton
            id="appearance"
            label="Appearance"
            icon={<Palette className="w-4 h-4" />}
            activeTab={activeTab}
            onClick={() => setActiveTab('appearance')}
          />
          <TabButton
            id="ai"
            label="AI Models & Behavior"
            icon={<Sparkles className="w-4 h-4" />}
            activeTab={activeTab}
            onClick={() => setActiveTab('ai')}
          />
          <TabButton
            id="data"
            label="Data & History"
            icon={<Database className="w-4 h-4" />}
            activeTab={activeTab}
            onClick={() => setActiveTab('data')}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <img
                  src={avatarUrl || user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user?.username}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Display Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Theme Mode</p>
                    <p className="text-[11px] text-slate-500">Toggle dark and light color interface</p>
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                        fontSize === size
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Auto-Read Responses
                    </p>
                    <p className="text-[11px] text-slate-500">Read AI responses aloud automatically</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* AI Models Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary AI Provider
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gemini">Google Gemini AI (Live Server Integration)</option>
                  <option value="mock">Mock AI Engine (Offline Testing)</option>
                  <option value="openai">OpenAI GPT-4o (Simulated)</option>
                  <option value="claude">Claude 3.5 Sonnet (Simulated)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Model Version
                </label>
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  System Instruction Prompt
                </label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <Shield className="w-4 h-4" /> Danger Zone
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Clearing history permanently removes all chat sessions stored in LocalStorage.
                </p>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  Clear All History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          {savedNotice ? (
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes Saved!
            </span>
          ) : (
            <span></span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeTab: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon, activeTab, onClick }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
        isActive
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};
