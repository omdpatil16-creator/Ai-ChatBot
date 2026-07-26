import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  modelName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ modelName = 'AI' }) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 my-3 max-w-3xl animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-spin" /> {modelName} is thinking...
          </span>
        </div>
        <div className="flex items-center gap-1.5 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};
