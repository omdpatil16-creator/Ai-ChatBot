import React, { useState, useEffect } from 'react';
import { Search, X, MessageSquare, Pin } from 'lucide-react';
import { User } from '../../models/user';
import { ChatSession } from '../../models/chat';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { Navbar } from '../../components/navbar/Navbar';
import { Sidebar } from '../../components/sidebar/Sidebar';
import { ChatWindow } from '../../components/chat-window/ChatWindow';
import { SettingsModal } from '../../components/settings/SettingsModal';

export const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(
    user?.settings.theme === 'light' ? 'light' : 'dark'
  );

  useEffect(() => {
    const unsubAuth = AuthService.subscribe((u) => {
      setUser(u);
      if (u) {
        ChatService.init(u.id);
        if (u.settings.theme === 'light') {
          setTheme('light');
          document.documentElement.classList.remove('dark');
        } else {
          setTheme('dark');
          document.documentElement.classList.add('dark');
        }
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubChat = ChatService.subscribe((cList, activeId) => {
        setChats(cList);
        setActiveChatId(activeId);
      });
      return () => unsubChat();
    }
  }, [user]);

  // Global Keyboard Shortcuts (Ctrl+K for Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    AuthService.updateSettings({ theme: nextTheme });
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Search matching chats and messages across history
  const globalSearchResults = chats.filter((c) => {
    if (!globalSearchTerm.trim()) return false;
    const term = globalSearchTerm.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(term);
    const msgMatch = c.messages.some((m) => m.content.toLowerCase().includes(term));
    return titleMatch || msgMatch;
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col`}>
      {/* Top Navbar */}
      <Navbar
        user={user}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsGlobalSearchOpen(true)}
        onNewChat={() => ChatService.createChat()}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          user={user}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <ChatWindow chat={activeChat} user={user} />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        user={user}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Global Search Modal (Ctrl+K) */}
      {isGlobalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <Search className="w-5 h-5 text-indigo-500" />
              <input
                type="text"
                placeholder="Search across all conversations & messages... (Ctrl+K)"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsGlobalSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {!globalSearchTerm.trim() ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  Type to search across titles and message contents...
                </p>
              ) : globalSearchResults.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  No matching conversations found for "{globalSearchTerm}"
                </p>
              ) : (
                globalSearchResults.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      ChatService.selectChat(chat.id);
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-600/50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                        {chat.title}
                      </span>
                      {chat.isPinned && <Pin className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pl-5">
                      {chat.messages[chat.messages.length - 1]?.content || 'Empty conversation'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
