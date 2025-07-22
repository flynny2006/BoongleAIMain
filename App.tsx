import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { type Chat, type Message, type Theme, type UserProfile } from './types';
import { SettingsIcon } from './components/icons';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import SuccessToast from './components/SuccessToast';
import { generateTitle } from './services/geminiService';
import { useLanguage, useTranslation } from './i18n/LanguageContext';

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [chats, setChats] = useLocalStorage<Chat[]>('chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('activeChatId', null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', { name: '', hobbies: '', notes: '' });
  const [isAccountSavingEnabled, setIsAccountSavingEnabled] = useLocalStorage<boolean>('accountSavingEnabled', true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage<boolean>('hasCompletedOnboarding', false);

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    // @ts-ignore
    if (window.pdfjsLib) {
      // @ts-ignore
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, [theme]);

  const activeChat = useMemo(() => {
      return chats.find(chat => chat.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: t('untitledChat'),
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, [setChats, setActiveChatId, t]);
  
  const handleDeleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }, [activeChatId, chats, setChats, setActiveChatId]);
  
  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, [setActiveChatId]);

  const handleSaveToAccount = useCallback((infos: string[]) => {
      if (!isAccountSavingEnabled) return;
      setUserProfile(prevProfile => ({
          ...prevProfile,
          notes: `${prevProfile.notes}\n- ${infos.join('\n- ')}`.trim()
      }));
      setToast({ show: true, message: t('saveSuccess', { count: infos.length.toString() }) });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, [setUserProfile, t, isAccountSavingEnabled]);

  const updateChatMessages = useCallback((chatId: string, messages: Message[]) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat =>
        chat.id === chatId ? { ...chat, messages } : chat
      );

      const currentChat = updatedChats.find(chat => chat.id === chatId);
      if (currentChat && currentChat.messages.length > 0 && currentChat.messages[0].role === 'user' && currentChat.title === t('untitledChat')) {
        const firstUserMessage = currentChat.messages[0].content;
        generateTitle({ messageContent: firstUserMessage, language }).then(newTitle => {
            if (newTitle) {
              setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
            }
        });
      }

      return updatedChats;
    });
  }, [setChats, language, t]);

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
    if(chats.length === 0 && hasCompletedOnboarding) {
        handleNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    handleNewChat();
  };

  return (
    <div className="flex h-screen w-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans">
      <SuccessToast message={toast.message} show={toast.show} />
      {!hasCompletedOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          language={language}
          setLanguage={setLanguage}
          isAccountSavingEnabled={isAccountSavingEnabled}
          setIsAccountSavingEnabled={setIsAccountSavingEnabled}
        />
      )}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      <main className="flex-1 flex flex-col h-screen">
        <header className="flex justify-end items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <SettingsIcon className="w-6 h-6" />
            </button>
        </header>
        {activeChat ? (
          <ChatView
            key={activeChat.id}
            chat={activeChat}
            onMessagesChange={(messages) => updateChatMessages(activeChat.id, messages)}
            userProfile={userProfile}
            isAccountSavingEnabled={isAccountSavingEnabled}
            onSaveToAccount={handleSaveToAccount}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 px-4">
            <h1 className="text-2xl font-semibold">{t('boongleAI')}</h1>
            <p className="mt-2">{t('getStarted')}</p>
          </div>
        )}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isAccountSavingEnabled={isAccountSavingEnabled}
        setIsAccountSavingEnabled={setIsAccountSavingEnabled}
      />
    </div>
  );
};

export default App;
