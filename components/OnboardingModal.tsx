import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { type Language } from '../types';

interface OnboardingModalProps {
  onComplete: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isAccountSavingEnabled: boolean;
  setIsAccountSavingEnabled: (enabled: boolean) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, language, setLanguage, isAccountSavingEnabled, setIsAccountSavingEnabled }) => {
  const [step, setStep] = useState(1);
  const { t } = useTranslation();
  const languages: Language[] = ['English', 'Hungarian', 'German'];

  const handleNext = () => {
    setStep(2);
  };
  
  const handleComplete = () => {
      onComplete();
  };

  const step1 = (
    <div>
        <h2 className="text-2xl font-bold mb-4">{t('onboardingTitle')}</h2>
        <p className="mb-6">{t('onboardingStep1')}</p>
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-input focus:ring-light-accent focus:border-light-accent text-light-text dark:text-dark-text"
        >
            {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
            ))}
        </select>
        <button
            onClick={handleNext}
            className="mt-6 w-full px-4 py-3 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:opacity-90 font-semibold"
        >
            {t('onboardingContinue')}
        </button>
    </div>
  );

  const step2 = (
     <div>
        <h2 className="text-2xl font-bold mb-4">{t('onboardingStep2Title')}</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">{t('onboardingStep2Body')}</p>
        <ul className="space-y-2 mb-6 text-sm">
            <li className="flex items-center gap-2">✅ <span className="font-medium">{t('onboardingFeature1')}</span></li>
            <li className="flex items-center gap-2">✅ <span className="font-medium">{t('onboardingFeature2')}</span></li>
            <li className="flex items-center gap-2">✅ <span className="font-medium">{t('onboardingFeature3')}</span></li>
        </ul>
        <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 cursor-pointer">
            <input 
                type="checkbox" 
                checked={isAccountSavingEnabled}
                onChange={(e) => setIsAccountSavingEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-light-accent focus:ring-light-accent"
            />
            <span className="font-semibold">{t('onboardingEnable')}</span>
        </label>
        <button
            onClick={handleComplete}
            className="mt-6 w-full px-4 py-3 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:opacity-90 font-semibold"
        >
            {t('done')}
        </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
        <div 
            className="bg-light-sidebar dark:bg-dark-sidebar p-8 rounded-lg shadow-xl w-full max-w-md m-4"
        >
            {step === 1 ? step1 : step2}
        </div>
    </div>
  );
};

export default OnboardingModal;
