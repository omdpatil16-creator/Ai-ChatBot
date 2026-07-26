/**
 * LocalStorage Service for data persistence
 */

const STORAGE_KEYS = {
  USERS: 'aichat_users_v1',
  CURRENT_USER: 'aichat_current_user_v1',
  CHATS: 'aichat_sessions_v1',
  THEME: 'aichat_theme_v1',
  SETTINGS: 'aichat_settings_v1',
};

export class StorageService {
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from LocalStorage`, e);
      return defaultValue;
    }
  }

  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to LocalStorage`, e);
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from LocalStorage`, e);
    }
  }

  // Domain Specific Helpers
  static getUsers() {
    return this.getItem<any[]>(STORAGE_KEYS.USERS, []);
  }

  static saveUsers(users: any[]) {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  static getCurrentUser() {
    return this.getItem<any | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static saveCurrentUser(user: any | null) {
    if (user) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      this.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  static getChats(userId: string) {
    const allChats = this.getItem<any[]>(STORAGE_KEYS.CHATS, []);
    return allChats.filter((c) => c.userId === userId);
  }

  static saveAllChats(chats: any[]) {
    this.setItem(STORAGE_KEYS.CHATS, chats);
  }

  static getTheme(): 'dark' | 'light' {
    return this.getItem<'dark' | 'light'>(STORAGE_KEYS.THEME, 'dark');
  }

  static saveTheme(theme: 'dark' | 'light') {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }
}
