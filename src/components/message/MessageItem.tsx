import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User as UserIcon,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit2,
  Volume2,
  VolumeX,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Message } from '../../models/message';
import { AIService } from '../../services/ai.service';

interface MessageItemProps {
  message: Message;
  userAvatar?: string;
  username?: string;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, status: 'like' | 'dislike' | null) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  userAvatar,
  username = 'You',
  onRegenerate,
  onEdit,
  onDelete,
  onReaction,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      AIService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      AIService.speakText(message.content, () => setIsSpeaking(false));
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(message.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group relative flex gap-3 p-4 md:p-5 rounded-2xl transition-all duration-200 ${
        isUser
          ? 'bg-indigo-600/10 dark:bg-indigo-950/30 border border-indigo-500/20 ml-auto max-w-[88%]'
          : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-w-[92%] md:max-w-3xl'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          userAvatar ? (
            <img
              src={userAvatar}
              alt={username}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              <UserIcon className="w-4 h-4" />
            </div>
          )
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {isUser ? username : 'AI Assistant'}
            </span>
            {!isUser && message.modelUsed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                <Sparkles className="w-2.5 h-2.5" />
                {message.modelUsed}
              </span>
            )}
            {message.isEdited && (
              <span className="text-[10px] text-slate-400 italic">(edited)</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {message.timestamp}
          </span>
        </div>

        {/* Attachments Preview */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-xs"
              >
                {att.type.startsWith('image/') ? (
                  <div className="relative group/img">
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-20 h-20 object-cover rounded-md border border-slate-300 dark:border-slate-600"
                    />
                  </div>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-200 font-medium">
                      {att.name}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content View or Edit Mode */}
        {isEditing ? (
          <div className="space-y-2 mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Save & Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed overflow-x-auto prose dark:prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/80 text-xs text-slate-400 font-mono border-b border-slate-700">
                          <span>{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                            }}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs text-indigo-600 dark:text-indigo-300"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Copy */}
          <button
            onClick={handleCopy}
            title="Copy message"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Text-To-Speech */}
          <button
            onClick={handleSpeechToggle}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            className={`p-1.5 rounded-lg transition-colors ${
              isSpeaking
                ? 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* User Edit */}
          {isUser && onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              title="Edit prompt"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* AI Reactions */}
          {!isUser && onReaction && (
            <>
              <button
                onClick={() => onReaction(message.id, 'like')}
                title="Good response"
                className={`p-1.5 rounded-lg transition-colors ${
                  message.likeStatus === 'like'
                    ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onReaction(message.id, 'dislike')}
                title="Poor response"
                className={`p-1.5 rounded-lg transition-colors ${
                  message.likeStatus === 'dislike'
                    ? 'text-rose-500 bg-rose-100 dark:bg-rose-950/40'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Regenerate */}
          {!isUser && onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              title="Regenerate response"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Message */}
          {onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              title="Delete message"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
