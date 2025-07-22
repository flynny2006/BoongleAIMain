
import React from 'react';
import { type Message } from '../types';
import { parseResponse } from '../utils/parser';
import { UserIcon, BotIcon } from './icons';
import { useTranslation } from '../i18n/LanguageContext';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-1.5 p-2">
        <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></span>
    </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  
  if (!message.content && !message.file && !isLoading) {
      return null;
  }

  const avatar = isUser ? <UserIcon className="w-7 h-7" /> : <BotIcon className="w-7 h-7" />;
  const alignment = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex items-start gap-4 ${alignment}`}>
      {!isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light-accent dark:bg-dark-accent flex items-center justify-center text-white">{avatar}</div>}
      <div
        className={`max-w-xl lg:max-w-3xl px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-light-accent dark:bg-dark-accent text-white rounded-br-none'
            : 'bg-white dark:bg-dark-input text-light-text dark:text-dark-text rounded-bl-none'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            {message.file && (
                <div className="mb-2 p-2 border border-dashed border-gray-400 dark:border-gray-500 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('attached')}: {message.file.name}</p>
                </div>
            )}
            {isLoading ? <TypingIndicator /> : parseResponse(message.content)}
        </div>
      </div>
      {isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">{avatar}</div>}
    </div>
  );
};

export default ChatMessage;