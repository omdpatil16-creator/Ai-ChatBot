import React, { useState } from 'react';
import { Bot, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    const res = AuthService.login(email.trim());
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  const handleDemoSignIn = () => {
    AuthService.login('alex.rivera@example.com');
    onSuccess();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-2xl">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome back to AI ChatBot</h1>
          <p className="text-xs text-slate-400">Sign in to access your saved conversations & AI assistant</p>
        </div>

        {/* Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or try immediately</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Sign in as Alex Rivera (Demo Account)</span>
          </button>

          {/* Switch to Register */}
          <p className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <button
              onClick={onGoToRegister}
              className="text-indigo-400 hover:underline font-semibold"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
