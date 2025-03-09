/**
 * useTranslation.ts
 * Custom hook for accessing translations in components
 */

import { useContext } from 'react';
import { LanguageContext } from '../translations/LanguageContext';

/**
 * Interface for the useTranslation hook return value
 */
interface UseTranslation {
  t: (key: string, interpolations?: Record<string, string>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  direction: 'ltr' | 'rtl';
}

// RTL languages
const rtlLanguages = ['ar', 'fa', 'he', 'ur'];

/**
 * Hook to access translations and language settings
 * 
 * @returns Object containing translation function, locale, setLocale function, and text direction
 */
export function useTranslation(): UseTranslation {
  const { language, setLanguage, t: contextT } = useContext(LanguageContext);
  
  /**
   * Translates a key with optional interpolation
   * 
   * @param key - Translation key to look up
   * @param interpolations - Optional object with values to interpolate into the translation
   * @returns Translated string or key if translation not found
   */
  const t = (key: string, interpolations?: Record<string, string> | string): string => {
    // Get translation from context
    let translation = contextT(key);
    
    // If interpolations is a string, it's the fallback value
    if (typeof interpolations === 'string') {
      // If translation is just the key (not found), use fallback
      if (translation === key) {
        return interpolations;
      }
    }
    // Apply interpolations if provided as an object
    else if (interpolations && typeof interpolations === 'object') {
      Object.entries(interpolations).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{{${k}}}`, 'g'), v);
      });
    }
    
    return translation;
  };
  
  // Determine text direction based on language
  const direction = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  
  return { 
    t, 
    locale: language, 
    setLocale: setLanguage, 
    direction 
  };
} 