
import React, { useState, useRef, useCallback } from 'react';
import { SendIcon, PaperclipIcon } from './icons';
import { useTranslation } from '../i18n/LanguageContext';

interface ChatInputProps {
  onSendMessage: (prompt: string, file?: File) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    adjustTextareaHeight();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || file) {
      onSendMessage(prompt, file || undefined);
      setPrompt('');
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      if(textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      {file && (
        <div className="mb-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm flex justify-between items-center">
          <span>{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="font-bold text-lg">&times;</button>
        </div>
      )}
      <div className="flex items-end gap-2 p-2 rounded-2xl bg-light-input/50 dark:bg-dark-input focus-within:ring-2 focus-within:ring-light-accent dark:focus-within:ring-dark-accent">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex-shrink-0"
        >
          <PaperclipIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf, .txt, .md, image/*"
        />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('messagePlaceholder')}
          className="flex-1 bg-transparent resize-none border-none focus:ring-0 outline-none max-h-48 py-2.5 text-light-text dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (!prompt.trim() && !file)}
          className="p-2.5 rounded-full bg-light-accent dark:bg-dark-accent text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SendIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;