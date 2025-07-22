import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { type Language } from '../types';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'English');

  const t = (key: string, replacements?: { [key: string]: string }): string => {
    let translation = translations[language]?.[key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, replacements[rKey]);
        });
    }
    return translation;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): { language: Language; setLanguage: React.Dispatch<React.SetStateAction<Language>> } => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return { language: context.language, setLanguage: context.setLanguage };
};

export const useTranslation = (): { t: (key: string, replacements?: { [key: string]: string }) => string } => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
      throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return { t: context.t };
};
