import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { Attachment } from '../../models/message';
import { AIService } from '../../services/ai.service';

interface InputBoxProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isLoading?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechControllerRef = useRef<{ stop: () => void } | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Voice Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      const controller = AIService.startSpeechRecognition(
        (transcript, isFinal) => {
          setText(transcript);
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      speechControllerRef.current = controller;
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative max-w-4xl mx-auto w-full px-4 pb-4 pt-2"
    >
      {/* Dropzone Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-20 m-2 rounded-2xl bg-indigo-600/90 text-white flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white backdrop-blur-sm transition-all animate-in fade-in">
          <UploadCloud className="w-10 h-10 animate-bounce" />
          <p className="font-semibold text-lg">Drop your files here to attach</p>
          <p className="text-xs text-indigo-200">Supports Images, PDFs, Documents</p>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs shadow-sm"
              >
                {att.type.startsWith('image/') ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-indigo-500" />
                )}
                <span className="truncate max-w-[120px] font-medium text-slate-700 dark:text-slate-200">
                  {att.name}
                </span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening ? 'Listening... Speak now...' : 'Ask AI ChatBot anything... (Shift + Enter for new line)'
          }
          rows={1}
          disabled={isLoading}
          className="w-full px-4 pt-3.5 pb-2 rounded-2xl bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none resize-none max-h-44 min-h-[48px]"
        />

        {/* Controls Bar */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          {/* File Action Controls */}
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              title="Attach File or Image"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              title="Upload Image"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors hidden sm:flex"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Mic & Send Button */}
          <div className="flex items-center gap-2">
            {/* Mic Toggle */}
            <button
              onClick={toggleSpeechRecognition}
              type="button"
              title={isListening ? 'Stop recording' : 'Speech to text'}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md'
                  : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!text.trim() && attachments.length === 0) || isLoading}
              className={`flex items-center justify-center p-2.5 rounded-xl font-medium transition-all shadow-md ${
                (text.trim() || attachments.length > 0) && !isLoading
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2 mt-1.5">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> AI ChatBot can make mistakes. Verify important info.
        </span>
        <span className="hidden sm:inline">Press Enter ↵ to send</span>
      </div>
    </div>
  );
};
