import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Import base English translations
import englishTranslations from './en.json';

// Define the supported languages with their codes and names
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ar', name: 'العربية' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'fr', name: 'Français' }
];

// Define the shape of our context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  languages: { code: string; name: string }[];
}

// Create the context with default values
export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  languages: supportedLanguages
});

// Create the provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to English, but check if user has a preferred language stored
  const [language, setLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<any>(englishTranslations);

  // Load translations when language changes
  useEffect(() => {
    console.log('Language changed to:', language);
    // Always have English as fallback
    if (language === 'en') {
      setTranslations(englishTranslations);
      console.log('Using English translations');
      return;
    }

    // For other languages, dynamically import the translation file
    // If it fails, fallback to English
    try {
      console.log(`Trying to load ${language} translations...`);
      // This is a simple implementation - in a real app, you might
      // want to handle loading states and errors more gracefully
      import(`./${language}.json`)
        .then((module) => {
          console.log(`Successfully loaded ${language} translations:`, module.default);
          setTranslations(module.default);
        })
        .catch((error) => {
          console.warn(`Failed to load ${language} translations, falling back to English`, error);
          setTranslations(englishTranslations);
        });
    } catch (error) {
      console.warn(`Failed to load ${language} translations, falling back to English`, error);
      setTranslations(englishTranslations);
    }
  }, [language]);

  // Simple translation function
  const t = (key: string): string => {
    // Handle nested keys like "header.title"
    const keys = key.split('.');
    let value = translations;

    // Try to find the nested value
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If we can't find it, return the key itself as fallback
        return key;
      }
    }

    return value as string;
  };

  // Custom setLanguage function that logs
  const handleSetLanguage = (newLang: string) => {
    console.log('Setting language to:', newLang);
    setLanguage(newLang);
  };

  // Store language preference in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    console.log('Saved language preference to localStorage:', language);
  }, [language]);

  // Check for user's preferred language on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      console.log('Found saved language preference:', savedLanguage);
      setLanguage(savedLanguage);
    } else {
      // If no saved preference, try to use browser language
      const browserLang = navigator.language.split('-')[0];
      // For Chinese, we need to check the full locale to determine the variant
      if (browserLang === 'zh') {
        const fullLocale = navigator.language;
        if (fullLocale.includes('TW') || fullLocale.includes('HK') || fullLocale.includes('MO')) {
          setLanguage('zh-TW'); // Traditional Chinese
        } else {
          setLanguage('zh-CN'); // Simplified Chinese (default)
        }
      } else if (supportedLanguages.some(lang => lang.code === browserLang || lang.code.startsWith(browserLang + '-'))) {
        // For other languages, match the base language
        const matchedLang = supportedLanguages.find(lang => 
          lang.code === browserLang || lang.code.startsWith(browserLang + '-')
        );
        if (matchedLang) {
          setLanguage(matchedLang.code);
        }
      } else {
        console.log('Browser language not supported, using English');
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, languages: supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}; 