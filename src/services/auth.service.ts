import { User, DEFAULT_USER_SETTINGS } from '../models/user';
import { StorageService } from './storage.service';

export class AuthService {
  private static currentUser: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];

  static init(): User | null {
    let user = StorageService.getCurrentUser();
    if (!user) {
      // Create default guest/demo user if none exists
      const demoUser: User = {
        id: 'user_demo_1',
        username: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        settings: { ...DEFAULT_USER_SETTINGS },
      };
      const users = StorageService.getUsers();
      if (!users.some((u) => u.id === demoUser.id)) {
        users.push(demoUser);
        StorageService.saveUsers(users);
      }
      StorageService.saveCurrentUser(demoUser);
      user = demoUser;
    }
    this.currentUser = user;
    return user;
  }

  static getCurrentUser(): User | null {
    if (!this.currentUser) {
      this.currentUser = StorageService.getCurrentUser();
    }
    return this.currentUser;
  }

  static subscribe(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  static register(username: string, email: string, avatarUrl?: string): { success: boolean; error?: string; user?: User } {
    const users = StorageService.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'User with this email already exists' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username,
      email,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
      createdAt: new Date().toISOString(),
      settings: { ...DEFAULT_USER_SETTINGS },
    };

    users.push(newUser);
    StorageService.saveUsers(users);
    StorageService.saveCurrentUser(newUser);
    this.currentUser = newUser;
    this.notify();

    return { success: true, user: newUser };
  }

  static login(email: string): { success: boolean; error?: string; user?: User } {
    const users = StorageService.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      // Auto-create for friendly demo sign in if desired or return error
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: email.split('@')[0],
        email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString(),
        settings: { ...DEFAULT_USER_SETTINGS },
      };
      users.push(newUser);
      StorageService.saveUsers(users);
      StorageService.saveCurrentUser(newUser);
      this.currentUser = newUser;
      this.notify();
      return { success: true, user: newUser };
    }

    StorageService.saveCurrentUser(existing);
    this.currentUser = existing;
    this.notify();
    return { success: true, user: existing };
  }

  static updateSettings(newSettings: Partial<User['settings']>): User | null {
    if (!this.currentUser) return null;

    const updatedUser: User = {
      ...this.currentUser,
      settings: {
        ...this.currentUser.settings,
        ...newSettings,
      },
    };

    this.currentUser = updatedUser;
    StorageService.saveCurrentUser(updatedUser);

    // Update in users collection
    const users = StorageService.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      StorageService.saveUsers(users);
    }

    this.notify();
    return updatedUser;
  }

  static updateProfile(username: string, avatarUrl?: string): User | null {
    if (!this.currentUser) return null;

    const updatedUser: User = {
      ...this.currentUser,
      username,
      avatarUrl: avatarUrl || this.currentUser.avatarUrl,
    };

    this.currentUser = updatedUser;
    StorageService.saveCurrentUser(updatedUser);

    const users = StorageService.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      StorageService.saveUsers(users);
    }

    this.notify();
    return updatedUser;
  }

  static logout(): void {
    this.currentUser = null;
    StorageService.saveCurrentUser(null);
    this.notify();
  }
}
