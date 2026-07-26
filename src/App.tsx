import React, { useState, useEffect } from 'react';
import { User } from './models/user';
import { AuthService } from './services/auth.service';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/login/LoginPage';
import { RegisterPage } from './pages/register/RegisterPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'home'>('home');

  useEffect(() => {
    // Initialize auth state
    const user = AuthService.init();
    setCurrentUser(user);

    const unsub = AuthService.subscribe((u) => {
      setCurrentUser(u);
      if (u) {
        setCurrentView('home');
      } else {
        setCurrentView('login');
      }
    });

    return () => unsub();
  }, []);

  if (!currentUser && currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentView('home')}
        onGoToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (!currentUser && currentView === 'register') {
    return (
      <RegisterPage
        onSuccess={() => setCurrentView('home')}
        onGoToLogin={() => setCurrentView('login')}
      />
    );
  }

  return <HomePage />;
}
