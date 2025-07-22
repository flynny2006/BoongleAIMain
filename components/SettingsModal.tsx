import React from 'react';
import { type Theme, type Language, type UserProfile } from '../types';
import { SunIcon, MoonIcon } from './icons';
import { useLanguage, useTranslation } from '../i18n/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAccountSavingEnabled: boolean;
  setIsAccountSavingEnabled: (enabled: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    theme, 
    setTheme,
    userProfile,
    setUserProfile,
    isAccountSavingEnabled,
    setIsAccountSavingEnabled
}) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const languages: Language[] = ['English', 'Hungarian', 'German'];
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-light-sidebar dark:bg-dark-sidebar p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-6">{t('settings')}</h2>
        
        {/* Theme Settings */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t('theme')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 ${theme === 'light' ? 'border-light-accent dark:border-dark-accent' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <SunIcon className="w-5 h-5"/> {t('light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 ${theme === 'dark' ? 'border-light-accent dark:border-dark-accent' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <MoonIcon className="w-5 h-5"/> {t('dark')}
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="mb-6">
            <label htmlFor="language-select" className="block text-sm font-medium mb-2">{t('language')}</label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-input focus:ring-light-accent focus:border-light-accent text-light-text dark:text-dark-text"
            >
                {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
        </div>

        {/* User Profile Settings */}
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">{t('userProfile')}</h3>
            <div className="space-y-4">
            <div>
                <label htmlFor="user-name" className="block text-sm font-medium mb-1">{t('yourName')}</label>
                <input
                type="text"
                id="user-name"
                name="name"
                value={userProfile.name}
                onChange={handleProfileChange}
                placeholder={t('yourNamePlaceholder')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-input focus:ring-light-accent focus:border-light-accent text-light-text dark:text-dark-text"
                />
            </div>
            <div>
                <label htmlFor="user-hobbies" className="block text-sm font-medium mb-1">{t('hobbies')}</label>
                <textarea
                id="user-hobbies"
                name="hobbies"
                value={userProfile.hobbies}
                onChange={handleProfileChange}
                placeholder={t('hobbiesPlaceholder')}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-input focus:ring-light-accent focus:border-light-accent text-light-text dark:text-dark-text resize-none"
                />
            </div>
            <div>
                <label htmlFor="user-notes" className="block text-sm font-medium mb-1">{t('aiNotes')}</label>
                <textarea
                id="user-notes"
                name="notes"
                value={userProfile.notes}
                onChange={handleProfileChange}
                rows={4}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-dark-bg focus:ring-light-accent focus:border-light-accent text-light-text dark:text-dark-text resize-none"
                />
            </div>
            </div>
        </div>

        {/* AI Memory Toggle */}
        <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-200/50 dark:bg-gray-700/50">
            <div>
                <p className="font-medium">{t('aiMemory')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('aiMemoryDescription')}</p>
            </div>
            <div className="relative">
                <input
                type="checkbox"
                checked={isAccountSavingEnabled}
                onChange={(e) => setIsAccountSavingEnabled(e.target.checked)}
                className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-accent"></div>
            </div>
            </label>
        </div>

        <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:opacity-90"
            >
                {t('done')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
