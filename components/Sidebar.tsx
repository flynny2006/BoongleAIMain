
import React from 'react';
import { type Chat } from '../types';
import { PlusIcon, TrashIcon } from './icons';
import { useTranslation } from '../i18n/LanguageContext';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat }) => {
  const { t } = useTranslation();
  return (
    <div className="w-64 h-screen flex flex-col bg-light-sidebar dark:bg-dark-sidebar p-2 text-light-text dark:text-dark-text">
      <div className="flex-shrink-0 p-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-light-accent/80 hover:bg-light-accent dark:bg-dark-accent/80 dark:hover:bg-dark-accent text-white font-semibold transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {t('newChat')}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group flex justify-between items-center w-full p-2 rounded-md cursor-pointer transition-colors ${
              activeChatId === chat.id
                ? 'bg-light-accent/20 dark:bg-dark-accent/20'
                : 'hover:bg-gray-300/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span className="truncate text-sm font-medium">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </nav>
      <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>{t('version')}</p>
      </div>
    </div>
  );
};

export default Sidebar;