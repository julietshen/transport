import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

// A simple hook to access the translation function
export const useTranslation = () => {
  const { t, language, setLanguage, languages } = useContext(LanguageContext);
  
  // Helper function for dynamic string interpolation
  const translate = (key: string, replacements?: Record<string, string | number>) => {
    let text = t(key);
    
    if (replacements) {
      // Replace all {key} patterns with their values
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    
    return text;
  };
  
  return {
    t: translate,
    language,
    setLanguage,
    languages
  };
};

export default useTranslation; 